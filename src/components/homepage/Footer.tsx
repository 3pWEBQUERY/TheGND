import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-neutral-950 bg-gradient-to-b from-black to-neutral-900 border-t border-neutral-800/60 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h3 className="text-3xl font-light tracking-[0.35em] text-neutral-100 mb-3">THEGND</h3>
          <div
            className="mx-auto h-[2px] w-16 rounded-full bg-gradient-to-r from-pink-600/0 via-pink-500/80 to-pink-600/0 mb-6"
            aria-hidden="true"
          />
          <p className="text-[13px] md:text-sm font-light text-neutral-300 leading-relaxed mb-8 max-w-md mx-auto">
            The premier destination for sophisticated companionship services.
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <Link
              href="#"
              className="text-xs md:text-sm font-light tracking-[0.25em] text-neutral-300 hover:text-pink-400 transition-colors underline-offset-4 hover:underline hover:decoration-pink-400"
            >
              AGB
            </Link>
            <Link
              href="#"
              className="text-xs md:text-sm font-light tracking-[0.25em] text-neutral-300 hover:text-pink-400 transition-colors underline-offset-4 hover:underline hover:decoration-pink-400"
            >
              DATENSCHUTZ
            </Link>
            <Link
              href="#"
              className="text-xs md:text-sm font-light tracking-[0.25em] text-neutral-300 hover:text-pink-400 transition-colors underline-offset-4 hover:underline hover:decoration-pink-400"
            >
              IMPRINT
            </Link>
          </div>
          <p className="text-[11px] md:text-xs font-light text-neutral-400 tracking-[0.25em]">
            © 2024 THEGND. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  )
}