import handshake from "@/lib/server-side-api/socketio"
import { NextResponse } from "next/server"

export async function GET(): Promise<NextResponse> {
  const isOk = await handshake()
  if (isOk) {
    return NextResponse.json(
      {
        message: "OK",
      },
      { status: 200 }
    )
  }

  return NextResponse.json(
    {
      message: "Service Unavailable",
    },
    { status: 503 }
  )
}

