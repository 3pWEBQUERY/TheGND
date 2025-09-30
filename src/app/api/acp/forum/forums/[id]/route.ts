import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  try {
    const { id } = await params
    const body = await req.json()
    const data: any = {}
    if (typeof body.name === 'string') data.name = body.name
    if (typeof body.description === 'string') data.description = body.description
    if (typeof body.sortOrder === 'number') data.sortOrder = body.sortOrder
    if (typeof body.isLocked === 'boolean') data.isLocked = body.isLocked
    if (typeof body.isHidden === 'boolean') data.isHidden = body.isHidden
    if (typeof body.icon === 'string' || body.icon === null) data.icon = body.icon
    if (typeof body.image === 'string' || body.image === null) data.image = body.image
    if (typeof body.parentId === 'string' || body.parentId === null) data.parentId = body.parentId

    try {
      const updated = await prisma.forum.update({ where: { id }, data, select: { id: true } })
      return NextResponse.json({ ok: true, id: updated.id })
    } catch (e: any) {
      const msg = String(e?.message || '')
      if (msg.includes('Unknown argument `icon`') || msg.includes('Unknown arg `icon`') || msg.includes('Unknown argument `image`') || msg.includes('Unknown arg `image`')) {
        // Retry without icon if the column is not yet migrated in this environment
        try {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete (data as any).icon
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete (data as any).image
          const updated2 = await prisma.forum.update({ where: { id }, data, select: { id: true } })
          return NextResponse.json({ ok: true, id: updated2.id, note: 'Icon/Bild-Feld nicht verfügbar; ohne diese Felder gespeichert.' })
        } catch (e2: any) {
          return NextResponse.json({ error: e2?.message || 'Fehler' }, { status: 500 })
        }
      }
      return NextResponse.json({ error: msg || 'Fehler' }, { status: 500 })
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Fehler' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })
  try {
    const { id } = await params
    await prisma.forum.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Fehler' }, { status: 500 })
  }
}
