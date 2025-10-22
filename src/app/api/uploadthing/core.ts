import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { applyWatermarkToImageBuffer } from "@/lib/watermark";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

const f = createUploadthing();

export const ourFileRouter = {
  // Uploader for Story media (images + videos)
  storyMedia: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    video: { maxFileSize: "256MB", maxFileCount: 2 },
  })
    .middleware(async () => {
      // Require session; extract displayName for watermark text
      const session = (await getServerSession(authOptions as any)) as any
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized")
      }
      // Get profile to read displayName – fall back to email
      let displayName: string | null = null
      try {
        const prof = await prisma.profile.findUnique({ where: { userId: session.user.id }, select: { displayName: true } })
        displayName = prof?.displayName ?? null
      } catch {}
      const fallbackName = (session.user as any).email?.split("@")[0] ?? ""
      return { userId: session.user.id, displayName: displayName || fallbackName }
    })
    .onUploadComplete(async ({ file, metadata }) => {
      const originalUrl = (file as any).ufsUrl || (file as any).url
      const type = file.type || ''

      // For images: download, watermark, store locally in /public/uploads/onboarding/[userId]/
      if (type.startsWith('image/')) {
        try {
          const res = await fetch(originalUrl)
          if (!res.ok) throw new Error(`Failed to fetch uploaded image: ${res.status}`)
          const arrayBuf = await res.arrayBuffer()
          const inputBuf = Buffer.from(arrayBuf)

          const watermarked = await applyWatermarkToImageBuffer(inputBuf, metadata?.displayName as string | undefined)

          const baseDir = join(process.cwd(), 'public', 'uploads', 'onboarding', String(metadata?.userId || 'unknown'))
          await mkdir(baseDir, { recursive: true })
          const filename = `${uuidv4()}.jpg`
          const filePath = join(baseDir, filename)
          await writeFile(filePath, watermarked)

          const localUrl = `/uploads/onboarding/${metadata?.userId || 'unknown'}/${filename}`
          return { url: localUrl, type: 'image/jpeg' }
        } catch (e) {
          // If watermarking fails, fall back to original
          return { url: originalUrl, type }
        }
      }

      // For non-images (e.g., videos): pass through
      return { url: originalUrl, type }
    }),

  // Uploader for Newsfeed post images
  postImages: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(async ({ req }) => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: (file as any).ufsUrl || (file as any).url, type: file.type };
    }),

  // Uploader for Rental media (images only)
  rentalMedia: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      const session = (await getServerSession(authOptions as any)) as any
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized")
      }
      // Ensure user is AGENCY/CLUB/STUDIO
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { userType: true } })
      if (!user || !["AGENCY", "CLUB", "STUDIO"].includes(user.userType)) {
        throw new UploadThingError("Forbidden")
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: (file as any).ufsUrl || (file as any).url, type: file.type };
    }),

  // Uploader for Verification documents (images + optional video)
  verificationDocs: f({
    image: { maxFileSize: "16MB", maxFileCount: 3 },
    video: { maxFileSize: "256MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: (file as any).ufsUrl || (file as any).url, type: file.type };
    }),

  // Uploader for Marketing ad assets (images only)
  adAssets: f({
    image: { maxFileSize: "16MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: (file as any).ufsUrl || (file as any).url, type: file.type };
    }),

  // Uploader for Forum post assets (images only)
  forumAssets: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
  })
    .middleware(async () => {
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      return { url: (file as any).ufsUrl || (file as any).url, type: file.type };
    }),

  // Uploader for Job media (images only)
  jobMedia: f({
    image: { maxFileSize: "8MB", maxFileCount: 6 },
  })
    .middleware(async () => {
      const session = (await getServerSession(authOptions as any)) as any
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized")
      }
      // Ensure user is AGENCY/CLUB/STUDIO
      const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { userType: true } })
      if (!user || !["AGENCY", "CLUB", "STUDIO"].includes(user.userType)) {
        throw new UploadThingError("Forbidden")
      }
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: (file as any).ufsUrl || (file as any).url, type: file.type };
    }),

  // Uploader for site assets (logo, favicon)
  siteAssets: f({
    image: { maxFileSize: "8MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const session = (await getServerSession(authOptions as any)) as any
      if (!session?.user?.id) {
        throw new UploadThingError("Unauthorized")
      }
      // Optionally, verify admin status if requireAdmin is heavy; here we just pass userId
      return { userId: session.user.id }
    })
    .onUploadComplete(async ({ file }) => {
      return { url: (file as any).ufsUrl || (file as any).url, type: file.type };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
