import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProfileFeed, { type ProfileFeedPost } from '@/components/ProfileFeed'
import GroupJoinLeaveButton from '@/components/groups/GroupJoinLeaveButton'
import GroupComposer from '@/components/groups/GroupComposer'
import GroupSettingsForm from '@/components/groups/GroupSettingsForm'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function GroupDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await getServerSession(authOptions as any)
  const userId = (session as any)?.user?.id as string | undefined
  const { slug } = await params

  const group = await (prisma as any).feedGroup.findUnique({
    where: { slug },
    include: {
      _count: { select: { members: true, posts: true } },
    }
  })
  if (!group) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Gruppe nicht gefunden.</div>
      </div>
    )
  }

  const membership = userId ? await (prisma as any).feedGroupMember.findUnique({ where: { groupId_userId: { groupId: group.id, userId } } }) : null
  const isMember = !!membership
  const isAdminInGroup = membership?.role === 'ADMIN'
  const canSeePosts = group.privacy === 'PUBLIC' || isMember

  const postsRaw = canSeePosts ? await (prisma as any).post.findMany({
    where: { groupId: group.id, isActive: true } as any,
    include: {
      author: { select: { email: true, userType: true, profile: { select: { displayName: true, avatar: true } } } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  }) : []

  const posts: ProfileFeedPost[] = postsRaw.map((p: any) => ({
    id: p.id,
    content: p.content,
    images: p.images ? JSON.parse(p.images) : [],
    createdAt: p.createdAt,
    _count: p._count,
    isLikedByUser: false,
    author: {
      email: p.author?.email,
      userType: p.author?.userType,
      profile: { displayName: p.author?.profile?.displayName, avatar: p.author?.profile?.avatar }
    }
  }))

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="border border-gray-200 bg-white p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-light tracking-wider text-gray-900">{group.name}</h1>
            {group.description && <p className="text-sm text-gray-600 mt-2">{group.description}</p>}
            <div className="text-xs text-gray-500 mt-2">{group._count?.members ?? 0} Mitglieder · {group._count?.posts ?? 0} Beiträge · {group.privacy === 'PRIVATE' ? 'Privat' : 'Öffentlich'}</div>
          </div>
          <div className="shrink-0">
            <GroupJoinLeaveButton slug={group.slug} isMember={!!isMember} />
          </div>
        </div>
      </div>

      {canSeePosts ? (
        <>
          {userId && (
            <GroupComposer groupId={group.id} />
          )}
          <ProfileFeed
            posts={posts}
            adminActions={isAdminInGroup ? (post) => (
              <form action={`/api/posts/${post.id}`} method="post" onSubmit={(e) => { e.preventDefault() }}>
                {/* Using ActionButton component causes client dependency; use simple link/button to DELETE */}
                <a
                  href="#"
                  onClick={async (e) => {
                    e.preventDefault()
                    if (!confirm('Beitrag wirklich löschen?')) return
                    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
                    if (res.ok) {
                      // trigger reload
                      // no access to router here, rely on full refresh
                      // @ts-ignore
                      if (typeof window !== 'undefined') window.location.reload()
                    } else {
                      const msg = await res.text()
                      alert(msg || 'Löschen fehlgeschlagen')
                    }
                  }}
                  className="text-xs px-2 py-1 border border-red-300 text-red-700 hover:bg-red-50"
                >Löschen</a>
              </form>
            ) : undefined}
          />
        </>
      ) : (
        <div className="border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Diese Gruppe ist privat. Trete der Gruppe bei, um Beiträge zu sehen.</div>
      )}

      {isAdminInGroup && (
        <div className="border border-gray-200 bg-white p-4">
          <h2 className="text-lg font-light tracking-wider text-gray-900 mb-2">Gruppeneinstellungen</h2>
          <GroupSettingsForm group={{ id: group.id, slug: group.slug, name: group.name, description: group.description || '', privacy: group.privacy }} />
        </div>
      )}
    </div>
  )
}
