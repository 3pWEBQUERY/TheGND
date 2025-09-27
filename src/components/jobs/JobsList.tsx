'use client'

import { useEffect, useState } from 'react'
import JobsListItem, { JobItem } from './JobsListItem'

export default function JobsList() {
  const [items, setItems] = useState<JobItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/jobs', { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
        if (!cancelled) setItems(Array.isArray(data?.items) ? data.items : [])
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Fehler beim Laden')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-thin tracking-wider text-gray-800">OFFENE JOBS</h2>
          <div className="w-24 h-px bg-pink-500 mx-auto mt-3" />
        </div>
        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
        {loading && <div className="text-sm text-gray-600 mb-4">Lade…</div>}
        <div className="space-y-4">
          {(items ?? Array.from({ length: 3 })).map((job: any, idx) => (
            items ? (
              <JobsListItem key={job.id} job={job as JobItem} />
            ) : (
              <div key={idx} className="h-40 border border-gray-200 bg-gray-50 animate-pulse" />
            )
          ))}
        </div>
      </div>
    </section>
  )
}
