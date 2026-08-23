import { NextRequest, NextResponse } from "next/server"
import { readFile, access } from "node:fs/promises"
import path from "node:path"

/**
 * Next.js API Route Handler for fetching specific patch note file.
 * Refactored to standard Node.js runtime (fs/promises) for universal compatibility.
 */
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ tag: string; version: string }> }
): Promise<NextResponse> {
  const { tag, version } = await params

  if (!tag || !version) {
    return NextResponse.json(
      { message: "BAD_REQUEST: Missing parameters" },
      { status: 400 }
    )
  }

  // Sanitize path parameters to prevent directory traversal
  const safeTag = path.basename(tag)
  const baseVersion = path.basename(version)
  const safeVersion = baseVersion.endsWith(".md") ? baseVersion : `${baseVersion}.md`
  const filePath = path.join(process.cwd(), "docs", "patches", safeTag, safeVersion)

  try {
    await access(filePath)
    const content = await readFile(filePath, "utf-8")

    return new NextResponse(content, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    })
  } catch {
    return NextResponse.json(
      { message: "NOT_FOUND: Patch note not found" },
      { status: 404 }
    )
  }
}

