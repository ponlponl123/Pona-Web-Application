export async function GET() {
  return Response.json({
    message: 'Hello, World!'
  }, {status: 200})
}