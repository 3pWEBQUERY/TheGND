'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GroupSettingsForm({ group }: { group: { id: string; slug: string; name: string; description: string; privacy: 'PUBLIC' | 'PRIVATE' } }) {
  const router = useRouter()
  const [name, setName] = useState(group.name)
  const [description, setDescription] = useState(group.description || '')
  const [privacy, setPrivacy] = useState<'PUBLIC' | 'PRIVATE'>(group.privacy)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${group.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, privacy })
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Speichern fehlgeschlagen')
      router.refresh()
    } catch (e: any) {
      alert(e?.message || 'Fehler')
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Beschreibung</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border border-gray-300 px-3 py-2 text-sm" rows={3} />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-widest text-gray-500 mb-1">Sichtbarkeit</label>
        <select value={privacy} onChange={(e) => setPrivacy(e.target.value as any)} className="w-full border border-gray-300 px-3 py-2 text-sm">
          <option value="PUBLIC">Öffentlich</option>
          <option value="PRIVATE">Privat</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button type="submit" disabled={loading} className="px-3 py-2 text-sm border border-gray-300 hover:bg-gray-50">{loading ? '...' : 'Speichern'}</button>
      </div>
    </form>
  )
}
