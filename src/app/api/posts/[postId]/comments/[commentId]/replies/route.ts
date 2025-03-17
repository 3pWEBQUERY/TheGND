import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

// GET /api/posts/[postId]/comments/[commentId]/replies - Antworten auf einen Kommentar abrufen
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

    const { postId, commentId } = params;
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

    // Prüfen, ob der Kommentar existiert
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) {
      return NextResponse.json({ error: 'Kommentar nicht gefunden' }, { status: 404 });
    }

    // Antworten abrufen
    const replies = await prisma.comment.findMany({
      where: {
        parentId: commentId
      },
      orderBy: {
        createdAt: 'asc'
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

    // Formatiere die Antworten für die Antwort
    const formattedReplies = replies.map((reply: any) => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      author: reply.author,
      media: reply.media.map((media: any) => ({
        id: media.id,
        url: media.url,
        type: media.type
      })),
      likes: reply._count.likes,
      replies: reply._count.replies,
      isLiked: reply.likes.length > 0,
      parentId: reply.parentId
    }));

    // Gesamtanzahl der Antworten für Pagination
    const totalReplies = await prisma.comment.count({
      where: {
        parentId: commentId
      }
    });

    return NextResponse.json({
      comments: formattedReplies,
      pagination: {
        total: totalReplies,
        pages: Math.ceil(totalReplies / limit),
        page,
        limit
      }
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Antworten:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Antworten' }, { status: 500 });
  }
}
