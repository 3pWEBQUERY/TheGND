"use client"

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Heart, X, RefreshCw, Undo2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export type MatchSuggestion = {
  id: string
  email: string
  displayName: string
  city?: string | null
  country?: string | null
  avatar?: string | null
  image?: string | null
  services?: string[]
  appearance?: Record<string, any>
}

type SwipeDeckProps = {
  fetchLimit?: number
}

export default function SwipeDeck({ fetchLimit = 20 }: SwipeDeckProps) {
  const [cards, setCards] = useState<MatchSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // For drag gestures
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)
  const currentX = useRef<number>(0)
  const currentY = useRef<number>(0)
  const dragging = useRef<boolean>(false)

  const topCardId = cards[0]?.id

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/matching/suggestions?limit=${fetchLimit}`, { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      setCards(data.suggestions || [])
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const onAction = async (id: string, action: 'LIKE' | 'PASS') => {
    try {
      setBusy(true)
      const res = await fetch('/api/matching/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ escortId: id, action })
      })
      // Ignore non-200 silently; UI continues
      await res.json().catch(() => null)
    } catch {}
    finally {
      setBusy(false)
    }
  }

  const shift = (id: string) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }

  const likeTop = async () => {
    const id = cards[0]?.id
    if (!id) return
    await onAction(id, 'LIKE')
    shift(id)
  }

  const passTop = async () => {
    const id = cards[0]?.id
    if (!id) return
    await onAction(id, 'PASS')
    shift(id)
  }

  const undo = async () => {
    try {
      setBusy(true)
      const res = await fetch('/api/matching/swipe/undo', { method: 'POST' })
      await res.json().catch(() => null)
      // Easiest: reload deck to reflect change
      await load()
    } catch {}
    finally {
      setBusy(false)
    }
  }

  // Drag handlers
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handlePointerDown = (e: PointerEvent) => {
      if (busy) return
      const target = (e.target as HTMLElement)
      if (!target.closest('[data-top-card="true"]')) return
      dragging.current = true
      startX.current = e.clientX
      startY.current = e.clientY
      currentX.current = 0
      currentY.current = 0
      ;(target as HTMLElement).setPointerCapture?.(e.pointerId)
    }
    const handlePointerMove = (e: PointerEvent) => {
      if (!dragging.current || startX.current == null || startY.current == null) return
      currentX.current = e.clientX - startX.current
      currentY.current = e.clientY - startY.current
      const card = el.querySelector('[data-top-card="true"]') as HTMLElement | null
      if (card) {
        const rot = currentX.current / 20
        card.style.transform = `translate(${currentX.current}px, ${currentY.current}px) rotate(${rot}deg)`
      }
    }
    const handlePointerUp = async (e: PointerEvent) => {
      if (!dragging.current) return
      dragging.current = false
      const dx = currentX.current
      const dy = currentY.current
      startX.current = startY.current = null
      currentX.current = currentY.current = 0
      const card = el.querySelector('[data-top-card="true"]') as HTMLElement | null
      if (!card) return

      const threshold = 80
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy)) {
        // Swipe decision
        const id = card.getAttribute('data-id')!
        const dir = dx > 0 ? 'LIKE' : 'PASS'
        card.style.transition = 'transform 200ms ease-out'
        card.style.transform = `translate(${dx > 0 ? 1000 : -1000}px, ${dy}px) rotate(${dx / 10}deg)`
        setTimeout(() => {
          card.style.transition = ''
          card.style.transform = ''
        }, 220)
        await onAction(id, dir as 'LIKE' | 'PASS')
        shift(id)
      } else {
        // Reset
        card.style.transition = 'transform 160ms ease-out'
        card.style.transform = 'translate(0,0) rotate(0)'
        setTimeout(() => {
          card.style.transition = ''
        }, 170)
      }
    }

    el.addEventListener('pointerdown', handlePointerDown)
    el.addEventListener('pointermove', handlePointerMove)
    el.addEventListener('pointerup', handlePointerUp)
    el.addEventListener('pointercancel', handlePointerUp)
    return () => {
      el.removeEventListener('pointerdown', handlePointerDown)
      el.removeEventListener('pointermove', handlePointerMove)
      el.removeEventListener('pointerup', handlePointerUp)
      el.removeEventListener('pointercancel', handlePointerUp)
    }
  }, [busy, topCardId])

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <div className="text-sm text-gray-500">Lade Vorschläge…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="text-sm text-gray-500">{error}</div>
        <Button variant="outline" onClick={load} className="tracking-widest">Neu laden</Button>
      </div>
    )
  }

  if (!cards.length) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4">
        <div className="text-sm text-gray-500">Keine weiteren Vorschläge</div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={load} className="tracking-widest"><RefreshCw className="h-4 w-4 mr-2"/>Neu laden</Button>
          <Link href="/dashboard?tab=matching&view=prefs" className="text-xs tracking-widest text-pink-600 hover:underline uppercase">Präferenzen anpassen</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto" ref={containerRef}>
      <div className="relative h-[70vh] select-none">
        {cards.slice(0, 3).map((c, idx) => (
          <div
            key={c.id}
            data-id={c.id}
            data-top-card={idx === 0 ? 'true' : 'false'}
            className="absolute inset-0 bg-white border border-gray-200 overflow-hidden"
            style={{
              borderRadius: 0,
              zIndex: 10 - idx,
              transform: idx === 0 ? undefined : `scale(${1 - idx * 0.04}) translateY(${idx * 10}px)`
            }}
          >
            <div className="relative h-2/3 bg-gray-100">
              {c.image || c.avatar ? (
                <Image src={(c.image || c.avatar)!} alt={c.displayName} fill className="object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">Kein Bild</div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-light tracking-widest text-gray-900 truncate">{c.displayName.toUpperCase()}</h3>
                <div className="text-xs text-gray-500 whitespace-nowrap">{c.city || ''}{c.city && c.country ? ', ' : ''}{c.country || ''}</div>
              </div>
              {Array.isArray(c.services) && c.services.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {c.services.slice(0, 5).map((s) => (
                    <span key={s} className="px-2 py-1 text-[10px] uppercase tracking-widest bg-gray-100 text-gray-700">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <Button variant="outline" onClick={passTop} aria-label="Pass" className="h-12 w-12 p-0 rounded-full border-gray-300"><X className="h-6 w-6"/></Button>
        <Button onClick={likeTop} aria-label="Like" className="h-14 w-14 p-0 rounded-full bg-pink-500 hover:bg-pink-600"><Heart className="h-7 w-7 text-white"/></Button>
      </div>
      <div className="mt-3 text-center text-xs text-gray-500">Wische links für Pass, rechts für Like</div>
      <div className="mt-3 flex items-center justify-center">
        <Button variant="ghost" onClick={undo} disabled={busy} className="text-xs tracking-widest"><Undo2 className="h-4 w-4 mr-2"/>Rückgängig</Button>
      </div>
    </div>
  )
}
