'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Phone, 
  Mail, 
  Edit,
  Heart,
  MessageCircle,
  Camera,
  Users,
  X,
  Trash2
} from 'lucide-react'
import { getUserTypeDisplayName, getGenderDisplayName, formatTimeAgo } from '@/lib/validations'
import { UserType, Gender } from '@prisma/client'
import { formatLocation } from '@/lib/utils'
import { COUNTRIES_DE } from '@/data/countries.de'

interface ProfileData {
  user: {
    id: string
    email: string
    userType: UserType
    onboardingStatus: string
    isActive: boolean
    createdAt: string
    profile?: {
      id: string
      displayName?: string
      bio?: string
      avatar?: string
      location?: string
      age?: number
      gender?: Gender
      preferences?: string
      slogan?: string
      nationality?: string | string[]
      languages?: string[]
      height?: string
      weight?: string
      bodyType?: string
      hairColor?: string
      eyeColor?: string
      description?: string
      services?: string
      gallery?: string[]
      media?: any[]
      address?: string
      city?: string
      country?: string
      zipCode?: string
      phone?: string
      website?: string
      socialMedia?: Record<string, string>
      companyName?: string
      businessType?: string
      established?: string
    }
    posts: any[]
    followers: any[]
    following: any[]
    stories: any[]
  }
}

