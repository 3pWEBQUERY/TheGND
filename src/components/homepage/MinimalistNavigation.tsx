'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
 
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function MinimalistNavigation() {
  const { data: session } = useSession()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [discoverOpen, setDiscoverOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        if (!session?.user?.id) return
        const res = await fetch('/api/profile')
        if (!res.ok) return
        const data = await res.json()
        setAvatarUrl(data?.user?.profile?.avatar ?? null)
      } catch {}
    }
    load()
    setMounted(true)
  }, [session?.user?.id])

  return (
    <nav className="absolute top-0 w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-light tracking-widest text-white">
            <Link href="/">THEGND</Link>
          </div>
          
          {/* Centered Navigation */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center gap-10 text-sm font-light tracking-widest text-white">
            {/* ENTDECKEN with Mega Menu */}
            <div
              className="relative"
              onMouseEnter={() => setDiscoverOpen(true)}
            >
              <button className="relative group transition-colors select-none">
                ENTDECKEN
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
              </button>

              {mounted && discoverOpen && (
                createPortal(
                  <div
                    className="fixed inset-x-0 top-20 z-[60] text-gray-800"
                    onMouseEnter={() => setDiscoverOpen(true)}
                    onMouseLeave={() => setDiscoverOpen(false)}
                  >
                    <div className="w-full bg-white border-y border-gray-200 rounded-none shadow-[0_6px_40px_rgba(0,0,0,0.12)]">
                      <div className="mx-auto max-w-7xl px-6 md:px-10">
                        <div className="grid grid-cols-12 gap-6 py-6">
                      {/* Left column: primary categories as 9:16 cards (smaller, 2-up) */}
                      <div className="col-span-12 md:col-span-4">
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">KATEGORIEN</div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <Link href="/escorts" className="group block border border-gray-200 hover:border-pink-500 rounded-none overflow-hidden">
                            <div style={{ aspectRatio: '9 / 16' }} className="relative">
                              <img src="/2.jpg" alt="Escorts" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent transition-colors group-hover:from-black/70"></div>
                              <div className="absolute inset-0 flex items-end p-3">
                                <span className="text-xs tracking-widest text-white">ESCORTS</span>
                              </div>
                            </div>
                          </Link>
                          <Link href="/agency" className="group block border border-gray-200 hover:border-pink-500 rounded-none overflow-hidden">
                            <div style={{ aspectRatio: '9 / 16' }} className="relative">
                              <img src="/agentur.jpg" alt="Agenturen" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent transition-colors group-hover:from-black/70"></div>
                              <div className="absolute inset-0 flex items-end p-3">
                                <span className="text-xs tracking-widest text-white">AGENTUREN</span>
                              </div>
                            </div>
                          </Link>
                          <Link href="/club-studio" className="group block border border-gray-200 hover:border-pink-500 rounded-none overflow-hidden">
                            <div style={{ aspectRatio: '9 / 16' }} className="relative">
                              <img src="/1.jpg" alt="Clubs & Studios" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent transition-colors group-hover:from-black/70"></div>
                              <div className="absolute inset-0 flex items-end p-3">
                                <span className="text-xs tracking-widest text-white">CLUBS &amp; STUDIOS</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                        {/* Ad banner placeholder below primary cards */}
                        <div className="mt-3 border border-gray-200 bg-white h-[30rem] md:h-[40rem] flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-500">
                          Werbebanner
                        </div>
                      </div>

                      {/* Middle column: secondary links as 9:16 cards (smaller) */}
                      <div className="col-span-12 md:col-span-4">
                        <div className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">INHALTE</div>
                        <div className="grid grid-cols-2 gap-3">
                          <Link href="/stories" className="group block border border-gray-200 hover:border-pink-500 rounded-none overflow-hidden">
                            <div style={{ aspectRatio: '9 / 16' }} className="relative">
                              <img src="/1.jpg" alt="Stories" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent transition-colors group-hover:from-black/70"></div>
                              <div className="absolute inset-0 flex items-end p-3">
                                <span className="text-xs tracking-widest text-white">STORIES</span>
                              </div>
                            </div>
                          </Link>
                          <Link href="/feed" className="group block border border-gray-200 hover:border-pink-500 rounded-none overflow-hidden">
                            <div style={{ aspectRatio: '9 / 16' }} className="relative">
                              <img src="/2.jpg" alt="Feeds" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent transition-colors group-hover:from-black/70"></div>
                              <div className="absolute inset-0 flex items-end p-3">
                                <span className="text-xs tracking-widest text-white">FEEDS</span>
                              </div>
                            </div>
                          </Link>
                          <Link href="/jobs" className="group block border border-gray-200 hover:border-pink-500 rounded-none overflow-hidden">
                            <div style={{ aspectRatio: '9 / 16' }} className="relative">
                              <img src="/1.jpg" alt="Jobs" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent transition-colors group-hover:from-black/70"></div>
                              <div className="absolute inset-0 flex items-end p-3">
                                <span className="text-xs tracking-widest text-white">JOBS</span>
                              </div>
                            </div>
                          </Link>
                          <Link href="/mieten" className="group block border border-gray-200 hover:border-pink-500 rounded-none overflow-hidden">
                            <div style={{ aspectRatio: '9 / 16' }} className="relative">
                              <img src="/2.jpg" alt="Mieten" className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/25 to-transparent transition-colors group-hover:from-black/70"></div>
                              <div className="absolute inset-0 flex items-end p-3">
                                <span className="text-xs tracking-widest text-white">MIETEN</span>
                              </div>
                            </div>
                          </Link>
                        </div>
                      </div>

                      {/* Right column: stacked vertical cards */}
                      <div className="col-span-12 md:col-span-4">
                        <div className="flex h-full flex-col gap-3">
                          <div className="flex-1 border border-gray-200 bg-white rounded-none overflow-hidden">
                            <div className="h-full p-4 flex items-end">
                              <div className="text-left">
                                <div className="text-[10px] uppercase tracking-widest text-gray-500">HIGHLIGHT</div>
                                <div className="mt-1 text-gray-900 text-sm">Entdecke verifizierte Profile</div>
                                <Link href="/agency" className="mt-3 inline-block text-xs uppercase tracking-widest underline underline-offset-4">Jetzt ansehen</Link>
                              </div>
                            </div>
                          </div>
                          <div className="flex-1 border border-gray-200 bg-white rounded-none overflow-hidden">
                            <div className="h-full p-4 flex items-end">
                              <div className="text-left">
                                <div className="text-[10px] uppercase tracking-widest text-gray-500">MAGAZIN</div>
                                <div className="mt-1 text-gray-900 text-sm">Neuigkeiten &amp; Stories</div>
                                <Link href="/stories" className="mt-3 inline-block text-xs uppercase tracking-widest underline underline-offset-4">Mehr lesen</Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom promo banner removed per request */}
                  </div>
                </div>
              </div>,
                document.body
              )
            )}
          </div>

            {/* Remaining simple nav items */}
            <Link href="/search" className="relative group transition-colors">
              SUCHE
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/preise" className="relative group transition-colors">
              PREISE
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/info" className="relative group transition-colors">
              INFO
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {session?.user ? (
              <Link href="/dashboard" className="hidden md:flex items-center">
                <Avatar className="size-8 bg-white/10 ring-1 ring-white/30">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="avatar" />
                  ) : (
                    <AvatarFallback className="text-xs font-light tracking-widest text-white bg-white/10">
                      {session.user.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Link>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/auth/signin">
                  <Button variant="ghost" className="text-sm font-light tracking-widest text-white hover:text-pink-500">
                    ANMELDEN
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-light tracking-widest px-6">
                    REGISTRIEREN
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}