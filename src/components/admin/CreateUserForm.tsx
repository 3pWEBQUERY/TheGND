"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateUserForm({ defaultType = 'MEMBER' }: { defaultType?: 'MEMBER' | 'ESCORT' | 'AGENCY' | 'CLUB' | 'STUDIO' }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState(defaultType)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/acp/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, userType }),
      })
      if (!res.ok) throw new Error(await res.text())
      setEmail('')
      setPassword('')
      setUserType('MEMBER')
      router.refresh()
    } catch (e) {
      alert((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
      <div className="text-sm font-medium text-gray-800">Neuen User erstellen</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
        />
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value as any)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-white"
        >
          <option value="MEMBER">MEMBER</option>
          <option value="ESCORT">ESCORT</option>
          <option value="AGENCY">AGENCY</option>
          <option value="CLUB">CLUB</option>
          <option value="STUDIO">STUDIO</option>
        </select>
      </div>
      <button type="submit" disabled={loading} className="px-4 py-2 rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-50">
        {loading ? 'Erstellen...' : 'Erstellen'}
      </button>
    </form>
  )
}
