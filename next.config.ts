import type { NextConfig } from "next";
import { version } from "./package.json";

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
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
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