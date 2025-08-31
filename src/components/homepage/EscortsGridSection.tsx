import { Button } from '@/components/ui/button'
import { Heart, Star } from 'lucide-react'
import Link from 'next/link'

export default function EscortsGridSection() {
  return (
    <section id="escorts" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-thin tracking-wider text-gray-800 mb-4">ESCORTS</h2>
          <div className="w-24 h-px bg-pink-500 mx-auto"></div>
        </div>
        
        {/* Escort Grid - exactly like the reference */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="group cursor-pointer">
              <div className="aspect-[3/4] bg-gray-200 relative overflow-hidden mb-3">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center space-x-2 text-white">
                    <Heart className="h-4 w-4" />
                    <Star className="h-4 w-4" />
                  </div>
                </div>
                <div className="h-full w-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">PHOTO</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-light tracking-widest text-gray-800">MODEL {index + 1}</h3>
                <p className="text-xs text-gray-500 mt-1">Vienna</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button asChild variant="outline" className="text-sm font-light tracking-widest px-8 py-3 border-gray-300 hover:border-pink-500">
            <Link href="/escorts">ALLE ESCORTS ANSEHEN</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}