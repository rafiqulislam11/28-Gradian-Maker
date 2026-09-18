import { FilterSettings } from '../types/studio';
import { PatternItem, PATTERN_MAP } from './patternLibrary';

/**
 * Procedural Vector Pattern Rendering Engine
 * Synthesizes high-performance Canvas 2D mathematical geometries with full-bleed edge-to-edge coverage and solid/both fill modes
 */
export function renderProceduralPattern(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: FilterSettings['patterns'],
  patternItem?: PatternItem
): void {
  const item = patternItem || PATTERN_MAP.get(settings.type);
  const color = settings.color || '#ffffff';
  const bgColor = settings.backgroundColor;
  const scale = settings.scale || 50;
  const strokeWidth = settings.strokeWidth ?? 1.5;
  const rotation = settings.rotation ?? 0;
  const offsetX = settings.offsetX ?? 0;
  const offsetY = settings.offsetY ?? 0;
  const glow = settings.glow ?? 0;
  const glowColor = settings.glowColor || color;

  // 1. Full-bleed background tile / fill tint
  if (bgColor && bgColor !== 'transparent') {
    ctx.save();
    ctx.globalAlpha = (settings.opacity / 100) * 0.85;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Base dimension calculations
  const baseStep = Math.max(10, Math.round((scale / 100) * 80));
  const step = Math.round(baseStep * (item?.params.stepMultiplier || 1.0));
  const totalAngleDeg = (item?.params.angle || 0) + rotation;
  const totalAngleRad = (totalAngleDeg % 360) * (Math.PI / 180);
  const variant = item?.params.variant || 0;
  const harmonics = item?.params.harmonics || 2;
  const family = item?.family || 'grid';

  // 2. 3D Volumetric Depth Engine
  if (settings.is3D) {
    renderWith3DDepthEngine(ctx, w, h, settings, (bCtx, bw, bh) => {
      bCtx.save();
      const diag = Math.hypot(bw, bh);
      const boundPad = Math.round(diag * 0.55);

      bCtx.translate(bw / 2 + offsetX, bh / 2 + offsetY);
      if (totalAngleRad !== 0) {
        bCtx.rotate(totalAngleRad);
      }
      bCtx.translate(-bw / 2 - boundPad, -bh / 2 - boundPad);

      const drawW = bw + boundPad * 2;
      const drawH = bh + boundPad * 2;

      if (family === '3d') {
        draw3DVolumetricPatterns(bCtx, drawW, drawH, step, harmonics, variant, settings);
      } else {
        renderPatternFamilyGeometry(bCtx, drawW, drawH, family, item, step, harmonics, variant, settings);
      }
      bCtx.restore();
    });
    return;
  }

  ctx.save();
  const rawBlend = settings.blendMode || 'overlay';
  const compOp: GlobalCompositeOperation = rawBlend === 'normal' ? 'source-over' : (rawBlend as GlobalCompositeOperation);
  ctx.globalCompositeOperation = compOp;
  ctx.globalAlpha = Math.max(0, Math.min(100, settings.opacity)) / 100;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(0.5, Math.min(12, strokeWidth));

  // Neon Glow / Soft Shadow
  if (glow > 0) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glow;
  }

  // Guaranteed full-bleed coverage pad to prevent edge gaps, corner clips, or rotation artifacts
  const diag = Math.hypot(w, h);
  const boundPad = Math.round(diag * 0.55);

  // Apply offset translation + rotation around center
  ctx.translate(w / 2 + offsetX, h / 2 + offsetY);
  if (totalAngleRad !== 0) {
    ctx.rotate(totalAngleRad);
  }
  ctx.translate(-w / 2 - boundPad, -h / 2 - boundPad);

  const drawW = w + boundPad * 2;
  const drawH = h + boundPad * 2;

  renderPatternFamilyGeometry(ctx, drawW, drawH, family, item, step, harmonics, variant, settings);

  ctx.restore();
}

/**
 * Renders pattern family vector geometries with full fill & stroke support
 */
