export async function GET() {
  return Response.json(
    {
      message: "BAD_REQUEST: Missing patch note version",
    },
    { status: 400 }
  )
}
