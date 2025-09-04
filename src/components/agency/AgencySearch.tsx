import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { MapPin, Search } from 'lucide-react'

type Props = {
  q: string
  setQ: (v: string) => void
  location: string
  setLocation: (v: string) => void
  onSubmit: () => void
  loading?: boolean
  error?: string | null
}

export default function AgencySearch({ q, setQ, location, setLocation, onSubmit, loading, error }: Props) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-white border border-gray-200 p-4 md:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit()
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              <div className="md:col-span-3">
                <label className="block text-xs tracking-widest text-gray-600 mb-2">SUCHBEGRIFF</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Name, Beschreibung…"
                    className="pl-9 rounded-none border-gray-300 focus-visible:ring-pink-500/30"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs tracking-widest text-gray-600 mb-2">ORT</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Stadt, Land…"
                    className="pl-9 rounded-none border-gray-300 focus-visible:ring-pink-500/30"
                  />
                </div>
              </div>
              <div className="md:col-span-1">
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full text-sm font-light tracking-widest border-gray-300 hover:border-pink-500 rounded-none"
                  disabled={loading}
                >
                  {loading ? 'LADEN…' : 'SUCHEN'}
                </Button>
              </div>
            </div>
            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="text-sm font-light tracking-widest border-gray-300 hover:border-pink-500 rounded-none"
                onClick={() => {
                  setQ('')
                  setLocation('')
                }}
              >
                ZURÜCKSETZEN
              </Button>
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