function renderPatternFamilyGeometry(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  drawW: number,
  drawH: number,
  family: string,
  item: PatternItem | undefined,
  step: number,
  harmonics: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  switch (family) {
    case '3d': {
      draw3DVolumetricPatterns(ctx, drawW, drawH, step, harmonics, variant, settings);
      break;
    }

    case 'hexagons':
    case 'triangles':
    case 'diamonds': {
      drawPolygonalLattice(ctx, drawW, drawH, step, variant, settings);
      break;
    }

    case 'lines': {
      drawLineLattice(ctx, drawW, drawH, step, variant, item?.params.lineRatio || 0.5, settings);
      break;
    }

    case 'sacred':
    case 'circles': {
      drawSacredCircles(ctx, drawW, drawH, step, harmonics, variant, settings);
      break;
    }

    case 'tech': {
      drawCircuitTechGrid(ctx, drawW, drawH, step, variant, settings);
      break;
    }

    case 'waves': {
      drawWaveContours(ctx, drawW, drawH, step, harmonics, variant, settings);
      break;
    }

    case 'dots': {
      drawHalftoneDots(ctx, drawW, drawH, step, variant, item?.params.lineRatio || 0.3, settings);
      break;
    }

    case 'tiles':
    case 'weave': {
      drawWeaveAndTiles(ctx, drawW, drawH, step, variant, settings);
      break;
    }

    case 'stars': {
      drawCelestialStars(ctx, drawW, drawH, step, harmonics, variant, settings);
      break;
    }

    case 'optical': {
      drawOpticalIllusions(ctx, drawW, drawH, step, harmonics, variant, settings);
      break;
    }

    case 'organic': {
      drawOrganicCellular(ctx, drawW, drawH, step, variant, settings);
      break;
    }

    case 'fractal': {
      drawFractalBranches(ctx, drawW, drawH, step, harmonics, variant, settings);
      break;
    }

    default: {
      drawBasicGrid(ctx, drawW, drawH, step, settings);
      break;
    }
  }
}

/**
 * Universal 3D Volumetric Depth Engine with 100% Full-Bleed Edge-to-Edge Overscan
 */
function renderWith3DDepthEngine(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  settings: FilterSettings['patterns'],
  drawGeometryFn: (c: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, width: number, height: number) => void
) {
  const depth = settings.depth3D ?? 15;
  const pitchDeg = settings.pitch3D ?? 25;
  const pitch = (pitchDeg * Math.PI) / 180;
  const yaw = ((settings.yaw3D ?? 0) * Math.PI) / 180;
  const lightAngle = ((settings.lightAngle3D ?? 135) * Math.PI) / 180;
  const shading = settings.shading3D || 'extrude';

  const lx = Math.cos(lightAngle);
  const ly = Math.sin(lightAngle);

  // Calculate 3D foreshortening overscan factor to prevent blank borders
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);

  const overscan = Math.max(1.35, 1 / Math.max(0.35, Math.min(Math.abs(cosPitch), Math.abs(cosYaw))));
  const bw = Math.round(w * overscan);
  const bh = Math.round(h * overscan);

  // Draw 2D pattern geometry into offscreen buffer
  const buf = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(bw, bh) : document.createElement('canvas');
  buf.width = bw;
  buf.height = bh;
  const bCtx = buf.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  if (!bCtx) return;

  bCtx.strokeStyle = settings.color || '#00f0ff';
  bCtx.fillStyle = settings.color || '#00f0ff';
  bCtx.lineWidth = Math.max(0.5, Math.min(12, settings.strokeWidth ?? 1.5));
  drawGeometryFn(bCtx, bw, bh);

  ctx.save();
  const rawBlend = settings.blendMode || 'overlay';
  const compOp: GlobalCompositeOperation = rawBlend === 'normal' ? 'source-over' : (rawBlend as GlobalCompositeOperation);
  ctx.globalCompositeOperation = compOp;

  // 3D Perspective affine transform centered on canvas
  ctx.translate(w / 2, h / 2);
  ctx.transform(cosYaw, sinYaw * sinPitch, -sinYaw * 0.25, cosPitch, 0, 0);
  ctx.translate(-w / 2, -h / 2);

  const drawOffsetX = (w - bw) / 2;
  const drawOffsetY = (h - bh) / 2;

  if (shading === 'extrude' && depth > 0) {
    const slices = Math.min(24, Math.max(3, Math.round(depth)));
    const stepX = (lx * depth) / slices;
    const stepY = (ly * depth) / slices;

    for (let i = slices; i >= 1; i--) {
      ctx.save();
      const shade = 0.25 + 0.65 * (1 - i / slices);
      ctx.globalAlpha = (settings.opacity / 100) * 0.5 * shade;
      ctx.drawImage(buf, drawOffsetX + stepX * i, drawOffsetY + stepY * i);
      ctx.restore();
    }
  } else if (shading === 'isometric' && depth > 0) {
    const slices = Math.min(18, Math.max(3, Math.round(depth * 0.85)));
    const isoX = Math.cos(Math.PI / 6) * (depth / slices);
    const isoY = Math.sin(Math.PI / 6) * (depth / slices);

    for (let i = slices; i >= 1; i--) {
      ctx.save();
      const shade = 0.2 + 0.55 * (1 - i / slices);
      ctx.globalAlpha = (settings.opacity / 100) * 0.55 * shade;
      ctx.drawImage(buf, drawOffsetX + isoX * i, drawOffsetY + isoY * i);
      ctx.restore();
    }
  } else if (shading === 'perspective' && depth > 0) {
    const slices = Math.min(20, Math.max(3, Math.round(depth)));
    for (let i = slices; i >= 1; i--) {
      ctx.save();
      const falloff = 1 - i / slices;
      ctx.globalAlpha = (settings.opacity / 100) * 0.45 * (0.2 + 0.8 * falloff);
      const shiftY = (depth * 1.4 * i) / slices;
      ctx.drawImage(buf, drawOffsetX, drawOffsetY + shiftY);
      ctx.restore();
    }
  } else if (shading === 'emboss') {
    ctx.save();
    ctx.globalAlpha = (settings.opacity / 100) * 0.6;
    ctx.drawImage(buf, drawOffsetX + lx * 3, drawOffsetY + ly * 3);
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(buf, drawOffsetX - lx * 2, drawOffsetY - ly * 2);
    ctx.restore();
  } else if (shading === 'wireframe') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = (settings.opacity / 100) * 0.7;
    ctx.drawImage(buf, drawOffsetX + lx * 4, drawOffsetY + ly * 4);
    ctx.globalAlpha = (settings.opacity / 100) * 0.4;
    ctx.drawImage(buf, drawOffsetX - lx * 4, drawOffsetY - ly * 4);
    ctx.restore();
  }

  // Draw top face
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(100, settings.opacity)) / 100;
  if ((settings.glow ?? 0) > 0) {
    ctx.shadowColor = settings.glowColor || settings.color || '#00f0ff';
    ctx.shadowBlur = settings.glow ?? 0;
  }
  ctx.drawImage(buf, drawOffsetX, drawOffsetY);
  ctx.restore();

  ctx.restore();
}

