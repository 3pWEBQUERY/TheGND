'use client'

import { canCreateStories } from '@/lib/validations'
import { UserType } from '@prisma/client'

interface DashboardMobileNavigationProps {
  session: any
  activeTab: string
  setActiveTab: (tab: string) => void
}

export default function DashboardMobileNavigation({ session, activeTab, setActiveTab }: DashboardMobileNavigationProps) {
  const userType = session.user.userType as UserType
  const canStories = canCreateStories(userType)

  return (
    <div className="md:hidden mb-8">
      <div className="flex space-x-4 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`text-sm font-light tracking-widest uppercase whitespace-nowrap py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'dashboard' ? 'text-pink-500 border-pink-500' : 'text-gray-600 border-transparent hover:text-pink-500'
          }`}
        >
          DASHBOARD
        </button>
        <button 
          onClick={() => setActiveTab('feed')}
          className={`text-sm font-light tracking-widest uppercase whitespace-nowrap py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'feed' ? 'text-pink-500 border-pink-500' : 'text-gray-600 border-transparent hover:text-pink-500'
          }`}
        >
          FEED
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`text-sm font-light tracking-widest uppercase whitespace-nowrap py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'profile' ? 'text-pink-500 border-pink-500' : 'text-gray-600 border-transparent hover:text-pink-500'
          }`}
        >
          PROFIL
        </button>
        <button 
          onClick={() => setActiveTab('messages')}
          className={`text-sm font-light tracking-widest uppercase whitespace-nowrap py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'messages' ? 'text-pink-500 border-pink-500' : 'text-gray-600 border-transparent hover:text-pink-500'
          }`}
        >
          FORUM
        </button>
        <button 
          onClick={() => setActiveTab('forum')}
          className={`text-sm font-light tracking-widest uppercase whitespace-nowrap py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'forum' ? 'text-pink-500 border-pink-500' : 'text-gray-600 border-transparent hover:text-pink-500'
          }`}
        >
          NACHRICHTEN
        </button>
        <button 
          onClick={() => setActiveTab('network')}
          className={`text-sm font-light tracking-widest uppercase whitespace-nowrap py-2 px-4 border-b-2 transition-colors ${
            activeTab === 'network' ? 'text-pink-500 border-pink-500' : 'text-gray-600 border-transparent hover:text-pink-500'
          }`}
        >
          NETZWERK
        </button>
        {canStories && (
          <button 
            onClick={() => setActiveTab('stories')}
            className={`text-sm font-light tracking-widest uppercase whitespace-nowrap py-2 px-4 border-b-2 transition-colors ${
              activeTab === 'stories' ? 'text-pink-500 border-pink-500' : 'text-gray-600 border-transparent hover:text-pink-500'
            }`}
          >
            STORIES
          </button>
        )}
      </div>
    </div>
  )
}