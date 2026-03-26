import { NextRequest } from "next/server"

const PATCH_NOTES_PATH = "./docs/patches"

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ tag: string; version: string }> }
) {
  const { tag, version } = await params

  if (!tag || !version) {
    return Response.json(
      { message: "BAD_REQUEST: Missing parameters" },
      { status: 400 }
    )
  }

  const filePath = `${PATCH_NOTES_PATH}/${tag}/${version}`
  const file = Bun.file(filePath)

  if (!(await file.exists())) {
    return Response.json(
      { message: `NOT_FOUND: Patch note not found` },
      { status: 404 }
    )
  }

  return new Response(file, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
    status: 200,
  })
}
