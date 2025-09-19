'use client'

import { ProfileViewPreview } from '@/components/ProfileFeed'

type Variant = 'STANDARD' | 'ALT1' | 'ALT2'

type Props = {
  selected: Variant | null
  onChange: (v: Variant) => void
  onSave: () => void
  saving: boolean
  savedAt?: number | null
}

export default function ProfileViewSelector({ selected, onChange, onSave, saving, savedAt }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-none">
      <div className="p-4 sm:p-8">
        <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-1">PROFILANSICHT</h3>
        <p className="text-sm text-gray-600 mb-4">Wähle eine von drei Ansichten für dein öffentliches Escort-Profil aus. Die Auswahl wird gespeichert und auf deiner Profilseite verwendet.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(['STANDARD','ALT1','ALT2'] as const).map((key) => (
            <label key={key} className={`border ${selected === key ? 'border-pink-500' : 'border-gray-200'} p-4 cursor-pointer flex flex-col gap-3`}>
              <ProfileViewPreview variant={key} />
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="profile-view"
                  className="accent-pink-500"
                  checked={selected === key}
                  onChange={() => onChange(key)}
                />
                <div>
                  <div className="text-sm font-light tracking-widest text-gray-800">{key === 'STANDARD' ? 'STANDARD' : key === 'ALT1' ? 'ALTERNATIVE 1' : 'ALTERNATIVE 2'}</div>
                  <div className="text-xs text-gray-500">{key === 'STANDARD' ? 'Aktuelle Standard-Ansicht' : key === 'ALT1' ? 'Kompakte Seitenleiste + Tabs' : 'Großes Hero + Sektionen'}</div>
                </div>
              </div>
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={onSave} disabled={!selected || saving} className={`px-5 py-2 text-xs tracking-widest uppercase ${saving ? 'bg-pink-400' : 'bg-pink-500 hover:bg-pink-600'} text-white`}>
            {saving ? 'SPEICHERN…' : 'AUSWAHL SPEICHERN'}
          </button>
          {savedAt && (
            <span className="text-xs text-emerald-600">Gespeichert</span>
          )}
        </div>
        <div className="mt-6">
          <div className="text-xs font-light tracking-widest text-gray-600 mb-2">AUSGEWÄHLTE ANSICHT</div>
          <ProfileViewPreview variant={(selected as any) || 'STANDARD'} />
        </div>
      </div>
    </div>
  )
}
