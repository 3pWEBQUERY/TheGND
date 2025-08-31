 'use client'

 import { useEffect, useState } from 'react'

 type StoryItem = {
  id: string
  content: string
  image?: string | null
  createdAt: string
  author: { displayName: string | null; email: string }
 }

 function timeAgoISO(iso: string): string {
  const from = new Date(iso)
  const diff = Date.now() - from.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'gerade eben'
  if (minutes < 60) return `${minutes}m vorher`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} Stunden vorher`
  const days = Math.floor(hours / 24)
  return `vor ${days} Tagen`
 }

 export default function StoriesGallery() {
  const [stories, setStories] = useState<StoryItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    fetch('/api/stories/latest')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: { stories: StoryItem[] }) => {
        if (active) setStories(data.stories)
      })
      .catch((e) => {
        if (active) setError(e.message)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-thin tracking-wider text-gray-800 mb-4">NEUE STORIES</h2>
          <div className="w-24 h-px bg-pink-500 mx-auto"></div>
        </div>
        {error && (
          <div className="text-sm text-red-600">Fehler beim Laden der Stories: {error}</div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {(stories ?? Array.from({ length: 7 })).map((story, idx) => {
            if (!stories) {
              return (
                <div key={idx} className="aspect-[3/4] bg-gray-200 animate-pulse rounded" />
              )
            }

            const authorName = (
              story.author.displayName ?? story.author.email.split('@')[0]
            ).toUpperCase()
            const label = timeAgoISO(story.createdAt)

            return (
              <div
                key={story.id}
                className="aspect-[3/4] bg-gray-200 group cursor-pointer overflow-hidden relative"
                title={`${authorName} - ${story.content} (${label})`}
              >
                {story.image ? (
                  <img
                    src={story.image}
                    alt={story.content}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full bg-gray-300 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <span className="text-gray-500 text-xs">IMG</span>
                  </div>
                )}

                {/* Story Info Overlay (nur bei Hover sichtbar) */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                  <div className="text-white text-xs font-light tracking-wider">
                    {authorName}
                  </div>
                  <div className="text-gray-300 text-xs mt-1">{label}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
 }
