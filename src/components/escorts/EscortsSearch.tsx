import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Search, SlidersHorizontal } from 'lucide-react'
import React from 'react'
import type { EscortFilters } from '@/types/escort'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Props = {
  q: string
  setQ: (v: string) => void
  location: string
  setLocation: (v: string) => void
  onSubmit: () => void
  loading?: boolean
  error?: string | null
  filters: EscortFilters
  onFiltersChange?: (filters: EscortFilters) => void
  verifiedOnly?: boolean
  setVerifiedOnly?: (v: boolean) => void
  ageVerifiedOnly?: boolean
  setAgeVerifiedOnly?: (v: boolean) => void
}

// Options analog zur Onboarding-Seite (Werte in EN/UPPERCASE, Labels DE)
const hairColorOptions = [
  { value: 'BLOND', label: 'Blond' },
  { value: 'BROWN', label: 'Braun' },
  { value: 'BLACK', label: 'Schwarz' },
  { value: 'RED', label: 'Rot' },
  { value: 'GREY', label: 'Grau' },
  { value: 'DYED', label: 'Gefärbt' },
]

const hairLengthOptions = [
  { value: 'SHORT', label: 'Kurz' },
  { value: 'MEDIUM', label: 'Mittel' },
  { value: 'LONG', label: 'Lang' },
]

const eyeColorOptions = [
  { value: 'BLUE', label: 'Blau' },
  { value: 'GREEN', label: 'Grün' },
  { value: 'BROWN', label: 'Braun' },
  { value: 'HAZEL', label: 'Haselnuss' },
  { value: 'GREY', label: 'Grau' },
  { value: 'BLACK', label: 'Schwarz' },
]

const breastTypeOptions = [
  { value: 'NATURAL', label: 'Natürlich' },
  { value: 'IMPLANTS', label: 'Silikon' },
]

const breastSizeOptions = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'E', label: 'E' },
  { value: 'F', label: 'F' },
  { value: 'G', label: 'G' },
]

