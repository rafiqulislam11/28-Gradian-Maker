import {
  Project,
  Layer,
  ImageLayer,
  GradientLayer,
  PatternLayer,
  ShapeLayer,
  TextLayer,
  BlurLayer,
  GlassLayer,
  NoiseLayer,
  GlowLayer,
  ColorGradeLayer,
  ShadowLayer,
  AdjustmentLayer,
  Transform,
  BlendMode,
  LayerMask,
} from '../../types/project';
import { applyImageAdjustments } from '../effects/colorGradingEngine';
import { renderProceduralPattern } from '../patternRenderer';
import { PATTERN_MAP } from '../patternLibrary';
import { applyFractalGlassEffect } from '../fractalGlassEngine';
import { hexToRgb } from '../colorExtractor';
import { applyFullImagePatternize } from '../imagePatternizer';

export interface RenderContextOptions {
  isFastPreview?: boolean;
  activeLayerId?: string | null;
  drawGizmo?: boolean;
}

// Canvas buffer cache to avoid allocation overhead during active 60fps manipulation
const bufferPool: (HTMLCanvasElement | OffscreenCanvas)[] = [];

export function getCompositorBuffer(width: number, height: number): HTMLCanvasElement | OffscreenCanvas {
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

export function releaseCompositorBuffer(buf: HTMLCanvasElement | OffscreenCanvas | null): void {
  if (buf && bufferPool.length < 8) {
    bufferPool.push(buf);
  }
}

/**
 * Maps CSS/Photoshop blend modes to Canvas GlobalCompositeOperation
 */
export function blendModeToCompositeOp(mode: BlendMode): GlobalCompositeOperation {
  switch (mode) {
    case 'normal':
      return 'source-over';
    case 'multiply':
      return 'multiply';
    case 'screen':
      return 'screen';
    case 'overlay':
      return 'overlay';
    case 'soft-light':
      return 'soft-light';
    case 'hard-light':
      return 'hard-light';
    case 'color-dodge':
      return 'color-dodge';
    case 'color-burn':
      return 'color-burn';
    case 'darken':
      return 'darken';
    case 'lighten':
      return 'lighten';
    case 'difference':
      return 'difference';
    case 'exclusion':
      return 'exclusion';
    case 'hue':
      return 'hue';
    case 'saturation':
      return 'saturation';
    case 'color':
      return 'color';
    case 'luminosity':
      return 'luminosity';
    default:
      return 'source-over';
  }
}

/**
 * Image Cache for Image Layers
 */
const imageElementCache = new Map<string, HTMLImageElement>();

export function getCachedImage(src: string): HTMLImageElement | null {
  if (!src) return null;
  let img = imageElementCache.get(src);
  if (!img) {
    img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    imageElementCache.set(src, img);
  }
  return img.complete && img.naturalWidth > 0 ? img : null;
}

/**
 * Master Non-Destructive Compositor
 * Renders all layers of a project onto the target canvas
 */
export function compositeProjectToCanvas(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  project: Project,
  options?: RenderContextOptions
): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const isFast = options?.isFastPreview ?? false;

  ctx.clearRect(0, 0, w, h);

  // 1. Draw Project Background
  drawProjectBackground(ctx, w, h, project);

  // 2. Check for Solo Layers
  const hasSolo = project.layers.some(l => l.solo && l.visible);

  // 3. Sort Layers by Order (bottom to top)
  const sortedLayers = [...project.layers].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // 4. Composite Each Layer
  for (const layer of sortedLayers) {
    if (!layer.visible || layer.opacity <= 0) continue;
    if (hasSolo && !layer.solo) continue;

    renderSingleLayer(ctx, w, h, layer, project, isFast);
  }
}

/**
 * Renders Background of Project
 */
