/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['thegnd.io', 'localhost', 'ixqhqgvgxnpxfbvxnzxl.blob.vercel-storage.com'],
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
      {
        protocol: 'https',
        hostname: '*.blob.vercel-storage.com', // Erlaube Vercel Blob Domains
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
  // Middleware für statische Dateien und API-Routen
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
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
