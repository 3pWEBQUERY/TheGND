import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import MessageButton from '@/components/MessageButton'
import GalleryGrid from '@/components/GalleryGrid'
import Tabs from '@/components/Tabs'
import ProfileFeed from '@/components/ProfileFeed'
import ExpandableText from '@/components/ExpandableText'
import ServiceTag from '@/components/ServiceTag'
import ServiceLegend from '@/components/ServiceLegend'
import { SERVICES_DE } from '@/data/services.de'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Globe } from 'lucide-react'
import { FaInstagram, FaFacebook, FaXTwitter, FaYoutube, FaLinkedin, FaWhatsapp, FaTelegram, FaTiktok, FaSnapchat } from 'react-icons/fa6'

// Helpers for formatting (aligned with ProfileComponent)
const toStr = (v: any) => (v === null || v === undefined) ? '' : String(v).trim()
const withUnit = (v: any, unit: string) => {
  const s = toStr(v)
  if (!s) return ''
  const low = s.toLowerCase()
  if (low.includes(unit.toLowerCase())) return s
  if (/^\d+(?:[\.,]\d+)?$/.test(s)) return `${s.replace(',', '.')} ${unit}`
  return s
}
const formatHeight = (v: any) => withUnit(v, 'cm')
const formatWeight = (v: any) => withUnit(v, 'kg')
const formatShoeSize = (v: any) => withUnit(v, 'EU')
const capitalizeWords = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())
const parseJsonish = (s: string): any => {
  try {
    const trimmed = s.trim()
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      return JSON.parse(trimmed)
    }
  } catch {}
  return s
}
const toArray = (v: any): any[] => {
  if (v === null || v === undefined) return []
  if (Array.isArray(v)) return v
  if (typeof v === 'string') {
    const parsed = parseJsonish(v)
    if (Array.isArray(parsed)) return parsed
    const s = toStr(parsed)
    if (!s) return []
    if (s.includes(',')) return s.split(',').map((x) => x.trim()).filter(Boolean)
    return [s]
  }
  return [v]
}
const translateTokenDE = (token: string): string => {
  const t = token.toLowerCase().replace(/[_\-\s]+/g, '')
  const map: Record<string, string> = {
    slim: 'Schlank', petite: 'Zierlich', athletic: 'Athletisch', fit: 'Fit', average: 'Durchschnittlich', curvy: 'Kurvig', bbw: 'Mollig',
    blonde: 'Blond', blond: 'Blond', brunette: 'Brünett', brown: 'Braun', black: 'Schwarz', red: 'Rot', auburn: 'Kupfer', chestnut: 'Kastanienbraun',
    darkbrown: 'Dunkelbraun', lightbrown: 'Hellbraun', grey: 'Grau', gray: 'Grau', silver: 'Silber', dyed: 'Gefärbt', highlights: 'Strähnen',
    short: 'Kurz', medium: 'Mittel', shoulderlength: 'Schulterlang', long: 'Lang', verylong: 'Sehr lang', bob: 'Bob',
    blue: 'Blau', green: 'Grün', hazel: 'Hasel', amber: 'Bernstein',
    natural: 'Natürlich', implants: 'Implantat', implant: 'Implantat', enhanced: 'Vergrößert',
    shaved: 'Rasiert', fullyshaved: 'Komplett rasiert', partiallyshaved: 'Teilrasiert', trimmed: 'Getrimmt', naturalhair: 'Natürlich', landingstrip: 'Landing Strip', brazilian: 'Brasilianisch', waxed: 'Gewaxt',
    ears: 'Ohren', navel: 'Bauchnabel', nipples: 'Brustwarzen', tongue: 'Zunge', nose: 'Nase', lip: 'Lippe', eyebrow: 'Augenbraue', intimate: 'Intim',
    arms: 'Arme', legs: 'Beine', back: 'Rücken', chest: 'Brust', neck: 'Nacken', shoulder: 'Schulter', small: 'Klein', large: 'Groß',
    elegant: 'Elegant', casual: 'Lässig', sexy: 'Sexy', business: 'Business', sporty: 'Sportlich', chic: 'Chic', street: 'Streetwear', classic: 'Klassisch'
  }
  return map[t] || capitalizeWords(token.replace(/[_-]+/g, ' ').toLowerCase())
}
const formatEnumListDE = (v: any): string => toArray(v).map((x) => translateTokenDE(String(x))).filter(Boolean).join(', ')
const badgeElementsDE = (v: any) => {
  const arr = toArray(v)
  return arr.map((x: any, i: number) => (
    <span key={`${String(x)}-${i}`} className="inline-flex items-center px-2.5 py-1 border border-gray-200 bg-gray-50 text-gray-700 text-xs rounded-none">
      {translateTokenDE(String(x))}
    </span>
  ))
}

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

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

