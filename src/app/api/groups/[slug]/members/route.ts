import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const session = await getServerSession(authOptions as any)
    const userId = (session as any)?.user?.id as string | undefined
    if (!userId) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

    const { slug } = await params
    const group = await (prisma as any).feedGroup.findUnique({ where: { slug } })
    if (!group) return NextResponse.json({ error: 'Gruppe nicht gefunden' }, { status: 404 })

    // Only admins/owner may list for admin UI; but allow members to view list
    const member = await (prisma as any).feedGroupMember.findUnique({ where: { groupId_userId: { groupId: group.id, userId } } })
    if (!member) return NextResponse.json({ error: 'Nur Mitglieder' }, { status: 403 })

    const members = await (prisma as any).feedGroupMember.findMany({
      where: { groupId: group.id },
      orderBy: { createdAt: 'asc' },
      include: { user: { select: { id: true, email: true, profile: { select: { displayName: true } } } } }
    })

    return NextResponse.json({ members })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Fehler' }, { status: 500 })
  }
}
