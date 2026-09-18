import { ImageItem } from '../types/studio';

export type IconSheetMode = '1' | '2' | '3';

export interface IconSheetOptions {
  mode: IconSheetMode;
  columns?: number;
  tileSize?: number;
  gap?: number;
  padding?: number;
  bgType?: 'dark' | 'light' | 'transparent' | 'gradient';
  showLabels?: boolean;
  stickerBorderWidth?: number; // for mode 3
}

export interface IconSheetResult {
  dataUrl: string;
  blob: Blob;
  width: number;
  height: number;
  totalIcons: number;
}

/**
 * Icon Sheet Maker (Modes 1, 2, 3)
 */
export async function generateIconSheet(
  images: ImageItem[],
  options: IconSheetOptions
): Promise<IconSheetResult> {
  const mode = options.mode || '1';

  // Pre-load all available image elements
  const loadedImages: { img: HTMLImageElement; name: string }[] = [];
  for (const it of images) {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = it.processedUrl || it.originalUrl;
      await img.decode();
      loadedImages.push({ img, name: it.name.replace(/\.[^/.]+$/, '') });
    } catch (e) {
      console.warn('Failed loading image for icon sheet:', it.name);
    }
  }

  if (loadedImages.length === 0) {
    // Generate fallback sample icon if none
    const dummy = document.createElement('canvas');
    dummy.width = 128; dummy.height = 128;
    const dCtx = dummy.getContext('2d')!;
    dCtx.fillStyle = '#00d2ff';
    dCtx.fillRect(16, 16, 96, 96);
    const dummyImg = new Image();
    dummyImg.src = dummy.toDataURL();
    await dummyImg.decode();
    loadedImages.push({ img: dummyImg, name: 'Sample Icon' });
  }

  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(1000, 1000)
    : document.createElement('canvas');

  switch (mode) {
    case '1':
      return renderSpriteGridSheet(canvas, loadedImages, options);
    case '2':
      return renderAppIconMasterSheet(canvas, loadedImages[0], options);
    case '3':
      return renderDieCutStickerSheet(canvas, loadedImages, options);
    default:
      return renderSpriteGridSheet(canvas, loadedImages, options);
  }
}

/**
 * Mode 1: Sprite Grid Sheet (Tiled Matrix)
 */
async function renderSpriteGridSheet(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  items: { img: HTMLImageElement; name: string }[],
  options: IconSheetOptions
): Promise<IconSheetResult> {
  const tileSize = options.tileSize || 96;
  const cols = Math.max(1, options.columns || Math.min(6, Math.ceil(Math.sqrt(items.length))));
  const rows = Math.ceil(items.length / cols);
  const gap = options.gap ?? 24;
  const pad = options.padding ?? 32;
  const labelH = options.showLabels ? 20 : 0;

  const totalW = pad * 2 + cols * tileSize + (cols - 1) * gap;
  const totalH = pad * 2 + rows * (tileSize + labelH) + (rows - 1) * gap;

  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  drawSheetBackground(ctx, totalW, totalH, options.bgType);

  for (let i = 0; i < items.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    const x = pad + col * (tileSize + gap);
    const y = pad + row * (tileSize + labelH + gap);

    // Draw slot card background
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    roundRect(ctx, x, y, tileSize, tileSize, 12);
    ctx.fill();
    ctx.stroke();

    // Draw icon centered with aspect fit
    const img = items[i].img;
    const innerPad = 12;
    const drawW = tileSize - innerPad * 2;
    const drawH = tileSize - innerPad * 2;
    ctx.drawImage(img, x + innerPad, y + innerPad, drawW, drawH);
    ctx.restore();

    // Draw label
    if (options.showLabels) {
      ctx.save();
      ctx.fillStyle = 'rgba(203, 213, 225, 0.8)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(items[i].name, x + tileSize / 2, y + tileSize + 14);
      ctx.restore();
    }
  }

  return convertCanvasToResult(canvas, items.length);
}

/**
 * Mode 2: Multi-Resolution App Icon Master Sheet
 * Generates official sizes: 16, 32, 48, 64, 128, 256, 512, 1024 px
 */
