import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/posts/[postId] - Einzelnen Beitrag abrufen
export async function GET(
  request: NextRequest,
  { params }: any
) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const { postId } = params;
    const userId = session.user.id;

    // Beitrag abrufen
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        media: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        },
        likes: {
          where: {
            userId
          },
          take: 1
        },
        saves: {
          where: {
            userId
          },
          take: 1
        }
      }
    });

    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }

    // Formatiere den Beitrag für die Antwort
    const formattedPost = {
      id: post.id,
      content: post.content,
      createdAt: post.createdAt,
      author: post.author,
      media: post.media.map(media => ({
        id: media.id,
        url: media.url,
        type: media.type
      })),
      likes: post._count.likes,
      comments: post._count.comments,
      isLiked: post.likes.length > 0,
      isSaved: post.saves.length > 0
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Fehler beim Abrufen des Beitrags:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen des Beitrags' }, { status: 500 });
  }
}

// PUT /api/posts/[postId] - Beitrag bearbeiten
export async function PUT(
  request: NextRequest,
  { params }: any
) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = session.user.id;
    const { postId } = params;

    // Anfragedaten abrufen
    const data = await request.json();
    const { content } = data;

    if (!content) {
      return NextResponse.json({ error: 'Inhalt darf nicht leer sein' }, { status: 400 });
    }

    // Prüfen, ob der Beitrag existiert und dem Benutzer gehört
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }

    if (post.authorId !== userId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    // Hashtags aus dem Inhalt extrahieren
    const hashtags = content.match(/#(\w+)/g) || [];
    const tagNames = hashtags.map((tag: string) => tag.substring(1).toLowerCase());

    // Beitrag aktualisieren
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true
          }
        },
        media: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        },
        likes: {
          where: {
            userId
          },
          take: 1
        },
        saves: {
          where: {
            userId
          },
          take: 1
        }
      }
    });

    // Bestehende Tags entfernen
    await prisma.postTag.deleteMany({
      where: { postId }
    });

    // Neue Tags erstellen oder verknüpfen
    if (tagNames.length > 0) {
      for (const name of tagNames) {
        const tag = await prisma.tag.upsert({
          where: { name },
          update: {},
          create: { name }
        });

        await prisma.postTag.create({
          data: {
            postId,
            tagId: tag.id
          }
        });
      }
    }

    // Formatiere den Beitrag für die Antwort
    const formattedPost = {
      id: updatedPost.id,
      content: updatedPost.content,
      createdAt: updatedPost.createdAt,
      author: updatedPost.author,
      media: updatedPost.media.map(media => ({
        id: media.id,
        url: media.url,
        type: media.type
      })),
      likes: updatedPost._count.likes,
      comments: updatedPost._count.comments,
      isLiked: updatedPost.likes.length > 0,
      isSaved: updatedPost.saves.length > 0
    };

    return NextResponse.json(formattedPost);
  } catch (error) {
    console.error('Fehler beim Bearbeiten des Beitrags:', error);
    return NextResponse.json({ error: 'Fehler beim Bearbeiten des Beitrags' }, { status: 500 });
  }
}

// DELETE /api/posts/[postId] - Beitrag löschen
export async function DELETE(
  request: NextRequest,
  { params }: any
) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = session.user.id;
    const { postId } = params;

    // Prüfen, ob der Beitrag existiert und dem Benutzer gehört
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true }
    });

    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }

    if (post.authorId !== userId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 403 });
    }

    // Beitrag löschen
    await prisma.post.delete({
      where: { id: postId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen des Beitrags:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen des Beitrags' }, { status: 500 });
  }
}
