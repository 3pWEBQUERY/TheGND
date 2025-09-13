import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

    const { id } = await params
    const post: any = await (prisma as any).post.findUnique({
      where: { id },
      select: { id: true, authorId: true, groupId: true }
    })
    if (!post) return NextResponse.json({ error: 'Post nicht gefunden' }, { status: 404 })

    // Allow: post author, site moderator, or group admin/owner if in group
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isModerator: true } })
    let allowed = post.authorId === userId || !!user?.isModerator

    if (!allowed && post.groupId) {
      const group = await (prisma as any).feedGroup.findUnique({ where: { id: post.groupId } })
      if (group) {
        const membership = await (prisma as any).feedGroupMember.findUnique({ where: { groupId_userId: { groupId: group.id, userId } } })
        if (group.ownerId === userId || membership?.role === 'ADMIN') {
          allowed = true
        }
      }
    }

    if (!allowed) return NextResponse.json({ error: 'Keine Berechtigung' }, { status: 403 })

    await prisma.post.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Fehler' }, { status: 500 })
  }
}
