'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { getUserTypeDisplayName } from '@/lib/validations'
import { UserType } from '@prisma/client'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

export default function OnboardingPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isSkipping, setIsSkipping] = useState(false)
  const [profileData, setProfileData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const searchParams = useSearchParams()
  const isEditMode = searchParams.get('edit') === '1'
  const addEditParam = (href: string) => (isEditMode ? `${href}?edit=1` : href)

  // Fetch profile data to check completion status
  useEffect(() => {
    const fetchProfileData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/profile')
          if (response.ok) {
            const data = await response.json()
            setProfileData(data)
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    if (session?.user?.id) {
      fetchProfileData()
    } else if (status !== 'loading') {
      setIsLoading(false)
    }
  }, [session?.user?.id, status])

  // Check completion status for member
  const isPersonalDetailsCompleted = profileData?.user?.profile && (
    profileData.user.profile.displayName || 
    profileData.user.profile.age || 
    profileData.user.profile.gender || 
    profileData.user.profile.location || 
    profileData.user.profile.bio || 
    profileData.user.profile.preferences
  )
  const isProfileMediaCompleted = profileData?.user?.profile?.avatar

  const handleContinueToMedia = () => {
    router.push('/onboarding/member/media')
  }

  const handleCompleteOnboarding = async () => {
    try {
      const response = await fetch('/api/user/complete-onboarding', {
        method: 'POST'
      })
      
      if (response.ok) {
        // Session sofort aktualisieren, damit Dashboard nicht zurück auf Onboarding redirected
        await update?.({ user: { onboardingStatus: 'COMPLETED' } })
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
    }
  }

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (!isEditMode && (session?.user?.onboardingStatus === 'COMPLETED' || session?.user?.onboardingStatus === 'SKIPPED')) {
      router.push('/dashboard')
    }
  }, [session, status, router, isEditMode])

  const handleStartOnboarding = () => {
    if (!session?.user?.userType) return
    
    const userType = session.user.userType as UserType
    
    if (userType === 'MEMBER') {
      router.push('/onboarding/member')
    } else if (userType === 'ESCORT') {
      router.push('/onboarding/escort/step-1')
    } else if (userType === 'AGENCY') {
      router.push('/onboarding/agency/step-1')
    } else if (userType === 'CLUB') {
      router.push('/onboarding/club/step-1')
    } else if (userType === 'STUDIO') {
      router.push('/onboarding/studio/step-1')
    }
  }

  const handleSkipOnboarding = async () => {
    setIsSkipping(true)
    
    try {
      const response = await fetch('/api/user/skip-onboarding', {
        method: 'POST'
      })
      
      if (response.ok) {
        await update?.({ user: { onboardingStatus: 'SKIPPED' } })
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error skipping onboarding:', error)
    } finally {
      setIsSkipping(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-sm font-light tracking-widest text-gray-600">LÄDT...</div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const userTypeDisplay = getUserTypeDisplayName(session.user.userType as UserType)

  // Compute Escort completion states based on loaded profileData
  const escortProfile = profileData?.user?.profile as any
  const escortStep1Completed = !!(
    escortProfile?.displayName && escortProfile?.age && escortProfile?.gender
  )
  const escortStep2Completed = !!(
    escortProfile?.height &&
    escortProfile?.weight &&
    escortProfile?.bodyType &&
    escortProfile?.hairColor &&
    escortProfile?.eyeColor
  )
  const escortStep3Completed = !!(escortProfile?.description && String(escortProfile.description).trim().length > 0)
  const escortStep4Completed = !!(
    (Array.isArray(escortProfile?.gallery) && escortProfile.gallery.length > 0) ||
    (Array.isArray(escortProfile?.media) && escortProfile.media.length > 0)
  )
  const escortStep5Completed = !!(
    Array.isArray(escortProfile?.services) && escortProfile.services.length > 0
  )
  const hasAnySocial = (() => {
    const sm = escortProfile?.socialMedia
    if (!sm || typeof sm !== 'object') return false
    return Object.values(sm).some((v: any) => !!v)
  })()
  const escortStep6Completed = !!(
    escortProfile?.phone || escortProfile?.website || hasAnySocial
  )
  const escortStep7Completed = !!(
    (escortProfile?.latitude != null && escortProfile?.longitude != null) ||
    (escortProfile?.address && escortProfile?.city && escortProfile?.country)
  )
  const escortAllCompleted = (
    escortStep1Completed &&
    escortStep2Completed &&
    escortStep3Completed &&
    escortStep4Completed &&
    escortStep5Completed &&
    escortStep6Completed &&
    escortStep7Completed
  )

  // Compute Agency completion states (steps 4–7)
  const agencyProfile = profileData?.user?.profile as any
  const agencyStep4Completed = !!(
    agencyProfile?.avatar ||
    (Array.isArray(agencyProfile?.gallery) && agencyProfile.gallery.length > 0) ||
    (Array.isArray(agencyProfile?.media) && agencyProfile.media.length > 0)
  )
  const agencyStep5Completed = !!(
    Array.isArray(agencyProfile?.services) && agencyProfile.services.length > 0
  )
  const agencyHasAnySocial = (() => {
    const sm = agencyProfile?.socialMedia
    if (!sm || typeof sm !== 'object') return false
    return Object.values(sm).some((v: any) => !!v)
  })()
  const agencyStep6Completed = !!(
    agencyProfile?.phone || agencyProfile?.website || agencyHasAnySocial
  )
  const agencyStep7Completed = !!(
    (agencyProfile?.latitude != null && agencyProfile?.longitude != null) ||
    (agencyProfile?.address && agencyProfile?.city && agencyProfile?.country)
  )
  // Note: We intentionally avoid computing an overall completion flag for agencies here
  // because steps 1–3 completion logic isn't implemented on this page yet.

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Navigation */}
      <nav className="absolute top-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center text-sm font-light tracking-widest text-gray-600 hover:text-pink-500 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ZUM DASHBOARD
            </Link>
            <div className="text-sm font-light tracking-widest text-gray-600">
              EINRICHTUNG
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6 pt-24 sm:pt-28">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-thin tracking-wide sm:tracking-wider leading-tight sm:leading-snug text-gray-800 mb-6">WILLKOMMEN</h1>
            <div className="w-24 h-px bg-pink-500 mx-auto mb-8"></div>
            <p className="text-lg font-light tracking-wide text-gray-600 mb-4">
              Vervollständige die Einrichtung deines {userTypeDisplay}-Profils
            </p>
            <p className="text-sm font-light text-gray-500">
              Erstelle ein herausragendes Profil, um in unserer exklusiven Community hervorzustechen
            </p>
          </div>

          {/* Steps Overview */}
          <div className="mb-16">
            <h2 className="text-2xl font-thin tracking-wider text-gray-800 mb-8 text-center">EINRICHTUNGSPROZESS</h2>
            
            <div className="space-y-6">
              {session.user.userType === 'MEMBER' && (
                <>
                  <div className={`flex items-center space-x-4 p-4 border-l-2 ${
                    isPersonalDetailsCompleted ? 'border-pink-500' : 'border-gray-200'
                  }`}>
                    {isPersonalDetailsCompleted ? (
                      <Check className="h-5 w-5 text-pink-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-light tracking-wide text-gray-800">Persönliche Angaben</h3>
                      <p className="text-sm font-light text-gray-600">Anzeigename, Alter, Ort, Bio und Vorlieben</p>
                    </div>
                    {!isPersonalDetailsCompleted && (
                      <Button 
                        type="button"
                        onClick={() => router.push('/onboarding/member')}
                        size="sm"
                        className="bg-pink-500 hover:bg-pink-600 text-white font-light tracking-wide px-4 py-2 text-xs rounded-none"
                      >
                        Vervollständigen
                      </Button>
                    )}
                  </div>
                  <div className={`flex items-center space-x-4 p-4 border-l-2 ${
                    isProfileMediaCompleted ? 'border-pink-500' : 'border-gray-200'
                  }`}>
                    {isProfileMediaCompleted ? (
                      <Check className="h-5 w-5 text-pink-500" />
                    ) : (
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-light tracking-wide text-gray-800">Profil-Medien</h3>
                      <p className="text-sm font-light text-gray-600">Profilbild hochladen (optional)</p>
                    </div>
                    {isPersonalDetailsCompleted && !isProfileMediaCompleted && (
                      <Button 
                        type="button"
                        onClick={handleContinueToMedia}
                        size="sm"
                        className="bg-pink-500 hover:bg-pink-600 text-white font-light tracking-wide px-4 py-2 text-xs rounded-none"
                      >
                        Medien hinzufügen
                      </Button>
                    )}
                  </div>
                </>
              )}
            
            
          
            {session.user.userType === 'ESCORT' && (
              <>
                {/* Schritt 1 */}
                <div className={`flex items-center space-x-4 p-4 border-l-2 ${escortStep1Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                  {escortStep1Completed ? (
                    <Check className="h-5 w-5 text-pink-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-light tracking-wide text-gray-800">Professionelles Profil</h3>
                    <p className="text-sm font-light text-gray-600">Anzeigename, Slogan und Basisangaben</p>
                  </div>
                  <Link href={addEditParam('/onboarding/escort/step-1')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                </div>

                {/* Schritt 2 */}
                <div className={`flex items-center space-x-4 p-4 border-l-2 ${escortStep2Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                  {escortStep2Completed ? (
                    <Check className="h-5 w-5 text-pink-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-light tracking-wide text-gray-800">Körperliche Beschreibung</h3>
                    <p className="text-sm font-light text-gray-600">Aussehen und Merkmale</p>
                  </div>
                  <Link href={addEditParam('/onboarding/escort/step-2')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                </div>

                {/* Schritt 3 */}
                <div className={`flex items-center space-x-4 p-4 border-l-2 ${escortStep3Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                  {escortStep3Completed ? (
                    <Check className="h-5 w-5 text-pink-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-light tracking-wide text-gray-800">Beschreibung</h3>
                  <p className="text-sm font-light text-gray-600">Über dich, Persönlichkeit, Vorlieben</p>
                  </div>
                  <Link href={addEditParam('/onboarding/escort/step-3')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                </div>

                {/* Schritt 4 */}
                <div className={`flex items-center space-x-4 p-4 border-l-2 ${escortStep4Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                  {escortStep4Completed ? (
                    <Check className="h-5 w-5 text-pink-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-light tracking-wide text-gray-800">Galerie</h3>
                    <p className="text-sm font-light text-gray-600">Fotos & Medien</p>
                  </div>
                  <Link href={addEditParam('/onboarding/escort/step-4')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                </div>

                {/* Schritt 5 */}
                <div className={`flex items-center space-x-4 p-4 border-l-2 ${escortStep5Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                  {escortStep5Completed ? (
                    <Check className="h-5 w-5 text-pink-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-light tracking-wide text-gray-800">Services</h3>
                    <p className="text-sm font-light text-gray-600">Leistungen & Pakete</p>
                  </div>
                  <Link href={addEditParam('/onboarding/escort/step-5')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                </div>

                {/* Schritt 6 */}
                <div className={`flex items-center space-x-4 p-4 border-l-2 ${escortStep6Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                  {escortStep6Completed ? (
                    <Check className="h-5 w-5 text-pink-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-light tracking-wide text-gray-800">Kontakt</h3>
                    <p className="text-sm font-light text-gray-600">Telefon, Website & Social</p>
                  </div>
                  <Link href={addEditParam('/onboarding/escort/step-6')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                </div>

                {/* Schritt 7 */}
                <div className={`flex items-center space-x-4 p-4 border-l-2 ${escortStep7Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                  {escortStep7Completed ? (
                    <Check className="h-5 w-5 text-pink-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-light tracking-wide text-gray-800">Standort</h3>
                    <p className="text-sm font-light text-gray-600">Adresse, Stadt, Land</p>
                  </div>
                  <Link href={addEditParam('/onboarding/escort/step-7')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                </div>
              </>
            )}
          
            {['AGENCY', 'CLUB', 'STUDIO'].includes(session.user.userType) && (
              (() => {
                const base = session.user.userType === 'AGENCY' ? 'agency' : session.user.userType === 'CLUB' ? 'club' : 'studio'
                return (
                  <>
                    <div className="flex items-center space-x-4 p-4 border-l-2 border-gray-200">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <h3 className="font-light tracking-wide text-gray-800">Unternehmensinformationen</h3>
                        <p className="text-sm font-light text-gray-600">Firmendaten und Geschäftstyp</p>
                      </div>
                      <Link href={addEditParam(`/onboarding/${base}/step-1`)} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                    </div>
                    {base !== 'agency' && (
                      <div className="flex items-center space-x-4 p-4 border-l-2 border-gray-200">
                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        <div className="flex-1">
                          <h3 className="font-light tracking-wide text-gray-800">Standort & Kontakt</h3>
                          <p className="text-sm font-light text-gray-600">Adresse und Kontaktinformationen</p>
                        </div>
                        <Link href={addEditParam(`/onboarding/${base}/step-2`)} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                      </div>
                    )}
                    <div className="flex items-center space-x-4 p-4 border-l-2 border-gray-200">
                      <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                      <div className="flex-1">
                        <h3 className="font-light tracking-wide text-gray-800">{base === 'agency' ? 'Beschreibung' : 'Leistungen & Portfolio'}</h3>
                        <p className="text-sm font-light text-gray-600">{base === 'agency' ? 'Unternehmensbeschreibung' : 'Unternehmensbeschreibung und Galerie'}</p>
                      </div>
                      <Link href={addEditParam(base === 'agency' ? `/onboarding/${base}/step-2` : `/onboarding/${base}/step-3`)} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                    </div>
                    {base === 'agency' && (
                      <>
                        {/* Schritt 4 */}
                        <div className={`flex items-center space-x-4 p-4 border-l-2 ${agencyStep4Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                          {agencyStep4Completed ? (
                            <Check className="h-5 w-5 text-pink-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-light tracking-wide text-gray-800">Medien</h3>
                            <p className="text-sm font-light text-gray-600">Logo & Galerie</p>
                          </div>
                          <Link href={addEditParam('/onboarding/agency/step-4')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                        </div>

                        {/* Schritt 5 */}
                        <div className={`flex items-center space-x-4 p-4 border-l-2 ${agencyStep5Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                          {agencyStep5Completed ? (
                            <Check className="h-5 w-5 text-pink-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-light tracking-wide text-gray-800">Leistungen</h3>
                            <p className="text-sm font-light text-gray-600">Services auswählen</p>
                          </div>
                          <Link href={addEditParam('/onboarding/agency/step-5')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                        </div>

                        {/* Schritt 6 */}
                        <div className={`flex items-center space-x-4 p-4 border-l-2 ${agencyStep6Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                          {agencyStep6Completed ? (
                            <Check className="h-5 w-5 text-pink-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-light tracking-wide text-gray-800">Kontakt</h3>
                            <p className="text-sm font-light text-gray-600">Telefon, Website & Social</p>
                          </div>
                          <Link href={addEditParam('/onboarding/agency/step-6')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                        </div>

                        {/* Schritt 7 */}
                        <div className={`flex items-center space-x-4 p-4 border-l-2 ${agencyStep7Completed ? 'border-pink-500' : 'border-gray-200'}`}>
                          {agencyStep7Completed ? (
                            <Check className="h-5 w-5 text-pink-500" />
                          ) : (
                            <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-light tracking-wide text-gray-800">Standort</h3>
                            <p className="text-sm font-light text-gray-600">Adresse, Stadt, Land</p>
                          </div>
                          <Link href={addEditParam('/onboarding/agency/step-7')} className="text-xs font-light text-pink-600 hover:underline">Öffnen</Link>
                        </div>
                      </>
                    )}
                  </>
                )
              })()
            )}
          
            </div>
          </div>

          {!isEditMode && (
            <div className="text-center space-y-8">
              <div className="p-6 bg-gray-50 border">
                {session.user.userType === 'MEMBER' && isPersonalDetailsCompleted ? (
                  <p className="text-sm font-light text-gray-600 mb-4">
                    Super! Deine persönlichen Angaben sind vollständig. Du kannst jetzt Profil‑Medien hinzufügen oder die Einrichtung abschließen.
                  </p>
                ) : (
                  <p className="text-sm font-light text-gray-600 mb-4">
                    Du kannst die Einrichtung überspringen und später fortsetzen. Ein vollständiges Profil erhöht jedoch 
                    deine Sichtbarkeit und Networking‑Möglichkeiten deutlich.
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                {session.user.userType === 'ESCORT' && escortAllCompleted ? (
                  <>
                    <Button 
                      type="button"
                      onClick={handleCompleteOnboarding}
                      className="bg-green-500 hover:bg-green-600 text-white font-light tracking-widest px-12 py-3 text-sm uppercase rounded-none"
                    >
                      Einrichtung abschließen
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleSkipOnboarding}
                      variant="outline"
                      disabled={isSkipping}
                      className="font-light tracking-widest px-12 py-3 text-sm uppercase border-gray-300 hover:border-pink-500 rounded-none"
                    >
                      {isSkipping ? 'Wird übersprungen...' : 'Jetzt überspringen'}
                    </Button>
                  </>
                ) : session.user.userType === 'MEMBER' ? (
                  <>
                    {isPersonalDetailsCompleted ? (
                      <>
                        {!isProfileMediaCompleted ? (
                          <>
                            <Button 
                              type="button"
                              onClick={handleContinueToMedia}
                              className="font-light tracking-widest px-12 py-3 text-sm uppercase border-gray-300 hover:border-pink-500 rounded-none"
                            >
                              Medien hinzufügen
                            </Button>
                            <Button 
                              type="button"
                              onClick={handleSkipOnboarding}
                              variant="outline"
                              disabled={isSkipping}
                              className="font-light tracking-widest px-12 py-3 text-sm uppercase border-gray-300 hover:border-pink-500 rounded-none"
                            >
                              {isSkipping ? 'Wird übersprungen...' : 'Jetzt überspringen'}
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              type="button"
                              onClick={handleCompleteOnboarding}
                              className="bg-green-500 hover:bg-green-600 text-white font-light tracking-widest px-12 py-3 text-sm uppercase rounded-none"
                            >
                              Einrichtung abschließen
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <>
                        <Button 
                          type="button"
                          onClick={handleStartOnboarding} 
                          className="bg-pink-500 hover:bg-pink-600 text-white font-light tracking-widest px-12 py-3 text-sm uppercase rounded-none"
                        >
                          Einrichtung starten
                        </Button>

                        <Button 
                          type="button"
                          onClick={handleSkipOnboarding}
                          variant="outline"
                          disabled={isSkipping}
                          className="font-light tracking-widest px-12 py-3 text-sm uppercase border-gray-300 hover:border-pink-500 rounded-none"
                        >
                          {isSkipping ? 'Wird übersprungen...' : 'Jetzt überspringen'}
                        </Button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Button 
                      type="button"
                      onClick={handleStartOnboarding} 
                      className="bg-pink-500 hover:bg-pink-600 text-white font-light tracking-widest px-12 py-3 text-sm uppercase rounded-none"
                    >
                      Einrichtung starten
                    </Button>

                    <Button 
                      type="button"
                      onClick={handleSkipOnboarding}
                      variant="outline"
                      disabled={isSkipping}
                      className="font-light tracking-widest px-12 py-3 text-sm uppercase border-gray-300 hover:border-pink-500 rounded-none"
                    >
                      {isSkipping ? 'Wird übersprungen...' : 'Jetzt überspringen'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}