/**
 * 0. 3D Volumetric Patterns (Isometric Cubes, Hex Pillars, Cyber Horizon, Torus, Pyramids)
 */
function draw3DVolumetricPatterns(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  harmonics: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  const depth = settings.depth3D ?? 15;
  const sub = variant % 8;
  const fillMode = settings.fillMode || 'both';
  const fillAlpha = (settings.opacity / 100) * ((settings.fillOpacity ?? 45) / 100);

  if (sub === 0) {
    // 3D Isometric Cube Voxels with 3-tone facet lighting across full canvas
    const s = Math.max(16, step * 0.8);
    const hDist = s * Math.sqrt(3);
    const vDist = s * 1.5;
    const pad = Math.max(80, s * 3);

    for (let y = -pad; y < h + pad; y += vDist) {
      const row = Math.floor(y / vDist);
      const xOffset = (Math.abs(row) % 2) * (hDist / 2);
      for (let x = -pad; x < w + pad; x += hDist) {
        const cx = x + xOffset;
        const cy = y;

        // Top rhombic face
        ctx.beginPath();
        ctx.moveTo(cx, cy - s);
        ctx.lineTo(cx + hDist / 2, cy - s / 2);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx - hDist / 2, cy - s / 2);
        ctx.closePath();
        if (fillMode === 'fill' || fillMode === 'both') {
          ctx.save();
          ctx.fillStyle = settings.color;
          ctx.globalAlpha = fillAlpha * 0.9;
          ctx.fill();
          ctx.restore();
        }
        if (fillMode !== 'fill') ctx.stroke();

        // Left vertical face
        ctx.beginPath();
        ctx.moveTo(cx - hDist / 2, cy - s / 2);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + s);
        ctx.lineTo(cx - hDist / 2, cy + s / 2);
        ctx.closePath();
        if (fillMode === 'fill' || fillMode === 'both') {
          ctx.save();
          ctx.fillStyle = settings.color;
          ctx.globalAlpha = fillAlpha * 0.6;
          ctx.fill();
          ctx.restore();
        }
        if (fillMode !== 'fill') ctx.stroke();

        // Right vertical face
        ctx.beginPath();
        ctx.moveTo(cx + hDist / 2, cy - s / 2);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + s);
        ctx.lineTo(cx + hDist / 2, cy + s / 2);
        ctx.closePath();
        if (fillMode === 'fill' || fillMode === 'both') {
          ctx.save();
          ctx.fillStyle = settings.color;
          ctx.globalAlpha = fillAlpha * 0.35;
          ctx.fill();
          ctx.restore();
        }
        if (fillMode !== 'fill') ctx.stroke();
      }
    }
  } else if (sub === 1) {
    // 3D Hexagonal Extruded Columns / Pillars
    const r = Math.max(14, step * 0.6);
    const hDist = r * Math.sqrt(3);
    const ext = Math.max(8, depth);
    const pad = Math.max(80, r * 3);

    for (let row = -2; row * r * 1.5 < h + pad; row++) {
      const y = row * r * 1.5;
      const xOffset = (Math.abs(row) % 2) * (hDist / 2);
      for (let col = -2; col * hDist < w + pad; col++) {
        const x = col * hDist + xOffset;

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          const px = x + r * Math.cos(a);
          const py = y + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        if (fillMode === 'fill' || fillMode === 'both') {
          ctx.save();
          ctx.fillStyle = settings.color;
          ctx.globalAlpha = fillAlpha * 0.8;
          ctx.fill();
          ctx.restore();
        }
        if (fillMode !== 'fill') ctx.stroke();

        for (let i = 1; i <= 3; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          const px = x + r * Math.cos(a);
          const py = y + r * Math.sin(a);
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px, py + ext);
          ctx.stroke();
        }
      }
    }
  } else if (sub === 2) {
    // 3D Cyber Horizon Wireframe (Synthwave Perspective Grid)
    const horizonY = h * 0.45;
    const vanishX = w / 2;
    const rays = 36;
    for (let i = -rays; i <= rays; i++) {
      const bottomX = vanishX + i * (w / (rays * 0.65));
      ctx.beginPath();
      ctx.moveTo(vanishX, horizonY);
      ctx.lineTo(bottomX, h + 100);
      ctx.stroke();
    }
    let curY = h + 100;
    let dist = 36;
    while (curY > horizonY + 2) {
      ctx.beginPath();
      ctx.moveTo(-100, curY);
      ctx.lineTo(w + 100, curY);
      ctx.stroke();
      curY -= dist;
      dist = Math.max(2, dist * 0.78);
    }
  } else if (sub === 3) {
    // 3D Torus Vortex / Nested Elliptic Rings out to full canvas corners
    const cx = w / 2;
    const cy = h / 2;
    const rings = 20;
    const maxRadius = Math.hypot(w, h) * 0.7;
    for (let i = 1; i <= rings; i++) {
      const rx = (i / rings) * maxRadius;
      const ry = rx * 0.45;
      ctx.beginPath();
      ctx.ellipse(cx, cy + (i * 2.5), rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const px = cx + rx * Math.cos(a);
        const py = cy + (i * 2.5) + ry * Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + depth * 0.5);
        ctx.stroke();
      }
    }
  } else {
    // Pyramidal Bas-Relief
    const s = Math.max(24, step);
    const pad = Math.max(80, s * 2);
    for (let x = -pad; x < w + pad; x += s) {
      for (let y = -pad; y < h + pad; y += s) {
        ctx.beginPath();
        ctx.rect(x, y, s, s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + s * 0.5, y + s * 0.5);
        ctx.lineTo(x + s, y);
        ctx.moveTo(x, y + s);
        ctx.lineTo(x + s * 0.5, y + s * 0.5);
        ctx.lineTo(x + s, y + s);
        ctx.stroke();
      }
    }
  }
}

