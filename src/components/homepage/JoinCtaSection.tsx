'use client'

import Link from 'next/link'

export default function JoinCtaSection() {
  return (
    <section className="bg-pink-600">
      <div className="max-w-7xl mx-auto px-6 pt-10 md:pt-12 pb-10 md:pb-12 text-white">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-thin tracking-wider mb-2">Jetzt mitmachen!</h2>
          <p className="text-sm md:text-base font-light tracking-wide text-white/90">
            Sie haben noch kein Benutzerkonto auf unserer Seite? Registrieren Sie sich kostenlos und nehmen Sie an unserer Community teil!
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <Link
              href="/auth/signin"
              className="inline-flex items-center justify-center bg-white/10 hover:bg-white/20 text-white border border-white/40 text-xs md:text-sm font-light tracking-widest px-6 py-3 uppercase rounded-none"
            >
              Anmelden
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center bg-white hover:bg-white/90 text-pink-600 text-xs md:text-sm font-light tracking-widest px-6 py-3 uppercase rounded-none"
            >
              Benutzerkonto erstellen
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
