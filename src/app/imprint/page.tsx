import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'

export default function ImprintPage() {
  return (
    <>
      <MinimalistNavigation />
      {/* Hero */}
      <header className="relative h-[50vh] min-h-[400px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/agentur.jpg"
          alt="Imprint Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-thin tracking-wider text-white mb-4">IMPRINT</h1>
            <div className="w-24 h-px bg-pink-500 mx-auto" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="bg-white text-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 prose prose-neutral prose-p:leading-relaxed">
          <h2>Anbieter</h2>
          <p>THEGND – Angaben zum Diensteanbieter. Detaillierte Kontaktinformationen werden hier bereitgestellt.</p>

          <h2>Kontakt</h2>
          <p>E‑Mail und ggf. weitere Kontaktwege. Bitte nutze die in der App angegebenen Kontaktmöglichkeiten.</p>

          <h2>Haftungsausschluss</h2>
          <p>Wir übernehmen keine Haftung für externe Inhalte. Für den Inhalt verlinkter Seiten sind ausschließlich deren Betreiber verantwortlich.</p>

          <h2>Urheberrecht</h2>
          <p>Die auf THEGND veröffentlichten Inhalte unterliegen dem Urheberrecht. Eine Vervielfältigung ist ohne Zustimmung nicht gestattet.</p>
        </div>
      </main>

      <Footer />
    </>
  )
}
