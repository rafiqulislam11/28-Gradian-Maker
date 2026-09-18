import { FractalGlassSettings, FractalGlassMode } from '../types/studio';

/**
 * Optical Fractal Glass Refraction & Dispersion Engine
 * Runs procedural refraction shaders on Canvas 2D / OffscreenCanvas
 */

export interface GlassRenderOptions {
  isFastPreview?: boolean;
}

// Reusable scratch canvases to prevent GC spikes
let scratchCanvasA: (HTMLCanvasElement | OffscreenCanvas) | null = null;
let scratchCanvasB: (HTMLCanvasElement | OffscreenCanvas) | null = null;

function getScratchCanvas(w: number, h: number, isB: boolean = false): HTMLCanvasElement | OffscreenCanvas {
  let c = isB ? scratchCanvasB : scratchCanvasA;
  if (!c) {
    c = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(w, h)
      : document.createElement('canvas');
    if (isB) scratchCanvasB = c;
    else scratchCanvasA = c;
  }
  if (c.width !== w || c.height !== h) {
    c.width = w;
    c.height = h;
  }
  return c;
}

/**
 * Main entrance for Fractal Glass effect
 */
export function applyFractalGlassEffect(
  targetCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  originalImage: CanvasImageSource,
  settings: FractalGlassSettings,
  options?: GlassRenderOptions
): void {
  if (!settings.enabled || settings.opacity <= 0) {
    targetCtx.drawImage(originalImage, 0, 0, w, h);
    return;
  }

  const isFast = options?.isFastPreview ?? false;
  const mode = settings.mode;

  // 1. Prepare Base Image on Scratch Canvas A
  const baseCanvas = getScratchCanvas(w, h, false);
  const baseCtx = baseCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  baseCtx.clearRect(0, 0, w, h);

  // If frosted blur is requested, pre-filter base image
  if (settings.frost > 0) {
    const blurPx = Math.max(1, Math.round((settings.frost / 100) * (mode === '3.2' ? 18 : 8)));
    baseCtx.save();
    baseCtx.filter = `blur(${blurPx}px)`;
    baseCtx.drawImage(originalImage, 0, 0, w, h);
    baseCtx.restore();
  } else {
    baseCtx.drawImage(originalImage, 0, 0, w, h);
  }

  // Handle Mode 3.3: Sacred Kaleidoscope Recursive Mirror Glass
  if (mode === '3.3') {
    renderKaleidoscopeGlass(targetCtx, baseCanvas, w, h, settings, isFast);
    return;
  }

  // Read Base ImageData for optical displacement shader
  const baseImgData = baseCtx.getImageData(0, 0, w, h);
  const srcPixels = baseImgData.data;

  // Prepare Output ImageData
  const outCanvas = getScratchCanvas(w, h, true);
  const outCtx = outCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  const outImgData = outCtx.createImageData(w, h);
  const dstPixels = outImgData.data;

  // Dispatch Mode-specific Refraction Displacement Shaders
  switch (mode) {
    case '1':
      renderFlutedRibsGlass(srcPixels, dstPixels, w, h, settings, isFast);
      break;
    case '2':
      renderDiamondPrismGlass(srcPixels, dstPixels, w, h, settings, isFast);
      break;
    case '3':
      renderVoronoiShardsGlass(srcPixels, dstPixels, w, h, settings, false, isFast);
      break;
    case '3.1':
      // Mode 3.1: Prismatic Dispersion (Voronoi + High Chromatic Aberration RGB split)
      renderVoronoiShardsGlass(srcPixels, dstPixels, w, h, settings, true, isFast);
      break;
    case '3.2':
      // Mode 3.2: Frosted Matte Sandblasted Glass Shimmer
      renderFrostedMatteGlass(srcPixels, dstPixels, w, h, settings, isFast);
      break;
    default:
      renderFlutedRibsGlass(srcPixels, dstPixels, w, h, settings, isFast);
      break;
  }

  outCtx.putImageData(outImgData, 0, 0);

  // Render specularity, caustics, and composite
  targetCtx.save();
  const rawBlend = settings.blendMode || 'normal';
  targetCtx.globalCompositeOperation = rawBlend === 'normal' ? 'source-over' : (rawBlend as GlobalCompositeOperation);
  targetCtx.globalAlpha = Math.max(0, Math.min(100, settings.opacity)) / 100;
  targetCtx.drawImage(outCanvas, 0, 0, w, h);

  // Overlay Specular Gloss Highlights / Caustics along Glass Ridges
  if (settings.specular > 0) {
    renderGlassSpecularHighlights(targetCtx, w, h, settings);
  }

  targetCtx.restore();
}

