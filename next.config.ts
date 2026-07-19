import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  experimental: {
    typedRoutes: true
  },

  images: {
    remotePatterns: [
      // Cloudflare R2
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com"
      },

      // Public CDN (akan disesuaikan nanti)
      {
        protocol: "https",
        hostname: "**"
      }
    ]
  },

  poweredByHeader: false,

  compress: true
};

export default nextConfig;