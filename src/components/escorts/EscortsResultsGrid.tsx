import React from 'react'
import Link from 'next/link'
import type { EscortItem } from '@/types/escort'
import { ShieldCheck, BadgeCheck } from 'lucide-react'

type Props = {
  items: EscortItem[] | null
  loading: boolean
  total: number | null
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export default function EscortsResultsGrid({ items, loading, total }: Props) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-lg font-light tracking-widest text-gray-800">ERGEBNISSE</h2>
          {typeof total === 'number' && (
            <span className="text-xs text-gray-500">{total} Treffer</span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {loading && !items &&
            Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="group">
                <div className="aspect-[3/4] bg-gray-200 animate-pulse" />
                <div className="h-3 w-3/4 bg-gray-200 mt-2 animate-pulse" />
                <div className="h-2 w-1/2 bg-gray-100 mt-1 animate-pulse" />
              </div>
            ))}

          {items?.map((e) => {
            const slug = e.name ? slugify(e.name) : 'escort'
            const href = `/escorts/${e.id}/${slug}`
            const isWeek = Boolean((e as any)?.isEscortOfWeek) || (Array.isArray((e as any)?.badges) && (e as any).badges.includes('ESCORT_OF_WEEK'))
            const isMonth = Boolean((e as any)?.isEscortOfMonth) || (Array.isArray((e as any)?.badges) && (e as any).badges.includes('ESCORT_OF_MONTH'))
            const highlight = isMonth ? 'month' : (isWeek ? 'week' : null)
            const frameClasses = highlight
              ? (isMonth
                  ? 'ring-2 ring-amber-400 shadow-lg shadow-amber-200/60'
                  : 'ring-2 ring-pink-400 shadow-lg shadow-pink-200/60')
              : ''
            return (
            <Link href={href} key={e.id} className="group cursor-pointer block">
              <div className={`aspect-[3/4] bg-gray-200 relative overflow-hidden mb-3 ${frameClasses}`}>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {highlight && (
                  <div className={`absolute inset-0 pointer-events-none ${isMonth ? 'bg-gradient-to-b from-amber-100/10 via-transparent to-amber-200/10' : 'bg-gradient-to-b from-pink-100/10 via-transparent to-pink-200/10'}`}></div>
                )}
                {e.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={e.image} alt={e.name ?? ''} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gray-300" />
                )}
                {/* Bottom-left ribbon for highlight */}
                {highlight && (
                  <div className="absolute bottom-2 left-2 z-10 flex items-center gap-2">
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-widest font-medium ${isMonth ? 'bg-amber-400 text-amber-900' : 'bg-pink-500 text-white'}`}>
                      {isMonth ? 'ESCORT OF THE MONTH' : 'ESCORT OF THE WEEK'}
                    </span>
                  </div>
                )}
                {/* Icon-only badges top-right */}
                {(e.isVerified || e.isAgeVerified) && (
                  <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
                    {e.isVerified && (
                      <span title="Verifiziert" className="inline-flex items-center justify-center h-6 w-6 bg-white/90 border border-emerald-200 text-emerald-700">
                        <BadgeCheck className="h-4 w-4" />
                      </span>
                    )}
                    {(e.isAgeVerified || e.isVerified) && (
                      <span title="Altersverifiziert" className="inline-flex items-center justify-center h-6 w-6 bg-white/90 border border-rose-200 text-rose-700">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="text-center">
                {e.name && (
                  <h3 className="text-sm font-light tracking-widest text-gray-800">{e.name.toUpperCase?.() ?? e.name}</h3>
                )}
                {(e.city || e.country) && (
                  <p className="text-xs text-gray-500 mt-1">{e.city || e.country}</p>
                )}
              </div>
            </Link>
            )
          })}

          {!loading && items?.length === 0 && (
            <div className="col-span-full text-center text-sm text-gray-500 py-10">
              Keine Ergebnisse gefunden. Passe deine Suche an.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