async function getEscort(id: string) {
  let user: any = null
  try {
    user = await prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    })
  } catch (e) {
    return null
  }
  if (!user || !user.isActive || user.userType !== 'ESCORT') return null
  const profile = user.profile
  let gallery: string[] = []
  let mediaImages: string[] = []
  let services: string[] = []
  try {
    if (profile?.gallery) {
      const g = JSON.parse(profile.gallery)
      if (Array.isArray(g)) gallery = g.filter((x: any) => typeof x === 'string')
    }
  } catch {}
  try {
    if (profile?.media) {
      const m = JSON.parse(profile.media)
      if (Array.isArray(m)) {
        mediaImages = m
          .filter((x: any) => (x?.type?.toLowerCase?.() ?? '').includes('image') && typeof x?.url === 'string')
          .map((x: any) => x.url as string)
      }
    }
  } catch {}
  try {
    if (profile?.services) {
      const s = JSON.parse(profile.services)
      if (Array.isArray(s)) services = s.filter((x: any) => typeof x === 'string')
    }
  } catch {}
  // Parse social media
  let socials: Record<string, string> = {}
  try {
    if (profile?.socialMedia) {
      const o = JSON.parse(profile.socialMedia)
      if (o && typeof o === 'object') socials = o
    }
  } catch {}

  const primaryImage = getPrimaryImage(profile)

  return {
    id: user.id,
    name: profile?.displayName ?? null,
    slogan: profile?.slogan ?? null,
    city: profile?.city ?? null,
    country: profile?.country ?? null,
    description: profile?.description ?? null,
    image: primaryImage,
    gallery,
    mediaImages,
    services,
    socials,
    location: {
      address: profile?.address ?? null,
      city: profile?.city ?? null,
      country: profile?.country ?? null,
      latitude: profile?.latitude ?? null,
      longitude: profile?.longitude ?? null,
      formatted: profile?.locationFormatted ?? null,
      zipCode: profile?.zipCode ?? null,
      placeId: profile?.locationPlaceId ?? null,
    },
    contact: {
      phone: profile?.phone ?? null,
      website: profile?.website ?? null,
    },
    details: {
      height: profile?.height ?? null,
      weight: profile?.weight ?? null,
      bodyType: (profile as any)?.bodyType ?? null,
      hairColor: profile?.hairColor ?? null,
      hairLength: profile?.hairLength ?? null,
      eyeColor: profile?.eyeColor ?? null,
      breastType: profile?.breastType ?? null,
      breastSize: profile?.breastSize ?? null,
      cupSize: (profile as any)?.cupSize ?? null,
      intimateArea: (profile as any)?.intimateArea ?? null,
      pubicHair: (profile as any)?.pubicHair ?? null,
      intimateStyle: (profile as any)?.intimateStyle ?? null,
      piercings: (profile as any)?.piercings ?? null,
      tattoos: (profile as any)?.tattoos ?? null,
      clothingStyle: profile?.clothingStyle ?? null,
      clothingSize: profile?.clothingSize ?? null,
      dressSize: (profile as any)?.dressSize ?? null,
      shoeSize: (profile as any)?.shoeSize ?? null,
    },
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string; slug: string }> }): Promise<Metadata> {
  const { id } = await params
  const data = await getEscort(id)
  const title = data?.name ? `${data.name} | Escort Profil` : 'Escort Profil'
  const description = data?.slogan || data?.description || undefined
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data?.image ? [data.image] : [],
    },
  }
}