function drawProjectBackground(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  project: Project
): void {
  const bg = project.background;
  if (!bg) return;

  if (bg.type === 'transparent') {
    // Transparent checkerboard pattern
    const size = 16;
    ctx.save();
    for (let y = 0; y < h; y += size) {
      for (let x = 0; x < w; x += size) {
        ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#181b26' : '#10131d';
        ctx.fillRect(x, y, size, size);
      }
    }
    ctx.restore();
    return;
  }

  if (bg.type === 'color' && bg.color) {
    ctx.save();
    ctx.fillStyle = bg.color;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
    return;
  }

  if (bg.type === 'gradient' && bg.gradient) {
    renderGradientLayerContent(ctx, w, h, bg.gradient);
  }
}

/**
 * Calculates anchor point pixel offset relative to layer dimensions
 */
export function getAnchorOffset(tf: Transform): { ax: number; ay: number } {
  const w = tf.width;
  const h = tf.height;
  switch (tf.anchorPoint) {
    case 'top-left': return { ax: 0, ay: 0 };
    case 'top-center': return { ax: w / 2, ay: 0 };
    case 'top-right': return { ax: w, ay: 0 };
    case 'center-left': return { ax: 0, ay: h / 2 };
    case 'center': return { ax: w / 2, ay: h / 2 };
    case 'center-right': return { ax: w, ay: h / 2 };
    case 'bottom-left': return { ax: 0, ay: h };
    case 'bottom-center': return { ax: w / 2, ay: h };
    case 'bottom-right': return { ax: w, ay: h };
    default: return { ax: w / 2, ay: h / 2 };
  }
}

/**
 * Renders a single layer with full transform, masking, and blend mode
 */
function renderSingleLayer(
  masterCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  layer: Layer,
  project: Project,
  isFast: boolean
): void {
  const tf = layer.transform;
  const layerW = Math.max(1, Math.round(tf.width));
  const layerH = Math.max(1, Math.round(tf.height));

  // If adjustment layer, process cumulative canvas pixels
  if (layer.type === 'adjustment' || layer.type === 'colorGrade') {
    applyAdjustmentLayer(masterCtx, canvasW, canvasH, layer, isFast);
    return;
  }

  // Allocate isolated layer buffer
  const layerBuffer = getCompositorBuffer(layerW, layerH);
  const lCtx = layerBuffer.getContext('2d', { willReadFrequently: true }) as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D;
  lCtx.clearRect(0, 0, layerW, layerH);

  // Dispatch layer content
  switch (layer.type) {
    case 'image':
      renderImageLayerContent(lCtx, layerW, layerH, layer, isFast);
      break;
    case 'gradient':
      renderGradientLayerContent(lCtx, layerW, layerH, layer);
      break;
    case 'pattern':
      renderPatternLayerContent(lCtx, layerW, layerH, layer, project, isFast);
      break;
    case 'shape':
      renderShapeLayerContent(lCtx, layerW, layerH, layer);
      break;
    case 'text':
      renderTextLayerContent(lCtx, layerW, layerH, layer);
      break;
    case 'blur':
      renderBlurLayerContent(lCtx, masterCtx, layerW, layerH, layer, canvasW, canvasH);
      break;
    case 'glass':
      renderGlassLayerContent(lCtx, masterCtx, layerW, layerH, layer, canvasW, canvasH, isFast);
      break;
    case 'noise':
      renderNoiseLayerContent(lCtx, layerW, layerH, layer);
      break;
    case 'glow':
      renderGlowLayerContent(lCtx, layerW, layerH, layer);
      break;
    case 'shadow':
      renderShadowLayerContent(lCtx, layerW, layerH, layer);
      break;
    default:
      break;
  }

  // Apply Layer Mask if present and enabled
  if (layer.mask && layer.mask.enabled) {
    applyLayerMask(lCtx, layerW, layerH, layer.mask);
  }

  // Composite Layer Buffer onto Master Canvas with Transform
  masterCtx.save();
  masterCtx.globalAlpha = Math.max(0, Math.min(100, layer.opacity)) / 100;
  masterCtx.globalCompositeOperation = blendModeToCompositeOp(layer.blendMode);

  // Apply Transform Matrix
  const { ax, ay } = getAnchorOffset(tf);
  const posX = tf.x;
  const posY = tf.y;
  const rotRad = (tf.rotation * Math.PI) / 180;
  const sx = (tf.scaleX ?? 1) * (tf.flipH ? -1 : 1);
  const sy = (tf.scaleY ?? 1) * (tf.flipV ? -1 : 1);

  masterCtx.translate(posX + ax, posY + ay);
  if (rotRad !== 0) masterCtx.rotate(rotRad);
  if (tf.skewX || tf.skewY) {
    const kx = Math.tan(((tf.skewX || 0) * Math.PI) / 180);
    const ky = Math.tan(((tf.skewY || 0) * Math.PI) / 180);
    masterCtx.transform(1, ky, kx, 1, 0, 0);
  }
  masterCtx.scale(sx, sy);
  masterCtx.translate(-ax, -ay);

  masterCtx.drawImage(layerBuffer as any, 0, 0, layerW, layerH);
  masterCtx.restore();

  releaseCompositorBuffer(layerBuffer);
}

