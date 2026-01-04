import type { NextConfig } from "next";
import { version } from "./package.json";

// Import SSL configuration for server-side SSL handling
import "./src/utils/ssl-config";

// Handle SSL certificate issues in containerized environments
if (process.env.NODE_ENV === 'production' && process.env.NODE_TLS_REJECT_UNAUTHORIZED !== '0') {
  // In production, ensure we have proper SSL certificate handling
  // This helps with Docker container SSL issues while maintaining security
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
}

const nextConfig: NextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: version,
    NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env["NEXT_PUBLIC_DISCORD_CLIENT_ID"],
    NEXT_PUBLIC_DISCORD_OWNER_ID: process.env["NEXT_PUBLIC_DISCORD_OWNER_ID"],
    NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT: process.env["NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT"]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.discordapp.com',
      },
      {
        protocol: 'https',
        hostname: 'nextui.org',
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
  turbopack: {
    resolveAlias: {
      canvas: 'false',
    },
  },
  async rewrites() {
    const host = process.env.PONA_APPLICATION_ENDPOINT_HOST;
    const port = process.env.NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT_PORT;
    return [
      {
        source: '/socket.io/:path*',
        destination: `http://${host}:${port}/socket.io//:path*`
      }
    ]
  },
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;