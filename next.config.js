/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['thegnd.io', 'localhost'],
    // Deaktiviere Bildoptimierung, um Probleme zu vermeiden
    unoptimized: true,
    // Erlaube externe Bilder
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thegnd.io',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
    ],
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
      // Statische Dateien umleiten
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ];
  },
  // Statische Dateien konfigurieren
  output: 'standalone',
  // Konfiguriere den Pfad für statische Dateien
  publicRuntimeConfig: {
    staticFolder: '/uploads',
  },
  // Konfiguriere die statischen Ordner
  experimental: {
    outputFileTracingRoot: process.cwd(),
    outputFileTracingIncludes: {
      '/': ['public/**/*'],
    },
  },
};

module.exports = nextConfig;
