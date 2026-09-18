import { FilterSettings } from '../types/studio';
import { PATTERN_MAP, PatternItem } from './patternLibrary';
import { hexToRgb } from './colorExtractor';
import { renderProceduralPattern } from './patternRenderer';

/**
 * High-Speed Image Pixel Sampler
 */
export interface ImagePixelSampler {
  width: number;
  height: number;
  sample: (x: number, y: number) => {
    r: number;
    g: number;
    b: number;
    a: number;
    lum: number;
    hex: string;
  };
}

export function createImagePixelSampler(
  imageData: ImageData,
  contrast: number = 50,
  invert: boolean = false
): ImagePixelSampler {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;

  // Contrast curve exponent
  const contrastFactor = Math.max(0.2, Math.min(3.0, (contrast / 50)));

  return {
    width: w,
    height: h,
    sample: (x: number, y: number) => {
      const px = Math.max(0, Math.min(w - 1, Math.round(x)));
      const py = Math.max(0, Math.min(h - 1, Math.round(y)));
      const idx = (py * w + px) * 4;

      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3] / 255;

      // Perceptual luminance calculation
      let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      if (contrastFactor !== 1.0) {
        // S-curve contrast modulation
        lum = Math.pow(lum, 1 / contrastFactor);
      }

      if (invert) {
        lum = 1.0 - lum;
      }

      return {
        r,
        g,
        b,
        a,
        lum: Math.max(0, Math.min(1, lum)),
        hex: `rgb(${r},${g},${b})`,
      };
    },
  };
}

/**
 * Main Full Image Pattern Transformation Entry Point
 * Transforms the entire photograph into the selected pattern (Mosaic, Halftone, 3D Voxel, Stencil, or Duotone)
 */
