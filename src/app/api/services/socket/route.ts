import handshake from "@/lib/server-side-api/socketio"

export async function GET() {
  const isOk = await handshake()
  if (isOk)
    return Response.json(
      {
        message: "OK",
      },
      { status: 200 }
    )

  return Response.json(
    {
      message: "Service Unavailable",
    },
    { status: 503 }
  )
}
