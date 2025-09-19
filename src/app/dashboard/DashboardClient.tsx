'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getUserTypeDisplayName, canCreateStories } from '@/lib/validations'
import { UserType } from '@prisma/client'
import ProfileComponent from '@/components/ProfileComponent'
import NewsfeedComponent from '@/components/NewsfeedComponent'
import StoriesComponent from '@/components/StoriesComponent'
import SocialComponent from '@/components/SocialComponent'
import MessagingComponent from '@/components/MessagingComponent'
import CommentsComponent from '@/components/CommentsComponent'
import DashboardHeader from '@/components/DashboardHeader'
import DashboardMobileNavigation from '@/components/DashboardMobileNavigation'
import ForumDashboard from '@/components/ForumDashboard'
import FeedTabs from '@/components/FeedTabs'
import GamificationComponent from '@/components/GamificationComponent'
import SwipeDeck from '@/components/matching/SwipeDeck'
import Image from 'next/image'
import Link from 'next/link'
import PreferencesForm from '@/components/matching/PreferencesForm'

export default function DashboardClient() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchError, setMatchError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showPrefs, setShowPrefs] = useState(false)
  const [mutual, setMutual] = useState<any[]>([])
  const [mutualLoading, setMutualLoading] = useState(false)
  const [likesReceived, setLikesReceived] = useState<any[]>([])
  const [likesLoading, setLikesLoading] = useState(false)
  const [likesFilter, setLikesFilter] = useState<'all' | 'new' | 'liked_back'>('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (session?.user?.onboardingStatus === 'NOT_STARTED') {
      router.push('/onboarding')
    }
  }, [session, status, router])

  // Initialize tab from URL (?tab=messages,profile,network,...)
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && typeof tab === 'string') {
      setActiveTab(tab)
    }
    const view = searchParams.get('view')
    setShowPrefs(view === 'prefs')
  }, [searchParams])

  // Load matching suggestions when matching tab is active
  useEffect(() => {
    const load = async () => {
      if (activeTab !== 'matching') return
      if (!session) return
      setMatchLoading(true)
      setMatchError(null)
      try {
        if (session.user.userType === 'MEMBER') {
          const res = await fetch('/api/matching/suggestions?limit=24', { cache: 'no-store' })
          const data = await res.json()
          if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`)
          setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : [])
        } else {
          setSuggestions([])
        }
      } catch (e: any) {
        setMatchError(e?.message || 'Fehler beim Laden')
      } finally {
        setMatchLoading(false)
      }
    }
    load()
  }, [activeTab, session])

  // Load mutual matches
  useEffect(() => {
    const load = async () => {
      if (activeTab !== 'matching') return
      if (!session) return
      try {
        setMutualLoading(true)
        const res = await fetch('/api/matching/mutual?limit=24', { cache: 'no-store' })
        const data = await res.json()
        if (res.ok) {
          setMutual(Array.isArray(data?.matches) ? data.matches : [])
        } else {
          setMutual([])
        }
      } catch {
        setMutual([])
      } finally {
        setMutualLoading(false)
      }
    }
    load()
  }, [activeTab, session])

  // Load likes received for ESCORT
  useEffect(() => {
    const load = async () => {
      if (activeTab !== 'matching') return
      if (!session || session.user.userType !== 'ESCORT') return
      try {
        setLikesLoading(true)
        const res = await fetch('/api/matching/likes-received', { cache: 'no-store' })
        const data = await res.json()
        if (res.ok) {
          setLikesReceived(Array.isArray(data?.likes) ? data.likes : [])
        } else {
          setLikesReceived([])
        }
      } catch {
        setLikesReceived([])
      } finally {
        setLikesLoading(false)
      }
    }
    load()
  }, [activeTab, session])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm font-light tracking-widest text-gray-600">DASHBOARD WIRD GELADEN...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userType = session.user.userType as UserType
  const canStories = canCreateStories(userType)

  return (
    <div className="min-h-screen bg-white">
      {/* Dashboard Header */}
      <DashboardHeader 
        session={session}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Mobile Navigation */}
        <DashboardMobileNavigation 
          session={session}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Content Area */}
        <div className="">
          {activeTab === 'dashboard' && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Dashboard Welcome */}
              <div className="bg-white border border-gray-100 rounded-none">
                <div className="p-8">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-thin tracking-wider text-gray-800 mb-2">WILLKOMMEN IN DEINEM DASHBOARD</h2>
                    <div className="w-12 h-px bg-pink-500 mx-auto mb-4"></div>
                    <p className="text-sm font-light tracking-wide text-gray-600">
                      Verwalte dein Profil, vernetzen dich mit anderen und bleib auf dem Laufenden
                    </p>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-gray-50">
                      <div className="text-xl font-thin tracking-wider text-gray-800 mb-2">0</div>
                      <div className="text-xs font-light tracking-widest text-gray-500 uppercase">BEITRÄGE</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50">
                      <div className="text-xl font-thin tracking-wider text-gray-800 mb-2">0</div>
                      <div className="text-xs font-light tracking-widest text-gray-500 uppercase">FOLLOWER</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50">
                      <div className="text-xl font-thin tracking-wider text-gray-800 mb-2">0</div>
                      <div className="text-xs font-light tracking-widest text-gray-500 uppercase">FOLGE ICH</div>
                    </div>
                    <div className="text-center p-6 bg-gray-50">
                      <div className="text-xl font-thin tracking-wider text-gray-800 mb-2">0</div>
                      <div className="text-xs font-light tracking-widest text-gray-500 uppercase">NACHRICHTEN</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="bg-white border border-gray-100 rounded-none">
                <div className="p-8">
                  <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-6">SCHNELLAKTIONEN</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="text-sm font-light tracking-widest text-gray-800 uppercase mb-2">PROFIL BEARBEITEN</div>
                      <div className="text-xs font-light tracking-wide text-gray-600">Aktualisieren Sie Ihre Profilinformationen</div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('network')}
                      className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="text-sm font-light tracking-widest text-gray-800 uppercase mb-2">BENUTZER ENTDECKEN</div>
                      <div className="text-xs font-light tracking-wide text-gray-600">Finden und vernetzen Sie sich mit anderen</div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('messages')}
                      className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="text-sm font-light tracking-widest text-gray-800 uppercase mb-2">NACHRICHTEN</div>
                      <div className="text-xs font-light tracking-wide text-gray-600">Überprüfen Sie Ihre Unterhaltungen</div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'feed' && (
            <FeedTabs />
          )}
          
          {activeTab === 'profile' && (
            <ProfileComponent />
          )}
          
          {activeTab === 'messages' && (
            <MessagingComponent />
          )}
          {activeTab === 'comments' && (
            <CommentsComponent />
          )}
          
          {activeTab === 'network' && (
            <SocialComponent />
          )}
          
          {canStories && activeTab === 'stories' && (
            <StoriesComponent />
          )}
          
          {activeTab === 'forum' && (
            <ForumDashboard />
          )}

          {activeTab === 'matching' && (
            <div className="">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-thin tracking-wider text-gray-800">MATCHING</h2>
                  <div className="w-16 h-px bg-pink-500 mt-3"></div>
                </div>
                {session.user.userType === 'MEMBER' && (
                  <button onClick={() => setShowPrefs((v) => !v)} className="text-xs font-light tracking-widest text-pink-600 hover:underline uppercase">
                    {showPrefs ? 'Vorschläge' : 'Präferenzen'}
                  </button>
                )}
              </div>

              {session.user.userType === 'MEMBER' ? (
                showPrefs ? (
                  <PreferencesForm />
                ) : (
                  <>
                    {/* Mobile: Tinder-Style Swipe Deck */}
                    <div className="md:hidden">
                      <SwipeDeck fetchLimit={20} />
                    </div>

                    {/* Desktop/Tablet: Grid */}
                    <div className="hidden md:block">
                      {matchLoading ? (
                        <div className="text-sm text-gray-500">Lade Vorschläge…</div>
                      ) : matchError ? (
                        <div className="text-sm text-red-600">{matchError}</div>
                      ) : suggestions.length === 0 ? (
                        <div className="text-sm text-gray-500">Keine Vorschläge verfügbar</div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {suggestions.map((s: any) => (
                            <Link key={s.id} href={`/escorts/${s.id}/${(s.displayName || 'escort').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`} className="group">
                              <div className="aspect-[3/4] bg-gray-100 border border-gray-200 relative overflow-hidden">
                                {s.image || s.avatar ? (
                                  <Image src={(s.image || s.avatar)!} alt={s.displayName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-400">Kein Bild</div>
                                )}
                              </div>
                              <div className="px-2 py-3">
                                <div className="flex items-center justify-between gap-3">
                                  <h3 className="text-base font-medium tracking-widest text-gray-900 truncate">{(s.displayName || '').toUpperCase()}</h3>
                                  <div className="text-xs text-gray-500 whitespace-nowrap">{s.city || ''}{s.city && s.country ? ', ' : ''}{s.country || ''}</div>
                                </div>
                                {Array.isArray(s.services) && s.services.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {s.services.slice(0, 4).map((sv: string) => (
                                      <span key={sv} className="px-2 py-1 text-[10px] uppercase tracking-widest bg-gray-100 text-gray-700">{sv}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Mutual Matches for MEMBER */}
                    <div className="mt-12">
                      <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">MATCHES</h3>
                      {mutualLoading ? (
                        <div className="text-sm text-gray-500">Lade Matches…</div>
                      ) : mutual.length === 0 ? (
                        <div className="text-sm text-gray-500">Keine Matches gefunden</div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                          {mutual.map((m: any) => (
                            <Link key={m.id} href={`/escorts/${m.id}/${(m.displayName || 'escort').toLowerCase().replace(/[^a-z0-9]+/g,'-')}`} className="group">
                              <div className="aspect-[3/4] bg-gray-100 border border-gray-200 relative overflow-hidden">
                                {m.image || m.avatar ? (
                                  <Image src={(m.image || m.avatar)!} alt={m.displayName} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                  <div className="h-full w-full flex items-center justify-center text-gray-400">Kein Bild</div>
                                )}
                              </div>
                              <div className="px-2 py-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div className="relative h-5 w-5 bg-gray-100 border border-gray-200 overflow-hidden">
                                      {m.avatar ? (
                                        <Image src={m.avatar} alt={m.displayName} fill className="object-cover" />
                                      ) : (
                                        <div className="h-full w-full text-[10px] flex items-center justify-center text-gray-400">IMG</div>
                                      )}
                                    </div>
                                    <h3 className="text-base font-medium tracking-widest text-gray-900 truncate">{(m.displayName || '').toUpperCase()}</h3>
                                  </div>
                                  <div className="text-xs text-gray-500 whitespace-nowrap">{m.city || ''}{m.city && m.country ? ', ' : ''}{m.country || ''}</div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )
              ) : (
                // ESCORT view
                <>
                  {/* Likes received */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-thin tracking-wider text-gray-800">ERHALTENE LIKES</h3>
                      <div className="flex items-center gap-2 text-xs">
                        {(() => {
                          const allC = likesReceived.length
                          const newC = likesReceived.filter((l: any) => !l.liked_back).length
                          const likedC = likesReceived.filter((l: any) => !!l.liked_back).length
                          return (
                            <>
                              <button onClick={() => setLikesFilter('all')} className={`px-3 py-1 border ${likesFilter==='all' ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-300 text-gray-700'}`}>ALLE ({allC})</button>
                              <button onClick={() => setLikesFilter('new')} className={`px-3 py-1 border ${likesFilter==='new' ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-300 text-gray-700'}`}>NEU ({newC})</button>
                              <button onClick={() => setLikesFilter('liked_back')} className={`px-3 py-1 border ${likesFilter==='liked_back' ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-300 text-gray-700'}`}>GEGENGELIKET ({likedC})</button>
                            </>
                          )
                        })()}
                      </div>
                    </div>
                    {likesLoading ? (
                      <div className="text-sm text-gray-500">Lade…</div>
                    ) : likesReceived.length === 0 ? (
                      <div className="text-sm text-gray-500">Noch keine Likes</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {likesReceived
                          .filter((l: any) => likesFilter === 'all' ? true : likesFilter === 'new' ? !l.liked_back : !!l.liked_back)
                          .map((l: any) => {
                            let thumb: string | null = null
                            try {
                              const g = l.gallery ? JSON.parse(l.gallery) : []
                              thumb = Array.isArray(g) ? (g[0] || null) : null
                            } catch {}
                            const img = l.avatar || thumb
                            return (
                          <div key={l.id} className="border border-gray-200">
                            <div className="p-4 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 overflow-hidden bg-gray-100 border border-gray-200">
                                  {img ? (
                                    <Image src={img} alt={l.displayName || l.email} fill className="object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-xs text-gray-400">IMG</div>
                                  )}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium tracking-wider text-gray-900">{l.displayName || l.email}</div>
                                    {l.liked_back && (
                                      <span className="text-[10px] uppercase tracking-widest bg-pink-100 text-pink-700 px-2 py-0.5">MATCH</span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">{l.city || ''}{l.city && l.country ? ', ' : ''}{l.country || ''}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button onClick={async () => {
                                  await fetch('/api/matching/escort/swipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberId: l.id, action: 'PASS' }) })
                                  setLikesReceived(prev => prev.filter(x => x.id !== l.id))
                                }} className="text-xs px-3 py-1 border border-gray-300">ABLEHNEN</button>
                                <button onClick={async () => {
                                  await fetch('/api/matching/escort/swipe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ memberId: l.id, action: 'LIKE' }) })
                                  setLikesReceived(prev => prev.map(x => x.id === l.id ? { ...x, liked_back: true } : x))
                                  // reload mutual
                                  try { const r = await fetch('/api/matching/mutual?limit=24'); const d = await r.json(); if (r.ok) setMutual(Array.isArray(d?.matches) ? d.matches : []) } catch {}
                                }} className="text-xs px-3 py-1 bg-pink-500 text-white">LIKE ZURÜCK</button>
                              </div>
                            </div>
                          </div>
                            )
                          })}
                      </div>
                    )}
                  </div>

                  {/* Mutual Matches for ESCORT */}
                  <div className="mt-12">
                    <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">MATCHES</h3>
                    {mutualLoading ? (
                      <div className="text-sm text-gray-500">Lade…</div>
                    ) : mutual.length === 0 ? (
                      <div className="text-sm text-gray-500">Keine Matches</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mutual.map((m: any) => (
                          <div key={m.id} className="border border-gray-200">
                            <div className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="relative h-6 w-6 overflow-hidden bg-gray-100 border border-gray-200">
                                  {m.avatar ? (
                                    <Image src={m.avatar} alt={m.displayName || m.email} fill className="object-cover" />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400">IMG</div>
                                  )}
                                </div>
                                <div className="text-sm font-medium tracking-wider text-gray-900">{m.displayName || m.email}</div>
                              </div>
                              <div className="text-xs text-gray-500">{m.city || ''}{m.city && m.country ? ', ' : ''}{m.country || ''}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'gamification' && (
            <GamificationComponent />
          )}
          
          {activeTab === 'settings' && (
            <div className="max-w-2xl">
              <div className="mb-8">
                <h2 className="text-3xl font-thin tracking-wider text-gray-800 mb-4">EINSTELLUNGEN</h2>
                <div className="w-16 h-px bg-pink-500"></div>
              </div>
              <div className="p-8 bg-gray-50 border">
                <p className="text-sm font-light text-gray-600 tracking-wide">
                  Das Einstellungsfeld ist derzeit in Entwicklung. Erweiterte Konfigurationsoptionen werden bald verfügbar sein.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
