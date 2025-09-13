import CreateForumCategoryForm from '@/components/admin/forum/CreateForumCategoryForm'
import CreateForumForm from '@/components/admin/forum/CreateForumForm'
import { prisma } from '@/lib/prisma'
import { Fragment } from 'react'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function AdminForumPage() {
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

  const posts = await prisma.forumPost.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      thread: { select: { id: true, title: true, forum: { select: { slug: true, name: true } } } },
      author: { select: { email: true, profile: { select: { displayName: true } } } },
    },
  })

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
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Beitrag</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Thread</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Forum</th>
                <th className="text-left px-4 py-2 text-gray-500 font-medium">Autor</th>
                <th className="text-right px-4 py-2 text-gray-500 font-medium">Erstellt</th>
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
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500 text-sm">Keine Beiträge gefunden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
