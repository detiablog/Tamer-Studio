import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typedRoutes: true,

  poweredByHeader: false,

  compress: true,

  devIndicators: false,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;