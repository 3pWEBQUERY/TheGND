'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateGroupForm() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, privacy }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Erstellen fehlgeschlagen')
      router.push(`/groups/${data.group?.slug}`)
      router.refresh()
    } catch (e: any) {
      alert(e?.message || 'Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="border border-gray-200 bg-white p-4 space-y-3">
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Gruppenname" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Beschreibung</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" placeholder="Worum geht es?" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Sichtbarkeit</label>
        <select value={privacy} onChange={(e) => setPrivacy(e.target.value as any)} className="w-full border border-gray-300 px-3 py-2 text-sm">
          <option value="PUBLIC">Öffentlich</option>
          <option value="PRIVATE">Privat</option>
        </select>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50">
          {loading ? '...' : 'Gruppe erstellen'}
        </button>
      </div>
    </form>
  )
}
