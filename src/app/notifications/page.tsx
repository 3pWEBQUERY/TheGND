'use client'

import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/homepage/Footer'
import { useSession } from 'next-auth/react'

export default function NotificationsPage() {
  const { data: session } = useSession()
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <DashboardHeader session={session} activeTab="notifications" setActiveTab={() => {}} />
      <main className="flex-1">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-light tracking-widest text-gray-900">BENACHRICHTIGUNGEN</h1>
        <div className="w-24 h-px bg-pink-500 mt-3" />
        <p className="text-sm text-gray-600 mt-4">Hier erscheinen deine Benachrichtigungen.</p>
        <div className="mt-6 text-sm text-gray-500">Noch keine Inhalte – bald verfügbar.</div>
      </div>
      </main>
      <Footer />
    </div>
  )
}
