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

export interface ImageGradientData {
  palette: string[]; // 5-6 dominant vibrant colors
  quadrants: [string, string, string, string]; // Top-left, top-right, bottom-right, bottom-left
  highlight: string;
  shadow: string;
  linearStops: { id: string; color: string; position: number }[];
  radialStops: { id: string; color: string; position: number }[];
  conicStops: { id: string; color: string; position: number }[];
  duotoneStops: { id: string; color: string; position: number }[];
  softStops: { id: string; color: string; position: number }[];
}

/**
 * Extracts comprehensive gradient data from an image including 4-quadrant corner colors
 * for mesh gradients and dominant tones for linear/radial/conic gradients.
 */
export async function extractImageToGradientData(
  imageSource: HTMLImageElement | ImageBitmap | ImageData
): Promise<ImageGradientData> {
  let imageData: ImageData;

  if (imageSource instanceof ImageData) {
    imageData = imageSource;
  } else {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return {
        palette: ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00', '#00f0ff', '#10b981'],
        quadrants: ['#00d2ff', '#9d00ff', '#ff7a00', '#ff007f'],
        highlight: '#00f0ff',
        shadow: '#1a0b2e',
        linearStops: [
          { id: '1', color: '#00d2ff', position: 0 },
          { id: '2', color: '#9d00ff', position: 50 },
          { id: '3', color: '#ff007f', position: 100 },
        ],
        radialStops: [
          { id: '1', color: '#00f0ff', position: 0 },
          { id: '2', color: '#9d00ff', position: 55 },
          { id: '3', color: '#1a0b2e', position: 100 },
        ],
        conicStops: [
          { id: '1', color: '#00d2ff', position: 0 },
          { id: '2', color: '#9d00ff', position: 33 },
          { id: '3', color: '#ff007f', position: 66 },
          { id: '4', color: '#00d2ff', position: 100 },
        ],
        duotoneStops: [
          { id: '1', color: '#1a0b2e', position: 0 },
          { id: '2', color: '#00f0ff', position: 100 },
        ],
        softStops: [
          { id: '1', color: '#38bdf8', position: 0 },
          { id: '2', color: '#c084fc', position: 50 },
          { id: '3', color: '#f472b6', position: 100 },
        ],
      };
    }

    canvas.width = 64;
    canvas.height = 64;
    ctx.drawImage(imageSource, 0, 0, 64, 64);
    imageData = ctx.getImageData(0, 0, 64, 64);
  }

  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;

  // 1. Calculate Quadrant Averages (Top-Left, Top-Right, Bottom-Right, Bottom-Left)
  const quadPixels: [RgbColor[], RgbColor[], RgbColor[], RgbColor[]] = [[], [], [], []];
  const allPixels: RgbColor[] = [];

  const midX = w / 2;
  const midY = h / 2;

  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const idx = (y * w + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      if (a < 120) continue;

      const px: RgbColor = { r, g, b };
      allPixels.push(px);

      if (x < midX && y < midY) quadPixels[0].push(px); // Top-Left
      else if (x >= midX && y < midY) quadPixels[1].push(px); // Top-Right
      else if (x >= midX && y >= midY) quadPixels[2].push(px); // Bottom-Right
      else quadPixels[3].push(px); // Bottom-Left
    }
  }

  const qColors: [string, string, string, string] = [
    quadPixels[0].length > 0 ? rgbToHex(averageColor(quadPixels[0]).r, averageColor(quadPixels[0]).g, averageColor(quadPixels[0]).b) : '#00d2ff',
    quadPixels[1].length > 0 ? rgbToHex(averageColor(quadPixels[1]).r, averageColor(quadPixels[1]).g, averageColor(quadPixels[1]).b) : '#9d00ff',
    quadPixels[2].length > 0 ? rgbToHex(averageColor(quadPixels[2]).r, averageColor(quadPixels[2]).g, averageColor(quadPixels[2]).b) : '#ff7a00',
    quadPixels[3].length > 0 ? rgbToHex(averageColor(quadPixels[3]).r, averageColor(quadPixels[3]).g, averageColor(quadPixels[3]).b) : '#ff007f',
  ];

  // 2. Median Cut Dominant Palette (6 colors)
  const buckets = medianCut(allPixels.length > 0 ? allPixels : [{ r: 0, g: 210, b: 255 }], 6);
  const palette = buckets.map(b => {
    const avg = averageColor(b);
    return rgbToHex(avg.r, avg.g, avg.b);
  });

  // Ensure 6 colors
  while (palette.length < 6) {
    palette.push(qColors[palette.length % 4] || '#00d2ff');
  }

  // 3. Highlight and Shadow
  let highlight = palette[0];
  let shadow = palette[palette.length - 1];
  let maxLum = -1;
  let minLum = 999;

  palette.forEach(c => {
    const rgb = hexToRgb(c);
    const lum = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    if (lum > maxLum) {
      maxLum = lum;
      highlight = c;
    }
    if (lum < minLum) {
      minLum = lum;
      shadow = c;
    }
  });

  return {
    palette,
    quadrants: qColors,
    highlight,
    shadow,
    linearStops: [
      { id: 'l1', color: palette[0], position: 0 },
      { id: 'l2', color: palette[1], position: 50 },
      { id: 'l3', color: palette[2], position: 100 },
    ],
    radialStops: [
      { id: 'r1', color: highlight, position: 0 },
      { id: 'r2', color: palette[1], position: 55 },
      { id: 'r3', color: shadow, position: 100 },
    ],
    conicStops: [
      { id: 'c1', color: palette[0], position: 0 },
      { id: 'c2', color: palette[1], position: 33 },
      { id: 'c3', color: palette[2], position: 66 },
      { id: 'c4', color: palette[0], position: 100 },
    ],
    duotoneStops: [
      { id: 'd1', color: shadow, position: 0 },
      { id: 'd2', color: highlight, position: 100 },
    ],
    softStops: [
      { id: 's1', color: palette[2], position: 0 },
      { id: 's2', color: palette[3], position: 50 },
      { id: 's3', color: palette[4] || palette[0], position: 100 },
    ],
  };
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
