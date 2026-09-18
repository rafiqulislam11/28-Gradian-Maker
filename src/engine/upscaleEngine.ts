import { FilterSettings } from '../types/studio';
import { applyAllFiltersToCanvas } from './canvasFilters';

/**
 * Upscale & Render Pipeline
 * Scales image to 1x, 2x (2K), 4x (4K), or 8x (8K Studio) resolution
 * and applies all filter operations
 */
export async function processAndScaleImage(
  sourceImage: HTMLImageElement | ImageBitmap | HTMLCanvasElement,
  settings: FilterSettings
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const factor = settings.upscale.factor || 1;
  const originalWidth = (sourceImage as any).naturalWidth || sourceImage.width;
  const originalHeight = (sourceImage as any).naturalHeight || sourceImage.height;

  // Compute target dimensions (capped at 7680 for memory safety)
  let targetWidth = originalWidth * factor;
  let targetHeight = originalHeight * factor;

  const MAX_DIM = 7680;
  if (targetWidth > MAX_DIM || targetHeight > MAX_DIM) {
    const scale = Math.min(MAX_DIM / targetWidth, MAX_DIM / targetHeight);
    targetWidth = Math.round(targetWidth * scale);
    targetHeight = Math.round(targetHeight * scale);
  }

  // Create canvas for rendering
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not acquire 2D canvas context');

  // Multi-step interpolation for smooth upscaling if factor > 1
  if (factor > 1) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

  // Apply all filters and stylings
  applyAllFiltersToCanvas(canvas, settings, sourceImage);

  // Convert to target format blob
  const format = settings.upscale.format || 'image/png';
  const quality = settings.upscale.quality || 0.92;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) {
          reject(new Error('Canvas toBlob conversion failed'));
          return;
        }
        const dataUrl = URL.createObjectURL(blob);
        resolve({
          blob,
          dataUrl,
          width: targetWidth,
          height: targetHeight,
        });
      },
      format,
      quality
    );
  });
}