export default function ProfileComponent({ userId }: { userId?: string }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('about')
  const editBtnRef = useRef<HTMLButtonElement | null>(null)
  const [avatarSize, setAvatarSize] = useState<number | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)

  const isOwnProfile = !userId || userId === session?.user?.id

  useEffect(() => {
    fetchProfile()
  }, [userId])

  // Avatar-Größe an Button-Breite anpassen (Breite = Höhe)
  useLayoutEffect(() => {
    if (!isOwnProfile) return
    const btn = editBtnRef.current
    if (!btn) return

    const measureNow = () => setAvatarSize(btn.getBoundingClientRect().width)
    const rafMeasure = () => requestAnimationFrame(measureNow)

    // Initial messen nach Layout
    measureNow()
    // Kurz nach dem nächsten Frame nachmessen
    const rafId = requestAnimationFrame(measureNow)
    // Nach Font-Ladeereignis erneut messen (falls verfügbar)
    let fontPromise: Promise<any> | null = null
    // @ts-ignore - fonts ist nicht in allen TS-DOM-Typen vorhanden
    if (document && (document as any).fonts?.ready) {
      // @ts-ignore
      fontPromise = (document as any).fonts.ready.then(() => rafMeasure())
    }
    // Leicht verzögert erneut messen (Fallback)
    const t = setTimeout(measureNow, 150)

    // Beobachte Breitenänderungen des Buttons (z. B. bei responsive Layouts)
    const ro = new ResizeObserver((entries) => {
      // Remeasure via border-box (getBoundingClientRect) für exakte Pixel inkl. Padding/Borders
      if (btn) setAvatarSize(btn.getBoundingClientRect().width)
    })
    ro.observe(btn)
    const onResize = () => measureNow()
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      clearTimeout(t)
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
    }
  }, [isOwnProfile, profileData])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-sm font-light tracking-widest text-gray-600">PROFIL WIRD GELADEN...</div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-sm font-light tracking-widest text-red-600">PROFIL NICHT GEFUNDEN</div>
      </div>
    )
  }

  const { user } = profileData
  const profile = user.profile
  const userType = user.userType
  const displayName = profile?.displayName || user.email
  const formattedLocation = formatLocation(profile)
  // Build a quick lookup for code -> German label
  const COUNTRY_LABEL_BY_CODE: Record<string, string> = Object.fromEntries(
    (COUNTRIES_DE || []).map((c) => [String(c.value).toUpperCase(), c.label])
  )

  const toLabel = (val: string) => {
    const raw = (val ?? '').toString()
    if (!raw) return ''
    // Remove surrounding quotes and any non-letter characters
    const stripped = raw.replace(/^\s*["']|["']\s*$/g, '').replace(/[^A-Za-z,\s-]/g, '').trim()
    if (!stripped) return ''
    const upper = stripped.toUpperCase()
    return COUNTRY_LABEL_BY_CODE[upper] || stripped
  }

  const nationalityDisplay = (() => {
    const n = profile?.nationality as unknown
    if (!n) return ''
    if (Array.isArray(n)) return (n as string[]).filter(Boolean).map(toLabel).join(', ')
    if (typeof n === 'string') {
      const s = n.trim()
      // Try to parse JSON-like strings (e.g., "[\"DE\",\"AT\"]")
      if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}')) || (s.startsWith('"') && s.endsWith('"'))) {
        try {
          const parsed = JSON.parse(s)
          if (Array.isArray(parsed)) return parsed.filter(Boolean).map((x: any) => toLabel(String(x))).join(', ')
          if (typeof parsed === 'string') return toLabel(parsed)
        } catch {}
      }
      // Support comma-separated values as a fallback
      if (s.includes(',')) {
        return s.split(',').map((x) => toLabel(x)).filter(Boolean).join(', ')
      }
      return toLabel(s)
    }
    return ''
  })()
  // Medien (Bilder/Videos) aus Profile.media und Profile.gallery vereinheitlichen
  const mediaItems = (() => {
    const rawMedia = (profile as any)?.media ?? []
    const rawGallery = profile?.gallery ?? []
    const normalizedFromMedia = Array.isArray(rawMedia)
      ? rawMedia
          .map((item: any) => {
            if (!item) return null
            if (typeof item === 'string') return { type: 'image', url: item, source: 'media' as const }
            if (item.url) {
              const isVideo =
                item.type === 'video' ||
                !!item.video ||
                (typeof item.url === 'string' && /\.(mp4|webm|ogg)$/i.test(item.url))
              return {
                type: isVideo ? 'video' : 'image',
                url: item.url,
                title: item.title,
                description: item.description,
                thumbnail: item.thumbnail,
                source: 'media' as const,
              }
            }
            if (item.image) return { type: 'image', url: item.image, source: 'media' as const }
            if (item.video) return { type: 'video', url: item.video, thumbnail: item.thumbnail, source: 'media' as const }
            return null
          })
          .filter(Boolean)
      : []
    const normalizedFromGallery = Array.isArray(rawGallery)
      ? (rawGallery as string[]).map((url) => ({ type: 'image' as const, url, source: 'gallery' as const }))
      : []
    return [...(normalizedFromMedia as any[]), ...normalizedFromGallery]
  })()

  // Entfernt ein Medium aus media oder gallery und persistiert die Änderung
  const handleDeleteMedia = async (item: any, index: number) => {
    if (!profile) return
    setDeletingIndex(index)
    try {
      const currentMediaRaw = Array.isArray((profile as any).media) ? [...(profile as any).media] : []
      const currentGalleryRaw = Array.isArray(profile.gallery) ? [...profile.gallery] : []

      let newMediaRaw = currentMediaRaw
      let newGalleryRaw = currentGalleryRaw

      if (item.source === 'media') {
        newMediaRaw = currentMediaRaw.filter((m: any) => {
          if (!m) return false
          if (typeof m === 'string') return m !== item.url
          if (m.url) return m.url !== item.url
          if (m.image) return m.image !== item.url
          if (m.video) return m.video !== item.url
          return true
        })
      } else if (item.source === 'gallery') {
        newGalleryRaw = currentGalleryRaw.filter((url: string) => url !== item.url)
      }

      const resp = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData: { media: newMediaRaw, gallery: newGalleryRaw } }),
      })

      if (!resp.ok) {
        console.error('Fehler beim Aktualisieren des Profils')
        return
      }

      // Profil neu laden, damit UI und normalisierte mediaItems konsistent sind
      await fetchProfile()

      // Lightbox-Index anpassen, falls nötig
      setLightboxIndex((prev) => {
        if (prev === null) return prev
        if (prev === index) return null
        if (prev > index) return prev - 1
        return prev
      })
    } catch (err) {
      console.error('Löschen fehlgeschlagen:', err)
    } finally {
      setDeletingIndex(null)
    }
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 px-4 sm:px-6 overflow-x-hidden">
      {/* Profile Header */}
      <div className="bg-white border border-gray-100 rounded-none">
        <div className="p-4 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col items-center lg:items-start space-y-6">
              <div
                className="bg-gray-100 flex-none flex items-center justify-center"
                style={{
                  width: avatarSize ?? 0,
                  height: avatarSize ?? 0,
                  minWidth: avatarSize ?? 0,
                  minHeight: avatarSize ?? 0,
                }}
              >
                {profile?.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-light tracking-widest text-gray-600">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              {isOwnProfile && (
                <button 
                  ref={editBtnRef}
                  onClick={() => router.push('/profile/edit')}
                  className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-light tracking-widest px-6 py-3 transition-colors uppercase flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>PROFIL BEARBEITEN</span>
                </button>
              )}
              
              {!isOwnProfile && (
                <div className="flex gap-3">
                  <button className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-light tracking-widest px-6 py-3 transition-colors uppercase flex items-center space-x-2">
                    <Users className="h-4 w-4" />
                    <span>FOLGEN</span>
                  </button>
                  <button className="border border-gray-300 text-gray-600 hover:border-pink-500 hover:text-pink-500 text-xs font-light tracking-widest px-6 py-3 transition-colors uppercase flex items-center space-x-2">
                    <MessageCircle className="h-4 w-4" />
                    <span>NACHRICHT</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* Profile Details */}
            <div className="flex-1 space-y-6">
              <div>
                <h1 className="text-3xl font-thin tracking-wider text-gray-800">{displayName}</h1>
                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs font-light tracking-widest text-pink-500 uppercase px-3 py-1 border border-pink-200">
                    {getUserTypeDisplayName(userType)}
                  </span>
                  {profile?.slogan && (
                    <span className="text-sm font-light tracking-wide text-gray-600 italic">{profile.slogan}</span>
                  )}
                </div>
              </div>
              
              {/* Basic Info Grid */}
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
                
                {nationalityDisplay && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="font-light tracking-wide text-gray-700">{nationalityDisplay}</span>
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
              
              {/* Languages */}
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
              
              {/* Bio */}
              {profile?.bio && (
                <div>
                  <h4 className="text-sm font-light tracking-widest text-gray-800 uppercase mb-3">ÜBER MICH</h4>
                  <p className="text-sm font-light tracking-wide text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
              
              {/* Stats */}
              <div className="flex gap-8 pt-6 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-xl font-thin tracking-wider text-gray-800">{user.posts.length}</div>
                  <div className="text-xs font-light tracking-widest text-gray-500 uppercase">BEITRÄGE</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-thin tracking-wider text-gray-800">{user.followers.length}</div>
                  <div className="text-xs font-light tracking-widest text-gray-500 uppercase">FOLLOWER</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-thin tracking-wider text-gray-800">{user.following.length}</div>
                  <div className="text-xs font-light tracking-widest text-gray-500 uppercase">FOLGE ICH</div>
                </div>
                {user.stories.length > 0 && (
                  <div className="text-center">
                    <div className="text-xl font-thin tracking-wider text-gray-800">{user.stories.length}</div>
                    <div className="text-xs font-light tracking-widest text-gray-500 uppercase">STORIES</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Profile Tabs */}
      <div className="bg-white border border-gray-100 rounded-none">
        <div className="border-b border-gray-100 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 sm:gap-0 min-w-max">
            {['about', 'posts', 'gallery', 'contact'].map((tab) => (
              <button 
                key={tab}
                className={`shrink-0 sm:flex-1 sm:text-center py-3 sm:py-4 px-4 sm:px-6 text-xs font-light tracking-widest uppercase transition-colors ${
                  activeTab === tab 
                    ? 'text-pink-500 border-b-2 border-pink-500' 
                    : 'text-gray-600 hover:text-pink-500'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab === 'about' ? 'DETAILS' : 
                 tab === 'posts' ? 'BEITRÄGE' : 
                 tab === 'gallery' ? 'GALLERIE' : 'KONTAKT'}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tab Content */}
        <div className="p-4 sm:p-8">
          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Escort Specific Info */}
              {userType === 'ESCORT' && profile && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Appearance */}
                  {(profile.height || profile.weight || profile.bodyType || profile.hairColor || profile.eyeColor) && (
                    <div className="bg-gray-50 p-6">
                      <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">AUSSEHEN</h3>
                      <div className="w-12 h-px bg-pink-500 mb-6"></div>
                      <div className="space-y-3">
                        {profile.height && <div className="text-sm font-light tracking-wide text-gray-700"><strong>Größe:</strong> {profile.height}</div>}
                        {profile.weight && <div className="text-sm font-light tracking-wide text-gray-700"><strong>Gewicht:</strong> {profile.weight}</div>}
                        {profile.bodyType && <div className="text-sm font-light tracking-wide text-gray-700"><strong>Körpertyp:</strong> {profile.bodyType}</div>}
                        {profile.hairColor && <div className="text-sm font-light tracking-wide text-gray-700"><strong>Haarfarbe:</strong> {profile.hairColor}</div>}
                        {profile.eyeColor && <div className="text-sm font-light tracking-wide text-gray-700"><strong>Augenfarbe:</strong> {profile.eyeColor}</div>}
                      </div>
                    </div>
                  )}
                  
                  {/* Description */}
                  {profile.description && (
                    <div className="bg-gray-50 p-6">
                      <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">BESCHREIBUNG</h3>
                      <div className="w-12 h-px bg-pink-500 mb-6"></div>
                      <p className="text-sm font-light tracking-wide text-gray-700 leading-relaxed">{profile.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {user.posts.length > 0 ? (
                user.posts.map((post: any) => (
                  <div key={post.id} className="bg-gray-50 p-4 sm:p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-12 w-12 bg-gray-200 flex items-center justify-center">
                        {profile?.avatar ? (
                          <img 
                            src={profile.avatar} 
                            alt="Profile" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-light tracking-widest text-gray-600">
                            {displayName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <span className="text-sm font-light tracking-wide text-gray-800">{displayName}</span>
                          <span className="text-xs font-light tracking-wide text-gray-500">
                            {formatTimeAgo(new Date(post.createdAt))}
                          </span>
                        </div>
                        <p className="text-sm font-light tracking-wide text-gray-700 leading-relaxed mb-4">{post.content}</p>
                        <div className="flex items-center space-x-6 text-xs font-light tracking-wide text-gray-500">
                          <button className="flex items-center space-x-2 hover:text-pink-500 transition-colors">
                            <Heart className="h-4 w-4" />
                            <span>{post.likes.length} GEFÄLLT MIR</span>
                          </button>
                          <button className="flex items-center space-x-2 hover:text-pink-500 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments.length} KOMMENTARE</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageCircle className="h-16 w-16 mx-auto mb-6 opacity-30 text-gray-400" />
                  <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">KEINE BEITRÄGE VORHANDEN</h3>
                  <div className="w-12 h-px bg-pink-500 mx-auto mb-4"></div>
                  <p className="text-sm font-light tracking-wide text-gray-500">Keine Beiträge verfügbar</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'gallery' && (
            <div>
              {mediaItems.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaItems.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="relative group aspect-square overflow-hidden bg-black/5 cursor-pointer"
                      onClick={() => setLightboxIndex(index)}
                    >
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          className="w-full h-full object-cover"
                          muted
                          playsInline
                          poster={item.thumbnail || undefined}
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={`Media ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      {isOwnProfile && (
                        <button
                          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-gray-700 hover:text-red-600 transition-colors shadow-sm hidden group-hover:flex"
                          onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item, index) }}
                          disabled={deletingIndex === index}
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Camera className="h-16 w-16 mx-auto mb-6 opacity-30 text-gray-400" />
                  <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">KEINE MEDIEN</h3>
                  <div className="w-12 h-px bg-pink-500 mx-auto mb-4"></div>
                  <p className="text-sm font-light tracking-wide text-gray-500">Keine Bilder oder Videos vorhanden</p>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'contact' && profile && (
            <div className="bg-gray-50 p-6">
              <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">KONTAKTINFORMATIONEN</h3>
              <div className="w-12 h-px bg-pink-500 mb-6"></div>
              
              <div className="space-y-4">
                {profile.address && (
                  <div>
                    <div className="text-sm font-light tracking-wide text-gray-700 mb-2"><strong>Adresse:</strong></div>
                    <div className="text-sm font-light tracking-wide text-gray-700">
                      {profile.address}<br />
                      {profile.zipCode} {profile.city}<br />
                      {profile.country}
                    </div>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-light tracking-wide text-gray-700">
                      {isOwnProfile ? profile.phone : 'Telefon verfügbar'}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-light tracking-wide text-gray-700">
                    {isOwnProfile ? user.email : 'E-Mail verfügbar'}
                  </span>
                </div>
                
                {profile.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" 
                       className="text-sm font-light tracking-wide text-pink-500 hover:text-pink-600 transition-colors">
                      {profile.website}
                    </a>
                  </div>
                )}
                
                {profile.socialMedia && Object.keys(profile.socialMedia).length > 0 && (
                  <div>
                    <div className="text-sm font-light tracking-wide text-gray-700 mb-2"><strong>Soziale Medien:</strong></div>
                    <div className="space-y-1">
                      {Object.entries(profile.socialMedia).map(([platform, url]) => (
                        <div key={platform}>
                          <a href={url as string} target="_blank" rel="noopener noreferrer" 
                             className="text-sm font-light tracking-wide text-pink-500 hover:text-pink-600 transition-colors capitalize">
                            {platform}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {lightboxIndex !== null && mediaItems[lightboxIndex] && (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6" onClick={() => setLightboxIndex(null)}>
        <div className="relative max-w-5xl w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
          <button
            className="absolute -top-4 -right-4 bg-white text-gray-700 hover:text-black p-2 shadow"
            onClick={() => setLightboxIndex(null)}
            aria-label="Schließen"
          >
            <X className="h-5 w-5" />
          </button>
          {mediaItems[lightboxIndex].type === 'video' ? (
            <video
              src={mediaItems[lightboxIndex].url}
              className="max-h-[90vh] max-w-[90vw]"
              controls
              autoPlay
              poster={mediaItems[lightboxIndex].thumbnail || undefined}
            />
          ) : (
            <img
              src={mediaItems[lightboxIndex].url}
              alt={`Media ${lightboxIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
            />
          )}
        </div>
      </div>
    )}
  </>
)
}