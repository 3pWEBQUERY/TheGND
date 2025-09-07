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
  const [marketingOrders, setMarketingOrders] = useState<any[]>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [resMembership, resMarketing] = await Promise.all([
        fetch('/api/membership/my', { cache: 'no-store' }),
        fetch('/api/marketing/my', { cache: 'no-store' }),
      ])
      if (!resMembership.ok) throw new Error(resMembership.status === 401 ? 'Bitte einloggen' : 'Fehler beim Laden (Membership)')
      const dataMembership = await resMembership.json()
      setMemberships(dataMembership?.memberships ?? [])
      setAddons(dataMembership?.addons ?? [])
      if (resMarketing.status === 200) {
        const dataMarketing = await resMarketing.json().catch(() => ({}))
        setMarketingOrders(Array.isArray(dataMarketing?.orders) ? dataMarketing.orders : [])
      } else if (resMarketing.status === 401) {
        // ignore; user not logged in path handled above
      }
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const currency = (cents?: number) => typeof cents === 'number' ? (cents / 100).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' }) : '-'
  const currencyCHF = (cents?: number) => typeof cents === 'number' ? (cents / 100).toLocaleString('de-CH', { style: 'currency', currency: 'CHF' }) : '-'

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

            {/* Marketing Orders */}
            <div className="border border-gray-200 p-6 lg:col-span-2">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-light tracking-widest text-gray-800 uppercase">MARKETING · WERBUNG</h2>
                <Button onClick={() => (window.location.href = '/marketing')} className="bg-transparent text-gray-700 border border-gray-300 hover:bg-pink-50/40 rounded-none px-3 py-2 h-auto text-xs uppercase tracking-widest">Neue Werbung buchen</Button>
              </div>
              {marketingOrders.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">Keine Marketing-Bestellungen vorhanden.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {marketingOrders.map((o) => (
                    <li key={o.id} className="border border-gray-200">
                      <div className="px-4 py-3 bg-gray-50 flex items-center justify-between text-sm">
                        <div>
                          <span className="text-gray-900">Bestellung</span> <span className="text-gray-500">#{o.id}</span>
                          <span className="ml-3 text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('de-CH')}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-900 font-medium">{currencyCHF(o.totalCents)}</div>
                          <div className="text-[11px] uppercase tracking-widest text-gray-500">{o.status}</div>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {o.items?.map((it: any) => (
                            <div key={it.id} className="border border-gray-200">
                              <div className="px-3 py-2 text-xs uppercase tracking-widest text-gray-600 border-b border-gray-100">{it.placementKey.replace(/_/g, ' ')}</div>
                              <div className="p-3 text-sm">
                                <div className="text-gray-700">Dauer: {it.durationDays} Tage</div>
                                <div className="text-gray-700">Preis: {currencyCHF(it.priceCents)}</div>
                                {Array.isArray(it.assets) && it.assets.length > 0 ? (
                                  <div className="mt-2 grid grid-cols-3 gap-2">
                                    {it.assets.map((a: any) => (
                                      <div key={a.id} className="border border-gray-200 relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={a.url} alt="Asset" className="w-full h-20 object-cover" />
                                        <span className={`absolute bottom-1 right-1 text-[10px] px-1 py-0.5 uppercase tracking-widest ${a.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : a.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'}`}>{a.status}</span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="mt-2 text-xs text-gray-500">Keine Assets hochgeladen.</div>
                                )}
                              </div>
                            </div>
                          ))}
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
