'use client';

import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background/50">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-medium mb-2">Keine Nachricht ausgewählt</h3>
      <p className="text-muted-foreground text-center max-w-md">
        Wähle eine Konversation aus der Liste oder starte eine neue Unterhaltung, um Nachrichten zu senden.
      </p>
    </div>
  );
};

export default EmptyState;
