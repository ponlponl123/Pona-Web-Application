import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
    const host = process.env.PONA_APPLICATION_ENDPOINT;
    const port = process.env.PONA_APPLICATION_ENDPOINT_PORT;
    return [
      {
        source: '/socket.io/:path*',
        destination: `${host}:${port}/socket.io//:path*`
      }
    ]
  },
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig;