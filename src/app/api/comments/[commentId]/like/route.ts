import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/comments/[commentId]/like - Kommentar liken
export async function POST(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Kommentar-ID aus der URL extrahieren
    const commentId = request.nextUrl.pathname.split('/').pop()?.replace('/like', '') || '';
    const userId = session.user.id;

    // Prüfen, ob der Kommentar existiert
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Kommentar nicht gefunden' }, { status: 404 });
    }

    // Prüfen, ob der Benutzer den Kommentar bereits geliked hat
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        commentId
      }
    });

    if (existingLike) {
      return NextResponse.json({ error: 'Kommentar bereits geliked' }, { status: 400 });
    }

    // Like erstellen
    await prisma.like.create({
      data: {
        userId,
        commentId
      }
    });

    // Anzahl der Likes abrufen
    const likeCount = await prisma.like.count({
      where: {
        commentId
      }
    });

    return NextResponse.json({ likes: likeCount });
  } catch (error) {
    console.error('Fehler beim Liken des Kommentars:', error);
    return NextResponse.json({ error: 'Fehler beim Liken des Kommentars' }, { status: 500 });
  }
}

// DELETE /api/comments/[commentId]/like - Like entfernen
export async function DELETE(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // Kommentar-ID aus der URL extrahieren
    const commentId = request.nextUrl.pathname.split('/').pop()?.replace('/like', '') || '';
    const userId = session.user.id;

    // Prüfen, ob der Kommentar existiert
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Kommentar nicht gefunden' }, { status: 404 });
    }

    // Prüfen, ob der Benutzer den Kommentar geliked hat
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        commentId
      }
    });

    if (!existingLike) {
      return NextResponse.json({ error: 'Kommentar nicht geliked' }, { status: 400 });
    }

    // Like entfernen
    await prisma.like.delete({
      where: {
        id: existingLike.id
      }
    });

    // Anzahl der Likes abrufen
    const likeCount = await prisma.like.count({
      where: {
        commentId
      }
    });

    return NextResponse.json({ likes: likeCount });
  } catch (error) {
    console.error('Fehler beim Entfernen des Likes:', error);
    return NextResponse.json({ error: 'Fehler beim Entfernen des Likes' }, { status: 500 });
  }
}
