import { FilterSettings } from '../types/studio';
import { PatternItem, PATTERN_MAP } from './patternLibrary';

/**
 * Procedural Vector Pattern Rendering Engine
 * Synthesizes high-performance Canvas 2D mathematical geometries
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
  const strokeWidth = settings.strokeWidth ?? 1;
  const rotation = settings.rotation ?? 0;
  const offsetX = settings.offsetX ?? 0;
  const offsetY = settings.offsetY ?? 0;
  const glow = settings.glow ?? 0;
  const glowColor = settings.glowColor || color;

  // Optional background tile / fill tint
  if (bgColor && bgColor !== 'transparent') {
    ctx.save();
    ctx.globalAlpha = (settings.opacity / 100) * 0.75;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // Base dimension calculations
  const baseStep = Math.max(10, Math.round((scale / 100) * 80));
  const step = Math.round(baseStep * (item?.params.stepMultiplier || 1.0));
  const density = item?.params.density || 24;
  const totalAngleDeg = (item?.params.angle || 0) + rotation;
  const totalAngleRad = (totalAngleDeg % 360) * (Math.PI / 180);
  const variant = item?.params.variant || 0;
  const harmonics = item?.params.harmonics || 2;
  const family = item?.family || 'grid';

  // If 3D Mode is enabled on any pattern (all 500 patterns support 3D volumetric extrusion),
  // process through 3D Volumetric Depth Engine!
  if (settings.is3D) {
    renderWith3DDepthEngine(ctx, w, h, settings, (bCtx, bw, bh) => {
      bCtx.save();
      const hasTransform = totalAngleRad !== 0 || offsetX !== 0 || offsetY !== 0;
      const boundPad = hasTransform ? Math.round(Math.hypot(bw, bh) * 0.5) : 0;

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

  // Bounding pad calculation to prevent corner gaps when rotated or shifted
  const hasTransform = totalAngleRad !== 0 || offsetX !== 0 || offsetY !== 0;
  const boundPad = hasTransform ? Math.round(Math.hypot(w, h) * 0.5) : 0;

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
 * Renders pattern family vector geometries
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
      drawPolygonalLattice(ctx, drawW, drawH, step, variant);
      break;
    }

    case 'lines': {
      drawLineLattice(ctx, drawW, drawH, step, variant, item?.params.lineRatio || 0.5);
      break;
    }

    case 'sacred':
    case 'circles': {
      drawSacredCircles(ctx, drawW, drawH, step, harmonics, variant);
      break;
    }

    case 'tech': {
      drawCircuitTechGrid(ctx, drawW, drawH, step, variant);
      break;
    }

    case 'waves': {
      drawWaveContours(ctx, drawW, drawH, step, harmonics, variant);
      break;
    }

    case 'dots': {
      drawHalftoneDots(ctx, drawW, drawH, step, variant, item?.params.lineRatio || 0.3);
      break;
    }

    case 'tiles':
    case 'weave': {
      drawWeaveAndTiles(ctx, drawW, drawH, step, variant);
      break;
    }

    case 'stars': {
      drawCelestialStars(ctx, drawW, drawH, step, harmonics, variant);
      break;
    }

    case 'optical': {
      drawOpticalIllusions(ctx, drawW, drawH, step, harmonics, variant);
      break;
    }

    case 'organic': {
      drawOrganicCellular(ctx, drawW, drawH, step, variant);
      break;
    }

    case 'fractal': {
      drawFractalBranches(ctx, drawW, drawH, step, harmonics, variant);
      break;
    }

    default: {
      drawBasicGrid(ctx, drawW, drawH, step);
      break;
    }
  }
}

/**
 * Universal 3D Volumetric Depth Engine
 * Applies perspective pitch, yaw, light angle shading, and multi-slice extrusion to ANY pattern
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

  // Draw 2D pattern geometry into offscreen buffer
  const buf = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(w, h) : document.createElement('canvas');
  buf.width = w;
  buf.height = h;
  const bCtx = buf.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  if (!bCtx) return;

  bCtx.strokeStyle = settings.color || '#00f0ff';
  bCtx.fillStyle = settings.color || '#00f0ff';
  bCtx.lineWidth = Math.max(0.5, Math.min(12, settings.strokeWidth ?? 1.5));
  drawGeometryFn(bCtx, w, h);

  ctx.save();
  const rawBlend = settings.blendMode || 'overlay';
  const compOp: GlobalCompositeOperation = rawBlend === 'normal' ? 'source-over' : (rawBlend as GlobalCompositeOperation);
  ctx.globalCompositeOperation = compOp;

  // 3D Perspective affine transform
  const cosPitch = Math.cos(pitch);
  const sinPitch = Math.sin(pitch);
  const cosYaw = Math.cos(yaw);
  const sinYaw = Math.sin(yaw);

  ctx.translate(w / 2, h / 2);
  ctx.transform(cosYaw, sinYaw * sinPitch, -sinYaw * 0.25, cosPitch, 0, 0);
  ctx.translate(-w / 2, -h / 2);

  if (shading === 'extrude' && depth > 0) {
    // Multi-layer volumetric depth extrusion with directional light-shading
    const slices = Math.min(24, Math.max(3, Math.round(depth)));
    const stepX = (lx * depth) / slices;
    const stepY = (ly * depth) / slices;

    for (let i = slices; i >= 1; i--) {
      ctx.save();
      const shade = 0.25 + 0.65 * (1 - i / slices);
      ctx.globalAlpha = (settings.opacity / 100) * 0.5 * shade;
      ctx.drawImage(buf, stepX * i, stepY * i);
      ctx.restore();
    }
  } else if (shading === 'isometric' && depth > 0) {
    // 30° Axonometric dual-facet isometric projection
    const slices = Math.min(18, Math.max(3, Math.round(depth * 0.85)));
    const isoX = Math.cos(Math.PI / 6) * (depth / slices);
    const isoY = Math.sin(Math.PI / 6) * (depth / slices);

    for (let i = slices; i >= 1; i--) {
      ctx.save();
      const shade = 0.2 + 0.55 * (1 - i / slices);
      ctx.globalAlpha = (settings.opacity / 100) * 0.55 * shade;
      ctx.drawImage(buf, isoX * i, isoY * i);
      ctx.restore();
    }
  } else if (shading === 'perspective' && depth > 0) {
    // Horizon spatial vanishing point depth projection with gradient atmospheric falloff
    const slices = Math.min(20, Math.max(3, Math.round(depth)));
    for (let i = slices; i >= 1; i--) {
      ctx.save();
      const falloff = 1 - i / slices;
      ctx.globalAlpha = (settings.opacity / 100) * 0.45 * (0.2 + 0.8 * falloff);
      const shiftY = (depth * 1.4 * i) / slices;
      ctx.drawImage(buf, 0, shiftY);
      ctx.restore();
    }
  } else if (shading === 'emboss') {
    // 3D Chiseled Bas-Relief with dual highlight and dark relief shadow
    ctx.save();
    ctx.globalAlpha = (settings.opacity / 100) * 0.6;
    ctx.drawImage(buf, lx * 3, ly * 3); // dark relief shadow
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(buf, -lx * 2, -ly * 2); // bright specular highlight
    ctx.restore();
  } else if (shading === 'wireframe') {
    // 3D Holographic Wireframe with dual neon rim projection
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = (settings.opacity / 100) * 0.7;
    ctx.drawImage(buf, lx * 4, ly * 4);
    ctx.globalAlpha = (settings.opacity / 100) * 0.4;
    ctx.drawImage(buf, -lx * 4, -ly * 4);
    ctx.restore();
  }

  // Draw top face
  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(100, settings.opacity)) / 100;
  if ((settings.glow ?? 0) > 0) {
    ctx.shadowColor = settings.glowColor || settings.color || '#00f0ff';
    ctx.shadowBlur = settings.glow ?? 0;
  }
  ctx.drawImage(buf, 0, 0);
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

  if (sub === 0) {
    // 3D Isometric Cube Voxels with 3-tone facet lighting
    const s = Math.max(16, step * 0.8);
    const hDist = s * Math.sqrt(3);
    const vDist = s * 1.5;

    for (let y = -s; y < h + s * 2; y += vDist) {
      const row = Math.floor(y / vDist);
      const xOffset = (row % 2) * (hDist / 2);
      for (let x = -hDist; x < w + hDist * 2; x += hDist) {
        const cx = x + xOffset;
        const cy = y;

        // Top rhombic face
        ctx.beginPath();
        ctx.moveTo(cx, cy - s);
        ctx.lineTo(cx + hDist / 2, cy - s / 2);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx - hDist / 2, cy - s / 2);
        ctx.closePath();
        ctx.stroke();

        // Left vertical face
        ctx.beginPath();
        ctx.moveTo(cx - hDist / 2, cy - s / 2);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + s);
        ctx.lineTo(cx - hDist / 2, cy + s / 2);
        ctx.closePath();
        ctx.stroke();

        // Right vertical face
        ctx.beginPath();
        ctx.moveTo(cx + hDist / 2, cy - s / 2);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx, cy + s);
        ctx.lineTo(cx + hDist / 2, cy + s / 2);
        ctx.closePath();
        ctx.stroke();
      }
    }
  } else if (sub === 1) {
    // 3D Hexagonal Extruded Columns / Pillars
    const r = Math.max(14, step * 0.6);
    const hDist = r * Math.sqrt(3);
    const ext = Math.max(8, depth);

    for (let row = 0; row * r * 1.5 < h + r * 2; row++) {
      const y = row * r * 1.5;
      const xOffset = (row % 2) * (hDist / 2);
      for (let col = -1; col * hDist < w + hDist * 2; col++) {
        const x = col * hDist + xOffset;

        // Top hexagon cap
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i - Math.PI / 6;
          const px = x + r * Math.cos(a);
          const py = y + r * Math.sin(a);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        // Extruded vertical pillar edges
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

    // Perspective rays receding into distance
    const rays = 28;
    for (let i = -rays; i <= rays; i++) {
      const bottomX = vanishX + i * (w / (rays * 0.7));
      ctx.beginPath();
      ctx.moveTo(vanishX, horizonY);
      ctx.lineTo(bottomX, h);
      ctx.stroke();
    }

    // Perspective distance lines with exponential compression
    let curY = h;
    let dist = 32;
    while (curY > horizonY + 2) {
      ctx.beginPath();
      ctx.moveTo(0, curY);
      ctx.lineTo(w, curY);
      ctx.stroke();
      curY -= dist;
      dist = Math.max(2, dist * 0.78);
    }
  } else if (sub === 3) {
    // 3D Torus Vortex / Nested Elliptic Rings in Perspective
    const cx = w / 2;
    const cy = h / 2;
    const rings = 16;
    for (let i = 1; i <= rings; i++) {
      const rx = (i / rings) * (w * 0.48);
      const ry = rx * 0.45;
      ctx.beginPath();
      ctx.ellipse(cx, cy + (i * 2.5), rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Helical perspective ribs
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const px = cx + rx * Math.cos(a);
        const py = cy + (i * 2.5) + ry * Math.sin(a);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py + depth * 0.5);
        ctx.stroke();
      }
    }
  } else if (sub === 4) {
    // 3D Pyramidal Bas-Relief
    const s = Math.max(20, step);
    for (let x = 0; x < w + s; x += s) {
      for (let y = 0; y < h + s; y += s) {
        const apexX = x + s / 2;
        const apexY = y + s / 2 - (depth * 0.4);
        ctx.beginPath();
        ctx.rect(x, y, s, s);
        ctx.moveTo(x, y);
        ctx.lineTo(apexX, apexY);
        ctx.moveTo(x + s, y);
        ctx.lineTo(apexX, apexY);
        ctx.moveTo(x + s, y + s);
        ctx.lineTo(apexX, apexY);
        ctx.moveTo(x, y + s);
        ctx.lineTo(apexX, apexY);
        ctx.stroke();
      }
    }
  } else if (sub === 5) {
    // 3D Geodesic Icosahedron Field
    const s = Math.max(28, step * 1.2);
    for (let x = s / 2; x < w + s; x += s * 1.5) {
      for (let y = s / 2; y < h + s; y += s * 1.5) {
        const r = s * 0.45;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.ellipse(x, y, r, r * 0.5, Math.PI / 4, 0, Math.PI * 2);
        ctx.ellipse(x, y, r, r * 0.5, -Math.PI / 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  } else if (sub === 6) {
    // 3D Topographic Elevation Slices
    const layers = 10;
    for (let l = 0; l < layers; l++) {
      const curDepth = l * (depth * 0.3);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 15) {
        const freq = 0.008;
        const y = h * 0.3 + l * 35 + Math.sin(x * freq + l * 0.8) * 25 + Math.cos(x * freq * 2) * 15 - curDepth;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  } else {
    // 3D Ribbon Wave Mesh / Wormhole
    const cx = w / 2;
    const cy = h / 2;
    const count = 18;
    for (let i = 1; i <= count; i++) {
      const rad = Math.max(10, (i / count) * (Math.min(w, h) * 0.5));
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();

      const spokes = 12;
      for (let s = 0; s < spokes; s++) {
        const angle = (Math.PI * 2 * s) / spokes;
        ctx.beginPath();
        ctx.moveTo(cx + (rad - 15) * Math.cos(angle), cy + (rad - 15) * Math.sin(angle));
        ctx.lineTo(cx + rad * Math.cos(angle), cy + rad * Math.sin(angle));
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
  variant: number
) {
  const r = Math.max(12, step * 0.7);
  const hDist = r * Math.sqrt(3);
  ctx.beginPath();

  for (let row = -1; row * r * 1.5 < h + r * 2; row++) {
    const y = row * r * 1.5;
    const xOffset = (row % 2) * (hDist / 2);

    for (let col = -1; col * hDist < w + hDist * 2; col++) {
      const x = col * hDist + xOffset;

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
        // Inner Y lines
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - r);
        ctx.moveTo(x, y);
        ctx.lineTo(x + r * Math.cos(Math.PI / 6), y + r * Math.sin(Math.PI / 6));
        ctx.moveTo(x, y);
        ctx.lineTo(x - r * Math.cos(Math.PI / 6), y + r * Math.sin(Math.PI / 6));
      } else {
        // Diamond / Rhombus
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r * 0.8, y);
        ctx.lineTo(x, y + r);
        ctx.lineTo(x - r * 0.8, y);
        ctx.closePath();
      }
    }
  }
  ctx.stroke();
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
  ratio: number
) {
  ctx.beginPath();
  const s = Math.max(8, step * 0.6);

  if (variant % 4 === 0) {
    // Vertical Pinstripes
    for (let x = 0; x <= w; x += s) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
  } else if (variant % 4 === 1) {
    // 45° Diagonal Lines
    const maxDim = Math.hypot(w, h);
    for (let i = -maxDim; i <= maxDim; i += s) {
      ctx.moveTo(i, 0);
      ctx.lineTo(i + maxDim, maxDim);
    }
  } else if (variant % 4 === 2) {
    // Fine Crosshatch
    for (let x = 0; x <= w; x += s) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
    for (let y = 0; y <= h; y += s) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
  } else {
    // Staggered Dashes
    const dashLen = s * 1.5;
    for (let y = 0; y <= h; y += s) {
      const xOffset = (Math.round(y / s) % 2) * (dashLen / 2);
      for (let x = xOffset; x <= w; x += dashLen * 1.6) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + dashLen, y);
      }
    }
  }
  ctx.stroke();
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
  variant: number
) {
  const r = Math.max(16, step * 0.9);
  ctx.beginPath();

  if (variant % 3 === 0) {
    // Flower of Life overlapping circle matrix
    const rowDist = r * 0.866;
    for (let y = -r; y <= h + r * 2; y += rowDist) {
      const rowIdx = Math.round(y / rowDist);
      const xOffset = (rowIdx % 2) * (r / 2);
      for (let x = -r + xOffset; x <= w + r * 2; x += r) {
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
    }
  } else if (variant % 3 === 1) {
    // Japanese Seigaiha Scalloped Waves
    const waveR = r * 1.2;
    const rowH = waveR * 0.5;
    for (let y = 0; y <= h + waveR; y += rowH) {
      const rowIdx = Math.round(y / rowH);
      const xOffset = (rowIdx % 2) * waveR;
      for (let x = -waveR + xOffset; x <= w + waveR * 2; x += waveR * 2) {
        for (let ring = 1; ring <= harmonics; ring++) {
          const curR = (waveR / harmonics) * ring;
          ctx.moveTo(x + curR, y);
          ctx.arc(x, y, curR, Math.PI, Math.PI * 2);
        }
      }
    }
  } else {
    // Concentric Mandala Circles / Torus Rings
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.hypot(w, h) / 2;
    for (let cr = r; cr <= maxR; cr += r * 0.8) {
      ctx.moveTo(cx + cr, cy);
      ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    }
  }
  ctx.stroke();
}

/**
 * 4. Cyberpunk & Sci-Fi Tech Circuits
 */
