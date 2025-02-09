import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("v");
  
  if (!videoId) {
      return NextResponse.json({ error: "Missing videoId parameter" }, { status: 400 });
  }

  const youtubeThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const youtubeThumbnailUrl_2 = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

  try {
    let response = await fetch(youtubeThumbnailUrl);
    if (!response.ok) {
      response = await fetch(youtubeThumbnailUrl_2);
      if (!response.ok) throw new Error("Failed to fetch thumbnail from any endpoints");
    }

    const contentType = response.headers.get("content-type");

    const imageBuffer = await response.arrayBuffer();
    return new NextResponse(Buffer.from(imageBuffer), {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Cache-Control": "s-maxage=86400, stale-while-revalidate"
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch thumbnail", debug_for_dev: err }, { status: 500 });
  }
}
