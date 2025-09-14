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
  User,
  Trash2,
  X
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaXTwitter, FaYoutube, FaLinkedin, FaWhatsapp, FaTelegram, FaTiktok, FaSnapchat } from 'react-icons/fa6'
import { getUserTypeDisplayName, getGenderDisplayName, formatTimeAgo } from '@/lib/validations'
import { UserType, Gender } from '@prisma/client'
import { formatLocation } from '@/lib/utils'
import { COUNTRIES_DE } from '@/data/countries.de'
import { ProfileViewPreview } from '@/components/ProfileFeed'

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
  const [showFullDesc, setShowFullDesc] = useState(false)
  const [settingAvatarUrl, setSettingAvatarUrl] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<'STANDARD' | 'ALT1' | 'ALT2' | null>(null)
  const [savingView, setSavingView] = useState(false)
  const [savedViewAt, setSavedViewAt] = useState<number | null>(null)


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
        const pv = data?.user?.profile?.profileView as any
        if (pv === 'STANDARD' || pv === 'ALT1' || pv === 'ALT2') {
          setSelectedView(pv)
        } else {
          setSelectedView('STANDARD')
        }
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
  const hasAvatar = !!(profile?.avatar && String(profile.avatar).trim())
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
  
  // Formatting helpers for appearance fields
  const toStr = (v: any) => (v === null || v === undefined) ? '' : String(v).trim()
  const withUnit = (v: any, unit: string) => {
    const s = toStr(v)
    if (!s) return ''
    const low = s.toLowerCase()
    if (low.includes(unit.toLowerCase())) return s
    if (/^\d+(?:[\.,]\d+)?$/.test(s)) return `${s.replace(',', '.')} ${unit}`
    return s
  }
  const formatHeight = (v: any) => withUnit(v, 'cm')
  const formatWeight = (v: any) => withUnit(v, 'kg')
  const formatShoeSize = (v: any) => withUnit(v, 'EU')
  // Brand colors per social platform (for contact tab badges)
  const brandColor = (key: string): string => {
    const k = (key || '').toLowerCase()
    if (k === 'whatsapp') return '#25D366'
    if (k === 'instagram') return '#E4405F'
    if (k === 'facebook') return '#1877F2'
    if (k === 'twitter' || k === 'x') return '#1DA1F2'
    if (k === 'youtube') return '#FF0000'
    if (k === 'linkedin') return '#0A66C2'
    if (k === 'telegram') return '#26A5E4'
    if (k === 'tiktok') return '#000000'
    if (k === 'snapchat') return '#FFFC00'
    return '#6B7280'
  }
  
  // Generic label formatters for enum-like or array-like values
  const capitalizeWords = (s: string) => s.replace(/\b\w/g, (c) => c.toUpperCase())
  const prettifyToken = (v: any): string => {
    const s = toStr(v)
    if (!s) return ''
    // keep single-letter cup sizes uppercase
    if (/^[a-z]$/i.test(s)) return s.toUpperCase()
    return capitalizeWords(s.replace(/[\[\]"]+/g, '').replace(/[_-]+/g, ' ').toLowerCase())
  }
  const parseJsonish = (s: string): any => {
    try {
      const trimmed = s.trim()
      if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
        return JSON.parse(trimmed)
      }
    } catch {}
    return s
  }
  const toArray = (v: any): any[] => {
    if (v === null || v === undefined) return []
    if (Array.isArray(v)) return v
    if (typeof v === 'string') {
      const parsed = parseJsonish(v)
      if (Array.isArray(parsed)) return parsed
      const s = toStr(parsed)
      if (!s) return []
      if (s.includes(',')) return s.split(',').map((x) => x.trim()).filter(Boolean)
      return [s]
    }
    return [v]
  }
  const formatEnumList = (v: any): string => {
    const arr = toArray(v)
    const out = arr.map(prettifyToken).filter(Boolean).join(', ')
    return out
  }
  const formatPiercings = (v: any): string => {
    if (typeof v === 'boolean') return v ? 'Ja' : 'Nein'
    return formatEnumList(v)
  }
  const formatTattoos = (v: any): string => {
    if (typeof v === 'boolean') return v ? 'Ja' : 'Nein'
    return formatEnumList(v)
  }
  const formatBreast = (type: any, size: any, cup: any): string => {
    const parts: string[] = []
    const typeStr = formatEnumListDE(type)
    if (typeStr) parts.push(typeStr)
    const sizeRaw = toStr(size || cup)
    if (sizeRaw) parts.push(/^[a-z]$/i.test(sizeRaw) ? sizeRaw.toUpperCase() : prettifyToken(sizeRaw))
    return parts.join(', ')
  }
  const formatIntimate = (area: any, pubicHair: any, style: any): string => {
    const parts = [formatEnumList(area), formatEnumList(pubicHair), formatEnumList(style)].filter(Boolean)
    return parts.join(', ')
  }
  // DE translation for common enum tokens
  const translateTokenDE = (token: string): string => {
    const t = token.toLowerCase().replace(/[_\-\s]+/g, '')
    const map: Record<string, string> = {
      slim: 'Schlank', petite: 'Zierlich', athletic: 'Athletisch', fit: 'Fit', average: 'Durchschnittlich', curvy: 'Kurvig', bbw: 'Mollig',
      blonde: 'Blond', blond: 'Blond', brunette: 'Brünett', brown: 'Braun', black: 'Schwarz', red: 'Rot', auburn: 'Kupfer', chestnut: 'Kastanienbraun',
      darkbrown: 'Dunkelbraun', lightbrown: 'Hellbraun', grey: 'Grau', gray: 'Grau', silver: 'Silber', dyed: 'Gefärbt', highlights: 'Strähnen',
      short: 'Kurz', medium: 'Mittel', shoulderlength: 'Schulterlang', long: 'Lang', verylong: 'Sehr lang', bob: 'Bob',
      blue: 'Blau', green: 'Grün', hazel: 'Hasel', amber: 'Bernstein',
      natural: 'Natürlich', implants: 'Implantat', implant: 'Implantat', enhanced: 'Vergrößert',
      shaved: 'Rasiert', fullyshaved: 'Komplett rasiert', partiallyshaved: 'Teilrasiert', trimmed: 'Getrimmt', naturalhair: 'Natürlich', landingstrip: 'Landing Strip', brazilian: 'Brasilianisch', waxed: 'Gewaxt',
      ears: 'Ohren', navel: 'Bauchnabel', nipples: 'Brustwarzen', tongue: 'Zunge', nose: 'Nase', lip: 'Lippe', eyebrow: 'Augenbraue', intimate: 'Intim',
      arms: 'Arme', legs: 'Beine', back: 'Rücken', chest: 'Brust', neck: 'Nacken', shoulder: 'Schulter', small: 'Klein', large: 'Groß',
      elegant: 'Elegant', casual: 'Lässig', sexy: 'Sexy', business: 'Business', sporty: 'Sportlich', chic: 'Chic', street: 'Streetwear', classic: 'Klassisch'
    }
    return map[t] || capitalizeWords(token.replace(/[_-]+/g, ' ').toLowerCase())
  }
  const formatEnumListDE = (v: any): string => toArray(v).map((x) => translateTokenDE(String(x))).filter(Boolean).join(', ')
  const badgeElementsDE = (v: any) => {
    const arr = toArray(v)
    return arr.map((x, i) => (
      <span key={`${String(x)}-${i}`} className="inline-flex items-center px-2.5 py-1 border border-gray-200 bg-gray-50 text-gray-700 text-xs rounded-none">
        {translateTokenDE(String(x))}
      </span>
    ))
  }

  // Helper to build slug for preview links
  const slugify = (input: string): string => {
    return (input || '')
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  const handleSaveProfileView = async () => {
    if (!selectedView) return
    try {
      setSavingView(true)
      const resp = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData: { profileView: selectedView } }),
      })
      if (!resp.ok) {
        console.error('Fehler beim Speichern der Profilansicht')
        return
      }
      setSavedViewAt(Date.now())
    } catch (e) {
      console.error('Profilansicht speichern fehlgeschlagen:', e)
    } finally {
      setSavingView(false)
    }
  }
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

  // Set an image from gallery/media as profile avatar
  const handleSetAvatar = async (url: string) => {
    if (!profile) return
    try {
      setSettingAvatarUrl(url)
      const resp = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData: { avatar: url } }),
      })
      if (!resp.ok) {
        console.error('Fehler beim Setzen des Avatars')
        return
      }
      // Update local state optimistically
      setProfileData((prev: ProfileData | null) => {
        if (!prev) return prev
        const next: ProfileData = {
          ...prev,
          user: {
            ...prev.user,
            profile: { ...(prev.user.profile as any), avatar: url } as any,
          },
        }
        return next
      })
    } catch (e) {
      console.error('Avatar-Update fehlgeschlagen:', e)
    } finally {
      setSettingAvatarUrl(null)
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
                  onClick={() => router.push('/onboarding?edit=1')}
                  className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-light tracking-widest px-6 py-3 transition-colors uppercase flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>PROFIL BEARBEITEN</span>
                </button>
              )}

              {/* Avatar-Editor entfernt */}
              
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
      
      {/* Escort View Selection (owner only) */}
      {isOwnProfile && userType === 'ESCORT' && (
        <div className="bg-white border border-gray-100 rounded-none">
          <div className="p-4 sm:p-8">
            <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-1">PROFILANSICHT</h3>
            <p className="text-sm text-gray-600 mb-4">Wähle eine von drei Ansichten für dein öffentliches Escort-Profil aus. Die Auswahl wird gespeichert und auf deiner Profilseite verwendet.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['STANDARD','ALT1','ALT2'] as const).map((key) => (
                <label key={key} className={`border ${selectedView === key ? 'border-pink-500' : 'border-gray-200'} p-4 cursor-pointer flex flex-col gap-3`}>
                  <ProfileViewPreview variant={key} />
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="profile-view"
                      className="accent-pink-500"
                      checked={selectedView === key}
                      onChange={() => setSelectedView(key)}
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
              <button onClick={handleSaveProfileView} disabled={!selectedView || savingView} className={`px-5 py-2 text-xs tracking-widest uppercase ${savingView ? 'bg-pink-400' : 'bg-pink-500 hover:bg-pink-600'} text-white`}>
                {savingView ? 'SPEICHERN…' : 'AUSWAHL SPEICHERN'}
              </button>
              {savedViewAt && (
                <span className="text-xs text-emerald-600">Gespeichert</span>
              )}
            </div>

            {/* Selected View Large Preview */}
            <div className="mt-6">
              <div className="text-xs font-light tracking-widest text-gray-600 mb-2">AUSGEWÄHLTE ANSICHT</div>
              <ProfileViewPreview variant={(selectedView as any) || 'STANDARD'} />
            </div>

            {/* Avatar-Editor Modal entfernt */}

            {/* Removed manual preview links */}
          </div>
        </div>
      )}

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
                  {(profile.height || profile.weight || profile.bodyType || profile.hairColor || profile.eyeColor ||
                    (profile as any)?.hairLength || (profile as any)?.breastType || (profile as any)?.breastSize || (profile as any)?.cupSize ||
                    (profile as any)?.intimateArea || (profile as any)?.pubicHair || (profile as any)?.intimateStyle ||
                    (profile as any)?.piercings !== undefined || (profile as any)?.tattoos !== undefined ||
                    (profile as any)?.clothingStyle || (profile as any)?.dressSize || (profile as any)?.shoeSize) && (
                    <div className="bg-gray-50 p-6">
                      <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">AUSSEHEN</h3>
                      <div className="w-12 h-px bg-pink-500 mb-6"></div>
                      <div className="space-y-3">
                        {profile.height && (
                          <div className="text-sm font-light tracking-wide text-gray-700"><strong>Größe:</strong> {formatHeight(profile.height)}</div>
                        )}
                        {profile.weight && (
                          <div className="text-sm font-light tracking-wide text-gray-700"><strong>Gewicht:</strong> {formatWeight(profile.weight)}</div>
                        )}
                        {profile.bodyType && (
                          <div className="text-sm font-light tracking-wide text-gray-700">
                            <strong>Körpertyp:</strong>{' '}
                            {toArray(profile.bodyType).length > 1 ? (
                              <span className="ml-1 inline-flex flex-wrap gap-2 align-middle">{badgeElementsDE(profile.bodyType)}</span>
                            ) : (
                              <span className="ml-1">{formatEnumListDE(profile.bodyType)}</span>
                            )}
                          </div>
                        )}
                        {profile.hairColor && (
                          <div className="text-sm font-light tracking-wide text-gray-700">
                            <strong>Haarfarbe:</strong>{' '}
                            {toArray(profile.hairColor).length > 1 ? (
                              <span className="ml-1 inline-flex flex-wrap gap-2 align-middle">{badgeElementsDE(profile.hairColor)}</span>
                            ) : (
                              <span className="ml-1">{formatEnumListDE(profile.hairColor)}</span>
                            )}
                          </div>
                        )}
                        {(profile as any)?.hairLength && (
                          <div className="text-sm font-light tracking-wide text-gray-700">
                            <strong>Haarlänge:</strong>{' '}
                            {toArray((profile as any).hairLength).length > 1 ? (
                              <span className="ml-1 inline-flex flex-wrap gap-2 align-middle">{badgeElementsDE((profile as any).hairLength)}</span>
                            ) : (
                              <span className="ml-1">{formatEnumListDE((profile as any).hairLength)}</span>
                            )}
                          </div>
                        )}
                        {profile.eyeColor && (
                          <div className="text-sm font-light tracking-wide text-gray-700">
                            <strong>Augenfarbe:</strong>{' '}
                            {toArray(profile.eyeColor).length > 1 ? (
                              <span className="ml-1 inline-flex flex-wrap gap-2 align-middle">{badgeElementsDE(profile.eyeColor)}</span>
                            ) : (
                              <span className="ml-1">{formatEnumListDE(profile.eyeColor)}</span>
                            )}
                          </div>
                        )}
                        {((profile as any)?.breastType || (profile as any)?.breastSize || (profile as any)?.cupSize) && (() => {
                          const sizeRaw = toStr((profile as any)?.breastSize || (profile as any)?.cupSize)
                          const cupOrSize = sizeRaw ? (/^[a-z]$/i.test(sizeRaw) ? sizeRaw.toUpperCase() : prettifyToken(sizeRaw)) : ''
                          const typeRaw = (profile as any)?.breastType
                          const tokens = [cupOrSize, typeRaw].filter(Boolean)
                          return (
                            <div className="text-sm font-light tracking-wide text-gray-700">
                              <strong>Brust:</strong>{' '}
                              <span className="ml-1 inline-flex flex-wrap gap-2 align-middle">{badgeElementsDE(tokens)}</span>
                            </div>
                          )
                        })()}
                        {((profile as any)?.intimateArea || (profile as any)?.pubicHair || (profile as any)?.intimateStyle) && (() => {
                          const arr = [
                            ...toArray((profile as any)?.intimateArea),
                            ...toArray((profile as any)?.pubicHair),
                            ...toArray((profile as any)?.intimateStyle),
                          ].filter(Boolean)
                          return (
                            <div className="text-sm font-light tracking-wide text-gray-700">
                              <strong>Intimbereich:</strong>{' '}
                              {arr.length > 1 ? (
                                <span className="ml-1 inline-flex flex-wrap gap-2 align-middle">{badgeElementsDE(arr)}</span>
                              ) : (
                                <span className="ml-1">{formatEnumListDE(arr)}</span>
                              )}
                            </div>
                          )
                        })()}
                        {((profile as any)?.piercings !== undefined && (profile as any)?.piercings !== null) && (
                          <div className="text-sm font-light tracking-wide text-gray-700">
                            <strong>Piercings:</strong>{' '}
                            {typeof (profile as any).piercings === 'boolean' ? (
                              <span className="ml-1">{(profile as any).piercings ? 'Ja' : 'Nein'}</span>
                            ) : toArray((profile as any).piercings).length > 1 ? (
                              <span className="ml-1 inline-flex flex-wrap gap-2 align-middle">{badgeElementsDE((profile as any).piercings)}</span>
                            ) : (
                              <span className="ml-1">{formatEnumListDE((profile as any).piercings)}</span>
                            )}
                          </div>
                        )}
                        {((profile as any)?.tattoos !== undefined && (profile as any)?.tattoos !== null) && (
                          <div className="text-sm font-light tracking-wide text-gray-700">
                            <strong>Tätowierungen:</strong>{' '}
                            {typeof (profile as any).tattoos === 'boolean' ? (
                              <span className="ml-1">{(profile as any).tattoos ? 'Ja' : 'Nein'}</span>
                            ) : toArray((profile as any).tattoos).length > 1 ? (
                              <span className="ml-1 inline-flex flex-wrap gap-2 align-middle">{badgeElementsDE((profile as any).tattoos)}</span>
                            ) : (
                              <span className="ml-1">{formatEnumListDE((profile as any).tattoos)}</span>
                            )}
                          </div>
                        )}
                        {(profile as any)?.clothingStyle && (
                          <div className="text-sm font-light tracking-wide text-gray-700">
                            <strong>Kleidungsstil:</strong>{' '}
                            {toArray((profile as any).clothingStyle).length > 1 ? (
                              <span className="ml-1 inline-flex flex-wrap gap-2 align-middle">{badgeElementsDE((profile as any).clothingStyle)}</span>
                            ) : (
                              <span className="ml-1">{formatEnumListDE((profile as any).clothingStyle)}</span>
                            )}
                          </div>
                        )}
                        {(profile as any)?.dressSize && (
                          <div className="text-sm font-light tracking-wide text-gray-700">
                            <strong>Kleidergröße:</strong>{' '}
                            {toArray((profile as any).dressSize).length > 1 ? (
                              <span className="ml-1 inline-flex flex-wrap gap-2 align-middle">{badgeElementsDE((profile as any).dressSize)}</span>
                            ) : (
                              <span className="ml-1">{formatEnumListDE((profile as any).dressSize)}</span>
                            )}
                          </div>
                        )}
                        {(profile as any)?.shoeSize && (
                          <div className="text-sm font-light tracking-wide text-gray-700"><strong>Schuhgröße:</strong> {formatShoeSize((profile as any).shoeSize)}</div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Description */}
                  {profile.description && (
                    <div className="bg-gray-50 p-6">
                      <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">BESCHREIBUNG</h3>
                      <div className="w-12 h-px bg-pink-500 mb-6"></div>
                      {(() => {
                        const normalizeDescription = (html: string): string => {
                          if (!html) return ''
                          let s = String(html)
                          // Convert common HTML tags to line breaks or bullets, then strip any remaining tags
                          s = s
                            .replace(/<br\s*\/?>/gi, '\n')
                            .replace(/<\/?div[^>]*>/gi, '\n')
                            .replace(/<\/?p[^>]*>/gi, '\n')
                            .replace(/<li[^>]*>/gi, '• ')
                            .replace(/<\/(li|ul|ol)>/gi, '\n')
                            .replace(/<h[1-6][^>]*>/gi, '')
                            .replace(/<\/h[1-6]>/gi, '\n')
                            .replace(/<[^>]+>/g, '')
                          // Decode basic HTML entities
                          s = s
                            .replace(/&nbsp;/gi, ' ')
                            .replace(/&amp;/gi, '&')
                            .replace(/&lt;/gi, '<')
                            .replace(/&gt;/gi, '>')
                            .replace(/&quot;/gi, '"')
                            .replace(/&#39;/gi, "'")
                          // Collapse excessive blank lines
                          s = s.replace(/\n{3,}/g, '\n\n').trim()
                          return s
                        }
                        const full = normalizeDescription(profile.description as string)
                        const LIMIT = 600
                        const isLong = full.length > LIMIT
                        const shown = showFullDesc || !isLong ? full : full.slice(0, LIMIT).trimEnd() + '…'
                        return (
                          <>
                            <pre className="text-sm font-light tracking-wide text-gray-700 leading-relaxed whitespace-pre-wrap">{shown}</pre>
                            {isLong && (
                              <button
                                type="button"
                                onClick={() => setShowFullDesc((v) => !v)}
                                className="mt-3 text-xs font-light tracking-widest uppercase text-pink-500 hover:text-pink-600"
                              >
                                {showFullDesc ? 'WENIGER ANZEIGEN' : 'WEITER LESEN'}
                              </button>
                            )}
                          </>
                        )
                      })()}
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
                          <button 
                            aria-label="Gefällt mir"
                            className="flex items-center space-x-2 hover:text-pink-500 transition-colors">
                            <Heart className="h-4 w-4" />
                            <span className="flex items-center gap-1">
                              <span>{post.likes.length}</span>
                              <span className="hidden sm:inline">GEFÄLLT MIR</span>
                            </span>
                          </button>
                          <button 
                            aria-label="Kommentare"
                            className="flex items-center space-x-2 hover:text-pink-500 transition-colors">
                            <MessageCircle className="h-4 w-4" />
                            <span className="flex items-center gap-1">
                              <span>{post.comments.length}</span>
                              <span className="hidden sm:inline">KOMMENTARE</span>
                            </span>
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
                        <div className="absolute top-2 right-2 flex gap-1">
                          {/* Avatar setzen (nur Bilder) */}
                          {item.type === 'image' && (
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleSetAvatar(item.url) }}
                              disabled={settingAvatarUrl !== null}
                              className={`text-[10px] uppercase tracking-widest bg-white/90 border px-2 py-0.5 ${profile?.avatar === item.url ? 'border-emerald-300 text-emerald-700' : 'border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-600'}`}
                              title="Als Profilbild setzen"
                            >
                              <User className="h-4 w-4" />
                            </button>
                          )}
                          {/* Löschen */}
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleDeleteMedia(item, index) }}
                            disabled={deletingIndex === index}
                            className="text-[10px] uppercase tracking-widest bg-white/90 border border-gray-300 px-2 py-0.5 hover:border-rose-300 hover:text-rose-700"
                            title="Löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
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
                  <div>
                    <div className="text-[10px] tracking-widest text-gray-500 mb-1">TELEFON</div>
                    <div>{profile.phone}</div>
                  </div>
                )}
                {profile.website && (
                  <div>
                    <div className="text-[10px] tracking-widest text-gray-500 mb-1">WEBSEITE</div>
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline break-all">{profile.website}</a>
                  </div>
                )}
                {profile.socialMedia && Object.keys(profile.socialMedia).length > 0 && (
                  <div>
                    <div className="text-[10px] tracking-widest text-gray-500 mb-2">SOZIALE MEDIEN</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(profile.socialMedia).map(([rawKey, rawVal]) => {
                        if (!rawVal) return null
                        const key = String(rawKey).toLowerCase()
                        let href = String(rawVal)
                        if (key === 'whatsapp') {
                          const phone = href.replace(/[^+\d]/g, '')
                          href = `https://wa.me/${phone}`
                        } else if (!/^https?:\/\//i.test(href)) {
                          href = `https://${href}`
                        }
                        const Icon =
                          key === 'instagram' ? FaInstagram :
                          key === 'facebook' ? FaFacebook :
                          (key === 'twitter' || key === 'x') ? FaXTwitter :
                          key === 'youtube' ? FaYoutube :
                          key === 'linkedin' ? FaLinkedin :
                          key === 'whatsapp' ? FaWhatsapp :
                          key === 'telegram' ? FaTelegram :
                          key === 'tiktok' ? FaTiktok :
                          key === 'snapchat' ? FaSnapchat :
                          null
                        const color = brandColor(key)
                        return (
                          <a
                            key={rawKey}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1 border text-xs rounded-none transition-colors border-[var(--brand)] text-[var(--brand)] hover:bg-[var(--brand)] hover:text-white hover:border-[var(--brand)]"
                            style={{ ['--brand' as any]: color }}
                            title={rawKey}
                          >
                            {Icon ? <Icon className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                            <span className="truncate max-w-[180px]">{String(rawVal)}</span>
                          </a>
                        )
                      })}
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