/**
 * Mode 1: Fluted / Reeded Linear Glass Ribs
 * Optical cylindrical lenses displacing image along angle normal
 */
function renderFlutedRibsGlass(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  settings: FractalGlassSettings,
  _isFast: boolean
) {
  const rad = (settings.angle * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  // Scale defines frequency (rib width: ~10px to 90px)
  const ribWidth = Math.max(10, Math.round(100 - settings.scale * 0.8));
  const distAmp = (settings.distortion / 100) * (ribWidth * 0.85);
  const dispFactor = (settings.dispersion / 100) * 8.0;

  for (let y = 0; y < h; y++) {
    const yOffset = y * w;
    for (let x = 0; x < w; x++) {
      const idx = (yOffset + x) * 4;

      // Project pixel onto rib orientation
      const proj = x * cosA + y * sinA;
      const phase = (proj % ribWidth) / ribWidth; // 0 to 1
      // Cylindrical lens slope
      const refractionNorm = Math.sin(phase * Math.PI * 2);

      // Displacement vector along normal
      const dx = -sinA * refractionNorm * distAmp;
      const dy = cosA * refractionNorm * distAmp;

      // Sample R, G, B with chromatic aberration dispersion
      const redX = Math.round(Math.max(0, Math.min(w - 1, x + dx * (1 + dispFactor * 0.15))));
      const redY = Math.round(Math.max(0, Math.min(h - 1, y + dy * (1 + dispFactor * 0.15))));
      const redIdx = (redY * w + redX) * 4;

      const grnX = Math.round(Math.max(0, Math.min(w - 1, x + dx)));
      const grnY = Math.round(Math.max(0, Math.min(h - 1, y + dy)));
      const grnIdx = (grnY * w + grnX) * 4;

      const bluX = Math.round(Math.max(0, Math.min(w - 1, x + dx * (1 - dispFactor * 0.15))));
      const bluY = Math.round(Math.max(0, Math.min(h - 1, y + dy * (1 - dispFactor * 0.15))));
      const bluIdx = (bluY * w + bluX) * 4;

      dst[idx] = src[redIdx];
      dst[idx + 1] = src[grnIdx + 1];
      dst[idx + 2] = src[bluIdx + 2];
      dst[idx + 3] = src[grnIdx + 3];
    }
  }
}

/**
 * Mode 2: Faceted Diamond & Hexagonal Crystalline Prism
 * Diamond facet grid with pyramidal normal vectors
 */
function renderDiamondPrismGlass(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  settings: FractalGlassSettings,
  _isFast: boolean
) {
  const facetSize = Math.max(16, Math.round(110 - settings.scale * 0.9));
  const distAmp = (settings.distortion / 100) * (facetSize * 0.7);
  const disp = (settings.dispersion / 100) * 10.0;
  const angleRad = (settings.angle * Math.PI) / 180;
  const cosRot = Math.cos(angleRad);
  const sinRot = Math.sin(angleRad);

  for (let y = 0; y < h; y++) {
    const yOffset = y * w;
    for (let x = 0; x < w; x++) {
      const idx = (yOffset + x) * 4;

      // Rotate coordinates by angle
      const rx = x * cosRot - y * sinRot;
      const ry = x * sinRot + y * cosRot;

      const cellX = ((rx % facetSize) + facetSize) % facetSize - facetSize / 2;
      const cellY = ((ry % facetSize) + facetSize) % facetSize - facetSize / 2;

      // Diamond facet normal calculation
      const nx = cellX > 0 ? -1 : 1;
      const ny = cellY > 0 ? -1 : 1;
      const weight = Math.min(1, (Math.abs(cellX) + Math.abs(cellY)) / (facetSize * 0.7));

      const dx = (nx * cosRot - ny * sinRot) * distAmp * weight;
      const dy = (nx * sinRot + ny * cosRot) * distAmp * weight;

      // Chromatic RGB dispersion
      const rxPos = Math.round(Math.max(0, Math.min(w - 1, x + dx * (1 + disp * 0.12))));
      const ryPos = Math.round(Math.max(0, Math.min(h - 1, y + dy * (1 + disp * 0.12))));
      const rIdx = (ryPos * w + rxPos) * 4;

      const gxPos = Math.round(Math.max(0, Math.min(w - 1, x + dx)));
      const gyPos = Math.round(Math.max(0, Math.min(h - 1, y + dy)));
      const gIdx = (gyPos * w + gxPos) * 4;

      const bxPos = Math.round(Math.max(0, Math.min(w - 1, x + dx * (1 - disp * 0.12))));
      const byPos = Math.round(Math.max(0, Math.min(h - 1, y + dy * (1 - disp * 0.12))));
      const bIdx = (byPos * w + bxPos) * 4;

      // Add subtle facet boundary highlight
      const edgeProx = Math.max(0, 1 - Math.abs(cellX * cellY) / (facetSize * 3));
      const highlight = (settings.specular / 100) * edgeProx * 25;

      dst[idx] = Math.min(255, src[rIdx] + highlight);
      dst[idx + 1] = Math.min(255, src[gIdx + 1] + highlight);
      dst[idx + 2] = Math.min(255, src[bIdx + 2] + highlight);
      dst[idx + 3] = src[gIdx + 3];
    }
  }
}

/**
 * Mode 3 & Mode 3.1: Voronoi Fractured Shards & Broken Glass Refraction
 * Generates natural fractured polygonal shards with refractive shift & RGB dispersion
 */
function renderVoronoiShardsGlass(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  settings: FractalGlassSettings,
  isHighDispersion: boolean,
  _isFast: boolean
) {
  const shardSize = Math.max(20, Math.round(130 - settings.scale * 1.0));
  const distAmp = (settings.distortion / 100) * (shardSize * 0.65);
  // Mode 3.1 doubles the dispersion for vivid rainbow fringes
  const disp = (settings.dispersion / 100) * (isHighDispersion ? 18.0 : 7.0);

  // Deterministic Voronoi shard grid generator
  const gridW = Math.ceil(w / shardSize) + 2;
  const gridH = Math.ceil(h / shardSize) + 2;
  const points: { x: number; y: number; dx: number; dy: number }[] = [];

  for (let gy = 0; gy < gridH; gy++) {
    for (let gx = 0; gx < gridW; gx++) {
      // Deterministic hash pseudo-random
      const seed = (gx * 374761393 + gy * 668265263) ^ 0x5bf03635;
      const rx = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      const ry = (((seed >> 4) * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

      const px = (gx - 1 + rx) * shardSize;
      const py = (gy - 1 + ry) * shardSize;

      // Refraction angle for this shard
      const rAngle = rx * Math.PI * 2;
      const rForce = (0.5 + ry * 0.5) * distAmp;

      points.push({
        x: px,
        y: py,
        dx: Math.cos(rAngle) * rForce,
        dy: Math.sin(rAngle) * rForce,
      });
    }
  }

  for (let y = 0; y < h; y++) {
    const yOffset = y * w;
    const gy = Math.floor(y / shardSize) + 1;

    for (let x = 0; x < w; x++) {
      const idx = (yOffset + x) * 4;
      const gx = Math.floor(x / shardSize) + 1;

      // Find closest Voronoi center among 3x3 neighbors
      let minDist = 999999;
      let secDist = 999999;
      let bestP = points[0];

      for (let dy = -1; dy <= 1; dy++) {
        const ny = gy + dy;
        if (ny < 0 || ny >= gridH) continue;
        const rowOffset = ny * gridW;

        for (let dx = -1; dx <= 1; dx++) {
          const nx = gx + dx;
          if (nx < 0 || nx >= gridW) continue;
          const p = points[rowOffset + nx];
          const d2 = (x - p.x) * (x - p.x) + (y - p.y) * (y - p.y);

          if (d2 < minDist) {
            secDist = minDist;
            minDist = d2;
            bestP = p;
          } else if (d2 < secDist) {
            secDist = d2;
          }
        }
      }

      const dx = bestP.dx;
      const dy = bestP.dy;

      // Chromatic RGB dispersion sampling
      const rxPos = Math.round(Math.max(0, Math.min(w - 1, x + dx * (1 + disp * 0.1))));
      const ryPos = Math.round(Math.max(0, Math.min(h - 1, y + dy * (1 + disp * 0.1))));
      const rIdx = (ryPos * w + rxPos) * 4;

      const gxPos = Math.round(Math.max(0, Math.min(w - 1, x + dx)));
      const gyPos = Math.round(Math.max(0, Math.min(h - 1, y + dy)));
      const gIdx = (gyPos * w + gxPos) * 4;

      const bxPos = Math.round(Math.max(0, Math.min(w - 1, x + dx * (1 - disp * 0.1))));
      const byPos = Math.round(Math.max(0, Math.min(h - 1, y + dy * (1 - disp * 0.1))));
      const bIdx = (byPos * w + bxPos) * 4;

      // Crack border highlight between shards
      const edgeDistance = Math.sqrt(secDist) - Math.sqrt(minDist);
      const edgeGlow = edgeDistance < 2.5 ? (1 - edgeDistance / 2.5) * (settings.specular * 0.8) : 0;

      dst[idx] = Math.min(255, src[rIdx] + edgeGlow);
      dst[idx + 1] = Math.min(255, src[gIdx + 1] + edgeGlow);
      dst[idx + 2] = Math.min(255, src[bIdx + 2] + edgeGlow);
      dst[idx + 3] = src[gIdx + 3];
    }
  }
}

/**
 * Mode 3.2: Frosted Matte Sandblasted Glass Shimmer
 * Smooth micro-facet acid-etched glass texture
 */
function renderFrostedMatteGlass(
  src: Uint8ClampedArray,
  dst: Uint8ClampedArray,
  w: number,
  h: number,
  settings: FractalGlassSettings,
  _isFast: boolean
) {
  const distAmp = (settings.distortion / 100) * 18.0;
  const disp = (settings.dispersion / 100) * 6.0;
  const frostScale = Math.max(8, Math.round(60 - settings.scale * 0.5));

  for (let y = 0; y < h; y++) {
    const yOffset = y * w;
    for (let x = 0; x < w; x++) {
      const idx = (yOffset + x) * 4;

      // Multi-frequency sinusoidal micro-facet refraction
      const fx = Math.sin(x / frostScale) * Math.cos(y / (frostScale * 0.8));
      const fy = Math.cos(x / (frostScale * 0.8)) * Math.sin(y / frostScale);

      const dx = fx * distAmp;
      const dy = fy * distAmp;

      // Chromatic RGB dispersion
      const rxPos = Math.round(Math.max(0, Math.min(w - 1, x + dx * (1 + disp * 0.1))));
      const ryPos = Math.round(Math.max(0, Math.min(h - 1, y + dy * (1 + disp * 0.1))));
      const rIdx = (ryPos * w + rxPos) * 4;

      const gxPos = Math.round(Math.max(0, Math.min(w - 1, x + dx)));
      const gyPos = Math.round(Math.max(0, Math.min(h - 1, y + dy)));
      const gIdx = (gyPos * w + gxPos) * 4;

      const bxPos = Math.round(Math.max(0, Math.min(w - 1, x + dx * (1 - disp * 0.1))));
      const byPos = Math.round(Math.max(0, Math.min(h - 1, y + dy * (1 - disp * 0.1))));
      const bIdx = (byPos * w + bxPos) * 4;

      // Soft sandblast specular grain
      const grain = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
      const shimmer = (settings.specular / 100) * (grain * 20);

      dst[idx] = Math.min(255, src[rIdx] + shimmer);
      dst[idx + 1] = Math.min(255, src[gIdx + 1] + shimmer);
      dst[idx + 2] = Math.min(255, src[bIdx + 2] + shimmer);
      dst[idx + 3] = src[gIdx + 3];
    }
  }
}

/**
 * Mode 3.3: Sacred Kaleidoscope Recursive Mirror Glass
 * N-fold radial symmetry and kaleidoscopic recursive facet reflections
 */
function renderKaleidoscopeGlass(
  targetCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  sourceCanvas: HTMLCanvasElement | OffscreenCanvas,
  w: number,
  h: number,
  settings: FractalGlassSettings,
  _isFast: boolean
) {
  targetCtx.save();
  const rawBlend = settings.blendMode || 'normal';
  targetCtx.globalCompositeOperation = rawBlend === 'normal' ? 'source-over' : (rawBlend as GlobalCompositeOperation);
  targetCtx.globalAlpha = Math.max(0, Math.min(100, settings.opacity)) / 100;

  const cx = w / 2;
  const cy = h / 2;

  // Number of radial segments based on scale (6 to 16 mirror facets)
  const segments = Math.max(6, Math.min(16, Math.round(settings.scale / 8) * 2));
  const wedgeAngle = (Math.PI * 2) / segments;
  const baseAngle = (settings.angle * Math.PI) / 180;

  targetCtx.translate(cx, cy);

  for (let i = 0; i < segments; i++) {
    targetCtx.save();
    targetCtx.rotate(baseAngle + i * wedgeAngle);

    // Mirror alternate segments for true kaleidoscope symmetry
    if (i % 2 === 1) {
      targetCtx.scale(1, -1);
    }

    // Clip triangle wedge
    targetCtx.beginPath();
    targetCtx.moveTo(0, 0);
    const radius = Math.hypot(w, h);
    targetCtx.lineTo(radius * Math.cos(wedgeAngle / 2), radius * Math.sin(wedgeAngle / 2));
    targetCtx.lineTo(radius * Math.cos(-wedgeAngle / 2), radius * Math.sin(-wedgeAngle / 2));
    targetCtx.closePath();
    targetCtx.clip();

    // Draw offset image slice
    const distOffset = (settings.distortion / 100) * 80;
    targetCtx.drawImage(sourceCanvas, -cx + distOffset, -cy, w, h);

    // Prismatic chromatic aberration layer
    if (settings.dispersion > 0) {
      targetCtx.save();
      targetCtx.globalAlpha = (settings.dispersion / 100) * 0.4;
      targetCtx.globalCompositeOperation = 'screen';
      targetCtx.drawImage(sourceCanvas, -cx + distOffset + 4, -cy, w, h);
      targetCtx.drawImage(sourceCanvas, -cx + distOffset - 4, -cy, w, h);
      targetCtx.restore();
    }

    targetCtx.restore();
  }

  targetCtx.restore();

  // Overlay glass facet seams & specular reflections
  if (settings.specular > 0) {
    targetCtx.save();
    targetCtx.translate(cx, cy);
    targetCtx.strokeStyle = `rgba(255, 255, 255, ${(settings.specular / 100) * 0.35})`;
    targetCtx.lineWidth = 1;

    for (let i = 0; i < segments; i++) {
      targetCtx.save();
      targetCtx.rotate(baseAngle + i * wedgeAngle);
      targetCtx.beginPath();
      targetCtx.moveTo(0, 0);
      targetCtx.lineTo(Math.hypot(w, h), 0);
      targetCtx.stroke();
      targetCtx.restore();
    }
    targetCtx.restore();
  }
}

/**
 * Luminous Specular Caustics & Rim Light along Glass Ridges
 */
function renderGlassSpecularHighlights(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: FractalGlassSettings
) {
  const intensity = (settings.specular / 100) * 0.35;
  if (intensity <= 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = intensity;

  // Luminous sweeping sheen gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
  grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.02)');
  grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.02)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0.35)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}
