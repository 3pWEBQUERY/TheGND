'use client'

import { MapPin, Calendar, Globe, Phone } from 'lucide-react'
import { getGenderDisplayName } from '@/lib/validations'

type Profile = any

type Props = {
  displayName: string
  userTypeLabel: string
  profile: Profile | null | undefined
  formattedLocation: string
  isOwnProfile: boolean
}

export default function ProfileIdentity({ displayName, userTypeLabel, profile, formattedLocation, isOwnProfile }: Props) {
  return (
    <div className="flex-1 space-y-6">
      <div>
        <h1 className="text-3xl font-thin tracking-wider text-gray-800">{displayName}</h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-xs font-light tracking-widest text-pink-500 uppercase px-3 py-1 border border-pink-200">
            {userTypeLabel}
          </span>
          {profile?.slogan && (
            <span className="text-sm font-light tracking-wide text-gray-600 italic">{profile.slogan}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {profile?.age && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="font-light tracking-wide text-gray-700">{profile.age} Jahre alt</span>
          </div>
        )}

        {profile?.gender && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500">♀♂</span>
            <span className="font-light tracking-wide text-gray-700">{getGenderDisplayName(profile.gender)}</span>
          </div>
        )}

        {formattedLocation && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="font-light tracking-wide text-gray-700">{formattedLocation}</span>
          </div>
        )}

        {profile?.nationality && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <span className="font-light tracking-wide text-gray-700">{String(profile.nationality)}</span>
          </div>
        )}

        {profile?.website && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-gray-500" />
            <a href={profile.website} target="_blank" rel="noopener noreferrer" 
               className="font-light tracking-wide text-pink-500 hover:text-pink-600 transition-colors">
              Webseite
            </a>
          </div>
        )}

        {profile?.phone && isOwnProfile && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="font-light tracking-wide text-gray-700">{profile.phone}</span>
          </div>
        )}
      </div>

      {profile?.languages && profile.languages.length > 0 && (
        <div>
          <h4 className="text-sm font-light tracking-widest text-gray-800 uppercase mb-3">SPRACHEN</h4>
          <div className="flex flex-wrap gap-2">
            {profile.languages.map((lang: string) => (
              <span key={lang} className="text-xs font-light tracking-widest text-gray-600 border border-gray-200 px-3 py-1 uppercase">
                {lang}
              </span>
            ))}
          </div>
        </div>
      )}

      {profile?.bio && (
        <div>
          <h4 className="text-sm font-light tracking-widest text-gray-800 uppercase mb-3">ÜBER MICH</h4>
          <p className="text-sm font-light tracking-wide text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}
    </div>
  )
}
