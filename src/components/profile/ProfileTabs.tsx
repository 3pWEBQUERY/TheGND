'use client'

import React from 'react'
import { Wand2 } from 'lucide-react'
import ProfileTabsBar from '@/components/profile/ProfileTabsBar'
import ProfileAboutTab from '@/components/profile/ProfileAboutTab'
import ProfilePosts from '@/components/profile/ProfilePosts'
import ProfileGalleryGrid from '@/components/profile/ProfileGalleryGrid'
import ProfileContactInfo from '@/components/profile/ProfileContactInfo'
import ProfileVisitorsTab from '@/components/profile/ProfileVisitorsTab'

export default function ProfileTabs(props: {
  active: string
  onChange: (key: string) => void
  profile: any
  userType: any
  user: { posts: any[]; followers: any[]; following: any[]; stories: any[] }
  displayName: string
  avatar?: string | null
  mediaItems: any[]
  isOwnProfile: boolean
  settingAvatarUrl: string | null
  deletingIndex: number | null
  onSetAvatar: (url: string) => void
  onDelete: (item: any, index: number) => void
  onOpenLightbox: (index: number) => void
  visitors: any[] | null
}) {
  const {
    active,
    onChange,
    profile,
    userType,
    user,
    displayName,
    avatar,
    mediaItems,
    isOwnProfile,
    settingAvatarUrl,
    deletingIndex,
    onSetAvatar,
    onDelete,
    onOpenLightbox,
    visitors,
  } = props

  return (
    <div className="bg-white border border-gray-100 rounded-none">
      <ProfileTabsBar active={active as any} onChange={onChange} />
      <div className="p-4 sm:p-8">
        {active === 'about' && (
          <ProfileAboutTab profile={profile} userType={userType} />
        )}
        {active === 'posts' && (
          <ProfilePosts posts={user.posts} displayName={displayName} avatar={avatar} />
        )}
        {active === 'gallery' && (
          <>
            {isOwnProfile && userType === 'ESCORT' && (
              <div className="relative mb-12 rounded-none border border-pink-500 border-l-8 border-l-pink-600 bg-gradient-to-r from-pink-200 via-pink-100 to-white p-10 sm:p-12 shadow-xl ring-2 ring-pink-200/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-10 min-h-[260px] sm:min-h-[300px]">
                <div className="flex items-start gap-4">
                  <div className="hidden sm:flex items-center justify-center h-20 w-20 bg-pink-600 text-white">
                    <Wand2 className="h-10 w-10" />
                  </div>
                  <div>
                    <span className="inline-block mb-3 text-[10px] uppercase tracking-widest text-white bg-pink-600 px-2 py-0.5 animate-pulse">NEU</span>
                    <h3 className="text-3xl md:text-4xl font-light tracking-wider text-gray-900 mb-3">BILDER PER KI VERBESSERN</h3>
                    <p className="text-base md:text-lg font-light tracking-wide text-gray-700">Verbessere deine Fotos automatisch – mehr Schärfe, bessere Farben und weniger Rauschen – mit nur einem Klick.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => { try { window.alert('KI-Optimierung folgt in Kürze.'); } catch {} }}
                  className="inline-flex items-center gap-2 px-7 py-4 text-base md:text-lg uppercase tracking-widest bg-pink-600 text-white hover:bg-pink-700 shadow-xl shadow-pink-200/60 hover:shadow-2xl transition transform hover:scale-[1.02] ring-2 ring-pink-300"
                >
                  <Wand2 className="h-7 w-7" />
                  JETZT VERBESSERN
                </button>
                <Wand2 className="absolute -top-4 -right-4 h-32 w-32 rotate-12 text-pink-300/20 hidden md:block pointer-events-none" />
              </div>
            )}
            <ProfileGalleryGrid
              mediaItems={mediaItems as any}
              isOwnProfile={isOwnProfile}
              currentAvatarUrl={avatar || null}
              settingAvatarUrl={settingAvatarUrl}
              deletingIndex={deletingIndex}
              onSetAvatar={(url) => onSetAvatar(url)}
              onDelete={(item, index) => onDelete(item, index)}
              onOpenLightbox={(index) => onOpenLightbox(index)}
            />
          </>
        )}
        {active === 'contact' && profile && (
          <ProfileContactInfo profile={profile} city={profile?.city} country={profile?.country} />
        )}
        {active === 'visitors' && (
          <ProfileVisitorsTab visitors={visitors || []} />
        )}
      </div>
    </div>
  )
}
