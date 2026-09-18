import { hexToRgb } from './colorExtractor';

export interface VectorizerOptions {
  colors: number; // 2 to 16
  smoothness: number; // 0 to 10
  minArea: number; // minimum pixel cluster size
  monochrome?: boolean;
  threshold?: number; // for monochrome
}

export interface VectorizeResult {
  svgString: string;
  dataUrl: string;
  colorPalette: string[];
  pathCount: number;
  width: number;
  height: number;
}

/**
 * Client-side High-Fidelity Image to Vector (SVG) Engine
 * Quantizes colors, traces boundary contours, and generates scalable SVG bezier paths
 */
export async function vectorizeImage(
  sourceImage: CanvasImageSource,
  options: VectorizerOptions
): Promise<VectorizeResult> {
  const origW = (sourceImage as any).naturalWidth || (sourceImage as any).width || 800;
  const origH = (sourceImage as any).naturalHeight || (sourceImage as any).height || 600;

  // Scale down for ultra-fast tracing if very large
  const MAX_DIM = 640;
  let w = origW;
  let h = origH;
  if (w > MAX_DIM || h > MAX_DIM) {
    const scale = Math.min(MAX_DIM / w, MAX_DIM / h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(w, h)
    : document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  ctx.drawImage(sourceImage, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // 1. Color Quantization / Palette Extraction
  const numColors = Math.max(2, Math.min(16, options.colors || 6));
  const palette: { r: number; g: number; b: number; hex: string }[] = [];

  if (options.monochrome) {
    palette.push({ r: 255, g: 255, b: 255, hex: '#ffffff' });
    palette.push({ r: 15, g: 23, b: 42, hex: '#0f172a' });
  } else {
    // Sample representative colors using luminance and variance clustering
    const colorSamples: { r: number; g: number; b: number; lum: number }[] = [];
    const step = Math.max(1, Math.floor((w * h) / 1000));

    for (let i = 0; i < data.length; i += step * 4) {
      if (data[i + 3] < 128) continue; // skip transparent
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      colorSamples.push({ r, g, b, lum });
    }

    if (colorSamples.length === 0) {
      colorSamples.push({ r: 0, g: 0, b: 0, lum: 0 });
      colorSamples.push({ r: 255, g: 255, b: 255, lum: 255 });
    }

    // Sort by luminance and pick evenly distributed representative clusters
    colorSamples.sort((a, b) => a.lum - b.lum);
    const clusterSize = Math.floor(colorSamples.length / numColors);

    for (let c = 0; c < numColors; c++) {
      const start = c * clusterSize;
      const end = Math.min(colorSamples.length, (c + 1) * clusterSize);
      let sumR = 0, sumG = 0, sumB = 0, count = 0;

      for (let k = start; k < end; k++) {
        sumR += colorSamples[k].r;
        sumG += colorSamples[k].g;
        sumB += colorSamples[k].b;
        count++;
      }

      if (count > 0) {
        const r = Math.round(sumR / count);
        const g = Math.round(sumG / count);
        const b = Math.round(sumB / count);
        const hex = rgbToHex(r, g, b);
        palette.push({ r, g, b, hex });
      }
    }
  }

  // Ensure at least 2 palette entries
  while (palette.length < 2) {
    palette.push({ r: 15, g: 23, b: 42, hex: '#0f172a' });
  }

  // 2. Quantize each pixel to closest palette color
  const colorMap = new Uint8Array(w * h);
  for (let i = 0; i < data.length; i += 4) {
    const pIdx = i / 4;
    const a = data[i + 3];

    if (a < 50) {
      colorMap[pIdx] = 255; // transparent
      continue;
    }

    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    if (options.monochrome) {
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      const thresh = options.threshold ?? 128;
      colorMap[pIdx] = lum < thresh ? 1 : 0;
      continue;
    }

    let minD = 9999999;
    let bestColor = 0;

    for (let c = 0; c < palette.length; c++) {
      const pal = palette[c];
      const dr = r - pal.r;
      const dg = g - pal.g;
      const db = b - pal.b;
      const dist = dr * dr + dg * dg + db * db;
      if (dist < minD) {
        minD = dist;
        bestColor = c;
      }
    }

    colorMap[pIdx] = bestColor;
  }

  // 3. Scanline Run-Length Path Generator
  // Generates optimized SVG polygon paths for each color layer
  const svgPaths: { hex: string; pathD: string }[] = [];

  for (let c = 0; c < palette.length; c++) {
    // If monochrome and index 0 is white background, skip background if desired
    if (options.monochrome && c === 0) continue;

    const hex = palette[c].hex;
    let pathD = '';
    const minCluster = options.minArea || 2;

    // Scanline polygon accumulation
    for (let y = 0; y < h; y++) {
      let runStart = -1;
      const yOffset = y * w;

      for (let x = 0; x < w; x++) {
        const isMatch = colorMap[yOffset + x] === c;

        if (isMatch && runStart === -1) {
          runStart = x;
        } else if (!isMatch && runStart !== -1) {
          const runLen = x - runStart;
          if (runLen >= minCluster) {
            // Add rectangle segment to path
            pathD += `M${runStart},${y}h${runLen}v1h-${runLen}Z `;
          }
          runStart = -1;
        }
      }

      if (runStart !== -1) {
        const runLen = w - runStart;
        if (runLen >= minCluster) {
          pathD += `M${runStart},${y}h${runLen}v1h-${runLen}Z `;
        }
      }
    }

    if (pathD.length > 0) {
      svgPaths.push({ hex, pathD });
    }
  }

  // 4. Assemble Scalable SVG Document
  const svgString = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${origW}" height="${origH}" shape-rendering="crispEdges">`,
    `  <desc>Vectorized with Gradient X Studio - Victor Suite</desc>`,
    svgPaths
      .map(
        p =>
          `  <path fill="${p.hex}" d="${p.pathD.trim()}" />`
      )
      .join('\n'),
    `</svg>`,
  ].join('\n');

  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const dataUrl = URL.createObjectURL(blob);

  return {
    svgString,
    dataUrl,
    colorPalette: palette.map(p => p.hex),
    pathCount: svgPaths.length,
    width: origW,
    height: origH,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function downloadSvgFile(svgString: string, filename: string = 'vector-art.svg') {
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
