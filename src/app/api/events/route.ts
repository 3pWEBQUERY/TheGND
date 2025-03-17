import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/events - Events abrufen
export async function GET(request: NextRequest) {
  try {
    // Authentifizierung prüfen
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 });
    }

    // URL-Parameter abrufen
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    // Mock-Daten für Events
    // In einer realen Anwendung würden diese aus der Datenbank abgerufen werden
    const upcomingEvents = [
      { 
        id: '1', 
        title: 'Berlin Fashion Week', 
        date: new Date(2025, 3, 5), 
        location: 'Berlin',
        image: '/hero/hero-bg-5.jpg'
      },
      { 
        id: '2', 
        title: 'Fotografie Workshop', 
        date: new Date(2025, 3, 12), 
        location: 'Hamburg',
        image: '/hero/hero-bg-6.jpg'
      },
      { 
        id: '3', 
        title: 'Model Casting', 
        date: new Date(2025, 3, 18), 
        location: 'München',
        image: '/hero/hero-bg-7.jpg'
      },
      { 
        id: '4', 
        title: 'Fotostudio Open Day', 
        date: new Date(2025, 3, 25), 
        location: 'Berlin',
        image: '/hero/hero-bg-1.jpg'
      },
      { 
        id: '5', 
        title: 'Portrait Masterclass', 
        date: new Date(2025, 4, 2), 
        location: 'Köln',
        image: '/hero/hero-bg-2.jpg'
      },
    ];

    // Begrenze die Anzahl der zurückgegebenen Events
    const limitedEvents = upcomingEvents.slice(0, limit);

    return NextResponse.json(limitedEvents);
  } catch (error) {
    console.error('Fehler beim Abrufen der Events:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Events' }, { status: 500 });
  }
}
