import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Globe, Phone, Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react'
import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import MessageButton from '@/components/MessageButton'
import GalleryGrid from '@/components/GalleryGrid'
import Tabs from '@/components/Tabs'

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
  const phone = user.profile.phone || null
  const website = user.profile.website || null
  // Fetch recent posts for FEED tab
  const rawPosts = await prisma.post.findMany({
    where: { authorId: user.id, isActive: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  const posts = rawPosts.map((p) => {
    let imgs: string[] = []
    try {
      if (p.images) {
        const arr = JSON.parse(p.images)
        if (Array.isArray(arr)) imgs = arr.filter((x: any) => typeof x === 'string')
      }
    } catch {}
    return { id: p.id, content: p.content, images: imgs, createdAt: p.createdAt }
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
                        <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">UNTERNEHMEN</div><div className="text-gray-800">{user.profile.businessType}</div></div>
                      )}
                      {user.profile.address && (
                        <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">ADRESSE</div><div className="text-gray-800">{user.profile.address}</div></div>
                      )}
                      {(city || country) && (
                        <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">ORT</div><div className="text-gray-800">{city || country}</div></div>
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
                        <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{description}</p>
                      </div>
                    )}
                    {Object.keys(socials).length > 0 && (
                      <div className="mt-8">
                        <h2 className="text-lg font-light tracking-widest text-gray-800">SOCIALS</h2>
                        <ul className="mt-4 text-sm text-gray-700 space-y-2">
                          {Object.entries(socials).map(([key, value]) => (
                            value ? (
                              <li key={key} className="flex items-center gap-2">
                                {key.toLowerCase() === 'instagram' && <Instagram className="h-4 w-4 text-gray-400" />}
                                {key.toLowerCase() === 'facebook' && <Facebook className="h-4 w-4 text-gray-400" />}
                                {(key.toLowerCase() === 'twitter' || key.toLowerCase() === 'x') && <Twitter className="h-4 w-4 text-gray-400" />}
                                {key.toLowerCase() === 'youtube' && <Youtube className="h-4 w-4 text-gray-400" />}
                                {key.toLowerCase() === 'linkedin' && <Linkedin className="h-4 w-4 text-gray-400" />}
                                <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{value}</a>
                              </li>
                            ) : null
                          ))}
                        </ul>
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
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (<span key={s} className="px-2 py-1 text-xs border border-gray-300 text-gray-700">{s}</span>))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Keine Services angegeben.</div>
                ),
              },
              {
                id: 'feed',
                label: 'Feed',
                content: posts.length > 0 ? (
                  <div className="space-y-6">
                    {posts.map((p) => (
                      <div key={p.id} className="border border-gray-200 p-4">
                        <p className="text-sm text-gray-800 whitespace-pre-line">{p.content}</p>
                        {p.images?.length > 0 && (
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {p.images.map((src: string, idx: number) => (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img key={idx} src={src} alt={`Post Bild ${idx + 1}`} className="w-full h-32 object-cover" />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Noch keine Beiträge.</div>
                ),
              },
              {
                id: 'standort',
                label: 'Standort',
                content: (
                  <div>
                    <div className="text-sm text-gray-700 mb-2">
                      {location.formatted || location.address || city || country || 'Adresse nicht verfügbar.'}
                    </div>
                    {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                      <div className="border border-gray-200">
                        <iframe
                          title="Standort"
                          className="w-full h-64"
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
