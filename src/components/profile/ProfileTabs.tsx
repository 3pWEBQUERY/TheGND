'use client'

import React from 'react'
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
