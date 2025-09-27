'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Upload, X } from 'lucide-react'
import Image from 'next/image'

export default function MemberMediaPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setPreviewUrl(null)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (selectedImage) {
        // Here you would typically upload the image to your storage service
        // For now, we'll just simulate the upload
        const formData = new FormData()
        formData.append('profileImage', selectedImage)

        const response = await fetch('/api/profile/upload-image', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const result = await response.json()
          setError(result.error || 'Hochladen des Bildes fehlgeschlagen')
          return
        }
      }

      // Redirect back to onboarding page
      router.push('/onboarding')
    } catch (error) {
      setError('Beim Hochladen ist ein Fehler aufgetreten')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Minimalist Navigation */}
      <nav className="absolute top-0 w-full z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <Link href="/onboarding" className="flex items-center text-sm font-light tracking-widest text-gray-600 hover:text-pink-500 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              ZURÜCK ZUM ONBOARDING
            </Link>
            <div className="text-sm font-light tracking-widest text-gray-600">
              PROFIL-MEDIEN
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="w-full max-w-xl">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-thin tracking-wider text-gray-800 mb-6">PROFIL-MEDIEN</h1>
            <div className="w-24 h-px bg-pink-500 mx-auto mb-8"></div>
            <p className="text-lg font-light tracking-wide text-gray-600 max-w-md mx-auto">
              Füge ein Profilbild hinzu, um dein Profil persönlicher zu machen
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-12">
            {error && (
              <div className="p-4 text-sm font-light text-red-600 bg-red-50 border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <Label className="text-xs font-light tracking-widest text-gray-800 uppercase text-center block">
                Profilbild (optional)
              </Label>
              
              {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-pink-500 transition-colors">
                  <div className="flex flex-col items-center space-y-4">
                    <Upload className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-light text-gray-600 mb-2">
                        Klicke zum Hochladen oder ziehe eine Datei hierher
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG oder JPEG (max. 5 MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-gray-200">
                    <Image
                      src={previewUrl}
                      alt="Profilvorschau"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-2 bg-red-500 text-white rounded-none p-2 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="text-center mt-4">
                    <p className="text-sm font-light text-gray-600">
                      {selectedImage?.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 pt-8">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-light tracking-widest py-4 text-sm uppercase rounded-none"
              >
                {isLoading ? 'Wird hochgeladen...' : 'Profilbild speichern'}
              </Button>
              
              <Button 
                type="button"
                variant="outline"
                onClick={handleSkip}
                className="flex-1 border-gray-300 text-gray-600 font-light tracking-widest py-4 text-sm uppercase hover:border-pink-500 hover:text-pink-500 rounded-none"
              >
                Jetzt überspringen
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}