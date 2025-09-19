"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function PreferencesForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  const [services, setServices] = useState<string[]>([])
  const [city, setCity] = useState<string>('')
  const [country, setCountry] = useState<string>('')
  const [appearance, setAppearance] = useState<Record<string, any>>({
    bodyType: '',
    hairColor: '',
    eyeColor: '',
    hairLength: '',
    breastType: '',
    breastSize: '',
    intimateArea: '',
    clothingStyle: '',
    clothingSize: '',
    shoeSize: '',
    height: '',
    weight: '',
  })
  const [languages, setLanguages] = useState<string>('')
  const [piercings, setPiercings] = useState<string>('')
  const [tattoos, setTattoos] = useState<string>('')
  const [autoLikeMessage, setAutoLikeMessage] = useState<string>('Hallo! Danke fürs Vorbeischauen. Ich würde dich gerne kennenlernen. Schreib mir gerne zurück! \n\nLink zu meinen Nachrichten: http://localhost:3000/dashboard?tab=messages')

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/matching/preferences', { cache: 'no-store' })
        const data = await res.json()
        if (res.ok) {
          const p = data?.preferences || {}
          setServices(Array.isArray(p.services) ? p.services : [])
          setCity(typeof p.city === 'string' ? p.city : '')
          setCountry(typeof p.country === 'string' ? p.country : '')
          setAppearance({
            bodyType: p?.appearance?.bodyType || '',
            hairColor: p?.appearance?.hairColor || '',
            eyeColor: p?.appearance?.eyeColor || '',
            hairLength: p?.appearance?.hairLength || '',
            breastType: p?.appearance?.breastType || '',
            breastSize: p?.appearance?.breastSize || '',
            intimateArea: p?.appearance?.intimateArea || '',
            clothingStyle: p?.appearance?.clothingStyle || '',
            clothingSize: p?.appearance?.clothingSize || '',
            shoeSize: p?.appearance?.shoeSize || '',
            height: p?.appearance?.height || '',
            weight: p?.appearance?.weight || '',
          })
          setLanguages(Array.isArray(p.languages) ? p.languages.join(', ') : (typeof p.languages === 'string' ? p.languages : ''))
          setPiercings(Array.isArray(p.piercings) ? p.piercings.join(', ') : (typeof p.piercings === 'string' ? p.piercings : ''))
          setTattoos(Array.isArray(p.tattoos) ? p.tattoos.join(', ') : (typeof p.tattoos === 'string' ? p.tattoos : ''))
          setAutoLikeMessage(typeof p.autoLikeMessage === 'string' && p.autoLikeMessage ? p.autoLikeMessage : autoLikeMessage)
        } else {
          setError(data?.error || 'Fehler beim Laden')
        }
      } catch {
        setError('Fehler beim Laden')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const toggleService = (key: string) => {
    setServices((prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key])
  }

  const submit = async () => {
    setSaving(true)
    setError(null)
    setOk(null)
    try {
      const languagesArr = languages.split(',').map(s => s.trim()).filter(Boolean)
      const piercingsArr = piercings.split(',').map(s => s.trim()).filter(Boolean)
      const tattoosArr = tattoos.split(',').map(s => s.trim()).filter(Boolean)
      const res = await fetch('/api/matching/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ services, city, country, appearance, languages: languagesArr, piercings: piercingsArr, tattoos: tattoosArr, autoLikeMessage })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
      setOk('Gespeichert')
    } catch (e: any) {
      setError(e?.message || 'Fehler beim Speichern')
    } finally {
      setSaving(false)
    }
  }

  const serviceOptions = [
    'GFE', 'Dinner Date', 'Overnight', 'Duo', 'Massage', 'Strip', 'Fetish'
  ]

  if (loading) return <div className="text-sm text-gray-500">Lade…</div>

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-thin tracking-wider text-gray-900">Präferenzen</h2>
          <div className="w-24 h-px bg-pink-500 mt-3" />
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-sm font-medium tracking-widest text-gray-800 uppercase">Services</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {serviceOptions.map((key) => (
              <button key={key} onClick={() => toggleService(key)} className={`px-3 py-1 text-xs uppercase tracking-widest border ${services.includes(key) ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-300 text-gray-700'}`}>{key}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600">Stadt</label>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600">Land</label>
            <input value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 w-full border border-gray-300 px-3 py-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600">Körperbau</label>
            <input value={appearance.bodyType} onChange={(e) => setAppearance({ ...appearance, bodyType: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600">Haarfarbe</label>
            <input value={appearance.hairColor} onChange={(e) => setAppearance({ ...appearance, hairColor: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-gray-600">Augenfarbe</label>
            <input value={appearance.eyeColor} onChange={(e) => setAppearance({ ...appearance, eyeColor: e.target.value })} className="mt-1 w-full border border-gray-300 px-3 py-2" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={submit} disabled={saving} className="tracking-widest">{saving ? 'Speichern…' : 'Speichern'}</Button>
          {ok && <span className="text-xs text-emerald-600">{ok}</span>}
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>
    </div>
  )
}
