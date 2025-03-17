import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/posts/[postId]/save - Beitrag speichern
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Wichtig: params als Promise behandeln
    const { postId } = await params;
    const userId = session.user.id;

    // Prüfen, ob der Beitrag existiert
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }

    // Prüfen, ob der Benutzer den Beitrag bereits gespeichert hat
    const existingSave = await prisma.save.findFirst({
      where: {
        userId,
        postId
      }
    });

    if (existingSave) {
      return NextResponse.json({ error: 'Beitrag bereits gespeichert' }, { status: 400 });
    }

    // Speichern erstellen
    await prisma.save.create({
      data: {
        userId,
        postId
      }
    });

    return NextResponse.json({ success: true, isSaved: true });
  } catch (error) {
    console.error('Fehler beim Speichern des Beitrags:', error);
    return NextResponse.json({ error: 'Fehler beim Speichern des Beitrags' }, { status: 500 });
  }
}

// DELETE /api/posts/[postId]/save - Speichern entfernen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Wichtig: params als Promise behandeln
    const { postId } = await params;
    const userId = session.user.id;

    // Prüfen, ob der Beitrag existiert
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }

    // Speichern suchen
    const save = await prisma.save.findFirst({
      where: {
        userId,
        postId
      }
    });

    if (!save) {
      return NextResponse.json({ error: 'Speichern nicht gefunden' }, { status: 404 });
    }

    // Speichern löschen
    await prisma.save.delete({
      where: { id: save.id }
    });

    return NextResponse.json({ success: true, isSaved: false });
  } catch (error) {
    console.error('Fehler beim Entfernen des Speicherns:', error);
    return NextResponse.json({ error: 'Fehler beim Entfernen des Speicherns' }, { status: 500 });
  }
}
