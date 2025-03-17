import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/users/suggested - Profilvorschläge abrufen
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

    // Mock-Daten für Profilvorschläge
    // In einer realen Anwendung würden diese aus der Datenbank abgerufen werden
    const suggestedProfiles = [
      { id: '1', name: 'Julia Wagner', username: 'julia_photo', image: '/uploads/profile-images/6f2c09c7-bff7-4db5-9ac8-3f16f312a150-68747470733a2f2f692e6962622e636f2f6d3879564b66732f31332e6a7067.jpeg', isVerified: true, isFollowing: false },
      { id: '2', name: 'Berlin Models', username: 'berlin_models', image: '/uploads/profile-images/68813deb-e623-404e-976c-75a5578711ae-68747470733a2f2f692e6962622e636f2f6d3879564b66732f31332e6a7067.jpeg', isVerified: true, isFollowing: false },
      { id: '3', name: 'Fotostudio Kreuzberg', username: 'studio_xberg', image: null, isVerified: false, isFollowing: false },
      { id: '4', name: 'Modedesigner Berlin', username: 'mode_berlin', image: null, isVerified: true, isFollowing: false },
      { id: '5', name: 'Fotografie Hamburg', username: 'foto_hamburg', image: null, isVerified: false, isFollowing: false },
    ];

    // Begrenze die Anzahl der zurückgegebenen Profile
    const limitedProfiles = suggestedProfiles.slice(0, limit);

    return NextResponse.json(limitedProfiles);
  } catch (error) {
    console.error('Fehler beim Abrufen der Profilvorschläge:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Profilvorschläge' }, { status: 500 });
  }
}
