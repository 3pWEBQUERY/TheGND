'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface Profile {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
  isVerified: boolean;
  isFollowing: boolean;
}

interface TrendingTopic {
  id: string;
  tag: string;
  posts: number;
}

interface Event {
  id: string;
  title: string;
  date: Date;
  location: string;
  image: string;
}

export default function FeedSidebar() {
  const [suggestedProfiles, setSuggestedProfiles] = useState<Profile[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Profilvorschläge abrufen
  useEffect(() => {
    const fetchSuggestedProfiles = async () => {
      try {
        const response = await fetch('/api/users/suggested?limit=3');
        if (!response.ok) {
          throw new Error('Fehler beim Abrufen der Profilvorschläge');
        }
        const data = await response.json();
        setSuggestedProfiles(data);
      } catch (error) {
        console.error('Fehler beim Abrufen der Profilvorschläge:', error);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchSuggestedProfiles();
  }, []);

  // Trends abrufen
  useEffect(() => {
    const fetchTrendingTopics = async () => {
      try {
        const response = await fetch('/api/trends?limit=5');
        if (!response.ok) {
          throw new Error('Fehler beim Abrufen der Trends');
        }
        const data = await response.json();
        setTrendingTopics(data);
      } catch (error) {
        console.error('Fehler beim Abrufen der Trends:', error);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchTrendingTopics();
  }, []);

  // Events abrufen
  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await fetch('/api/events?limit=2');
        if (!response.ok) {
          throw new Error('Fehler beim Abrufen der Events');
        }
        const data = await response.json();
        // Konvertiere die Datums-Strings zurück in Date-Objekte
        const eventsWithDates = data.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
        setUpcomingEvents(eventsWithDates);
      } catch (error) {
        console.error('Fehler beim Abrufen der Events:', error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  // Folgen-Funktion
  const handleFollow = async (profileId: string) => {
    try {
      // In einer realen Anwendung würden wir hier die API aufrufen
      // const response = await fetch(`/api/users/${profileId}/follow`, {
      //   method: 'POST'
      // });
      
      // UI aktualisieren
      setSuggestedProfiles(prev => 
        prev.map(profile => 
          profile.id === profileId 
            ? { ...profile, isFollowing: true } 
            : profile
        )
      );
    } catch (error) {
      console.error('Fehler beim Folgen:', error);
    }
  };

  // Entfolgen-Funktion
  const handleUnfollow = async (profileId: string) => {
    try {
      // In einer realen Anwendung würden wir hier die API aufrufen
      // const response = await fetch(`/api/users/${profileId}/follow`, {
      //   method: 'DELETE'
      // });
      
      // UI aktualisieren
      setSuggestedProfiles(prev => 
        prev.map(profile => 
          profile.id === profileId 
            ? { ...profile, isFollowing: false } 
            : profile
        )
      );
    } catch (error) {
      console.error('Fehler beim Entfolgen:', error);
    }
  };

  // Profilvorschläge rendern
  const renderProfiles = () => {
    if (loadingProfiles) {
      return [...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center mb-4 animate-pulse">
          <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
          <div className="flex-1">
            <div className="h-4 bg-muted w-24 mb-1 rounded"></div>
            <div className="h-3 bg-muted w-16 rounded"></div>
          </div>
          <div className="h-8 bg-muted w-20 rounded-md"></div>
        </div>
      ));
    }

    if (suggestedProfiles.length === 0) {
      return <p className="text-muted-foreground text-sm text-center">Keine Vorschläge verfügbar</p>;
    }

    return suggestedProfiles.map(profile => (
      <div key={profile.id} className="flex items-center mb-4 last:mb-0">
        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
          {profile.image ? (
            <Image 
              src={profile.image} 
              alt={profile.name || profile.username} 
              width={40} 
              height={40} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-foreground text-sm font-bold">
                {(profile.name || profile.username).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <span className="font-medium text-sm">{profile.name}</span>
            {profile.isVerified && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-accent-color ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
        </div>
        
        {profile.isFollowing ? (
          <button 
            className="bg-muted hover:bg-muted/80 text-foreground text-xs px-3 py-1.5 rounded-md transition-colors duration-200"
            onClick={() => handleUnfollow(profile.id)}
          >
            Entfolgen
          </button>
        ) : (
          <button 
            className="accent-bg hover:opacity-90 text-white text-xs px-3 py-1.5 rounded-md transition-colors duration-200"
            onClick={() => handleFollow(profile.id)}
          >
            Folgen
          </button>
        )}
      </div>
    ));
  };

  // Trends rendern
  const renderTrends = () => {
    if (loadingTopics) {
      return [...Array(5)].map((_, i) => (
        <div key={i} className="mb-3 animate-pulse">
          <div className="h-4 bg-muted w-full mb-1 rounded"></div>
          <div className="h-3 bg-muted w-20 rounded"></div>
        </div>
      ));
    }

    if (trendingTopics.length === 0) {
      return <p className="text-muted-foreground text-sm text-center">Keine Trends verfügbar</p>;
    }

    return trendingTopics.map(topic => (
      <div key={topic.id} className="mb-4 last:mb-0">
        <a href="#" className="block hover:bg-muted/30 rounded-md p-2 -mx-2 transition-colors duration-200">
          <p className="font-medium text-sm">#{topic.tag}</p>
          <p className="text-xs text-muted-foreground">{topic.posts.toLocaleString('de-DE')} Beiträge</p>
        </a>
      </div>
    ));
  };

  // Events rendern
  const renderEvents = () => {
    if (loadingEvents) {
      return [...Array(2)].map((_, i) => (
        <div key={i} className="mb-4 animate-pulse">
          <div className="relative h-32 mb-2 bg-muted rounded"></div>
        </div>
      ));
    }

    if (upcomingEvents.length === 0) {
      return <p className="text-muted-foreground text-sm text-center">Keine Events verfügbar</p>;
    }

    return upcomingEvents.map(event => (
      <div key={event.id} className="mb-4 last:mb-0">
        <a href="#" className="block hover:bg-muted/30 rounded-md overflow-hidden transition-colors duration-200">
          <div className="relative h-32 mb-2">
            <Image 
              src={event.image} 
              alt={event.title} 
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-2 left-2 text-white">
              <p className="font-medium">{event.title}</p>
              <p className="text-xs">{event.date.toLocaleDateString('de-DE')} • {event.location}</p>
            </div>
          </div>
        </a>
      </div>
    ));
  };

  return (
    <div className="lg:w-1/4 space-y-6 hidden lg:block">
      {/* Profilvorschläge */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h3 className="font-medium mb-4">Vorschläge für dich</h3>
        {renderProfiles()}
        <button className="text-sm text-accent-color hover:underline mt-2 w-full text-center">
          Alle anzeigen
        </button>
      </div>
      
      {/* Trends */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h3 className="font-medium mb-4">Trends für dich</h3>
        {renderTrends()}
      </div>
      
      {/* Kommende Events */}
      <div className="bg-card rounded-lg p-6 border border-border shadow-sm">
        <h3 className="font-medium mb-4">Kommende Events</h3>
        {renderEvents()}
        <button className="text-sm text-accent-color hover:underline mt-2 w-full text-center">
          Alle Events anzeigen
        </button>
      </div>
      
      {/* Footer */}
      <div className="text-xs text-muted-foreground">
        <div className="flex flex-wrap gap-2 mb-2">
          <a href="#" className="hover:underline">Über uns</a>
          <span>•</span>
          <a href="#" className="hover:underline">Hilfe</a>
          <span>•</span>
          <a href="#" className="hover:underline">Datenschutz</a>
          <span>•</span>
          <a href="#" className="hover:underline">AGB</a>
        </div>
        <p>© 2025 GND. Alle Rechte vorbehalten.</p>
      </div>
    </div>
  );
}
