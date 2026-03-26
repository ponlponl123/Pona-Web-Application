import pkg from "./package.json" with { type: "json" }

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env["NEXT_PUBLIC_DISCORD_CLIENT_ID"],
    NEXT_PUBLIC_DISCORD_OWNER_ID: process.env["NEXT_PUBLIC_DISCORD_OWNER_ID"],
    NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT:
      process.env["NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "nextui.org",
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
