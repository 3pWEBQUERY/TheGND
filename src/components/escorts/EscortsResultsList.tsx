"use client"

import React from 'react'
import Link from 'next/link'
import type { EscortItem } from '@/types/escort'
import { BadgeCheck, ShieldCheck, Star } from 'lucide-react'

export type EscortsResultsListProps = {
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

export default function EscortsResultsList({ items, loading, total }: EscortsResultsListProps) {
  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg font-light tracking-widest text-gray-800">ERGEBNISSE (LISTE)</h2>
          {typeof total === 'number' && (
            <span className="text-xs text-gray-500">{total} Treffer</span>
          )}
        </div>

        <div className="divide-y divide-gray-200">
          {loading && !items && (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="py-4 flex gap-4 items-center">
                <div className="h-24 w-18 bg-gray-200 animate-pulse border border-gray-200" />
                <div className="flex-1">
                  <div className="h-4 w-1/3 bg-gray-200 animate-pulse" />
                  <div className="h-3 w-1/4 bg-gray-100 mt-2 animate-pulse" />
                </div>
              </div>
            ))
          )}

          {items?.map((e) => {
            const slug = e.name ? slugify(e.name) : 'escort'
            const href = `/escorts/${e.id}/${slug}`
            const isWeek = Boolean((e as any)?.isEscortOfWeek) || (Array.isArray((e as any)?.badges) && (e as any).badges.includes('ESCORT_OF_WEEK'))
            const isMonth = Boolean((e as any)?.isEscortOfMonth) || (Array.isArray((e as any)?.badges) && (e as any).badges.includes('ESCORT_OF_MONTH'))
            const highlightLabel = isMonth ? 'ESCORT OF THE MONTH' : (isWeek ? 'ESCORT OF THE WEEK' : null)
            return (
              <div key={e.id} className="py-4 flex gap-4 items-center">
                <Link href={href} className="block flex-shrink-0">
                  <div className="h-28 w-20 bg-gray-200 border border-gray-200 overflow-hidden">
                    {e.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={e.image} alt={e.name ?? ''} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gray-300" />
                    )}
                  </div>
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={href} className="block truncate">
                      <h3 className="text-base font-medium tracking-widest text-gray-900 truncate">
                        {(e.name?.toUpperCase?.() ?? e.name) || '—'}
                      </h3>
                    </Link>
                    {e.isVerified && <BadgeCheck className="h-4 w-4 text-pink-500 flex-shrink-0" />}
                    {(e.isAgeVerified || e.isVerified) && <ShieldCheck className="h-4 w-4 text-rose-600 flex-shrink-0" />}
                    {highlightLabel && (
                      <span className={`ml-2 text-[10px] uppercase tracking-widest font-medium ${isMonth ? 'text-amber-600' : 'text-pink-600'}`}>{highlightLabel}</span>
                    )}
                  </div>
                  {(e.city || e.country || e.locationFormatted) && (
                    <div className="mt-1 text-sm text-gray-700 truncate">{e.locationFormatted || e.city || e.country}</div>
                  )}
                </div>
              </div>
            )
          })}

          {!loading && items?.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-10">
              Keine Ergebnisse gefunden. Passe deine Suche an.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
