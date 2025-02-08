import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get("v");
  
  if (!videoId) {
      return NextResponse.json({ error: "Missing videoId parameter" }, { status: 400 });
  }

  const youtubeThumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  try {
    const response = await fetch(youtubeThumbnailUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch thumbnail from both endpoints");
    }

    return NextResponse.json({ endpoint: response.url }, { status: 200 });
    
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch thumbnail", debug_for_dev: err }, { status: 500 });
  }
}
