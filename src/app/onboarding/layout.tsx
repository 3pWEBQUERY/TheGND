import React from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect('/auth/signin')
  }

  // Prevent accessing onboarding when already completed or skipped
  const status = (session.user as any)?.onboardingStatus
  if (status === 'COMPLETED' || status === 'SKIPPED') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      {children}
    </div>
  )
}
