'use client'

import { useEffect, useState } from 'react'
import { useUploadThing } from '@/utils/uploadthing'
import { renderMarkdownToSafeHtml } from '@/lib/markdown'

interface BlogPostItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  coverImage: string | null
  published: boolean
  publishedAt: string | null
  category: string
  createdAt: string
  updatedAt: string
}

export default function BlogDashboard() {
  const [posts, setPosts] = useState<BlogPostItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState<'list' | 'create'>('list')

  // New post form
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [published, setPublished] = useState(false)
  const [preview, setPreview] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const { startUpload, isUploading } = useUploadThing('postImages')

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [edit, setEdit] = useState<Partial<BlogPostItem>>({})
  const [editPreview, setEditPreview] = useState(false)
  const [editFiles, setEditFiles] = useState<File[]>([])
  const { startUpload: startEditUpload, isUploading: isEditUploading } = useUploadThing('postImages')

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/blog/user/posts', { cache: 'no-store' })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Fehler beim Laden')
      setPosts(Array.isArray(data) ? data : [])
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Laden')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const create = async () => {
    try {
      setSaving(true)
      setError(null)
      // Upload cover if needed
      let cover = coverImage
      if (!cover && files.length > 0) {
        const res = await startUpload([files[0]])
        const url = res && res[0] ? (res[0] as any).ufsUrl || (res[0] as any).url : null
        if (url) cover = url
      }
      const res = await fetch('/api/blog/user/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, slug: slug || undefined, excerpt, content, coverImage: cover, published })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Speichern fehlgeschlagen')
      // Reset form and refresh list
      setTitle(''); setSlug(''); setExcerpt(''); setContent(''); setCoverImage(''); setFiles([]); setPublished(false); setPreview(false)
      await load()
      setTab('list')
    } catch (e: any) {
      setError(e?.message || 'Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  const beginEdit = (p: BlogPostItem) => {
    setEditingId(p.id)
    setEdit({ ...p })
    setEditPreview(false)
    setEditFiles([])
  }

  const saveEdit = async () => {
    if (!editingId) return
    try {
      setSaving(true)
      setError(null)
      let payload: any = { ...edit }
      if (editFiles.length > 0) {
        const resUp = await startEditUpload([editFiles[0]])
        const url = resUp && resUp[0] ? (resUp[0] as any).ufsUrl || (resUp[0] as any).url : null
        if (url) payload = { ...payload, coverImage: url }
      }
      const res = await fetch(`/api/blog/user/posts/${editingId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Speichern fehlgeschlagen')
      setEditingId(null)
      await load()
    } catch (e: any) {
      setError(e?.message || 'Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Beitrag wirklich löschen?')) return
    try {
      setSaving(true)
      setError(null)
      const res = await fetch(`/api/blog/user/posts/${id}`, { method: 'DELETE' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Löschen fehlgeschlagen')
      await load()
    } catch (e: any) {
      setError(e?.message || 'Löschen fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-amber-700">{error}</p>}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200">
        <button
          onClick={() => setTab('list')}
          className={`text-xs md:text-sm font-light tracking-widest uppercase py-3 border-b-2 transition-colors ${
            tab === 'list' ? 'text-pink-500 border-pink-500' : 'text-gray-600 border-transparent hover:text-pink-500'
          }`}
        >
          MEINE BEITRÄGE
        </button>
        <button
          onClick={() => setTab('create')}
          className={`text-xs md:text-sm font-light tracking-widest uppercase py-3 border-b-2 transition-colors ${
            tab === 'create' ? 'text-pink-500 border-pink-500' : 'text-gray-600 border-transparent hover:text-pink-500'
          }`}
        >
          NEUEN BEITRAG ERSTELLEN
        </button>
      </div>

      {/* Create new post */}
      {tab === 'create' && (
      <section className="border border-gray-200 p-4">
        <h3 className="sr-only">Neuen Beitrag erstellen</h3>
        <div className="mt-4 grid gap-5">
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-800">Titel</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-2 w-full border-0 border-b-2 border-gray-200 py-2 text-sm bg-transparent outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-800">Slug (optional)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-2 w-full border-0 border-b-2 border-gray-200 py-2 text-sm bg-transparent outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-800">Kurzbeschreibung</label>
            <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className="mt-2 w-full border-0 border-b-2 border-gray-200 py-2 text-sm bg-transparent outline-none focus:border-pink-500" />
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-800">Inhalt (Markdown/HTML)</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="mt-2 w-full border-0 border-b-2 border-gray-200 py-2 text-sm bg-transparent outline-none focus:border-pink-500" />
            <div className="mt-2">
              <button type="button" onClick={() => setPreview(v => !v)} className="text-[11px] uppercase tracking-widest text-gray-600 hover:underline">
                {preview ? 'Vorschau verbergen' : 'Vorschau anzeigen'}
              </button>
            </div>
            {preview && (
              <div className="mt-3 border border-gray-200 p-3 bg-gray-50 text-sm text-gray-800">
                <div dangerouslySetInnerHTML={{ __html: renderMarkdownToSafeHtml(content) }} />
              </div>
            )}
          </div>
          <div>
            <label className="text-xs uppercase tracking-widest text-gray-800">Cover Bild</label>
            <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Bild-URL oder hochladen" className="mt-2 w-full border-0 border-b-2 border-gray-200 py-2 text-sm bg-transparent outline-none focus:border-pink-500" />
            <div className="mt-3 flex items-center gap-3">
              <input type="file" accept="image/*" onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files).slice(0,1) : [])} />
              <button type="button" disabled={isUploading || files.length === 0} onClick={async () => {
                if (files.length === 0) return
                const res = await startUpload([files[0]])
                const url = res && res[0] ? (res[0] as any).ufsUrl || (res[0] as any).url : null
                if (url) setCoverImage(url)
              }} className="px-3 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:bg-pink-50/40 disabled:opacity-60">
                {isUploading ? 'Lade hoch…' : 'Hochladen'}
              </button>
            </div>
            {coverImage && (
              <div className="mt-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="Cover" className="w-full max-w-md h-40 object-cover border border-gray-200" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-800">
              <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Veröffentlichen
            </label>
          </div>
          <div>
            <button disabled={saving || isUploading} onClick={create} className="px-5 py-3 bg-pink-600 text-white text-xs uppercase tracking-widest rounded-none">{saving || isUploading ? 'Speichere…' : 'Beitrag erstellen'}</button>
          </div>
        </div>
      </section>
      )}

      {/* List of own posts */}
      {tab === 'list' && (
      <section>
        <h3 className="sr-only">Meine Beiträge</h3>
        {loading ? (
          <p className="text-sm text-gray-500">Lade…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-500">Noch keine Beiträge.</p>
        ) : (
          <div className="space-y-4">
            {posts.map((p) => (
              <div key={p.id} className="border border-gray-200">
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    {p.coverImage && (
                      <div className="shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.coverImage} alt={p.title} className="h-14 w-20 object-cover border border-gray-200" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium tracking-widest text-gray-900 uppercase truncate">{p.title}</div>
                      <div className="text-[11px] uppercase tracking-widest text-gray-500">
                        {p.published ? 'VERÖFFENTLICHT' : 'ENTWURF'} • {p.category === 'INTERESSANT_HEISSES' ? 'INTERESSANT & HEISSES' : (p.category === 'VON_USER_FUER_USER' ? 'VON USER FÜR USER' : 'AKTUELLES')}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => beginEdit(p)} className="px-3 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:bg-pink-50/40">Bearbeiten</button>
                    <button onClick={() => remove(p.id)} className="px-3 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:bg-pink-50/40">Löschen</button>
                  </div>
                </div>
                {editingId === p.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50 grid gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-gray-800">Titel</label>
                      <input value={edit.title || ''} onChange={(e) => setEdit({ ...edit, title: e.target.value })} className="mt-2 w-full border-0 border-b-2 border-gray-200 py-2 text-sm bg-transparent outline-none focus:border-pink-500" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-gray-800">Slug</label>
                      <input value={edit.slug || ''} onChange={(e) => setEdit({ ...edit, slug: e.target.value })} className="mt-2 w-full border-0 border-b-2 border-gray-200 py-2 text-sm bg-transparent outline-none focus:border-pink-500" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-gray-800">Kurzbeschreibung</label>
                      <textarea value={edit.excerpt || ''} onChange={(e) => setEdit({ ...edit, excerpt: e.target.value })} rows={3} className="mt-2 w-full border-0 border-b-2 border-gray-200 py-2 text-sm bg-transparent outline-none focus:border-pink-500" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-gray-800">Inhalt (Markdown/HTML)</label>
                      <textarea value={edit.content || ''} onChange={(e) => setEdit({ ...edit, content: e.target.value })} rows={8} className="mt-2 w-full border-0 border-b-2 border-gray-200 py-2 text-sm bg-transparent outline-none focus:border-pink-500" />
                      <div className="mt-2">
                        <button type="button" onClick={() => setEditPreview(v => !v)} className="text-[11px] uppercase tracking-widest text-gray-600 hover:underline">
                          {editPreview ? 'Vorschau verbergen' : 'Vorschau anzeigen'}
                        </button>
                      </div>
                      {editPreview && (
                        <div className="mt-3 border border-gray-200 p-3 bg-white text-sm text-gray-800">
                          <div dangerouslySetInnerHTML={{ __html: renderMarkdownToSafeHtml(String(edit.content || '')) }} />
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-gray-800">Cover Bild</label>
                      <input value={edit.coverImage || ''} onChange={(e) => setEdit({ ...edit, coverImage: e.target.value })} className="mt-2 w-full border-0 border-b-2 border-gray-200 py-2 text-sm bg-transparent outline-none focus:border-pink-500" />
                      <div className="mt-3 flex items-center gap-3">
                        <input type="file" accept="image/*" onChange={(e) => setEditFiles(e.target.files ? Array.from(e.target.files).slice(0,1) : [])} />
                        <button type="button" disabled={isEditUploading || editFiles.length === 0} onClick={async () => {
                          if (editFiles.length === 0) return
                          const res = await startEditUpload([editFiles[0]])
                          const url = res && res[0] ? (res[0] as any).ufsUrl || (res[0] as any).url : null
                          if (url) setEdit({ ...edit, coverImage: url })
                        }} className="px-3 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:bg-pink-50/40 disabled:opacity-60">
                          {isEditUploading ? 'Lade hoch…' : 'Hochladen'}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-800">
                        <input type="checkbox" checked={!!edit.published} onChange={(e) => setEdit({ ...edit, published: e.target.checked })} /> Veröffentlichen
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <button disabled={saving || isEditUploading} onClick={saveEdit} className="px-5 py-3 bg-pink-600 text-white text-xs uppercase tracking-widest rounded-none">{saving || isEditUploading ? 'Speichere…' : 'Speichern'}</button>
                      <button onClick={() => setEditingId(null)} className="px-5 py-3 border border-gray-300 text-gray-800 text-xs uppercase tracking-widest rounded-none">Abbrechen</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      )}
    </div>
  )
}
