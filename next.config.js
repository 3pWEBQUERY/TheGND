/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['thegnd.io'],
    // Deaktiviere Bildoptimierung, um Probleme zu vermeiden
    unoptimized: true,
  },
  // Basispfad für die Anwendung
  basePath: '',
  // API-Pfad für die Anwendung
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Statische Dateien konfigurieren
  output: 'standalone',
  // Konfiguriere den Pfad für statische Dateien
  publicRuntimeConfig: {
    staticFolder: '/uploads',
  },
};

module.exports = nextConfig;
