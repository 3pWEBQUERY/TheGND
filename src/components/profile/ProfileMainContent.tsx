'use client'

import React, { useState } from 'react'
import ProfileHeader from '@/components/profile/ProfileHeader'
import ProfileOrgConnections from '@/components/profile/ProfileOrgConnections'
import ProfileViewSection from '@/components/profile/ProfileViewSection'
import ProfileTabs from '@/components/profile/ProfileTabs'
import ProfileOverlays from '@/components/profile/ProfileOverlays'
import ProfileBannerDrawer from '@/components/profile/ProfileBannerDrawer'
 

export default function ProfileMainContent(props: {

  // header basics
  isOwnProfile: boolean
  profile: any
  user: { posts: any[]; followers: any[]; following: any[]; stories: any[] }
  userType: string
  displayName: string
  formattedLocation: string
  avatarSize: number | null
  editBtnRef: React.RefObject<HTMLButtonElement | null>
  onEdit: () => void
  onOpenVisitors: () => void
  userTypeLabel: string

  // org connections
  showOrgSection: boolean
  joinCode: string
  setJoinCode: (v: string) => void
  joining: boolean
  onSubmitJoin: () => void
  loadingMyOrgs: boolean
  myOrgs: Array<{ id: string; userType: string; name: string; avatar: string | null; city: string | null; country: string | null }> | null
  unlinking: string | null
  onUnlink: (orgId: string) => void

  // view section
  selectedView: 'STANDARD' | 'ALT1' | 'ALT2' | null
  onChangeView: (v: 'STANDARD' | 'ALT1' | 'ALT2') => void
  onSaveView: () => Promise<void> | void
  savingView: boolean
  savedViewAt: number | null

  // tabs
  activeTab: string
  onChangeTab: (key: string) => void
  mediaItems: any[]
  settingAvatarUrl: string | null
  deletingIndex: number | null
  onSetAvatar: (url: string) => void
  onDeleteMedia: (item: any, index: number) => void
  onOpenLightbox: (index: number) => void
  visitors: any[]

  // overlays
  showVisitors: boolean
  onCloseVisitors: () => void
  anonCount: number
  loadingVisitors: boolean
  visitorDays: number
  onDaysChange: (n: number) => void
  lightboxIndex: number | null
  onCloseLightbox: () => void
}) {
  const {
    isOwnProfile,
    profile,
    user,
    userType,
    displayName,
    formattedLocation,
    avatarSize,
    editBtnRef,
    onEdit,
    onOpenVisitors,
    userTypeLabel,
    showOrgSection,
    joinCode,
    setJoinCode,
    joining,
    onSubmitJoin,
    loadingMyOrgs,
    myOrgs,
    unlinking,
    onUnlink,
    selectedView,
    onChangeView,
    onSaveView,
    savingView,
    savedViewAt,
    activeTab,
    onChangeTab,
    mediaItems,
    settingAvatarUrl,
    deletingIndex,
    onSetAvatar,
    onDeleteMedia,
    onOpenLightbox,
    visitors,
    showVisitors,
    onCloseVisitors,
    anonCount,
    loadingVisitors,
    visitorDays,
    onDaysChange,
    lightboxIndex,
    onCloseLightbox,
  } = props
  const [bannerOpen, setBannerOpen] = useState(false)

  return (
    <div>
      <div className="max-w-7xl mx-auto space-y-8 overflow-x-hidden">
        <ProfileHeader
          isOwnProfile={isOwnProfile}
          avatarUrl={profile?.avatar}
          displayName={displayName}
          avatarSize={avatarSize}
          onEdit={onEdit}
          onOpenVisitors={onOpenVisitors}
          editBtnRef={editBtnRef}
          userTypeLabel={userTypeLabel}
          profile={profile}
          formattedLocation={formattedLocation}
          postsCount={user.posts.length}
          followersCount={user.followers.length}
          followingCount={user.following.length}
          storiesCount={user.stories.length}
          showBannerButton={isOwnProfile && userType === 'MEMBER'}
          onOpenBanner={() => setBannerOpen(true)}
        />
        {showOrgSection && (
          <ProfileOrgConnections
            joinCode={joinCode}
            onChangeJoinCode={setJoinCode}
            joining={joining}
            onSubmitJoin={onSubmitJoin}
            loadingMyOrgs={loadingMyOrgs}
            myOrgs={myOrgs}
            unlinking={unlinking}
            onUnlink={onUnlink}
          />
        )}

        <ProfileViewSection
          isOwnProfile={isOwnProfile}
          userType={userType}
          selectedView={selectedView}
          onChange={onChangeView}
          onSave={onSaveView}
          saving={savingView}
          savedAt={savedViewAt}
        />

        <ProfileTabs
          active={activeTab}
          onChange={onChangeTab}
          profile={profile}
          userType={userType}
          user={user}
          displayName={displayName}
          avatar={profile?.avatar}
          mediaItems={mediaItems as any}
          isOwnProfile={isOwnProfile}
          settingAvatarUrl={settingAvatarUrl}
          deletingIndex={deletingIndex}
          onSetAvatar={onSetAvatar}
          onDelete={onDeleteMedia}
          onOpenLightbox={onOpenLightbox}
          visitors={visitors || []}
        />

        <ProfileOverlays
          showVisitors={showVisitors}
          onCloseVisitors={onCloseVisitors}
          visitors={visitors}
          anonCount={anonCount}
          loadingVisitors={loadingVisitors}
          visitorDays={visitorDays}
          onDaysChange={onDaysChange}
          lightboxIndex={lightboxIndex}
          mediaItems={mediaItems as any[]}
          onCloseLightbox={onCloseLightbox}
        />
        <ProfileBannerDrawer open={bannerOpen} onOpenChange={setBannerOpen} />
      </div>
    </div>
  )
}
