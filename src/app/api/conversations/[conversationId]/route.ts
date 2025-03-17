import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/conversations/[conversationId] - Eine bestimmte Konversation mit Nachrichten abrufen
export async function GET(
  req: NextRequest,
  context: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = session.user.id;
    const { conversationId } = context.params;

    // Überprüfe, ob der Benutzer Zugriff auf die Konversation hat
    const participant = await prisma.conversationParticipant.findFirst({
      where: {
        conversationId,
        userId,
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Konversation nicht gefunden' },
        { status: 404 }
      );
    }

    // Hole die Konversation mit Teilnehmern und Nachrichten
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
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
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json(
        { error: 'Konversation nicht gefunden' },
        { status: 404 }
      );
    }

    // Formatiere die Daten für die Antwort
    const formattedParticipants = conversation.participants.map((p) => ({
      id: p.user.id,
      username: p.user.username,
      image: p.user.image,
    }));

    const formattedMessages = conversation.messages.map((message) => ({
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      senderId: message.senderId,
      isRead: message.isRead,
    }));

    return NextResponse.json({
      id: conversation.id,
      participants: formattedParticipants,
      messages: formattedMessages,
    });
  } catch (error) {
    console.error('Fehler beim Abrufen der Konversation:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
