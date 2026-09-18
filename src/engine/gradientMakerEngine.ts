import { GradientMakerSettings, GradientMapPreset, ColorStop } from '../types/studio';
import { hexToRgb } from './colorExtractor';

export const GRADIENT_MAP_PALETTES: Record<GradientMapPreset, { name: string; bangla: string; colors: string[] }> = {
  cyberpunk: {
    name: 'Cyberpunk Neon',
    bangla: 'সাইবার নিয়ন',
    colors: ['#0b0c16', '#3b0764', '#c026d3', '#06b6d4', '#ffffff'],
  },
  sunset: {
    name: 'Golden Hour Sunset',
    bangla: 'সানসেট গোল্ডেন',
    colors: ['#200508', '#881337', '#ea580c', '#fbbf24', '#fffbeb'],
  },
  hologram: {
    name: 'Holographic Chrome',
    bangla: 'হলোগ্রাফিক ক্রোম',
    colors: ['#03071e', '#3730a3', '#a855f7', '#38bdf8', '#ffffff'],
  },
  infrared: {
    name: 'Infrared Thermal',
    bangla: 'ইনফ্রারেড থার্মাল',
    colors: ['#000000', '#1e1b4b', '#e11d48', '#facc15', '#ffffff'],
  },
  emerald: {
    name: 'Emerald Aurora',
    bangla: 'পান্না অরোরা',
    colors: ['#022c22', '#065f46', '#10b981', '#6ee7b7', '#f0fdf4'],
  },
  obsidian: {
    name: 'Midnight Electric',
    bangla: 'মিডনাইট ইলেকট্রিক',
    colors: ['#020617', '#1e3a8a', '#7c3aed', '#00f0ff', '#ffffff'],
  },
};

/**
 * Gradient Maker Engine
 * Renders 1: Fluid Mesh Aurora, 2: Radial Sunburst Bloom, 3: Precision Angle Flow, 4: Luminance Gradient Map
 */
export function applyGradientMakerPipeline(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: GradientMakerSettings,
  originalImage?: CanvasImageSource
): void {
  if (!settings.enabled || settings.opacity <= 0) return;

  const mode = settings.mode;

  if (mode === '4' && originalImage) {
    // Mode 4: Holographic Luminosity Gradient Map on uploaded image
    applyLuminanceGradientMap(ctx, w, h, settings, originalImage);
    return;
  }

  ctx.save();
  const rawBlend = settings.blendMode || 'normal';
  ctx.globalCompositeOperation = rawBlend === 'normal' ? 'source-over' : (rawBlend as GlobalCompositeOperation);
  ctx.globalAlpha = Math.max(0, Math.min(100, settings.opacity)) / 100;

  switch (mode) {
    case '1':
      renderFluidMeshAurora(ctx, w, h, settings);
      break;
    case '2':
      renderRadialSunburstBloom(ctx, w, h, settings);
      break;
    case '3':
      renderPrecisionAngleFlow(ctx, w, h, settings);
      break;
    default:
      renderFluidMeshAurora(ctx, w, h, settings);
      break;
  }

  ctx.restore();
}

/**
 * Mode 1: 4-Corner Fluid Mesh Aurora
 * Ultra-smooth, non-muddy bilinear color interpolation across 4 corner pins
 */
export function renderFluidMeshAurora(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: GradientMakerSettings
) {
  const [cTL, cTR, cBR, cBL] = (settings.meshColors && settings.meshColors.length >= 4)
    ? settings.meshColors
    : ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00'];

  const rgbTL = hexToRgb(cTL);
  const rgbTR = hexToRgb(cTR);
  const rgbBR = hexToRgb(cBR);
  const rgbBL = hexToRgb(cBL);

  const gridSize = 32;
  const offscreen = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(gridSize, gridSize)
    : document.createElement('canvas');
  offscreen.width = gridSize;
  offscreen.height = gridSize;

  const offCtx = offscreen.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  const imgData = offCtx.createImageData(gridSize, gridSize);
  const d = imgData.data;

  for (let y = 0; y < gridSize; y++) {
    const v = y / (gridSize - 1);
    const invV = 1 - v;

    for (let x = 0; x < gridSize; x++) {
      const u = x / (gridSize - 1);
      const invU = 1 - u;

      const wTL = invU * invV;
      const wTR = u * invV;
      const wBL = invU * v;
      const wBR = u * v;

      const r = Math.round(wTL * rgbTL.r + wTR * rgbTR.r + wBL * rgbBL.r + wBR * rgbBR.r);
      const g = Math.round(wTL * rgbTL.g + wTR * rgbTR.g + wBL * rgbBL.g + wBR * rgbBR.g);
      const b = Math.round(wTL * rgbTL.b + wTR * rgbTR.b + wBL * rgbBL.b + wBR * rgbBR.b);

      const idx = (y * gridSize + x) * 4;
      d[idx] = r;
      d[idx + 1] = g;
      d[idx + 2] = b;
      d[idx + 3] = 255;
    }
  }

  offCtx.putImageData(imgData, 0, 0);

  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(offscreen, 0, 0, w, h);
  ctx.restore();
}

