import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Formular-Daten extrahieren
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'post' oder 'comment'
    
    if (!file) {
      return NextResponse.json({ error: 'Keine Datei hochgeladen' }, { status: 400 });
    }

    // Datei-Informationen
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Eindeutigen Dateinamen generieren
    const uniqueId = uuidv4();
    const originalName = file.name;
    const extension = originalName.split('.').pop();
    const filename = `${uniqueId}.${extension}`;
    
    // Medientyp bestimmen
    const mediaType = file.type.startsWith('image/') ? 'IMAGE' : 'VIDEO';
    
    // Zielverzeichnis bestimmen
    const mediaFolder = mediaType === 'IMAGE' ? 'images' : 'videos';
    const directory = join(process.cwd(), 'public', 'uploads', type, mediaFolder);
    
    // Verzeichnis erstellen, falls es nicht existiert
    await mkdir(directory, { recursive: true });
    
    // Datei speichern
    const filePath = join(directory, filename);
    await writeFile(filePath, buffer);
    
    // Relativen Pfad für die Datenbank erstellen
    const relativePath = `/uploads/${type}/${mediaFolder}/${filename}`;
    
    // Metadaten für Bilder und Videos - mit null initialisieren
    let width = null;
    let height = null;
    let duration = null;
    
    // In Datenbank speichern
    const media = await prisma.media.create({
      data: {
        type: mediaType,
        url: relativePath,
        filename: originalName,
        size: buffer.length,
        mimeType: file.type,
        width,
        height,
        duration
      }
    });
    
    return NextResponse.json({ 
      id: media.id,
      url: relativePath,
      type: mediaType
    });
    
  } catch (error) {
    console.error('Upload-Fehler:', error);
    return NextResponse.json({ error: 'Fehler beim Hochladen der Datei' }, { status: 500 });
  }
}

// Maximale Dateigröße für Next.js konfigurieren
export const config = {
  api: {
    bodyParser: false,
  },
};
