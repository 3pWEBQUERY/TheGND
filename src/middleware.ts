import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Überprüfe, ob die Anfrage an /uploads geht
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    // Erstelle eine neue URL für die Datei im public Verzeichnis
    const url = request.nextUrl.clone();
    
    // Stelle sicher, dass die URL korrekt ist
    if (!url.pathname.startsWith('/uploads/')) {
      url.pathname = `/uploads${url.pathname}`;
    }
    
    // Leite die Anfrage an das public Verzeichnis weiter
    return NextResponse.rewrite(new URL(url.pathname, request.url));
  }

  return NextResponse.next();
}

// Konfiguriere die Middleware nur für /uploads Pfade
export const config = {
  matcher: '/uploads/:path*',
}; 