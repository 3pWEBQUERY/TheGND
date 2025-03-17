'use client';

import React, { useState, useMemo } from 'react';
import { Conversation } from '../page';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface MessageSidebarProps {
  conversations: Conversation[];
  activeConversation: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: (userId: string) => void;
  loading: boolean;
  currentUserId: string;
}

const MessageSidebar: React.FC<MessageSidebarProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onCreateConversation,
  loading,
  currentUserId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newUserId, setNewUserId] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'requests'>('all');

  // Filtere Konversationen basierend auf dem Suchbegriff und dem aktiven Tab
  const filteredConversations = useMemo(() => {
    // Zuerst nach Suchbegriff filtern
    const searchFiltered = conversations.filter(conversation => {
      const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
      return otherParticipant?.username.toLowerCase().includes(searchTerm.toLowerCase());
    });

    // Dann nach Tab filtern
    if (activeTab === 'all') {
      return searchFiltered;
    } else {
      // "Anfragen" sind Konversationen, bei denen der aktuelle Benutzer noch keine Nachricht gesendet hat
      return searchFiltered.filter(conversation => {
        // Wenn es keine letzte Nachricht gibt, ist es eine Anfrage
        if (!conversation.lastMessage) return true;
        
        // Prüfe, ob alle Nachrichten von anderen Benutzern stammen
        // (Vereinfachte Logik: Wir prüfen nur die letzte Nachricht)
        return conversation.lastMessage.senderId !== currentUserId;
      });
    }
  }, [conversations, searchTerm, activeTab, currentUserId]);

  // Funktion zum Formatieren des Zeitstempels
  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: de });
  };

  // Funktion zum Erstellen einer neuen Konversation
  const handleCreateConversation = () => {
    if (newUserId.trim()) {
      onCreateConversation(newUserId);
      setShowNewConversation(false);
      setNewUserId('');
    }
  };

  // Funktion zum Abbrechen der Erstellung einer neuen Konversation
  const handleCancelNewConversation = () => {
    setShowNewConversation(false);
    setNewUserId('');
  };

  return (
    <div className="w-1/3 border-r border-border flex flex-col">
      {/* Suchleiste und Neuer Chat Button */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="relative flex-1 mr-2">
          <input
            type="text"
            placeholder="In Nachrichten suchen..."
            className="w-full py-2 px-4 pr-10 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent-color"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          className="accent-bg text-white p-2 rounded-md hover:opacity-90 transition-opacity"
          onClick={() => setShowNewConversation(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>

      {/* Neue Konversation erstellen */}
      {showNewConversation && (
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-medium mb-2">Neue Konversation</h3>
          <input
            type="text"
            placeholder="Benutzer-ID eingeben"
            className="w-full py-2 px-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent-color mb-2"
            value={newUserId}
            onChange={(e) => setNewUserId(e.target.value)}
          />
          <div className="flex justify-end space-x-2">
            <button
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={handleCancelNewConversation}
            >
              Abbrechen
            </button>
            <button
              className="text-sm accent-bg text-white px-3 py-1 rounded-md hover:opacity-90 transition-opacity"
              onClick={handleCreateConversation}
            >
              Erstellen
            </button>
          </div>
        </div>
      )}

      {/* Konversationsliste */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          // Lade-Zustand
          <div className="p-4 text-center text-muted-foreground">
            Konversationen werden geladen...
          </div>
        ) : filteredConversations.length === 0 ? (
          // Keine Konversationen gefunden
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm
              ? 'Keine Konversationen gefunden'
              : 'Keine Konversationen vorhanden'}
          </div>
        ) : (
          // Konversationsliste
          <div>
            {filteredConversations.map((conversation) => {
              // Finde den anderen Teilnehmer (nicht der aktuelle Benutzer)
              const otherParticipant = conversation.participants.find(
                (p) => p.id !== currentUserId
              );

              return (
                <div
                  key={conversation.id}
                  className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors duration-200 ${
                    activeConversation === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onSelectConversation(conversation.id)}
                >
                  <div className="flex items-center">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full overflow-hidden border border-border mr-3">
                      {otherParticipant?.image ? (
                        <img
                          src={otherParticipant.image}
                          alt={otherParticipant.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-foreground text-lg font-bold">
                            {otherParticipant?.username.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Konversationsdetails */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-medium truncate">
                          {otherParticipant?.username || 'Unbekannter Benutzer'}
                        </h3>
                        {conversation.lastMessage && (
                          <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                            {formatTimestamp(conversation.lastMessage.createdAt)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.lastMessage
                            ? conversation.lastMessage.senderId === currentUserId
                              ? `Du: ${conversation.lastMessage.content}`
                              : conversation.lastMessage.content
                            : 'Keine Nachrichten'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <span className="ml-2 accent-bg text-white text-xs rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-t border-border p-2 flex">
        <button 
          className={`flex-1 py-2 text-center text-sm font-medium rounded-md transition-colors ${
            activeTab === 'all' 
              ? 'accent-bg text-white' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('all')}
        >
          Alle
        </button>
        <button 
          className={`flex-1 py-2 text-center text-sm font-medium rounded-md transition-colors ${
            activeTab === 'requests' 
              ? 'accent-bg text-white' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          onClick={() => setActiveTab('requests')}
        >
          Anfragen
        </button>
      </div>
    </div>
  );
};

export default MessageSidebar;
