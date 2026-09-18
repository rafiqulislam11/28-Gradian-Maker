import { ImageItem } from '../types/studio';

/**
 * Generates synthetic creative sample test images with colorful gradients,
 * geometries, and textures for stress-testing the bulk processing engine (up to 500+ items)
 */
export async function generateSampleImages(count: number = 10): Promise<ImageItem[]> {
  const items: ImageItem[] = [];
  const themes = [
    { name: 'Aurora Borealis', c1: '#4338ca', c2: '#06b6d4', c3: '#10b981' },
    { name: 'Sunset Horizon', c1: '#be123c', c2: '#fb923c', c3: '#fde047' },
    { name: 'Cosmic Nebula', c1: '#581c87', c2: '#ec4899', c3: '#3b82f6' },
    { name: 'Emerald Forest', c1: '#064e3b', c2: '#059669', c3: '#34d399' },
    { name: 'Cyberpunk Tokyo', c1: '#701a75', c2: '#0284c7', c3: '#e11d48' },
    { name: 'Golden Mirage', c1: '#78350f', c2: '#d97706', c3: '#fef08a' },
    { name: 'Monochrome Shadow', c1: '#0f172a', c2: '#475569', c3: '#94a3b8' },
    { name: 'Deep Abyss', c1: '#020617', c2: '#1e3a8a', c3: '#0284c7' },
  ];

  // We generate a set of base high-res canvas images and reuse them with varied seeds
  const baseCanvases: HTMLCanvasElement[] = [];

  for (let t = 0; t < themes.length; t++) {
    const theme = themes[t];
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, theme.c1);
    grad.addColorStop(0.5, theme.c2);
    grad.addColorStop(1, theme.c3);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    // Decorative geometric shapes
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.arc(320, 240, 160, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 4;
    ctx.strokeRect(120, 80, 400, 320);

    baseCanvases.push(canvas);
  }

  // Pre-generate data URLs for the 8 base themes
  const baseDataUrls = baseCanvases.map(c => c.toDataURL('image/jpeg', 0.85));

  for (let i = 0; i < count; i++) {
    const themeIdx = i % themes.length;
    const theme = themes[themeIdx];
    const id = `mock_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`;
    const paddedIndex = String(i + 1).padStart(3, '0');

    items.push({
      id,
      name: `${theme.name.toLowerCase().replace(/\s+/g, '-')}-${paddedIndex}.jpg`,
      size: Math.round(180000 + (i % 20) * 12500),
      type: 'image/jpeg',
      width: 640,
      height: 480,
      originalUrl: baseDataUrls[themeIdx],
      processedUrl: null,
      thumbnailUrl: baseDataUrls[themeIdx],
      status: 'idle',
      progress: 0,
      extractedPalette: [theme.c1, theme.c2, theme.c3],
    });
  }

  return items;
}
