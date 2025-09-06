'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import StoriesGallery from '@/components/homepage/StoriesGallery'
import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import EscortsHero from '@/components/homepage/EscortsHero'
import EscortsSearch from '@/components/escorts/EscortsSearch'
import EscortsResultsGrid from '@/components/escorts/EscortsResultsGrid'
import type { EscortItem, EscortFilters } from '@/types/escort'

// EscortItem type is imported from '@/types/escort'

export default function EscortsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white"><MinimalistNavigation /><div className="max-w-5xl mx-auto px-6 py-10">Laden...</div><Footer /></div>}>
      <EscortsPageInner />
    </Suspense>
  )
}

function EscortsPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState('')
  const [location, setLocation] = useState('')
  const [items, setItems] = useState<EscortItem[] | null>(null)
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [ageVerifiedOnly, setAgeVerifiedOnly] = useState(false)
  const [filters, setFilters] = useState<EscortFilters>({
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
  const initializedRef = useRef(false)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (location.trim()) params.set('location', location.trim())
    // add advanced filters
    Object.entries(filters).forEach(([key, value]) => {
      const v = (value || '').toString().trim()
      if (v) params.set(key, v)
    })
    params.set('take', '60')
    if (verifiedOnly) params.set('verifiedOnly', '1')
    if (ageVerifiedOnly) params.set('ageVerifiedOnly', '1')
    return params.toString()
  }, [q, location, filters, verifiedOnly, ageVerifiedOnly])

  async function fetchEscorts() {
    setLoading(true)
    setError(null)
    try {
      // Write current query into URL
      router.replace(`/escorts?${queryString}`)
      const res = await fetch(`/api/escorts/search?${queryString}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('Fehler beim Laden')
      const data = await res.json()
      setItems(data.items)
      setTotal(data.total)
    } catch (e: any) {
      setError(e.message || 'Unbekannter Fehler')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initialize state from URL on first mount
    const sp = searchParams
    if (!sp) {
      fetchEscorts()
      initializedRef.current = true
      return
    }
    const initialQ = sp.get('q')?.trim() || ''
    const initialLocation = sp.get('location')?.trim() || ''
    const initialFilters: EscortFilters = {
      height: sp.get('height')?.trim() || '',
      weight: sp.get('weight')?.trim() || '',
      breastType: sp.get('breastType')?.trim() || '',
      breastSize: sp.get('breastSize')?.trim() || '',
      eyeColor: sp.get('eyeColor')?.trim() || '',
      hairColor: sp.get('hairColor')?.trim() || '',
      hairLength: sp.get('hairLength')?.trim() || '',
      clothingStyle: sp.get('clothingStyle')?.trim() || '',
      clothingSize: sp.get('clothingSize')?.trim() || '',
    }
    setQ(initialQ)
    setLocation(initialLocation)
    setFilters(initialFilters)
    setVerifiedOnly(sp.get('verifiedOnly') === '1')
    setAgeVerifiedOnly(sp.get('ageVerifiedOnly') === '1')

    // Fetch with these initial params immediately
    const p = new URLSearchParams()
    if (initialQ) p.set('q', initialQ)
    if (initialLocation) p.set('location', initialLocation)
    Object.entries(initialFilters).forEach(([k, v]) => {
      const val = (v || '').toString().trim()
      if (val) p.set(k, val)
    })
    p.set('take', '60')
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/escorts/search?${p.toString()}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Fehler beim Laden')
        const data = await res.json()
        setItems(data.items)
        setTotal(data.total)
      } catch (e: any) {
        setError(e.message || 'Unbekannter Fehler')
      } finally {
        setLoading(false)
        initializedRef.current = true
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-Suche: bei Änderungen von Suchbegriff, Ort und Filtern automatisch mit kleinem Debounce nachladen
  useEffect(() => {
    if (!initializedRef.current) return
    const t = setTimeout(() => {
      fetchEscorts()
    }, 300)
    return () => clearTimeout(t)
  }, [q, location, filters])

  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />
      {/* Hero (50vh) */}
      <EscortsHero />

      {/* Stories oberhalb der Suche */}
      <StoriesGallery />

      {/* Suche */}
      <EscortsSearch
        q={q}
        setQ={setQ}
        location={location}
        setLocation={setLocation}
        onSubmit={fetchEscorts}
        loading={loading}
        error={error}
        filters={filters}
        onFiltersChange={(f) => setFilters(f)}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
        ageVerifiedOnly={ageVerifiedOnly}
        setAgeVerifiedOnly={setAgeVerifiedOnly}
      />

      {/* Ergebnisse: 5er Grid */}
      <EscortsResultsGrid items={items} loading={loading} total={total} />
      <Footer />
    </div>
  )
}
