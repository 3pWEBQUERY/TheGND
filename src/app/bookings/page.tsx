'use client'

import DashboardHeader from '@/components/DashboardHeader'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function BookingsPage() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memberships, setMemberships] = useState<any[]>([])
  const [addons, setAddons] = useState<any[]>([])
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/membership/my', { cache: 'no-store' })
      if (!res.ok) throw new Error(res.status === 401 ? 'Bitte einloggen' : 'Fehler beim Laden')
      const data = await res.json()
      setMemberships(data?.memberships ?? [])
      setAddons(data?.addons ?? [])
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const currency = (cents?: number) => typeof cents === 'number' ? (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '-'

  const doAction = async (action: 'pause_membership' | 'resume_membership' | 'cancel_membership' | 'cancel_addon', id: string) => {
    try {
      setActionLoadingId(id)
      setError(null)
      const res = await fetch('/api/membership/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Aktion fehlgeschlagen')
      await fetchData()
    } catch (e: any) {
      setError(e?.message || 'Aktion fehlgeschlagen')
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <>
      <DashboardHeader session={session} activeTab="bookings" setActiveTab={() => {}} />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-light tracking-widest text-gray-900">MEINE BUCHUNGEN</h1>
            <div className="w-24 h-px bg-pink-500 mt-3" />
          </div>
          <Button onClick={fetchData} className="bg-transparent text-gray-700 border border-gray-300 hover:bg-pink-50/40 rounded-none px-4 py-2 h-auto text-xs uppercase tracking-widest">Aktualisieren</Button>
        </div>
        <p className="text-sm text-gray-600 mt-4">Übersicht deiner aktiven Mitgliedschaften und Add-on Buchungen.</p>

        {loading ? (
          <p className="mt-6 text-sm text-gray-500">Lade…</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-600">{error}</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Memberships */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-light tracking-widest text-gray-800 uppercase">MITGLIEDSCHAFTEN</h2>
              {memberships.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">Keine Mitgliedschaften vorhanden.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {memberships.map((m) => (
                    <li key={m.id} className="border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="text-sm text-gray-900">{m.plan?.name ?? m.plan?.key ?? 'Plan'}</div>
                          <div className="text-xs text-gray-500">Status: {m.status}</div>
                          <div className="text-xs text-gray-500">Start: {new Date(m.startedAt).toLocaleDateString('de-DE')}</div>
                          {m.endedAt && <div className="text-xs text-gray-500">Ende: {new Date(m.endedAt).toLocaleDateString('de-DE')}</div>}
                        </div>
                        <div className="flex items-center gap-2">
                          {m.status === 'ACTIVE' && (
                            <>
                              <Button onClick={() => doAction('pause_membership', m.id)} disabled={actionLoadingId === m.id} className="bg-transparent text-gray-700 border border-gray-300 hover:bg-pink-50/40 rounded-none px-3 py-2 h-auto text-xs uppercase tracking-widest">
                                {actionLoadingId === m.id ? 'Wird pausiert…' : 'Pausieren'}
                              </Button>
                              <Button onClick={() => doAction('cancel_membership', m.id)} disabled={actionLoadingId === m.id} className="bg-pink-500 hover:bg-pink-600 text-white rounded-none px-3 py-2 h-auto text-xs uppercase tracking-widest">
                                {actionLoadingId === m.id ? 'Kündige…' : 'Kündigen'}
                              </Button>
                            </>
                          )}
                          {m.status === 'PAUSED' && (
                            <Button onClick={() => doAction('resume_membership', m.id)} disabled={actionLoadingId === m.id} className="bg-pink-500 hover:bg-pink-600 text-white rounded-none px-3 py-2 h-auto text-xs uppercase tracking-widest">
                              {actionLoadingId === m.id ? 'Setze fort…' : 'Fortsetzen'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Add-ons */}
            <div className="border border-gray-200 p-6">
              <h2 className="text-sm font-light tracking-widest text-gray-800 uppercase">ADD-ONS</h2>
              {addons.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">Keine Add-on Buchungen vorhanden.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {addons.map((a) => (
                    <li key={a.id} className="border border-gray-200 p-4">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="text-sm text-gray-900">{a.addonOption?.addon?.name ?? a.addonOption?.addon?.key ?? 'Add-on'}</div>
                          <div className="text-xs text-gray-500">Dauer: {Math.round((new Date(a.endsAt).getTime() - new Date(a.startsAt).getTime()) / (1000 * 60 * 60 * 24))} Tage</div>
                          <div className="text-xs text-gray-500">Von: {new Date(a.startsAt).toLocaleDateString('de-DE')} • Bis: {new Date(a.endsAt).toLocaleDateString('de-DE')}</div>
                          {/* Preis optional aus Notiz extrahieren */}
                          {typeof a.note === 'string' && a.note.startsWith('Preis: ') && (
                            <div className="text-xs text-gray-500">Preis: {currency(Number(a.note.replace('Preis: ', '')))}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {(a.status === 'ACTIVE' || a.status === 'PENDING') && (
                            <Button onClick={() => doAction('cancel_addon', a.id)} disabled={actionLoadingId === a.id} className="bg-transparent text-gray-700 border border-gray-300 hover:bg-pink-50/40 rounded-none px-3 py-2 h-auto text-xs uppercase tracking-widest">
                              {actionLoadingId === a.id ? 'Storniere…' : 'Stornieren'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
