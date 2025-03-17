'use client';

import React from 'react';
import { Conversation } from '../page';

interface ConversationHeaderProps {
  conversation: Conversation | undefined;
  currentUserId: string;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  currentUserId,
}) => {
  if (!conversation) return null;

  // Finde den anderen Teilnehmer (nicht der aktuelle Benutzer)
  const otherParticipant = conversation.participants.find(
    (p) => p.id !== currentUserId
  );

  return (
    <div className="h-16 border-b border-border p-2 flex items-center">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden border border-border mr-3">
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

      {/* Benutzerinfo */}
      <div className="flex-1">
        <h3 className="font-medium">
          {otherParticipant?.username || 'Unbekannter Benutzer'}
        </h3>
        <p className="text-xs text-muted-foreground">
          Zuletzt online vor 5 Minuten
        </p>
      </div>

      {/* Aktionen */}
      <div className="flex space-x-2">
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
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
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
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
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
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
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ConversationHeader;
