import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      where: {
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
      take: 7,
      include: { author: { include: { profile: true } } },
    })

    const data = stories.map((s) => ({
      id: s.id,
      content: s.content,
      image: s.image,
      createdAt: s.createdAt,
      author: {
        displayName: s.author.profile?.displayName ?? null,
        email: s.author.email,
      },
    }))

    return NextResponse.json({ stories: data })
  } catch (err) {
    console.error('GET /api/stories/latest failed:', err)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
