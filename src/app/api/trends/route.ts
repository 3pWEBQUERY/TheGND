import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/trends - Trends abrufen
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

    // Mock-Daten für Trends
    // In einer realen Anwendung würden diese aus der Datenbank abgerufen werden
    const trendingTopics = [
      { id: '1', tag: 'photoshooting', posts: 1243 },
      { id: '2', tag: 'berlinmodels', posts: 856 },
      { id: '3', tag: 'fashionweek', posts: 742 },
      { id: '4', tag: 'portraitphotography', posts: 531 },
      { id: '5', tag: 'summerlook', posts: 423 },
      { id: '6', tag: 'berlinphotographer', posts: 387 },
      { id: '7', tag: 'modelsearch', posts: 352 },
      { id: '8', tag: 'naturephotography', posts: 298 },
      { id: '9', tag: 'studiolight', posts: 276 },
      { id: '10', tag: 'blackandwhite', posts: 245 },
    ];

    // Begrenze die Anzahl der zurückgegebenen Trends
    const limitedTrends = trendingTopics.slice(0, limit);

    return NextResponse.json(limitedTrends);
  } catch (error) {
    console.error('Fehler beim Abrufen der Trends:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Trends' }, { status: 500 });
  }
}
