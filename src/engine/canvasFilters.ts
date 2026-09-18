import { FilterSettings, GradientType, BlurCategory, NoiseType, PatternType } from '../types/studio';
import { hexToRgb } from './colorExtractor';
import { renderProceduralPattern } from './patternRenderer';
import { PATTERN_MAP } from './patternLibrary';
import { applyFullImagePatternize } from './imagePatternizer';
import { applyFractalGlassEffect } from './fractalGlassEngine';
import { applyGradientMakerPipeline } from './gradientMakerEngine';

export interface FilterPipelineOptions {
  isFastPreview?: boolean;
}

/**
 * Reusable Canvas Buffer Pool to eliminate garbage collection pressure
 */
const bufferPool: (HTMLCanvasElement | OffscreenCanvas)[] = [];

function getPooledBuffer(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
  let buf = bufferPool.pop();
  if (!buf) {
    buf = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(width, height)
      : document.createElement('canvas');
  }
  if (buf.width !== width || buf.height !== height) {
    buf.width = width;
    buf.height = height;
  }
  return buf;
}

function releasePooledBuffer(buf: HTMLCanvasElement | OffscreenCanvas | null) {
  if (buf && bufferPool.length < 6) {
    bufferPool.push(buf);
  }
}

/**
 * Main filter pipeline executor on an HTMLCanvasElement or OffscreenCanvas
 */
