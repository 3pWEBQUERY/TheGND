import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// POST /api/messages - Neue Nachricht senden
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    const userId = session.user.id;
    const { conversationId, content } = await req.json();

    if (!conversationId || !content.trim()) {
      return NextResponse.json(
        { error: 'Konversations-ID und Inhalt sind erforderlich' },
        { status: 400 }
      );
    }

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

    // Erstelle eine neue Nachricht
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId: userId,
        conversationId,
      },
    });

    // Aktualisiere den Zeitpunkt der letzten Aktualisierung der Konversation
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    // Aktualisiere den Zeitpunkt des letzten Lesens für den Sender
    await prisma.conversationParticipant.update({
      where: {
        id: participant.id,
      },
      data: {
        lastReadAt: new Date(),
      },
    });

    return NextResponse.json({
      id: newMessage.id,
      content: newMessage.content,
      createdAt: newMessage.createdAt,
      senderId: newMessage.senderId,
      isRead: newMessage.isRead,
    });
  } catch (error) {
    console.error('Fehler beim Senden der Nachricht:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}
