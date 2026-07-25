import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  typedRoutes: true,

  poweredByHeader: false,

  compress: true,

  devIndicators: false,

  serverExternalPackages: ["postgres", "redis", "@trigger.dev/sdk/v3"],

  turbopack: {},

  typescript: {
    ignoreBuildErrors: true,
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        perf_hooks: false,
        stream: false,
        os: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        child_process: false,
      };

      config.plugins = [
        ...(config.plugins || []),
        new webpack.IgnorePlugin({
          resourceRegExp: /^(postgres|redis|@trigger\.dev\/sdk\/v3)$/,
        }),
      ];
    }
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
