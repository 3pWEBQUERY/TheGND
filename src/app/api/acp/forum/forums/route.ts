import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80)
}

export async function POST(req: NextRequest) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 })

  try {
    const body = await req.json()
    const { categoryId, name, description, sortOrder, parentId, isLocked, isHidden } = body || {}
    if (!categoryId || !name) return NextResponse.json({ error: 'categoryId, name erforderlich' }, { status: 400 })

    const category = await prisma.forumCategory.findUnique({ where: { id: String(categoryId) } })
    if (!category) return NextResponse.json({ error: 'Kategorie nicht gefunden' }, { status: 404 })

    let baseSlug = slugify(String(name)) || 'forum'
    let slug = baseSlug
    let i = 1
    while (await prisma.forum.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${i++}`
    }

    const forum = await prisma.forum.create({
      data: {
        categoryId: category.id,
        parentId: parentId ? String(parentId) : null,
        name: String(name),
        slug,
        description: description ? String(description) : null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        isLocked: !!isLocked,
        isHidden: !!isHidden,
      },
      select: { id: true, name: true, slug: true },
    })

    return NextResponse.json({ ok: true, id: forum.id, slug: forum.slug }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Fehler' }, { status: 500 })
  }
}
