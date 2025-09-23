import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session: any = await getServerSession(authOptions as any)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const states = await (prisma as any).userAddonState.findMany({ where: { userId: session.user.id } })
    return NextResponse.json(states)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to load' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session: any = await getServerSession(authOptions as any)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: any = {}
  try { body = await req.json() } catch {}
  const { key, enabled, settings } = body || {}
  if (!key) return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  try {
    const saved = await (prisma as any).userAddonState.upsert({
      where: { userId_key: { userId: session.user.id, key } as any },
      update: { enabled: !!enabled, settings: settings ? JSON.stringify(settings) : null },
      create: { userId: session.user.id, key, enabled: !!enabled, settings: settings ? JSON.stringify(settings) : null },
    })
    return NextResponse.json(saved)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