async function renderAppIconMasterSheet(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  item: { img: HTMLImageElement; name: string },
  options: IconSheetOptions
): Promise<IconSheetResult> {
  const specs = [
    { size: 256, label: '256x256 (Retina)' },
    { size: 192, label: '192x192 (Android)' },
    { size: 128, label: '128x128 (Mac Dock)' },
    { size: 96, label: '96x96 (PWA)' },
    { size: 64, label: '64x64 (Standard)' },
    { size: 48, label: '48x48 (Windows)' },
    { size: 32, label: '32x32 (Browser)' },
    { size: 16, label: '16x16 (Favicon)' },
  ];

  const totalW = 1100;
  const totalH = 500;
  canvas.width = totalW;
  canvas.height = totalH;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  drawSheetBackground(ctx, totalW, totalH, options.bgType || 'dark');

  // Title Header
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`App Icon Master Suite - ${item.name}`, 36, 40);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '11px sans-serif';
  ctx.fillText('Multi-resolution production asset sheet (iOS, Android, Web & Favicon)', 36, 60);
  ctx.restore();

  // Left: Big Master Preview 256px
  const bigX = 40;
  const bigY = 90;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 24;
  roundRect(ctx, bigX, bigY, 256, 256, 48);
  ctx.clip();
  ctx.drawImage(item.img, bigX, bigY, 256, 256);
  ctx.restore();

  ctx.save();
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 12px monospace';
  ctx.fillText('Master 1024 / 256 px', bigX, bigY + 280);
  ctx.restore();

  // Right side grid of smaller resolutions
  let currentX = 350;
  let currentY = 90;

  for (let i = 1; i < specs.length; i++) {
    const s = specs[i];
    const sz = s.size;
    const cornerRadius = Math.round(sz * 0.22);

    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 12;
    roundRect(ctx, currentX, currentY, sz, sz, cornerRadius);
    ctx.clip();
    ctx.drawImage(item.img, currentX, currentY, sz, sz);
    ctx.restore();

    ctx.save();
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '10px monospace';
    ctx.fillText(s.label, currentX, currentY + sz + 14);
    ctx.restore();

    currentX += sz + 32;
    if (currentX > totalW - 120) {
      currentX = 350;
      currentY += 150;
    }
  }

  return convertCanvasToResult(canvas, specs.length);
}

/**
 * Mode 3: Die-Cut Sticker / Badge Sheet
 * Renders icons with die-cut white outline & soft drop shadow
 */
async function renderDieCutStickerSheet(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  items: { img: HTMLImageElement; name: string }[],
  options: IconSheetOptions
): Promise<IconSheetResult> {
  const size = options.tileSize || 120;
  const cols = Math.max(1, options.columns || Math.min(5, Math.ceil(Math.sqrt(items.length))));
  const rows = Math.ceil(items.length / cols);
  const gap = 36;
  const pad = 48;

  const totalW = pad * 2 + cols * size + (cols - 1) * gap;
  const totalH = pad * 2 + rows * size + (rows - 1) * gap;

  canvas.width = totalW;
  canvas.height = totalH;
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;

  // Background is usually soft grey or pastel for sticker sheet
  drawSheetBackground(ctx, totalW, totalH, options.bgType || 'dark');

  for (let i = 0; i < items.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = pad + col * (size + gap);
    const y = pad + row * (size + gap);

    // Draw Die-Cut White Border with Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = '#ffffff';
    roundRect(ctx, x - 6, y - 6, size + 12, size + 12, 20);
    ctx.fill();
    ctx.restore();

    // Draw inner icon
    ctx.save();
    roundRect(ctx, x, y, size, size, 16);
    ctx.clip();
    ctx.drawImage(items[i].img, x, y, size, size);
    ctx.restore();
  }

  return convertCanvasToResult(canvas, items.length);
}

function drawSheetBackground(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  type?: 'dark' | 'light' | 'transparent' | 'gradient'
) {
  if (type === 'transparent') {
    // Checkerboard pattern
    ctx.clearRect(0, 0, w, h);
    return;
  }

  if (type === 'light') {
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, w, h);
    return;
  }

  if (type === 'gradient') {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, '#0f172a');
    g.addColorStop(0.5, '#1e1b4b');
    g.addColorStop(1, '#0f172a');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    return;
  }

  // Default Dark Studio background
  ctx.fillStyle = '#0d111a';
  ctx.fillRect(0, 0, w, h);

  // Subtle grid lines
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  const gridStep = 40;
  for (let x = 0; x < w; x += gridStep) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += gridStep) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.restore();
}

function roundRect(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

async function convertCanvasToResult(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  totalIcons: number
): Promise<IconSheetResult> {
  let blob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: 'image/png' });
  } else {
    blob = await new Promise<Blob>((res, rej) => {
      (canvas as HTMLCanvasElement).toBlob(b => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png');
    });
  }
  const dataUrl = URL.createObjectURL(blob);
  return {
    dataUrl,
    blob,
    width: canvas.width,
    height: canvas.height,
    totalIcons,
  };
}
