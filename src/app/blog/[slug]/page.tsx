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

      {/* Hero Section (matching /blog) */}
      <section className="relative overflow-hidden mb-12 md:mb-16">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage || '/blog.jpg'}
            alt="Hero Background"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/0 to-white/0 md:to-white/0" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-24 md:pt-48 md:pb-40">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-light tracking-[0.25em] text-white">{post.title}</h1>
            <div className="mt-4 h-[2px] w-24 bg-gradient-to-r from-pink-600/0 via-pink-500/80 to-pink-600/0" />
            {post.publishedAt && (
              <div className="mt-3 text-[11px] uppercase tracking-widest text-neutral-200">
                {new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(post.publishedAt))}
              </div>
            )}
            {post.excerpt && (
              <p className="mt-6 text-neutral-200 text-base md:text-lg leading-relaxed">{post.excerpt}</p>
            )}
          </div>
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
