'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DashboardSidebar, { DashboardSidebarSkeleton } from '@/components/DashboardSidebar';
import DashboardFooter from '@/components/DashboardFooter';
import MessageSidebar from './components/MessageSidebar';
import MessageList from './components/MessageList';
import MessageInput from './components/MessageInput';
import ConversationHeader from './components/ConversationHeader';
import EmptyState from './components/EmptyState';

// Typen für die Nachrichten-Komponenten
export type Conversation = {
  id: string;
  participants: {
    id: string;
    username: string;
    image?: string;
  }[];
  lastMessage?: {
    content: string;
    createdAt: Date;
    isRead: boolean;
    senderId: string;
  };
  unreadCount: number;
};

export type Message = {
  id: string;
  content: string;
  createdAt: Date;
  senderId: string;
  isRead: boolean;
};

const MessagesPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Mock-Daten für Tags
  const favoriteTags = [
    'wildstyle', 'photoshooting', 'photography', 'nude', 'model', 'landscape', 'ocean', 'nature', 'portrait'
  ];

  // Schütze die Seite vor nicht authentifizierten Benutzern
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  // Lade Konversationen, wenn die Seite geladen wird
  useEffect(() => {
    if (status === 'authenticated') {
      fetchConversations();
    }
  }, [status]);

  // Lade Nachrichten, wenn eine Konversation ausgewählt wird
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  // Funktion zum Abrufen der Konversationen
  const fetchConversations = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Konversationen:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funktion zum Abrufen der Nachrichten einer Konversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        
        // Markiere Nachrichten als gelesen
        markMessagesAsRead(conversationId);
      }
    } catch (error) {
      console.error('Fehler beim Laden der Nachrichten:', error);
    }
  };

  // Funktion zum Markieren von Nachrichten als gelesen
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      await fetch(`/api/conversations/${conversationId}/read`, {
        method: 'POST',
      });
      
      // Aktualisiere die Konversationsliste, um ungelesene Nachrichten zu aktualisieren
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
    } catch (error) {
      console.error('Fehler beim Markieren der Nachrichten als gelesen:', error);
    }
  };

  // Funktion zum Senden einer neuen Nachricht
  const sendMessage = async (content: string) => {
    if (!activeConversation || !content.trim()) return;
    
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: activeConversation,
          content,
        }),
      });
      
      if (response.ok) {
        const newMessage = await response.json();
        
        // Füge die neue Nachricht zur Liste hinzu
        setMessages(prev => [...prev, newMessage]);
        
        // Aktualisiere die Konversationsliste
        fetchConversations();
      }
    } catch (error) {
      console.error('Fehler beim Senden der Nachricht:', error);
    }
  };

  // Funktion zum Erstellen einer neuen Konversation
  const createConversation = async (userId: string) => {
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          participantId: userId,
        }),
      });
      
      if (response.ok) {
        const newConversation = await response.json();
        
        // Füge die neue Konversation zur Liste hinzu
        setConversations(prev => [newConversation, ...prev]);
        
        // Setze die neue Konversation als aktiv
        setActiveConversation(newConversation.id);
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Konversation:', error);
    }
  };

  // Lade-Zustand anzeigen, während Session überprüft wird
  if (status === 'loading') {
    return <MessagesPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 flex flex-col justify-between">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Linke Spalte - Profil und Navigation */}
          <DashboardSidebar session={session} favoriteTags={favoriteTags} />
          
          {/* Rechte Spalte - Messaging-Bereich */}
          <div className="lg:w-3/4">
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden flex h-[calc(100vh-200px)]">
              {/* Nachrichten-Seitenleiste */}
              <MessageSidebar 
                conversations={conversations}
                activeConversation={activeConversation}
                onSelectConversation={setActiveConversation}
                onCreateConversation={createConversation}
                loading={loading}
                currentUserId={session?.user?.id || ''}
              />
              
              {/* Nachrichten-Bereich */}
              <div className="flex-1 flex flex-col">
                {activeConversation ? (
                  <>
                    {/* Konversations-Header */}
                    <ConversationHeader 
                      conversation={conversations.find(c => c.id === activeConversation)}
                      currentUserId={session?.user?.id || ''}
                    />
                    
                    {/* Nachrichten-Liste */}
                    <MessageList 
                      messages={messages}
                      currentUserId={session?.user?.id || ''}
                    />
                    
                    {/* Nachrichten-Eingabe */}
                    <MessageInput onSendMessage={sendMessage} />
                  </>
                ) : (
                  <EmptyState />
                )}
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
const MessagesPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pt-24 flex flex-col justify-between">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <DashboardSidebarSkeleton />
          
          <div className="lg:w-3/4">
            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden flex h-[calc(100vh-200px)] animate-pulse">
              {/* Nachrichten-Seitenleiste Skeleton */}
              <div className="w-1/3 border-r border-border">
                <div className="p-4 border-b border-border">
                  <div className="h-10 bg-muted rounded-md w-full"></div>
                </div>
                <div className="p-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-2 mb-2">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Nachrichten-Bereich Skeleton */}
              <div className="flex-1 flex flex-col">
                <div className="h-16 border-b border-border p-4 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
                  <div className="h-5 bg-muted rounded w-1/4"></div>
                </div>
                <div className="flex-1 p-4"></div>
                <div className="p-4 border-t border-border">
                  <div className="h-12 bg-muted rounded-md w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <DashboardFooter />
    </div>
  );
};

export default MessagesPage;
