import { Project, DesignRecipe, GeneratorSettings, Layer, GradientLayer, PatternLayer, BlendMode } from '../../types/project';
import { compositeProjectToCanvas } from '../renderer/layerCompositor';
import { PATTERN_CATEGORIES } from '../patternLibrary';

export interface GeneratedDesign {
  id: string;
  index: number;
  project: Project;
  thumbnailUrl: string;
  isFavorite: boolean;
  createdAt: number;
}

export interface GenerationProgress {
  current: number;
  total: number;
  percent: number;
  isComplete: boolean;
  estimatedRemainingSec: number;
}

const COLOR_PALETTES = [
  ['#00f0ff', '#7928ca', '#ff0080', '#ff8000'],
  ['#00c6ff', '#0072ff', '#9d00ff', '#f107a3'],
  ['#f857a6', '#ff5858', '#fbc531', '#4cd137'],
  ['#0575e6', '#00f260', '#38ef7d', '#11998e'],
  ['#8a2387', '#e94057', '#f27121', '#ffa07a'],
  ['#130cb7', '#52e5e7', '#fbc531', '#4cd137'],
  ['#ff0844', '#ffb199', '#fa709a', '#fee140'],
  ['#6a11cb', '#2575fc', '#00d2ff', '#3a7bd5'],
  ['#10b981', '#06b6d4', '#6366f1', '#ec4899'],
  ['#f59e0b', '#ef4444', '#ec4899', '#8b5cf6'],
  ['#06b6d4', '#3b82f6', '#1d4ed8', '#0284c7'],
  ['#ec4899', '#a855f7', '#6366f1', '#3b82f6'],
  ['#14b8a6', '#10b981', '#84cc16', '#eab308'],
  ['#38bdf8', '#818cf8', '#c084fc', '#f472b6'],
  ['#fb7185', '#f43f5e', '#e11d48', '#be123c'],
  ['#2dd4bf', '#06b6d4', '#0284c7', '#0369a1'],
];

const BLEND_MODES: BlendMode[] = [
  'normal',
  'screen',
  'overlay',
  'soft-light',
  'hard-light',
  'color-dodge',
  'multiply',
  'difference',
  'luminosity',
];

const POPULAR_PATTERNS = [
  'pat_geometric_001',
  'pat_geometric_005',
  'pat_sacred_001',
  'pat_sacred_007',
  'pat_tech_001',
  'pat_tech_012',
  'pat_japanese_003',
  'pat_waves_002',
  'pat_halftone_005',
  'pat_fractals_001',
  'pat_minimal_004',
  'pat_architecture_003',
  'pat_celestial_002',
  'pat_organic_006',
  'pat_retro_004',
  'pat_3d_001',
  'grid',
  'dots',
  'hexagons',
  'lightning',
];

/**
 * Creates a randomized variation of a base Project
 */
