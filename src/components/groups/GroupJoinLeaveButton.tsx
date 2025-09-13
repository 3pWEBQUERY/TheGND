'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GroupJoinLeaveButton({ slug, isMember }: { slug: string; isMember: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const onJoin = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${slug}/join`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Join fehlgeschlagen')
      router.refresh()
    } catch (e: any) {
      alert(e?.message || 'Fehler')
    } finally { setLoading(false) }
  }

  const onLeave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/groups/${slug}/leave`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Leave fehlgeschlagen')
      router.refresh()
    } catch (e: any) {
      alert(e?.message || 'Fehler')
    } finally { setLoading(false) }
  }

  return (
    <button
      onClick={isMember ? onLeave : onJoin}
      disabled={loading}
      className={`px-3 py-2 text-sm border ${isMember ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
    >
      {loading ? '...' : isMember ? 'Gruppe verlassen' : 'Gruppe beitreten'}
    </button>
  )
}
