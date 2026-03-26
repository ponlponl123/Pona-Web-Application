export async function GET() {
  return Response.json(
    {
      message: "BAD_REQUEST: Missing patch note tag",
    },
    { status: 400 }
  )
}
