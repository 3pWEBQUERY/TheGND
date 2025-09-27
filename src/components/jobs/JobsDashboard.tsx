'use client'

import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useUploadThing } from '@/utils/uploadthing'

const CATEGORIES = [
  { value: 'ESCORT', label: 'Escort' },
  { value: 'CLEANING', label: 'Reinigungskraft' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'HOUSEKEEPING', label: 'Hausdame' },
] as const

type MyJob = {
  id: string
  title: string
  shortDesc: string
  category: string
  city?: string
  country?: string
  media?: string[]
  isActive?: boolean
  createdAt?: string
}

export default function JobsDashboard() {
  const { startUpload, isUploading } = useUploadThing('jobMedia')
  const [title, setTitle] = useState('')
  const [shortDesc, setShortDesc] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>('ESCORT')
  const [location, setLocation] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [salaryInfo, setSalaryInfo] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement | null>(null)

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)

  const [myJobs, setMyJobs] = useState<MyJob[] | null>(null)
  const [loadingJobs, setLoadingJobs] = useState(false)

  const pickFiles = () => fileRef.current?.click()

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || [])
    const allowedImage = ['image/jpeg','image/jpg','image/png','image/webp']
    const maxImage = 8 * 1024 * 1024
    const errs: string[] = []
    const ok: File[] = []
    for (const f of files) {
      if (!allowedImage.includes(f.type)) {
        errs.push(`Ungültiges Bildformat: ${f.name}`)
        continue
      }
      if (f.size > maxImage) {
        errs.push(`Bild zu groß (max 8MB): ${f.name}`)
        continue
      }
      ok.push(f)
    }
    setErrors(errs)
    setSelectedFiles(prev => [...prev, ...ok])
    if (fileRef.current) fileRef.current.value = ''
  }

  const uploadAll = async () => {
    if (selectedFiles.length === 0) return
    setErrors([])
    try {
      const res = await startUpload(selectedFiles)
      const urls = (res || []).map((r: any) => r?.ufsUrl || r?.url).filter(Boolean) as string[]
      setMediaUrls(prev => [...prev, ...urls])
      setSelectedFiles([])
    } catch {
      setErrors(['Fehler beim Upload'])
    }
  }

  const removeMedia = (url: string) => {
    setMediaUrls(prev => prev.filter(u => u !== url))
  }

  const resetForm = () => {
    setTitle('')
    setShortDesc('')
    setDescription('')
    setCategory('ESCORT')
    setLocation('')
    setCity('')
    setCountry('')
    setSalaryInfo('')
    setContactInfo('')
    setSelectedFiles([])
    setMediaUrls([])
  }

  const save = async () => {
    setErrors([])
    setMessage(null)
    if (!title.trim() || !shortDesc.trim() || !description.trim()) {
      setErrors(['Bitte Titel, Kurzbeschreibung und Beschreibung ausfüllen'])
      return
    }
    setSaving(true)
    try {
      const payload = {
        title: title.trim(),
        shortDesc: shortDesc.trim(),
        description: description.trim(),
        category,
        location: location.trim() || undefined,
        city: city.trim() || undefined,
        country: country.trim() || undefined,
        salaryInfo: salaryInfo.trim() || undefined,
        contactInfo: contactInfo.trim() || undefined,
        media: mediaUrls,
      }
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const out = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(out?.error || 'Fehler beim Speichern')
      setMessage('Job gespeichert')
      resetForm()
      await loadMyJobs()
    } catch (e: any) {
      setErrors([e?.message || 'Fehler beim Speichern'])
    } finally {
      setSaving(false)
    }
  }

  const loadMyJobs = async () => {
    setLoadingJobs(true)
    try {
      const res = await fetch('/api/jobs?mine=1', { cache: 'no-store' })
      const data = await res.json()
      if (res.ok) setMyJobs(Array.isArray(data?.items) ? data.items : [])
    } catch {
      setMyJobs([])
    } finally {
      setLoadingJobs(false)
    }
  }

  useEffect(() => { loadMyJobs() }, [])

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 p-6">
        <h2 className="text-2xl font-thin tracking-wider text-gray-800 mb-2">JOB ERSTELLEN</h2>
        <div className="w-16 h-px bg-pink-500 mb-6" />

        {errors.length > 0 && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200">
            {errors.map((e, i) => <div key={i}>{e}</div>)}
          </div>
        )}
        {message && (
          <div className="p-3 mb-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200">{message}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs tracking-widest text-gray-600 mb-2">TITEL</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} className="rounded-none border-gray-300" />
          </div>
          <div>
            <label className="block text-xs tracking-widest text-gray-600 mb-2">KATEGORIE</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-none bg-white">
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs tracking-widest text-gray-600 mb-2">KURZBESCHREIBUNG</label>
            <Input value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className="rounded-none border-gray-300" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs tracking-widest text-gray-600 mb-2">BESCHREIBUNG</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[160px] rounded-none border-gray-300" />
          </div>
          <div>
            <label className="block text-xs tracking-widest text-gray-600 mb-2">ORT (FREITEXT)</label>
            <Input value={location} onChange={(e) => setLocation(e.target.value)} className="rounded-none border-gray-300" />
          </div>
          <div>
            <label className="block text-xs tracking-widest text-gray-600 mb-2">STADT</label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} className="rounded-none border-gray-300" />
          </div>
          <div>
            <label className="block text-xs tracking-widest text-gray-600 mb-2">LAND</label>
            <Input value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-none border-gray-300" />
          </div>
          <div>
            <label className="block text-xs tracking-widest text-gray-600 mb-2">VERGÜTUNG</label>
            <Input value={salaryInfo} onChange={(e) => setSalaryInfo(e.target.value)} className="rounded-none border-gray-300" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs tracking-widest text-gray-600 mb-2">KONTAKT</label>
            <Input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="E-Mail, Telefon oder URL" className="rounded-none border-gray-300" />
          </div>

          {/* Upload */}
          <div className="md:col-span-2">
            <label className="block text-xs tracking-widest text-gray-600 mb-2">MEDIEN (BILDER)</label>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFilesSelected} />
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={pickFiles} className="px-3 py-2 text-xs uppercase tracking-widest border border-gray-300 hover:border-pink-500 hover:text-pink-600">Dateien auswählen</button>
              <button type="button" onClick={uploadAll} disabled={isUploading || selectedFiles.length===0} className="px-3 py-2 text-xs uppercase tracking-widest bg-pink-500 hover:bg-pink-600 text-white disabled:opacity-60">{isUploading ? 'Lädt…' : 'Hochladen'}</button>
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-3 text-xs text-gray-600">Ausgewählt: {selectedFiles.map(f => f.name).join(', ')}</div>
            )}
            {mediaUrls.length > 0 && (
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {mediaUrls.map((u) => (
                  <div key={u} className="relative border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={u} alt="Job Media" className="w-full h-28 object-cover" />
                    <button type="button" onClick={() => removeMedia(u)} className="absolute top-1 right-1 text-[10px] uppercase tracking-widest bg-white/90 border border-gray-300 px-2 py-0.5">Löschen</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6">
          <Button onClick={save} disabled={saving} className="rounded-none bg-pink-600 hover:bg-pink-700">{saving ? 'Speichert…' : 'Job speichern'}</Button>
        </div>
      </div>

      {/* Meine Jobs */}
      <div className="bg-white border border-gray-200 p-6">
        <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">MEINE JOBS</h3>
        {loadingJobs ? (
          <div className="text-sm text-gray-500">Lade…</div>
        ) : myJobs && myJobs.length > 0 ? (
          <ul className="space-y-3">
            {myJobs.map(j => (
              <li key={j.id} className="flex items-center justify-between border border-gray-200 px-3 py-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium tracking-wider text-gray-900 truncate">{j.title}</div>
                  <div className="text-xs text-gray-500 truncate">{j.category} · {j.city || ''}{j.city && j.country ? ', ' : ''}{j.country || ''}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] uppercase tracking-widest ${j.isActive ? 'text-emerald-600' : 'text-gray-500'}`}>{j.isActive ? 'AKTIV' : 'INAKTIV'}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-gray-500">Keine Jobs erstellt.</div>
        )}
      </div>
    </div>
  )
}
