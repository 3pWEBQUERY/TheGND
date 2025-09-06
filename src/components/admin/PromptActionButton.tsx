"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function PromptActionButton({
  label,
  endpoint,
  method = 'PATCH',
  promptLabel,
  field = 'content',
}: {
  label: string
  endpoint: string
  method?: 'POST' | 'PATCH'
  promptLabel: string
  field?: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onClick() {
    const value = window.prompt(promptLabel)
    if (value == null) return
    setLoading(true)
    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      })
      if (!res.ok) throw new Error(await res.text())
      router.refresh()
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button onClick={onClick} disabled={loading} className="px-3 py-1.5 rounded text-sm border border-gray-300 text-gray-700 hover:bg-gray-50">
      {loading ? '...' : label}
    </button>
  )
}