/**
 * 1. Polygonal Tilings (Hexagons, Triangles, Diamonds, Cubes)
 */
function drawPolygonalLattice(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  const r = Math.max(12, step * 0.7);
  const hDist = r * Math.sqrt(3);
  const pad = Math.max(80, Math.round(r * 3));
  const fillMode = settings.fillMode || 'both';
  const fillAlpha = (settings.opacity / 100) * ((settings.fillOpacity ?? 40) / 100);

  for (let row = -2; row * r * 1.5 < h + pad; row++) {
    const y = row * r * 1.5;
    const xOffset = (Math.abs(row) % 2) * (hDist / 2);

    for (let col = -2; col * hDist < w + pad; col++) {
      const x = col * hDist + xOffset;

      ctx.beginPath();
      if (variant % 3 === 0) {
        // Hexagon
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          const px = x + r * Math.cos(a);
          const py = y + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else if (variant % 3 === 1) {
        // Isometric 3D Cube
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          const px = x + r * Math.cos(a);
          const py = y + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
      } else {
        // Diamond / Rhombus
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r * 0.8, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r * 0.8, y);
        ctx.closePath();
      }

      if (fillMode === 'fill' || fillMode === 'both') {
        ctx.save();
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = settings.color;
        ctx.fill();
        ctx.restore();
      }
      if (fillMode !== 'fill') {
        ctx.stroke();
      }

      if (variant % 3 === 1 && fillMode !== 'fill') {
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - r);
        ctx.moveTo(x, y);
        ctx.lineTo(x + r * Math.cos(Math.PI / 6), y + r * Math.sin(Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - r * Math.cos(Math.PI / 6), y + r * Math.sin(Math.PI / 6));
        ctx.stroke();
      }
    }
  }
}

