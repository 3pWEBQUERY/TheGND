import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import GalleryGrid from '@/components/GalleryGrid'
import Tabs from '@/components/Tabs'
import ProfileFeed from '@/components/ProfileFeed'
import ExpandableText from '@/components/ExpandableText'
import ServiceTag from '@/components/ServiceTag'
import ServiceLegend from '@/components/ServiceLegend'
import RatingDonut from '@/components/RatingDonut'
import MessageButton from '@/components/MessageButton'
import ProfileComments from '@/components/ProfileComments'
import { SERVICES_DE } from '@/data/services.de'
import { ShieldCheck, BadgeCheck } from 'lucide-react'
import React from 'react'

function toStr(v: any) { return (v === null || v === undefined) ? '' : String(v).trim() }
function withUnit(v: any, unit: string) { const s = toStr(v); if (!s) return ''; const low = s.toLowerCase(); if (low.includes(unit.toLowerCase())) return s; if (/^\d+(?:[\.,]\d+)?$/.test(s)) return `${s.replace(',', '.')} ${unit}`; return s }
const formatHeight = (v: any) => withUnit(v, 'cm')
const formatWeight = (v: any) => withUnit(v, 'kg')
const formatShoeSize = (v: any) => withUnit(v, 'EU')
const parseJsonish = (s: string): any => { try { const t = s.trim(); if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}')) || (t.startsWith('"') && t.endsWith('"'))) { return JSON.parse(t) } } catch {} return s }
const toArray = (v: any): any[] => { if (v === null || v === undefined) return []; if (Array.isArray(v)) return v; if (typeof v === 'string') { const parsed = parseJsonish(v); if (Array.isArray(parsed)) return parsed; const s = toStr(parsed); if (!s) return []; if (s.includes(',')) return s.split(',').map((x) => x.trim()).filter(Boolean); return [s] } return [v] }
const capitalizeWords = (s: string) => s.replace(/\b\w/g, (c: string) => c.toUpperCase())
const translateTokenDE = (token: string): string => { const t = token.toLowerCase().replace(/[_\-\s]+/g, ''); const map: Record<string, string> = { slim: 'Schlank', petite: 'Zierlich', athletic: 'Athletisch', fit: 'Fit', average: 'Durchschnittlich', curvy: 'Kurvig', bbw: 'Mollig', blonde: 'Blond', blond: 'Blond', brunette: 'Brünett', brown: 'Braun', black: 'Schwarz', red: 'Rot', auburn: 'Kupfer', chestnut: 'Kastanienbraun', darkbrown: 'Dunkelbraun', lightbrown: 'Hellbraun', grey: 'Grau', gray: 'Grau', silver: 'Silber', dyed: 'Gefärbt', highlights: 'Strähnen', short: 'Kurz', medium: 'Mittel', shoulderlength: 'Schulterlang', long: 'Lang', verylong: 'Sehr lang', bob: 'Bob', blue: 'Blau', green: 'Grün', hazel: 'Hasel', amber: 'Bernstein', natural: 'Natürlich', implants: 'Implantat', implant: 'Implantat', enhanced: 'Vergrößert', shaved: 'Rasiert', fullyshaved: 'Komplett rasiert', partiallyshaved: 'Teilrasiert', trimmed: 'Getrimmt', naturalhair: 'Natürlich', landingstrip: 'Landing Strip', brazilian: 'Brasilianisch', waxed: 'Gewaxt', ears: 'Ohren', navel: 'Bauchnabel', nipples: 'Brustwarzen', tongue: 'Zunge', nose: 'Nase', lip: 'Lippe', eyebrow: 'Augenbraue', intimate: 'Intim', arms: 'Arme', legs: 'Beine', back: 'Rücken', chest: 'Brust', neck: 'Nacken', shoulder: 'Schulter', small: 'Klein', large: 'Groß', elegant: 'Elegant', casual: 'Lässig', sexy: 'Sexy', business: 'Business', sporty: 'Sportlich', chic: 'Chic', street: 'Streetwear', classic: 'Klassisch' }; return map[t] || capitalizeWords(token.replace(/[_-]+/g, ' ').toLowerCase()) }
const formatEnumListDE = (v: any): string => toArray(v).map((x) => translateTokenDE(String(x))).filter(Boolean).join(', ')
const badgeElementsDE = (v: any) => { const arr = toArray(v); return arr.map((x: any, i: number) => (<span key={`${String(x)}-${i}`} className="inline-flex items-center px-2.5 py-1 border border-gray-200 bg-gray-50 text-gray-700 text-xs rounded-none">{translateTokenDE(String(x))}</span>)) }

export default function AltEscortViewTwo(props: {
  data: any,
  images: string[],
  postsForFeed: any[],
  ratingAvg: number,
  ratingCount: number,
  dist: Record<number, number>,
  distTotal: number,
  hasApprovedVerification: boolean,
}) {
  const { data, images, postsForFeed, ratingAvg, ratingCount, dist, distTotal, hasApprovedVerification } = props
  const { id: escortId, name, slogan, city, country, image, description, details, services, contact, location } = data

  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />

      {/* Wide Hero with Info Overlap */}
      <section className="relative">
        <div className="h-80 md:h-96 relative">
          <img src={image || '/escort.png'} alt={(name ?? 'Escort') + ' Hero'} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        <div className="max-w-6xl mx-auto px-6 -mt-16 relative z-10">
          <div className="bg-white border border-gray-200 p-6 md:p-8 flex flex-col md:flex-row gap-6">
            <div className="w-32 h-40 bg-gray-100 overflow-hidden">
              <img src={image || '/escort.png'} alt={name ?? ''} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-light tracking-widest text-gray-900">{name ? (name.toUpperCase?.() ?? name) : 'ESCORT'}</h1>
                {hasApprovedVerification && (
                  <>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-widest border bg-rose-50 text-rose-700 border-rose-200"><ShieldCheck className="h-3.5 w-3.5" /> ALTERSVERIFIZIERT</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-widest border bg-emerald-50 text-emerald-700 border-emerald-200"><BadgeCheck className="h-3.5 w-3.5" /> VERIFIZIERT</span>
                  </>
                )}
              </div>
              {(city || country) && (<p className="text-sm text-gray-500 mt-1">{city || country}</p>)}
              {slogan && <p className="text-sm text-gray-600 mt-2 italic">“{slogan}”</p>}
              <div className="mt-3 flex flex-wrap gap-2">
                <MessageButton toUserId={escortId} toDisplayName={name ?? undefined} toAvatar={image ?? undefined} />
                {contact.phone && (<a href={`tel:${contact.phone}`} className="px-4 py-2 border border-gray-300 rounded-none text-sm tracking-widest hover:border-pink-500">ANRUFEN</a>)}
                {contact.website && (<a href={contact.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 rounded-none text-sm tracking-widest hover:border-pink-500">WEBSEITE</a>)}
              </div>
              {ratingCount > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <RatingDonut value={ratingAvg} size={32} strokeWidth={6} showValue={false} />
                  <div className="text-xs text-gray-700">{ratingAvg.toFixed(1)} / 5 <span className="text-gray-500">({ratingCount})</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Details & Description first */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-light tracking-widest text-gray-800">DETAILS & BESCHREIBUNG</h2>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {Object.values(details).some(Boolean) ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {details.height && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">GRÖSSE</div><div className="text-gray-800">{formatHeight(details.height)}</div></div>)}
                  {details.weight && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">GEWICHT</div><div className="text-gray-800">{formatWeight(details.weight)}</div></div>)}
                  {details.bodyType && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">KÖRPERTYP</div><div className="text-gray-800">{formatEnumListDE(details.bodyType)}</div></div>)}
                  {details.hairColor && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">HAARFARBE</div><div className="text-gray-800">{formatEnumListDE(details.hairColor)}</div></div>)}
                  {details.hairLength && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">HAARLÄNGE</div><div className="text-gray-800">{formatEnumListDE(details.hairLength)}</div></div>)}
                  {details.eyeColor && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">AUGENFARBE</div><div className="text-gray-800">{formatEnumListDE(details.eyeColor)}</div></div>)}
                </div>
              ) : (
                <div className="text-sm text-gray-500">Keine Details vorhanden.</div>
              )}
            </div>
            <div>
              {description ? (
                <ExpandableText text={description} limit={600} className="text-sm text-gray-700 leading-relaxed" buttonClassName="mt-3 text-xs font-light tracking-widest uppercase text-pink-500 hover:text-pink-600" />
              ) : (
                <div className="text-sm text-gray-500">Keine Beschreibung vorhanden.</div>
              )}
            </div>
          </div>
        </div>

        {/* Gallery */}
        <div className="bg-white border border-gray-200 p-6">
          <h2 className="text-lg font-light tracking-widest text-gray-800">GALERIE</h2>
          <div className="mt-4">
            {images.length > 0 ? (
              <GalleryGrid images={images} altBase={name ?? ''} className="mt-2" />
            ) : (
              <div className="text-sm text-gray-500">Keine Bilder vorhanden.</div>
            )}
          </div>
        </div>

        {/* Services / Feed / Kommentare / Standort via Tabs */}
        <div className="bg-white border border-gray-200 p-6">
          <Tabs
            tabs={[
              {
                id: 'services',
                label: 'Services',
                content: (
                  <div>
                    <div className="mb-3"><ServiceLegend /></div>
                    {services.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {services.map((s: string) => {
                          const found = SERVICES_DE.find((o) => o.value === s)
                          const label = found?.label || s.replace(/[-_]/g, ' ').replace(/\s+/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
                          return <ServiceTag key={s} value={s} label={label} />
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Keine Services angegeben.</div>
                    )}
                  </div>
                ),
              },
              { id: 'feed', label: 'Feed', content: <ProfileFeed posts={postsForFeed} /> },
              { id: 'kommentare', label: 'Kommentare', content: <ProfileComments targetUserId={escortId} /> },
            ]}
          />
        </div>

        {/* Location */}
        {location && (
          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-lg font-light tracking-widest text-gray-800">STANDORT</h2>
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
                <iframe title="Standort" className="w-full h-96" src={
                  location?.placeId
                    ? `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=place_id:${location.placeId}`
                    : (location?.latitude && location?.longitude)
                      ? `https://www.google.com/maps/embed/v1/view?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&center=${location.latitude},${location.longitude}&zoom=14&maptype=roadmap`
                      : `https://www.google.com/maps/embed/v1/search?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(location?.formatted || location?.address || `${city || ''} ${country || ''}`)}`
                } allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
            ) : (
              <div className="text-sm text-amber-600">Google Maps API Key fehlt. Bitte setze NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.</div>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
