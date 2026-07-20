import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typedRoutes: true,

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

  poweredByHeader: false,

  compress: true,
};

export default nextConfig;
