'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'

export default function EscortOnboardingStep4() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [uploaded, setUploaded] = useState<Array<{ url: string; filename: string; type: string; mediaType: 'image'|'video'; size: number }>>([])

  const formatBytes = (bytes: number) => {
    const sizes = ['B','KB','MB','GB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  // Prefill from server
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/onboarding/escort/step-4')
        if (!res.ok) return
        const data = await res.json()
        if (Array.isArray(data.media) && data.media.length) {
          setUploaded(data.media)
        } else if (Array.isArray(data.gallery) && data.gallery.length) {
          const mapped = data.gallery.map((url: string) => ({
            url,
            filename: url.split('/').pop() || url,
            type: 'image',
            mediaType: 'image' as const,
            size: 0,
          }))
          setUploaded(mapped)
        }
      } catch {}
    })()
  }, [])

  const saveAndNext = async () => {
    if (uploaded.length === 0) {
      router.push('/onboarding/escort/step-5')
      return
    }
    setIsSaving(true)
    try {
      const payload = { media: uploaded }
      const res = await fetch('/api/onboarding/escort/step-4', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) {
        const out = await res.json().catch(() => ({}))
        setErrors([out.error || 'Speichern fehlgeschlagen'])
        return
      }
      router.push('/onboarding/escort/step-5')
    } catch (e) {
      setErrors(['Speichern fehlgeschlagen'])
    } finally {
      setIsSaving(false)
    }
  }

  const onPickFiles = () => fileInputRef.current?.click()

  const onFilesSelected: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = Array.from(e.target.files || [])
    const newErrors: string[] = []
    const accepted: File[] = []
    const maxImage = 15 * 1024 * 1024
    const maxVideo = 200 * 1024 * 1024
    const allowedImage = ['image/jpeg','image/jpg','image/png','image/webp','image/gif']
    const allowedVideo = ['video/mp4','video/webm','video/quicktime']

    for (const f of files) {
      const isImage = f.type.startsWith('image/')
      const isVideo = f.type.startsWith('video/')
      if (!isImage && !isVideo) {
        newErrors.push(`Ungültiger Typ: ${f.name}`)
        continue
      }
      if (isImage && !allowedImage.includes(f.type)) {
        newErrors.push(`Ungültiges Bildformat: ${f.name}`)
        continue
      }
      if (isVideo && !allowedVideo.includes(f.type)) {
        newErrors.push(`Ungültiges Videoformat: ${f.name}`)
        continue
      }
      if (isImage && f.size > maxImage) {
        newErrors.push(`Bild zu groß (max 15MB): ${f.name}`)
        continue
      }
      if (isVideo && f.size > maxVideo) {
        newErrors.push(`Video zu groß (max 200MB): ${f.name}`)
        continue
      }
      accepted.push(f)
    }

    setSelectedFiles(prev => [...prev, ...accepted])
    setErrors(newErrors)
    // reset input to allow re-selecting same files
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeSelected = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const uploadAll = async () => {
    if (selectedFiles.length === 0) return
    setIsUploading(true)
    setErrors([])
    try {
      const form = new FormData()
      form.append('type', 'gallery')
      for (const f of selectedFiles) form.append('files', f)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      if (!res.ok) {
        const out = await res.json().catch(() => ({}))
        setErrors([out.error || 'Fehler beim Upload'])
        return
      }
      const data = await res.json()
      const files = (data.files || []) as Array<{ url: string; filename: string; type: string; mediaType: 'image'|'video'; size: number }>
      setUploaded(prev => [...prev, ...files])
      setSelectedFiles([])
    } catch (e) {
      setErrors(['Fehler beim Upload'])
    } finally {
      setIsUploading(false)
    }
  }

  const deleteUploaded = async (filename: string) => {
    try {
      const res = await fetch(`/api/upload?filename=${encodeURIComponent(filename)}`, { method: 'DELETE' })
      if (!res.ok) return
      setUploaded(prev => prev.filter(f => f.filename !== filename))
    } catch {}
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Navigation */}
      <nav className="absolute top-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <Link href="/onboarding" className="flex items-center text-sm font-light tracking-widest text-gray-600 hover:text-pink-500 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ZURÜCK ZUM ONBOARDING
            </Link>
            <div className="text-sm font-light tracking-widest text-gray-600">
              ESCORT-EINRICHTUNG – SCHRITT 4/7
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex justify-center px-6 pt-20 pb-24">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-thin tracking-wider text-gray-800 mb-6">GALERIE</h1>
            <div className="w-24 h-px bg-pink-500 mx-auto mb-8"></div>
            <p className="text-lg font-light tracking-wide text-gray-600 max-w-md mx-auto mb-4">
              Fotos & Medien – Schritt 4 von 7
            </p>
            <div className="flex justify-center">
              <Badge className="bg-pink-500 text-white font-light tracking-widest px-4 py-1 rounded-none">SCHRITT 4/7</Badge>
            </div>
          </div>

          {/* Upload UI */}
          <div className="space-y-6">
            {errors.length > 0 && (
              <div className="p-4 border border-red-200 bg-red-50 text-sm text-red-700 font-light">
                {errors.map((er, i) => (<div key={i}>{er}</div>))}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              className="hidden"
              onChange={onFilesSelected}
            />

            <div
              className="border border-gray-200 bg-gray-50 p-6 text-center cursor-pointer hover:border-pink-500 transition-colors rounded-none"
              onClick={onPickFiles}
            >
              <div className="text-sm font-light text-gray-600">
                Dateien hier klicken, um Bilder/Videos auszuwählen (Bilder ≤ 15MB, Videos ≤ 200MB)
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="border border-gray-200 p-4">
                <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Ausgewählt</div>
                <ul className="space-y-2 text-sm font-light text-gray-700">
                  {selectedFiles.map((f, idx) => (
                    <li key={idx} className="flex items-center justify-between">
                      <span className="truncate mr-3">{f.name} · {formatBytes(f.size)}</span>
                      <Button type="button" variant="outline" onClick={() => removeSelected(idx)} className="rounded-none text-xs py-1 px-2">Entfernen</Button>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Button type="button" onClick={uploadAll} disabled={isUploading} className="rounded-none bg-pink-500 hover:bg-pink-600 text-white">
                    {isUploading ? 'Lädt hoch…' : 'Alle hochladen'}
                  </Button>
                </div>
              </div>
            )}

            {uploaded.length > 0 && (
              <div className="border border-gray-200 p-4">
                <div className="text-xs uppercase tracking-widest text-gray-500 mb-3">Hochgeladen</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {uploaded.map((f) => (
                    <div key={f.filename} className="border border-gray-200 p-2">
                      {f.mediaType === 'image' ? (
                        <img src={f.url} alt={f.filename} className="w-full h-32 object-cover" />
                      ) : (
                        <video src={f.url} controls className="w-full h-32 object-cover" />
                      )}
                      <div className="flex justify-between items-center mt-2 text-xs text-gray-600">
                        <span className="truncate" title={f.filename}>{f.filename}</span>
                        <button onClick={() => deleteUploaded(f.filename)} className="text-red-600 hover:underline">Löschen</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-6 pt-8">
            <Button 
              type="button"
              variant="outline"
              onClick={() => router.push('/onboarding')}
              className="flex-1 border-gray-300 text-gray-600 font-light tracking-widest py-4 text-sm uppercase hover:border-pink-500 hover:text-pink-500 rounded-none"
            >
              Zurück
            </Button>
            <Button 
              type="button"
              onClick={saveAndNext}
              disabled={isSaving}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-light tracking-widest py-4 text-sm uppercase rounded-none"
            >
              {isSaving ? 'Speichert…' : 'Speichern & Weiter'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
