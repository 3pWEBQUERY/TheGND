'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Plus, Eye, Clock, Image, X } from 'lucide-react'
import { getUserTypeDisplayName } from '@/lib/validations'

interface Story {
  id: string
  content: string
  image?: string
  video?: string
  createdAt: string
  expiresAt: string
  author: {
    id: string
    email: string
    userType: string
    profile?: {
      displayName?: string
      avatar?: string
    }
  }
  views: any[]
  _count: {
    views: number
  }
}

export default function StoriesComponent() {
  const { data: session } = useSession()
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [newStory, setNewStory] = useState({
    content: '',
    image: ''
  })
  const [creating, setCreating] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [filePreviews, setFilePreviews] = useState<Array<{ name: string; url: string; mediaType: 'image' | 'video'; size: number }>>([])
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [authorSequence, setAuthorSequence] = useState<Story[]>([])
  const [seqIndex, setSeqIndex] = useState(0)

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return
    const maxImageSize = 15 * 1024 * 1024
    const maxVideoSize = 200 * 1024 * 1024
    const allowedImage = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const allowedVideo = ['video/mp4', 'video/webm', 'video/quicktime']

    const arr = Array.from(files)
    const valid: File[] = []
    const previews: Array<{ name: string; url: string; mediaType: 'image' | 'video'; size: number }> = []
    let errorMsg: string | null = null

    for (const f of arr) {
      const isImage = f.type.startsWith('image/')
      const isVideo = f.type.startsWith('video/')
      if (!isImage && !isVideo) {
        errorMsg = 'Ungültiger Dateityp. Erlaubt sind Bilder (JPEG, PNG, WebP, GIF) und Videos (MP4, WebM, MOV).'
        continue
      }
      if (isImage && (!allowedImage.includes(f.type) || f.size > maxImageSize)) {
        errorMsg = 'Ein Bild ist ungültig oder zu groß (max. 15MB).'
        continue
      }
      if (isVideo && (!allowedVideo.includes(f.type) || f.size > maxVideoSize)) {
        errorMsg = 'Ein Video ist ungültig oder zu groß (max. 200MB).'
        continue
      }
      valid.push(f)
      previews.push({
        name: f.name,
        url: URL.createObjectURL(f),
        mediaType: isImage ? 'image' : 'video',
        size: f.size,
      })
    }

    setUploadError(errorMsg)
    setSelectedFiles(prev => [...prev, ...valid])
    setFilePreviews(prev => [...prev, ...previews])
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setFilePreviews(prev => prev.filter((_, i) => i !== index))
  }

  useEffect(() => {
    fetchStories()
  }, [])

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories')
      if (response.ok) {
        const data = await response.json()
        setStories(data)
      }
    } catch (error) {
      console.error('Fehler beim Laden der Stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const createStory = async () => {
    if (!newStory.content.trim() && selectedFiles.length === 0) return

    setCreating(true)
    try {
      let uploaded: Array<{ url: string; mediaType: 'image' | 'video' }> = []
      if (selectedFiles.length > 0) {
        const form = new FormData()
        form.append('type', 'story')
        for (const f of selectedFiles) {
          form.append('files', f)
        }
        const upRes = await fetch('/api/upload', { method: 'POST', body: form })
        if (!upRes.ok) throw new Error('Upload fehlgeschlagen')
        const upJson = await upRes.json()
        uploaded = (upJson.files || []).map((f: any) => ({ url: f.url as string, mediaType: f.mediaType as 'image' | 'video' }))
      }

      const created: Story[] = []
      if (uploaded.length > 0) {
        for (const item of uploaded) {
          const body: any = { content: newStory.content }
          if (item.mediaType === 'image') body.image = item.url
          if (item.mediaType === 'video') body.video = item.url
          const res = await fetch('/api/stories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          })
          if (res.ok) {
            const story = await res.json()
            created.push(story)
          }
        }
      } else {
        // Nur Text-Story
        const res = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newStory.content })
        })
        if (res.ok) {
          const story = await res.json()
          created.push(story)
        }
      }

      if (created.length > 0) {
        // Neu erstellte Stories oben einfügen
        setStories(prev => [...created, ...prev])
        setNewStory({ content: '', image: '' })
        setSelectedFiles([])
        setFilePreviews([])
        setCreateDialogOpen(false)
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Story:', error)
    } finally {
      setCreating(false)
    }
  }

  const viewStory = async (story: Story) => {
    setSelectedStory(story)
    // Sequenz gleicher Autoren innerhalb 24h um die ausgewählte Story bilden
    const dayMs = 24 * 60 * 60 * 1000
    const selTs = new Date(story.createdAt).getTime()
    const seq = stories
      .filter(s => s.author.id === story.author.id && Math.abs(new Date(s.createdAt).getTime() - selTs) <= dayMs)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    setAuthorSequence(seq)
    const idx = seq.findIndex(s => s.id === story.id)
    setSeqIndex(idx >= 0 ? idx : 0)
    setViewDialogOpen(true)

    // Register story view
    try {
      await fetch(`/api/stories/${story.id}/view`, {
        method: 'POST'
      })
      
      // Update local story view count if not already viewed
      if (!story.views.length) {
        setStories(prev => prev.map(s => 
          s.id === story.id 
            ? { ...s, _count: { views: s._count.views + 1 }, views: [{}] }
            : s
        ))
      }
    } catch (error) {
      console.error('Fehler beim Registrieren der Story-Ansicht:', error)
    }
  }

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()
    
    if (diff <= 0) return 'Abgelaufen'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const canCreateStories = session?.user?.userType !== 'MEMBER'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-sm font-light tracking-widest text-gray-600">STORIES WERDEN GELADEN...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 px-6">
      {/* Create Story Section */}
      {canCreateStories && (
        <div className="bg-white border border-gray-100 rounded-none">
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-thin tracking-wider text-gray-800 mb-2">STORIES</h2>
              <div className="w-12 h-px bg-pink-500 mx-auto mb-4"></div>
              <p className="text-sm font-light tracking-wide text-gray-600">
                Teile temporäre Updates, die nach 24 Stunden verschwinden
              </p>
            </div>
            
            <div className="flex justify-center">
              <button 
                className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-light tracking-widest px-6 py-3 transition-colors uppercase flex items-center space-x-2"
                onClick={() => setCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4" />
                <span>STORY ERSTELLEN</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stories.map((story) => (
          <div 
            key={story.id} 
            className="bg-white border border-gray-100 rounded-none cursor-pointer hover:border-pink-200 transition-colors"
            onClick={() => viewStory(story)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={story.author.profile?.avatar || ''} />
                    <AvatarFallback className="text-xs font-light tracking-widest bg-gray-100">
                      {story.author.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-light tracking-wide text-gray-800">
                      {story.author.profile?.displayName || story.author.email}
                    </div>
                    <div className="text-xs font-light tracking-widest text-gray-500 uppercase mt-1">
                      {getUserTypeDisplayName(story.author.userType as any)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-xs font-light tracking-wide text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeRemaining(story.expiresAt)}</span>
                </div>
              </div>
              
              {(story.image || story.video) && (
                <div className="mb-4">
                  {story.image ? (
                    <img
                      src={story.image}
                      alt="Story"
                      className="w-full h-64 md:h-64 object-cover rounded-none"
                    />
                  ) : (
                    <video
                      src={story.video!}
                      className="w-full h-64 md:h-64 object-cover rounded-none"
                      controls
                    />
                  )}
                </div>
              )}
              
              <p className="text-sm font-light tracking-wide text-gray-700 leading-relaxed line-clamp-3 mb-4">
                {story.content}
              </p>
              
              <div className="flex items-center justify-between text-xs font-light tracking-wide text-gray-400 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Eye className="h-3 w-3" />
                  <span>{story._count.views} AUFRUFE</span>
                </div>
                <span>{new Date(story.createdAt).toLocaleDateString('de-DE')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {stories.length === 0 && (
        <div className="bg-white border border-gray-100 rounded-none">
          <div className="p-12 text-center">
            <div className="text-gray-400">
              <Image className="h-16 w-16 mx-auto mb-6 opacity-30" />
              <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-4">KEINE STORIES VERFÜGBAR</h3>
              <div className="w-12 h-px bg-pink-500 mx-auto mb-4"></div>
              <p className="text-sm font-light tracking-wide text-gray-500">
                {canCreateStories 
                  ? 'Erstelle deine erste Story oder folge anderen Nutzern'
                  : 'Folge anderen Nutzern, um ihre Stories zu sehen'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Create Story Dialog */}
      {createDialogOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white max-w-lg w-full rounded-none">
            <div className="p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-thin tracking-wider text-gray-800 mb-2">NEUE STORY ERSTELLEN</h3>
                <div className="w-12 h-px bg-pink-500 mx-auto mb-4"></div>
                <p className="text-sm font-light tracking-wide text-gray-600">
                  Deine Story ist 24 Stunden sichtbar
                </p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="text-xs font-light tracking-widest text-gray-800 uppercase mb-3">INHALT</div>
                  <Textarea
                    placeholder="Was möchtest du teilen?"
                    value={newStory.content}
                    onChange={(e) => setNewStory(prev => ({ ...prev, content: e.target.value }))}
                    maxLength={500}
                    className="min-h-24 resize-none border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 focus:ring-0 bg-transparent"
                  />
                  <div className="text-xs font-light tracking-wide text-gray-400 mt-2">
                    {newStory.content.length}/500 Zeichen
                  </div>
                </div>
                
                <div>
                  <div className="text-xs font-light tracking-widest text-gray-800 uppercase mb-3">MEDIEN HOCHLADEN (BILDER/VIDEOS)</div>
                  <Input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime"
                    onChange={(e) => handleFilesSelected(e.target.files)}
                    className="border-0 border-b-2 border-gray-200 rounded-none px-0 py-3 text-sm font-light focus:border-pink-500 focus:ring-0 bg-transparent"
                  />
                  <div className="text-xs font-light tracking-wide text-gray-400 mt-2">
                    Bilder bis 15MB, Videos bis 200MB. Mehrfachauswahl möglich.
                  </div>
                  {uploadError && (
                    <div className="text-xs font-light tracking-wide text-pink-600 mt-2">{uploadError}</div>
                  )}
                  {filePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {filePreviews.map((p, idx) => (
                        <div key={idx} className="relative border border-gray-200 p-1">
                          {p.mediaType === 'image' ? (
                            <img src={p.url} alt={p.name} className="w-full h-20 object-cover" />
                          ) : (
                            <video src={p.url} className="w-full h-20 object-cover" />
                          )}
                          <button
                            type="button"
                            className="absolute top-1 right-1 bg-white/80 text-gray-600 hover:text-gray-800"
                            onClick={() => removeSelectedFile(idx)}
                            aria-label="Datei entfernen"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-4 pt-4">
                  <button 
                    className="text-xs font-light tracking-widest text-gray-600 hover:text-gray-800 transition-colors uppercase"
                    onClick={() => {
                      setCreateDialogOpen(false)
                      setNewStory({ content: '', image: '' })
                    }}
                  >
                    ABBRECHEN
                  </button>
                  <button 
                    className="bg-pink-500 hover:bg-pink-600 text-white text-xs font-light tracking-widest px-6 py-3 transition-colors disabled:opacity-50 uppercase"
                    onClick={createStory}
                    disabled={creating || (!newStory.content.trim() && selectedFiles.length === 0)}
                  >
                    {creating ? 'WIRD ERSTELLT...' : 'STORY ERSTELLEN'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story View Dialog */}
      {viewDialogOpen && selectedStory && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-3xl h-[85vh] overflow-hidden rounded-none">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedStory.author.profile?.avatar || ''} />
                    <AvatarFallback className="text-sm font-light tracking-widest bg-gray-100">
                      {selectedStory.author.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-sm font-light tracking-wide text-gray-800">
                      {selectedStory.author.profile?.displayName || selectedStory.author.email}
                    </div>
                    <div className="flex items-center space-x-3 mt-1">
                      <div className="text-xs font-light tracking-widest text-gray-500 uppercase">
                        {getUserTypeDisplayName(selectedStory.author.userType as any)}
                      </div>
                      <span className="text-xs font-light tracking-wide text-gray-400">
                        {formatTimeRemaining(selectedStory.expiresAt)} verbleibend
                      </span>
                    </div>
                  </div>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setViewDialogOpen(false)}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                {authorSequence.length > 0 ? (
                  <>
                    {(authorSequence[seqIndex].image || authorSequence[seqIndex].video) && (
                      authorSequence[seqIndex].image ? (
                        <img
                          src={authorSequence[seqIndex].image!}
                          alt="Story"
                          className="w-full h-[60vh] md:h-[65vh] object-cover rounded-none"
                        />
                      ) : (
                        <video
                          src={authorSequence[seqIndex].video!}
                          className="w-full h-[60vh] md:h-[65vh] object-cover rounded-none"
                          controls
                          autoPlay
                        />
                      )
                    )}
                    <p className="text-sm font-light tracking-wide text-gray-700 leading-relaxed">
                      {authorSequence[seqIndex].content}
                    </p>
                    <div className="flex items-center justify-between text-xs font-light tracking-wide text-gray-400 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>{authorSequence[seqIndex]._count.views} AUFRUFE</span>
                      </div>
                      <span>{new Date(authorSequence[seqIndex].createdAt).toLocaleDateString('de-DE')}</span>
                    </div>
                    {authorSequence.length > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <button
                          className="text-xs font-light tracking-widest text-gray-600 hover:text-gray-800 uppercase disabled:opacity-50"
                          onClick={() => setSeqIndex(i => Math.max(0, i - 1))}
                          disabled={seqIndex === 0}
                        >
                          ZURÜCK
                        </button>
                        <div className="text-xs font-light tracking-wide text-gray-500">
                          {seqIndex + 1}/{authorSequence.length}
                        </div>
                        <button
                          className="text-xs font-light tracking-widest text-gray-600 hover:text-gray-800 uppercase disabled:opacity-50"
                          onClick={() => setSeqIndex(i => Math.min(authorSequence.length - 1, i + 1))}
                          disabled={seqIndex === authorSequence.length - 1}
                        >
                          WEITER
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {selectedStory.image ? (
                      <img
                        src={selectedStory.image}
                        alt="Story"
                        className="w-full h-[60vh] md:h-[65vh] object-cover rounded-none"
                      />
                    ) : selectedStory.video ? (
                      <video
                        src={selectedStory.video}
                        className="w-full h-[60vh] md:h-[65vh] object-cover rounded-none"
                        controls
                        autoPlay
                      />
                    ) : null}
                    <p className="text-sm font-light tracking-wide text-gray-700 leading-relaxed">
                      {selectedStory.content}
                    </p>
                    <div className="flex items-center justify-between text-xs font-light tracking-wide text-gray-400 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>{selectedStory._count.views} AUFRUFE</span>
                      </div>
                      <span>{new Date(selectedStory.createdAt).toLocaleDateString('de-DE')}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}