/**
 * 2. Minimalist Lines, Slits & Crosshatches
 */
function drawLineLattice(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  variant: number,
  ratio: number,
  settings: FilterSettings['patterns']
) {
  const s = Math.max(8, step * 0.6);
  const pad = Math.max(100, Math.round(Math.hypot(w, h) * 0.5));
  const fillMode = settings.fillMode || 'both';
  const fillAlpha = (settings.opacity / 100) * ((settings.fillOpacity ?? 40) / 100);

  if (variant % 4 === 0) {
    if (fillMode === 'fill' || fillMode === 'both') {
      ctx.save();
      ctx.fillStyle = settings.color;
      ctx.globalAlpha = fillAlpha;
      for (let x = -pad; x <= w + pad; x += s * 2) {
        ctx.fillRect(x, -pad, s, h + pad * 2);
      }
      ctx.restore();
    }
    if (fillMode !== 'fill') {
      ctx.beginPath();
      for (let x = -pad; x <= w + pad; x += s) {
        ctx.moveTo(x, -pad);
        ctx.lineTo(x, h + pad);
      }
      ctx.stroke();
    }
  } else if (variant % 4 === 1) {
    const maxDim = Math.hypot(w, h) + pad;
    ctx.beginPath();
    for (let i = -maxDim; i <= maxDim; i += s) {
      ctx.moveTo(i, -pad);
      ctx.lineTo(i + maxDim, maxDim);
    }
    ctx.stroke();
  } else if (variant % 4 === 2) {
    if (fillMode === 'fill' || fillMode === 'both') {
      ctx.save();
      ctx.fillStyle = settings.color;
      ctx.globalAlpha = fillAlpha * 0.6;
      for (let x = -pad; x <= w + pad; x += s * 2) {
        for (let y = -pad; y <= h + pad; y += s * 2) {
          ctx.fillRect(x, y, s, s);
        }
      }
      ctx.restore();
    }
    if (fillMode !== 'fill') {
      ctx.beginPath();
      for (let x = -pad; x <= w + pad; x += s) {
        ctx.moveTo(x, -pad);
        ctx.lineTo(x, h + pad);
      }
      for (let y = -pad; y <= h + pad; y += s) {
        ctx.moveTo(-pad, y);
        ctx.lineTo(w + pad, y);
      }
      ctx.stroke();
    }
  } else {
    const dashLen = s * 1.5;
    ctx.beginPath();
    for (let y = -pad; y <= h + pad; y += s) {
      const xOffset = (Math.abs(Math.round(y / s)) % 2) * (dashLen / 2);
      for (let x = -pad + xOffset; x <= w + pad; x += dashLen * 1.6) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + dashLen, y);
      }
    }
    ctx.stroke();
  }
}

/**
 * 3. Sacred Geometry, Mandalas & Interlocking Circles
 */
