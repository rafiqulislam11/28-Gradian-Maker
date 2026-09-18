/**
 * Studio Color Palette Extraction & Harmonization Engine
 * Features Saturation-Weighted Quantization, HSL Vibrancy Tuning, and 4-Corner Mesh Extraction
 */

export interface RgbColor {
  r: number;
  g: number;
  b: number;
}

export interface HslColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
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
  if (isNaN(num)) return { r: 0, g: 210, b: 255 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHsl(r: number, g: number, b: number): HslColor {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
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
    h *= 60;
  }

  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToRgb(h: number, s: number, l: number): RgbColor {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r1 = 0, g1 = 0, b1 = 0;
  if (h < 60) { r1 = c; g1 = x; b1 = 0; }
  else if (h < 120) { r1 = x; g1 = c; b1 = 0; }
  else if (h < 180) { r1 = 0; g1 = c; b1 = x; }
  else if (h < 240) { r1 = 0; g1 = x; b1 = c; }
  else if (h < 300) { r1 = x; g1 = 0; b1 = c; }
  else { r1 = c; g1 = 0; b1 = x; }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

/**
 * Boosts saturation and harmonizes lightness of any hex color
 */
export function boostHexVibrancy(hex: string, satBoost: number = 25): string {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  hsl.s = Math.min(100, hsl.s + satBoost);
  if (hsl.l < 25) hsl.l = 30;
  if (hsl.l > 85) hsl.l = 75;
  const boosted = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(boosted.r, boosted.g, boosted.b);
}

/**
 * Vibrant Average Color:
 * Heavy weighting for high-saturation, vivid pixels so gradient colors are never muddy gray-brown.
 */
function vibrantAverageColor(pixels: RgbColor[]): RgbColor {
  if (pixels.length === 0) return { r: 0, g: 210, b: 255 };

  let totalWeight = 0;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;

  for (let i = 0; i < pixels.length; i++) {
    const p = pixels[i];
    const max = Math.max(p.r, p.g, p.b);
    const min = Math.min(p.r, p.g, p.b);
    const sat = max === 0 ? 0 : (max - min) / max;
    const lum = (p.r * 299 + p.g * 587 + p.b * 114) / 255000;

    // Favor saturated, non-extreme luminance pixels
    const lumWeight = 1 - Math.abs(lum - 0.5) * 1.5;
    const weight = Math.max(0.08, sat * 3.5 + Math.max(0, lumWeight * 1.2));

    totalWeight += weight;
    rSum += p.r * weight;
    gSum += p.g * weight;
    bSum += p.b * weight;
  }

  let finalR = Math.round(rSum / totalWeight);
  let finalG = Math.round(gSum / totalWeight);
  let finalB = Math.round(bSum / totalWeight);

  // Boost vibrancy if muted
  const hsl = rgbToHsl(finalR, finalG, finalB);
  if (hsl.s < 45 && hsl.l > 12 && hsl.l < 88) {
    hsl.s = Math.min(88, hsl.s + 35);
    const boosted = hslToRgb(hsl.h, hsl.s, hsl.l);
    finalR = boosted.r;
    finalG = boosted.g;
    finalB = boosted.b;
  }

  return { r: finalR, g: finalG, b: finalB };
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
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00', '#10b981'];

    canvas.width = 64;
    canvas.height = 64;
    ctx.drawImage(imageSource, 0, 0, 64, 64);
    imageData = ctx.getImageData(0, 0, 64, 64);
  }

  const data = imageData.data;
  const pixels: RgbColor[] = [];

  // Sample pixels with alpha and non-extreme brightness check
  for (let i = 0; i < data.length; i += 16) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 128) continue;

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness < 12 && Math.random() > 0.15) continue;
    if (brightness > 248 && Math.random() > 0.15) continue;

    pixels.push({ r, g, b });
  }

  if (pixels.length === 0) {
    return ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00', '#00f0ff'];
  }

  // Quantization using Median-Cut approach
  const buckets = medianCut(pixels, colorCount);
  const hexColors = buckets.map(bucket => {
    const avg = vibrantAverageColor(bucket);
    return rgbToHex(avg.r, avg.g, avg.b);
  });

  // Ensure unique and high-contrast colors
  const unique = Array.from(new Set(hexColors));
  const fallbackHues = ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00', '#00f0ff', '#10b981'];
  let fbIdx = 0;
  while (unique.length < colorCount) {
    const candidate = fallbackHues[fbIdx % fallbackHues.length];
    if (!unique.includes(candidate)) {
      unique.push(candidate);
    }
    fbIdx++;
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
 * Extracts comprehensive, harmonious gradient data from an image
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

  // 1. Calculate Quadrant Samples
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

  // 2. Median Cut Palette (6 vibrant colors)
  const buckets = medianCut(allPixels.length > 0 ? allPixels : [{ r: 0, g: 210, b: 255 }], 6);
  const palette = buckets.map(b => {
    const avg = vibrantAverageColor(b);
    return rgbToHex(avg.r, avg.g, avg.b);
  });

  // Ensure 6 distinct vibrant colors
  const defaultFallbacks = ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00', '#00f0ff', '#10b981'];
  while (palette.length < 6) {
    palette.push(defaultFallbacks[palette.length % defaultFallbacks.length]);
  }

  // 3. Quadrant Corner Colors: Extract vibrant regional colors
  const rawQ: [string, string, string, string] = [
    quadPixels[0].length > 0 ? rgbToHex(vibrantAverageColor(quadPixels[0]).r, vibrantAverageColor(quadPixels[0]).g, vibrantAverageColor(quadPixels[0]).b) : palette[0],
    quadPixels[1].length > 0 ? rgbToHex(vibrantAverageColor(quadPixels[1]).r, vibrantAverageColor(quadPixels[1]).g, vibrantAverageColor(quadPixels[1]).b) : palette[1],
    quadPixels[2].length > 0 ? rgbToHex(vibrantAverageColor(quadPixels[2]).r, vibrantAverageColor(quadPixels[2]).g, vibrantAverageColor(quadPixels[2]).b) : palette[2],
    quadPixels[3].length > 0 ? rgbToHex(vibrantAverageColor(quadPixels[3]).r, vibrantAverageColor(quadPixels[3]).g, vibrantAverageColor(quadPixels[3]).b) : palette[3],
  ];

  // If any quadrants are identical, introduce harmonic variety from the palette
  const qColors: [string, string, string, string] = [
    rawQ[0],
    rawQ[1] !== rawQ[0] ? rawQ[1] : palette[1],
    rawQ[2] !== rawQ[1] && rawQ[2] !== rawQ[0] ? rawQ[2] : palette[2],
    rawQ[3] !== rawQ[2] && rawQ[3] !== rawQ[0] ? rawQ[3] : palette[3],
  ];

  // 4. Determine Highlight and Deep Shadow
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

  // Make highlight vivid glowing tint
  const hlRgb = hexToRgb(highlight);
  const hlHsl = rgbToHsl(hlRgb.r, hlRgb.g, hlRgb.b);
  hlHsl.l = Math.max(65, Math.min(85, hlHsl.l));
  hlHsl.s = Math.max(70, hlHsl.s);
  const tunedHl = hslToRgb(hlHsl.h, hlHsl.s, hlHsl.l);
  const finalHighlight = rgbToHex(tunedHl.r, tunedHl.g, tunedHl.b);

  // Make shadow deep chromatic anchor
  const shRgb = hexToRgb(shadow);
  const shHsl = rgbToHsl(shRgb.r, shRgb.g, shRgb.b);
  shHsl.l = Math.max(15, Math.min(30, shHsl.l));
  shHsl.s = Math.max(60, shHsl.s);
  const tunedSh = hslToRgb(shHsl.h, shHsl.s, shHsl.l);
  const finalShadow = rgbToHex(tunedSh.r, tunedSh.g, tunedSh.b);

  return {
    palette,
    quadrants: qColors,
    highlight: finalHighlight,
    shadow: finalShadow,
    linearStops: [
      { id: 'l1', color: palette[0], position: 0 },
      { id: 'l2', color: palette[1], position: 50 },
      { id: 'l3', color: palette[2], position: 100 },
    ],
    radialStops: [
      { id: 'r1', color: finalHighlight, position: 0 },
      { id: 'r2', color: palette[1], position: 55 },
      { id: 'r3', color: finalShadow, position: 100 },
    ],
    conicStops: [
      { id: 'c1', color: palette[0], position: 0 },
      { id: 'c2', color: palette[1], position: 33 },
      { id: 'c3', color: palette[2], position: 66 },
      { id: 'c4', color: palette[0], position: 100 },
    ],
    duotoneStops: [
      { id: 'd1', color: finalShadow, position: 0 },
      { id: 'd2', color: finalHighlight, position: 100 },
    ],
    softStops: [
      { id: 's1', color: boostHexVibrancy(palette[1], 15), position: 0 },
      { id: 's2', color: boostHexVibrancy(palette[2], 15), position: 50 },
      { id: 's3', color: boostHexVibrancy(palette[3] || palette[0], 15), position: 100 },
    ],
  };
}

function medianCut(pixels: RgbColor[], targetBuckets: number): RgbColor[][] {
  let buckets: RgbColor[][] = [pixels];

  while (buckets.length < targetBuckets) {
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
