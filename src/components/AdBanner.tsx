"use client"

import { useEffect, useState } from 'react'

type Props = {
  placement?: string
  className?: string
}

export default function AdBanner({ placement = 'default', className }: Props) {
  const [adFree, setAdFree] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/perks/me/active?perk=AD_FREE_30D&days=30`, { cache: 'no-store' })
        if (!res.ok) { if (!cancelled) setAdFree(false); return }
        const data = await res.json()
        if (!cancelled) setAdFree(!!data?.active)
      } catch {
        if (!cancelled) setAdFree(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  if (adFree === null) {
    return null
  }
  if (adFree) {
    return null
  }

  // Placeholder ad block (replace with real ad provider integration later)
  return (
    <div className={className}>
      <div className="w-full border border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-600 tracking-widest">
        ANZEIGE • PLATZIERUNG: {placement}
      </div>
    </div>
  )
}
