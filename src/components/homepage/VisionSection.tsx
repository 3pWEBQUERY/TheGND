import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { ChevronUp, ChevronDown } from 'lucide-react'

export default function VisionSection() {
  const [activeEscort, setActiveEscort] = useState(0)
  
  // Mock data für die neuesten 5 Escorts
  const latestEscorts = [
    { id: 1, name: 'SOPHIA', location: 'Vienna', image: '/1.jpg' },
    { id: 2, name: 'ELENA', location: 'Vienna', image: '/1.jpg' },
    { id: 3, name: 'ISABELLA', location: 'Vienna', image: '/1.jpg' },
    { id: 4, name: 'ANASTASIA', location: 'Vienna', image: '/1.jpg' },
    { id: 5, name: 'VICTORIA', location: 'Vienna', image: '/1.jpg' }
  ]
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-thin tracking-wider text-gray-800 mb-6">PREMIUM ESCORTS</h2>
            <div className="w-24 h-px bg-pink-500 mb-8"></div>
            <p className="text-lg font-light leading-relaxed text-gray-600 mb-8">
              We believe in creating exceptional experiences through our carefully curated selection 
              of premium companions. Discretion, quality and professionalism are our core values.
            </p>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white text-sm font-light tracking-widest px-8 py-3">
              ENTDECKE WEITER
            </Button>
          </div>
          <div className="aspect-[4/5] bg-gray-200 relative flex">
            {/* Vision Image */}
            <div className="flex-1 h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500 text-lg tracking-widest">VISION IMAGE</span>
            </div>
            
            {/* Vertical Escort Tabs */}
            <div className="w-32 bg-white border-l border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-xs font-light tracking-widest text-gray-800 text-center">LATEST</h3>
              </div>
              
              {/* Escort Tabs */}
              <div className="flex-1 flex flex-col">
                {latestEscorts.map((escort, index) => (
                  <button
                    key={escort.id}
                    onClick={() => setActiveEscort(index)}
                    className={`relative h-20 border-b border-gray-100 transition-all duration-300 group ${
                      activeEscort === index 
                        ? 'bg-pink-50 border-l-2 border-l-pink-500' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Mini Image */}
                    <div className="absolute left-2 top-2 w-6 h-6 bg-gray-300 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-gray-400"></div>
                    </div>
                    
                    {/* Content */}
                    <div className="pl-10 pr-2 py-2 text-left">
                      <div className={`text-xs font-light tracking-wider ${
                        activeEscort === index ? 'text-pink-600' : 'text-gray-800'
                      }`}>
                        {escort.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {escort.location}
                      </div>
                    </div>
                    
                    {/* Active Indicator */}
                    {activeEscort === index && (
                      <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
                        <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Navigation */}
              <div className="p-2 border-t border-gray-200 flex justify-center space-x-2">
                <button className="p-1 text-gray-400 hover:text-pink-500 transition-colors">
                  <ChevronUp className="h-3 w-3" />
                </button>
                <button className="p-1 text-gray-400 hover:text-pink-500 transition-colors">
                  <ChevronDown className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}