import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/conversations - Alle Konversationen des Benutzers abrufen
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = session.user.id;

    // Hole alle Konversationen, an denen der Benutzer teilnimmt
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Zähle ungelesene Nachrichten für jede Konversation
    const conversationsWithUnreadCount = await Promise.all(
      conversations.map(async (conversation) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: {
              not: userId,
            },
            isRead: false,
          },
        });

        // Formatiere die Daten für die Antwort
        const formattedParticipants = conversation.participants.map((p) => ({
          id: p.user.id,
          username: p.user.username,
          image: p.user.image,
        }));

        const lastMessage = conversation.messages[0] || null;

        return {
          id: conversation.id,
          participants: formattedParticipants,
          lastMessage: lastMessage
            ? {
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
                isRead: lastMessage.isRead,
                senderId: lastMessage.senderId,
              }
            : undefined,
          unreadCount,
        };
      })
    );

    return NextResponse.json(conversationsWithUnreadCount);
  } catch (error) {
    console.error('Fehler beim Abrufen der Konversationen:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// POST /api/conversations - Neue Konversation erstellen
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = session.user.id;
    const { participantId } = await req.json();

    if (!participantId) {
      return NextResponse.json(
        { error: 'Teilnehmer-ID ist erforderlich' },
        { status: 400 }
      );
    }

    // Überprüfe, ob der Teilnehmer existiert
    const participant = await prisma.user.findUnique({
      where: {
        id: participantId,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Teilnehmer nicht gefunden' },
        { status: 404 }
      );
    }

    // Überprüfe, ob bereits eine Konversation zwischen den Benutzern existiert
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId,
              },
            },
          },
          {
            participants: {
              some: {
                userId: participantId,
              },
            },
          },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (existingConversation) {
      // Formatiere die Daten für die Antwort
      const formattedParticipants = existingConversation.participants.map((p) => ({
        id: p.user.id,
        username: p.user.username,
        image: p.user.image,
      }));

      return NextResponse.json({
        id: existingConversation.id,
        participants: formattedParticipants,
        unreadCount: 0,
      });
    }

    // Erstelle eine neue Konversation
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            {
              userId,
            },
            {
              userId: participantId,
            },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                image: true,
              },
            },
          },
        },
      },
    });

    // Formatiere die Daten für die Antwort
    const formattedParticipants = newConversation.participants.map((p) => ({
      id: p.user.id,
      username: p.user.username,
      image: p.user.image,
    }));

    return NextResponse.json({
      id: newConversation.id,
      participants: formattedParticipants,
      unreadCount: 0,
    });
  } catch (error) {
    console.error('Fehler beim Erstellen der Konversation:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
