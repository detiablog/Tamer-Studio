import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typedRoutes: true,

  poweredByHeader: false,

  compress: true,

  devIndicators: false,

  serverExternalPackages: ["postgres", "redis", "@trigger.dev/sdk/v3"],

  turbopack: {
    resolveAlias: {
      webpack: "webpack",
    },
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config) => {
    return config;
  },

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
