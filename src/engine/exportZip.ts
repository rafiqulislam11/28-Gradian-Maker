import JSZip from 'jszip';
import { ImageItem } from '../types/studio';

export interface ZipExportProgress {
  current: number;
  total: number;
  percent: number;
  currentFilename: string;
}

export async function exportImagesAsZip(
  items: ImageItem[],
  zipFilename: string = 'gradient-x-studio-export.zip',
  onProgress?: (p: ZipExportProgress) => void
): Promise<void> {
  const completedItems = items.filter(it => it.processedUrl && it.status === 'completed');
  if (completedItems.length === 0) {
    throw new Error('No processed images available to export.');
  }

  const zip = new JSZip();
  const folder = zip.folder('gradient-x-processed') || zip;
  const total = completedItems.length;

  for (let i = 0; i < total; i++) {
    const item = completedItems[i];
    if (onProgress) {
      onProgress({
        current: i + 1,
        total,
        percent: Math.round(((i + 1) / total) * 100),
        currentFilename: item.name,
      });
    }

    try {
      const response = await fetch(item.processedUrl!);
      const blob = await response.blob();
      
      // Determine file extension
      let ext = 'png';
      if (item.type.includes('jpeg') || item.type.includes('jpg')) ext = 'jpg';
      else if (item.type.includes('webp')) ext = 'webp';

      const baseName = item.name.replace(/\.[^/.]+$/, '');
      const filename = `${baseName}_gradx.${ext}`;

      folder.file(filename, blob);
    } catch (err) {
      console.warn(`Failed to package ${item.name} into zip:`, err);
    }
  }

  // Generate zip blob with compression
  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    metadata => {
      if (onProgress) {
        onProgress({
          current: total,
          total,
          percent: Math.round(metadata.percent),
          currentFilename: 'Compressing archive...',
        });
      }
    }
  );

  // Trigger browser download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(content);
  link.download = zipFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