export function createProjectVariation(
  baseProject: Project,
  settings: GeneratorSettings,
  index: number
): Project {
  const strength = Math.max(1, Math.min(100, settings.variationStrength)) / 100;
  const clone: Project = JSON.parse(JSON.stringify(baseProject));
  clone.id = `gen_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`;
  clone.name = `${baseProject.name} — Var ${index + 1}`;

  // Random palette
  const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
  const randomColor = () => palette[Math.floor(Math.random() * palette.length)];

  // Vary layers
  clone.layers = clone.layers.map(layer => {
    const l = { ...layer };

    // Blend Modes
    if (settings.allowBlendModes && Math.random() < 0.35 * strength) {
      l.blendMode = BLEND_MODES[Math.floor(Math.random() * BLEND_MODES.length)];
    }

    // Gradient variation
    if (l.type === 'gradient' && settings.allowGradient) {
      const g = l as GradientLayer;
      if (settings.allowColors) {
        g.stops = palette.map((col, idx) => ({
          id: String(idx + 1),
          color: col,
          position: Math.round((idx / (palette.length - 1)) * 100),
        }));
        g.meshColors = [palette[0], palette[1], palette[2], palette[3] || palette[0]];
      }
      if (settings.allowRotation) {
        g.angle = Math.round((g.angle + (Math.random() - 0.5) * 360 * strength + 360) % 360);
      }
    }

    // Pattern variation
    if (l.type === 'pattern' && settings.allowPattern) {
      const p = l as PatternLayer;
      if (Math.random() < 0.6 * strength) {
        p.patternType = POPULAR_PATTERNS[Math.floor(Math.random() * POPULAR_PATTERNS.length)];
      }
      if (settings.allowColors) {
        p.color = randomColor();
      }
      if (settings.allowPatternScale) {
        p.scale = Math.max(15, Math.min(180, Math.round(p.scale * (1 + (Math.random() - 0.5) * strength))));
      }
      if (settings.allowRotation) {
        p.rotation = Math.round((p.rotation + (Math.random() - 0.5) * 180 * strength + 360) % 360);
      }
    }

    // Image Transform variation
    if (l.type === 'image') {
      if (settings.allowImagePos) {
        l.transform.x += (Math.random() - 0.5) * 120 * strength;
        l.transform.y += (Math.random() - 0.5) * 120 * strength;
      }
      if (settings.allowImageScale) {
        const factor = 1 + (Math.random() - 0.5) * 0.4 * strength;
        l.transform.scaleX *= factor;
        l.transform.scaleY *= factor;
      }
      if (settings.allowRotation && Math.random() < 0.3) {
        l.transform.rotation = Math.round((l.transform.rotation + (Math.random() - 0.5) * 30 * strength));
      }
    }

    // Blur / Glow / Noise
    if (l.type === 'blur' && settings.allowBlur) {
      l.radius = Math.max(2, Math.min(60, Math.round(l.radius + (Math.random() - 0.5) * 25 * strength)));
    }
    if (l.type === 'noise' && settings.allowNoise) {
      l.amount = Math.max(5, Math.min(45, Math.round(l.amount + (Math.random() - 0.5) * 20 * strength)));
    }
    if (l.type === 'glow' && settings.allowGlow) {
      l.intensity = Math.max(10, Math.min(100, Math.round(l.intensity + (Math.random() - 0.5) * 30 * strength)));
      if (settings.allowColors) l.color = randomColor();
    }

    return l;
  });

  return clone;
}

/**
 * Progressive Asynchronous Generator for up to 1000 Designs
 * Yields designs in chunks to avoid blocking the main UI thread
 */
export class DesignGeneratorEngine {
  private isCancelled = false;

  public cancel(): void {
    this.isCancelled = true;
  }

  public async generateDesigns(
    baseProject: Project,
    settings: GeneratorSettings,
    onProgress: (progress: GenerationProgress, batch: GeneratedDesign[]) => void
  ): Promise<GeneratedDesign[]> {
    this.isCancelled = false;
    const total = Math.max(1, Math.min(1000, settings.count || 20));
    const results: GeneratedDesign[] = [];

    // Thumbnail render canvas
    const thumbW = 320;
    const thumbH = Math.round(320 * (baseProject.height / baseProject.width));
    const thumbCanvas = typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(thumbW, thumbH)
      : document.createElement('canvas');
    thumbCanvas.width = thumbW;
    thumbCanvas.height = thumbH;

    const startTime = Date.now();
    const chunkSize = 5; // process 5 per macro-task

    for (let i = 0; i < total; i += chunkSize) {
      if (this.isCancelled) break;

      const currentBatch: GeneratedDesign[] = [];
      const end = Math.min(total, i + chunkSize);

      for (let j = i; j < end; j++) {
        if (this.isCancelled) break;

        const variation = createProjectVariation(baseProject, settings, j);
        
        // Composite onto thumbnail canvas
        compositeProjectToCanvas(thumbCanvas, variation, { isFastPreview: true });

        // Extract thumbnail Data URL
        let thumbUrl = '';
        if ('convertToBlob' in thumbCanvas) {
          const blob = await (thumbCanvas as OffscreenCanvas).convertToBlob({ type: 'image/jpeg', quality: 0.8 });
          thumbUrl = URL.createObjectURL(blob);
        } else {
          thumbUrl = (thumbCanvas as HTMLCanvasElement).toDataURL('image/jpeg', 0.8);
        }

        const design: GeneratedDesign = {
          id: variation.id,
          index: j + 1,
          project: variation,
          thumbnailUrl: thumbUrl,
          isFavorite: false,
          createdAt: Date.now(),
        };

        currentBatch.push(design);
        results.push(design);
      }

      const elapsed = (Date.now() - startTime) / 1000;
      const rate = results.length / Math.max(0.1, elapsed);
      const remainingSec = Math.round((total - results.length) / Math.max(1, rate));

      onProgress(
        {
          current: results.length,
          total,
          percent: Math.round((results.length / total) * 100),
          isComplete: results.length >= total,
          estimatedRemainingSec: remainingSec,
        },
        currentBatch
      );

      // Yield thread to browser for silky smooth 60fps responsiveness
      await new Promise(resolve => setTimeout(resolve, 8));
    }

    return results;
  }
}
