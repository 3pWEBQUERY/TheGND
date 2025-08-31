import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPostSchema } from '@/lib/validations'

// GET - Fetch posts for newsfeed
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Get posts from users the current user follows + own posts
    const followingIds = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true }
    })

    const userIds = [session.user.id, ...followingIds.map(f => f.followingId)]

    const posts = await prisma.post.findMany({
      where: {
        authorId: { in: userIds },
        isActive: true
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            userType: true,
            profile: {
              select: {
                displayName: true,
                avatar: true
              }
            }
          }
        },
        likes: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    displayName: true
                  }
                }
              }
            }
          }
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    displayName: true,
                    avatar: true
                  }
                }
              }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Parse images JSON if exists
    const postsWithParsedData = posts.map(post => ({
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
      isLikedByUser: post.likes.some(like => like.user.id === session.user.id)
    }))

    return NextResponse.json(
      { posts: postsWithParsedData },
      { status: 200 }
    )
  } catch (error) {
    console.error('Posts fetch error:', error)
    return NextResponse.json(
      { error: 'Server Fehler beim Laden der Posts' },
      { status: 500 }
    )
  }
}

// POST - Create new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)
    const safeContent = (validatedData.content ?? '').trim()

    const post = await prisma.post.create({
      data: {
        content: safeContent,
        images: validatedData.images ? JSON.stringify(validatedData.images) : null,
        authorId: session.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            email: true,
            userType: true,
            profile: {
              select: {
                displayName: true,
                avatar: true
              }
            }
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    // Parse images for response
    const postWithParsedData = {
      ...post,
      images: post.images ? JSON.parse(post.images) : [],
      isLikedByUser: false,
      likes: [],
      comments: []
    }

    return NextResponse.json(
      { 
        message: 'Post erfolgreich erstellt',
        post: postWithParsedData 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Post creation error:', error)
    return NextResponse.json(
      { error: 'Server Fehler beim Erstellen des Posts' },
      { status: 500 }
    )
  }
}