export function applyFullImagePatternize(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: FilterSettings['patterns'],
  sourceImage: CanvasImageSource,
  fullSettings?: FilterSettings
): void {
  // 1. Render source image onto an offscreen buffer to extract ImageData
  const offscreen = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(w, h)
    : document.createElement('canvas');
  offscreen.width = w;
  offscreen.height = h;

  const oCtx = offscreen.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  if (!oCtx) return;

  oCtx.drawImage(sourceImage, 0, 0, w, h);
  const imageData = oCtx.getImageData(0, 0, w, h);

  const sampler = createImagePixelSampler(
    imageData,
    settings.patternizeContrast ?? 50,
    settings.patternizeInvert ?? false
  );

  const mode = settings.patternizeMode || 'mosaic';
  const fidelity = Math.max(0, Math.min(100, settings.patternizeFidelity ?? 75)) / 100;
  const bgColor = settings.backgroundColor && settings.backgroundColor !== 'transparent'
    ? settings.backgroundColor
    : '#080a10';

  // 2. Clear canvas and fill with backdrop tone
  ctx.save();
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);

  // Optional: subtle original photo underlay if fidelity is high
  if (fidelity > 0.1) {
    ctx.save();
    ctx.globalAlpha = fidelity * 0.28;
    ctx.drawImage(sourceImage, 0, 0, w, h);
    ctx.restore();
  }

  // 3. Dispatch to patternize mode
  switch (mode) {
    case '3d-voxel':
      render3DPhotoVoxelMode(ctx, w, h, settings, sampler);
      break;

    case 'halftone':
      renderHalftoneEngraveMode(ctx, w, h, settings, sampler);
      break;

    case 'stencil':
      renderStencilCutoutMode(ctx, w, h, settings, sourceImage, bgColor);
      break;

    case 'duotone':
      renderDuotoneTapestryMode(ctx, w, h, settings, sampler);
      break;

    case 'mosaic':
    default:
      renderColorMosaicMode(ctx, w, h, settings, sampler, sourceImage);
      break;
  }

  // 4. If fidelity > 0.5, apply a subtle soft-light photographic detail enhancement overlay
  if (fidelity > 0.5) {
    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.globalAlpha = (fidelity - 0.5) * 0.6;
    ctx.drawImage(sourceImage, 0, 0, w, h);
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Mode 1: 3D Photo Voxel Reconstruction
 * Reconstructs the photo as an illuminated 3D field of voxels, cubes, or pillars
 * where each voxel's height and color are derived directly from the photograph!
 */
function render3DPhotoVoxelMode(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: FilterSettings['patterns'],
  sampler: ImagePixelSampler
): void {
  const scale = settings.scale || 50;
  // Step size between voxels (14px - 60px)
  const step = Math.max(12, Math.round((scale / 100) * 36));
  const depth = settings.depth3D ?? 20;
  const lightAngleRad = ((settings.lightAngle3D ?? 135) * Math.PI) / 180;
  const sunX = Math.cos(lightAngleRad);
  const sunY = Math.sin(lightAngleRad);

  const halfStep = step * 0.5;
  const isoHeight = step * 0.577; // 30 deg isometric angle

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(0.5, (settings.strokeWidth ?? 1) * 0.6);

  // Iterate row by row (back to front painter's algorithm)
  for (let y = -step; y < h + step * 2; y += isoHeight) {
    for (let x = -step; x < w + step * 2; x += step) {
      const p = sampler.sample(x, y);
      if (p.a < 0.05) continue;

      // Voxel extrusion depth modulated by image brightness
      const hVoxel = Math.max(2, depth * (0.2 + p.lum * 0.9));

      // 3 Facet Shading Factors based on sun direction
      // Top face: bright ambient + sun
      const factorTop = Math.max(0.5, Math.min(1.2, 0.9 + (-sunY) * 0.25));
      // Left face
      const factorLeft = Math.max(0.3, Math.min(1.0, 0.7 - sunX * 0.3));
      // Right face
      const factorRight = Math.max(0.2, Math.min(1.0, 0.5 + sunX * 0.3));

      const rTop = Math.min(255, Math.round(p.r * factorTop));
      const gTop = Math.min(255, Math.round(p.g * factorTop));
      const bTop = Math.min(255, Math.round(p.b * factorTop));

      const rL = Math.min(255, Math.round(p.r * factorLeft));
      const gL = Math.min(255, Math.round(p.g * factorLeft));
      const bL = Math.min(255, Math.round(p.b * factorLeft));

      const rR = Math.min(255, Math.round(p.r * factorRight));
      const gR = Math.min(255, Math.round(p.g * factorRight));
      const bR = Math.min(255, Math.round(p.b * factorRight));

      const strokeColor = `rgba(0,0,0,0.3)`;

      // Draw Top Rhombus Face
      ctx.beginPath();
      ctx.moveTo(x, y - hVoxel);
      ctx.lineTo(x + halfStep, y - isoHeight * 0.5 - hVoxel);
      ctx.lineTo(x, y - isoHeight - hVoxel);
      ctx.lineTo(x - halfStep, y - isoHeight * 0.5 - hVoxel);
      ctx.closePath();
      ctx.fillStyle = `rgb(${rTop},${gTop},${bTop})`;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.stroke();

      // Draw Left Face
      ctx.beginPath();
      ctx.moveTo(x - halfStep, y - isoHeight * 0.5 - hVoxel);
      ctx.lineTo(x, y - hVoxel);
      ctx.lineTo(x, y);
      ctx.lineTo(x - halfStep, y - isoHeight * 0.5);
      ctx.closePath();
      ctx.fillStyle = `rgb(${rL},${gL},${bL})`;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.stroke();

      // Draw Right Face
      ctx.beginPath();
      ctx.moveTo(x, y - hVoxel);
      ctx.lineTo(x + halfStep, y - isoHeight * 0.5 - hVoxel);
      ctx.lineTo(x + halfStep, y - isoHeight * 0.5);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fillStyle = `rgb(${rR},${gR},${bR})`;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Mode 2: Photo Color Vector Mosaic
 * Every pattern tile (Hexagons, Diamonds, Voronoi, Cubes, Circles) or vector line
 * is rendered in the vibrant, sampled photographic colors of the image!
 */
function renderColorMosaicMode(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: FilterSettings['patterns'],
  sampler: ImagePixelSampler,
  sourceImage: CanvasImageSource
): void {
  const item = PATTERN_MAP.get(settings.type);
  const family = item?.family || 'hexagons';
  const scale = settings.scale || 50;
  const step = Math.max(10, Math.round((scale / 100) * 32));
  const strokeWidth = settings.strokeWidth ?? 1;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(0.5, strokeWidth * 0.75);

  if (family === 'hexagons' || settings.type.includes('hex')) {
    // Hexagonal Honeycomb Mosaic
    const r = step * 0.7;
    const hDist = r * Math.sqrt(3);
    for (let row = -1; row * r * 1.5 < h + r * 2; row++) {
      const y = row * r * 1.5;
      const xOffset = (Math.abs(row) % 2) * (hDist / 2);
      for (let col = -1; col * hDist < w + hDist * 2; col++) {
        const x = col * hDist + xOffset;
        const p = sampler.sample(x, y);

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (Math.PI / 3) * i + Math.PI / 6;
          const px = x + r * Math.cos(angle);
          const py = y + r * Math.sin(angle);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fillStyle = p.hex;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.stroke();
      }
    }
  } else if (family === 'diamonds' || settings.type.includes('dia')) {
    // Diamond Mosaic
    const half = step * 0.6;
    for (let y = -step; y < h + step; y += half) {
      const row = Math.round(y / half);
      const xOffset = (Math.abs(row) % 2) * half;
      for (let x = -step; x < w + step; x += step) {
        const cx = x + xOffset;
        const p = sampler.sample(cx, y);

        ctx.beginPath();
        ctx.moveTo(cx, y - half);
        ctx.lineTo(cx + half, y);
        ctx.lineTo(cx, y + half);
        ctx.lineTo(cx - half, y);
        ctx.closePath();
        ctx.fillStyle = p.hex;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.stroke();
      }
    }
  } else if (family === 'circles' || family === 'dots' || settings.type.includes('dot')) {
    // Polka Dot / Circular Halftone Mosaic
    const dotRadius = step * 0.45;
    for (let y = step * 0.5; y < h + step; y += step) {
      for (let x = step * 0.5; x < w + step; x += step) {
        const p = sampler.sample(x, y);
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.hex;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.stroke();
      }
    }
  } else if (family === '3d' || settings.is3D) {
    // Isometric 3D Voxel Mosaic
    render3DPhotoVoxelMode(ctx, w, h, settings, sampler);
  } else {
    // Universal Vector Color Mapping for ANY of the 500 patterns!
    // Step 1: Render vector pattern geometry on mask buffer
    const pBuf = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(w, h)
      : document.createElement('canvas');
    pBuf.width = w;
    pBuf.height = h;
    const pCtx = pBuf.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    renderProceduralPattern(pCtx, w, h, {
      ...settings,
      color: '#ffffff',
      backgroundColor: 'transparent',
      opacity: 100,
      glow: 0,
      blendMode: 'normal',
    });

    // Step 2: Composite the photograph through the vector pattern lines
    pCtx.globalCompositeOperation = 'source-in';
    pCtx.drawImage(sourceImage, 0, 0, w, h);

    // Step 3: Draw back to main canvas
    ctx.drawImage(pBuf, 0, 0, w, h);
  }

  ctx.restore();
}

/**
 * Mode 3: Luminance Halftone & Banknote Engraving
 * The image brightness directly carves and modulates the thickness and density
 * of the pattern vectors, creating a photorealistic vector engraving!
 */
function renderHalftoneEngraveMode(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: FilterSettings['patterns'],
  sampler: ImagePixelSampler
): void {
  const scale = settings.scale || 50;
  const step = Math.max(8, Math.round((scale / 100) * 24));
  const maxStroke = Math.max(1, (settings.strokeWidth ?? 2) * 2);
  const color = settings.color || '#00f0ff';
  const rotation = ((settings.rotation ?? 0) * Math.PI) / 180;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineCap = 'round';

  if (rotation !== 0) {
    ctx.translate(w / 2, h / 2);
    ctx.rotate(rotation);
    ctx.translate(-w / 2, -h / 2);
  }

  const pad = Math.round(Math.hypot(w, h) * 0.4);

  // Banknote / Laser Engraving Lines modulated by luminance
  for (let y = -pad; y < h + pad; y += step) {
    ctx.beginPath();
    let isDrawing = false;

    for (let x = -pad; x < w + pad; x += 4) {
      const p = sampler.sample(x, y);
      // Brightness modulates line weight
      const lineWeight = Math.max(0.3, maxStroke * p.lum);

      if (p.lum > 0.05) {
        if (!isDrawing) {
          ctx.moveTo(x, y);
          isDrawing = true;
        } else {
          ctx.lineTo(x, y);
        }
      } else {
        isDrawing = false;
      }
    }
    ctx.lineWidth = maxStroke;
    ctx.stroke();

    // Secondary pass: Draw modulated dot beads along the engraving line
    for (let x = -pad; x < w + pad; x += step * 0.75) {
      const p = sampler.sample(x, y);
      const dotRadius = Math.max(0.5, (step * 0.45) * p.lum);
      if (dotRadius > 0.8) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

/**
 * Mode 4: Geometric Pattern Stencil Cutout
 * Clips the photograph strictly inside the pattern strokes and geometry
 */
function renderStencilCutoutMode(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: FilterSettings['patterns'],
  sourceImage: CanvasImageSource,
  bgColor: string
): void {
  const maskBuf = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(w, h)
    : document.createElement('canvas');
  maskBuf.width = w;
  maskBuf.height = h;
  const mCtx = maskBuf.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  // Render solid pattern vectors onto mask
  renderProceduralPattern(mCtx, w, h, {
    ...settings,
    color: '#ffffff',
    backgroundColor: 'transparent',
    opacity: 100,
    glow: 0,
    strokeWidth: Math.max(2, (settings.strokeWidth ?? 1) * 2),
    blendMode: 'normal',
  });

  // Clip photo through the pattern
  mCtx.globalCompositeOperation = 'source-in';
  mCtx.drawImage(sourceImage, 0, 0, w, h);

  // Fill backdrop and draw stencil
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(maskBuf, 0, 0, w, h);
}

/**
 * Mode 5: Duotone Vector Tapestry
 * Maps image luminance between Primary Pattern Color and Secondary Background Tint
 */
function renderDuotoneTapestryMode(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: FilterSettings['patterns'],
  sampler: ImagePixelSampler
): void {
  const cPri = hexToRgb(settings.color || '#00f0ff');
  const cSec = hexToRgb(settings.backgroundColor && settings.backgroundColor !== 'transparent' ? settings.backgroundColor : '#1a0b2e');

  const scale = settings.scale || 50;
  const step = Math.max(10, Math.round((scale / 100) * 28));

  ctx.save();
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const p = sampler.sample(x + step * 0.5, y + step * 0.5);
      const t = p.lum;

      // Duotone interpolation
      const r = Math.round(cSec.r + (cPri.r - cSec.r) * t);
      const g = Math.round(cSec.g + (cPri.g - cSec.g) * t);
      const b = Math.round(cSec.b + (cPri.b - cSec.b) * t);

      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.fillRect(x, y, step, step);

      // Micro vector line
      ctx.strokeStyle = `rgba(${cPri.r},${cPri.g},${cPri.b},${0.3 + t * 0.7})`;
      ctx.lineWidth = Math.max(0.5, t * 2);
      ctx.strokeRect(x, y, step, step);
    }
  }
  ctx.restore();
}
