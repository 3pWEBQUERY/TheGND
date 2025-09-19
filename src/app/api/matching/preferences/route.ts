import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.id) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    if (session.user.userType !== 'MEMBER') return NextResponse.json({ error: 'Nur für Mitglieder' }, { status: 403 })

    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
    let preferences: any = {}
    try {
      preferences = profile?.preferences ? JSON.parse(profile.preferences) : {}
    } catch {
      preferences = {}
    }
    return NextResponse.json({ preferences }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Server Fehler beim Laden der Präferenzen' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.id) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
    if (session.user.userType !== 'MEMBER') return NextResponse.json({ error: 'Nur für Mitglieder' }, { status: 403 })

    const data = await req.json()
    // Basic shape validation; keep flexible
    const preferences = typeof data === 'object' && data ? data : {}

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { preferences: JSON.stringify(preferences) },
      create: { userId: session.user.id, preferences: JSON.stringify(preferences) },
    })

    return NextResponse.json({ message: 'Präferenzen gespeichert', preferences: JSON.parse(profile.preferences || '{}') }, { status: 200 })
  } catch (e) {
    return NextResponse.json({ error: 'Server Fehler beim Speichern der Präferenzen' }, { status: 500 })
  }
}
