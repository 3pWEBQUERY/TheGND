"use client"

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

type Category = {
  id: string
  name: string
  forums: { id: string; name: string }[]
}

export default function CreateForumForm({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '')
  const [parentId, setParentId] = useState<string>('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState<number>(0)
  const [isLocked, setIsLocked] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const parentOptions = useMemo(() => {
    const cat = categories.find((c) => c.id === categoryId)
    return cat?.forums || []
  }, [categories, categoryId])

  async function submit() {
    if (!categoryId || !name.trim()) {
      setMessage('Kategorie und Name erforderlich')
      return
    }
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/acp/forum/forums', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId, parentId: parentId || undefined, name, description, sortOrder, isLocked, isHidden }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Fehler beim Erstellen')
      setName('')
      setDescription('')
      setParentId('')
      setIsLocked(false)
      setIsHidden(false)
      setSortOrder(0)
      router.refresh()
    } catch (e: any) {
      setMessage(e?.message || 'Fehler')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <h3 className="text-sm font-medium text-gray-900">Forum erstellen</h3>
      {message && <p className="text-xs text-red-600">{message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-gray-700">Kategorie</label>
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value)
              setParentId('')
            }}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-700">Übergeordnetes Forum (optional)</label>
          <select
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="mt-1 w-full border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="">— Kein —</option>
            {parentOptions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      </div>
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
      />
      <textarea
        placeholder="Beschreibung (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-700">Sortierung</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value || '0', 10))}
            className="w-24 border border-gray-300 rounded px-3 py-2 text-sm"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isLocked} onChange={(e) => setIsLocked(e.target.checked)} />
          Gesperrt
        </label>
        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isHidden} onChange={(e) => setIsHidden(e.target.checked)} />
          Versteckt
        </label>
      </div>
      <div>
        <button onClick={submit} disabled={loading} className="px-4 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
          {loading ? 'Erstelle…' : 'Erstellen'}
        </button>
      </div>
    </div>
  )
}