/**
 * Image Layer Renderer with Crop, Border, and Adjustments
 */
function renderImageLayerContent(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  layer: ImageLayer,
  isFast: boolean
): void {
  const img = getCachedImage(layer.src);
  if (!img) {
    // Draw placeholder box if loading
    ctx.fillStyle = '#1e2333';
    ctx.fillRect(0, 0, w, h);
    return;
  }

  ctx.save();
  if (layer.borderRadius && layer.borderRadius > 0) {
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, layer.borderRadius);
    ctx.clip();
  }

  if (layer.crop) {
    ctx.drawImage(
      img,
      layer.crop.x,
      layer.crop.y,
      layer.crop.width,
      layer.crop.height,
      0,
      0,
      w,
      h
    );
  } else {
    ctx.drawImage(img, 0, 0, w, h);
  }

  // Apply Non-Destructive Adjustments (exposure, temp, tint, saturation, etc.)
  if (layer.adjustments && !isFast) {
    applyImageAdjustments(ctx, w, h, layer.adjustments);
  }

  // Border
  if (layer.borderWidth && layer.borderWidth > 0 && layer.borderColor) {
    ctx.strokeStyle = layer.borderColor;
    ctx.lineWidth = layer.borderWidth;
    ctx.strokeRect(0, 0, w, h);
  }

  ctx.restore();
}

/**
 * Upgraded Gradient Layer Renderer (Linear, Radial, Conic, Mesh, Multi-point)
 */
