import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Uploader for Story media (images + videos)
  storyMedia: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    video: { maxFileSize: "256MB", maxFileCount: 2 },
  })
    .middleware(async ({ req }) => {
      // TODO: integrate auth if needed (e.g., with next-auth)
      return {};
    })
    .onUploadComplete(async ({ file }) => {
      // Return data the client can use
      return { url: (file as any).ufsUrl || (file as any).url, type: file.type };
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
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
