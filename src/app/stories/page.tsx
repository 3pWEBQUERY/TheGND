'use client'

import { Suspense } from 'react'
import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import StoriesHero from '@/components/homepage/StoriesHero'
import StoriesGallery from '@/components/homepage/StoriesGallery'

export default function StoriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white"><MinimalistNavigation /><div className="max-w-5xl mx-auto px-6 py-10">Laden...</div><Footer /></div>}>
      <StoriesPageInner />
    </Suspense>
  )
}

function StoriesPageInner() {
  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />
      <StoriesHero />
      <StoriesGallery userType="ESCORT" />
      <Footer />
    </div>
  )
}
