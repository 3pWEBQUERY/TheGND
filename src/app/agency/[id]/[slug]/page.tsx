import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Globe, Phone } from 'lucide-react'
import { FaInstagram, FaFacebook, FaXTwitter, FaYoutube, FaLinkedin, FaWhatsapp, FaTelegram, FaTiktok, FaSnapchat } from 'react-icons/fa6'
import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import MessageButton from '@/components/MessageButton'
import GalleryGrid from '@/components/GalleryGrid'
import Tabs from '@/components/Tabs'
import ProfileFeed from '@/components/ProfileFeed'
import ServiceTag from '@/components/ServiceTag'
import ServiceLegend from '@/components/ServiceLegend'
import { SERVICES_DE } from '@/data/services.de'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import ExpandableText from '@/components/ExpandableText'

function getPrimaryImage(profile: any): string | null {
  if (profile?.avatar) return profile.avatar
  try {
    if (profile?.media) {
      const media = JSON.parse(profile.media)
      const firstImage = Array.isArray(media)
        ? media.find((m: any) => (m?.type?.toLowerCase?.() ?? '').includes('image'))
        : null
      if (firstImage?.url) return firstImage.url
    }
  } catch {}
  try {
    if (profile?.gallery) {
      const gallery = JSON.parse(profile.gallery)
      if (Array.isArray(gallery) && gallery[0]) return gallery[0]
    }
  } catch {}
  return null
}

