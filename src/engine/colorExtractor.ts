/**
 * Fast Color Palette Extraction using Median Cut & Color Quantization
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToRgb(hex: string): RgbColor {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map(char => char + char).join('');
  }
  const num = parseInt(c, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Extracts top dominant and vibrant colors from an image source or canvas
 */
export async function extractPaletteFromImage(
  imageSource: HTMLImageElement | ImageBitmap | ImageData,
  colorCount: number = 5
): Promise<string[]> {
  let imageData: ImageData;

  if (imageSource instanceof ImageData) {
    imageData = imageSource;
  } else {
    // Create a temporary downsampled canvas (64x64) for ultra-fast color extraction
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#10b981'];

    canvas.width = 64;
    canvas.height = 64;
    ctx.drawImage(imageSource, 0, 0, 64, 64);
    imageData = ctx.getImageData(0, 0, 64, 64);
  }

  const data = imageData.data;
  const pixels: RgbColor[] = [];

  // Sample every 4th pixel for speed
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    // Ignore transparent or nearly transparent pixels
    if (a < 128) continue;

    // Filter out extreme pitch black or blown-out white unless they dominate
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness < 15 && Math.random() > 0.3) continue;
    if (brightness > 245 && Math.random() > 0.3) continue;

    pixels.push({ r, g, b });
  }

  if (pixels.length === 0) {
    return ['#8b5cf6', '#06b6d4', '#ec4899', '#f59e0b', '#3b82f6'];
  }

  // Quantization using Median-Cut approach
  const buckets = medianCut(pixels, colorCount);
  const hexColors = buckets.map(bucket => {
    const avg = averageColor(bucket);
    return rgbToHex(avg.r, avg.g, avg.b);
  });

  // Ensure unique colors
  const unique = Array.from(new Set(hexColors));
  while (unique.length < colorCount) {
    unique.push('#3b82f6');
  }

  return unique.slice(0, colorCount);
}

function averageColor(pixels: RgbColor[]): RgbColor {
  if (pixels.length === 0) return { r: 128, g: 128, b: 128 };
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < pixels.length; i++) {
    r += pixels[i].r;
    g += pixels[i].g;
    b += pixels[i].b;
  }
  return {
    r: Math.round(r / pixels.length),
    g: Math.round(g / pixels.length),
    b: Math.round(b / pixels.length),
  };
}

function medianCut(pixels: RgbColor[], targetBuckets: number): RgbColor[][] {
  let buckets: RgbColor[][] = [pixels];

  while (buckets.length < targetBuckets) {
    // Find bucket with highest variance / range
    let bestBucketIdx = -1;
    let maxRange = -1;
    let maxChannel: 'r' | 'g' | 'b' = 'r';

    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      if (bucket.length < 2) continue;

      let minR = 255, maxR = 0;
      let minG = 255, maxG = 0;
      let minB = 255, maxB = 0;

      for (let j = 0; j < bucket.length; j++) {
        const p = bucket[j];
        if (p.r < minR) minR = p.r;
        if (p.r > maxR) maxR = p.r;
        if (p.g < minG) minG = p.g;
        if (p.g > maxG) maxG = p.g;
        if (p.b < minB) minB = p.b;
        if (p.b > maxB) maxB = p.b;
      }

      const rangeR = maxR - minR;
      const rangeG = maxG - minG;
      const rangeB = maxB - minB;
      const currentMax = Math.max(rangeR, rangeG, rangeB);

      if (currentMax > maxRange) {
        maxRange = currentMax;
        bestBucketIdx = i;
        if (rangeR >= rangeG && rangeR >= rangeB) maxChannel = 'r';
        else if (rangeG >= rangeR && rangeG >= rangeB) maxChannel = 'g';
        else maxChannel = 'b';
      }
    }

    if (bestBucketIdx === -1 || maxRange <= 2) break;

    const bucketToSplit = buckets.splice(bestBucketIdx, 1)[0];
    bucketToSplit.sort((a, b) => a[maxChannel] - b[maxChannel]);
    const median = Math.floor(bucketToSplit.length / 2);

    buckets.push(bucketToSplit.slice(0, median));
    buckets.push(bucketToSplit.slice(median));
  }

  return buckets;
}