function renderGradientLayerContent(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  layer: GradientLayer
): void {
  ctx.save();

  const stops = layer.stops && layer.stops.length >= 2
    ? layer.stops
    : [
        { id: '1', color: '#00d2ff', position: 0 },
        { id: '2', color: '#9d00ff', position: 50 },
        { id: '3', color: '#ff007f', position: 100 },
      ];

  const sortedStops = [...stops].sort((a, b) => a.position - b.position);

  if (layer.gradientType === 'linear') {
    const angleRad = (layer.angle * Math.PI) / 180;
    const r = Math.hypot(w, h) / 2;
    const cx = w / 2;
    const cy = h / 2;
    const x0 = cx - Math.cos(angleRad) * r;
    const y0 = cy - Math.sin(angleRad) * r;
    const x1 = cx + Math.cos(angleRad) * r;
    const y1 = cy + Math.sin(angleRad) * r;

    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    sortedStops.forEach(s => grad.addColorStop(Math.max(0, Math.min(1, s.position / 100)), s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (layer.gradientType === 'radial') {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(w, h) / 1.5;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    sortedStops.forEach(s => grad.addColorStop(Math.max(0, Math.min(1, s.position / 100)), s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (layer.gradientType === 'conical' && 'createConicGradient' in ctx) {
    const angleRad = (layer.angle * Math.PI) / 180;
    // @ts-ignore
    const grad = ctx.createConicGradient(angleRad, w / 2, h / 2);
    sortedStops.forEach(s => grad.addColorStop(Math.max(0, Math.min(1, s.position / 100)), s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  } else if (layer.gradientType === 'mesh') {
    // 4-Corner Bilinear Mesh Gradient
    const [cTL, cTR, cBR, cBL] = layer.meshColors || ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00'];
    const rgbTL = hexToRgb(cTL);
    const rgbTR = hexToRgb(cTR);
    const rgbBR = hexToRgb(cBR);
    const rgbBL = hexToRgb(cBL);

    const gridSize = 32;
    const meshBuf = getCompositorBuffer(gridSize, gridSize);
    const mCtx = meshBuf.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
    const imgData = mCtx.createImageData(gridSize, gridSize);
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
    mCtx.putImageData(imgData, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(meshBuf as any, 0, 0, w, h);
    releaseCompositorBuffer(meshBuf);
  } else if (layer.gradientType === 'multipoint' && layer.multiPoints && layer.multiPoints.length > 0) {
    // Multi-Point Radial Aurora
    layer.multiPoints.forEach(pt => {
      const px = (pt.x / 100) * w;
      const py = (pt.y / 100) * h;
      const pr = (Math.max(w, h) * (pt.radius / 100)) / 2;
      const pGrad = ctx.createRadialGradient(px, py, 0, px, py, pr);
      pGrad.addColorStop(0, pt.color);
      pGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.save();
      ctx.globalAlpha = (pt.opacity ?? 100) / 100;
      ctx.fillStyle = pGrad;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();
    });
  } else {
    // Default Linear fallback
    const grad = ctx.createLinearGradient(0, 0, w, h);
    sortedStops.forEach(s => grad.addColorStop(Math.max(0, Math.min(1, s.position / 100)), s.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  ctx.restore();
}

/**
 * Pattern Layer Renderer (Connects 500+ library and Image-to-Pattern)
 */
function renderPatternLayerContent(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  layer: PatternLayer,
  project: Project,
  _isFast: boolean
): void {
  // If patternize is active, find first image layer to patternize
  if (layer.patternize) {
    const firstImgLayer = project.layers.find(l => l.type === 'image') as ImageLayer | undefined;
    if (firstImgLayer) {
      const img = getCachedImage(firstImgLayer.src);
      if (img) {
        applyFullImagePatternize(
          ctx,
          w,
          h,
          {
            enabled: true,
            type: layer.patternType,
            scale: layer.scale,
            opacity: layer.opacity,
            color: layer.color,
            backgroundColor: layer.backgroundColor,
            strokeWidth: layer.strokeWidth,
            rotation: layer.rotation,
            offsetX: layer.offsetX,
            offsetY: layer.offsetY,
            glow: layer.glow,
            glowColor: layer.glowColor,
            blendMode: layer.blendMode as any,
            patternize: true,
            patternizeMode: (layer.patternizeMode as any) || 'mosaic',
            patternizeContrast: layer.patternizeContrast ?? 50,
            patternizeInvert: layer.patternizeInvert ?? false,
          },
          img
        );
        return;
      }
    }
  }

  // Procedural Pattern from 500+ library
  renderProceduralPattern(ctx, w, h, {
    enabled: true,
    type: layer.patternType,
    scale: layer.scale,
    opacity: layer.opacity,
    color: layer.color,
    backgroundColor: layer.backgroundColor,
    strokeWidth: layer.strokeWidth,
    rotation: layer.rotation,
    offsetX: layer.offsetX,
    offsetY: layer.offsetY,
    glow: layer.glow,
    glowColor: layer.glowColor,
    blendMode: layer.blendMode as any,
    is3D: layer.is3D,
    depth3D: layer.depth3D,
    pitch3D: layer.pitch3D,
    yaw3D: layer.yaw3D,
    lightAngle3D: layer.lightAngle3D,
    shading3D: layer.shading3D,
    fullFill: layer.fullFill ?? true,
    fillMode: layer.fillMode || 'both',
    fillOpacity: layer.fillOpacity ?? 40,
  });
}

/**
 * Shape Layer Renderer
 */
function renderShapeLayerContent(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  layer: ShapeLayer
): void {
  ctx.save();
  const fillAlpha = (layer.fillOpacity ?? 100) / 100;
  const strokeAlpha = (layer.strokeOpacity ?? 100) / 100;

  ctx.fillStyle = layer.fillColor || '#00d2ff';
  ctx.strokeStyle = layer.strokeColor || '#ffffff';
  ctx.lineWidth = layer.strokeWidth || 2;

  ctx.beginPath();
  if (layer.shapeType === 'rectangle') {
    if (layer.cornerRadius && layer.cornerRadius > 0) {
      ctx.roundRect(0, 0, w, h, layer.cornerRadius);
    } else {
      ctx.rect(0, 0, w, h);
    }
  } else if (layer.shapeType === 'circle' || layer.shapeType === 'ellipse') {
    ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  } else if (layer.shapeType === 'triangle') {
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
  } else if (layer.shapeType === 'star') {
    const cx = w / 2;
    const cy = h / 2;
    const outerR = Math.min(w, h) / 2;
    const innerR = outerR * 0.45;
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  } else if (layer.shapeType === 'hexagon') {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  if (fillAlpha > 0) {
    ctx.save();
    ctx.globalAlpha = fillAlpha;
    ctx.fill();
    ctx.restore();
  }
  if (strokeAlpha > 0 && layer.strokeWidth > 0) {
    ctx.save();
    ctx.globalAlpha = strokeAlpha;
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Text Layer Renderer
 */
function renderTextLayerContent(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  layer: TextLayer
): void {
  ctx.save();
  ctx.font = `${layer.fontWeight || 'bold'} ${layer.fontSize || 48}px ${layer.fontFamily || 'sans-serif'}`;
  ctx.fillStyle = layer.color || '#ffffff';
  ctx.textAlign = layer.align || 'center';
  ctx.textBaseline = 'middle';

  if (layer.shadowBlur && layer.shadowBlur > 0) {
    ctx.shadowBlur = layer.shadowBlur;
    ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.8)';
    ctx.shadowOffsetX = layer.shadowOffsetX ?? 0;
    ctx.shadowOffsetY = layer.shadowOffsetY ?? 4;
  }

  const lines = (layer.text || 'Gradient X Studio').split('\n');
  const lineHeight = (layer.fontSize || 48) * (layer.lineHeight || 1.2);
  const totalTextHeight = lines.length * lineHeight;
  const startY = h / 2 - totalTextHeight / 2 + lineHeight / 2;
  const startX = layer.align === 'left' ? 0 : layer.align === 'right' ? w : w / 2;

  lines.forEach((line, idx) => {
    ctx.fillText(line, startX, startY + idx * lineHeight);
  });

  ctx.restore();
}

/**
 * Blur Layer Content
 */
function renderBlurLayerContent(
  layerCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  masterCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  layerW: number,
  layerH: number,
  layer: BlurLayer,
  canvasW: number,
  canvasH: number
): void {
  layerCtx.save();
  layerCtx.filter = `blur(${layer.radius || 20}px)`;
  layerCtx.drawImage(masterCtx.canvas as any, 0, 0, canvasW, canvasH, 0, 0, layerW, layerH);
  layerCtx.restore();
}

/**
 * Glass Layer Content
 */
function renderGlassLayerContent(
  layerCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  masterCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  layerW: number,
  layerH: number,
  layer: GlassLayer,
  canvasW: number,
  canvasH: number,
  isFast: boolean
): void {
  const snapBuf = getCompositorBuffer(layerW, layerH);
  const sCtx = snapBuf.getContext('2d') as CanvasRenderingContext2D;
  sCtx.drawImage(masterCtx.canvas as any, 0, 0, canvasW, canvasH, 0, 0, layerW, layerH);

  applyFractalGlassEffect(layerCtx, layerW, layerH, snapBuf as any, layer.settings, { isFastPreview: isFast });
  releaseCompositorBuffer(snapBuf);
}

/**
 * Noise Layer Content
 */
function renderNoiseLayerContent(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  layer: NoiseLayer
): void {
  const tileSize = 128;
  const nBuf = getCompositorBuffer(tileSize, tileSize);
  const nCtx = nBuf.getContext('2d') as CanvasRenderingContext2D;
  const imgData = nCtx.createImageData(tileSize, tileSize);
  const data = imgData.data;

  let seed = 48271;
  const fastRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    const val = Math.round(fastRand() * 255);
    data[i] = val;
    data[i + 1] = layer.monochrome ? val : Math.round(fastRand() * 255);
    data[i + 2] = layer.monochrome ? val : Math.round(fastRand() * 255);
    data[i + 3] = Math.round((layer.amount / 100) * 255);
  }
  nCtx.putImageData(imgData, 0, 0);

  const pattern = ctx.createPattern(nBuf as any, 'repeat');
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, w, h);
  }
  releaseCompositorBuffer(nBuf);
}

/**
 * Glow Layer Content
 */
function renderGlowLayerContent(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  layer: GlowLayer
): void {
  const cx = w / 2;
  const cy = h / 2;
  const rad = (layer.radius || 100) * 1.5;
  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
  grad.addColorStop(0, layer.color || '#00f0ff');
  grad.addColorStop(Math.min(1, (layer.spread || 50) / 100), layer.color || '#00f0ff');
  grad.addColorStop(1, 'rgba(0,0,0,0)');

  ctx.save();
  ctx.globalAlpha = (layer.intensity || 80) / 100;
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/**
 * Shadow Layer Content
 */
function renderShadowLayerContent(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  layer: ShadowLayer
): void {
  const radAngle = ((layer.angle || 90) * Math.PI) / 180;
  const ox = Math.cos(radAngle) * (layer.distance || 20);
  const oy = Math.sin(radAngle) * (layer.distance || 20);

  ctx.save();
  ctx.shadowColor = layer.color || '#000000';
  ctx.shadowBlur = layer.blur || 20;
  ctx.shadowOffsetX = ox;
  ctx.shadowOffsetY = oy;
  ctx.globalAlpha = (layer.shadowOpacity || 50) / 100;
  ctx.fillStyle = layer.color || '#000000';
  ctx.fillRect(10, 10, w - 20, h - 20);
  ctx.restore();
}

/**
 * Global Adjustment Layer
 */
function applyAdjustmentLayer(
  masterCtx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  layer: AdjustmentLayer | ColorGradeLayer,
  isFast: boolean
): void {
  if (isFast) return;
  masterCtx.save();
  masterCtx.globalAlpha = Math.max(0, Math.min(100, layer.opacity)) / 100;
  masterCtx.globalCompositeOperation = blendModeToCompositeOp(layer.blendMode);
  applyImageAdjustments(masterCtx, w, h, layer.adjustments);
  masterCtx.restore();
}

/**
 * Non-Destructive Mask Compositor
 */
function applyLayerMask(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  mask: LayerMask
): void {
  const maskBuf = getCompositorBuffer(w, h);
  const mCtx = maskBuf.getContext('2d') as CanvasRenderingContext2D;
  mCtx.clearRect(0, 0, w, h);

  mCtx.save();
  if (mask.type === 'circle') {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) / 2;
    mCtx.beginPath();
    mCtx.arc(cx, cy, r, 0, Math.PI * 2);
    mCtx.fillStyle = '#ffffff';
    mCtx.fill();
  } else if (mask.type === 'linear-gradient') {
    const grad = mCtx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    mCtx.fillStyle = grad;
    mCtx.fillRect(0, 0, w, h);
  } else if (mask.type === 'radial-gradient') {
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.hypot(w, h) / 2;
    const grad = mCtx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    mCtx.fillStyle = grad;
    mCtx.fillRect(0, 0, w, h);
  } else {
    mCtx.fillStyle = '#ffffff';
    mCtx.fillRect(0, 0, w, h);
  }

  if (mask.feather > 0) {
    mCtx.filter = `blur(${mask.feather}px)`;
  }
  mCtx.restore();

  // Mask cutout
  ctx.save();
  ctx.globalCompositeOperation = mask.invert ? 'destination-out' : 'destination-in';
  ctx.globalAlpha = (mask.opacity || 100) / 100;
  ctx.drawImage(maskBuf as any, 0, 0, w, h);
  ctx.restore();

  releaseCompositorBuffer(maskBuf);
}
