import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin } = await requireAdmin()
  if (!isAdmin) {
    redirect('/')
  }

  const navItem = (href: string, label: string) => (
    <Link
      href={href}
      className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-pink-600 hover:bg-pink-50"
    >
      {label}
    </Link>
  )

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-thin tracking-wider text-gray-900 hover:text-pink-600">THEGND</Link>
            <nav className="hidden md:flex items-center space-x-1">
              {navItem('/acp', 'Übersicht')}
              {navItem('/acp/users', 'User')}
              {navItem('/acp/escorts', 'Escorts')}
              {navItem('/acp/feeds', 'Feeds')}
              {navItem('/acp/messages', 'Nachrichten')}
              {navItem('/acp/network', 'Netzwerk')}
            </nav>
          </div>
          <div className="text-xs text-gray-500">Admin</div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
