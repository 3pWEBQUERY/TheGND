import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-neutral-50 bg-gradient-to-b from-white to-neutral-50 border-t border-neutral-200/80 py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center">
          <h3 className="text-3xl font-light tracking-[0.35em] text-neutral-800 mb-3">THEGND</h3>
          <p className="text-[13px] md:text-sm font-light text-neutral-600 leading-relaxed mb-8 max-w-md mx-auto">
            The premier destination for sophisticated companionship services.
          </p>
          <div className="flex justify-center gap-6 mb-8">
            <Link
              href="#"
              className="text-xs md:text-sm font-light tracking-[0.25em] text-neutral-600 hover:text-pink-500 transition-colors underline-offset-4 hover:underline"
            >
              PRIVACY
            </Link>
            <Link
              href="#"
              className="text-xs md:text-sm font-light tracking-[0.25em] text-neutral-600 hover:text-pink-500 transition-colors underline-offset-4 hover:underline"
            >
              TERMS
            </Link>
            <Link
              href="#"
              className="text-xs md:text-sm font-light tracking-[0.25em] text-neutral-600 hover:text-pink-500 transition-colors underline-offset-4 hover:underline"
            >
              CONTACT
            </Link>
          </div>
          <p className="text-[11px] md:text-xs font-light text-neutral-500 tracking-[0.25em]">
            © 2024 PRIVATE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  )
}