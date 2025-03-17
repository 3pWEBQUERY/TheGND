/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
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
};

module.exports = nextConfig;
