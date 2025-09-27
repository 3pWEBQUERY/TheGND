'use client'

import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import JobsHero from '@/components/homepage/JobsHero'
import JobsList from '@/components/jobs/JobsList'

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />
      <JobsHero />
      <JobsList />
      <Footer />
    </div>
  )
}
