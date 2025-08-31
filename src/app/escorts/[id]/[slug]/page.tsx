import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

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
    contact: {
      phone: profile?.phone ?? null,
      website: profile?.website ?? null,
    },
    details: {
      height: profile?.height ?? null,
      weight: profile?.weight ?? null,
      hairColor: profile?.hairColor ?? null,
      hairLength: profile?.hairLength ?? null,
      eyeColor: profile?.eyeColor ?? null,
      breastType: profile?.breastType ?? null,
      breastSize: profile?.breastSize ?? null,
      clothingStyle: profile?.clothingStyle ?? null,
      clothingSize: profile?.clothingSize ?? null,
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

  const { name, slogan, city, country, image, description, details, gallery, mediaImages, contact } = data
  const images = [image, ...mediaImages, ...gallery].filter(Boolean) as string[]

  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
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
            {(contact.phone || contact.website) && (
              <div className="mt-4 flex flex-wrap gap-2">
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
            )}
          </div>
        </div>

        {/* Details */}
        {Object.values(details).some(Boolean) && (
          <div className="mt-8">
            <h2 className="text-lg font-light tracking-widest text-gray-800">DETAILS</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {details.height && (
                <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">GRÖSSE</div><div className="text-gray-800">{details.height}</div></div>
              )}
              {details.weight && (
                <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">GEWICHT</div><div className="text-gray-800">{details.weight}</div></div>
              )}
              {details.hairColor && (
                <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">HAARFARBE</div><div className="text-gray-800">{details.hairColor}</div></div>
              )}
              {details.hairLength && (
                <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">HAARLÄNGE</div><div className="text-gray-800">{details.hairLength}</div></div>
              )}
              {details.eyeColor && (
                <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">AUGENFARBE</div><div className="text-gray-800">{details.eyeColor}</div></div>
              )}
              {details.breastType && (
                <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">BRUSTTYP</div><div className="text-gray-800">{details.breastType}</div></div>
              )}
              {details.breastSize && (
                <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">BRUSTGRÖSSE</div><div className="text-gray-800">{details.breastSize}</div></div>
              )}
              {details.clothingStyle && (
                <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">KLEIDUNGSSTIL</div><div className="text-gray-800">{details.clothingStyle}</div></div>
              )}
              {details.clothingSize && (
                <div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">KLEIDERGRÖSSE</div><div className="text-gray-800">{details.clothingSize}</div></div>
              )}
            </div>
          </div>
        )}

        {/* Beschreibung */}
        {description && (
          <div className="mt-8">
            <h2 className="text-lg font-light tracking-widest text-gray-800">BESCHREIBUNG</h2>
            <p className="text-sm text-gray-700 mt-3 whitespace-pre-line">{description}</p>
          </div>
        )}

        {/* Galerie */}
        {images.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-light tracking-widest text-gray-800">GALERIE</h2>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
              {images.map((src, i) => (
                <div key={`${src}-${i}`} className="aspect-[3/4] bg-gray-200 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={name ?? ''} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
