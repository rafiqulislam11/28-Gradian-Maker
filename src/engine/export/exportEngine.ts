import { Project, ExportSettings } from '../../types/project';
import { compositeProjectToCanvas } from '../renderer/layerCompositor';
import JSZip from 'jszip';

export interface ExportProgress {
  current: number;
  total: number;
  percent: number;
  status: string;
}

/**
 * High-Resolution Super-Sampling Render
 * Scales canvas by scale factor (1x, 2x, 4x, 8x), composites all layers, and exports blob
 */
export async function renderProjectAtScale(
  project: Project,
  scale: number = 1,
  transparent: boolean = false
): Promise<{ canvas: HTMLCanvasElement; blob: Blob; width: number; height: number }> {
  const origW = project.width || 1200;
  const origH = project.height || 700;

  let targetW = Math.round(origW * scale);
  let targetH = Math.round(origH * scale);

  // Safety cap at 8192 for GPU memory
  const MAX_DIM = 8192;
  if (targetW > MAX_DIM || targetH > MAX_DIM) {
    const s = Math.min(MAX_DIM / targetW, MAX_DIM / targetH);
    targetW = Math.round(targetW * s);
    targetH = Math.round(targetH * s);
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;

  // Scale project layers clone for target dimensions
  const scaledProject: Project = JSON.parse(JSON.stringify(project));
  scaledProject.width = targetW;
  scaledProject.height = targetH;

  if (transparent) {
    scaledProject.background = { type: 'transparent', color: 'transparent' };
  }

  // Scale all layer coordinates and transforms
  const ratioX = targetW / origW;
  const ratioY = targetH / origH;
  scaledProject.layers.forEach(l => {
    l.transform.x *= ratioX;
    l.transform.y *= ratioY;
    l.transform.width *= ratioX;
    l.transform.height *= ratioY;
    if (l.type === 'text') {
      l.fontSize = Math.round(l.fontSize * ratioX);
    }
    if (l.type === 'blur') {
      l.radius = Math.round(l.radius * ratioX);
    }
  });

  compositeProjectToCanvas(canvas, scaledProject, { isFastPreview: false });

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) return reject(new Error('Canvas blob conversion failed'));
        resolve({ canvas, blob, width: targetW, height: targetH });
      },
      'image/png',
      1.0
    );
  });
}

/**
 * Downloads a File directly in the browser
 */
export function triggerFileDownload(dataUrl: string, filename: string): void {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Exports project according to ExportSettings
 */
export async function exportProject(
  project: Project,
  settings: ExportSettings
): Promise<void> {
  const filenameBase = settings.filename.trim() || project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_');
  const scale = settings.scale || 1;

  if (settings.format === 'json') {
    // Export full JSON Recipe
    const jsonStr = JSON.stringify(project, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    triggerFileDownload(url, `${filenameBase}.gxproject.json`);
    URL.revokeObjectURL(url);
    return;
  }

  // Render canvas at target scale
  const { canvas } = await renderProjectAtScale(project, scale, settings.transparent);

  if (settings.format === 'svg') {
    // Wrap raster snapshot or vector layers in SVG container
    const pngData = canvas.toDataURL('image/png');
    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${canvas.width} ${canvas.height}" width="${canvas.width}" height="${canvas.height}">
  <!-- GRADIENT X STUDIO PRO - Vector Export -->
  <image href="${pngData}" width="${canvas.width}" height="${canvas.height}" preserveAspectRatio="none"/>
</svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    triggerFileDownload(url, `${filenameBase}_${scale}x.svg`);
    URL.revokeObjectURL(url);
    return;
  }

  if (settings.format === 'pdf') {
    // Simple direct PDF wrapper
    const pngData = canvas.toDataURL('image/jpeg', 0.95);
    // Simple PDF container generated dynamically
    const htmlWrapper = `<!DOCTYPE html>
<html>
<head><style>@page{margin:0;size:${canvas.width}px ${canvas.height}px;}body{margin:0;padding:0;}img{width:100%;height:100%;display:block;}</style></head>
<body><img src="${pngData}" /></body>
</html>`;
    const blob = new Blob([htmlWrapper], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
    return;
  }

  // Raster exports: PNG, JPG, WebP
  let mimeType = 'image/png';
  let ext = 'png';
  if (settings.format === 'jpg') {
    mimeType = 'image/jpeg';
    ext = 'jpg';
  } else if (settings.format === 'webp') {
    mimeType = 'image/webp';
    ext = 'webp';
  }

  canvas.toBlob(
    blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      triggerFileDownload(url, `${filenameBase}_${scale}x.${ext}`);
      URL.revokeObjectURL(url);
    },
    mimeType,
    settings.quality || 0.92
  );
}

/**
 * Batch Exports an array of projects/variations as a single ZIP archive
 */
export async function exportBatchProjectsAsZip(
  projects: Project[],
  zipFilename: string = 'gradient-x-studio-designs.zip',
  scale: number = 1,
  onProgress?: (progress: ExportProgress) => void
): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder('Gradient_X_Designs') || zip;
  const total = projects.length;

  for (let i = 0; i < total; i++) {
    const proj = projects[i];
    const { blob } = await renderProjectAtScale(proj, scale, false);
    const name = `design_${String(i + 1).padStart(4, '0')}_${proj.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.png`;
    folder.file(name, blob);

    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100),
        status: `Rendering ${i + 1} of ${total}`,
      });
    }

    // yield macro-task for UI updates
    await new Promise(r => setTimeout(r, 4));
  }

  if (onProgress) {
    onProgress({
      current: total,
      total,
      percent: 100,
      status: 'Compressing ZIP archive...',
    });
  }

  const zipBlob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const url = URL.createObjectURL(zipBlob);
  triggerFileDownload(url, zipFilename);
  URL.revokeObjectURL(url);
}
