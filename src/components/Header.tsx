'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session, status } = useSession();
  const currentPath = usePathname();
  const isAuthenticated = status === 'authenticated';
  return (
    <header className="px-6 absolute top-0 left-0 right-0 h-14 backdrop-blur-sm z-50">
      <div className="absolute left-6 top-0 h-14 flex items-center">
        <Link href="/" className="flex items-center">
          <div>
            <img src="/TheGND_Logo_light.png" alt="TheGND Logo" width="150" height="auto" className="h-12 w-auto" />
          </div>
        </Link>
      </div>
      
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-14">
        <nav className="hidden md:flex items-center h-full">
          <div className="h-14 flex items-center">
            <Link href="/" className={`px-4 h-full flex items-center text-white font-medium hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200 ${currentPath === '/' ? 'bg-[hsl(345.3,82.7%,40.8%)]' : ''}`}>Home</Link>
          </div>
          <div className="h-14 flex items-center">
            <Link href="/girls" className={`px-4 h-full flex items-center text-white font-medium hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200 ${currentPath === '/girls' ? 'bg-[hsl(345.3,82.7%,40.8%)]' : ''}`}>Girls</Link>
          </div>
          <div className="h-14 flex items-center">
            <Link href="/agentur" className={`px-4 h-full flex items-center text-white font-medium hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200 ${currentPath === '/agentur' ? 'bg-[hsl(345.3,82.7%,40.8%)]' : ''}`}>Agentur</Link>
          </div>
          <div className="h-14 flex items-center">
            <Link href="/club" className={`px-4 h-full flex items-center text-white font-medium hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200 ${currentPath === '/club' ? 'bg-[hsl(345.3,82.7%,40.8%)]' : ''}`}>Club</Link>
          </div>
          <div className="h-14 flex items-center">
            <Link href="/studio" className={`px-4 h-full flex items-center text-white font-medium hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200 ${currentPath === '/studio' ? 'bg-[hsl(345.3,82.7%,40.8%)]' : ''}`}>Studio</Link>
          </div>
          <div className="h-14 flex items-center">
            <Link href="/feed" className={`px-4 h-full flex items-center text-white font-medium hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200 ${currentPath === '/feed' ? 'bg-[hsl(345.3,82.7%,40.8%)]' : ''}`}>Feed</Link>
          </div>
        </nav>
      </div>
      
      <div className="absolute right-6 top-0 h-14 flex items-center">
        {isAuthenticated ? (
          <div className="flex items-center space-x-2">
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-1 rounded-md hover:bg-white/10">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[hsl(345.3,82.7%,40.8%)]">
                    {session?.user?.image ? (
                      <img 
                        src={session.user.image} 
                        alt="Profilbild" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {session?.user?.username?.charAt(0).toUpperCase() || session?.user?.name?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="ml-2 text-white">{session?.user?.username || session?.user?.name || 'Benutzer'}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className="absolute right-0 mt-1 w-48 bg-[hsl(240,10%,3.9%)] border border-white/10 rounded-md shadow-lg overflow-hidden z-50 hidden group-hover:block">
                <div className="py-1">
                <Link href="/dashboard" className="block px-4 py-2 text-sm text-white hover:bg-[hsl(345.3,82.7%,40.8%)]">
                    Dashboard
                  </Link>
                  <Link href="/profile" className="block px-4 py-2 text-sm text-white hover:bg-[hsl(345.3,82.7%,40.8%)]">
                    Profil
                  </Link>
                  <Link href="/settings" className="block px-4 py-2 text-sm text-white hover:bg-[hsl(345.3,82.7%,40.8%)]">
                    Einstellungen
                  </Link>
                  <button 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[hsl(345.3,82.7%,40.8%)]"
                  >
                    Abmelden
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="h-14 flex items-center">
              <Link href="/auth/login" className="px-4 h-full flex items-center bg-[hsl(346.8,77.2%,49.8%)] text-white hover:bg-[hsl(345.3,82.7%,40.8%)] transition-colors duration-200">Anmelden</Link>
            </div>
            <div className="h-14 flex items-center">
              <Link href="/auth/register" className="px-4 h-full flex items-center bg-[hsl(345.3,82.7%,40.8%)] text-white hover:opacity-90 transition-colors duration-200">Registrieren</Link>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
