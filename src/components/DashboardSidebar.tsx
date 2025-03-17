'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Session } from 'next-auth';

interface DashboardSidebarProps {
  session: Session | null;
  favoriteTags: string[];
}

export default function DashboardSidebar({ session, favoriteTags }: DashboardSidebarProps) {
  const pathname = usePathname();
  
  // Funktion zum Bestimmen des Navigationsstils basierend auf dem aktuellen Pfad
  const getNavLinkClass = (path: string) => {
    const isActive = pathname === path;
    return isActive
      ? "flex items-center py-2 px-3 accent-bg text-white rounded-md"
      : "flex items-center py-2 px-3 text-foreground hover:bg-[hsl(345.3,82.7%,40.8%)] hover:text-white rounded-md transition-colors duration-200";
  };
  return (
    <div className="lg:w-1/4">
      {/* Profilkarte */}
      <div className="bg-card rounded-lg p-6 border border-border mb-6 shadow-sm">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent-color mb-4">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt="Profilbild" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-foreground text-2xl font-bold">
                  {session?.user?.username?.charAt(0).toUpperCase() || session?.user?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-bold mb-1">{session?.user?.username || session?.user?.name || 'Benutzer'}</h2>
          <p className="text-muted-foreground text-sm mb-4">Berlin, Deutschland</p>
          
          <div className="flex justify-between w-full mb-4">
            <div className="text-center">
              <div className="font-bold">764</div>
              <div className="text-xs text-muted-foreground">POSTS</div>
            </div>
            <div className="text-center">
              <div className="font-bold">21.4k</div>
              <div className="text-xs text-muted-foreground">FOLLOWERS</div>
            </div>
            <div className="text-center">
              <div className="font-bold">150</div>
              <div className="text-xs text-muted-foreground">FOLLOWING</div>
            </div>
          </div>
          
          <button className="w-full accent-bg hover:opacity-90 text-white py-2 rounded-md transition-colors duration-200">
            Profil bearbeiten
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <div className="bg-card rounded-lg p-6 border border-border mb-6 shadow-sm">
        <h3 className="font-medium mb-3">Dashboard Navigation</h3>
        <nav className="space-y-2">
          <Link href="/dashboard" className={getNavLinkClass('/dashboard')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </Link>
          <Link href="/explore" className={getNavLinkClass('/explore')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Mein Profil
          </Link>
          <Link href="/people" className={getNavLinkClass('/people')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Newsfeed
          </Link>
          <Link href="/trending" className={getNavLinkClass('/trending')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Statistiken
          </Link>
          <Link href="/notifications" className={getNavLinkClass('/notifications')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            Benachrichtigungen
            <span className="ml-auto accent-bg text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
          </Link>
          <Link href="/dashboard/messages" className={getNavLinkClass('/messages')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Nachrichten
          </Link>
          <Link href="/saved" className={getNavLinkClass('/saved')}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Favoriten
          </Link>
        </nav>
      </div>
      
      {/* Tags */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h3 className="font-medium mb-3">Meine Tags</h3>
        <div className="flex flex-wrap gap-2">
          {favoriteTags.map((tag, index) => (
            <span key={index} className="px-3 py-1 bg-muted text-sm rounded-full hover:accent-bg hover:text-white cursor-pointer transition-colors duration-200">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Skeleton-Komponente für Ladezeiten
export function DashboardSidebarSkeleton() {
  return (
    <div className="lg:w-1/4">
      <div className="bg-card rounded-lg p-6 border border-border mb-6 animate-pulse shadow-sm">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-muted mb-4"></div>
          <div className="h-6 bg-muted w-32 mb-1 rounded"></div>
          <div className="h-4 bg-muted w-24 mb-4 rounded"></div>
          <div className="flex justify-between w-full mb-4">
            <div className="text-center">
              <div className="h-5 bg-muted w-10 mb-1 rounded"></div>
              <div className="h-3 bg-muted w-8 rounded"></div>
            </div>
            <div className="text-center">
              <div className="h-5 bg-muted w-10 mb-1 rounded"></div>
              <div className="h-3 bg-muted w-8 rounded"></div>
            </div>
            <div className="text-center">
              <div className="h-5 bg-muted w-10 mb-1 rounded"></div>
              <div className="h-3 bg-muted w-8 rounded"></div>
            </div>
          </div>
          <div className="h-10 bg-muted w-full rounded"></div>
        </div>
      </div>
      
      <div className="bg-card rounded-lg p-6 border border-border mb-6 animate-pulse shadow-sm">
        <div className="h-5 bg-muted w-32 mb-3 rounded"></div>
        <div className="space-y-2">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded"></div>
          ))}
        </div>
      </div>
      
      <div className="bg-card rounded-lg p-6 border border-border animate-pulse shadow-sm">
        <div className="h-5 bg-muted w-24 mb-3 rounded"></div>
        <div className="flex flex-wrap gap-2">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-8 bg-muted w-16 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
