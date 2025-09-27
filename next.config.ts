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
      // Locale prefix rewrites: map /:locale/... to non-localized routes
      {
        source: "/:locale(de|en|fr|it|es|pt|nl|pl|cs|hu|ro)",
        destination: "/",
      },
      {
        source: "/:locale(de|en|fr|it|es|pt|nl|pl|cs|hu|ro)/:path*",
        destination: "/:path*",
      },
      // Existing rewrite: escorts pretty slug
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
