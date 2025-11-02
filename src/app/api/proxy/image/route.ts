import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

const cache = new Map<
  string,
  { buffer: Buffer; contentType: string; timestamp: number }
>();
const CACHE_DURATION = 3600 * 1000; // 1 hour in milliseconds

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ref = searchParams.get('r')?.startsWith('/')
    ? req.nextUrl.origin + searchParams.get('r')
    : searchParams.get('r');
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
  } catch (urlError) {
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
    const response = await fetch(imageUrl.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.statusText}` },
        { status: response.status }
      );
    }

    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await response.arrayBuffer();
    let imageBuffer = Buffer.from(arrayBuffer);

    // Process image if any filter parameters are provided
    if (blur || size || brightness || contrast || saturation) {
      try {
        let image = sharp(imageBuffer);

        // Resize image if size parameter is provided (do this first for better performance)
        if (size) {
          const targetSize = parseInt(size, 10);
          if (!isNaN(targetSize) && targetSize > 0 && targetSize <= 4096) {
            image = image.resize(targetSize, null, {
              fit: 'inside',
              withoutEnlargement: true,
            });
          }
        }

        // Apply blur filter if requested (0.3-1000, recommended 1-10)
        if (blur) {
          const blurAmount = parseFloat(blur);
          if (!isNaN(blurAmount) && blurAmount > 0 && blurAmount <= 128) {
            // Sharp blur uses sigma: 0.3-1000
            image = image.blur(blurAmount);
          }
        }

        // Build modulate options for brightness, saturation, etc.
        const modulateOptions: { brightness?: number; saturation?: number } =
          {};

        // Apply brightness filter if requested (-100 to 100, where 0 is no change)
        if (brightness) {
          const brightnessValue = parseInt(brightness, 10);
          if (
            !isNaN(brightnessValue) &&
            brightnessValue >= -100 &&
            brightnessValue <= 100
          ) {
            // Sharp brightness uses multiplier: 0.5 = darker, 2.0 = brighter
            // Convert -100 to 100 range to 0 to 2 range
            modulateOptions.brightness = 1 + brightnessValue / 100;
          }
        }

        // Apply saturation filter if requested (-100 to 100, where 0 is no change)
        if (saturation) {
          const saturationValue = parseInt(saturation, 10);
          if (
            !isNaN(saturationValue) &&
            saturationValue >= -100 &&
            saturationValue <= 100
          ) {
            // Sharp saturation uses multiplier: 0 = grayscale, 1 = normal, >1 = more saturated
            // Convert -100 to 100 range to 0 to 2 range
            modulateOptions.saturation = 1 + saturationValue / 100;
          }
        }

        // Apply modulate if any options are set
        if (Object.keys(modulateOptions).length > 0) {
          image = image.modulate(modulateOptions);
        }

        // Apply contrast filter if requested (-100 to 100, where 0 is no change)
        if (contrast) {
          const contrastValue = parseInt(contrast, 10);
          if (
            !isNaN(contrastValue) &&
            contrastValue >= -100 &&
            contrastValue <= 100
          ) {
            // Sharp linear uses a + bx formula for contrast adjustment
            // Positive values increase contrast, negative decrease
            const factor = 1 + contrastValue / 100;
            const offset = 128 * (1 - factor);
            image = image.linear(factor, offset);
          }
        }

        // Determine output format based on content type
        let outputFormat: 'png' | 'jpeg' | 'webp' | 'gif' | 'tiff' | 'avif';
        if (contentType.includes('png')) {
          outputFormat = 'png';
        } else if (contentType.includes('webp')) {
          outputFormat = 'webp';
        } else if (contentType.includes('gif')) {
          outputFormat = 'gif';
        } else if (contentType.includes('tiff')) {
          outputFormat = 'tiff';
        } else if (contentType.includes('avif')) {
          outputFormat = 'avif';
        } else {
          outputFormat = 'jpeg';
        }

        // Convert to buffer with appropriate format
        imageBuffer = await image.toFormat(outputFormat).toBuffer();
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
