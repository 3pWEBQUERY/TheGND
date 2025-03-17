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
        hostname: '**', // Erlaube alle Domains
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '**', // Erlaube alle Domains
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
  // Middleware für statische Dateien
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
