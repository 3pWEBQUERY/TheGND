"use client"

type Props = {
  onEditProfile: () => void
  onDiscover: () => void
  onMessages: () => void
  isEscort: boolean
  onIssueReviewTicket: () => void
}

export default function DashboardQuickActions({ onEditProfile, onDiscover, onMessages, isEscort, onIssueReviewTicket }: Props) {
  return (
    <div className="bg-white border border-gray-100 rounded-none">
      <div className="p-8">
        <h3 className="text-lg font-thin tracking-wider text-gray-800 mb-6">SCHNELLAKTIONEN</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={onEditProfile}
            className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <div className="text-sm font-light tracking-widest text-gray-800 uppercase mb-2">PROFIL BEARBEITEN</div>
            <div className="text-xs font-light tracking-wide text-gray-600">Aktualisieren Sie Ihre Profilinformationen</div>
          </button>
          <button 
            onClick={onDiscover}
            className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <div className="text-sm font-light tracking-widest text-gray-800 uppercase mb-2">BENUTZER ENTDECKEN</div>
            <div className="text-xs font-light tracking-wide text-gray-600">Finden und vernetzen Sie sich mit anderen</div>
          </button>
          <button 
            onClick={onMessages}
            className="p-6 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
          >
            <div className="text-sm font-light tracking-widest text-gray-800 uppercase mb-2">NACHRICHTEN</div>
            <div className="text-xs font-light tracking-wide text-gray-600">Überprüfen Sie Ihre Unterhaltungen</div>
          </button>
          {isEscort && (
            <button
              onClick={onIssueReviewTicket}
              className="p-6 bg-pink-50 hover:bg-pink-100 border border-pink-200 hover:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1 transition-colors text-left md:col-span-3"
            >
              <div className="text-sm font-light tracking-widest text-pink-800 uppercase mb-2">VERIFIZIERUNGS-TICKET ERSTELLEN</div>
              <div className="text-xs font-light tracking-wide text-pink-700">Erstelle einen einmaligen Code, damit dein Gast eine verifizierte Bewertung abgeben kann</div>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
