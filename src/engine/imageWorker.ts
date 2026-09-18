import { FilterSettings } from '../types/studio';
import { applyAllFiltersToCanvas } from './canvasFilters';

/**
 * Dedicated Web Worker for off-thread Canvas Image Processing
 */

self.onmessage = async (e: MessageEvent) => {
  const { id, imageBitmap, settings } = e.data;
  const startTime = performance.now();

  try {
    const factor = settings.upscale.factor || 1;
    let targetWidth = imageBitmap.width * factor;
    let targetHeight = imageBitmap.height * factor;

    // Cap dimensions for memory safety
    const MAX_DIM = 4096;
    if (targetWidth > MAX_DIM || targetHeight > MAX_DIM) {
      const scale = Math.min(MAX_DIM / targetWidth, MAX_DIM / targetHeight);
      targetWidth = Math.round(targetWidth * scale);
      targetHeight = Math.round(targetHeight * scale);
    }

    // Offscreen Canvas
    const offscreen = new OffscreenCanvas(targetWidth, targetHeight);
    
    // Apply full filter pipeline
    applyAllFiltersToCanvas(offscreen, settings, imageBitmap);

    // Convert to Blob
    const format = settings.upscale.format || 'image/png';
    const quality = settings.upscale.quality || 0.92;

    const blob = await offscreen.convertToBlob({
      type: format,
      quality,
    });

    const elapsed = performance.now() - startTime;

    // Post result back
    self.postMessage({
      type: 'SUCCESS',
      id,
      blob,
      width: targetWidth,
      height: targetHeight,
      timeMs: Math.round(elapsed),
    });

    // Close source bitmap
    imageBitmap.close();
  } catch (err: any) {
    self.postMessage({
      type: 'ERROR',
      id,
      error: err.message || 'Worker processing failed',
    });
  }
};
