'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardSidebar, { DashboardSidebarSkeleton } from '@/components/DashboardSidebar';
import DashboardFooter from '@/components/DashboardFooter';
import PostCreator from './components/PostCreator';
import FeedTabs from './components/FeedTabs';
import FeedPost from './components/FeedPost';
import FeedSidebar from './components/FeedSidebar';

// Typen für die API-Antworten
interface Post {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
  media: {
    id: string;
    url: string;
    type: 'IMAGE' | 'VIDEO';
  }[];
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
}

interface Pagination {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

interface PostsResponse {
  posts: Post[];
  pagination: Pagination;
}

const NewsfeedPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('foryou');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, pages: 0, page: 1, limit: 10 });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Schütze die Seite vor nicht authentifizierten Benutzern
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Daten für Tags
  const favoriteTags = [
    'wildstyle', 'photoshooting', 'photography', 'nude', 'model', 'landscape', 'ocean', 'nature', 'portrait'
  ];

  // Funktion zum Abrufen der Beiträge
  const fetchPosts = useCallback(async (page = 1, tab = activeTab) => {
    if (status !== 'authenticated') return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/posts?page=${page}&limit=10&tab=${tab}`);
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Beiträge');
      }
      
      const data: PostsResponse = await response.json();
      
      if (page === 1) {
        setPosts(data.posts);
      } else {
        setPosts(prev => [...prev, ...data.posts]);
      }
      
      setPagination(data.pagination);
    } catch (error) {
      console.error('Fehler beim Abrufen der Beiträge:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, status]);

  // Beiträge abrufen, wenn die Seite geladen wird oder sich der Tab ändert
  useEffect(() => {
    if (status === 'authenticated') {
      fetchPosts(1, activeTab);
    }
  }, [fetchPosts, activeTab, status, refreshTrigger]);

  // Funktion zum Laden weiterer Beiträge
  const loadMore = () => {
    if (pagination.page < pagination.pages) {
      fetchPosts(pagination.page + 1, activeTab);
    }
  };

  // Funktion zum Aktualisieren der Beiträge nach einer Aktion (z.B. neuer Beitrag)
  const refreshPosts = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Funktion zum Aktualisieren eines Beitrags (z.B. nach Like/Unlike)
  const updatePost = (postId: string, updates: Partial<Post>) => {
    setPosts(prev => 
      prev.map(post => 
        post.id === postId 
          ? { ...post, ...updates } 
          : post
      )
    );
  };

  // Lade-Zustand anzeigen, während Session überprüft wird
  if (status === 'loading') {
    return <NewsfeedSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 flex flex-col justify-between">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Linke Spalte - Profil und Navigation */}
          <DashboardSidebar session={session} favoriteTags={favoriteTags} />
          
          {/* Mittlere Spalte - Newsfeed */}
          <div className="lg:w-2/4">
            {/* Beitragserstellung */}
            <PostCreator session={session} onPostCreated={refreshPosts} />
            
            {/* Feed-Tabs */}
            <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            {/* Beiträge */}
            <div className="space-y-6 mt-6">
              {posts.length > 0 ? (
                posts.map(post => (
                  <FeedPost 
                    key={post.id} 
                    post={post} 
                    currentUser={session?.user}
                    onPostUpdated={updatePost}
                  />
                ))
              ) : !loading ? (
                <div className="bg-card rounded-lg p-6 border border-border shadow-sm text-center">
                  <p className="text-muted-foreground">Keine Beiträge gefunden.</p>
                  {activeTab === 'following' && (
                    <p className="mt-2">Folge anderen Benutzern, um ihre Beiträge hier zu sehen.</p>
                  )}
                  {activeTab === 'saved' && (
                    <p className="mt-2">Speichere Beiträge, um sie hier zu sehen.</p>
                  )}
                </div>
              ) : null}
              
              {loading && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-color"></div>
                </div>
              )}
            </div>
            
            {/* Mehr laden Button */}
            {pagination.page < pagination.pages && (
              <div className="mt-6 flex justify-center">
                <button 
                  className="bg-muted hover:bg-muted/80 text-foreground px-4 py-2 rounded-md transition-colors duration-200"
                  onClick={loadMore}
                  disabled={loading}
                >
                  Mehr laden
                </button>
              </div>
            )}
          </div>
          
          {/* Rechte Spalte - Trends und Vorschläge */}
          <FeedSidebar />
        </div>
      </div>
      <DashboardFooter />
    </div>
  );
};

// Skeleton-Komponente für Ladezeiten
const NewsfeedSkeleton = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 flex flex-col justify-between">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebarSkeleton />
          
          <div className="lg:w-2/4">
            {/* Beitragserstellung Skeleton */}
            <div className="bg-card rounded-lg p-6 border border-border mb-6 animate-pulse shadow-sm">
              <div className="h-24 bg-muted rounded-lg"></div>
              <div className="mt-4 flex justify-between">
                <div className="flex space-x-2">
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                  <div className="w-10 h-10 bg-muted rounded-full"></div>
                </div>
                <div className="w-24 h-10 bg-muted rounded-md"></div>
              </div>
            </div>
            
            {/* Feed-Tabs Skeleton */}
            <div className="bg-card rounded-lg p-4 border border-border mb-6 animate-pulse shadow-sm">
              <div className="flex space-x-4">
                <div className="h-8 bg-muted w-24 rounded-md"></div>
                <div className="h-8 bg-muted w-24 rounded-md"></div>
                <div className="h-8 bg-muted w-24 rounded-md"></div>
              </div>
            </div>
            
            {/* Beiträge Skeleton */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-lg p-6 border border-border mb-6 animate-pulse shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-muted rounded-full mr-3"></div>
                  <div>
                    <div className="h-4 bg-muted w-32 mb-2 rounded"></div>
                    <div className="h-3 bg-muted w-24 rounded"></div>
                  </div>
                </div>
                <div className="h-4 bg-muted w-full mb-2 rounded"></div>
                <div className="h-4 bg-muted w-3/4 mb-4 rounded"></div>
                <div className="aspect-video bg-muted rounded-lg mb-4"></div>
                <div className="flex justify-between">
                  <div className="flex space-x-4">
                    <div className="h-8 bg-muted w-20 rounded"></div>
                    <div className="h-8 bg-muted w-20 rounded"></div>
                  </div>
                  <div className="h-8 bg-muted w-20 rounded"></div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Rechte Spalte Skeleton */}
          <div className="lg:w-1/4 space-y-6 hidden lg:block">
            <div className="bg-card rounded-lg p-6 border border-border animate-pulse shadow-sm">
              <div className="h-6 bg-muted w-32 mb-4 rounded"></div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-muted rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted w-24 mb-1 rounded"></div>
                    <div className="h-3 bg-muted w-16 rounded"></div>
                  </div>
                  <div className="h-8 bg-muted w-20 rounded-md"></div>
                </div>
              ))}
            </div>
            
            <div className="bg-card rounded-lg p-6 border border-border animate-pulse shadow-sm">
              <div className="h-6 bg-muted w-40 mb-4 rounded"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="mb-3">
                  <div className="h-4 bg-muted w-full mb-1 rounded"></div>
                  <div className="h-3 bg-muted w-20 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <DashboardFooter />
    </div>
  );
};

export default NewsfeedPage;
