import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { renderMarkdownToSafeHtml } from '@/lib/markdown'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  // Keep empty to make it fully dynamic; optional pre-render could be added
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await (prisma as any).blogPost.findUnique({ where: { slug }, select: { title: true, excerpt: true, coverImage: true, published: true } })
    if (!post || !post.published) return { title: 'Blog – THEGND' }
    return {
      title: post.title,
      description: post.excerpt || undefined,
      openGraph: {
        title: post.title,
        description: post.excerpt || undefined,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
      twitter: {
        card: post.coverImage ? 'summary_large_image' : 'summary',
        title: post.title,
        description: post.excerpt || undefined,
        images: post.coverImage ? [post.coverImage] : undefined,
      },
    }
  } catch {
    return { title: 'Blog – THEGND' }
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await (prisma as any).blogPost.findUnique({ where: { slug } })
  if (!post || !post.published) return notFound()

  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />

      {/* Hero */}
      <section className="relative bg-white">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <h1 className="text-3xl md:text-4xl font-light tracking-widest text-gray-900">{post.title}</h1>
          <div className="mt-3 w-24 h-px bg-pink-500" />
          {post.publishedAt && (
            <div className="mt-3 text-[11px] uppercase tracking-widest text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString()}
            </div>
          )}
          {post.excerpt && (
            <p className="mt-4 text-sm text-gray-600 max-w-2xl">{post.excerpt}</p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        {post.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt={post.title} className="w-full h-80 object-cover border border-gray-200" />
        )}
        {post.content && (
          <div className="prose max-w-none mt-8 prose-p:text-gray-700 prose-headings:tracking-widest prose-a:text-pink-600">
            <div dangerouslySetInnerHTML={{ __html: renderMarkdownToSafeHtml(post.content) }} />
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}
