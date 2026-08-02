import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  reactStrictMode: true,

  typedRoutes: true,

  poweredByHeader: false,

  compress: true,

  devIndicators: false,

  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@dnd-kit/core", "@dnd-kit/sortable"],
  },

  serverExternalPackages: ["postgres", "redis", "@trigger.dev/sdk/v3", "nodemailer", "@sendgrid/mail", "@aws-sdk/client-ses", "mailgun.js", "resend", "postmark", "sparkpost", "@getbrevo/brevo"],

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
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24,
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
