import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// POST /api/posts/[postId]/like - Beitrag liken
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

    const { postId } = params;
    const userId = session.user.id;

    // Prüfen, ob der Beitrag existiert
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }

    // Prüfen, ob der Benutzer den Beitrag bereits geliked hat
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        postId
      }
    });

    if (existingLike) {
      return NextResponse.json({ error: 'Beitrag bereits geliked' }, { status: 400 });
    }

    // Like erstellen
    await prisma.like.create({
      data: {
        userId,
        postId
      }
    });

    // Anzahl der Likes abrufen
    const likeCount = await prisma.like.count({
      where: { postId }
    });

    return NextResponse.json({ success: true, likes: likeCount });
  } catch (error) {
    console.error('Fehler beim Liken des Beitrags:', error);
    return NextResponse.json({ error: 'Fehler beim Liken des Beitrags' }, { status: 500 });
  }
}

// DELETE /api/posts/[postId]/like - Like entfernen
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

    const { postId } = params;
    const userId = session.user.id;

    // Prüfen, ob der Beitrag existiert
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }

    // Like suchen
    const like = await prisma.like.findFirst({
      where: {
        userId,
        postId
      }
    });

    if (!like) {
      return NextResponse.json({ error: 'Like nicht gefunden' }, { status: 404 });
    }

    // Like löschen
    await prisma.like.delete({
      where: { id: like.id }
    });

    // Anzahl der Likes abrufen
    const likeCount = await prisma.like.count({
      where: { postId }
    });

    return NextResponse.json({ success: true, likes: likeCount });
  } catch (error) {
    console.error('Fehler beim Entfernen des Likes:', error);
    return NextResponse.json({ error: 'Fehler beim Entfernen des Likes' }, { status: 500 });
  }
}
