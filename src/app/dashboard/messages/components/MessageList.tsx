'use client';

import React, { useEffect, useRef } from 'react';
import { Message } from '../page';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatisches Scrollen zum Ende der Nachrichtenliste
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Funktion zum Formatieren des Zeitstempels
  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: de });
  };

  // Gruppiere Nachrichten nach Datum
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.createdAt);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(message);
    });
    
    return Object.entries(groups).map(([date, messages]) => ({
      date: new Date(messages[0].createdAt),
      messages,
    }));
  };

  const groupedMessages = groupMessagesByDate(messages);

  // Funktion zum Formatieren des Datums
  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Heute';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Gestern';
    } else {
      return date.toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-background/50">
      {groupedMessages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Keine Nachrichten vorhanden
        </div>
      ) : (
        <div className="space-y-4">
          {groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              {/* Datumsheader */}
              <div className="flex justify-center">
                <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
                  {formatDate(group.date)}
                </div>
              </div>
              
              {/* Nachrichten */}
              {group.messages.map((message, messageIndex) => {
                const isCurrentUser = message.senderId === currentUserId;
                const showAvatar = messageIndex === 0 || 
                  group.messages[messageIndex - 1].senderId !== message.senderId;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        isCurrentUser
                          ? 'bg-[hsl(345.3,82.7%,40.8%)] text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg'
                          : 'bg-card border border-border text-foreground rounded-tl-lg rounded-tr-lg rounded-br-lg'
                      } px-4 py-2 shadow-sm`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div
                        className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-white/70' : 'text-muted-foreground'
                        }`}
                      >
                        {formatTimestamp(message.createdAt)}
                        {isCurrentUser && (
                          <span className="ml-2">
                            {message.isRead ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 inline"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 inline"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                />
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default MessageList;