/**
 * Mode 2: Radial Sunburst Halo Bloom
 */
function renderRadialSunburstBloom(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: GradientMakerSettings
) {
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.hypot(w, h) / 1.6;

  const sortedStops = [...settings.stops].sort((a, b) => a.position - b.position);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR);

  if (sortedStops.length >= 2) {
    sortedStops.forEach(s => {
      g.addColorStop(Math.max(0, Math.min(1, s.position / 100)), s.color);
    });
  } else {
    g.addColorStop(0, '#00f0ff');
    g.addColorStop(0.4, '#9d00ff');
    g.addColorStop(0.8, '#ff007f');
    g.addColorStop(1, '#050510');
  }

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Mode 3: Precision Multi-Stop Angle Flow
 */
function renderPrecisionAngleFlow(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: GradientMakerSettings
) {
  const angleRad = (settings.angle * Math.PI) / 180;
  const r = Math.hypot(w, h) / 2;
  const cx = w / 2;
  const cy = h / 2;
  const x0 = cx - Math.cos(angleRad) * r;
  const y0 = cy - Math.sin(angleRad) * r;
  const x1 = cx + Math.cos(angleRad) * r;
  const y1 = cy + Math.sin(angleRad) * r;

  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  const sortedStops = [...settings.stops].sort((a, b) => a.position - b.position);

  if (sortedStops.length >= 2) {
    sortedStops.forEach(s => {
      g.addColorStop(Math.max(0, Math.min(1, s.position / 100)), s.color);
    });
  } else {
    g.addColorStop(0, '#00d2ff');
    g.addColorStop(0.5, '#7928ca');
    g.addColorStop(1, '#ff0080');
  }

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/**
 * Mode 4: Holographic Luminance Gradient Map
 * Directly maps the grayscale luminance of the uploaded image to a rich gradient ramp
 */
function applyLuminanceGradientMap(
  targetCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: GradientMakerSettings,
  originalImage: CanvasImageSource
) {
  // 1. Draw original image onto offscreen canvas
  const offCanvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(w, h)
    : document.createElement('canvas');
  offCanvas.width = w;
  offCanvas.height = h;
  const offCtx = offCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  offCtx.drawImage(originalImage, 0, 0, w, h);

  const imgData = offCtx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // 2. Build 256-entry lookup table for the selected gradient map
  const presetKey = settings.mapPalettePreset || 'cyberpunk';
  const paletteDef = GRADIENT_MAP_PALETTES[presetKey] || GRADIENT_MAP_PALETTES.cyberpunk;
  const colors = settings.customMapColors && settings.customMapColors.length >= 2
    ? settings.customMapColors
    : paletteDef.colors;

  const lut = buildGradientLut(colors);

  // 3. Remap pixels based on perceptual luminance
  const opacity = Math.max(0, Math.min(100, settings.opacity)) / 100;
  const invOpacity = 1 - opacity;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Perceptual luminance formula: 0.299*R + 0.587*G + 0.114*B
    const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    const lutIdx = Math.max(0, Math.min(255, lum)) * 3;

    const mappedR = lut[lutIdx];
    const mappedG = lut[lutIdx + 1];
    const mappedB = lut[lutIdx + 2];

    data[i] = Math.round(mappedR * opacity + r * invOpacity);
    data[i + 1] = Math.round(mappedG * opacity + g * invOpacity);
    data[i + 2] = Math.round(mappedB * opacity + b * invOpacity);
  }

  offCtx.putImageData(imgData, 0, 0);

  // 4. Draw mapped image with specified blend mode
  targetCtx.save();
  const rawBlend = settings.blendMode || 'normal';
  targetCtx.globalCompositeOperation = rawBlend === 'normal' ? 'source-over' : (rawBlend as GlobalCompositeOperation);
  targetCtx.drawImage(offCanvas, 0, 0, w, h);
  targetCtx.restore();
}

/**
 * Precomputes a 256-entry RGB lookup table from an array of hex colors
 */
function buildGradientLut(hexColors: string[]): Uint8Array {
  const lut = new Uint8Array(256 * 3);
  const stops = hexColors.map((hex, i) => ({
    rgb: hexToRgb(hex),
    pos: i / (hexColors.length - 1),
  }));

  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    // Find enclosing stops
    let s0 = stops[0];
    let s1 = stops[stops.length - 1];

    for (let k = 0; k < stops.length - 1; k++) {
      if (t >= stops[k].pos && t <= stops[k + 1].pos) {
        s0 = stops[k];
        s1 = stops[k + 1];
        break;
      }
    }

    const span = s1.pos - s0.pos;
    const factor = span > 0 ? (t - s0.pos) / span : 0;

    lut[i * 3] = Math.round(s0.rgb.r + (s1.rgb.r - s0.rgb.r) * factor);
    lut[i * 3 + 1] = Math.round(s0.rgb.g + (s1.rgb.g - s0.rgb.g) * factor);
    lut[i * 3 + 2] = Math.round(s0.rgb.b + (s1.rgb.b - s0.rgb.b) * factor);
  }

  return lut;
}
