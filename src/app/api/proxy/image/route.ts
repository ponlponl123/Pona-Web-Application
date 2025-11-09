import { fetchWithSSLFallback } from '@/utils/fetchWithSSLFallback';
import { processImageBuffer } from '@/utils/image-processor';
import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'node:buffer';

const cache = new Map<
  string,
  { buffer: Buffer; contentType: string; timestamp: number }
>();
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

function resolveRelativeUrl(req: NextRequest, path: string): string {
  const forwardedProto = req.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    .trim();
  const forwardedHost = req.headers
    .get('x-forwarded-host')
    ?.split(',')[0]
    .trim();

  const headerHost = req.headers.get('host')?.split(',')[0].trim();

  let host = forwardedHost || headerHost || req.nextUrl.host;
  let protocol = forwardedProto || req.nextUrl.protocol.replace(':', '');

  if (!host) {
    host = '127.0.0.1:3000';
  }

  if (host.startsWith('0.0.0.0')) {
    const [, port] = host.split(':');
    host = `127.0.0.1${port ? `:${port}` : ''}`;
  }

  const loopbackHosts = ['127.', 'localhost'];
  if (loopbackHosts.some(prefix => host.startsWith(prefix))) {
    protocol = 'http';
  }

  return `${protocol}://${host}${path}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawRef = searchParams.get('r');
  const ref = rawRef?.startsWith('/')
    ? resolveRelativeUrl(req, rawRef)
    : rawRef;
  const size = searchParams.get('s');
  const blur = searchParams.get('blur');
  const brightness = searchParams.get('brightness');
  const contrast = searchParams.get('contrast');
  const saturation = searchParams.get('saturation');

  if (!ref) {
    return NextResponse.json(
      { error: 'Missing ref parameter' },
      { status: 400 }
    );
  }

  // Validate that ref is a valid URL
  let imageUrl: URL;
  try {
    imageUrl = new URL(ref);
    // Only allow http and https protocols for security
    if (!['http:', 'https:'].includes(imageUrl.protocol)) {
      return NextResponse.json(
        { error: 'Invalid URL protocol. Only http and https are allowed.' },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      {
        error: 'Invalid URL format',
        details: 'The ref parameter must be a valid HTTP/HTTPS URL',
        received: ref,
      },
      { status: 400 }
    );
  }

  // Create consistent cache key using all parameters
  const cacheKey = `${ref}|${size || 'original'}|${blur || 'none'}|${brightness || 'none'}|${contrast || 'none'}|${saturation || 'none'}`;
  const cachedImage = cache.get(cacheKey);
  const now = Date.now();

  if (cachedImage && now - cachedImage.timestamp < CACHE_DURATION) {
    return new NextResponse(new Uint8Array(cachedImage.buffer), {
      headers: {
        'Content-Type': cachedImage.contentType,
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    });
  }

  try {
    // Use the utility function to handle SSL certificate issues automatically
    const response = await fetchWithSSLFallback(imageUrl.toString(), {
      method: 'GET',
      timeout: 15000,
      ignoreSSLErrors: process.env.NODE_ENV === 'production', // Allow SSL relaxation in production for trusted domains
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    let imageBuffer: Buffer = Buffer.from(arrayBuffer);

    // Process image if any filter parameters are provided
    if (blur || size || brightness || contrast || saturation) {
      try {
        const processedBuffer = await processImageBuffer(
          imageBuffer,
          {
            size: size ? parseInt(size, 10) : undefined,
            blur: blur ? parseFloat(blur) : undefined,
            brightness: brightness ? parseInt(brightness, 10) : undefined,
            contrast: contrast ? parseInt(contrast, 10) : undefined,
            saturation: saturation ? parseInt(saturation, 10) : undefined,
          },
          contentType
        );
        imageBuffer = processedBuffer as Buffer;
      } catch (imageProcessError) {
        console.error('Image processing error:', imageProcessError);
        // If image processing fails, return original image
      }
    }

    // Cache the processed image with the correct cache key
    cache.set(cacheKey, { buffer: imageBuffer, contentType, timestamp: now });

    // Periodically clean up old cache entries
    if (cache.size > 100) {
      const entriesToDelete: string[] = [];
      cache.forEach((value, key) => {
        if (now - value.timestamp > CACHE_DURATION) {
          entriesToDelete.push(key);
        }
      });
      entriesToDelete.forEach(key => cache.delete(key));
    }

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 's-maxage=86400, stale-while-revalidate',
      },
    });
  } catch (err) {
    console.error('Image proxy error:', err);
    return NextResponse.json(
      {
        error: 'Failed to fetch image',
        details: err instanceof Error ? err.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