export default async function EscortProfilePage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id, slug } = await params
  const data = await getEscort(id)
  // Redirect to canonical slug if mismatch
  if (data?.name) {
    const expectedSlug = slugify(data.name)
    if (expectedSlug && slug !== expectedSlug) {
      redirect(`/escorts/${id}/${expectedSlug}`)
    }
  }
  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <MinimalistNavigation />
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h1 className="text-xl tracking-widest text-gray-800">PROFIL NICHT GEFUNDEN</h1>
        </div>
        <Footer />
      </div>
    )
  }

  const { id: escortId, name, slogan, city, country, image, description, details, gallery, mediaImages, services, contact, location, socials } = data
  const images = [image, ...mediaImages, ...gallery].filter(Boolean) as string[]
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
    where: { authorId: escortId, isActive: true },
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
      {/* Hero Section */}
      <section className="relative h-screen h-[100svh] md:h-[50vh] md:min-h-[400px]">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image || '/escort.png'}
            alt={(name ?? 'Escort') + ' Hero'}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-thin tracking-wider text-white mb-2">{name ? (name.toUpperCase?.() ?? name) : 'ESCORT'}</h1>
            {(city || country) && (
              <p className="text-sm text-gray-200">{city || country}</p>
            )}
            <div className="w-24 h-px bg-pink-500 mx-auto mt-3" />
          </div>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
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
            {slogan && <p className="text-sm text-gray-600 mt-2 italic">“{slogan}”</p>}

            {/* CTA / Interaktion */}
            <div className="mt-4 flex flex-wrap gap-2">
              <MessageButton toUserId={escortId} toDisplayName={name ?? undefined} toAvatar={image ?? undefined} />
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="px-4 py-2 border border-gray-300 rounded-none text-sm tracking-widest hover:border-pink-500">
                  ANRUFEN
                </a>
              )}
              {contact.website && (
                <a href={contact.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 rounded-none text-sm tracking-widest hover:border-pink-500">
                  WEBSEITE
                </a>
              )}
            </div>
            {socials && Object.keys(socials).length > 0 && (
              <div className="mt-3">
                <div className="text-[10px] tracking-widest text-gray-500 mb-1">SOCIALS</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(socials).map(([rawKey, rawVal]) => {
                    if (!rawVal) return null
                    const key = rawKey.toLowerCase()
                    let href = rawVal
                    if (key === 'whatsapp') {
                      const phone = rawVal.replace(/[^+\d]/g, '')
                      href = `https://wa.me/${phone}`
                    } else if (!/^https?:\/\//i.test(rawVal)) {
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
                    {Object.values(details).some(Boolean) && (
                      <div>
                        <h2 className="text-lg font-light tracking-widest text-gray-800">DETAILS</h2>
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                          {details.height && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">GRÖSSE</div><div className="text-gray-800">{formatHeight(details.height)}</div></div>)}
                          {details.weight && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">GEWICHT</div><div className="text-gray-800">{formatWeight(details.weight)}</div></div>)}
                          {details.bodyType && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">KÖRPERTYP</div><div className="text-gray-800">{toArray(details.bodyType).length > 1 ? <div className="flex flex-wrap gap-2">{badgeElementsDE(details.bodyType)}</div> : formatEnumListDE(details.bodyType)}</div></div>
                          )}
                          {details.hairColor && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">HAARFARBE</div><div className="text-gray-800">{toArray(details.hairColor).length > 1 ? <div className="flex flex-wrap gap-2">{badgeElementsDE(details.hairColor)}</div> : formatEnumListDE(details.hairColor)}</div></div>
                          )}
                          {details.hairLength && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">HAARLÄNGE</div><div className="text-gray-800">{toArray(details.hairLength).length > 1 ? <div className="flex flex-wrap gap-2">{badgeElementsDE(details.hairLength)}</div> : formatEnumListDE(details.hairLength)}</div></div>
                          )}
                          {details.eyeColor && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">AUGENFARBE</div><div className="text-gray-800">{toArray(details.eyeColor).length > 1 ? <div className="flex flex-wrap gap-2">{badgeElementsDE(details.eyeColor)}</div> : formatEnumListDE(details.eyeColor)}</div></div>
                          )}
                          {(details.breastType || details.breastSize || details.cupSize) && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">BRUST</div><div className="text-gray-800"><div className="flex flex-wrap gap-2">{badgeElementsDE([toStr(details.breastSize || details.cupSize) ? (/^[a-z]$/i.test(String(details.breastSize || details.cupSize)) ? String(details.breastSize || details.cupSize).toUpperCase() : String(details.breastSize || details.cupSize)) : null, details.breastType].filter(Boolean))}</div></div></div>
                          )}
                          {(details.intimateArea || details.pubicHair || details.intimateStyle) && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">INTIMBEREICH</div><div className="text-gray-800"><div className="flex flex-wrap gap-2">{badgeElementsDE([ ...toArray(details.intimateArea), ...toArray(details.pubicHair), ...toArray(details.intimateStyle) ])}</div></div></div>
                          )}
                          {(details.piercings !== null && details.piercings !== undefined) && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">PIERCINGS</div><div className="text-gray-800">{typeof details.piercings === 'boolean' ? (details.piercings ? 'Ja' : 'Nein') : toArray(details.piercings).length > 1 ? <div className="flex flex-wrap gap-2">{badgeElementsDE(details.piercings)}</div> : formatEnumListDE(details.piercings)}</div></div>
                          )}
                          {(details.tattoos !== null && details.tattoos !== undefined) && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">TÄTOWIERUNGEN</div><div className="text-gray-800">{typeof details.tattoos === 'boolean' ? (details.tattoos ? 'Ja' : 'Nein') : toArray(details.tattoos).length > 1 ? <div className="flex flex-wrap gap-2">{badgeElementsDE(details.tattoos)}</div> : formatEnumListDE(details.tattoos)}</div></div>
                          )}
                          {details.clothingStyle && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">KLEIDUNGSSTIL</div><div className="text-gray-800">{toArray(details.clothingStyle).length > 1 ? <div className="flex flex-wrap gap-2">{badgeElementsDE(details.clothingStyle)}</div> : formatEnumListDE(details.clothingStyle)}</div></div>
                          )}
                          {(details.clothingSize || details.dressSize) && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">KLEIDERGRÖSSE</div><div className="text-gray-800">{formatEnumListDE(details.clothingSize || details.dressSize)}</div></div>
                          )}
                          {details.shoeSize && (
                            <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">SCHUHGRÖSSE</div><div className="text-gray-800">{formatShoeSize(details.shoeSize)}</div></div>
                          )}
                        </div>
                      </div>
                    )}
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
                content: (
                  <div>
                    <div className="mb-3">
                      <ServiceLegend />
                    </div>
                    {services.length > 0 ? (
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
                    ) : (
                      <div className="text-sm text-gray-500">Keine Services angegeben.</div>
                    )}
                  </div>
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
                        <span className="text-gray-800">{((location?.address || location?.formatted || '').split(',')[0]) || (city || country) || 'Nicht verfügbar'}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] tracking-widest text-gray-500 mr-2">STADT:</span>
                        <span className="text-gray-800">{(location?.zipCode || city) ? `${location?.zipCode ? location.zipCode + ' ' : ''}${city || ''}` : (country || 'Nicht verfügbar')}</span>
                      </div>
                    </div>
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                      <div className="border border-gray-200">
                        <iframe
                          title="Standort"
                          className="w-full h-96"
                          src={
                            location?.placeId
                              ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${location.placeId}`
                              : (location?.latitude && location?.longitude)
                                ? `https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${location.latitude},${location.longitude}&zoom=14&maptype=roadmap`
                                : `https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(location?.formatted || location?.address || `${city || ''} ${country || ''}`)}`
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
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location?.formatted || location?.address || `${city || ''} ${country || ''}`)}`}
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
