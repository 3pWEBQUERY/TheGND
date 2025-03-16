'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Hero() {
  const [randomImageNumber, setRandomImageNumber] = useState<number>(1);

  useEffect(() => {
    // Zufällige Zahl zwischen 1 und 7 generieren (für die 7 Bilder im Ordner)
    const randomNum = Math.floor(Math.random() * 7) + 1;
    setRandomImageNumber(randomNum);
    console.log("Zufällige Bildnummer:", randomNum);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-transparent">
      {/* Zufälliges Hintergrundbild */}
      <img 
        src={`/hero/hero-bg-${randomImageNumber}.jpg`}
        alt="Hero Hintergrund"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ zIndex: -1 }}
      />
      
      <div className="w-full relative z-10 flex items-start justify-start">
        <div className="flex flex-col items-start justify-start text-left max-w-4xl ml-4 md:ml-8 lg:ml-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white">
            Das modernste <span className="text-[hsl(345.3,82.7%,40.8%)]">Erotik Portal</span><br />
            seit 2025
          </h1>
          
          <p className="text-lg text-gray-200 mb-10">
            Entdecke eine neue Welt der Leidenschaft und Sinnlichkeit.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/girls" className="px-6 py-3 bg-[hsl(345.3,82.7%,40.8%)] text-white font-medium rounded-md hover:opacity-90 transition-opacity duration-200 flex items-center justify-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 8L16 12L10 16V8Z" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Girls entdecken
            </Link>
            <Link href="/registrieren" className="px-6 py-3 bg-transparent border-2 border-white text-white font-medium rounded-md hover:bg-white hover:text-black transition-colors duration-200">
              Jetzt registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
