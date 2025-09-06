'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
 
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function MinimalistNavigation() {
  const { data: session } = useSession()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

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
  }, [session?.user?.id])

  return (
    <nav className="absolute top-0 w-full z-50 bg-transparent">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-light tracking-widest text-white">
            <Link href="/">THEGND</Link>
          </div>
          
          {/* Centered Navigation */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:flex items-center space-x-12 text-sm font-light tracking-widest text-white">
            <Link href="/escorts" className="relative group transition-colors">
              ESCORTS
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/agency" className="relative group transition-colors">
              AGENTUREN
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-pink-500 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#contact" className="relative group transition-colors">
              CLUB & STUDIO
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