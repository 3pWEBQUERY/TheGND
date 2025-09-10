import MinimalistNavigation from '@/components/homepage/MinimalistNavigation'
import Footer from '@/components/homepage/Footer'

export default function DatenschutzPage() {
  return (
    <>
      <MinimalistNavigation />
      {/* Hero */}
      <header className="relative h-[50vh] min-h-[400px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/2.jpg"
          alt="Datenschutz Hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
          <div>
            <h1 className="text-5xl md:text-6xl font-thin tracking-wider text-white mb-4">DATENSCHUTZ</h1>
            <div className="w-24 h-px bg-pink-500 mx-auto" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="bg-white text-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-16 prose prose-neutral prose-p:leading-relaxed">
          <h2>1. Verantwortlicher</h2>
          <p>Verantwortlich für die Datenverarbeitung ist THEGND. Kontaktdaten findest du im Impressum.</p>

          <h2>2. Erhobene Daten</h2>
          <p>Wir verarbeiten Nutzungs‑, Profildaten und von dir bereitgestellte Inhalte zur Bereitstellung unserer Dienste.</p>

          <h2>3. Zwecke und Rechtsgrundlagen</h2>
          <p>Die Verarbeitung erfolgt zur Vertragserfüllung, auf Basis berechtigter Interessen sowie ggf. deiner Einwilligung.</p>

          <h2>4. Cookies und Tracking</h2>
          <p>Wir verwenden essenzielle Cookies sowie – mit deiner Einwilligung – optionale Analysetools zur Verbesserung der Plattform.</p>

          <h2>5. Speicherdauer</h2>
          <p>Daten werden nur so lange gespeichert, wie es für die Zwecke ihrer Verarbeitung erforderlich ist oder gesetzliche Pflichten bestehen.</p>

          <h2>6. Deine Rechte</h2>
          <p>Du hast das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch.</p>

          <h2>7. Kontakt</h2>
          <p>Bei Fragen zum Datenschutz kontaktiere uns bitte über die in der App angegebenen Wege.</p>
        </div>
      </main>

      <Footer />
    </>
  )
}
