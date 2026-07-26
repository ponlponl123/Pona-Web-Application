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

export function getAverageRGB(imgEl: HTMLImageElement): {
  r: number;
  g: number;
  b: number;
} {
  const blockSize = 5;
  const defaultRGB = { r: 0, g: 0, b: 0 };
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
    return defaultRGB;
  }

  const length: number = data.data.length;

  while ((i += blockSize * 4) < length) {
    ++count;
    rgb.r += data.data[i];
    rgb.g += data.data[i + 1];
    rgb.b += data.data[i + 2];
  }

  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);

  return rgb;
}

export function getAccentHEXColorFromUrl(url: string): Promise<{ hex: string }> {
  return new Promise((resolve) => {
    if (!url) resolve({ hex: '#18181b' });
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;

    img.onload = () => {
      const averageColor = getAverageRGB(img);
      resolve({ hex: rgbToHex(averageColor) });
    };

    img.onerror = () => {
      resolve({ hex: '#18181b' });
    };
  });
}
