import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import Tabs from '@/components/Tabs'
import ProfileFeed from '@/components/ProfileFeed'
import TranslatableDescription from '@/components/TranslatableDescription'
import ServiceTag from '@/components/ServiceTag'
import ServiceLegend from '@/components/ServiceLegend'
import RatingDonut from '@/components/RatingDonut'
import MessageButton from '@/components/MessageButton'
import ProfileComments from '@/components/ProfileComments'
import OnlineBadge from '@/components/OnlineBadge'
import VerifiedBadges from '@/components/VerifiedBadges'
import MobileBottomBar from '@/components/MobileBottomBar'
import { SERVICES_DE } from '@/data/services.de'
import React from 'react'

function toStr(v: any) { return (v === null || v === undefined) ? '' : String(v).trim() }
function withUnit(v: any, unit: string) { const s = toStr(v); if (!s) return ''; const low = s.toLowerCase(); if (low.includes(unit.toLowerCase())) return s; if (/^\d+(?:[\.,]\d+)?$/.test(s)) return `${s.replace(',', '.') } ${unit}`; return s }
const formatHeight = (v: any) => withUnit(v, 'cm')
const formatWeight = (v: any) => withUnit(v, 'kg')
const parseJsonish = (s: string): any => { try { const t = s.trim(); if ((t.startsWith('[') && t.endsWith(']')) || (t.startsWith('{') && t.endsWith('}')) || (t.startsWith('"') && t.endsWith('"'))) { return JSON.parse(t) } } catch {} return s }
const toArray = (v: any): any[] => { if (v === null || v === undefined) return []; if (Array.isArray(v)) return v; if (typeof v === 'string') { const parsed = parseJsonish(v); if (Array.isArray(parsed)) return parsed; const s = toStr(parsed); if (!s) return []; if (s.includes(',')) return s.split(',').map((x) => x.trim()).filter(Boolean); return [s] } return [v] }

export default function AltEscortViewFullSide(props: {
  data: any,
  images: string[],
  postsForFeed: any[],
  ratingAvg: number,
  ratingCount: number,
  dist: Record<number, number>,
  distTotal: number,
  hasApprovedVerification: boolean,
  similarItems?: Array<{ id: string; name: string | null; city: string | null; country: string | null; image: string | null; isVerified?: boolean; isAgeVerified?: boolean }>,
}) {
  const { data, images, postsForFeed, ratingAvg, ratingCount, dist, distTotal, hasApprovedVerification } = props
  const { id: escortId, name, slogan, city, country, image, description, details, services, contact, location } = data
  const isOnline = !!data?.isOnline
  const heroImage = ((data as any)?.heroPrefs?.imageUrl as string | null) || image

  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />

      {/* Full-side layout */}
      <section className="relative">
        <div className="max-w-[1400px] mx-auto px-0 md:px-6 py-4 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-6 items-start">
            {/* Left: Tall image (fills viewport height on desktop) */}
            <div className="relative bg-black">
              <div className="h-[70vh] min-h-[480px] lg:h-[calc(100vh-140px)] w-full relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={heroImage || '/escort.png'} alt={(name ?? 'Escort') + ' Hero'} className="absolute inset-0 w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <OnlineBadge userId={escortId} initialOnline={isOnline} className="absolute top-3 right-3" />
                {/* Bottom overlay: basic stats */}
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 text-white">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl md:text-3xl font-light tracking-widest">{name ? (name.toUpperCase?.() ?? name) : 'ESCORT'}</h1>
                    {hasApprovedVerification && (<VerifiedBadges />)}
                  </div>
                  {(city || country) && (<div className="text-sm/relaxed text-white/90">{city || country}</div>)}
                  {slogan && <div className="text-sm/relaxed text-white/90 italic mt-1">“{slogan}”</div>}
                </div>
              </div>
            </div>

            {/* Right: Details panel */}
            <div className="bg-white border border-gray-200 p-6 lg:p-8 h-full">
              {/* Header badges */}
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-2 py-0.5 border text-[10px] uppercase tracking-widest ${((data as any)?.available ? 'border-emerald-300 text-emerald-700' : 'border-rose-300 text-rose-700')}`}>
                  {((data as any)?.available ? 'VERFÜGBAR' : 'NICHT VERFÜGBAR')}
                </span>
                {ratingCount > 0 && (
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <RatingDonut value={ratingAvg} size={28} strokeWidth={5} showValue={false} />
                    <div>{ratingAvg.toFixed(1)} / 5 <span className="text-gray-500">({ratingCount})</span></div>
                  </div>
                )}
              </div>

              {/* Contact actions */}
              <div className="mt-3 flex flex-wrap gap-2">
                <MessageButton toUserId={escortId} toDisplayName={name ?? undefined} toAvatar={image ?? undefined} />
                {contact?.phone && (<a href={`tel:${contact.phone}`} className="px-4 py-2 border border-gray-300 rounded-none text-sm tracking-widest hover:border-pink-500">ANRUFEN</a>)}
                {contact?.website && (<a href={contact.website} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 rounded-none text-sm tracking-widest hover:border-pink-500">WEBSEITE</a>)}
              </div>

              {/* Tabs */}
              <div className="mt-6">
                <Tabs
                  tabs={[
                    {
                      id: 'details',
                      label: 'Details & Beschreibung',
                      content: (
                        <div>
                          {Object.values(details).some(Boolean) && (
                            <div>
                              <h3 className="text-base font-light tracking-widest text-gray-800">DETAILS</h3>
                              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                {details.height && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">GRÖSSE</div><div className="text-gray-800">{formatHeight(details.height)}</div></div>)}
                                {details.weight && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">GEWICHT</div><div className="text-gray-800">{formatWeight(details.weight)}</div></div>)}
                                {details.bodyType && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">KÖRPERTYP</div><div className="text-gray-800">{toArray(details.bodyType).join(', ')}</div></div>)}
                                {details.hairColor && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">HAARFARBE</div><div className="text-gray-800">{toArray(details.hairColor).join(', ')}</div></div>)}
                                {details.hairLength && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">HAARLÄNGE</div><div className="text-gray-800">{toArray(details.hairLength).join(', ')}</div></div>)}
                                {details.eyeColor && (<div className="text-sm"><div className="text-[10px] tracking-widest text-gray-500">AUGENFARBE</div><div className="text-gray-800">{toArray(details.eyeColor).join(', ')}</div></div>)}
                              </div>
                            </div>
                          )}
                          {description && (
                            <div className="mt-8">
                              <h3 className="text-base font-light tracking-widest text-gray-800">BESCHREIBUNG</h3>
                              <TranslatableDescription text={description} limit={600} className="text-sm text-gray-700 mt-3 leading-relaxed" buttonClassName="mt-3 text-xs font-light tracking-widest uppercase text-pink-500 hover:text-pink-600" />
                            </div>
                          )}
                        </div>
                      )
                    },
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
                      )
                    },
                    { id: 'feed', label: 'Feed', content: <ProfileFeed posts={postsForFeed} /> },
                    { id: 'kommentare', label: 'Kommentare', content: <ProfileComments targetUserId={escortId} /> },
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
                      )
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <MobileBottomBar
        name={name}
        locationText={city || country}
        ratingAvg={ratingAvg}
        ratingCount={ratingCount}
        phone={contact?.phone || null}
        escortId={escortId}
        avatar={image || null}
        commentsAnchor="kommentare"
      />
      <Footer />
    </div>
  )
}
