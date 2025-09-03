import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const stories = await prisma.story.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: now },
        createdAt: { gte: dayAgo },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: {
        author: { include: { profile: true } },
        _count: { select: { views: true } },
      },
    })

    const data = stories.map((s) => ({
      id: s.id,
      content: s.content,
      image: s.image,
      video: s.video,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      authorId: s.authorId,
      author: {
        displayName: s.author.profile?.displayName ?? null,
        email: s.author.email,
        avatar: s.author.profile?.avatar ?? null,
      },
      _count: { views: s._count.views },
    }))

    return NextResponse.json({ stories: data })
  } catch (err) {
    console.error('GET /api/stories/latest failed:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

