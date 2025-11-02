import { NextRequest, NextResponse } from 'next/server';

const cache = new Map<
  string,
  { buffer: Buffer; contentType: string; timestamp: number }
>();
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

async function fetchThumbnail(urls: string[]): Promise<Response> {
  for (const url of urls) {
    const response = await fetch(url);
    if (response.ok) return response;
  }
  throw new Error('Failed to fetch thumbnail from any endpoints');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const videoId = searchParams.get('v');
  const size = searchParams.get('s');

  if (!videoId) {
    return NextResponse.json(
      { error: 'Missing videoId parameter' },
      { status: 400 }
    );
  }

  const cachedImage = cache.get(videoId + size);
  const now = Date.now();

  if (cachedImage && now - cachedImage.timestamp < CACHE_DURATION) {
    return new NextResponse(new Uint8Array(cachedImage.buffer), {
      headers: {
        'Content-Type': cachedImage.contentType,
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    });
  }

  let youtubeThumbnailUrls = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/default.jpg`,
  ];

  switch (size) {
    case 'lg':
      youtubeThumbnailUrls = [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      ];
      break;
    case 'md':
      youtubeThumbnailUrls = [
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/default.jpg`,
      ];
      break;
    case 'sm':
      youtubeThumbnailUrls = [
        `https://img.youtube.com/vi/${videoId}/default.jpg`,
        `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      ];
      break;
  }

  try {
    const response = await fetchThumbnail(youtubeThumbnailUrls);
    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const imageBuffer = Buffer.from(await response.arrayBuffer());

    cache.set(videoId, { buffer: imageBuffer, contentType, timestamp: now });

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to fetch thumbnail', debug_for_dev: err },
      { status: 500 }
    );
  }
}
