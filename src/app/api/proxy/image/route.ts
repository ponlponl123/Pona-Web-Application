import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { buffer: Buffer, contentType: string, timestamp: number }>();
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get("r");
  const size = searchParams.get("s");
  
  if (!ref) {
    return NextResponse.json({ error: "Missing ref parameter" }, { status: 400 });
  }

  const cachedImage = cache.get(ref+size);
  const now = Date.now();

  if (cachedImage && (now - cachedImage.timestamp < CACHE_DURATION)) {
    return new NextResponse(cachedImage.buffer, {
      headers: {
        "Content-Type": cachedImage.contentType,
        "Cache-Control": "s-maxage=86400, stale-while-revalidate"
      }
    });
  }

  try {
    const response = await fetch(ref);
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    cache.set(ref, { buffer: imageBuffer, contentType, timestamp: now });

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "s-maxage=86400, stale-while-revalidate"
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch image", debug_for_dev: err }, { status: 500 });
  }
}
