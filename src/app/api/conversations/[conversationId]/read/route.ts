import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/conversations/[conversationId]/read - Nachrichten als gelesen markieren
export async function POST(
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

    // Markiere alle Nachrichten als gelesen, die nicht vom aktuellen Benutzer gesendet wurden
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: userId,
        },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // Aktualisiere den Zeitpunkt des letzten Lesens
    await prisma.conversationParticipant.update({
      where: {
        id: participant.id,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Markieren der Nachrichten als gelesen:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