function drawCircuitTechGrid(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  variant: number
) {
  const s = Math.max(20, step);
  ctx.beginPath();

  for (let x = 0; x <= w; x += s) {
    for (let y = 0; y <= h; y += s) {
      const seed = (x * 73 + y * 97 + variant * 13) % 100;
      if (seed < 50) {
        // Orthogonal trace
        ctx.moveTo(x, y);
        ctx.lineTo(x + s * 0.6, y);
        ctx.lineTo(x + s * 0.6, y + s * 0.6);
      } else if (seed < 80) {
        // Diagonal trace
        ctx.moveTo(x, y);
        ctx.lineTo(x + s * 0.5, y + s * 0.5);
        ctx.lineTo(x + s, y + s * 0.5);
      }
      // Node pad
      if (seed % 7 === 0) {
        ctx.moveTo(x + 2.5, y);
        ctx.arc(x, y, 2.5, 0, Math.PI * 2);
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
  variant: number
) {
  const s = Math.max(14, step * 0.8);
  const freq = 0.015 * (1 + (variant % 4) * 0.3);
  const amp = s * 0.7;

  ctx.beginPath();
  for (let y = 0; y <= h; y += s) {
    ctx.moveTo(0, y);
    for (let x = 0; x <= w; x += 8) {
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
  ratio: number
) {
  const s = Math.max(12, step * 0.6);
  const maxDotR = Math.max(1.2, s * ratio);

  for (let y = s / 2; y < h; y += s) {
    const rowIdx = Math.round(y / s);
    const xOffset = (variant % 2 === 1 ? (rowIdx % 2) * (s / 2) : 0);

    for (let x = s / 2 + xOffset; x < w; x += s) {
      let r = maxDotR;
      if (variant % 3 === 0) {
        // Gradient dot sizing by distance to center
        const dist = Math.hypot(x - w / 2, y - h / 2) / (w * 0.5);
        r = Math.max(0.8, maxDotR * Math.abs(Math.sin(dist * Math.PI)));
      }
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
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
  variant: number
) {
  const s = Math.max(16, step * 0.8);
  ctx.beginPath();

  if (variant % 3 === 0) {
    // Herringbone Weave
    for (let y = -s; y <= h + s; y += s) {
      for (let x = -s; x <= w + s; x += s * 2) {
        ctx.moveTo(x, y);
        ctx.lineTo(x + s, y + s * 0.6);
        ctx.lineTo(x + s * 2, y);
      }
    }
  } else if (variant % 3 === 1) {
    // Subway Brick Tile
    const brickH = s * 0.6;
    for (let y = 0; y <= h; y += brickH) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      const rowIdx = Math.round(y / brickH);
      const xOffset = (rowIdx % 2) * (s / 2);
      for (let x = xOffset; x <= w; x += s) {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + brickH);
      }
    }
  } else {
    // Basketweave
    for (let x = 0; x <= w; x += s) {
      for (let y = 0; y <= h; y += s) {
        const isHoriz = (Math.round(x / s) + Math.round(y / s)) % 2 === 0;
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
      }
    }
  }
  ctx.stroke();
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
  variant: number
) {
  const s = Math.max(28, step * 1.3);
  ctx.beginPath();

  for (let x = s / 2; x < w; x += s) {
    for (let y = s / 2; y < h; y += s) {
      const starR = s * 0.35;
      // 4-point or 8-point cross
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
  variant: number
) {
  const s = Math.max(16, step);
  ctx.beginPath();

  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.hypot(w, h) / 1.8;

  if (variant % 2 === 0) {
    // Op-art concentric diamonds
    for (let r = 8; r <= maxR; r += s * 0.6) {
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
    }
  } else {
    // Radiating starburst spokes
    const spokes = 36;
    for (let i = 0; i < spokes; i++) {
      const a = (Math.PI * 2 * i) / spokes;
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(a) * maxR, cy + Math.sin(a) * maxR);
    }
  }
  ctx.stroke();
}

/**
 * 10. Organic & Voronoi Cellular
 */
function drawOrganicCellular(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number,
  variant: number
) {
  const s = Math.max(22, step * 1.1);
  ctx.beginPath();

  for (let x = 0; x <= w + s; x += s) {
    for (let y = 0; y <= h + s; y += s) {
      const jx = x + Math.sin(y * 0.05 + variant) * (s * 0.25);
      const jy = y + Math.cos(x * 0.05 + variant) * (s * 0.25);
      const cr = s * 0.45;

      ctx.moveTo(jx + cr, jy);
      ctx.arc(jx, jy, cr, 0, Math.PI * 2);
    }
  }
  ctx.stroke();
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
  variant: number
) {
  const s = Math.max(24, step * 1.2);
  ctx.beginPath();

  for (let x = s; x < w; x += s * 1.8) {
    for (let y = s; y < h; y += s * 1.8) {
      const len = s * 0.6;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - len);
      // Left branch
      ctx.lineTo(x - len * 0.5, y - len * 1.4);
      // Right branch
      ctx.moveTo(x, y - len);
      ctx.lineTo(x + len * 0.5, y - len * 1.4);
    }
  }
  ctx.stroke();
}

/**
 * Fallback Cartesian Grid
 */
function drawBasicGrid(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  step: number
) {
  ctx.beginPath();
  for (let x = 0; x <= w; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y <= h; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
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

  // Background
  ctx.fillStyle = '#0e121b';
  ctx.fillRect(0, 0, w, h);

  // Mock settings for thumbnail preview
  const mockSettings: FilterSettings['patterns'] = {
    enabled: true,
    type: patternItem.id,
    scale: is3D ? 30 : 35,
    opacity: 90,
    color: tintColor,
    blendMode: 'screen',
    is3D: is3D || patternItem.category === '3d',
    depth3D: 18,
    pitch3D: 28,
    yaw3D: 12,
    shading3D: 'extrude',
    lightAngle3D: 135,
  };

  renderProceduralPattern(ctx, w, h, mockSettings, patternItem);
}