function drawSacredCircles(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  harmonics: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  const r = Math.max(16, step * 0.9);
  const pad = Math.max(100, Math.round(r * 2.5));
  const fillMode = settings.fillMode || 'both';
  const fillAlpha = (settings.opacity / 100) * ((settings.fillOpacity ?? 30) / 100);

  if (variant % 3 === 0) {
    // Flower of Life overlapping circle matrix across full canvas
    const rowDist = r * 0.866;
    for (let y = -pad; y <= h + pad; y += rowDist) {
      const rowIdx = Math.round(y / rowDist);
      const xOffset = (Math.abs(rowIdx) % 2) * (r / 2);
      for (let x = -pad + xOffset; x <= w + pad; x += r) {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        if (fillMode === 'fill' || fillMode === 'both') {
          ctx.save();
          ctx.globalAlpha = fillAlpha;
          ctx.fillStyle = settings.color;
          ctx.fill();
          ctx.restore();
        }
        if (fillMode !== 'fill') {
          ctx.stroke();
        }
      }
    }
  } else if (variant % 3 === 1) {
    // Japanese Seigaiha Scalloped Waves
    const waveR = r * 1.2;
    const rowH = waveR * 0.5;
    for (let y = -pad; y <= h + pad; y += rowH) {
      const rowIdx = Math.round(y / rowH);
      const xOffset = (Math.abs(rowIdx) % 2) * waveR;
      for (let x = -pad + xOffset; x <= w + pad; x += waveR * 2) {
        for (let ring = harmonics; ring >= 1; ring--) {
          const curR = (waveR / harmonics) * ring;
          ctx.beginPath();
          ctx.arc(x, y, curR, Math.PI, Math.PI * 2);
          if (fillMode === 'fill' || fillMode === 'both') {
            ctx.save();
            ctx.globalAlpha = fillAlpha * (ring / harmonics);
            ctx.fillStyle = settings.color;
            ctx.fill();
            ctx.restore();
          }
          if (fillMode !== 'fill') {
            ctx.stroke();
          }
        }
      }
    }
  } else {
    // Concentric Mandala Circles out past corners
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.hypot(w, h) * 0.75;
    let ringIdx = 0;
    for (let cr = maxR; cr >= r; cr -= r * 0.8) {
      ringIdx++;
      ctx.beginPath();
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
      if ((fillMode === 'fill' || fillMode === 'both') && ringIdx % 2 === 0) {
        ctx.save();
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = settings.color;
        ctx.fill();
        ctx.restore();
      }
      if (fillMode !== 'fill') {
        ctx.stroke();
      }
    }
  }
}

/**
 * 4. Cyberpunk & Sci-Fi Tech Circuits
 */
function drawCircuitTechGrid(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  const s = Math.max(20, step);
  const pad = Math.max(80, s * 2);
  const fillMode = settings.fillMode || 'both';
  const fillAlpha = (settings.opacity / 100) * ((settings.fillOpacity ?? 40) / 100);

  ctx.beginPath();
  for (let x = -pad; x <= w + pad; x += s) {
    for (let y = -pad; y <= h + pad; y += s) {
      const seed = Math.abs(Math.round(x * 73 + y * 97 + variant * 13)) % 100;
      if (seed < 50) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + s * 0.5, y);
        ctx.lineTo(x + s * 0.5, y + s * 0.5);
      } else if (seed < 80) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + s, y + s);
      } else {
        ctx.moveTo(x + s * 0.5, y);
        ctx.lineTo(x + s * 0.5, y + s);
      }
      if (seed % 7 === 0) {
        ctx.moveTo(x + 3, y);
        ctx.arc(x, y, 3, 0, Math.PI * 2);
      }
      if ((fillMode === 'fill' || fillMode === 'both') && seed % 11 === 0) {
        ctx.save();
        ctx.fillStyle = settings.color;
        ctx.globalAlpha = fillAlpha * 0.75;
        ctx.fillRect(x + 2, y + 2, s * 0.45, s * 0.45);
        ctx.restore();
      }
    }
  }
  ctx.stroke();
}

/**
 * 5. Waves, Topographic Contours & Fluid Flow
 */
function drawWaveContours(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  harmonics: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  const s = Math.max(14, step * 0.8);
  const pad = Math.max(80, s * 3);
  const freq = 0.015 * (1 + (variant % 4) * 0.3);
  const amp = s * 0.7;

  ctx.beginPath();
  for (let y = -pad; y <= h + pad; y += s) {
    ctx.moveTo(-pad, y);
    for (let x = -pad; x <= w + pad; x += 8) {
      const yWave =
        y +
        Math.sin(x * freq + y * 0.02) * amp +
        Math.sin(x * freq * harmonics) * (amp * 0.3);
      ctx.lineTo(x, yWave);
    }
  }
  ctx.stroke();
}

/**
 * 6. Halftone & Stipple Dot Matrices
 */
