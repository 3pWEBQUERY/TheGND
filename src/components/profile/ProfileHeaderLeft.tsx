'use client'

import { Users, MessageCircle, Edit } from 'lucide-react'

type Props = {
  isOwnProfile: boolean
  avatarUrl?: string | null
  displayName: string
  avatarSize: number | null
  onEdit: () => void
  onOpenVisitors: () => void
  editBtnRef: React.RefObject<HTMLButtonElement | null>
}

export default function ProfileHeaderLeft({ isOwnProfile, avatarUrl, displayName, avatarSize, onEdit, onOpenVisitors, editBtnRef }: Props) {
  return (
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
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" />
        ) : (
          <span className="text-3xl font-light tracking-widest text-gray-600">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {isOwnProfile && (
        <button
          ref={editBtnRef}
          onClick={onEdit}
          className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-light tracking-widest px-6 py-3 transition-colors uppercase flex items-center space-x-2"
        >
          <Edit className="h-4 w-4" />
          <span>PROFIL BEARBEITEN</span>
        </button>
      )}

      {isOwnProfile && (
        <button
          onClick={onOpenVisitors}
          className="border border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500 text-xs font-light tracking-widest px-6 py-3 transition-colors uppercase flex items-center space-x-2"
          style={{ width: avatarSize ?? undefined }}
        >
          <Users className="h-4 w-4" />
          <span>BESUCHER</span>
        </button>
      )}

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
  )
}
