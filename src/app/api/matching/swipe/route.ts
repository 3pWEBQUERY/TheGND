import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session: any = await getServerSession(authOptions as any)
    if (!session?.user?.id) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const escortId = String(body.escortId || '')
    const action = String(body.action || '').toUpperCase()

    if (!escortId || (action !== 'LIKE' && action !== 'PASS'))
      return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 })

    // Validate target exists and is an ESCORT
    const escort = await prisma.user.findUnique({ where: { id: escortId } })
    if (!escort || escort.userType !== 'ESCORT')
      return NextResponse.json({ error: 'Escort nicht gefunden' }, { status: 404 })

    // Simple rate limiting to avoid abuse
    try {
      const rateRows = await prisma.$queryRaw<{ c: number }[]>`
        SELECT COUNT(*)::int AS c
        FROM "member_match_actions"
        WHERE "memberId" = ${session.user.id}
          AND "createdAt" > NOW() - INTERVAL '30 seconds'
      `
      const count = Array.isArray(rateRows) && rateRows[0] ? rateRows[0].c : 0
      if (count >= 40) {
        return NextResponse.json({ error: 'Zu viele Aktionen. Bitte kurz warten.' }, { status: 429 })
      }
    } catch {}

    // Upsert via raw SQL to avoid local Prisma client mismatch
    const id = (globalThis as any)?.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)
    try {
      const rows = await prisma.$queryRaw<{ action: 'LIKE' | 'PASS' }[]>`
        INSERT INTO "member_match_actions" ("id", "memberId", "escortId", "action")
        VALUES (${id}, ${session.user.id}, ${escortId}, ${action}::"MatchActionType")
        ON CONFLICT ("memberId", "escortId") DO UPDATE
        SET "action" = EXCLUDED."action", "createdAt" = CURRENT_TIMESTAMP
        RETURNING "action";
      `
      const ret = Array.isArray(rows) && rows[0] ? rows[0].action : action
      return NextResponse.json({ ok: true, action: ret }, { status: 200 })
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: 'Fehler beim Speichern der Aktion' }, { status: 500 })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Server Fehler beim Speichern der Aktion' }, { status: 500 })
  }
}
