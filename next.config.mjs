import pkg from "./package.json" with { type: "json" }

const allowedServerActionOrigins = (
  process.env.NEXT_SERVER_ACTIONS_ALLOWED_ORIGINS ?? ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: allowedServerActionOrigins,
    },
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env["NEXT_PUBLIC_DISCORD_CLIENT_ID"],
    NEXT_PUBLIC_DISCORD_OWNER_ID: process.env["NEXT_PUBLIC_DISCORD_OWNER_ID"],
    NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT:
      process.env["NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT"],
  },
  cacheComponents: true,
  images: {
    localPatterns: [
      {
        pathname: '/api/proxy/image/**',
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "nextui.org",
      },
      {
        protocol: "https",
        hostname: "static.ponlponl123.com",
      },
    ],
  },
  async rewrites() {
    const host = process.env.PONA_APPLICATION_ENDPOINT_HOST
    const port = process.env.NEXT_PUBLIC_PONA_APPLICATION_WS_ENDPOINT_PORT
    return [
      {
        source: "/socket.io/:path*",
        destination: `http://${host}:${port}/socket.io//:path*`,
      },
    ]
  },
}

export default nextConfig
