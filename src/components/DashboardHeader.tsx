'use client'

import { useEffect, useRef, useState } from 'react'
import { signOut } from 'next-auth/react'
import Link from 'next/link'
import { Bell, MessageCircle, UserPlus, Heart, MessageSquare, Rss } from 'lucide-react'
import { getUserTypeDisplayName, canCreateStories } from '@/lib/validations'
import { UserType } from '@prisma/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface DashboardHeaderProps {
  session: any
  activeTab: string
  setActiveTab: (tab: string) => void
}

interface NotificationItem {
  id: string
  type: string // "follow", "like", "comment", "message", "feed"
  title: string
  message: string
  isRead: boolean
  createdAt: string
}

export default function DashboardHeader({ session, activeTab, setActiveTab }: DashboardHeaderProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  const userType = (session?.user?.userType as UserType) ?? 'MEMBER'
  const canStories = canCreateStories(userType)

  const loadNotifications = async () => {
    try {
      setNotifLoading(true)
      const res = await fetch('/api/notifications?limit=20')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
      }
    } catch (e) {
      // optional: console.error
    } finally {
      setNotifLoading(false)
    }
  }

  useEffect(() => {
    if (notifOpen) {
      loadNotifications()
    }
  }, [notifOpen])

  // Load avatar for header display
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) return
        const data = await res.json()
        setAvatarUrl(data?.user?.profile?.avatar ?? null)
      } catch {}
    }
    if (session?.user?.id) loadAvatar()
  }, [session?.user?.id])

  // Load admin flag to conditionally show ACP link
  useEffect(() => {
    const loadAdmin = async () => {
      try {
        const res = await fetch('/api/account')
        if (!res.ok) return
        const data = await res.json()
        setIsAdmin(!!data?.isAdmin)
      } catch {}
    }
    loadAdmin()
  }, [])

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    if (notifOpen) {
      document.addEventListener('mousedown', onClickOutside)
    }
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [notifOpen])

  // Close user dropdown on outside click
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    if (userMenuOpen) {
      document.addEventListener('mousedown', onClickOutside)
    }
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [userMenuOpen])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
    if (diffInHours < 24) {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  }

  const renderIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4" />
      case 'follow':
        return <UserPlus className="h-4 w-4" />
      case 'like':
        return <Heart className="h-4 w-4" />
      case 'comment':
        return <MessageSquare className="h-4 w-4" />
      case 'feed':
      case 'post':
        return <Rss className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-12">
            <h1 className="text-2xl font-thin tracking-wider text-gray-800">
              <Link href="/" className="hover:text-pink-500 transition-colors">THEGND</Link>
            </h1>
            
            {/* Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/dashboard?tab=dashboard"
                className={`relative group text-sm font-light tracking-widest uppercase transition-colors ${
                  activeTab === 'dashboard' ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                DASHBOARD
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-500 transition-all duration-300 ${activeTab === 'dashboard' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link 
                href="/dashboard?tab=feed"
                className={`relative group text-sm font-light tracking-widest uppercase transition-colors ${
                  activeTab === 'feed' ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                FEED
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-500 transition-all duration-300 ${activeTab === 'feed' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link 
                href="/dashboard?tab=profile"
                className={`relative group text-sm font-light tracking-widest uppercase transition-colors ${
                  activeTab === 'profile' ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                PROFIL
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-500 transition-all duration-300 ${activeTab === 'profile' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link 
                href="/dashboard?tab=messages"
                className={`relative group text-sm font-light tracking-widest uppercase transition-colors ${
                  activeTab === 'messages' ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                NACHRICHTEN
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-500 transition-all duration-300 ${activeTab === 'messages' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link 
                href="/dashboard?tab=network"
                className={`relative group text-sm font-light tracking-widest uppercase transition-colors ${
                  activeTab === 'network' ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                NETZWERK
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-500 transition-all duration-300 ${activeTab === 'network' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link 
                href="/dashboard?tab=comments"
                className={`relative group text-sm font-light tracking-widest uppercase transition-colors ${
                  activeTab === 'comments' ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                KOMMENTARE
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-500 transition-all duration-300 ${activeTab === 'comments' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              {canStories && (
                <Link 
                  href="/dashboard?tab=stories"
                  className={`relative group text-sm font-light tracking-widest uppercase transition-colors ${
                    activeTab === 'stories' ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'
                  }`}
                >
                  STORIES
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-pink-500 transition-all duration-300 ${activeTab === 'stories' ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setNotifOpen(o => !o)}
                className="relative p-2 text-gray-600 hover:text-pink-500 transition-colors"
                aria-haspopup="true"
                aria-expanded={notifOpen}
              >
                <Bell className="h-5 w-5" />
                {notifications.some(n => !n.isRead) && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-pink-500 rounded-full"></span>
                )}
              </button>
              {notifOpen && (
                <div className="fixed left-1/2 -translate-x-1/2 top-20 md:absolute md:top-auto md:left-auto md:right-0 md:mt-2 md:translate-x-0 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 shadow-lg z-50">
                  <div className="p-4 border-b border-gray-100">
                    <div className="text-sm font-thin tracking-wider text-gray-800">BENACHRICHTIGUNGEN</div>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifLoading ? (
                      <div className="p-4 text-sm font-light tracking-wide text-gray-500">Wird geladen...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm font-light tracking-wide text-gray-500">Keine Benachrichtigungen</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`flex items-start gap-3 p-3 border-b border-gray-50 ${n.isRead ? '' : 'bg-pink-50/40'}`}>
                          <div className="mt-0.5 text-gray-500">
                            {renderIcon(n.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-light tracking-wide text-gray-800 truncate">{n.title}</div>
                              <div className="text-xs font-light tracking-wide text-gray-400 ml-2 shrink-0">{formatTime(n.createdAt)}</div>
                            </div>
                            <div className="text-xs font-light tracking-wide text-gray-600 truncate">{n.message}</div>
                          </div>
                          {!n.isRead && <span className="h-2 w-2 bg-pink-500 rounded-full mt-2"></span>}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-100 text-right">
                    <Link
                      href="/notifications"
                      onClick={() => setNotifOpen(false)}
                      className="text-xs font-light tracking-widest text-gray-600 hover:text-pink-500 transition-colors uppercase inline-block"
                    >
                      ALLE ANZEIGEN
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative" ref={userMenuRef}>
              <button 
                type="button"
                onClick={() => setUserMenuOpen(o => !o)}
                className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <Avatar className="size-8 bg-gray-200">
                  {avatarUrl ? (
                    <AvatarImage src={avatarUrl} alt="avatar" />
                  ) : (
                    <AvatarFallback className="text-xs font-light tracking-widest text-gray-600">
                      {session?.user?.email?.charAt(0)?.toUpperCase() ?? '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-light text-gray-800">{session?.user?.email ?? 'Gast'}</div>
                  <div className="text-xs font-light text-gray-500 tracking-wide uppercase">
                    {getUserTypeDisplayName(userType)}
                  </div>
                </div>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 shadow-lg z-50">
                  <div className="py-2">
                    <Link href="/notifications" className="block px-4 py-2 text-sm font-light tracking-widest text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                      BENACHRICHTIGUNGEN
                    </Link>
                    <Link href="/verify" className="block px-4 py-2 text-sm font-light tracking-widest text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                      VERIFIZIEREN
                    </Link>
                    <Link href="/membership" className="block px-4 py-2 text-sm font-light tracking-widest text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                      MITGLIEDSCHAFT
                    </Link>
                    <Link href="/marketing" className="block px-4 py-2 text-sm font-light tracking-widest text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                      MARKETING
                    </Link>
                    <Link href="/settings" className="block px-4 py-2 text-sm font-light tracking-widest text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                      EINSTELLUNGEN
                    </Link>
                    {isAdmin && (
                      <Link href="/acp" className="block px-4 py-2 text-sm font-light tracking-widest text-gray-700 hover:bg-pink-50 hover:text-pink-600">
                        ADMIN
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button 
              onClick={handleSignOut}
              className="relative group text-sm font-light tracking-widest text-gray-600 hover:text-pink-500 transition-colors uppercase"
            >
              ABMELDEN
              <span className="absolute -bottom-1 left-0 h-0.5 bg-pink-500 transition-all duration-300 w-0 group-hover:w-full"></span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}