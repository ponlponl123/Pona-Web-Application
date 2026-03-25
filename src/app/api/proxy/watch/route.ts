import { fetchWithSSLFallback } from "@/lib/ssl/fetch"
import { NextRequest, NextResponse } from "next/server"
import { LRUCache } from "lru-cache"

interface CacheEntry {
  data: Uint8Array
  contentType: string
  timestamp: number
}

const cache = new LRUCache<string, CacheEntry>({
  max: 500,
  ttl: 1000 * 60 * 60,
})

const sizes = ["lg", "md", "sm", "default", "max", "hq", "mq", "sd"]

function getYouTubeUrls(videoId: string, size: string | null): string[] {
  const base = {
    max: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    hq: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    mq: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    sd: `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    default: `https://i.ytimg.com/vi/${videoId}/default.jpg`,
  }

  if (size === "lg") return [base.max, base.hq, base.mq]
  if (size === "md") return [base.mq, base.sd, base.default]
  if (size === "sm") return [base.default, base.sd, base.mq]

  return Object.values(base)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const videoId = searchParams.get("v")
  const size = searchParams.get("s")

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 })
  }
  if (!sizes.includes(size || "default")) {
    return NextResponse.json({ error: "Invalid size" }, { status: 400 })
  }

  const cacheKey = `${videoId}:${size || "default"}`
  const cachedImage = cache.get(cacheKey)

  if (cachedImage) {
    return new NextResponse(cachedImage.data as unknown as BodyInit, {
      headers: {
        "Content-Type": cachedImage.contentType,
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
      },
    })
  }

  const urls = getYouTubeUrls(videoId, size)

  for (const url of urls) {
    try {
      const response = await fetchWithSSLFallback(url, {
        method: "GET",
        timeout: 8000,
        ignoreSSLErrors: true,
      })

      if (response.ok) {
        const contentType = response.headers.get("content-type") || "image/jpeg"

        const arrayBuffer = await response.arrayBuffer()
        const uint8Array = new Uint8Array(arrayBuffer)

        cache.set(cacheKey, {
          data: uint8Array,
          contentType: contentType,
          timestamp: Date.now(),
        })

        return new NextResponse(uint8Array, {
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
            "X-Cache-Hit": "false",
          },
        })
      }
    } catch (error) {
      console.warn(
        `[Thumbnail] Failed: ${url}`,
        error instanceof Error ? error.message : error
      )
    }
  }

  return NextResponse.json({ error: "All endpoints failed" }, { status: 502 })
}
