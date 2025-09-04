'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import StoriesGallery from '@/components/homepage/StoriesGallery'
import AgencyHero from '@/components/homepage/AgencyHero'
import AgencySearch from '@/components/agency/AgencySearch'
import AgencyResultsGrid from '@/components/agency/AgencyResultsGrid'
import type { AgencyItem } from '@/types/agency'

export default function AgencyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white"><MinimalistNavigation /><div className="max-w-5xl mx-auto px-6 py-10">Laden...</div><Footer /></div>}>
      <AgencyPageInner />
    </Suspense>
  )
}

function AgencyPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [q, setQ] = useState('')
  const [location, setLocation] = useState('')
  const [items, setItems] = useState<AgencyItem[] | null>(null)
  const [total, setTotal] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const initializedRef = useRef(false)

  const queryString = useMemo(() => {
    const params = new URLSearchParams()
    if (q.trim()) params.set('q', q.trim())
    if (location.trim()) params.set('location', location.trim())
    params.set('take', '60')
    return params.toString()
  }, [q, location])

  async function fetchAgencies() {
    setLoading(true)
    setError(null)
    try {
      router.replace(`/agency?${queryString}`)
      const res = await fetch(`/api/agency/search?${queryString}`, { cache: 'no-store' })
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
      fetchAgencies()
      initializedRef.current = true
      return
    }
    const initialQ = sp.get('q')?.trim() || ''
    const initialLocation = sp.get('location')?.trim() || ''
    setQ(initialQ)
    setLocation(initialLocation)

    // Fetch with these initial params immediately
    const p = new URLSearchParams()
    if (initialQ) p.set('q', initialQ)
    if (initialLocation) p.set('location', initialLocation)
    p.set('take', '60')
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/agency/search?${p.toString()}`, { cache: 'no-store' })
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

  // Auto search with small debounce
  useEffect(() => {
    if (!initializedRef.current) return
    const t = setTimeout(() => {
      fetchAgencies()
    }, 300)
    return () => clearTimeout(t)
  }, [q, location])

  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />
      <AgencyHero />
      <StoriesGallery />
      <AgencySearch
        q={q}
        setQ={setQ}
        location={location}
        setLocation={setLocation}
        onSubmit={fetchAgencies}
        loading={loading}
        error={error}
      />
      <AgencyResultsGrid items={items} loading={loading} total={total} />
      <Footer />
    </div>
  )
}
