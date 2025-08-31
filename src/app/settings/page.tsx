'use client'

import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white">
      <MinimalistNavigation />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-light tracking-widest text-gray-900">EINSTELLUNGEN</h1>
        <div className="w-24 h-px bg-pink-500 mt-3" />
        <p className="text-sm text-gray-600 mt-4">Verwalte dein Profil, Konto und Privatsphäre.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 p-6">
            <h2 className="text-sm font-light tracking-widest text-gray-800">PROFIL</h2>
            <p className="text-xs text-gray-500 mt-2">Profilangaben, Avatar und Details bearbeiten.</p>
          </div>
          <div className="border border-gray-200 p-6">
            <h2 className="text-sm font-light tracking-widest text-gray-800">KONTO</h2>
            <p className="text-xs text-gray-500 mt-2">E-Mail, Passwort und Sicherheit.</p>
          </div>
          <div className="border border-gray-200 p-6">
            <h2 className="text-sm font-light tracking-widest text-gray-800">PRIVATSPHÄRE</h2>
            <p className="text-xs text-gray-500 mt-2">Sichtbarkeit und Benachrichtigungen steuern.</p>
          </div>
          <div className="border border-gray-200 p-6">
            <h2 className="text-sm font-light tracking-widest text-gray-800">ABOS & ZAHLUNGEN</h2>
            <p className="text-xs text-gray-500 mt-2">Abo-Status und Rechnungen.</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