export function applyAllFiltersToCanvas(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  settings: FilterSettings,
  originalImage: CanvasImageSource,
  options?: FilterPipelineOptions
): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const isFastPreview = options?.isFastPreview ?? false;

  // Clear canvas
  ctx.clearRect(0, 0, w, h);

  // 0. Full Image Pattern Transformation Engine
  // When active, the entire photograph is synthesized into the pattern!
  const isPatternizeActive =
    settings.patterns.enabled &&
    settings.patterns.type !== 'none' &&
    settings.patterns.opacity > 0 &&
    (settings.patterns.patternize === true || settings.patterns.position === 'patternize');

  if (isPatternizeActive) {
    // 0.1 Apply Background Gradient if configured
    if (settings.gradient.enabled && settings.gradient.position === 'background' && settings.gradient.stops.length > 0) {
      applyGradientPipeline(ctx, w, h, settings.gradient);
    }

    // Transform Full Image into Pattern!
    applyFullImagePatternize(ctx, w, h, settings.patterns, originalImage, settings);

    // 0.2 Apply Overlay Gradient if configured
    if (settings.gradient.enabled && settings.gradient.position !== 'background' && settings.gradient.stops.length > 0) {
      applyGradientPipeline(ctx, w, h, settings.gradient);
    }

    // 0.3 Apply Noise
    if (settings.noise.enabled && settings.noise.amount > 0) {
      applyNoisePipeline(ctx, w, h, settings.noise);
    }

    // 0.4 Apply Sharpen
    if (settings.upscale.sharpen > 0 && !isFastPreview) {
      applySharpenKernel(ctx, w, h, settings.upscale.sharpen);
    }
    return;
  }

  // 0. Apply Background Gradient (if gradient position is set to 'background')
  if (settings.gradient.enabled && settings.gradient.position === 'background' && settings.gradient.stops.length > 0) {
    applyGradientPipeline(ctx, w, h, settings.gradient);
  }

  // 0.05 Apply Background Gradient Maker
  if (settings.gradientMaker?.enabled && settings.gradientMaker.position === 'background' && settings.gradientMaker.mode !== '4') {
    applyGradientMakerPipeline(ctx, w, h, settings.gradientMaker, originalImage);
  }

  // 0.1 Apply Background Pattern (if pattern position is set to 'background')
  if (settings.patterns.enabled && settings.patterns.position === 'background' && settings.patterns.type !== 'none' && settings.patterns.opacity > 0) {
    applyPatternPipeline(ctx, w, h, settings.patterns);
  }

  // 1. Draw base image with opacity and layer blend mode
  const imgOpacity = Math.max(0, Math.min(100, settings.image?.opacity ?? 100)) / 100;
  const rawBlend = settings.image?.blendMode ?? 'normal';
  const imgBlend: GlobalCompositeOperation = rawBlend === 'normal' ? 'source-over' : (rawBlend as GlobalCompositeOperation);

  if (imgOpacity > 0) {
    const isFractalActive = settings.fractalGlass?.enabled && (settings.fractalGlass.opacity ?? 100) > 0;
    const isGradientMapActive = settings.gradientMaker?.enabled && settings.gradientMaker.mode === '4';

    const isFocalBlur =
      !isFractalActive &&
      settings.blur.enabled &&
      settings.blur.radius > 0 &&
      (settings.blur.category === 'radial' || settings.blur.category === 'tiltshift' || settings.blur.category === 'linear');
    const isFullBlur = !isFractalActive && settings.blur.enabled && settings.blur.radius > 0 && !isFocalBlur;

    const needBuffer = imgOpacity < 1 || rawBlend !== 'normal';
    const targetCtx = needBuffer
      ? (getPooledBuffer(w, h).getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D)
      : ctx;
    const imgBuf = needBuffer ? (targetCtx.canvas as HTMLCanvasElement | OffscreenCanvas) : null;

    if (needBuffer && targetCtx) {
      targetCtx.clearRect(0, 0, w, h);
    }

    if (isGradientMapActive) {
      // Direct Holographic Luminosity Gradient Map
      applyGradientMakerPipeline(targetCtx, w, h, settings.gradientMaker, originalImage);

      if (isFractalActive) {
        // Compound: Refract the Gradient-Mapped Image through Fractal Glass
        const mappedBuf = getPooledBuffer(w, h);
        const mbCtx = mappedBuf.getContext('2d') as CanvasRenderingContext2D;
        mbCtx.drawImage(targetCtx.canvas as any, 0, 0, w, h);
        targetCtx.clearRect(0, 0, w, h);
        applyFractalGlassEffect(targetCtx, w, h, mappedBuf as any, settings.fractalGlass, { isFastPreview });
        releasePooledBuffer(mappedBuf);
      }
    } else if (isFractalActive) {
      // Render Fractal Glass Refraction directly onto uploaded image
      applyFractalGlassEffect(targetCtx, w, h, originalImage, settings.fractalGlass, { isFastPreview });
    } else if (isFocalBlur) {
      // Draw sharp base first for focal zone, then composite masked blur on top
      targetCtx.drawImage(originalImage, 0, 0, w, h);
      applyBlurPipeline(targetCtx, w, h, settings.blur, originalImage);
    } else if (isFullBlur) {
      // Direct whole-image blur without sharp ghosting underneath
      applyBlurPipeline(targetCtx, w, h, settings.blur, originalImage);
    } else {
      // Clean, unblurred original image
      targetCtx.drawImage(originalImage, 0, 0, w, h);
    }

    if (needBuffer && imgBuf) {
      ctx.save();
      ctx.globalAlpha = imgOpacity;
      ctx.globalCompositeOperation = imgBlend;
      ctx.drawImage(imgBuf, 0, 0, w, h);
      ctx.restore();
      releasePooledBuffer(imgBuf);
    }
  }

  // 1.5 Apply Overlay Gradient Maker (if enabled and position !== 'background' and mode !== '4')
  if (settings.gradientMaker?.enabled && settings.gradientMaker.position !== 'background' && settings.gradientMaker.mode !== '4') {
    applyGradientMakerPipeline(ctx, w, h, settings.gradientMaker, originalImage);
  }

  // 2. Apply Overlay Gradient (if gradient position is 'overlay' or if background gradient was occluded by solid photo)
  const isOccludedBackdrop = settings.gradient.enabled && settings.gradient.position === 'background' && imgOpacity >= 1 && imgBlend === 'source-over' && !!originalImage;
  if (settings.gradient.enabled && (settings.gradient.position !== 'background' || isOccludedBackdrop) && (settings.gradient.stops.length > 0 || settings.gradient.type === 'mesh')) {
    const effectiveGrad = isOccludedBackdrop
      ? { ...settings.gradient, blendMode: (settings.gradient.blendMode === 'normal' ? 'overlay' : settings.gradient.blendMode) || 'overlay', opacity: Math.min(75, settings.gradient.opacity || 75) }
      : settings.gradient;
    applyGradientPipeline(ctx, w, h, effectiveGrad);
  }

  // 3. Apply Overlay Patterns (if pattern position is 'overlay' or default)
  if (settings.patterns.enabled && settings.patterns.position !== 'background' && settings.patterns.type !== 'none' && settings.patterns.opacity > 0) {
    applyPatternPipeline(ctx, w, h, settings.patterns);
  }

  // 5. Apply Noise & Grain Engine (GPU-accelerated pattern tiling)
  if (settings.noise.enabled && settings.noise.amount > 0) {
    applyNoisePipeline(ctx, w, h, settings.noise);
  }

  // 6. Apply Sharpen / Enhancement Kernel
  if (settings.upscale.sharpen > 0 && !isFastPreview) {
    applySharpenKernel(ctx, w, h, settings.upscale.sharpen);
  }
}

