import CreateForumCategoryForm from '@/components/admin/forum/CreateForumCategoryForm'
import CreateForumForm from '@/components/admin/forum/CreateForumForm'
import { prisma } from '@/lib/prisma'
import { Fragment } from 'react'
import { ActionButton } from '@/components/admin/ActionButton'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function AdminForumPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const categories = await prisma.forumCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      forums: {
        where: { parentId: null },
        orderBy: { sortOrder: 'asc' },
        include: {
          children: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { threads: true } },
        },
      },
    },
  })

  const flatCategories = categories.map((c) => ({
    id: c.id,
    name: c.name,
    forums: c.forums.map((f) => ({ id: f.id, name: f.name })),
  }))

  const sp = (await searchParams) || {}
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''
  const forumId = typeof sp.forumId === 'string' ? sp.forumId : ''
  const page = Math.max(1, parseInt((sp.page as string) || '1', 10) || 1)
  const pageSize = 50

  const AND: any[] = []
  if (q) AND.push({ content: { contains: q, mode: 'insensitive' as const } })
  if (forumId) AND.push({ thread: { forumId } })
  const where = AND.length ? { AND } : {}

  const [totalPosts, posts] = await Promise.all([
    prisma.forumPost.count({ where }),
    prisma.forumPost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        thread: { select: { id: true, title: true, forum: { select: { slug: true, name: true } } } },
        author: { select: { email: true, profile: { select: { displayName: true } } } },
      },
    }),
  ])

  const totalPages = Math.max(1, Math.ceil(totalPosts / pageSize))
  const makeHref = (n: number) => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (forumId) qs.set('forumId', forumId)
    if (n > 1) qs.set('page', String(n))
    const query = qs.toString()
    return `/acp/forum${query ? `?${query}` : ''}`
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-wide text-gray-900">Forum Verwaltung</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreateForumCategoryForm />
        <CreateForumForm categories={flatCategories as any} />
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-2 text-gray-500 font-medium">Kategorie / Forum</th>
              <th className="text-left px-4 py-2 text-gray-500 font-medium">Slug</th>
              <th className="text-left px-4 py-2 text-gray-500 font-medium">Status</th>
              <th className="text-right px-4 py-2 text-gray-500 font-medium">Threads</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <Fragment key={cat.id}>
                <tr key={cat.id} className="border-t border-gray-100 bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">—</td>
                  <td className="px-4 py-3 text-gray-500">—</td>
                  <td className="px-4 py-3 text-right text-gray-500">—</td>
                </tr>
                {cat.forums.map((f) => (
                  <tr key={f.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-700">
                      <div>
                        <span className="font-medium text-gray-900">{f.name}</span>
                        {Array.isArray((f as any).children) && (f as any).children.length > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            Unterforen: {(((f as any).children ?? []) as Array<{ name: string }>).map((c) => c.name).join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{f.slug}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs border ${f.isHidden ? 'border-gray-300 text-gray-600' : 'border-green-200 text-green-700 bg-green-50'}`}>
                        {f.isHidden ? 'Versteckt' : 'Sichtbar'}
                      </span>
                      <span className={`ml-2 px-2 py-1 rounded text-xs border ${f.isLocked ? 'border-red-200 text-red-700 bg-red-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                        {f.isLocked ? 'Gesperrt' : 'Offen'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-700">{f._count.threads}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-light tracking-wide text-gray-900">Neueste Beiträge</h2>
        <form method="get" action="/acp/forum" className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Suche</label>
            <input name="q" defaultValue={q} className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Text im Beitrag" />
          </div>
          <div className="w-64 min-w-[220px]">
            <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Forum</label>
            <select name="forumId" defaultValue={forumId} className="w-full border border-gray-300 px-3 py-2 text-sm">
              <option value="">Alle Foren</option>
              {categories.map((cat) => (
                <optgroup key={cat.id} label={cat.name}>
                  {cat.forums.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button type="submit" className="px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50">Filtern</button>
            <a href="/acp/forum" className="px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50">Zurücksetzen</a>
          </div>
        </form>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Beitrag</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Thread</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Forum</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Autor</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Erstellt</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p) => (
                <tr key={p.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-700">
                    <div className="line-clamp-2 max-w-xl">{p.content}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    <a href={`/forum/thread/${p.thread?.id}`} className="text-pink-600 hover:underline">{p.thread?.title || p.thread?.id}</a>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{p.thread?.forum?.name}</td>
                  <td className="px-4 py-3 text-gray-700">{p.author?.profile?.displayName || p.author?.email || '—'}</td>
                  <td className="px-4 py-3 text-right text-gray-500">{new Date(p.createdAt).toLocaleString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3 text-right">
                    <ActionButton
                      label="Löschen"
                      endpoint={`/api/acp/forum/posts/${p.id}`}
                      method="POST"
                      body={{ action: 'delete' }}
                      confirm="Beitrag wirklich löschen?"
                      variant="danger"
                    />
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500 text-sm">Keine Beiträge gefunden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            Seite {page} von {totalPages} · {totalPosts} Beiträge
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
    </div>
  )
}
