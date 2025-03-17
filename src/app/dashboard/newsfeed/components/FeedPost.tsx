'use client';

import React, { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

// Hilfsfunktion, um sicherzustellen, dass Bild-URLs vollständig sind
const getFullImageUrl = (url: string) => {
  if (!url) return '';
  
  // Wenn die URL bereits mit http:// oder https:// beginnt, ist sie bereits vollständig
  // Dies schließt auch Vercel Blob-URLs ein, die mit https:// beginnen
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Vercel BLOB-URLs sollten unverändert zurückgegeben werden
    if (url.includes('blob.vercel-storage.com')) {
      return url;
    }
    return url;
  }
  
  // Wenn die URL mit /uploads/ beginnt oder mit uploads/ beginnt
  if (url.startsWith('/uploads/') || url.startsWith('uploads/')) {
    // Stelle sicher, dass die URL mit einem Schrägstrich beginnt
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    
    // Verwende die aktuelle Domain des Browsers
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}${normalizedPath}`;
  }
  
  // Wenn die URL mit einem Schrägstrich beginnt, füge die Domain hinzu
  if (url.startsWith('/')) {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}${url}`;
  }
  
  // Andernfalls gib die URL unverändert zurück
  return url;
};

interface Media {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
}

interface Author {
  id: string;
  name: string | null;
  username: string;
  image: string | null;
}

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  author: Author;
  media: Media[];
  likes: number;
  replies: number;
  isLiked: boolean;
  parentId?: string | null;
  childComments?: Comment[];
}

interface Post {
  id: string;
  author: Author;
  content: string;
  media: Media[];
  createdAt: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  isSaved: boolean;
}

interface FeedPostProps {
  post: Post;
  currentUser: any; // Hier könnte ein genauerer Typ verwendet werden
  onPostUpdated?: (postId: string, updates: Partial<Post>) => void;
}

