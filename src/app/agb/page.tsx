import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'

export default function AGBPage() {
  return (
    <>
      <MinimalistNavigation />
      {/* Hero */}
      <header className="relative h-[50vh] min-h-[400px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/1.jpg"
          alt="AGB Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-thin tracking-wider text-white mb-4">AGB</h1>
            <div className="w-24 h-px bg-pink-500 mx-auto" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="bg-white text-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 prose prose-neutral prose-p:leading-relaxed">
          <h2>1. Geltungsbereich</h2>
          <p>
            Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der Plattform THEGND
            und aller zugehörigen Dienste. Mit der Registrierung oder Nutzung der Plattform erklärst du dich mit diesen AGB einverstanden.
          </p>
          <h2>2. Leistungen</h2>
          <p>
            THEGND stellt eine Plattform zur Verfügung, auf der Nutzer Profile erstellen und Inhalte veröffentlichen können.
            Der Leistungsumfang kann sich ändern und wird laufend weiterentwickelt.
          </p>
          <h2>3. Pflichten der Nutzer</h2>
          <p>
            Nutzer sind verpflichtet, bei der Nutzung geltendes Recht einzuhalten, korrekte Angaben zu machen und keine Rechte Dritter zu verletzen.
          </p>
          <h2>4. Haftung</h2>
          <p>
            THEGND haftet nur für Vorsatz und grobe Fahrlässigkeit. Für fremde Inhalte übernehmen wir keine Verantwortung.
          </p>
          <h2>5. Schlussbestimmungen</h2>
          <p>
            Es gilt das Recht des Sitzstaates von THEGND. Änderungen der AGB können jederzeit erfolgen; die aktuelle Fassung wird auf der Website veröffentlicht.
          </p>
        </div>
      </main>

      <Footer />
    </>
  )
}
