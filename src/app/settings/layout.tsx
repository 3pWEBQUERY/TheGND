import Footer from '@/components/homepage/Footer'
import React from 'react'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
