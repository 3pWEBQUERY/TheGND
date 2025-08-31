import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const urlOrPath = z
  .string()
  .min(1)
  .refine((v) => v.startsWith('/') || /^https?:\/\//.test(v), 'Ungültige Medien-URL/Pfad')

const createStorySchema = z
  .object({
    content: z.string().max(500, 'Story-Inhalt darf maximal 500 Zeichen haben').optional().default(''),
    image: urlOrPath.optional(),
    video: urlOrPath.optional(),
    expiresAt: z.string().datetime().optional()
  })
  .refine(
    (data) => (data.content?.trim()?.length ?? 0) > 0 || !!data.image || !!data.video,
    { message: 'Inhalt oder Bild/Video ist erforderlich' }
  )

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Get stories from followed users and own stories
    const stories = await prisma.story.findMany({
      where: {
        OR: [
          {
            authorId: session.user.id
          },
          {
            author: {
              followers: {
                some: {
                  followerId: session.user.id
                }
              }
            }
          }
        ],
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        author: {
          include: {
            profile: true
          }
        },
        views: {
          where: {
            userId: session.user.id
          }
        },
        _count: {
          select: {
            views: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(stories)
  } catch (error) {
    console.error('Fehler beim Laden der Stories:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    // Check if user can create stories (all types except MEMBER)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.userType === 'MEMBER') {
      return NextResponse.json({ error: 'Mitglieder können keine Stories erstellen' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createStorySchema.parse(body)

    // Stories expire after 24 hours by default
    const expiresAt = validatedData.expiresAt ? new Date(validatedData.expiresAt) : new Date(Date.now() + 24 * 60 * 60 * 1000)

    const story = await prisma.story.create({
      data: {
        content: validatedData.content,
        image: validatedData.image,
        video: validatedData.video,
        authorId: session.user.id,
        expiresAt
      },
      include: {
        author: {
          include: {
            profile: true
          }
        },
        _count: {
          select: {
            views: true
          }
        }
      }
    })

    return NextResponse.json(story, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Ungültige Daten', details: error.issues }, { status: 400 })
    }
    
    console.error('Fehler beim Erstellen der Story:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}