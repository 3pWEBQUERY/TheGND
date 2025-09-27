'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

// Simple key-value settings editor
// value can be plain text or JSON string

type AppSetting = {
  key: string
  value: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [creating, setCreating] = useState<AppSetting>({ key: '', value: '' })
  const [savingKey, setSavingKey] = useState<string | null>(null)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/acp/settings', { cache: 'no-store' })
      const data = await res.json()
      setSettings(Array.isArray(data) ? data : [])
    } catch {
      setMessage('Konnte Einstellungen nicht laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  const upsert = async (item: AppSetting) => {
    try {
      setSavingKey(item.key)
      setMessage(null)
      const res = await fetch('/api/acp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      })
      if (!res.ok) throw new Error('failed')
      await fetchSettings()
      setMessage('Gespeichert')
    } catch {
      setMessage('Speichern fehlgeschlagen')
    } finally {
      setSavingKey(null)
    }
  }

  const remove = async (key: string) => {
    try {
      setSavingKey(key)
      setMessage(null)
      const res = await fetch('/api/acp/settings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      })
      if (!res.ok) throw new Error('failed')
      await fetchSettings()
      setMessage('Einstellung gelöscht')
    } catch {
      setMessage('Löschen fehlgeschlagen')
    } finally {
      setSavingKey(null)
    }
  }

  const create = async () => {
    if (!creating.key) {
      setMessage('Bitte Key angeben')
      return
    }
    await upsert({ key: creating.key, value: creating.value })
    setCreating({ key: '', value: '' })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light tracking-widest text-gray-900">Einstellungen</h1>
      </div>
      {message && <p className="text-xs text-gray-600">{message}</p>}

      <div className="border border-gray-200 p-6">
        <h2 className="text-sm font-light tracking-widest text-gray-800 uppercase">Neue Einstellung</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label className="text-xs uppercase tracking-widest text-gray-800">Key</Label>
            <Input className="mt-2 border-0 border-b-2 border-gray-200 rounded-none"
              value={creating.key}
              placeholder="z. B. membership.headerText"
              onChange={(e) => setCreating((c) => ({ ...c, key: e.target.value }))}
            />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs uppercase tracking-widest text-gray-800">Value</Label>
            <textarea className="mt-2 w-full border-0 border-b-2 border-gray-200 bg-transparent py-3 text-sm"
              rows={3}
              placeholder='z. B. "Willkommen" oder JSON'
              value={creating.value}
              onChange={(e) => setCreating((c) => ({ ...c, value: e.target.value }))}
            />
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={create} className="bg-pink-500 hover:bg-pink-600 text-white rounded-none">Anlegen</Button>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <p className="text-sm text-gray-500">Lade…</p>
        ) : settings.length === 0 ? (
          <p className="text-sm text-gray-500">Keine Einstellungen vorhanden.</p>
        ) : (
          settings.map((s) => (
            <div key={s.key} className="border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-xs uppercase tracking-widest text-gray-800">Key</Label>
                  <Input className="mt-2 border-0 border-b-2 border-gray-200 rounded-none" value={s.key} disabled />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs uppercase tracking-widest text-gray-800">Value</Label>
                  <textarea className="mt-2 w-full border-0 border-b-2 border-gray-200 bg-transparent py-3 text-sm"
                    rows={3}
                    value={s.value}
                    onChange={(e) => setSettings((arr) => arr.map((x) => x.key === s.key ? { ...x, value: e.target.value } : x))}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button onClick={() => upsert(s)} className="bg-pink-500 hover:bg-pink-600 text-white rounded-none px-3 py-2 h-auto text-xs uppercase tracking-widest">Speichern</Button>
                <Button onClick={() => remove(s.key)} className="bg-transparent text-gray-700 border border-gray-300 hover:bg-pink-50/40 rounded-none px-3 py-2 h-auto text-xs uppercase tracking-widest">Löschen</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
