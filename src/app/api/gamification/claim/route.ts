import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    }

    const body = await request.json()
    const perkId = String(body?.perkId || '')
    if (!perkId) {
      return NextResponse.json({ error: 'perkId fehlt' }, { status: 400 })
    }

    const userId = session.user.id

    // Ensure user has unlocked the perk
    const userPerk = await (prisma as any).userPerk.findFirst({
      where: { userId, perkId },
    })
    if (!userPerk) {
      return NextResponse.json({ error: 'Vorteil nicht freigeschaltet' }, { status: 400 })
    }

    if (userPerk.claimedAt) {
      return NextResponse.json({ message: 'Bereits eingelöst' }, { status: 200 })
    }

    await (prisma as any).userPerk.update({
      where: { id: userPerk.id },
      data: { claimedAt: new Date() },
    })

    return NextResponse.json({ message: 'Erfolgreich eingelöst' }, { status: 200 })
  } catch (error) {
    console.error('Gamification claim error:', error)
    return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 })
  }
}
