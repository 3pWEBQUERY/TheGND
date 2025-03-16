'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Hier würde die Newsletter-Anmeldung verarbeitet werden
    setSubscribed(true);
    setEmail('');
    setName('');
  };

  return (
    <footer className="bg-[hsl(240,10%,3.9%)] text-white">
      {/* Hauptbereich */}
      <div className="container mx-auto pt-12 pb-8 px-6">

        {/* Hauptbereich mit Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Spalte 1: Logo und Beschreibung */}
          <div>
            <img 
              src="/TheGND_Logo_light.png" 
              alt="TheGND Logo" 
              className="h-20 mb-4" 
            />
            <p className="text-gray-300 mb-4">
              Das modernste Erotik Portal seit 2025 - Entdecke eine neue Welt der Leidenschaft und Sinnlichkeit
            </p>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
              </a>
              <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm4.441 16.892c-2.102.144-6.784.144-8.883 0-2.276-.156-2.541-1.27-2.558-4.892.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0 2.277.156 2.541 1.27 2.559 4.892-.018 3.629-.285 4.736-2.559 4.892zm-6.441-7.234l4.917 2.338-4.917 2.346v-4.684z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Spalte 2: Entdecken */}
          <div className="pt-6">
            <h4 className="text-lg font-bold mb-4">Entdecken</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/girls" className="text-gray-300 hover:text-white hover:underline">Girls</Link>
              </li>
              <li>
                <Link href="/agentur" className="text-gray-300 hover:text-white hover:underline">Agentur</Link>
              </li>
              <li>
                <Link href="/club" className="text-gray-300 hover:text-white hover:underline">Club</Link>
              </li>
              <li>
                <Link href="/studio" className="text-gray-300 hover:text-white hover:underline">Studio</Link>
              </li>
              <li>
                <Link href="/feed" className="text-gray-300 hover:text-white hover:underline">Feed</Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-300 hover:text-white hover:underline">Events</Link>
              </li>
            </ul>
          </div>

          {/* Spalte 3: Informationen */}
          <div className="pt-6">
            <h4 className="text-lg font-bold mb-4">Informationen</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white hover:underline">Über uns</Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-300 hover:text-white hover:underline">FAQ</Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-300 hover:text-white hover:underline">Blog</Link>
              </li>
              <li>
                <Link href="/kontakt" className="text-gray-300 hover:text-white hover:underline">Kontakt</Link>
              </li>
              <li>
                <Link href="/karriere" className="text-gray-300 hover:text-white hover:underline">Karriere</Link>
              </li>
              <li>
                <Link href="/partner" className="text-gray-300 hover:text-white hover:underline">Partner werden</Link>
              </li>
            </ul>
          </div>

          {/* Spalte 4: Rechtliches */}
          <div className="pt-6">
            <h4 className="text-lg font-bold mb-4">Rechtliches</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/agb" className="text-gray-300 hover:text-white hover:underline">AGB</Link>
              </li>
              <li>
                <Link href="/datenschutz" className="text-gray-300 hover:text-white hover:underline">Datenschutz</Link>
              </li>
              <li>
                <Link href="/impressum" className="text-gray-300 hover:text-white hover:underline">Impressum</Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-300 hover:text-white hover:underline">Cookie-Einstellungen</Link>
              </li>
              <li>
                <Link href="/jugendschutz" className="text-gray-300 hover:text-white hover:underline">Jugendschutz</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Unterer Bereich mit Copyright */}
      <div className="border-t border-white/10 py-6 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} TheGND. Alle Rechte vorbehalten.
          </p>
          <div className="flex space-x-6">
            <Link href="/agb" className="text-gray-400 text-sm hover:text-white">AGB</Link>
            <Link href="/datenschutz" className="text-gray-400 text-sm hover:text-white">Datenschutz</Link>
            <Link href="/impressum" className="text-gray-400 text-sm hover:text-white">Impressum</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
