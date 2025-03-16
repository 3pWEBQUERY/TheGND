/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
    // Deaktiviere Bildoptimierung, um Probleme zu vermeiden
    unoptimized: true,
  },
};

module.exports = nextConfig;
