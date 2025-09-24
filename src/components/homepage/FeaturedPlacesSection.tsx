"use client"

import Link from "next/link"
import Tabs from "@/components/Tabs"

const FEATURED: { key: string; label: string; cities: string[] }[] = [
  {
    key: "CH",
    label: "Schweiz",
    cities: [
      "Zürich",
      "Genf",
      "Basel",
      "Bern",
      "Lausanne",
      "Luzern",
      "St. Gallen",
      "Winterthur",
      "Zug",
      "Biel/Bienne",
      "Thun",
      "Lugano",
    ],
  },
  {
    key: "AT",
    label: "Österreich",
    cities: [
      "Wien",
      "Graz",
      "Linz",
      "Salzburg",
      "Innsbruck",
      "Klagenfurt",
      "Villach",
      "Wels",
      "Sankt Pölten",
      "Dornbirn",
    ],
  },
  {
    key: "DE",
    label: "Deutschland",
    cities: [
      "Berlin",
      "Hamburg",
      "München",
      "Köln",
      "Frankfurt",
      "Stuttgart",
      "Düsseldorf",
      "Leipzig",
      "Hannover",
      "Dresden",
      "Nürnberg",
      "Bremen",
    ],
  },
]

// Cities that should always render as wide cards (minimum width)
const WIDE_CITIES = new Set<string>(["Zug", "Biel/Bienne", "Thun", "St. Gallen"]) // CH specific

// Bento patterns: [colSpan, rowSpan] for md (6 cols) and lg (12 cols)
const PATTERN_MD: Array<[number, number]> = [
  [6, 2], // 0 large
  [3, 1], // 1
  [3, 1], // 2
  [6, 1], // 3
  [3, 1], // 4
  [3, 1], // 5
  [3, 1], // 6
  [6, 2], // 7 banner
  [3, 1], // 8
  [3, 1], // 9
  [3, 1], // 10
  [3, 1], // 11
]

const PATTERN_LG: Array<[number, number]> = [
  [6, 2], // 0 large left
  [3, 1], // 1 top right
  [3, 1], // 2 top right
  [6, 1], // 3
  [4, 1], // 4
  [4, 1], // 5
  [4, 1], // 6
  [12, 2], // 7 full banner
  [6, 1], // 8
  [3, 1], // 9
  [3, 1], // 10
  [6, 1], // 11
]

function CityCard({ name, index }: { name: string; index: number }) {
  // Deterministic bento spans to emulate the reference mosaic
  const [mdColsBase, mdRows] = PATTERN_MD[index % PATTERN_MD.length]
  const [lgColsBase, lgRows] = PATTERN_LG[index % PATTERN_LG.length]

  // Ensure certain cities are at least wide enough to align together
  const isWide = WIDE_CITIES.has(name)
  const mdCols = isWide ? Math.max(mdColsBase, 3) : mdColsBase
  const lgCols = isWide ? Math.max(lgColsBase, 4) : lgColsBase

  // Map numeric spans to static class names so Tailwind can see them
  const mdColClass = mdCols === 6
    ? 'md:col-span-6'
    : mdCols === 4
    ? 'md:col-span-4'
    : mdCols === 3
    ? 'md:col-span-3'
    : 'md:col-span-2'
  const mdRowClass = mdRows === 2 ? 'md:row-span-2' : 'md:row-span-1'
  const lgColClass = lgCols === 12
    ? 'lg:col-span-12'
    : lgCols === 6
    ? 'lg:col-span-6'
    : lgCols === 4
    ? 'lg:col-span-4'
    : lgCols === 3
    ? 'lg:col-span-3'
    : 'lg:col-span-2'
  const lgRowClass = lgRows === 2 ? 'lg:row-span-2' : 'lg:row-span-1'

  const spanClass = `${mdColClass} ${mdRowClass} ${lgColClass} ${lgRowClass}`

  return (
    <Link
      href={`/escorts?location=${encodeURIComponent(name)}`}
      className={`group relative overflow-hidden bg-gray-100 border border-gray-200 ${spanClass}`}
      aria-label={`Escorts in ${name} anzeigen`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-pink-50 group-hover:to-white transition-colors" />
      <div className="relative p-2 sm:p-3 h-full flex items-end">
        <div>
          <div className="text-xs tracking-widest text-gray-500">STADT</div>
          <div className="text-lg sm:text-xl font-light tracking-wider text-gray-900">{name}</div>
        </div>
      </div>
    </Link>
  )
}

export default function FeaturedPlacesSection() {
  return (
    <section className="py-10">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-lg md:text-xl font-light tracking-widest text-gray-900">
            VORGESTELLTE ORTE
          </h2>
          <Link
            href="/escorts"
            className="text-xs tracking-widest underline text-pink-600 hover:text-pink-700"
          >
            Alle ansehen
          </Link>
        </div>

        <Tabs
          tabs={FEATURED.map((c) => ({
            id: c.key,
            label: c.label,
            content: (
              <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-12 auto-rows-[80px] md:auto-rows-[100px] lg:auto-rows-[100px] gap-1.5 md:gap-2">
                {c.cities.map((city, i) => (
                  <CityCard key={`${c.key}-${city}`} name={city} index={i} />
                ))}
              </div>
            ),
          }))}
        />
      </div>
    </section>
  )
}
