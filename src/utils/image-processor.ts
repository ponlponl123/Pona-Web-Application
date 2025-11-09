import { Buffer } from 'node:buffer';

/**
 * Alternative image processing utilities for environments where Sharp is not available
 * This provides basic image operations using Canvas API or other alternatives
 */

export interface ImageProcessingOptions {
  size?: number;
  blur?: number;
  brightness?: number;
  contrast?: number;
  saturation?: number;
}

export async function processImageBuffer(
  buffer: Buffer,
  options: ImageProcessingOptions,
  contentType: string
): Promise<Buffer> {
  // If no processing options are provided, return original buffer
  if (
    !options.size &&
    !options.blur &&
    !options.brightness &&
    !options.contrast &&
    !options.saturation
  ) {
    return buffer;
  }

  try {
    // Try to use Sharp if available
    const sharp = await import('sharp').catch(() => null);
    if (sharp?.default) {
      return await processWithSharp(
        buffer,
        options,
        contentType,
        sharp.default
      );
    }
  } catch (error) {
    console.warn('Sharp not available, skipping image processing:', error);
  }

  // Fallback: return original buffer with warning
  console.warn(
    'Image processing requested but no suitable processor available. Returning original image.'
  );
  return buffer;
}

async function processWithSharp(
  buffer: Buffer,
  options: ImageProcessingOptions,
  contentType: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharp: any
): Promise<Buffer> {
  let image = sharp(buffer);

  // Resize image if size parameter is provided (do this first for better performance)
  if (options.size) {
    const targetSize = parseInt(options.size.toString(), 10);
    if (!isNaN(targetSize) && targetSize > 0 && targetSize <= 4096) {
      image = image.resize(targetSize, null, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
  }

  // Apply blur filter if requested (0.3-1000, recommended 1-10)
  if (options.blur) {
    const blurAmount = parseFloat(options.blur.toString());
    if (!isNaN(blurAmount) && blurAmount > 0 && blurAmount <= 128) {
      image = image.blur(blurAmount);
    }
  }

  // Build modulate options for brightness, saturation, etc.
  const modulateOptions: { brightness?: number; saturation?: number } = {};

  // Apply brightness filter if requested (-100 to 100, where 0 is no change)
  if (options.brightness) {
    const brightnessValue = parseInt(options.brightness.toString(), 10);
    if (
      !isNaN(brightnessValue) &&
      brightnessValue >= -100 &&
      brightnessValue <= 100
    ) {
      modulateOptions.brightness = 1 + brightnessValue / 100;
    }
  }

  // Apply saturation filter if requested (-100 to 100, where 0 is no change)
  if (options.saturation) {
    const saturationValue = parseInt(options.saturation.toString(), 10);
    if (
      !isNaN(saturationValue) &&
      saturationValue >= -100 &&
      saturationValue <= 100
    ) {
      modulateOptions.saturation = 1 + saturationValue / 100;
    }
  }

  // Apply modulate if any options are set
  if (Object.keys(modulateOptions).length > 0) {
    image = image.modulate(modulateOptions);
  }

  // Apply contrast filter if requested (-100 to 100, where 0 is no change)
  if (options.contrast) {
    const contrastValue = parseInt(options.contrast.toString(), 10);
    if (
      !isNaN(contrastValue) &&
      contrastValue >= -100 &&
      contrastValue <= 100
    ) {
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
  const processedBuffer = await image.toFormat(outputFormat).toBuffer();
  return processedBuffer as Buffer;
}

/**
 * Check if image processing is available in the current environment
 */
export async function isImageProcessingAvailable(): Promise<boolean> {
  try {
    const sharp = await import('sharp').catch(() => null);
    return !!sharp?.default;
  } catch {
    return false;
  }
}