function drawHalftoneDots(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  variant: number,
  ratio: number,
  settings: FilterSettings['patterns']
) {
  const s = Math.max(12, step * 0.6);
  const pad = Math.max(60, s * 2);
  const maxDotR = Math.max(1.2, s * ratio);
  const fillMode = settings.fillMode || 'both';

  ctx.fillStyle = settings.color;
  for (let y = -pad; y <= h + pad; y += s) {
    const rowIdx = Math.round(y / s);
    const xOffset = (variant % 2 === 1 ? (Math.abs(rowIdx) % 2) * (s / 2) : 0);

    for (let x = -pad + xOffset; x <= w + pad; x += s) {
      let r = maxDotR;
      if (variant % 3 === 0) {
        const dist = Math.hypot(x - w / 2, y - h / 2) / (w * 0.5);
        r = Math.max(0.8, maxDotR * Math.abs(Math.sin(dist * Math.PI)));
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      if (fillMode === 'stroke') {
        ctx.stroke();
      } else {
        ctx.fill();
      }
    }
  }
}

/**
 * 7. Weave, Textiles & Architectural Tiles
 */
function drawWeaveAndTiles(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  const s = Math.max(16, step * 0.8);
  const pad = Math.max(80, s * 2);
  const fillMode = settings.fillMode || 'both';
  const fillAlpha = (settings.opacity / 100) * ((settings.fillOpacity ?? 40) / 100);

  if (variant % 3 === 0) {
    // Herringbone Weave
    for (let y = -pad; y <= h + pad; y += s) {
      for (let x = -pad; x <= w + pad; x += s * 2) {
        if (fillMode === 'fill' || fillMode === 'both') {
          ctx.save();
          ctx.fillStyle = settings.color;
          ctx.globalAlpha = fillAlpha * 0.5;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + s, y + s * 0.6);
          ctx.lineTo(x + s * 2, y);
          ctx.lineTo(x + s, y - s * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
        if (fillMode !== 'fill') {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + s, y + s * 0.6);
          ctx.lineTo(x + s * 2, y);
          ctx.stroke();
        }
      }
    }
  } else if (variant % 3 === 1) {
    // Subway Brick Tile
    const brickH = s * 0.6;
    for (let y = -pad; y <= h + pad; y += brickH) {
      const rowIdx = Math.round(y / brickH);
      const xOffset = (Math.abs(rowIdx) % 2) * (s / 2);
      for (let x = -pad + xOffset; x <= w + pad; x += s) {
        if (fillMode === 'fill' || fillMode === 'both') {
          ctx.save();
          ctx.fillStyle = settings.color;
          ctx.globalAlpha = fillAlpha * (((Math.abs(x) + Math.abs(y)) % Math.round(s * 2) === 0) ? 0.6 : 0.25);
          ctx.fillRect(x, y, s, brickH);
          ctx.restore();
        }
        if (fillMode !== 'fill') {
          ctx.strokeRect(x, y, s, brickH);
        }
      }
    }
  } else {
    // Basketweave
    for (let x = -pad; x <= w + pad; x += s) {
      for (let y = -pad; y <= h + pad; y += s) {
        const isHoriz = (Math.abs(Math.round((x + pad) / s)) + Math.abs(Math.round((y + pad) / s))) % 2 === 0;
        if (fillMode === 'fill' || fillMode === 'both') {
          ctx.save();
          ctx.fillStyle = settings.color;
          ctx.globalAlpha = isHoriz ? fillAlpha * 0.7 : fillAlpha * 0.3;
          ctx.fillRect(x, y, s, s);
          ctx.restore();
        }
        if (fillMode !== 'fill') {
          ctx.beginPath();
          if (isHoriz) {
            ctx.moveTo(x, y + s * 0.33);
            ctx.lineTo(x + s, y + s * 0.33);
            ctx.moveTo(x, y + s * 0.66);
            ctx.lineTo(x + s, y + s * 0.66);
          } else {
            ctx.moveTo(x + s * 0.33, y);
            ctx.lineTo(x + s * 0.33, y + s);
            ctx.moveTo(x + s * 0.66, y);
            ctx.lineTo(x + s * 0.66, y + s);
          }
          ctx.stroke();
        }
      }
    }
  }
}

/**
 * 8. Celestial, Stars & Constellations
 */
function drawCelestialStars(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  harmonics: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  const s = Math.max(28, step * 1.3);
  const pad = Math.max(80, s * 2);
  const fillMode = settings.fillMode || 'both';

  ctx.beginPath();
  for (let x = -pad; x <= w + pad; x += s) {
    for (let y = -pad; y <= h + pad; y += s) {
      const starR = s * 0.35;
      ctx.moveTo(x - starR, y);
      ctx.lineTo(x + starR, y);
      ctx.moveTo(x, y - starR);
      ctx.lineTo(x, y + starR);

      if (variant % 2 === 1) {
        const diagR = starR * 0.55;
        ctx.moveTo(x - diagR, y - diagR);
        ctx.lineTo(x + diagR, y + diagR);
        ctx.moveTo(x - diagR, y + diagR);
        ctx.lineTo(x + diagR, y - diagR);
      }

      if (fillMode === 'fill' || fillMode === 'both') {
        ctx.moveTo(x + 2, y);
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
      }
    }
  }
  ctx.stroke();
}

/**
 * 9. Optical Illusions & Moiré
 */
function drawOpticalIllusions(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  harmonics: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  const s = Math.max(16, step);
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.hypot(w, h) * 0.75;
  const fillMode = settings.fillMode || 'both';
  const fillAlpha = (settings.opacity / 100) * ((settings.fillOpacity ?? 35) / 100);

  if (variant % 2 === 0) {
    let bandIdx = 0;
    for (let r = maxR; r >= 8; r -= s * 0.6) {
      bandIdx++;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      if ((fillMode === 'fill' || fillMode === 'both') && bandIdx % 2 === 0) {
        ctx.save();
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = settings.color;
        ctx.fill();
        ctx.restore();
      }
      if (fillMode !== 'fill') {
        ctx.stroke();
      }
    }
  } else {
    const spokes = 36;
    ctx.beginPath();
    for (let i = 0; i < spokes; i++) {
      const a = (Math.PI * 2 * i) / spokes;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
    }
    ctx.stroke();
  }
}

/**
 * 10. Organic & Voronoi Cellular
 */
function drawOrganicCellular(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  const s = Math.max(22, step * 1.1);
  const pad = Math.max(80, s * 2);
  const fillMode = settings.fillMode || 'both';
  const fillAlpha = (settings.opacity / 100) * ((settings.fillOpacity ?? 40) / 100);

  for (let x = -pad; x <= w + pad; x += s) {
    for (let y = -pad; y <= h + pad; y += s) {
      const jx = x + Math.sin(y * 0.05 + variant) * (s * 0.25);
      const jy = y + Math.cos(x * 0.05 + variant) * (s * 0.25);
      const cr = s * 0.45;

      ctx.beginPath();
      ctx.arc(jx, jy, cr, 0, Math.PI * 2);
      if (fillMode === 'fill' || fillMode === 'both') {
        ctx.save();
        ctx.globalAlpha = fillAlpha;
        ctx.fillStyle = settings.color;
        ctx.fill();
        ctx.restore();
      }
      if (fillMode !== 'fill') {
        ctx.stroke();
      }
    }
  }
}

/**
 * 11. Fractals & Chaos Math (Recursive Branching)
 */
function drawFractalBranches(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  harmonics: number,
  variant: number,
  settings: FilterSettings['patterns']
) {
  const s = Math.max(24, step * 1.2);
  const pad = Math.max(80, s * 2);

  ctx.beginPath();
  for (let x = -pad; x <= w + pad; x += s * 1.6) {
    for (let y = -pad; y <= h + pad; y += s * 1.6) {
      const len = s * 0.6;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - len);
      ctx.lineTo(x - len * 0.5, y - len * 1.4);
      ctx.moveTo(x, y - len);
      ctx.lineTo(x + len * 0.5, y - len * 1.4);
    }
  }
  ctx.stroke();
}

