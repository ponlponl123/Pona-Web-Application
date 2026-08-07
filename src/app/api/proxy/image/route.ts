import { fetchWithSSLFallback } from "@/lib/ssl/fetch"
import { NextRequest, NextResponse } from "next/server"
import { LRUCache } from "lru-cache"
import {
  OutputOptions,
  ResizeOptions,
  transform,
  TransformOptions,
} from "imgkit"

interface CacheEntry {
  buffer: Buffer
  contentType: string
}

const cache = new LRUCache<string, CacheEntry>({
  max: 200,
  ttl: 3600 * 1000,
})

function resolveRelativeUrl(req: NextRequest, path: string): string {
  if (path.startsWith("//")) return `https:${path}`
  if (path.startsWith("http")) return path

  const protocol =
    req.headers.get("x-forwarded-proto")?.split(",")[0].trim() || "http"
  let host =
    req.headers.get("x-forwarded-host")?.split(",")[0].trim() ||
    req.headers.get("host")?.split(",")[0].trim() ||
    "localhost:3000"

  if (
    host.startsWith("0.0.0.0") ||
    host.includes("localhost") ||
    host.includes("127.")
  ) {
    const [, port] = host.split(":")
    host = `127.0.0.1${port ? `:${port}` : ""}`
    return `http://${host}${path}`
  }

  return `${protocol}://${host}${path}`
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const rawRef = searchParams.get("r")
  const size = searchParams.get("s")
  const blur = searchParams.get("blur")
  const brightness = searchParams.get("brightness")
  const contrast = searchParams.get("contrast")

  if (!rawRef) {
    return NextResponse.json(
      { error: "Missing ref parameter" },
      { status: 400 }
    )
  }

  if (blur && isNaN(parseFloat(blur))) {
    return NextResponse.json(
      { error: "Invalid blur parameter" },
      { status: 400 }
    )
  } else if (blur && (parseFloat(blur) < 0 || parseFloat(blur) > 100)) {
    return NextResponse.json(
      {
        error:
          "Blur parameter must be greater than or equal to 0 and less than or equal to 100",
      },
      { status: 400 }
    )
  }

  if (brightness && isNaN(parseInt(brightness, 10))) {
    return NextResponse.json(
      { error: "Invalid brightness parameter" },
      { status: 400 }
    )
  } else if (
    brightness &&
    (parseInt(brightness, 10) < 0 || parseInt(brightness, 10) > 100)
  ) {
    return NextResponse.json(
      {
        error:
          "Brightness parameter must be greater than or equal to 0 and less than or equal to 100",
      },
      { status: 400 }
    )
  }

  if (contrast && isNaN(parseInt(contrast, 10))) {
    return NextResponse.json(
      { error: "Invalid contrast parameter" },
      { status: 400 }
    )
  } else if (
    contrast &&
    (parseInt(contrast, 10) < 0 || parseInt(contrast, 10) > 100)
  ) {
    return NextResponse.json(
      {
        error:
          "Contrast parameter must be greater than or equal to 0 and less than or equal to 100",
      },
      { status: 400 }
    )
  }

  const ref = rawRef.startsWith("//")
    ? `https:${rawRef}`
    : rawRef.startsWith("/")
    ? resolveRelativeUrl(req, rawRef)
    : rawRef

  try {
    const imageUrl = new URL(ref)
    if (!["http:", "https:"].includes(imageUrl.protocol)) {
      throw new Error("Invalid protocol")
    }
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
  }

  const cacheKey = `${ref}|${size || "orig"}|${blur || "0"}|${brightness || "0"}|${contrast || "0"}`

  const cached = cache.get(cacheKey)
  if (cached) {
    return new NextResponse(cached.buffer as unknown as BodyInit, {
      headers: {
        "Content-Type": cached.contentType,
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
      },
    })
  }

  try {
    const response = await fetchWithSSLFallback(ref, {
      method: "GET",
      timeout: 15000,
      ignoreSSLErrors: process.env.NODE_ENV === "production",
    })

    if (!response.ok) {
      return NextResponse.redirect(ref, 302)
    }

    let contentType =
      response.headers.get("content-type") || "application/octet-stream"

    const arrayBuffer = await response.arrayBuffer()
    let imageBuffer = Buffer.from(arrayBuffer)

    if (size || blur || brightness || contrast) {
      const transformOptions: TransformOptions = {}

      if (size) {
        transformOptions.resize = {
          width: parseInt(size, 10),
          fit: "cover",
        } as ResizeOptions
      }
      if (blur) transformOptions.blur = parseFloat(blur)
      if (brightness) transformOptions.brightness = parseInt(brightness, 10)
      if (contrast) transformOptions.contrast = parseInt(contrast, 10)

      transformOptions.output = {
        format: "webp",
        webp: { quality: 80 },
      } as OutputOptions

      imageBuffer = Buffer.from(await transform(imageBuffer, transformOptions))

      contentType = "image/webp"
    }

    cache.set(cacheKey, { buffer: imageBuffer, contentType })

    return new NextResponse(imageBuffer as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
      },
    })
  } catch (err) {
    console.error("Image proxy error:", err)
    return NextResponse.redirect(ref, 302)
  }
}
