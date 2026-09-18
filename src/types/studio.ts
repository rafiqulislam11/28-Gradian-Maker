export interface ColorStop {
  id: string;
  color: string;
  position: number; // 0 - 100
}

export type BlurCategory = 'linear' | 'radial' | 'angular' | 'mesh' | 'glass' | 'tiltshift';
export type GradientType = 'linear' | 'radial' | 'conical' | 'mesh';
export type NoiseType = 'film' | 'retro' | 'digital';
export type PatternType = string;
export type ExportFormat = 'image/png' | 'image/jpeg' | 'image/webp';
export type ItemStatus = 'idle' | 'queued' | 'processing' | 'completed' | 'failed';

export interface FilterSettings {
  image: {
    opacity: number; // 0 - 100
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light' | 'color-dodge' | 'luminosity';
  };
  gradient: {
    enabled: boolean;
    type: GradientType;
    blendMode: 'normal' | 'multiply' | 'screen' | 'overlay' | 'soft-light';
    opacity: number; // 0 - 100
    angle: number; // 0 - 360
    stops: ColorStop[];
    meshColors: [string, string, string, string]; // TopLeft, TopRight, BottomRight, BottomLeft
    position?: 'overlay' | 'background';
  };
  blur: {
    enabled: boolean;
    category: BlurCategory;
    radius: number; // 0 - 60
    angle: number; // 0 - 360
    focalSize: number; // 10 - 90
    glassFrost: number; // 0 - 100
    glassSpecular: number; // 0 - 100
    tiltPosition: number; // 0 - 100 (%)
    tiltWidth: number; // 10 - 80 (%)
  };
  noise: {
    enabled: boolean;
    type: NoiseType;
    amount: number; // 0 - 100
    monochrome: boolean;
    blendMode: 'overlay' | 'screen' | 'soft-light' | 'hard-light';
  };
  patterns: {
    enabled: boolean;
    type: PatternType;
    scale: number; // 10 - 150
    opacity: number; // 0 - 100
    color: string;
    backgroundColor?: string;
    strokeWidth?: number; // 0.5 - 8px
    rotation?: number; // 0 - 360
    offsetX?: number; // -100 - 100
    offsetY?: number; // -100 - 100
    glow?: number; // 0 - 20px
    glowColor?: string;
    blendMode: 'overlay' | 'screen' | 'normal' | 'color-dodge' | 'soft-light' | 'multiply' | 'difference';
    position?: 'overlay' | 'background' | 'patternize';
    is3D?: boolean;
    depth3D?: number; // 0 - 50px
    pitch3D?: number; // -60 to 60 deg (tilt X)
    yaw3D?: number; // -60 to 60 deg (tilt Y)
    lightAngle3D?: number; // 0 - 360 deg
    shading3D?: 'extrude' | 'isometric' | 'perspective' | 'emboss' | 'wireframe';
    // Full Image Pattern Transformation Engine
    patternize?: boolean; // When true, converts the full image into the pattern
    patternizeMode?: 'mosaic' | 'halftone' | '3d-voxel' | 'stencil' | 'duotone';
    patternizeFidelity?: number; // 0 - 100: how much photographic detail is preserved
    patternizeContrast?: number; // 0 - 100: contrast/luminance sensitivity
    patternizeInvert?: boolean; // Invert luminance modulation
  };
  upscale: {
    factor: 1 | 2 | 4 | 8;
    sharpen: number; // 0 - 100
    format: ExportFormat;
    quality: number; // 0.6 - 1.0
  };
}

export interface ImageItem {
  id: string;
  name: string;
  size: number;
  type: string;
  width: number;
  height: number;
  originalUrl: string;
  processedUrl: string | null;
  thumbnailUrl: string;
  status: ItemStatus;
  progress: number;
  processingTimeMs?: number;
  error?: string;
  extractedPalette?: string[];
  file?: File;
}

export interface QueueStats {
  total: number;
  completed: number;
  processing: number;
  queued: number;
  failed: number;
  startTime: number | null;
  elapsedMs: number;
  estimatedRemainingMs: number;
  throughputFps: number;
  activeWorkers: number;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  badge: string;
  icon?: string;
  settings: Partial<FilterSettings>;
}