export default function FeedPost({ post, currentUser, onPostUpdated }: FeedPostProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [showComments, setShowComments] = useState(false);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [comment, setComment] = useState('');
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentPagination, setCommentPagination] = useState({ total: 0, pages: 0, page: 1, limit: 10 });
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(post.content);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null);
  const [replyToUsername, setReplyToUsername] = useState<string | null>(null);

  // Formatiere den Inhalt, um Hashtags hervorzuheben
  const formattedContent = post.content.split(/(\s+)/).map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span key={index} className="text-accent-color hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    return part;
  });

  // Kommentare laden, wenn sie angezeigt werden sollen
  useEffect(() => {
    if (showComments && commentsList.length === 0) {
      fetchComments();
    }
  }, [showComments]);

  // Kommentare abrufen
  const fetchComments = async (page = 1) => {
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Kommentare');
      }
      
      const data = await response.json();
      
      if (page === 1) {
        setCommentsList(data.comments);
      } else {
        setCommentsList(prev => [...prev, ...data.comments]);
      }
      
      setCommentPagination(data.pagination);
    } catch (error) {
      console.error('Fehler beim Abrufen der Kommentare:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  // Mehr Kommentare laden
  const loadMoreComments = () => {
    if (commentPagination.page < commentPagination.pages) {
      fetchComments(commentPagination.page + 1);
    }
  };

  // Like-Funktion
  const handleLike = async () => {
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      console.log(`API-Aufruf: ${method} /api/posts/${post.id}/like`);
      
      // Verwende absolute URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/posts/${post.id}/like`, {
        method,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API-Fehler:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Fehler: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API-Antwort:', data);
      
      // UI aktualisieren
      setIsLiked(!isLiked);
      setLikeCount(data.likes);
      
      // Callback aufrufen, um die Beitragsliste zu aktualisieren
      if (onPostUpdated) {
        onPostUpdated(post.id, { isLiked: !isLiked, likes: data.likes });
      }
    } catch (error) {
      console.error('Detaillierter Fehler:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'Kein Stack-Trace verfügbar'
      });
    }
  };

  // Speichern-Funktion
  const handleSave = async () => {
    try {
      const method = isSaved ? 'DELETE' : 'POST';
      console.log(`API-Aufruf: ${method} /api/posts/${post.id}/save`);
      
      // Verwende absolute URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/posts/${post.id}/save`, {
        method,
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API-Fehler:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Fehler: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('API-Antwort:', data);
      
      // UI aktualisieren
      setIsSaved(!isSaved);
      
      // Callback aufrufen, um die Beitragsliste zu aktualisieren
      if (onPostUpdated) {
        onPostUpdated(post.id, { isSaved: !isSaved });
      }
    } catch (error) {
      console.error('Detaillierter Fehler:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'Kein Stack-Trace verfügbar'
      });
    }
  };

  // Kommentar-Funktion
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    
    try {
      console.log(`API-Aufruf: POST /api/posts/${post.id}/comments`);
      
      // Verwende absolute URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: comment,
          parentId: replyToCommentId
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API-Fehler:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Fehler: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const newComment = await response.json();
      console.log('API-Antwort:', newComment);
      
      if (replyToCommentId) {
        // Wenn es eine Antwort ist, füge sie zum übergeordneten Kommentar hinzu
        setCommentsList(prev => 
          prev.map(comment => {
            if (comment.id === replyToCommentId) {
              return {
                ...comment,
                replies: comment.replies + 1,
                childComments: [...(comment.childComments || []), newComment]
              };
            }
            return comment;
          })
        );
      } else {
        // Wenn es ein Top-Level-Kommentar ist, füge ihn zur Liste hinzu
        setCommentsList(prev => [newComment, ...prev]);
      }
      
      // Kommentarzähler aktualisieren
      const newCommentCount = post.comments + 1;
      
      // Callback aufrufen, um die Beitragsliste zu aktualisieren
      if (onPostUpdated) {
        onPostUpdated(post.id, { comments: newCommentCount });
      }
      
      // Formular zurücksetzen
      setComment('');
      setReplyToCommentId(null);
      setReplyToUsername(null);
    } catch (error) {
      console.error('Detaillierter Fehler:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'Kein Stack-Trace verfügbar'
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Antworten auf einen Kommentar laden
  const fetchReplies = async (commentId: string) => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments/${commentId}/replies`);
      if (!response.ok) {
        throw new Error('Fehler beim Abrufen der Antworten');
      }
      
      const data = await response.json();
      
      // Kommentarliste aktualisieren
      setCommentsList(prev => 
        prev.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              childComments: data.comments
            };
          }
          return comment;
        })
      );
    } catch (error) {
      console.error('Fehler beim Abrufen der Antworten:', error);
    }
  };

  // Beitrag bearbeiten
  const handleEdit = async () => {
    if (isSubmittingEdit) return;
    
    setIsSubmittingEdit(true);
    
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: editedContent
        })
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Bearbeiten des Beitrags');
      }
      
      const updatedPost = await response.json();
      
      // UI aktualisieren
      if (onPostUpdated) {
        onPostUpdated(post.id, { content: updatedPost.content });
      }
      
      // Bearbeitungsmodus beenden
      setIsEditing(false);
    } catch (error) {
      console.error('Fehler beim Bearbeiten des Beitrags:', error);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Beitrag löschen
  const handleDelete = async () => {
    if (!window.confirm('Möchtest du diesen Beitrag wirklich löschen?') || isDeleting) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Beitrags');
      }
      
      // Callback aufrufen, um die Beitragsliste zu aktualisieren
      if (onPostUpdated) {
        // Die übergeordnete Komponente sollte den Beitrag aus der Liste entfernen
        // Wir übergeben ein leeres Objekt und die übergeordnete Komponente
        // kann anhand der postId den Beitrag entfernen
        onPostUpdated(post.id, {});
      }
    } catch (error) {
      console.error('Fehler beim Löschen des Beitrags:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Kommentar liken
  const handleCommentLike = async (commentId: string, isLiked: boolean) => {
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      console.log(`API-Aufruf: ${method} /api/comments/${commentId}/like`);
      
      // Verwende absolute URL
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const response = await fetch(`${baseUrl}/api/comments/${commentId}/like`, {
        method,
      });
      
      // Auch bei Fehlern (z.B. 400) die UI aktualisieren
      const data = await response.json();
      console.log('API-Antwort:', data);
      
      if (response.ok) {
        // UI aktualisieren für den Hauptkommentar
        setCommentsList(prev => 
          prev.map(comment => {
            if (comment.id === commentId) {
              return { ...comment, isLiked: !isLiked, likes: data.likes };
            }
            
            // Auch in den Antworten suchen
            if (comment.childComments) {
              return {
                ...comment,
                childComments: comment.childComments.map(reply => 
                  reply.id === commentId 
                    ? { ...reply, isLiked: !isLiked, likes: data.likes }
                    : reply
                )
              };
            }
            
            return comment;
          })
        );
      } else {
        console.error('API-Fehler:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error
        });
      }
    } catch (error) {
      console.error('Detaillierter Fehler:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'Kein Stack-Trace verfügbar'
      });
    }
  };

  // Auf Kommentar antworten
  const handleReplyToComment = (commentId: string, username: string) => {
    setReplyToCommentId(commentId);
    setReplyToUsername(username);
    setComment(`@${username} `);
    
    // Fokus auf das Kommentarfeld setzen
    const commentInput = document.querySelector('input[placeholder="Schreibe einen Kommentar..."]') as HTMLInputElement;
    if (commentInput) {
      commentInput.focus();
    }
  };

  // Teilen-Funktion
  const handleShare = (platform: string) => {
    // Hier würde die Teilen-Funktionalität implementiert werden
    console.log(`Beitrag auf ${platform} teilen`);
    setShowShareOptions(false);
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      {/* Beitrags-Header */}
      <div className="p-4 flex items-center">
        <div className="w-20 h-20 rounded-full overflow-hidden mr-3">
          {post.author.image ? (
            <img 
              src={getFullImageUrl(post.author.image)} 
              alt={post.author.name || post.author.username} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-foreground text-lg font-bold">
                {(post.author.name || post.author.username).charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center">
            <h3 className="font-medium">{post.author.name}</h3>
            <span className="text-muted-foreground text-sm ml-2">@{post.author.username}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: de })}
          </p>
        </div>
        
        <button className="text-muted-foreground hover:text-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
      
      {/* Beitrags-Inhalt */}
      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap mb-2">{formattedContent}</p>
      </div>
      
      {/* Medien */}
      {post.media.length > 0 && (
        <div className="relative">
          {/* Aktives Medium */}
          <div>
            {post.media[activeMediaIndex].type === 'IMAGE' ? (
              <img 
                src={getFullImageUrl(post.media[activeMediaIndex].url)} 
                alt="Beitragsbild" 
                className="w-full object-cover max-h-[500px]"
              />
            ) : (
              <video 
                src={getFullImageUrl(post.media[activeMediaIndex].url)} 
                controls 
                className="w-full max-h-[500px] object-contain"
              />
            )}
          </div>
          
          {/* Navigation für mehrere Medien */}
          {post.media.length > 1 && (
            <>
              <button 
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white"
                onClick={() => setActiveMediaIndex(prev => (prev === 0 ? post.media.length - 1 : prev - 1))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 rounded-full p-2 text-white"
                onClick={() => setActiveMediaIndex(prev => (prev === post.media.length - 1 ? 0 : prev + 1))}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Indikatoren */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                {post.media.map((_, index) => (
                  <button 
                    key={index}
                    className={`w-2 h-2 rounded-full ${index === activeMediaIndex ? 'bg-white' : 'bg-white/50'}`}
                    onClick={() => setActiveMediaIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* Aktionen */}
      <div className="px-4 py-3 flex justify-between border-t border-border">
        <div className="flex space-x-4">
          {/* Like-Button */}
          <button 
            className={`flex items-center space-x-1 ${isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={handleLike}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill={isLiked ? "currentColor" : "none"} 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likeCount}</span>
          </button>
          
          {/* Kommentar-Button */}
          <button 
            className="flex items-center space-x-1 text-muted-foreground hover:text-foreground"
            onClick={() => setShowComments(!showComments)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comments}</span>
          </button>
          
          {/* Teilen-Button */}
          <button className="flex items-center space-x-1 text-muted-foreground hover:text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
        
        {/* Speichern-Button */}
        <button 
          className={`${isSaved ? 'text-[hsl(345.3,82.7%,40.8%)]' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={handleSave}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill={isSaved ? "currentColor" : "none"} 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
      
      {/* Kommentare */}
      {showComments && (
        <div className="border-t border-border p-4">
          {/* Kommentar-Eingabe */}
          <form onSubmit={handleComment} className="flex flex-col mb-4">
            {replyToUsername && (
              <div className="mb-2 px-4 py-1 bg-muted/30 rounded-md flex items-center">
                <span className="text-xs text-muted-foreground">
                  Antwort an <span className="font-medium">@{replyToUsername}</span>
                </span>
                <button 
                  className="ml-auto text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setReplyToCommentId(null);
                    setReplyToUsername(null);
                    setComment('');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                {currentUser?.image ? (
                  <img 
                    src={getFullImageUrl(currentUser.image)} 
                    alt="Profilbild" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <span className="text-foreground text-sm font-bold">
                      {currentUser?.username?.charAt(0).toUpperCase() || currentUser?.name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                )}
              </div>
              
              <input 
                type="text" 
                className="flex-1 bg-background rounded-full px-4 py-2 text-sm border border-border focus:outline-none focus:ring-2 focus:ring-accent-color"
                placeholder="Schreibe einen Kommentar..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              
              <button 
                type="submit"
                className="ml-2 accent-bg hover:opacity-90 text-white p-2 rounded-full transition-colors duration-200"
                disabled={!comment.trim()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </form>
          
          {/* Kommentare */}
          <div className="space-y-4">
            {loadingComments ? (
              // Lade-Zustand
              [...Array(2)].map((_, i) => (
                <div key={i} className="flex animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-muted mr-2 flex-shrink-0"></div>
                  <div className="bg-background rounded-lg p-3 flex-1">
                    <div className="h-4 bg-muted w-32 mb-2 rounded"></div>
                    <div className="h-3 bg-muted w-full rounded"></div>
                  </div>
                </div>
              ))
            ) : commentsList.length > 0 ? (
              // Kommentare anzeigen
              commentsList.map(comment => (
                <div key={comment.id} className="space-y-2">
                  <div className="flex">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2 flex-shrink-0">
                      {comment.author.image ? (
                        <img 
                          src={getFullImageUrl(comment.author.image)} 
                          alt={comment.author.name || comment.author.username} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-foreground text-sm font-bold">
                            {(comment.author.name || comment.author.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="bg-background rounded-lg p-3 flex-1">
                      <div className="flex items-center mb-1">
                        <span className="font-medium text-sm">{comment.author.name || comment.author.username}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: de })}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                      
                      {comment.media && comment.media.length > 0 && (
                        <div className="mt-2">
                          {comment.media.map(media => (
                            <div key={media.id} className="mt-2">
                              {media.type === 'IMAGE' ? (
                                <img 
                                  src={getFullImageUrl(media.url)} 
                                  alt="Kommentar-Bild" 
                                  className="rounded-md max-h-40 object-cover"
                                />
                              ) : (
                                <video 
                                  src={getFullImageUrl(media.url)} 
                                  controls 
                                  className="rounded-md max-h-40 w-full"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <button 
                          className={`mr-4 ${comment.isLiked ? 'text-[hsl(345.3,82.7%,40.8%)]' : ''}`}
                          onClick={() => handleCommentLike(comment.id, comment.isLiked)}
                        >
                          {comment.likes} Likes
                        </button>
                        <button
                          onClick={() => handleReplyToComment(comment.id, comment.author.username)}
                          className="mr-4"
                        >
                          {comment.replies} Antworten
                        </button>
                        {comment.replies > 0 && !comment.childComments && (
                          <button
                            onClick={() => fetchReplies(comment.id)}
                            className="text-accent-color"
                          >
                            Antworten anzeigen
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Antworten anzeigen */}
                  {comment.childComments && comment.childComments.length > 0 && (
                    <div className="ml-10 space-y-2">
                      {comment.childComments.map(reply => (
                        <div key={reply.id} className="flex">
                          <div className="w-6 h-6 rounded-full overflow-hidden mr-2 flex-shrink-0">
                            {reply.author.image ? (
                              <img 
                                src={getFullImageUrl(reply.author.image)} 
                                alt={reply.author.name || reply.author.username} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <span className="text-foreground text-xs font-bold">
                                  {(reply.author.name || reply.author.username).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="bg-background rounded-lg p-2 flex-1">
                            <div className="flex items-center mb-1">
                              <span className="font-medium text-xs">{reply.author.name || reply.author.username}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true, locale: de })}
                              </span>
                            </div>
                            <p className="text-xs">{reply.content}</p>
                            
                            {reply.media && reply.media.length > 0 && (
                              <div className="mt-2">
                                {reply.media.map(media => (
                                  <div key={media.id} className="mt-2">
                                    {media.type === 'IMAGE' ? (
                                      <img 
                                        src={getFullImageUrl(media.url)} 
                                        alt="Antwort-Bild" 
                                        className="rounded-md max-h-32 object-cover"
                                      />
                                    ) : (
                                      <video 
                                        src={getFullImageUrl(media.url)} 
                                        controls 
                                        className="rounded-md max-h-32 w-full"
                                      />
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <button 
                                className={`mr-4 ${reply.isLiked ? 'text-[hsl(345.3,82.7%,40.8%)]' : ''}`}
                                onClick={() => handleCommentLike(reply.id, reply.isLiked)}
                              >
                                {reply.likes} Likes
                              </button>
                              <button
                                onClick={() => handleReplyToComment(comment.id, reply.author.username)}
                              >
                                Antworten
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              // Keine Kommentare
              <p className="text-muted-foreground text-sm text-center">Noch keine Kommentare. Sei der Erste!</p>
            )}
          </div>
          
          {/* Mehr Kommentare laden */}
          {commentPagination.page < commentPagination.pages && (
            <button 
              className="text-sm text-accent-color hover:underline mt-4 w-full text-center"
              onClick={loadMoreComments}
              disabled={loadingComments}
            >
              Mehr Kommentare laden
            </button>
          )}
        </div>
      )}
    </div>
  );
}