const clothingStyleOptions = [
  { value: 'ELEGANT', label: 'Elegant' },
  { value: 'CASUAL', label: 'Casual' },
  { value: 'SEXY', label: 'Sexy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'SPORTY', label: 'Sportlich' },
]

// Zusätzliche Auswahl für Kleidergrößen (gemischt EU & Buchstaben)
const clothingSizeOptions = [
  { value: 'XS', label: 'XS' },
  { value: 'S', label: 'S' },
  { value: 'M', label: 'M' },
  { value: 'L', label: 'L' },
  { value: 'XL', label: 'XL' },
  { value: '32', label: '32' },
  { value: '34', label: '34' },
  { value: '36', label: '36' },
  { value: '38', label: '38' },
  { value: '40', label: '40' },
  { value: '42', label: '42' },
  { value: '44', label: '44' },
  { value: '46', label: '46' },
]

export default function EscortsSearch({ q, setQ, location, setLocation, onSubmit, loading, error, filters, onFiltersChange, verifiedOnly = false, setVerifiedOnly, ageVerifiedOnly = false, setAgeVerifiedOnly }: Props) {
  const [filtersOpen, setFiltersOpen] = React.useState(false)
  // Key to force remount of Selects to clear internal state reliably on reset
  const [resetKey, setResetKey] = React.useState(0)

  function handleFilterChange<K extends keyof EscortFilters>(key: K, value: string) {
    const next = { ...filters, [key]: value }
    onFiltersChange?.(next)
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white border border-gray-200 p-4 md:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit()
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              <div className="md:col-span-3">
                <label className="block text-xs tracking-widest text-gray-600 mb-2">SUCHBEGRIFF</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Name, Beschreibung, Services…"
                    className="pl-9 rounded-none border-gray-300 focus-visible:ring-pink-500/30"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs tracking-widest text-gray-600 mb-2">ORT</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Stadt, Land…"
                    className="pl-9 rounded-none border-gray-300 focus-visible:ring-pink-500/30"
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full text-sm font-light tracking-widest border-gray-300 hover:border-pink-500 rounded-none"
                  disabled={loading}
                >
                  {loading ? 'LADEN…' : 'SUCHEN'}
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
              {/* Verified toggles */}
              <Button
                type="button"
                variant={verifiedOnly ? 'default' : 'outline'}
                className={verifiedOnly ? 'bg-emerald-600 hover:bg-emerald-700 text-white rounded-none' : 'text-sm font-light tracking-widest border-gray-300 hover:border-emerald-500 rounded-none'}
                onClick={() => setVerifiedOnly?.(!verifiedOnly)}
              >
                VERIFIZIERT
              </Button>
              <Button
                type="button"
                variant={ageVerifiedOnly ? 'default' : 'outline'}
                className={ageVerifiedOnly ? 'bg-rose-600 hover:bg-rose-700 text-white rounded-none' : 'text-sm font-light tracking-widest border-gray-300 hover:border-rose-500 rounded-none'}
                onClick={() => setAgeVerifiedOnly?.(!ageVerifiedOnly)}
              >
                18+
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-sm font-light tracking-widest border-gray-300 hover:border-pink-500 rounded-none"
                onClick={() => {
                  // Clear search text and location as well
                  setQ('')
                  setLocation('')
                  onFiltersChange?.({
                    height: '',
                    weight: '',
                    breastType: '',
                    breastSize: '',
                    eyeColor: '',
                    hairColor: '',
                    hairLength: '',
                    clothingStyle: '',
                    clothingSize: '',
                  })
                  setVerifiedOnly?.(false)
                  setAgeVerifiedOnly?.(false)
                  // Optional: Filterbereich schließen
                  setFiltersOpen(false)
                  // Force remount of selects to ensure visual reset
                  setResetKey((k) => k + 1)
                }}
              >
                ZURÜCKSETZEN
              </Button>
              <Button
                type="button"
                variant="outline"
                className="text-sm font-light tracking-widest border-gray-300 hover:border-pink-500 rounded-none"
                onClick={() => setFiltersOpen((v) => !v)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                FILTER
              </Button>
            </div>

            {/* Collapsible Advanced Filters */}
            <div className={`transition-all duration-300 overflow-hidden ${filtersOpen ? 'max-h-[1200px] mt-6' : 'max-h-0'}`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs tracking-widest text-gray-600 mb-2">GRÖSSE</label>
                  <Input
                    value={filters.height}
                    onChange={(e) => handleFilterChange('height', e.target.value)}
                    placeholder="z. B. 170 cm"
                    className="rounded-none border-gray-300 focus-visible:ring-pink-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-600 mb-2">GEWICHT</label>
                  <Input
                    value={filters.weight}
                    onChange={(e) => handleFilterChange('weight', e.target.value)}
                    placeholder="z. B. 55 kg"
                    className="rounded-none border-gray-300 focus-visible:ring-pink-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-600 mb-2">BRUSTTYP</label>
                  <Select key={resetKey} value={filters.breastType || undefined} onValueChange={(v) => handleFilterChange('breastType', v)}>
                    <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 bg-transparent">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {breastTypeOptions.map((o) => (
                        <SelectItem className="rounded-none" key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-600 mb-2">BRUSTGRÖSSE</label>
                  <Select key={resetKey} value={filters.breastSize || undefined} onValueChange={(v) => handleFilterChange('breastSize', v)}>
                    <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 bg-transparent">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {breastSizeOptions.map((o) => (
                        <SelectItem className="rounded-none" key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-600 mb-2">AUGENFARBE</label>
                  <Select key={resetKey} value={filters.eyeColor || undefined} onValueChange={(v) => handleFilterChange('eyeColor', v)}>
                    <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 bg-transparent">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {eyeColorOptions.map((o) => (
                        <SelectItem className="rounded-none" key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-600 mb-2">HAARFARBE</label>
                  <Select key={resetKey} value={filters.hairColor || undefined} onValueChange={(v) => handleFilterChange('hairColor', v)}>
                    <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 bg-transparent">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {hairColorOptions.map((o) => (
                        <SelectItem className="rounded-none" key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-600 mb-2">HAARLÄNGE</label>
                  <Select key={resetKey} value={filters.hairLength || undefined} onValueChange={(v) => handleFilterChange('hairLength', v)}>
                    <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 bg-transparent">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {hairLengthOptions.map((o) => (
                        <SelectItem className="rounded-none" key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-600 mb-2">KLEIDUNGSSTIL</label>
                  <Select key={resetKey} value={filters.clothingStyle || undefined} onValueChange={(v) => handleFilterChange('clothingStyle', v)}>
                    <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 bg-transparent">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {clothingStyleOptions.map((o) => (
                        <SelectItem className="rounded-none" key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs tracking-widest text-gray-600 mb-2">KLEIDERGRÖSSE</label>
                  <Select key={resetKey} value={filters.clothingSize || undefined} onValueChange={(v) => handleFilterChange('clothingSize', v)}>
                    <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 bg-transparent">
                      <SelectValue placeholder="Wählen" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {clothingSizeOptions.map((o) => (
                        <SelectItem className="rounded-none" key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
