'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatTimeAgo, getUserTypeDisplayName } from '@/lib/validations'
import CommentsThread from '@/components/CommentsThread'
import CommentsModal from '@/components/CommentsModal'

export type ProfileFeedPost = {
  id: string
  content: string
  images: string[]
  createdAt: string | Date
  isLikedByUser?: boolean
  _count?: { likes: number; comments: number }
  author: {
    email: string
    userType?: string
    profile?: { displayName?: string | null; avatar?: string | null }
  }
  comments?: Array<{
    id: string
    content: string
    parentId?: string | null
    author: {
      email: string
      profile?: { displayName?: string | null; avatar?: string | null }
    }
  }>
}

type Props = {
  posts: ProfileFeedPost[]
}

// Variants for profile view schematic
export type ProfileViewVariant = 'STANDARD' | 'ALT1' | 'ALT2'

// A small, image-free schematic/thumbnail to preview the page layout for a profile view.
// This is purely illustrative (boxes/lines), no real images are used.
export function ProfileViewPreview({ variant = 'STANDARD' }: { variant?: ProfileViewVariant }) {
  return (
    <div className="w-full">
      <div className="text-xs font-light tracking-widest text-gray-600 mb-2">PROFILANSICHT • {variant}</div>
      <div className="relative w-full aspect-[16/9] bg-white border border-gray-200 overflow-hidden">
        {/* HERO / HEADER */}
        <div className={
          variant === 'ALT2'
            ? 'absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-gray-300 to-gray-200'
            : 'absolute inset-x-0 top-0 h-[28%] bg-gradient-to-b from-gray-300 to-gray-200'
        } />

        {/* NAME + SUBTEXT placeholder (center or left depending on variant) */}
        {variant !== 'ALT1' ? (
          <div className="absolute top-[12%] left-1/2 -translate-x-1/2 text-center">
            <div className="h-4 w-40 bg-white/70" />
            <div className="mt-2 h-2 w-24 bg-white/60" />
          </div>
        ) : (
          <div className="absolute top-[12%] left-6">
            <div className="h-4 w-32 bg-white/70" />
            <div className="mt-2 h-2 w-20 bg-white/60" />
          </div>
        )}

        {/* BODY LAYOUT */}
        {variant === 'ALT1' ? (
          // ALT1: Sidebar card + tabs/content on the right
          <>
            <div className="absolute left-6 top-[32%] w-40 h-48 bg-gray-50 border border-gray-200 shadow-sm" />
            <div className="absolute left-6 top-[32%] translate-x-44 w-1/2 h-6 bg-gray-100 border border-gray-200" />
            <div className="absolute left-[calc(1.5rem+10rem)] top-[40%] right-6 grid grid-rows-3 gap-2">
              <div className="h-20 bg-gray-50 border border-gray-200" />
              <div className="h-20 bg-gray-50 border border-gray-200" />
              <div className="h-20 bg-gray-50 border border-gray-200" />
            </div>
          </>
        ) : variant === 'ALT2' ? (
          // ALT2: Wide hero with info overlap + sections below
          <>
            <div className="absolute left-6 right-6 top-[34%] bg-white/90 border border-gray-200 h-20 shadow-sm" />
            <div className="absolute left-6 right-6 top-[52%] grid grid-cols-3 gap-2">
              <div className="h-24 bg-gray-50 border border-gray-200" />
              <div className="h-24 bg-gray-50 border border-gray-200" />
              <div className="h-24 bg-gray-50 border border-gray-200" />
            </div>
            <div className="absolute left-6 right-6 top-[72%] h-24 bg-gray-50 border border-gray-200" />
          </>
        ) : (
          // STANDARD: Content stack with hero, profile block, tabs
          <>
            <div className="absolute left-6 right-6 top-[30%] h-20 bg-white/90 border border-gray-200 shadow-sm" />
            <div className="absolute left-6 right-6 top-[48%] h-6 bg-gray-100 border border-gray-200" />
            <div className="absolute left-6 right-6 top-[56%] grid grid-cols-2 gap-2">
              <div className="h-24 bg-gray-50 border border-gray-200" />
              <div className="h-24 bg-gray-50 border border-gray-200" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function normalize(url?: string | null): string | undefined {
  if (!url) return undefined
  const t = url.trim()
  if (!t) return undefined
  if (t.startsWith('http://') || t.startsWith('https://')) return t
  return t.startsWith('/') ? t : `/${t}`
}

export default function ProfileFeed({ posts }: Props) {
  const { data: session } = useSession()
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [localPosts, setLocalPosts] = useState<ProfileFeedPost[]>(posts || [])

  // Share menu state
  const [shareMenuFor, setShareMenuFor] = useState<string | null>(null)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState<string[]>([])
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [openCommentsFor, setOpenCommentsFor] = useState<string | null>(null)
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null)
  const [openCommentsModalFor, setOpenCommentsModalFor] = useState<string | null>(null)

  useEffect(() => {
    setLocalPosts(posts || [])
  }, [posts])

  const requireAuth = (action: () => void) => {
    if (!session?.user?.id) {
      setShowAuthPrompt(true)
      return
    }
    action()
  }

  const toggleLike = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        setLocalPosts((prev) => prev.map((p) =>
          p.id === postId
            ? { ...p, isLikedByUser: !!data.isLiked, _count: { ...(p._count || { likes: 0, comments: 0 }), likes: data.likesCount } }
            : p
        ))
      }
    } catch {}
  }

  // Share helpers
  const getShareUrl = (postId: string) => {
    if (typeof window === 'undefined') return `#post-${postId}`
    return `${window.location.origin}${window.location.pathname}#post-${postId}`
  }
  const onCopyLink = async (postId: string) => {
    try {
      await navigator.clipboard?.writeText(getShareUrl(postId))
    } catch {}
    setShareMenuFor(null)
  }
  const onNativeShare = async (post: ProfileFeedPost) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.author.profile?.displayName || post.author.email,
          text: post.content,
          url: getShareUrl(post.id)
        })
      } else {
        await onCopyLink(post.id)
      }
    } catch {}
    setShareMenuFor(null)
  }
  const onShareTo = (platform: 'whatsapp' | 'telegram' | 'x' | 'facebook' | 'email' | 'sms' | 'qr', post: ProfileFeedPost) => {
    const url = getShareUrl(post.id)
    const text = post.content || ''
    let shareUrl = ''
    if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${encodeURIComponent((text + ' ' + url).trim())}`
    } else if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
    } else if (platform === 'x') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent((text + ' ' + url).trim())}`
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    } else if (platform === 'email') {
      const subject = `Beitrag teilen: ${post.author.profile?.displayName || post.author.email}`
      shareUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent((text + '\n\n' + url).trim())}`
    } else if (platform === 'sms') {
      const body = encodeURIComponent((text + ' ' + url).trim())
      shareUrl = `sms:?&body=${body}`
    } else if (platform === 'qr') {
      shareUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer')
    setShareMenuFor(null)
  }

  const openLightbox = (images: string[], index: number) => {
    if (!images || images.length === 0) return
    setLightboxImages(images)
    setLightboxIndex(index)
    setLightboxOpen(true)
  }
  const closeLightbox = () => setLightboxOpen(false)
  const showPrev = (e?: any) => {
    if (e) e.stopPropagation()
    setLightboxIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
  }
  const showNext = (e?: any) => {
    if (e) e.stopPropagation()
    setLightboxIndex((prev) => (prev + 1) % lightboxImages.length)
  }

  return (
    <div className="space-y-8" onClickCapture={() => setShareMenuFor(null)}>
      {localPosts && localPosts.length > 0 ? (
        localPosts.map((post) => {
          const displayName = post.author.profile?.displayName || post.author.email
          return (
            <div key={post.id} id={`post-${post.id}`} className="bg-white border border-gray-100 rounded-none">
              <div className="p-4 sm:p-8">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12 object-cover">
                      <AvatarImage src={normalize(post.author.profile?.avatar)} alt={`Avatar von ${displayName}`} />
                      <AvatarFallback className="text-sm font-light tracking-widest bg-gray-100">
                        {displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-light tracking-wide text-gray-800">{displayName}</span>
                        {post.author.userType && (
                          <div className="text-xs font-light tracking-widest text-gray-500 uppercase">
                            {getUserTypeDisplayName(post.author.userType as any)}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-light tracking-wide text-gray-400 mt-1">
                        {formatTimeAgo(new Date(post.createdAt))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content */}
                {post.content && (
                  <div className="mb-6">
                    <p className="text-sm font-light tracking-wide text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                )}

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {post.images.map((image, index) => (
                      <div 
                        key={index} 
                        className="relative group cursor-zoom-in"
                        onClick={() => openLightbox(post.images!, index)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image} alt={`Beitragsbild ${index + 1}`} className="w-50 h-80 object-cover rounded-none" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs font-light tracking-widest text-gray-400 mb-4 pb-4 border-b border-gray-100 mt-6">
                  <span>{post._count?.likes ?? 0} GEFÄLLT MIR</span>
                  <span>{post._count?.comments ?? 0} KOMMENTARE</span>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-8">
                  <button
                    aria-label="Gefällt mir"
                    onClick={() => requireAuth(() => toggleLike(post.id))}
                    className={`flex items-center space-x-2 text-xs font-light tracking-widest transition-colors ${post.isLikedByUser ? 'text-pink-500 hover:text-pink-600' : 'text-gray-400 hover:text-pink-500'}`}
                  >
                    <Heart className={`h-4 w-4 ${post.isLikedByUser ? 'fill-current' : ''}`} />
                    <span className="hidden sm:inline">GEFÄLLT MIR</span>
                  </button>

                  <button
                    aria-label="Kommentieren"
                    onClick={() => requireAuth(() => { setOpenCommentsModalFor(post.id); setReplyToCommentId(null) })}
                    className="flex items-center space-x-2 text-xs font-light tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">KOMMENTIEREN</span>
                  </button>

                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      aria-label="Teilen"
                      className="flex items-center space-x-2 text-xs font-light tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation()
                        requireAuth(() => setShareMenuFor(shareMenuFor === post.id ? null : post.id))
                      }}
                    >
                      <Share className="h-4 w-4" />
                      <span className="hidden sm:inline">TEILEN</span>
                    </button>
                    {shareMenuFor === post.id && (
                      <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg z-10" onClick={(e) => e.stopPropagation()}>
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => onNativeShare(post)}>
                          Mit System teilen
                        </button>
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => onCopyLink(post.id)}>
                          Link kopieren
                        </button>
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => onShareTo('whatsapp', post)}>
                          WhatsApp
                        </button>
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => onShareTo('telegram', post)}>
                          Telegram
                        </button>
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => onShareTo('x', post)}>
                          X (Twitter)
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => onShareTo('facebook', post)}>
                          Facebook
                        </button>
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => onShareTo('sms', post)}>
                          SMS
                        </button>
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => onShareTo('email', post)}>
                          E-Mail
                        </button>
                        <div className="h-px bg-gray-100 my-1" />
                        <button className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50" onClick={() => onShareTo('qr', post)}>
                          QR-Code
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments Preview */}
                {post.comments && post.comments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="space-y-4">
                      {post.comments.slice(0, 2).map((comment: any) => (
                        <div key={comment.id} className={`flex items-start space-x-3 ${comment.parentId ? 'pl-8' : ''}`}>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={normalize(comment.author?.profile?.avatar)} alt={`Avatar von ${(comment.author?.profile?.displayName || comment.author?.email) ?? 'Nutzer'}`} />
                            <AvatarFallback className="text-xs font-light tracking-widest bg-gray-100">
                              {(comment.author?.profile?.displayName || comment.author?.email || '?').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <span className="text-xs font-light tracking-wide text-gray-800">
                              {comment.author?.profile?.displayName || comment.author?.email}
                            </span>
                            <span className="text-xs font-light tracking-wide text-gray-600 ml-2">
                              {comment.content}
                            </span>
                            <div className="mt-1">
                              <button
                                type="button"
                                className="text-[10px] tracking-widest text-gray-500 hover:text-gray-700 uppercase"
                                onClick={() => requireAuth(() => { setOpenCommentsModalFor(post.id); setReplyToCommentId(comment.id) })}
                              >
                                ANTWORTEN
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {post.comments.length > 2 && (
                        <button
                          className="text-xs font-light tracking-widest text-gray-500 hover:text-gray-700 transition-colors uppercase"
                          onClick={() => requireAuth(() => { setOpenCommentsModalFor(post.id); setReplyToCommentId(null) })}
                        >
                          ALLE {post.comments.length} KOMMENTARE ANZEIGEN
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Full Comments Thread */}
                {/* Thread wird jetzt im Modal geöffnet */}
              </div>
            </div>
          )
        })
      ) : (
        <div className="bg-white border border-gray-100 rounded-none">
          <div className="p-12 text-center text-sm font-light tracking-wide text-gray-500">Noch keine Beiträge.</div>
        </div>
      )}

      {/* Comments Modal */}
      <CommentsModal
        open={!!openCommentsModalFor}
        onClose={() => { setOpenCommentsModalFor(null); setReplyToCommentId(null) }}
        title="KOMMENTARE"
      >
        {openCommentsModalFor && (
          <CommentsThread
            postId={openCommentsModalFor}
            requireAuth={requireAuth}
            initialReplyToId={replyToCommentId || undefined}
            onCountChange={(count) => {
              setLocalPosts((prev) => prev.map((p) => p.id === openCommentsModalFor ? { ...p, _count: { ...(p._count || { likes: 0, comments: 0 }), comments: count } } : p))
            }}
          />
        )}
      </CommentsModal>

      {/* Auth prompt modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6" onClick={() => setShowAuthPrompt(false)}>
          <div className="bg-white border border-gray-200 w-full max-w-sm p-6 relative" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowAuthPrompt(false)} aria-label="Schließen">
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-thin tracking-wider text-gray-900 mb-2">ANMELDUNG ERFORDERLICH</h3>
            <p className="text-sm text-gray-600 mb-4">Melde dich an oder registriere dich, um zu liken, zu kommentieren und zu teilen.</p>
            <div className="flex gap-3">
              <a href="/auth/signin" className="flex-1 text-center px-4 py-2 border border-gray-300 rounded-none text-sm tracking-widest hover:border-pink-500">ANMELDEN</a>
              <a href="/auth/signup" className="flex-1 text-center px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-none text-sm tracking-widest">REGISTRIEREN</a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={closeLightbox}>
          {/* Close */}
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={(e) => { e.stopPropagation(); closeLightbox() }}
            aria-label="Schließen"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Prev/Next */}
          {lightboxImages.length > 1 && (
            <>
              <button type="button" className="absolute left-4 text-white/80 hover:text-white" onClick={showPrev} aria-label="Vorheriges Bild">
                <ChevronLeft className="h-8 w-8" />
              </button>
              <button type="button" className="absolute right-4 text-white/80 hover:text-white" onClick={showNext} aria-label="Nächstes Bild">
                <ChevronRight className="h-8 w-8" />
              </button>
            </>
          )}

          {/* Media */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxImages[lightboxIndex]}
            alt={`Bild ${lightboxIndex + 1}`}
            className="max-h-[85vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
