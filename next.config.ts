import type { NextConfig } from "next";
import withPWA from "next-pwa";

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

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default withPWAConfig(nextConfig);
