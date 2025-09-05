import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { Globe, Phone, Instagram, Facebook, Twitter, Youtube, Linkedin } from 'lucide-react'
import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'

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

export default async function AgencyDetailPage({ params }: { params: Promise<{ id: string; slug: string }> }) {
  const { id } = await params
  const user = await prisma.user.findFirst({
    where: { id, userType: 'AGENCY', isActive: true },
    include: { profile: true },
  })

  if (!user || !user.profile) return notFound()

  const name = user.profile.companyName || user.profile.displayName || 'Agentur'
  const city = user.profile.city || null
  const country = user.profile.country || null
  const image = getPrimaryImage(user.profile)
  const description = user.profile.description || null
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

      <section className="relative h-[40vh] min-h-[320px]">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {image ? (
            <img src={image} alt={name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 h-full flex items-end">
          <div className="max-w-7xl mx-auto w-full px-6 pb-8">
            <h1 className="text-3xl md:text-4xl font-thin tracking-wider text-white">{name}</h1>
            {(city || country) && (
              <p className="text-sm text-white/80 mt-2">{city || country}</p>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="md:col-span-2">
          <h2 className="text-lg font-light tracking-widest text-gray-800 mb-4">ÜBER</h2>
          {description ? (
            <p className="text-sm leading-7 text-gray-700 whitespace-pre-line">{description}</p>
          ) : (
            <p className="text-sm text-gray-500">Keine Beschreibung vorhanden.</p>
          )}
          {services.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-light tracking-widest text-gray-800 mb-3">LEISTUNGEN</h3>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => (
                  <span key={s} className="px-2 py-1 text-xs border border-gray-300 text-gray-700">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <aside className="md:col-span-1">
          <div className="border border-gray-200 p-4">
            <h3 className="text-xs tracking-widest text-gray-600 mb-3">DETAILS</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                <span className="text-gray-500">Name:</span> {name}
              </li>
              {(city || country) && (
                <li>
                  <span className="text-gray-500">Ort:</span> {city || country}
                </li>
              )}
              {phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${phone}`} className="hover:underline">{phone}</a>
                </li>
              )}
              {website && (
                <li className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <a href={website.startsWith('http') ? website : `https://${website}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    {website}
                  </a>
                </li>
              )}
            </ul>
          </div>
          {Object.keys(socials).length > 0 && (
            <div className="border border-gray-200 p-4 mt-4">
              <h3 className="text-xs tracking-widest text-gray-600 mb-3">SOCIALS</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                {Object.entries(socials).map(([key, value]) => (
                  value ? (
                    <li key={key} className="flex items-center gap-2">
                      {key.toLowerCase() === 'instagram' && <Instagram className="h-4 w-4 text-gray-400" />}
                      {key.toLowerCase() === 'facebook' && <Facebook className="h-4 w-4 text-gray-400" />}
                      {(key.toLowerCase() === 'twitter' || key.toLowerCase() === 'x') && <Twitter className="h-4 w-4 text-gray-400" />}
                      {key.toLowerCase() === 'youtube' && <Youtube className="h-4 w-4 text-gray-400" />}
                      {key.toLowerCase() === 'linkedin' && <Linkedin className="h-4 w-4 text-gray-400" />}
                      <a
                        href={value.startsWith('http') ? value : `https://${value}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {value}
                      </a>
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
          )}
        </aside>
      </main>

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
  return {
    title,
    description,
    alternates: { canonical: `https://thegnd.com/agency/${id}/${slug}` },
    openGraph: {
      title,
      description,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
