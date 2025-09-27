"use client"

import Image from 'next/image'
import Link from 'next/link'

export type RentalItem = {
  id: string
  title: string
  shortDesc: string
  description?: string
  category: 'APARTMENT' | 'ROOM' | 'STUDIO' | 'EVENT_SPACE'
  city?: string | null
  country?: string | null
  media?: string[]
  priceInfo?: string | null
  createdAt?: string
  postedBy?: { id: string; userType: string; displayName: string | null; avatar: string | null; companyName: string | null }
}

export default function RentalsListItem({ rental }: { rental: RentalItem }) {
  const cover = (rental.media && rental.media[0]) || rental.postedBy?.avatar || null
  const location = [rental.city || '', rental.country || ''].filter(Boolean).join(', ')
  const company = rental.postedBy?.companyName || rental.postedBy?.displayName || ''
  const catLabel = (
    rental.category === 'APARTMENT' ? 'Apartment' :
    rental.category === 'ROOM' ? 'Zimmer' :
    rental.category === 'STUDIO' ? 'Studio' : 'Eventfläche'
  )

  return (
    <div className="w-full border border-gray-200 bg-white hover:shadow-sm transition-shadow">
      <div className="grid grid-cols-[120px_1fr_140px] md:grid-cols-[180px_1fr_160px]">
        <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
          {cover ? (
            <Image src={cover} alt={rental.title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">KEIN BILD</div>
          )}
        </div>

        <div className="p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-thin tracking-wider text-gray-900 truncate">{rental.title}</h3>
            {rental.createdAt && <div className="text-xs text-gray-500 whitespace-nowrap">{new Date(rental.createdAt).toLocaleDateString('de-DE')}</div>}
          </div>
          <p className="mt-2 text-sm text-gray-700 line-clamp-2">{rental.shortDesc}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-widest text-gray-600">
            <span className="px-2 py-1 border border-gray-300">{catLabel}</span>
            {location && <span className="px-2 py-1 border border-gray-300">{location}</span>}
            {company && <span className="px-2 py-1 border border-gray-300">{company}</span>}
            {rental.priceInfo && <span className="px-2 py-1 border border-gray-300">{rental.priceInfo}</span>}
          </div>
        </div>

        <div className="p-4 md:p-6 flex flex-col items-stretch justify-center gap-2 border-l border-gray-100">
          <Link href={`/mieten/${rental.id}`} className="px-3 py-2 text-xs uppercase tracking-widest text-center bg-pink-500 hover:bg-pink-600 text-white">Details</Link>
          {rental.postedBy?.id ? (
            <Link href={`/dashboard?tab=messages&to=${encodeURIComponent(rental.postedBy.id)}${rental.postedBy.displayName ? `&toName=${encodeURIComponent(rental.postedBy.displayName)}` : ''}${rental.postedBy.avatar ? `&toAvatar=${encodeURIComponent(rental.postedBy.avatar)}` : ''}`} className="px-3 py-2 text-xs uppercase tracking-widest text-center border border-gray-300 hover:border-pink-500 hover:text-pink-600">Kontakt</Link>
          ) : (
            <button disabled className="px-3 py-2 text-xs uppercase tracking-widest border border-gray-200 text-gray-400">Kontakt</button>
          )}
        </div>
      </div>
    </div>
  )
}
