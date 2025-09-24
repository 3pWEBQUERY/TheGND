'use client'

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import ProfileVisitorsModal from '@/components/profile/ProfileVisitorsModal'
import ProfileMediaLightbox from '@/components/profile/ProfileMediaLightbox'
import ProfilePosts from '@/components/profile/ProfilePosts'
import ProfileStats from '@/components/profile/ProfileStats'
import ProfileHeaderLeft from '@/components/profile/ProfileHeaderLeft'
import ProfileContactInfo from '@/components/profile/ProfileContactInfo'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { getUserTypeDisplayName } from '@/lib/validations'
import { UserType, Gender } from '@prisma/client'
import { formatLocation } from '@/lib/utils'
import ProfileAboutTab from '@/components/profile/ProfileAboutTab'
import ProfileIdentity from '@/components/profile/ProfileIdentity'
import ProfileViewSelector from '@/components/profile/ProfileViewSelector'
import ProfileGalleryGrid from '@/components/profile/ProfileGalleryGrid'
import ProfileVisitorsTab from '@/components/profile/ProfileVisitorsTab'
import ProfileTabsBar from '@/components/profile/ProfileTabsBar'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet'
import { uploadFiles } from '@/utils/uploadthing'

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
      preferences?: any
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
  const [settingAvatarUrl, setSettingAvatarUrl] = useState<string | null>(null)
  const [selectedView, setSelectedView] = useState<'STANDARD' | 'ALT1' | 'ALT2' | null>(null)
  const [savingView, setSavingView] = useState(false)
  const [savedViewAt, setSavedViewAt] = useState<number | null>(null)
  // Visitors popup state
  const [showVisitors, setShowVisitors] = useState(false)
  const [visitors, setVisitors] = useState<{ id: string; displayName: string; avatar: string | null; visitedAt: string }[] | null>(null)
  const [anonCount, setAnonCount] = useState<number>(0)
  const [loadingVisitors, setLoadingVisitors] = useState(false)
  const [visitorDays, setVisitorDays] = useState<number>(30)
  // Edit view sheet
  const [showEditView, setShowEditView] = useState(false)
  const [heroMobileLayout, setHeroMobileLayout] = useState<'cover' | 'half' | 'compact'>('cover')
  const [savingHeroPrefs, setSavingHeroPrefs] = useState(false)
  const [heroUploads, setHeroUploads] = useState<string[]>([])
  const [uploadingHero, setUploadingHero] = useState(false)


  const isOwnProfile = !userId || userId === session?.user?.id

  useEffect(() => {
    fetchProfile()
  }, [userId])

  // Load recent visitors when popup opens
  useEffect(() => {
    if (!showVisitors) return
    let cancelled = false
    ;(async () => {
      try {
        setLoadingVisitors(true)
        const res = await fetch(`/api/visitors?limit=32&days=${visitorDays}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setVisitors(data?.visitors || [])
        setAnonCount(Number(data?.anonCount || 0))
      } catch {
        // no-op
      } finally {
        setLoadingVisitors(false)
      }
    })()
    return () => { cancelled = true }
  }, [showVisitors, visitorDays])

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
        // initialize hero mobile layout from preferences if present
        try {
          const prefs = (data?.user?.profile as any)?.preferences || {}
          const mobile = prefs?.hero?.mobileLayout
          if (mobile === 'cover' || mobile === 'half' || mobile === 'compact') {
            setHeroMobileLayout(mobile)
          } else {
            setHeroMobileLayout('cover')
          }
        } catch {}
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
        {showVisitors && (
          <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowVisitors(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg border border-gray-200 p-4 sm:p-6 relative">
                <button className="absolute top-2 right-2 p-2 text-gray-600 hover:text-pink-500" onClick={() => setShowVisitors(false)} aria-label="Schließen">
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-1">Profil-Besucher</h3>
                <div className="text-xs text-gray-500 mb-4">Letzte 30 Tage</div>
                {loadingVisitors ? (
                  <div className="text-sm text-gray-600">Lädt…</div>
                ) : (
                  <Fragment>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                      {(visitors || []).map((v) => (
                        <div key={v.id} className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                            {v.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={v.avatar} alt={v.displayName} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-gray-600 text-sm">{(v.displayName || '').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="text-[10px] tracking-widest text-gray-700 text-center truncate w-full" title={v.displayName}>{v.displayName}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-700">
                      Nichtregistrierte Besucher: <span className="font-medium">{anonCount}</span>
                    </div>
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-sm font-light tracking-widest text-red-600">PROFIL NICHT GEFUNDEN</div>
        {showVisitors && (
          <div className="fixed inset-0 z-[100]">
            <div className="absolute inset-0 bg-black/40" onClick={() => setShowVisitors(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-lg border border-gray-200 p-4 sm:p-6 relative">
                <button className="absolute top-2 right-2 p-2 text-gray-600 hover:text-pink-500" onClick={() => setShowVisitors(false)} aria-label="Schließen">
                  <X className="h-5 w-5" />
                </button>
                <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-1">Profil-Besucher</h3>
                <div className="text-xs text-gray-500 mb-4">Letzte 30 Tage</div>
                {loadingVisitors ? (
                  <div className="text-sm text-gray-600">Lädt…</div>
                ) : (
                  <Fragment>
                    <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                      {(visitors || []).map((v) => (
                        <div key={v.id} className="flex flex-col items-center gap-2">
                          <div className="h-12 w-12 bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
                            {v.avatar ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={v.avatar} alt={v.displayName} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-gray-600 text-sm">{(v.displayName || '').charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="text-[10px] tracking-widest text-gray-700 text-center truncate w-full" title={v.displayName}>{v.displayName}</div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 text-sm text-gray-700">
                      Nichtregistrierte Besucher: <span className="font-medium">{anonCount}</span>
                    </div>
                  </Fragment>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  const { user } = profileData
  const profile = user.profile
  const userType = user.userType
  const displayName = profile?.displayName || user.email
  const formattedLocation = formatLocation(profile)
  

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

  // Merge temporary hero uploads so they appear in the grid immediately after upload
  const heroGridItems = ([
    ...heroUploads.map((url) => ({ type: 'image', url } as any)),
    ...(mediaItems as any[]),
  ]) as any[]

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

  const handleSetHeroImage = async (url: string) => {
    if (!profile) return
    try {
      const currentPrefs = ((profile as any)?.preferences) || {}
      const nextPrefs = { ...currentPrefs, hero: { ...(currentPrefs.hero || {}), imageUrl: url } }
      const resp = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData: { preferences: nextPrefs } }),
      })
      if (!resp.ok) {
        console.error('Fehler beim Setzen des Hero-Bilds')
        return
      }
      setProfileData((prev) => {
        if (!prev) return prev
        const next: ProfileData = {
          ...prev,
          user: {
            ...prev.user,
            profile: { ...(prev.user.profile as any), preferences: nextPrefs } as any,
          },
        }
        return next
      })
    } catch (e) {
      console.error('Hero-Bild setzen fehlgeschlagen:', e)
    }
  }

  // Upload a custom hero image and select it immediately
  const handleUploadHero = async (file: File) => {
    try {
      setUploadingHero(true)
      const res = await uploadFiles('postImages', { files: [file] })
      const url = Array.isArray(res) ? (res[0]?.url as string | undefined) : undefined
      if (url) {
        // Show immediately in grid
        setHeroUploads((prev: string[]) => [url, ...prev])
        // Persist as hero image selection
        await handleSetHeroImage(url)
      }
    } catch (e) {
      console.error('Hero-Upload fehlgeschlagen:', e)
    } finally {
      setUploadingHero(false)
    }
  }

  const handleSaveHeroPrefs = async () => {
    if (!profile) return
    try {
      setSavingHeroPrefs(true)
      const currentPrefs = ((profile as any)?.preferences) || {}
      const nextPrefs = {
        ...currentPrefs,
        hero: { ...(currentPrefs.hero || {}), mobileLayout: heroMobileLayout },
      }
      const resp = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData: { preferences: nextPrefs } }),
      })
      if (!resp.ok) {
        console.error('Fehler beim Speichern der Ansicht-Einstellungen')
        return
      }
      // reflect in local state
      setProfileData((prev) => {
        if (!prev) return prev
        const next: ProfileData = {
          ...prev,
          user: {
            ...prev.user,
            profile: { ...(prev.user.profile as any), preferences: nextPrefs } as any,
          },
        }
        return next
      })
      setShowEditView(false)
    } catch (e) {
      console.error('Speichern fehlgeschlagen:', e)
    } finally {
      setSavingHeroPrefs(false)
    }
  }

  return (
      <div>
        <div className="max-w-7xl mx-auto space-y-8 px-6 overflow-x-hidden">
      {/* Profile Header */}
      <div className="bg-white border border-gray-100 rounded-none">
        <div className="p-4 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Avatar and Basic Info */}
            <ProfileHeaderLeft
              isOwnProfile={isOwnProfile}
              avatarUrl={profile?.avatar}
              displayName={displayName}
              avatarSize={avatarSize}
              onEdit={() => router.push('/onboarding?edit=1')}
              onOpenVisitors={() => setShowVisitors(true)}
              editBtnRef={editBtnRef}
            />
            
            {/* Profile Details */}
            <ProfileIdentity
              displayName={displayName}
              userTypeLabel={getUserTypeDisplayName(userType)}
              profile={profile}
              formattedLocation={formattedLocation}
              isOwnProfile={isOwnProfile}
            />
            <ProfileStats
              postsCount={user.posts.length}
              followersCount={user.followers.length}
              followingCount={user.following.length}
              storiesCount={user.stories.length}
            />
          </div>
        </div>
      </div>
      
      {/* Profile View Selection (owner only, non-MEMBER) */}
      {isOwnProfile && userType !== 'MEMBER' && (
        <ProfileViewSelector
          selected={selectedView}
          onChange={(v) => setSelectedView(v)}
          onSave={handleSaveProfileView}
          saving={savingView}
          savedAt={savedViewAt}
          onEdit={() => setShowEditView(true)}
        />
      )}

      {/* Profile Tabs */}
      <div className="bg-white border border-gray-100 rounded-none">
        <ProfileTabsBar active={activeTab as any} onChange={(key: string) => setActiveTab(key)} />
        
        {/* Tab Content */}
        <div className="p-4 sm:p-8">
          {activeTab === 'about' && (
            <ProfileAboutTab profile={profile} userType={userType} />
          )}
          
          {activeTab === 'posts' && (
            <ProfilePosts posts={user.posts} displayName={displayName} avatar={profile?.avatar} />
          )}
          
          {activeTab === 'gallery' && (
            <ProfileGalleryGrid
              mediaItems={mediaItems as any}
              isOwnProfile={isOwnProfile}
              currentAvatarUrl={profile?.avatar || null}
              settingAvatarUrl={settingAvatarUrl}
              deletingIndex={deletingIndex}
              onSetAvatar={(url) => handleSetAvatar(url)}
              onDelete={(item, index) => handleDeleteMedia(item, index)}
              onOpenLightbox={(index) => setLightboxIndex(index)}
            />
          )}
          
          {activeTab === 'contact' && profile && (
            <ProfileContactInfo profile={profile} city={profile?.city} country={profile?.country} />
          )}
          
          {activeTab === 'visitors' && (
            <ProfileVisitorsTab visitors={visitors || []} />
          )}
        </div>
      </div>
      {/* Visitors Modal (global, shows over content) */}
      <ProfileVisitorsModal
        open={showVisitors}
        onClose={() => setShowVisitors(false)}
        visitors={visitors}
        anonCount={anonCount}
        loading={loadingVisitors}
        days={visitorDays}
        onDaysChange={(n) => setVisitorDays(n)}
      />
      <ProfileMediaLightbox
        open={lightboxIndex !== null && !!mediaItems[lightboxIndex]}
        item={lightboxIndex !== null && mediaItems[lightboxIndex] ? {
          type: (mediaItems[lightboxIndex] as any).type,
          url: (mediaItems[lightboxIndex] as any).url,
          thumbnail: (mediaItems[lightboxIndex] as any).thumbnail,
        } : null}
        onClose={() => setLightboxIndex(null)}
      />
      {/* Right Sheet: Ansicht bearbeiten */}
      <Sheet open={showEditView} onOpenChange={setShowEditView}>
        <SheetContent
          side="right"
          className="bg-white border-l border-gray-200"
          style={{ width: 'min(96vw, 1080px)', maxWidth: 'none' }}
        >
          <SheetHeader className="p-6">
            <SheetTitle className="text-lg font-thin tracking-wider text-gray-800">ANSICHT BEARBEITEN</SheetTitle>
            <div className="text-sm text-gray-600">Passe das Hero-Bild und die mobile Hero-Ansicht deines öffentlichen Profils an.</div>
          </SheetHeader>
          <div className="px-6 pb-6 space-y-8 overflow-y-auto">
            {/* Hero Image Picker */}
            <div>
              <div className="text-xs font-light tracking-widest text-gray-600 mb-2">HERO-BILD</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(heroGridItems as any[]).map((item, idx) => {
                  const url = (item as any).url
                  const heroCurrent = ((profile as any)?.preferences?.hero?.imageUrl) || null
                  const isActive = !!url && url === heroCurrent
                  const isVideo = (item as any).type === 'video'
                  return (
                    <button
                      key={url + '-' + idx}
                      type="button"
                      onClick={() => !isVideo && url && handleSetHeroImage(url)}
                      className={`relative aspect-[3/4] border ${isActive ? 'border-pink-500' : 'border-gray-200'} overflow-hidden group ${isVideo ? 'opacity-50 cursor-not-allowed' : 'hover:border-pink-500'}`}
                      title={isVideo ? 'Videos können nicht als Hero-Bild gesetzt werden' : (isActive ? 'Aktuelles Hero-Bild' : 'Als Hero-Bild setzen')}
                    >
                      {item.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt="Hero Auswahl" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500">Video</div>
                      )}
                      {isActive && (
                        <span className="absolute top-1 right-1 bg-pink-500 text-white text-[10px] px-1 py-0.5">AKTIV</span>
                      )}
                    </button>
                  )
                })}
              </div>
              <div className="mt-2 text-xs text-gray-500">Tipp: Wähle ein vertikales Bild für die beste Darstellung.</div>
              <div className="mt-3">
                <label className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-xs tracking-widest uppercase text-gray-800 hover:border-pink-500 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleUploadHero(f)
                    }}
                  />
                  {uploadingHero ? 'HOCHLADEN…' : 'EIGENES BILD HOCHLADEN'}
                </label>
                {uploadingHero && <span className="ml-2 text-xs text-gray-500">Bitte warten…</span>}
              </div>
            </div>

            {/* Mobile Hero Layout */}
            <div>
              <div className="text-xs font-light tracking-widest text-gray-600 mb-2">MOBILE HERO-ANSICHT</div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input type="radio" name="mobile-hero" className="accent-pink-500" checked={heroMobileLayout === 'cover'} onChange={() => setHeroMobileLayout('cover')} />
                  Vollbild (empfohlen)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input type="radio" name="mobile-hero" className="accent-pink-500" checked={heroMobileLayout === 'half'} onChange={() => setHeroMobileLayout('half')} />
                  Halb-Höhe
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-800">
                  <input type="radio" name="mobile-hero" className="accent-pink-500" checked={heroMobileLayout === 'compact'} onChange={() => setHeroMobileLayout('compact')} />
                  Kompakt
                </label>
              </div>
            </div>
          </div>
          <SheetFooter className="p-6">
            <button
              type="button"
              onClick={handleSaveHeroPrefs}
              disabled={savingHeroPrefs}
              className={`px-5 py-2 text-xs tracking-widest uppercase ${savingHeroPrefs ? 'bg-pink-400' : 'bg-pink-500 hover:bg-pink-600'} text-white`}
            >
              {savingHeroPrefs ? 'SPEICHERN…' : 'EINSTELLUNGEN SPEICHERN'}
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  </div>
)
}
