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
              <div className="mb-8 rounded-none border border-pink-300 bg-gradient-to-r from-pink-50 to-white p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 min-h-[160px]">
                <div>
                  <span className="inline-block mb-2 text-[10px] uppercase tracking-widest text-white bg-pink-600 px-2 py-0.5">NEU</span>
                  <h3 className="text-xl md:text-2xl font-light tracking-wider text-gray-900 mb-2">BILDER PER KI VERBESSERN</h3>
                  <p className="text-sm md:text-base font-light tracking-wide text-gray-700">Verbessere deine Fotos automatisch – mehr Schärfe, bessere Farben und weniger Rauschen – mit nur einem Klick.</p>
                </div>
                <button
                  type="button"
                  onClick={() => { try { window.alert('KI-Optimierung folgt in Kürze.'); } catch {} }}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm uppercase tracking-widest bg-pink-600 text-white hover:bg-pink-700 shadow-md hover:shadow-lg transition"
                >
                  <Wand2 className="h-5 w-5" />
                  JETZT VERBESSERN
                </button>
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
