'use client'

import DashboardHeader from '@/components/DashboardHeader'
import Footer from '@/components/homepage/Footer'
import { useSession } from 'next-auth/react'
import { useEffect, useRef, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SettingsPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState<string>('profil')
  const detailsRef = useRef<HTMLDivElement>(null)
  const [displayName, setDisplayName] = useState<string>('')
  const [city, setCity] = useState<string>('')
  const [country, setCountry] = useState<string>('')
  const [loadingProfile, setLoadingProfile] = useState<boolean>(false)
  const [savingProfile, setSavingProfile] = useState<boolean>(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' })
  const [visibility, setVisibility] = useState<'PUBLIC' | 'VERIFIED' | 'PRIVATE'>('PUBLIC')
  const [notificationPref, setNotificationPref] = useState<'ALL' | 'IMPORTANT' | 'NONE'>('ALL')
  const [savingPrivacy, setSavingPrivacy] = useState<boolean>(false)
  const [privacyMessage, setPrivacyMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' })

  const go = (value: string) => {
    setTab(value)
    // smooth scroll to details section
    requestAnimationFrame(() => {
      detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleSavePrivacy = async () => {
    try {
      setSavingPrivacy(true)
      setPrivacyMessage({ type: null, text: '' })
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData: {
          visibility,
          notificationPreference: notificationPref,
        } })
      })
      if (!res.ok) throw new Error('Failed')
      setPrivacyMessage({ type: 'success', text: 'Privatsphäre gespeichert' })
    } catch (e) {
      setPrivacyMessage({ type: 'error', text: 'Speichern fehlgeschlagen' })
    } finally {
      setSavingPrivacy(false)
    }
  }

  // Load current user's profile to prefill display name, city and country
  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        setLoadingProfile(true)
        const res = await fetch('/api/profile')
        if (!res.ok) return
        const data = await res.json()
        if (active) {
          setDisplayName(data?.user?.profile?.displayName ?? '')
          setCity(data?.user?.profile?.city ?? '')
          setCountry(data?.user?.profile?.country ?? '')
          setVisibility((data?.user?.profile?.visibility as 'PUBLIC' | 'VERIFIED' | 'PRIVATE') ?? 'PUBLIC')
          setNotificationPref((data?.user?.profile?.notificationPreference as 'ALL' | 'IMPORTANT' | 'NONE') ?? 'ALL')
        }
      } catch (e) {
        // ignore
      } finally {
        if (active) setLoadingProfile(false)
      }
    }
    load()
    return () => { active = false }
  }, [])

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true)
      setSaveMessage({ type: null, text: '' })
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileData: { 
          displayName: displayName?.trim() || null,
          city: city?.trim() || null,
          country: country?.trim() || null,
        } })
      })
      if (!res.ok) throw new Error('Failed')
      setSaveMessage({ type: 'success', text: 'Profil gespeichert' })
    } catch (e) {
      setSaveMessage({ type: 'error', text: 'Speichern fehlgeschlagen' })
    } finally {
      setSavingProfile(false)
    }
  }
  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader session={session} activeTab="settings" setActiveTab={() => {}} />
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-light tracking-widest text-gray-900">EINSTELLUNGEN</h1>
        <div className="w-24 h-px bg-pink-500 mt-3" />
        <p className="text-sm text-gray-600 mt-4">Verwalte dein Profil, Konto und Privatsphäre.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            className="border border-gray-200 p-6 cursor-pointer hover:bg-pink-50/40 hover:border-pink-200 transition-colors"
            role="button"
            tabIndex={0}
            onClick={() => go('profil')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('profil') } }}
            aria-controls="settings-details"
          >
            <h2 className="text-sm font-light tracking-widest text-gray-800">PROFIL</h2>
            <p className="text-xs text-gray-500 mt-2">Profilangaben, Avatar und Details bearbeiten.</p>
          </div>
          <div
            className="border border-gray-200 p-6 cursor-pointer hover:bg-pink-50/40 hover:border-pink-200 transition-colors"
            role="button"
            tabIndex={0}
            onClick={() => go('konto')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('konto') } }}
            aria-controls="settings-details"
          >
            <h2 className="text-sm font-light tracking-widest text-gray-800">KONTO</h2>
            <p className="text-xs text-gray-500 mt-2">E-Mail, Passwort und Sicherheit.</p>
          </div>
          <div
            className="border border-gray-200 p-6 cursor-pointer hover:bg-pink-50/40 hover:border-pink-200 transition-colors"
            role="button"
            tabIndex={0}
            onClick={() => go('privatsphaere')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('privatsphaere') } }}
            aria-controls="settings-details"
          >
            <h2 className="text-sm font-light tracking-widest text-gray-800">PRIVATSPHÄRE</h2>
            <p className="text-xs text-gray-500 mt-2">Sichtbarkeit und Benachrichtigungen steuern.</p>
          </div>
          <div
            className="border border-gray-200 p-6 cursor-pointer hover:bg-pink-50/40 hover:border-pink-200 transition-colors"
            role="button"
            tabIndex={0}
            onClick={() => go('abos')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('abos') } }}
            aria-controls="settings-details"
          >
            <h2 className="text-sm font-light tracking-widest text-gray-800">ABOS & ZAHLUNGEN</h2>
            <p className="text-xs text-gray-500 mt-2">Abo-Status und Rechnungen.</p>
          </div>
        </div>

        {/* Detail-Einstellungen */}
        <div className="mt-12" id="settings-details" ref={detailsRef}>
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsContent value="profil" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="displayName" className="text-xs font-light tracking-widest text-gray-800 uppercase">ANZEIGENAME</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="z. B. Anna, Maria, ..."
                    className="mt-2 border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 focus:ring-0 bg-transparent"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-xs font-light tracking-widest text-gray-800 uppercase">STADT</Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="z. B. Berlin"
                    className="mt-2 border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 focus:ring-0 bg-transparent"
                  />
                </div>
                <div>
                  <Label className="text-xs font-light tracking-widest text-gray-800 uppercase">LAND</Label>
                  <div className="mt-2">
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 bg-transparent"><SelectValue placeholder="Land wählen" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Deutschland">Deutschland</SelectItem>
                        <SelectItem value="Österreich">Österreich</SelectItem>
                        <SelectItem value="Schweiz">Schweiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleSaveProfile}
                  disabled={savingProfile || loadingProfile}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-light tracking-widest py-3 text-sm uppercase rounded-none disabled:opacity-60"
                >
                  {savingProfile ? 'Speichern…' : 'Speichern'}
                </Button>
                {saveMessage.type && (
                  <p className={saveMessage.type === 'success' ? 'mt-2 text-xs text-pink-600' : 'mt-2 text-xs text-red-600'} aria-live="polite">
                    {saveMessage.text}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="konto" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email" className="text-xs font-light tracking-widest text-gray-800 uppercase">E-MAIL</Label>
                  <Input id="email" type="email" placeholder="name@example.com" className="mt-2 border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 focus:ring-0 bg-transparent" />
                </div>
                <div>
                  <Label htmlFor="password" className="text-xs font-light tracking-widest text-gray-800 uppercase">NEUES PASSWORT</Label>
                  <Input id="password" type="password" className="mt-2 border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 focus:ring-0 bg-transparent" />
                </div>
                <div>
                  <Label htmlFor="password2" className="text-xs font-light tracking-widest text-gray-800 uppercase">PASSWORT BESTÄTIGEN</Label>
                  <Input id="password2" type="password" className="mt-2 border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 focus:ring-0 bg-transparent" />
                </div>
              </div>
              <div className="mt-6">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white font-light tracking-widest py-3 text-sm uppercase rounded-none">Änderungen speichern</Button>
              </div>
            </TabsContent>

            <TabsContent value="privatsphaere" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-xs font-light tracking-widest text-gray-800 uppercase">SICHTBARKEIT</Label>
                  <div className="mt-2">
                    <Select value={visibility} onValueChange={(v) => setVisibility(v as 'PUBLIC' | 'VERIFIED' | 'PRIVATE')}>
                      <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 bg-transparent"><SelectValue placeholder="Sichtbarkeit wählen" /></SelectTrigger>
                      <SelectContent className="rounded-none border border-gray-200 shadow-none">
                        <SelectItem className="rounded-none" value="PUBLIC">Öffentlich</SelectItem>
                        <SelectItem className="rounded-none" value="VERIFIED">Nur verifiziert</SelectItem>
                        <SelectItem className="rounded-none" value="PRIVATE">Privat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-light tracking-widest text-gray-800 uppercase">BENACHRICHTIGUNGEN</Label>
                  <div className="mt-2">
                    <Select value={notificationPref} onValueChange={(v) => setNotificationPref(v as 'ALL' | 'IMPORTANT' | 'NONE')}>
                      <SelectTrigger className="w-full border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 bg-transparent"><SelectValue placeholder="Benachrichtigungen" /></SelectTrigger>
                      <SelectContent className="rounded-none border border-gray-200 shadow-none">
                        <SelectItem className="rounded-none" value="ALL">Alle</SelectItem>
                        <SelectItem className="rounded-none" value="IMPORTANT">Nur wichtige</SelectItem>
                        <SelectItem className="rounded-none" value="NONE">Keine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <Button onClick={handleSavePrivacy} disabled={savingPrivacy || loadingProfile} className="bg-pink-500 hover:bg-pink-600 text-white font-light tracking-widest py-3 text-sm uppercase rounded-none disabled:opacity-60">{savingPrivacy ? 'Speichern…' : 'Speichern'}</Button>
                {privacyMessage.type && (
                  <p className={privacyMessage.type === 'success' ? 'mt-2 text-xs text-pink-600' : 'mt-2 text-xs text-red-600'} aria-live="polite">
                    {privacyMessage.text}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="abos" className="mt-6">
              <p className="text-sm text-gray-600">Hier verwaltest du dein Abo, Rechnungen und Zahlungsmethoden.</p>
              <div className="mt-4">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white font-light tracking-widest py-3 text-sm uppercase rounded-none">Abo verwalten</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  )
}
