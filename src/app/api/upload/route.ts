import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/upload - Anfrage erhalten');
    
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user) {
      console.log('Nicht authentifiziert');
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }
    
    console.log('Benutzer authentifiziert:', session.user.id);

    // Formular-Daten extrahieren
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'post' oder 'comment'
    
    console.log('Formular-Daten:', { type, fileName: file?.name });
    
    if (!file) {
      console.log('Keine Datei hochgeladen');
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
    }

    try {
      // Datei-Informationen
      const bytes = await file.arrayBuffer();
      
      console.log('Datei-Informationen:', { 
        size: bytes.byteLength, 
        type: file.type 
      });
      
      // Eindeutigen Dateinamen generieren
      const uniqueId = uuidv4();
      const originalName = file.name;
      const extension = originalName.split('.').pop();
      const filename = `${uniqueId}.${extension}`;
      
      // Medientyp bestimmen
      const mediaType = file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
      
      // Medienordner für den Pfad bestimmen
      const mediaFolder = mediaType === 'IMAGE' ? 'images' : 'videos';
      
      try {
        // Datei auf Vercel Blob hochladen
        const blob = await put(`${type}/${mediaFolder}/${filename}`, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        
        console.log('Datei auf Vercel Blob hochgeladen:', blob.url);
        
        // Metadaten für Bilder und Videos - mit null initialisieren
        let width = null;
        let height = null;
        let duration = null;
        
        try {
          console.log('Speichere Mediendaten in der Datenbank...');
          // In Datenbank speichern
          const media = await prisma.media.create({
            data: {
              type: mediaType,
              url: blob.url, // Speichere die vollständige Blob-URL
              filename: originalName,
              size: bytes.byteLength,
              mimeType: file.type,
              width,
              height,
              duration
            }
          });
          
          console.log('Mediendaten gespeichert:', media.id);
          
          return NextResponse.json({ 
            id: media.id,
            url: blob.url, // Gib die vollständige Blob-URL zurück
            type: mediaType
          });
        } catch (dbError) {
          console.error('Datenbankfehler beim Speichern der Mediendaten:', dbError);
          const errorMessage = dbError instanceof Error ? dbError.message : 'Unbekannter Datenbankfehler';
          const errorStack = dbError instanceof Error ? dbError.stack : '';
          console.error('Datenbankfehlerdetails:', { message: errorMessage, stack: errorStack });
          
          return NextResponse.json({ 
            error: 'Datenbankfehler beim Speichern der Mediendaten', 
            details: errorMessage 
          }, { status: 500 });
        }
      } catch (fileError) {
        console.error('Dateisystemfehler:', fileError);
        const errorMessage = fileError instanceof Error ? fileError.message : 'Unbekannter Dateisystemfehler';
        const errorStack = fileError instanceof Error ? fileError.stack : '';
        console.error('Dateisystemfehlerdetails:', { message: errorMessage, stack: errorStack });
        
        return NextResponse.json({ 
          error: 'Fehler beim Speichern der Datei', 
          details: errorMessage 
        }, { status: 500 });
      }
    } catch (processingError) {
      console.error('Fehler bei der Verarbeitung der Datei:', processingError);
      const errorMessage = processingError instanceof Error ? processingError.message : 'Unbekannter Verarbeitungsfehler';
      const errorStack = processingError instanceof Error ? processingError.stack : '';
      console.error('Verarbeitungsfehlerdetails:', { message: errorMessage, stack: errorStack });
      
      return NextResponse.json({ 
        error: 'Fehler bei der Verarbeitung der Datei', 
        details: errorMessage 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Allgemeiner Upload-Fehler:', error);
    // Detailliertere Fehlerinformationen
    const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
    const errorStack = error instanceof Error ? error.stack : '';
    console.error('Fehlerdetails:', { message: errorMessage, stack: errorStack });
    
    return NextResponse.json({ 
      error: 'Fehler beim Hochladen der Datei', 
      details: errorMessage 
    }, { status: 500 });
  }
}

// Maximale Dateigröße für Next.js konfigurieren
export const config = {
  api: {
    bodyParser: false,
  },
};
