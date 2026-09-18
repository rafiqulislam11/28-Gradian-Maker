import { ImageItem } from '../types/studio';

export interface RemoveBackgroundOptions {
  threshold: number; // 0 to 100 (how aggressively to treat near-white as transparent)
  feather: number; // 0 to 20 (edge smoothing pixels)
  targetColor?: 'white' | 'black' | 'custom';
  customHex?: string;
}

/**
 * High-Speed Batch White / Solid Background Remover
 * Turns solid background logos and icons into transparent PNGs
 */
export async function removeWhiteBackground(
  sourceImage: CanvasImageSource,
  options: RemoveBackgroundOptions = { threshold: 35, feather: 4 }
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const w = (sourceImage as any).naturalWidth || (sourceImage as any).width || 800;
  const h = (sourceImage as any).naturalHeight || (sourceImage as any).height || 600;

  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(w, h)
    : document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  ctx.drawImage(sourceImage, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  const thresholdNorm = (options.threshold / 100) * 180; // 0 to 180 euclidean distance
  const feather = Math.max(1, options.feather || 4);

  // Target color components
  let targetR = 255, targetG = 255, targetB = 255;
  if (options.targetColor === 'black') {
    targetR = 0; targetG = 0; targetB = 0;
  }

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a === 0) continue;

    const dr = r - targetR;
    const dg = g - targetG;
    const db = b - targetB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);

    if (dist <= thresholdNorm) {
      data[i + 3] = 0; // completely transparent
    } else if (dist < thresholdNorm + feather * 10) {
      // Soft alpha feathering ramp
      const alphaFactor = (dist - thresholdNorm) / (feather * 10);
      data[i + 3] = Math.round(a * Math.max(0, Math.min(1, alphaFactor)));
    }
  }

  ctx.putImageData(imgData, 0, 0);

  // Convert to PNG Blob
  let blob: Blob;
  if (canvas instanceof OffscreenCanvas) {
    blob = await canvas.convertToBlob({ type: 'image/png' });
  } else {
    blob = await new Promise<Blob>((res, rej) => {
      (canvas as HTMLCanvasElement).toBlob(b => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png');
    });
  }

  const dataUrl = URL.createObjectURL(blob);
  return { blob, dataUrl, width: w, height: h };
}

/**
 * Batch Remove White from multiple ImageItems
 */
export async function batchRemoveWhiteBackground(
  images: ImageItem[],
  options: RemoveBackgroundOptions,
  onProgress?: (completed: number, total: number) => void
): Promise<ImageItem[]> {
  const updatedItems: ImageItem[] = [];

  for (let i = 0; i < images.length; i++) {
    const it = images[i];
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = it.processedUrl || it.originalUrl;
      await img.decode();

      const { dataUrl } = await removeWhiteBackground(img, options);
      updatedItems.push({
        ...it,
        processedUrl: dataUrl,
        thumbnailUrl: dataUrl,
        status: 'completed',
      });
    } catch (e) {
      console.warn('Batch white removal failed for', it.name, e);
      updatedItems.push(it);
    }
    if (onProgress) onProgress(i + 1, images.length);
  }

  return updatedItems;
}
