import { intToRGBA, Jimp, rgbaToInt } from 'jimp';
import { kmeans } from 'ml-kmeans';

export function numberToHexColor(number: number): string {
  return `#${number.toString(16).padStart(6, '0')}`;
}

export function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

export function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  return `#${((1 << 24) + (rgb.r << 16) + (rgb.g << 8) + rgb.b).toString(16).slice(1)}`;
}

export function hexToHSL(
  hex: string
): { h: number; s: number; l: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }

  let r = parseInt(result[1], 16);
  let g = parseInt(result[2], 16);
  let b = parseInt(result[3], 16);

  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0,
    s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h, s, l };
}

export function getAverageRGB(imgEl: HTMLImageElement): {
  r: number;
  g: number;
  b: number;
} {
  const blockSize = 5; // only visit every 5 pixels
  const defaultRGB = { r: 0, g: 0, b: 0 }; // for non-supporting envs
  const canvas = document.createElement('canvas');
  const context = canvas.getContext && canvas.getContext('2d');
  let data: ImageData;
  let i = -4;
  const rgb = { r: 0, g: 0, b: 0 };
  let count = 0;

  if (!context) {
    return defaultRGB;
  }

  const height: number = (canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height);
  const width: number = (canvas.width =
    imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width);

  context.drawImage(imgEl, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch {
    // security error, img on diff domain
    return defaultRGB;
  }

  const length: number = data.data.length;

  while ((i += blockSize * 4) < length) {
    ++count;
    rgb.r += data.data[i];
    rgb.g += data.data[i + 1];
    rgb.b += data.data[i + 2];
  }

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);

  return rgb;
}

export function getAccentHEXColorFromUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Avoid CORS issues
    img.src = url;

    img.onload = () => {
      const averageColor = getAverageRGB(img);
      resolve(rgbToHex(averageColor));
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
  });
}

export async function getAccentHEXColor(image: string): Promise<string> {
  const buffer = Buffer.from(image, 'base64');
  const img = await Jimp.fromBuffer(buffer);

  const width = img.bitmap.width;
  const height = img.bitmap.height;
  const pixels: number[][] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = intToRGBA(img.getPixelColor(x, y));
      pixels.push([pixel.r, pixel.g, pixel.b]);
    }
  }

  const kmeansResult = kmeans(pixels, 5, {
    initialization: 'kmeans++',
    maxIterations: 100,
    tolerance: 1e-4,
  });
  const clusters = kmeansResult.centroids;

  const accentColor = clusters[0].map(Math.round);
  const hexColor = rgbaToInt(
    accentColor[0],
    accentColor[1],
    accentColor[2],
    255
  )
    .toString(16)
    .slice(1)
    .toUpperCase();

  return `#${hexColor}`;
}

export async function getAverageRGBColor(
  base64: string
): Promise<{ r: number; g: number; b: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Avoid CORS issues
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      for (let i = 0; i < data.length; i += 4) {
        r += data[i]; // Red
        g += data[i + 1]; // Green
        b += data[i + 2]; // Blue
        count++;
      }

      resolve({
        r: Math.floor(r / count),
        g: Math.floor(g / count),
        b: Math.floor(b / count),
      });
    };

    img.onerror = err => reject(err);
  });
}
