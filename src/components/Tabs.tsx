'use client'

import * as React from 'react'

type Tab = {
  id: string
  label: string
  content: React.ReactNode
}

type Props = {
  tabs: Tab[]
  initialId?: string
  className?: string
}

export default function Tabs({ tabs, initialId, className }: Props) {
  const [active, setActive] = React.useState<string>(initialId || tabs[0]?.id)

  return (
    <div className={className}>
      <div className="border-b border-gray-200 overflow-x-auto overflow-y-hidden no-scrollbar touch-pan-x overscroll-x-contain overscroll-y-none">
        <div className="flex gap-6 min-w-max whitespace-nowrap">
          {tabs.map((t) => {
            const isActive = t.id === active
            return (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={`shrink-0 px-1 pb-3 text-xs tracking-widest ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'} relative`}
              >
                <span>{t.label.toUpperCase()}</span>
                <span className={`absolute left-0 -bottom-px h-0.5 ${isActive ? 'w-full bg-pink-500' : 'w-0 bg-transparent'} transition-all`} />
              </button>
            )
          })}
        </div>
      </div>
      <div className="pt-6">
        {tabs.map((t) => (
          <div key={t.id} style={{ display: t.id === active ? 'block' : 'none' }}>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  )
}
