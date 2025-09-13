import { prisma } from '@/lib/prisma'
import ProfileFeed, { type ProfileFeedPost } from '@/components/ProfileFeed'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export default async function PublicFeedPage() {
  // Load public posts from all users with public profiles
  const posts = await prisma.post.findMany({
    where: {
      isActive: true,
      author: {
        profile: { visibility: 'PUBLIC' }
      }
    },
    include: {
      author: {
        select: {
          email: true,
          userType: true,
          profile: { select: { displayName: true, avatar: true } }
        }
      },
      _count: { select: { likes: true, comments: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const mapped: ProfileFeedPost[] = posts.map((p: any) => ({
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-light tracking-wider text-gray-900 mb-6">ÖFFENTLICHER FEED</h1>
      <ProfileFeed posts={mapped} />
    </div>
  )
}
