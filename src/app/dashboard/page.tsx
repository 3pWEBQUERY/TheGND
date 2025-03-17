'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardFooter from '@/components/DashboardFooter';
import DashboardSidebar, { DashboardSidebarSkeleton } from '@/components/DashboardSidebar';

const DashboardPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('featured');
  
  // Schütze die Seite vor nicht authentifizierten Benutzern
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Lade-Zustand anzeigen, während Session überprüft wird
  if (status === 'loading') {
    return <DashboardSkeleton />;
  }

  // Mock-Daten für Featured Stories
  const featuredStories = [
    { id: 1, title: 'Stadt Meine', image: '/dashboard/story1.jpg' },
    { id: 2, title: 'Sommer Saison', image: '/dashboard/story2.jpg' },
    { id: 3, title: 'Bella\'s Story', image: '/dashboard/story3.jpg' },
    { id: 4, title: 'Live Sample', image: '/dashboard/story4.jpg' },
    { id: 5, title: 'Paradise City', image: '/dashboard/story5.jpg' },
  ];

  // Mock-Daten für Photo Feed
  const photoFeed = [
    { id: 1, image: '/dashboard/photo1.jpg', likes: 120, comments: 24 },
    { id: 2, image: '/dashboard/photo2.jpg', likes: 85, comments: 15 },
    { id: 3, image: '/dashboard/photo3.jpg', likes: 210, comments: 42 },
    { id: 4, image: '/dashboard/photo4.jpg', likes: 65, comments: 8 },
    { id: 5, image: '/dashboard/photo5.jpg', likes: 175, comments: 31 },
    { id: 6, image: '/dashboard/photo6.jpg', likes: 95, comments: 17 },
  ];

  // Mock-Daten für Tags
  const favoriteTags = [
    'wildstyle', 'photoshooting', 'photography', 'nude', 'model', 'landscape', 'ocean', 'nature', 'portrait'
  ];

  // Mock-Daten für Profilvorschläge
  const suggestedProfiles = [
    { id: 1, username: 'emma_model', avatar: '/dashboard/avatar1.jpg' },
    { id: 2, username: 'photo_master', avatar: '/dashboard/avatar2.jpg' },
    { id: 3, username: 'creative_lens', avatar: '/dashboard/avatar3.jpg' },
    { id: 4, username: 'wild_capture', avatar: '/dashboard/avatar4.jpg' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 flex flex-col justify-between">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Linke Spalte - Profil und Navigation */}
          <DashboardSidebar session={session} favoriteTags={favoriteTags} />
          
          {/* Rechte Spalte - Hauptinhalt */}
          <div className="lg:w-3/4">
            {/* Willkommensnachricht */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">Willkommen, {session?.user?.username || session?.user?.name || 'Benutzer'}!</h1>
              <p className="text-muted-foreground">Entdecke die neuesten Stories, Fotos und Updates auf deinem Dashboard.</p>
            </div>
            
            {/* Meine Stories */}
            <div className="bg-card rounded-lg p-6 border border-border mb-6 shadow-sm">          <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Meine Stories</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {featuredStories.map((story) => (
                  <div key={story.id} className="group cursor-pointer">
                    <div className="relative rounded-lg overflow-hidden aspect-square mb-2 border-2 border-transparent group-hover:border-accent-color transition-all duration-200">
                      <img 
                        src={story.image} 
                        alt={story.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-center text-sm font-medium">{story.title}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Photo Feed */}
            <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Photo Feed</h2>
                <div className="flex items-center space-x-4">
                  <button 
                    className={`text-sm ${activeTab === 'featured' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('featured')}
                  >
                    Featured
                  </button>
                  <button 
                    className={`text-sm ${activeTab === 'latest' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('latest')}
                  >
                    Latest
                  </button>
                  <button 
                    className={`text-sm ${activeTab === 'popular' ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
                    onClick={() => setActiveTab('popular')}
                  >
                    Popular
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {photoFeed.map((photo) => (
                  <div key={photo.id} className="group cursor-pointer">
                    <div className="relative rounded-lg overflow-hidden aspect-square mb-2">
                      <img 
                        src={photo.image} 
                        alt="Photo" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                        <div className="flex space-x-4">
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <span className="text-white">{photo.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-white">{photo.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-center">
                <button className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-md transition-colors duration-200">
                  Mehr laden
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DashboardFooter />
    </div>
  );
};

// Skeleton-Komponente für Ladezeiten
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 flex flex-col justify-between">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebarSkeleton />
          
          <div className="lg:w-3/4">
            {/* Willkommensnachricht Skeleton */}
            <div className="mb-6 animate-pulse">
              <div className="h-8 bg-muted w-64 mb-2 rounded"></div>
              <div className="h-4 bg-muted w-96 rounded"></div>
            </div>
            
            <div className="bg-card rounded-lg p-6 border border-border mb-6 animate-pulse shadow-sm">          <div className="flex justify-between items-center mb-4">
                <div className="h-6 bg-muted w-40 rounded"></div>
                <div className="h-4 bg-muted w-20 rounded"></div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i}>
                    <div className="aspect-square bg-muted rounded-lg mb-2"></div>
                    <div className="h-4 bg-muted w-20 mx-auto rounded"></div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-card rounded-lg p-6 border border-border animate-pulse shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="h-6 bg-muted w-32 rounded"></div>
                <div className="flex space-x-4">
                  <div className="h-4 bg-muted w-16 rounded"></div>
                  <div className="h-4 bg-muted w-16 rounded"></div>
                  <div className="h-4 bg-muted w-16 rounded"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <DashboardFooter />
    </div>
  );
};

export default DashboardPage;
