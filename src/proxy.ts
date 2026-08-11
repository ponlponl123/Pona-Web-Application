import { NextRequest, NextResponse } from "next/server"

const allowedOrigins = [
  "https://pona.ponlponl123.com"
]

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const origin = req.headers.get("origin")
  const isDev = process.env.NODE_ENV !== "production"

  if (
    origin &&
    (isDev || allowedOrigins.includes(origin))
  ) {
    res.headers.set("Access-Control-Allow-Origin", origin)
  }

  res.headers.set("Access-Control-Allow-Credentials", "true")
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET,DELETE,PATCH,POST,PUT,OPTIONS"
  )
  res.headers.set(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  )

  if (req.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: res.headers })
  }

  return res
}

export const config = {
  matcher: "/api/:path*",
}