/**
 * Fallback Cartesian Grid with Full Bleed & Solid Fill Options
 */
function drawBasicGrid(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  settings: FilterSettings['patterns']
) {
  const pad = Math.max(80, step * 2);
  const fillMode = settings.fillMode || 'both';
  const fillAlpha = (settings.opacity / 100) * ((settings.fillOpacity ?? 35) / 100);

  if (fillMode === 'fill' || fillMode === 'both') {
    ctx.save();
    ctx.fillStyle = settings.color;
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
}

/**
 * Renders a crisp 64x64 preview icon for the Pattern Library Modal
 */
export function renderPatternThumbnail(
  canvas: HTMLCanvasElement,
  patternItem: PatternItem,
  tintColor: string = '#00f0ff',
  is3D: boolean = false
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Dark preview background
  ctx.fillStyle = '#0a0d14';
  ctx.fillRect(0, 0, w, h);

  const mockSettings: FilterSettings['patterns'] = {
    enabled: true,
    type: patternItem.id,
    scale: 45,
    opacity: 100,
    color: tintColor,
    backgroundColor: 'transparent',
    strokeWidth: 1.2,
    rotation: 0,
    is3D: is3D || patternItem.category === '3d',
    depth3D: 10,
    pitch3D: 25,
    yaw3D: 0,
    shading3D: 'extrude',
    fillMode: 'both',
    fillOpacity: 40,
    fullFill: true,
    blendMode: 'screen',
  };

  renderProceduralPattern(ctx, w, h, mockSettings, patternItem);
}
