'use client'

import { useSession } from 'next-auth/react'
import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import HeroSection from '@/components/homepage/HeroSection'
import EscortsGridSection from '@/components/homepage/EscortsGridSection'
import AgencyGridSection from '@/components/homepage/AgencyGridSection'
import ClubStudioGridSection from '@/components/homepage/ClubStudioGridSection'
import JoinCtaSection from '@/components/homepage/JoinCtaSection'
import VisionSection from '@/components/homepage/VisionSection'
import StoriesGallery from '@/components/homepage/StoriesGallery'
import Footer from '@/components/homepage/Footer'
import FeaturedPlacesSection from '@/components/homepage/FeaturedPlacesSection'

export default function Home() {
  const { data: session, status } = useSession()
  // Hinweis: Eingeloggte Nutzer dürfen die Startseite sehen. Keine Auto-Weiterleitung.

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <img src="/blocks-wave.svg" alt="Laden" className="w-14 h-14" />
          <div className="text-lg">Laden...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />
      <HeroSection />
      <StoriesGallery />
      <FeaturedPlacesSection />
      <EscortsGridSection />
      <VisionSection />
      <AgencyGridSection />
      <ClubStudioGridSection />
      <JoinCtaSection />
      <Footer />
    </div>
  )
}

