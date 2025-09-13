import { prisma } from '@/lib/prisma'
import CreateGroupForm from '@/components/groups/CreateGroupForm'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function GroupsIndexPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = (await searchParams) || {}
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''
  const page = Math.max(1, parseInt((sp.page as string) || '1', 10) || 1)
  const limit = 20
  const skip = (page - 1) * limit

  const where: any = q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] } : {}

  const [total, groups] = await Promise.all([
    (prisma as any).feedGroup.count({ where }),
    (prisma as any).feedGroup.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { members: true, posts: true } } }
    })
  ])

  const totalPages = Math.max(1, Math.ceil(total / limit))
  const makeHref = (n: number) => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (n > 1) qs.set('page', String(n))
    const query = qs.toString()
    return `/groups${query ? `?${query}` : ''}`
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-wider text-gray-900">Gruppen</h1>
      </div>

      <form method="get" action="/groups" className="flex gap-3">
        <input name="q" defaultValue={q} className="flex-1 border border-gray-300 px-3 py-2 text-sm" placeholder="Gruppen suchen..." />
        <button className="px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50">Suchen</button>
      </form>

      <CreateGroupForm />

      <div className="grid grid-cols-1 gap-4">
        {groups.map((g: any) => (
          <a key={g.id} href={`/groups/${g.slug}`} className="block border border-gray-200 bg-white p-4 hover:bg-gray-50">
            <div className="text-gray-900 font-medium">{g.name}</div>
            {g.description && <div className="text-sm text-gray-600 mt-1 line-clamp-2">{g.description}</div>}
            <div className="text-xs text-gray-500 mt-2">{g._count?.members ?? 0} Mitglieder · {g._count?.posts ?? 0} Beiträge</div>
          </a>
        ))}
        {groups.length === 0 && (
          <div className="border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Keine Gruppen gefunden.</div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Seite {page} von {totalPages} · {total} Gruppen
        </div>
        <div className="space-x-2">
          {page > 1 && (
            <a href={makeHref(page - 1)} className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50">Zurück</a>
          )}
          {page < totalPages && (
            <a href={makeHref(page + 1)} className="px-3 py-1.5 border border-gray-300 hover:bg-gray-50">Weiter</a>
          )}
        </div>
      </div>
    </div>
  )
}
