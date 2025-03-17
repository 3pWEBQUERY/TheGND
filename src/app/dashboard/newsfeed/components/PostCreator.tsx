'use client';

import React, { useState, useRef } from 'react';
import { Session } from 'next-auth';
import Image from 'next/image';

interface PostCreatorProps {
  session: Session | null;
  onPostCreated?: () => void;
}

export default function PostCreator({ session, onPostCreated }: PostCreatorProps) {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedMediaIds, setUploadedMediaIds] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    if (!isExpanded && e.target.value.length > 0) {
      setIsExpanded(true);
    }
  };

  const handleFocus = () => {
    setIsExpanded(true);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...newFiles]);
      
      // Erstelle Vorschau-URLs
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (index: number) => {
    // Entferne die Vorschau-URL
    URL.revokeObjectURL(imagePreviews[index]);
    
    // Aktualisiere die Arrays
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoPreview(null);
    setSelectedVideo(null);
  };

  // Funktion zum Hochladen einer Mediendatei
  const uploadMedia = async (file: File, type: 'post' | 'comment'): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Hochladen der Datei');
      }
      
      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error('Fehler beim Hochladen:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if ((!content.trim() && selectedImages.length === 0 && !selectedVideo) || isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Medien hochladen
      const mediaIds: string[] = [];
      
      // Bilder hochladen
      for (const image of selectedImages) {
        const mediaId = await uploadMedia(image, 'post');
        if (mediaId) {
          mediaIds.push(mediaId);
        }
      }
      
      // Video hochladen
      if (selectedVideo) {
        const mediaId = await uploadMedia(selectedVideo, 'post');
        if (mediaId) {
          mediaIds.push(mediaId);
        }
      }
      
      // Beitrag erstellen
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          mediaIds
        })
      });
      
      if (!response.ok) {
        throw new Error('Fehler beim Erstellen des Beitrags');
      }
      
      // Formular zurücksetzen
      setContent('');
      setIsExpanded(false);
      
      // Medien zurücksetzen
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      
      setSelectedImages([]);
      setImagePreviews([]);
      setSelectedVideo(null);
      setVideoPreview(null);
      setUploadedMediaIds([]);
      
      // Callback aufrufen, um die Beitragsliste zu aktualisieren
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Fehler beim Erstellen des Beitrags:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 border border-border mb-6 shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {session?.user?.image ? (
              <Image 
                src={session.user.image} 
                alt="Profilbild" 
                width={40} 
                height={40} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <span className="text-foreground text-lg font-bold">
                  {session?.user?.username?.charAt(0).toUpperCase() || session?.user?.name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <textarea
              className="w-full p-3 bg-background rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-accent-color resize-none"
              placeholder="Was gibt's Neues?"
              rows={isExpanded ? 4 : 2}
              value={content}
              onChange={handleContentChange}
              onFocus={handleFocus}
            />
            
            {/* Medien-Vorschau */}
            {(imagePreviews.length > 0 || videoPreview) && (
              <div className="mt-3">
                {/* Bilder-Vorschau */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                        <Image 
                          src={preview} 
                          alt={`Vorschau ${index + 1}`} 
                          fill
                          className="object-cover"
                        />
                        <button 
                          type="button"
                          className="absolute top-1 right-1 bg-black/50 rounded-full p-1 text-white"
                          onClick={() => removeImage(index)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Video-Vorschau */}
                {videoPreview && (
                  <div className="relative rounded-lg overflow-hidden mb-2">
                    <video 
                      src={videoPreview} 
                      controls 
                      className="w-full max-h-60 object-contain"
                    />
                    <button 
                      type="button"
                      className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white"
                      onClick={removeVideo}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {isExpanded && (
              <div className="mt-3 flex justify-between items-center">
                <div className="flex space-x-2">
                  {/* Bild-Upload */}
                  <button 
                    type="button"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*" 
                      multiple 
                      onChange={handleImageSelect}
                    />
                  </button>
                  
                  {/* Video-Upload */}
                  <button 
                    type="button"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                    onClick={() => videoInputRef.current?.click()}
                    disabled={!!selectedVideo}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <input 
                      type="file" 
                      ref={videoInputRef}
                      className="hidden" 
                      accept="video/*" 
                      onChange={handleVideoSelect}
                    />
                  </button>
                  
                  {/* Standort */}
                  <button 
                    type="button"
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
                
                <button 
                  type="submit"
                  className="accent-bg hover:opacity-90 text-white px-4 py-2 rounded-md transition-colors duration-200"
                  disabled={!content.trim() && selectedImages.length === 0 && !selectedVideo}
                >
                  Posten
                </button>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
