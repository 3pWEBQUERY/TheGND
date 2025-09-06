import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export async function GET() {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const addons = await prisma.addon.findMany({ orderBy: { sortOrder: 'asc' }, include: { options: { orderBy: { sortOrder: 'asc' } } } })
  return NextResponse.json(addons)
}

export async function POST(req: Request) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  try {
    const body = await req.json()
    const { id, key, name, description, active, sortOrder } = body || {}
    let result
    if (id) {
      result = await prisma.addon.update({ where: { id }, data: { key, name, description, active, sortOrder } })
    } else {
      result = await prisma.addon.create({ data: { key, name, description, active: active ?? true, sortOrder: sortOrder ?? 0 } })
    }
    return NextResponse.json(result)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 400 })
  }
}
