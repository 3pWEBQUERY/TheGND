import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/posts/[postId]/comments - Kommentare zu einem Beitrag abrufen
export async function GET(
  request: NextRequest,
  context: { params: { postId: string } }
) {
  const { params } = context;
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const { postId } = params;
    const userId = session.user.id;

    // URL-Parameter abrufen
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Prüfen, ob der Beitrag existiert
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }

    // Kommentare abrufen
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentId: null // Nur Top-Level-Kommentare
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit,
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
            replies: true
          }
        },
        likes: {
          where: {
            userId
          },
          take: 1
        }
      }
    });

    // Formatiere die Kommentare für die Antwort
    const formattedComments = comments.map((comment: any) => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.author,
      media: comment.media.map((media: any) => ({
        id: media.id,
        url: media.url,
        type: media.type
      })),
      likes: comment._count.likes,
      replies: comment._count.replies,
      isLiked: comment.likes.length > 0
    }));

    // Gesamtanzahl der Kommentare für Pagination
    const totalComments = await prisma.comment.count({
      where: {
        postId,
        parentId: null
      }
    });

    return NextResponse.json({
      comments: formattedComments,
      pagination: {
        total: totalComments,
        pages: Math.ceil(totalComments / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Kommentare:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Kommentare' }, { status: 500 });
  }
}

// POST /api/posts/[postId]/comments - Neuen Kommentar erstellen
export async function POST(
  request: NextRequest,
  context: { params: { postId: string } }
) {
  const { params } = context;
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const { postId } = params;
    const userId = session.user.id;

    // Anfragedaten abrufen
    const data = await request.json();
    const { content, mediaIds = [], parentId = null } = data;

    if (!content && mediaIds.length === 0) {
      return NextResponse.json({ error: 'Kommentar muss Text oder Medien enthalten' }, { status: 400 });
    }

    // Prüfen, ob der Beitrag existiert
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return NextResponse.json({ error: 'Beitrag nicht gefunden' }, { status: 404 });
    }

    // Wenn es sich um eine Antwort handelt, prüfen, ob der übergeordnete Kommentar existiert
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId }
      });

      if (!parentComment) {
        return NextResponse.json({ error: 'Übergeordneter Kommentar nicht gefunden' }, { status: 404 });
      }
    }

    // Kommentar erstellen
    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: userId,
        postId,
        parentId,
        media: {
          connect: mediaIds.map((id: string) => ({ id }))
        }
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
        media: true
      }
    });

    return NextResponse.json({
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      author: comment.author,
      media: comment.media.map((media: any) => ({
        id: media.id,
        url: media.url,
        type: media.type
      })),
      likes: 0,
      replies: 0,
      isLiked: false
    });
  } catch (error) {
    console.error('Fehler beim Erstellen des Kommentars:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des Kommentars' }, { status: 500 });
  }
}