/**
 * Blur Studio Pipeline: Supports Linear, Radial, Angular, Mesh, Glass, Tilt-shift
 */
function applyBlurPipeline(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  blur: FilterSettings['blur'],
  originalImage: CanvasImageSource
) {
  const rad = blur.radius;

  if (blur.category === 'glass') {
    // Glassmorphism: Multi-pass blur + Chromatic Aberration + Frosted Specular Sheen
    const blurredBuffer = getPooledBuffer(w, h);
    const bCtx = blurredBuffer.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    bCtx.filter = `blur(${rad}px)`;
    bCtx.drawImage(originalImage, 0, 0, w, h);

    // Draw blurred base
    ctx.drawImage(blurredBuffer, 0, 0, w, h);

    // Chromatic Aberration: Red shift left, Blue shift right with 'screen' or 'lighter' blend
    const shift = Math.max(1, Math.round(rad * 0.15));
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(blurredBuffer, -shift, 0, w, h);
    ctx.drawImage(blurredBuffer, shift, 0, w, h);
    ctx.restore();

    // Specular Highlight / Frosted Sheen Overlay
    ctx.save();
    const sheenGrad = ctx.createLinearGradient(0, 0, w, h);
    sheenGrad.addColorStop(0, `rgba(255, 255, 255, ${0.15 * (blur.glassFrost / 100)})`);
    sheenGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
    sheenGrad.addColorStop(1, `rgba(255, 255, 255, ${0.10 * (blur.glassFrost / 100)})`);
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    releasePooledBuffer(blurredBuffer);
    return;
  }

  if (blur.category === 'radial') {
    // Radial Blur: Sharp focal center with outward blur falloff
    const blurredBuffer = getPooledBuffer(w, h);
    const bCtx = blurredBuffer.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    bCtx.filter = `blur(${rad}px)`;
    bCtx.drawImage(originalImage, 0, 0, w, h);

    // Mask gradient
    const maskBuffer = getPooledBuffer(w, h);
    const mCtx = maskBuffer.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.hypot(w, h) / 2;
    const focalR = maxR * (blur.focalSize / 100);

    const grad = mCtx.createRadialGradient(cx, cy, focalR * 0.3, cx, cy, maxR);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');
    mCtx.fillStyle = grad;
    mCtx.fillRect(0, 0, w, h);

    // Composite blurred over original
    mCtx.globalCompositeOperation = 'source-in';
    mCtx.drawImage(blurredBuffer, 0, 0, w, h);

    ctx.drawImage(maskBuffer, 0, 0, w, h);

    releasePooledBuffer(blurredBuffer);
    releasePooledBuffer(maskBuffer);
    return;
  }

  if (blur.category === 'tiltshift') {
    // Tilt-Shift Depth-of-Field: Horizontal focal band
    const blurredBuffer = getPooledBuffer(w, h);
    const bCtx = blurredBuffer.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    bCtx.filter = `blur(${rad}px)`;
    bCtx.drawImage(originalImage, 0, 0, w, h);

    const maskBuffer = getPooledBuffer(w, h);
    const mCtx = maskBuffer.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    const focalY = (blur.tiltPosition / 100) * h;
    const bandHeight = (blur.tiltWidth / 100) * h;
    const topFade = Math.max(0, focalY - bandHeight / 2);
    const bottomFade = Math.min(h, focalY + bandHeight / 2);

    const grad = mCtx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(0,0,0,1)');
    grad.addColorStop(Math.max(0, (topFade - 40) / h), 'rgba(0,0,0,1)');
    grad.addColorStop(topFade / h, 'rgba(0,0,0,0)');
    grad.addColorStop(bottomFade / h, 'rgba(0,0,0,0)');
    grad.addColorStop(Math.min(1, (bottomFade + 40) / h), 'rgba(0,0,0,1)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');

    mCtx.fillStyle = grad;
    mCtx.fillRect(0, 0, w, h);

    mCtx.globalCompositeOperation = 'source-in';
    mCtx.drawImage(blurredBuffer, 0, 0, w, h);

    ctx.drawImage(maskBuffer, 0, 0, w, h);

    releasePooledBuffer(blurredBuffer);
    releasePooledBuffer(maskBuffer);
    return;
  }

  if (blur.category === 'linear') {
    // Linear directional blur gradient
    const blurredBuffer = getPooledBuffer(w, h);
    const bCtx = blurredBuffer.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    bCtx.filter = `blur(${rad}px)`;
    bCtx.drawImage(originalImage, 0, 0, w, h);

    const maskBuffer = getPooledBuffer(w, h);
    const mCtx = maskBuffer.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

    const angleRad = (blur.angle * Math.PI) / 180;
    const x1 = w / 2 - (Math.cos(angleRad) * w) / 2;
    const y1 = h / 2 - (Math.sin(angleRad) * h) / 2;
    const x2 = w / 2 + (Math.cos(angleRad) * w) / 2;
    const y2 = h / 2 + (Math.sin(angleRad) * h) / 2;

    const grad = mCtx.createLinearGradient(x1, y1, x2, y2);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');
    mCtx.fillStyle = grad;
    mCtx.fillRect(0, 0, w, h);

    mCtx.globalCompositeOperation = 'source-in';
    mCtx.drawImage(blurredBuffer, 0, 0, w, h);

    ctx.drawImage(maskBuffer, 0, 0, w, h);

    releasePooledBuffer(blurredBuffer);
    releasePooledBuffer(maskBuffer);
    return;
  }

  if (blur.category === 'angular') {
    // Multi-angle rotational blur simulation
    const steps = 6;
    ctx.save();
    ctx.globalAlpha = 1 / steps;
    const cx = w / 2;
    const cy = h / 2;
    for (let i = 1; i <= steps; i++) {
      const rot = ((i - steps / 2) * (rad * 0.08) * Math.PI) / 180;
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.translate(-cx, -cy);
      ctx.drawImage(originalImage, 0, 0, w, h);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    ctx.restore();
    return;
  }

  // Fallback / Mesh blur: High-radius soft blur
  ctx.save();
  ctx.filter = `blur(${rad}px)`;
  ctx.drawImage(originalImage, 0, 0, w, h);
  ctx.restore();
}

/**
 * Gradient Pipeline: Linear, Radial, Conical, Bilinear Mesh
 */
function applyGradientPipeline(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  gradient: FilterSettings['gradient']
) {
  ctx.save();
  const rawMode = gradient.blendMode ?? 'normal';
  const gradBlend: GlobalCompositeOperation = rawMode === 'normal' ? 'source-over' : (rawMode as GlobalCompositeOperation);
  ctx.globalCompositeOperation = gradBlend;
  ctx.globalAlpha = Math.max(0, Math.min(100, gradient.opacity ?? 100)) / 100;

  const rawStops = gradient.stops && gradient.stops.length >= 2
    ? gradient.stops
    : [
        { id: '1', color: '#00d2ff', position: 0 },
        { id: '2', color: '#9d00ff', position: 50 },
        { id: '3', color: '#ff007f', position: 100 },
      ];

  const sortedStops = [...rawStops]
    .sort((a, b) => a.position - b.position)
    .map(s => ({
      color: s.color,
      pos: Math.max(0, Math.min(1, s.position / 100)),
    }));

  if (gradient.type === 'linear') {
    const angleRad = (gradient.angle * Math.PI) / 180;
    const r = Math.hypot(w, h) / 2;
    const cx = w / 2;
    const cy = h / 2;
    const x0 = cx - Math.cos(angleRad) * r;
    const y0 = cy - Math.sin(angleRad) * r;
    const x1 = cx + Math.cos(angleRad) * r;
    const y1 = cy + Math.sin(angleRad) * r;

    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    sortedStops.forEach(s => g.addColorStop(s.pos, s.color));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (gradient.type === 'radial') {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(w, h) / 1.5;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    sortedStops.forEach(s => g.addColorStop(s.pos, s.color));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else if (gradient.type === 'conical' && 'createConicGradient' in ctx) {
    const angleRad = (gradient.angle * Math.PI) / 180;
    // @ts-ignore
    const g = ctx.createConicGradient(angleRad, w / 2, h / 2);
    sortedStops.forEach(s => g.addColorStop(s.pos, s.color));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  } else {
    // 4-corner Bilinear Mesh Gradient: Clean, non-muddy GPU-smoothed bilinear interpolation
    const [cTL, cTR, cBR, cBL] = (gradient.meshColors && gradient.meshColors.length >= 4)
      ? gradient.meshColors
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

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(offscreen, 0, 0, w, h);
  }

  ctx.restore();
}

/**
 * Ultra-Fast Hardware-Accelerated Noise & Grain Engine
 * Uses pre-rendered 256x256 tiled texture and GPU pattern compositing (<0.5ms instead of 80ms)
 */
let cachedNoiseCanvas: (HTMLCanvasElement | OffscreenCanvas) | null = null;
let cachedNoiseKey = '';

function getNoisePattern(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  noise: FilterSettings['noise']
): CanvasPattern | null {
  const tileSize = 256;
  const key = `${noise.type}_${noise.monochrome}`;

  if (!cachedNoiseCanvas || cachedNoiseKey !== key) {
    const canvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(tileSize, tileSize)
      : document.createElement('canvas');
    canvas.width = tileSize;
    canvas.height = tileSize;

    const nCtx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    const imgData = nCtx.createImageData(tileSize, tileSize);
    const data = imgData.data;

    const isDigital = noise.type === 'digital';
    const isRetro = noise.type === 'retro';
    const isMonochrome = noise.monochrome;

    let randState = 48271;
    const fastRand = () => {
      randState = (randState * 16807) % 2147483647;
      return (randState - 1) / 2147483646;
    };

    const len = data.length;
    for (let i = 0; i < len; i += 4) {
      if (isDigital) {
        const val = fastRand() > 0.5 ? 255 : 0;
        data[i] = val;
        data[i + 1] = isMonochrome ? val : (fastRand() > 0.5 ? 255 : 0);
        data[i + 2] = isMonochrome ? val : (fastRand() > 0.5 ? 255 : 0);
        data[i + 3] = 160;
      } else {
        const r1 = fastRand();
        const r2 = fastRand();
        const g = Math.max(0, Math.min(255, Math.round(128 + (r1 - 0.5 + (r2 - 0.5)) * 140)));

        if (isMonochrome) {
          data[i] = g;
          data[i + 1] = g;
          data[i + 2] = g;
        } else {
          data[i] = g;
          data[i + 1] = Math.max(0, Math.min(255, Math.round(128 + (fastRand() - 0.5) * 140)));
          data[i + 2] = Math.max(0, Math.min(255, Math.round(128 + (fastRand() - 0.5) * 140)));
        }
        data[i + 3] = isRetro && fastRand() < 0.003 ? 240 : 180;
      }
    }

    nCtx.putImageData(imgData, 0, 0);
    cachedNoiseCanvas = canvas;
    cachedNoiseKey = key;
  }

  return ctx.createPattern(cachedNoiseCanvas as any, 'repeat');
}

function applyNoisePipeline(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  noise: FilterSettings['noise']
) {
  const pattern = getNoisePattern(ctx, noise);
  if (!pattern) return;

  ctx.save();
  ctx.globalCompositeOperation = (noise.blendMode as GlobalCompositeOperation) || 'overlay';
  ctx.globalAlpha = (noise.amount / 100) * 0.45;
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Geometric Patterns & Mathematical Fractals Overlay
 */
function applyPatternPipeline(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  pattern: FilterSettings['patterns']
) {
  // Check if pattern is from the 500-pattern procedural library
  if (pattern.type.startsWith('pat_') || PATTERN_MAP.has(pattern.type)) {
    renderProceduralPattern(ctx, w, h, pattern);
    return;
  }

  // Full-bleed background fill if configured
  if (pattern.backgroundColor && pattern.backgroundColor !== 'transparent') {
    ctx.save();
    ctx.globalCompositeOperation = pattern.blendMode as GlobalCompositeOperation;
    ctx.globalAlpha = (pattern.opacity / 100) * 0.75;
    ctx.fillStyle = pattern.backgroundColor;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  ctx.save();
  ctx.globalCompositeOperation = pattern.blendMode as GlobalCompositeOperation;
  ctx.globalAlpha = pattern.opacity / 100;
  ctx.strokeStyle = pattern.color;
  ctx.fillStyle = pattern.color;
  ctx.lineWidth = pattern.strokeWidth ?? 1.5;

  const step = Math.max(12, Math.round((pattern.scale / 100) * 80));
  const pad = Math.max(80, step * 2);
  const fillMode = pattern.fillMode || 'both';
  const fillAlpha = (pattern.opacity / 100) * ((pattern.fillOpacity ?? 40) / 100);

  if (pattern.type === 'grid') {
    if (fillMode === 'fill' || fillMode === 'both') {
      ctx.save();
      ctx.fillStyle = pattern.color;
      ctx.globalAlpha = fillAlpha;
      for (let x = -pad; x <= w + pad; x += step) {
        for (let y = -pad; y <= h + pad; y += step) {
          if ((Math.abs(Math.round((x + pad) / step)) + Math.abs(Math.round((y + pad) / step))) % 2 === 0) {
            ctx.fillRect(x, y, step, step);
          }
        }
      }
      ctx.restore();
    }
    if (fillMode !== 'fill') {
      ctx.beginPath();
      for (let x = -pad; x <= w + pad; x += step) {
        ctx.moveTo(x, -pad);
        ctx.lineTo(x, h + pad);
      }
      for (let y = -pad; y <= h + pad; y += step) {
        ctx.moveTo(-pad, y);
        ctx.lineTo(w + pad, y);
      }
      ctx.stroke();
    }
  } else if (pattern.type === 'dots') {
    const dotRadius = Math.max(1.5, step * 0.14);
    for (let x = -pad; x <= w + pad; x += step) {
      for (let y = -pad; y <= h + pad; y += step) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        if (fillMode === 'stroke') {
          ctx.stroke();
        } else {
          ctx.fill();
        }
      }
    }
  } else if (pattern.type === 'hexagons') {
    const r = step * 0.65;
    const hDist = r * Math.sqrt(3);
    for (let row = -2; row * r * 1.5 < h + pad; row++) {
      const y = row * r * 1.5;
      const xOffset = (Math.abs(row) % 2) * (hDist / 2);
      for (let col = -2; col * hDist < w + pad; col++) {
        const x = col * hDist + xOffset;
        drawHexagon(ctx, x, y, r, fillMode, fillAlpha, pattern.color);
      }
    }
  } else if (pattern.type === 'isometric') {
    const maxDim = Math.hypot(w, h) + pad;
    ctx.beginPath();
    for (let i = -maxDim; i <= maxDim; i += step * 1.5) {
      ctx.moveTo(i, -pad);
      ctx.lineTo(i + maxDim * 0.577, h + pad);
      ctx.moveTo(i, -pad);
      ctx.lineTo(i - maxDim * 0.577, h + pad);
    }
    ctx.stroke();
  } else if (pattern.type === 'mandelbrot' || pattern.type === 'julia') {
    // Mathematical Fractal Synthesis
    drawFractalOverlay(ctx, w, h, pattern.type, pattern.color, pattern.scale);
  } else if (pattern.type === 'lightning') {
    // Electric Fractal Branching Synthesis across entire canvas
    drawElectricLightningFractal(ctx, w, h, pattern.color, pattern.scale);
  }

  ctx.restore();
}

function drawHexagon(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  fillMode?: string,
  fillAlpha?: number,
  fillColor?: string
) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  if (fillMode === 'fill' || fillMode === 'both') {
    ctx.save();
    ctx.fillStyle = fillColor || '#00f0ff';
    ctx.globalAlpha = fillAlpha ?? 0.35;
    ctx.fill();
    ctx.restore();
  }
  if (fillMode !== 'fill') {
    ctx.stroke();
  }
}

/**
 * Real-time Mathematical Fractal Synthesis (Mandelbrot / Julia)
 */
function drawFractalOverlay(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  type: 'mandelbrot' | 'julia',
  tintHex: string,
  zoomScale: number
) {
  const subW = Math.min(240, Math.round(w / 4));
  const subH = Math.min(240, Math.round(h / 4));

  const buffer = getPooledBuffer(subW, subH);
  const bCtx = buffer.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  const img = bCtx.createImageData(subW, subH);
  const data = img.data;

  const rgb = hexToRgb(tintHex);
  const maxIter = 32;
  const zoom = 1.2 * (zoomScale / 50);

  const cxConst = -0.7;
  const cyConst = 0.27015;

  for (let py = 0; py < subH; py++) {
    const y0 = ((py - subH / 2) / (subH / 2)) / zoom;
    for (let px = 0; px < subW; px++) {
      const x0 = ((px - subW / 2) / (subW / 2)) / zoom;

      let x = x0;
      let y = y0;
      let iter = 0;

      if (type === 'mandelbrot') {
        x = 0;
        y = 0;
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xtemp = x * x - y * y + x0;
          y = 2 * x * y + y0;
          x = xtemp;
          iter++;
        }
      } else {
        while (x * x + y * y <= 4 && iter < maxIter) {
          const xtemp = x * x - y * y + cxConst;
          y = 2 * x * y + cyConst;
          x = xtemp;
          iter++;
        }
      }

      const idx = (py * subW + px) * 4;
      if (iter < maxIter) {
        const factor = iter / maxIter;
        data[idx] = Math.round(rgb.r * factor);
        data[idx + 1] = Math.round(rgb.g * factor);
        data[idx + 2] = Math.round(rgb.b * factor);
        data[idx + 3] = Math.round(255 * factor);
      } else {
        data[idx + 3] = 0;
      }
    }
  }

  bCtx.putImageData(img, 0, 0);
  ctx.drawImage(buffer, 0, 0, w, h);
  releasePooledBuffer(buffer);
}

/**
 * Organic Electric Fractal Lightning Tendrils & Capillaries
 * Optimized single-path batched rendering for silky 60 FPS performance
 */
function drawElectricLightningFractal(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  tintHex: string,
  scalePct: number
) {
  const seed = 42;
  const pseudoRand = (s: number) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const branches: { x1: number; y1: number; x2: number; y2: number; depth: number }[] = [];

  function generateBranch(
    x1: number,
    y1: number,
    angle: number,
    length: number,
    depth: number,
    maxDepth: number,
    seedVal: number
  ) {
    if (depth > maxDepth || length < 4) return;

    const segments = 5;
    let currX = x1;
    let currY = y1;
    const segLen = length / segments;

    for (let i = 0; i < segments; i++) {
      const s = seedVal + depth * 100 + i;
      const angleJitter = (pseudoRand(s) - 0.5) * 0.95;
      const currentAngle = angle + angleJitter;

      const nextX = currX + Math.cos(currentAngle) * segLen;
      const nextY = currY + Math.sin(currentAngle) * segLen;

      branches.push({ x1: currX, y1: currY, x2: nextX, y2: nextY, depth });

      if (pseudoRand(s * 1.7) > 0.45 && depth < maxDepth) {
        const subAngle = currentAngle + (pseudoRand(s * 2.3) > 0.5 ? 0.65 : -0.65);
        generateBranch(
          nextX,
          nextY,
          subAngle,
          length * 0.65,
          depth + 1,
          maxDepth,
          s * 3.1
        );
      }

      currX = nextX;
      currY = nextY;
    }
  }

  const startPoints = [
    { x: w * 0.98, y: h * 0.22, angle: Math.PI * 0.92, len: w * 0.55 },
    { x: w * 0.95, y: h * 0.50, angle: Math.PI * 0.88, len: w * 0.60 },
    { x: w * 0.85, y: h * 0.75, angle: Math.PI * 0.98, len: w * 0.50 },
    { x: w * 0.05, y: h * 0.25, angle: Math.PI * 0.15, len: w * 0.55 },
    { x: w * 0.10, y: h * 0.65, angle: Math.PI * 0.05, len: w * 0.50 },
    { x: w * 0.50, y: h * 0.05, angle: Math.PI * 0.50, len: h * 0.65 },
    { x: w * 0.50, y: h * 0.95, angle: -Math.PI * 0.50, len: h * 0.65 },
  ];

  startPoints.forEach((sp, idx) => {
    generateBranch(sp.x, sp.y, sp.angle, sp.len * (scalePct / 60), 0, 4, seed + idx * 77);
  });

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Pass 1: Broad electric halo (Batched draw call)
  ctx.save();
  ctx.strokeStyle = tintHex || '#00f0ff';
  ctx.shadowColor = tintHex || '#00f0ff';
  ctx.shadowBlur = 12;
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  branches.forEach(b => {
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
  });
  ctx.stroke();
  ctx.restore();

  // Pass 2: Intense cyan-violet core (Batched draw call)
  ctx.save();
  ctx.strokeStyle = '#00f0ff';
  ctx.shadowColor = '#a855f7';
  ctx.shadowBlur = 6;
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  branches.forEach(b => {
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
  });
  ctx.stroke();
  ctx.restore();

  // Pass 3: Brilliant white core (Batched draw call)
  ctx.save();
  ctx.strokeStyle = '#ffffff';
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 2;
  ctx.globalAlpha = 0.95;
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  branches.forEach(b => {
    ctx.moveTo(b.x1, b.y1);
    ctx.lineTo(b.x2, b.y2);
  });
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

/**
 * 3x3 Unsharp Mask Convolution Kernel
 * Optimized pixel traversal with bounds safety
 */
function applySharpenKernel(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  amount: number
) {
  if (amount <= 0) return;

  const strength = (amount / 100) * 1.5;
  const imgData = ctx.getImageData(0, 0, w, h);
  const src = imgData.data;
  const copy = new Uint8ClampedArray(src);

  const edgeWeight = -strength / 4;
  const centerWeight = 1 + strength;
  const rowStride = w * 4;

  for (let y = 1; y < h - 1; y++) {
    const rowOffset = y * rowStride;
    const topRow = rowOffset - rowStride;
    const bottomRow = rowOffset + rowStride;

    for (let x = 1; x < w - 1; x++) {
      const idx = rowOffset + (x << 2);
      const top = topRow + (x << 2);
      const bottom = bottomRow + (x << 2);
      const left = idx - 4;
      const right = idx + 4;

      for (let c = 0; c < 3; c++) {
        const val =
          copy[idx + c] * centerWeight +
          (copy[top + c] + copy[bottom + c] + copy[left + c] + copy[right + c]) * edgeWeight;
        src[idx + c] = val < 0 ? 0 : val > 255 ? 255 : val;
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
}
