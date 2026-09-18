import JSZip from 'jszip';
import { ImageItem } from '../types/studio';
import { vectorizeImage } from './vectorizerEngine';

export interface IconPackOptions {
  packName: string;
  author?: string;
  includeSvg?: boolean;
  includePng1x?: boolean;
  includePng2x?: boolean;
  includePng4x?: boolean;
  includeJson?: boolean;
  includeSymbols?: boolean;
}

/**
 * High-Speed Icon Pack Maker (.ZIP Generator)
 * Compiles icons into SVGs, multi-density PNGs, symbols.svg, and metadata manifest
 */
export async function buildIconPackZip(
  images: ImageItem[],
  options: IconPackOptions,
  onProgress?: (percent: number, statusText: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  const packName = options.packName || 'gradient-x-icon-pack';
  const root = zip.folder(packName) || zip;

  const svgFolder = options.includeSvg !== false ? root.folder('svg') : null;
  const png1xFolder = options.includePng1x !== false ? root.folder('png-1x') : null;
  const png2xFolder = options.includePng2x !== false ? root.folder('png-2x') : null;
  const png4xFolder = options.includePng4x !== false ? root.folder('png-4x') : null;

  const symbolsList: string[] = [];
  const manifestIcons: any[] = [];

  const total = images.length;

  for (let i = 0; i < total; i++) {
    const it = images[i];
    const safeName = (it.name || `icon-${i + 1}`).replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '-');

    if (onProgress) {
      onProgress(Math.round((i / total) * 80), `Packaging ${safeName} (${i + 1}/${total})...`);
    }

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = it.processedUrl || it.originalUrl;
      await img.decode();

      // 1. Vectorize to SVG
      if (svgFolder || options.includeSymbols) {
        const vecResult = await vectorizeImage(img, {
          colors: 4,
          smoothness: 4,
          minArea: 2,
        });

        if (svgFolder) {
          svgFolder.file(`${safeName}.svg`, vecResult.svgString);
        }

        if (options.includeSymbols) {
          // Extract inner paths to symbol
          const innerMatch = vecResult.svgString.match(/<path[\s\S]*?\/>/g);
          const innerContent = innerMatch ? innerMatch.join('\n    ') : '';
          symbolsList.push(
            `  <symbol id="${safeName}" viewBox="0 0 ${vecResult.width} ${vecResult.height}">\n    ${innerContent}\n  </symbol>`
          );
        }
      }

      // 2. Multi-Resolution PNGs (1x: 64px, 2x: 128px, 4x: 256px)
      if (png1xFolder) {
        const b1x = await renderResizedBlob(img, 64, 64);
        png1xFolder.file(`${safeName}.png`, b1x);
      }
      if (png2xFolder) {
        const b2x = await renderResizedBlob(img, 128, 128);
        png2xFolder.file(`${safeName}@2x.png`, b2x);
      }
      if (png4xFolder) {
        const b4x = await renderResizedBlob(img, 256, 256);
        png4xFolder.file(`${safeName}@4x.png`, b4x);
      }

      manifestIcons.push({
        id: safeName,
        name: it.name,
        width: it.width || 64,
        height: it.height || 64,
        formats: ['svg', 'png'],
      });
    } catch (err) {
      console.warn('Failed packaging icon:', it.name, err);
    }
  }

  // 3. symbols.svg
  if (options.includeSymbols && symbolsList.length > 0) {
    const symbolsDoc = [
      `<svg xmlns="http://www.w3.org/2000/svg" style="display: none;">`,
      ...symbolsList,
      `</svg>`,
    ].join('\n');
    root.file('symbols.svg', symbolsDoc);
  }

  // 4. icons.json manifest
  if (options.includeJson !== false) {
    const manifest = {
      packName,
      author: options.author || 'Gradient X Studio User',
      createdAt: new Date().toISOString(),
      count: manifestIcons.length,
      icons: manifestIcons,
    };
    root.file('icons.json', JSON.stringify(manifest, null, 2));
  }

  if (onProgress) {
    onProgress(90, 'Compressing ZIP archive...');
  }

  // Generate ZIP
  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    metadata => {
      if (onProgress) {
        onProgress(90 + Math.round(metadata.percent * 0.1), 'Finalizing ZIP...');
      }
    }
  );

  return zipBlob;
}

async function renderResizedBlob(img: HTMLImageElement, targetW: number, targetH: number): Promise<Blob> {
  const canvas = typeof OffscreenCanvas !== 'undefined'
    ? new OffscreenCanvas(targetW, targetH)
    : document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, targetW, targetH);

  if (canvas instanceof OffscreenCanvas) {
    return canvas.convertToBlob({ type: 'image/png' });
  } else {
    return new Promise<Blob>((res, rej) => {
      (canvas as HTMLCanvasElement).toBlob(b => (b ? res(b) : rej(new Error('toBlob failed'))), 'image/png');
    });
  }
}
