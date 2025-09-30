'use client'

import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/toast'

export default function GirlsDashboard() {
  const { show } = useToast()
  const [inviteCode, setInviteCode] = useState<string>('')
  const [loadingCode, setLoadingCode] = useState(false)
  const [girls, setGirls] = useState<any[] | null>(null)
  const [loadingGirls, setLoadingGirls] = useState(false)

  const loadGirls = async () => {
    setLoadingGirls(true)
    try {
      const res = await fetch('/api/girls/list', { cache: 'no-store' })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setGirls(Array.isArray(data?.items) ? data.items : [])
      } else {
        setGirls([])
      }
    } catch {
      setGirls([])
    } finally {
      setLoadingGirls(false)
    }
  }

  useEffect(() => {
    loadGirls()
  }, [])

  const genCode = async () => {
    setLoadingCode(true)
    try {
      const res = await fetch('/api/girls/invite', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Fehler beim Generieren')
      setInviteCode(data?.code || '')
      show('Code erstellt', { variant: 'success' })
    } catch (e: any) {
      show(e?.message || 'Fehler', { variant: 'error' })
    } finally {
      setLoadingCode(false)
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode)
      show('Code kopiert', { variant: 'info' })
    } catch {}
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-thin tracking-wider text-gray-800">GIRLS</h2>
            <div className="w-16 h-px bg-pink-500 mt-2" />
            <div className="mt-2 text-sm text-gray-600">Teile den Code mit deinen Escorts, damit sie sich verbinden können.</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={genCode} disabled={loadingCode} className="px-3 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:border-pink-500 hover:text-pink-600">
              {loadingCode ? 'Erstellt…' : 'CODE GENERIEREN'}
            </button>
            <input readOnly value={inviteCode} placeholder="Noch kein Code" className="border border-gray-300 px-3 py-2 text-sm min-w-[180px]" />
            <button onClick={copyCode} disabled={!inviteCode} className="px-3 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:border-pink-500 hover:text-pink-600 disabled:opacity-50">Kopieren</button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 p-6">
        <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">VERKNÜPFTE ESCORTS</h3>
        {loadingGirls ? (
          <div className="text-sm text-gray-500">Lade…</div>
        ) : !girls || girls.length === 0 ? (
          <div className="text-sm text-gray-500">Noch keine Escorts verbunden.</div>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {girls.map((g) => (
              <li key={g.id} className="border border-gray-200 p-3 flex items-center gap-3">
                <div className="h-12 w-12 bg-gray-100 border border-gray-200 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {g.profile?.avatar ? <img src={g.profile.avatar} alt={g.profile?.displayName || 'Escort'} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-xs text-gray-500">Kein Bild</div>}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium tracking-wider text-gray-900 truncate">{g.profile?.displayName || g.email}</div>
                  <div className="text-xs text-gray-500 truncate">{[g.profile?.city, g.profile?.country].filter(Boolean).join(', ')}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
