'use client';

import React, { useState, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  // Funktion zum Senden einer Nachricht
  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  // Funktion zum Senden einer Nachricht mit der Enter-Taste
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-border">
      <div className="flex items-end">
        <textarea
          className="flex-1 py-2 px-4 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent-color resize-none"
          placeholder="Schreibe eine Nachricht..."
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="ml-2 accent-bg text-white p-2 rounded-md hover:opacity-90 transition-opacity"
          onClick={handleSendMessage}
          disabled={!message.trim()}
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
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-center">
        Drücke Enter zum Senden, Shift+Enter für eine neue Zeile
      </div>
    </div>
  );
};

export default MessageInput;