// Helpers to format businessType and dates similar to Escort page formatting style
const prettifyToken = (v: any): string => {
  const s = (v ?? '').toString().trim()
  if (!s) return ''
  return s.replace(/[_-]+/g, ' ').toLowerCase().replace(/\b\w/g, (c: string) => c.toUpperCase())
}
const formatBusinessType = (v: any): string => prettifyToken(v)
const formatEstablished = (iso: any): string => {
  if (!iso) return ''
  try {
    const d = new Date(iso)
    if (!isNaN(d.getTime())) return d.getFullYear().toString()
  } catch {}
  return prettifyToken(iso)
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default async function AgencyDetailPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params
  const user = await prisma.user.findFirst({
    where: { id, userType: 'AGENCY', isActive: true },
    include: { profile: true },
  })

  if (!user || !user.profile) return notFound()

  const name = user.profile.companyName || user.profile.displayName || 'Agentur'
  // Redirect to canonical slug if mismatch
  if (name) {
    const expected = slugify(name)
    if (expected && slug !== expected) {
      redirect(`/agency/${id}/${expected}`)
    }
  }
  const city = user.profile.city || null
  const country = user.profile.country || null
  const image = getPrimaryImage(user.profile)
  const description = user.profile.description || null
  // Collect gallery/media images similar to escorts page
  let gallery: string[] = []
  let mediaImages: string[] = []
  try {
    if (user.profile.gallery) {
      const g = JSON.parse(user.profile.gallery)
      if (Array.isArray(g)) gallery = g.filter((x: any) => typeof x === 'string')
    }
  } catch {}
  try {
    if (user.profile.media) {
      const m = JSON.parse(user.profile.media)
      if (Array.isArray(m)) {
        mediaImages = m
          .filter((x: any) => (x?.type?.toLowerCase?.() ?? '').includes('image') && typeof x?.url === 'string')
          .map((x: any) => x.url as string)
      }
    }
  } catch {}
  const images = [image, ...mediaImages, ...gallery].filter(Boolean) as string[]
  // Build location object
  const location = {
    address: user.profile.address || null,
    city,
    country,
    latitude: user.profile.latitude || null,
    longitude: user.profile.longitude || null,
    formatted: user.profile.locationFormatted || null,
    zipCode: user.profile.zipCode || null,
    placeId: user.profile.locationPlaceId || null,
  }
  // Parse services (JSON array of strings)
  let services: string[] = []
  try {
    if (user.profile.services) {
      const arr = JSON.parse(user.profile.services)
      if (Array.isArray(arr)) services = arr.filter((s: any) => typeof s === 'string')
    }
  } catch {}
  // Parse social media (JSON object)
  let socials: Record<string, string> = {}
  try {
    if (user.profile.socialMedia) {
      const o = JSON.parse(user.profile.socialMedia)
      if (o && typeof o === 'object') socials = o
    }
  } catch {}
  // Parse opening hours (JSON object)
  let openingHours: Record<string, { from: string; to: string }[]> = {}
  try {
    if ((user.profile as any).openingHours) {
      const oh = JSON.parse((user.profile as any).openingHours as any)
      if (oh && typeof oh === 'object') openingHours = oh
    }
  } catch {}
  const phone = user.profile.phone || null
  const website = user.profile.website || null
  // Fetch recent posts for FEED tab with author and counts
  const session = await getServerSession(authOptions)
  const include: any = {
    author: { select: { email: true, userType: true, profile: { select: { displayName: true, avatar: true } } } },
    _count: { select: { likes: true, comments: true } },
    comments: {
      include: {
        author: {
          select: {
            email: true,
            profile: { select: { displayName: true, avatar: true } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    },
  }
  if (session?.user?.id) {
    include.likes = { where: { userId: session.user.id }, select: { id: true } }
  }
  const rawPosts = await prisma.post.findMany({
    where: { authorId: user.id, isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include,
  }) as any[]
  const postsForFeed = rawPosts.map((p: any) => {
    let imgs: string[] = []
    try {
      if (p.images) {
        const arr = JSON.parse(p.images)
        if (Array.isArray(arr)) imgs = arr.filter((x: any) => typeof x === 'string')
      }
    } catch {}
    return {
      id: p.id,
      content: p.content,
      images: imgs,
      createdAt: p.createdAt,
      isLikedByUser: !!(p.likes && p.likes.length > 0),
      _count: { likes: p._count?.likes ?? 0, comments: p._count?.comments ?? 0 },
      author: {
        email: p.author?.email,
        userType: p.author?.userType,
        profile: { displayName: p.author?.profile?.displayName, avatar: p.author?.profile?.avatar },
      },
      comments: (p.comments || []).map((c: any) => ({
        id: c.id,
        content: c.content,
        parentId: c.parentId ?? null,
        author: {
          email: c.author?.email,
          profile: { displayName: c.author?.profile?.displayName, avatar: c.author?.profile?.avatar },
        },
      })),
    }
  })

  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />
      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thegnd.com/' },
              { '@type': 'ListItem', position: 2, name: 'Agenturen', item: 'https://thegnd.com/agency' },
              { '@type': 'ListItem', position: 3, name: name, item: `https://thegnd.com/agency/${user.id}/${(name || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}` },
            ],
          }),
        }}
      />

      {/* Hero Section aligned with escorts page */}
      <section className="relative h-screen h-[100svh] md:h-[50vh] md:min-h-[400px]">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image || '/escort.png'}
            alt={(name ?? 'Agentur') + ' Hero'}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Centered content */}
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-thin tracking-wider text-white mb-2">{name ? (name.toUpperCase?.() ?? name) : 'AGENTUR'}</h1>
            {(city || country) && (
              <p className="text-sm text-gray-200">{city || country}</p>
            )}
            <div className="w-24 h-px bg-pink-500 mx-auto mt-3" />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header block */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {image && (
            <div className="w-40 h-52 bg-gray-200 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={name ?? ''} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex-1">
            {name && <h1 className="text-2xl font-light tracking-widest text-gray-900">{name.toUpperCase?.() ?? name}</h1>}
            {(city || country) && (
              <p className="text-sm text-gray-500 mt-1">{city || country}</p>
            )}

            {/* CTA buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              <MessageButton toUserId={user.id} toDisplayName={name ?? undefined} toAvatar={image ?? undefined} />
              {phone && (
                <a href={`tel:${phone}`} className="px-4 py-2 border border-gray-300 rounded-none text-sm tracking-widest hover:border-pink-500">
                  ANRUFEN
                </a>
              )}
              {website && (
                <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 rounded-none text-sm tracking-widest hover:border-pink-500">
                  WEBSEITE
                </a>
              )}
            </div>
            {Object.keys(socials).length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] tracking-widest text-gray-500 mb-1">SOCIALS</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(socials).map(([rawKey, rawVal]) => {
                    if (!rawVal) return null
                    const key = rawKey.toLowerCase()
                    let href = rawVal as string
                    if (key === 'whatsapp') {
                      const phone = (rawVal as string).replace(/[^+\d]/g, '')
                      href = `https://wa.me/${phone}`
                    } else if (!/^https?:\/\//i.test(rawVal as string)) {
                      href = `https://${rawVal}`
                    }
                    const Icon =
                      key === 'instagram' ? FaInstagram :
                      key === 'facebook' ? FaFacebook :
                      key === 'twitter' || key === 'x' ? FaXTwitter :
                      key === 'youtube' ? FaYoutube :
                      key === 'linkedin' ? FaLinkedin :
                      key === 'whatsapp' ? FaWhatsapp :
                      key === 'telegram' ? FaTelegram :
                      key === 'tiktok' ? FaTiktok :
                      key === 'snapchat' ? FaSnapchat :
                      null
                    return (
                      <a
                        key={rawKey}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 border text-xs rounded-none border-[#25D366] text-[#25D366] hover:text-white hover:bg-[#25D366] hover:border-[#25D366]"
                        title={rawKey}
                      >
                        {Icon ? <Icon className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                        <span className="truncate max-w-[180px]">{rawVal}</span>
                      </a>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-10">
          <Tabs
            tabs={[
              {
                id: 'details',
                label: 'Details & Beschreibung',
                content: (
                  <div>
                    <h2 className="text-lg font-light tracking-widest text-gray-800">DETAILS</h2>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {user.profile.businessType && (
                        <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">UNTERNEHMEN</div><div className="text-gray-800">{formatBusinessType(user.profile.businessType)}</div></div>
                      )}
                      {user.profile.established && (
                        <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">GEGRÜNDET</div><div className="text-gray-800">{formatEstablished(user.profile.established)}</div></div>
                      )}
                      {user.profile.address && (
                        <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">ADRESSE</div><div className="text-gray-800">{user.profile.address}</div></div>
                      )}
                      {(city || country) && (
                        <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">ORT</div><div className="text-gray-800">{user.profile.zipCode ? `${user.profile.zipCode} ` : ''}{city || country}</div></div>
                      )}
                      {website && (
                        <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">WEBSEITE</div><div className="text-gray-800 break-all">{website}</div></div>
                      )}
                      {phone && (
                        <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">TELEFON</div><div className="text-gray-800">{phone}</div></div>
                      )}
                    </div>
                    {description && (
                      <div className="mt-8">
                        <h2 className="text-lg font-light tracking-widest text-gray-800">BESCHREIBUNG</h2>
                        <ExpandableText
                          text={description}
                          limit={600}
                          className="text-sm text-gray-700 mt-3 leading-relaxed"
                          buttonClassName="mt-3 text-xs font-light tracking-widest uppercase text-pink-500 hover:text-pink-600"
                        />
                      </div>
                    )}
                    {/* Opening Hours */}
                    {Object.keys(openingHours).length > 0 && (
                      <div className="mt-8">
                        <h2 className="text-lg font-light tracking-widest text-gray-800">ÖFFNUNGSZEITEN</h2>
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { key: 'mon', label: 'Montag' },
                            { key: 'tue', label: 'Dienstag' },
                            { key: 'wed', label: 'Mittwoch' },
                            { key: 'thu', label: 'Donnerstag' },
                            { key: 'fri', label: 'Freitag' },
                            { key: 'sat', label: 'Samstag' },
                            { key: 'sun', label: 'Sonntag' },
                          ].map(({ key, label }) => {
                            const slots = openingHours[key] || []
                            const text = slots.length ? slots.map(s => `${s.from}–${s.to}`).join(', ') : 'Geschlossen'
                            return (
                              <div key={key} className="text-sm">
                                <div className="text-[10px] tracking-widest text-gray-500">{label.toUpperCase()}</div>
                                <div className="text-gray-800">{text}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                id: 'galerie',
                label: 'Galerie',
                content: images.length > 0 ? (
                  <GalleryGrid images={images} altBase={name ?? ''} className="mt-2" />
                ) : (
                  <div className="text-sm text-gray-500">Keine Bilder vorhanden.</div>
                ),
              },
              {
                id: 'services',
                label: 'Services',
                content: services.length > 0 ? (
                  <div>
                    <div className="mb-3">
                      <ServiceLegend />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {services.map((s) => {
                        const found = SERVICES_DE.find((o) => o.value === s)
                        const label = found?.label || s
                          .replace(/[-_]/g, ' ')
                          .replace(/\s+/g, ' ')
                          .replace(/\b\w/g, (c) => c.toUpperCase())
                        return <ServiceTag key={s} value={s} label={label} />
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Keine Services angegeben.</div>
                ),
              },
              {
                id: 'feed',
                label: 'Feed',
                content: <ProfileFeed posts={postsForFeed} />,
              },
              {
                id: 'standort',
                label: 'Standort',
                content: (
                  <div>
                    <div className="text-sm text-gray-700 mb-3">
                      <div>
                        <span className="text-[10px] tracking-widest text-gray-500 mr-2">STRASSE:</span>
                        <span className="text-gray-800">{((location.address || location.formatted || '').split(',')[0]) || (city || country) || 'Nicht verfügbar'}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] tracking-widest text-gray-500 mr-2">STADT:</span>
                        <span className="text-gray-800">{(location.zipCode || city) ? `${location.zipCode ? location.zipCode + ' ' : ''}${city || ''}` : (country || 'Nicht verfügbar')}</span>
                      </div>
                    </div>
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                      <div className="border border-gray-200">
                        <iframe
                          title="Standort"
                          className="w-full h-96"
                          src={
                            location.placeId
                              ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${location.placeId}`
                              : (location.latitude && location.longitude)
                                ? `https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${location.latitude},${location.longitude}&zoom=14&maptype=roadmap`
                                : `https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(location.formatted || location.address || `${city || ''} ${country || ''}`)}`
                          }
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-amber-600">Google Maps API Key fehlt. Bitte setze NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.</div>
                    )}
                    {(city || country) && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.formatted || location.address || `${city || ''} ${country || ''}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-sm underline"
                      >
                        Auf Karte öffnen
                      </a>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>
      <Footer />
    </div>
  )
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
  const { id } = await params
  const user = await prisma.user.findFirst({
    where: { id, userType: 'AGENCY', isActive: true },
    include: { profile: true },
  })
  if (!user || !user.profile) {
    return {
      title: 'Agentur | The GND',
      description: 'Agenturprofil auf The GND.',
      alternates: { canonical: `https://thegnd.com/agency/${id}` },
    }
  }
  const name = user.profile.companyName || user.profile.displayName || 'Agentur'
  const place = user.profile.city || user.profile.country || ''
  const title = `${name}${place ? ` – ${place}` : ''} | The GND`
  const description = user.profile.description || 'Agenturprofil auf The GND.'
  const slug = (name || '').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  const ogImage = getPrimaryImage(user.profile) || undefined
  return {
    title,
    description,
    alternates: { canonical: `https://thegnd.com/agency/${id}/${slug}` },
    openGraph: {
      title,
      description,
      type: 'profile',
      images: ogImage ? [ogImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
