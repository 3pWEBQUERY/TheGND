import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    // Verhindert Build-Abbruch durch ESLint-Plugin-Probleme
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/escorts/:id-:slug",
        destination: "/escorts/:id/:slug",
      },
    ];
  },
};

export default nextConfig;
