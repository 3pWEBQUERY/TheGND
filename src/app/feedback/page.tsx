import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function FeedbackPage({ searchParams }: { searchParams?: Promise<{ success?: string }> }) {
  const sp = (await searchParams) || {}
  const session = (await getServerSession(authOptions as any)) as any
  const success = sp.success === '1'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <MinimalistNavigation />

      {/* Hero Section (like /blog) */}
      <section className="relative overflow-hidden mb-12 md:mb-16">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/blog.jpg" alt="Hero Background" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-white/0 via-white/0 to-white/0 md:to-white/0" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-40 pb-24 md:pt-48 md:pb-40">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-light tracking-[0.25em] text-white">FEEDBACK</h1>
            <div className="mt-4 h-[2px] w-24 bg-gradient-to-r from-pink-600/0 via-pink-500/80 to-pink-600/0" />
            <p className="mt-6 text-neutral-200 text-base md:text-lg leading-relaxed">
              Wir freuen uns über dein Feedback. Teile uns mit, was wir verbessern können.
            </p>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-6 pb-16">
          {success && (
            <div className="mb-6 border border-green-200 bg-green-50 text-green-800 px-4 py-3 text-sm tracking-widest">
              Vielen Dank! Dein Feedback wurde übermittelt.
            </div>
          )}
          <form className="max-w-3xl space-y-5" action="/api/feedback" method="post">
            {!session?.user?.email && (
              <div>
                <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-1">E-Mail (optional)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="dein@email.de"
                  className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            )}
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-gray-600 mb-1">Nachricht</label>
              <textarea
                name="message"
                required
                rows={6}
                placeholder="Dein Feedback…"
                className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <button type="submit" className="px-5 py-2 border border-gray-300 text-sm uppercase tracking-widest hover:bg-pink-50/40">
                Absenden
              </button>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  )
}
