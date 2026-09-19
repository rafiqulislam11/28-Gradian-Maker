import { ColorStop, GradientType, BlurCategory, NoiseType, FractalGlassSettings, GradientMakerSettings } from './studio';

export type BlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color-dodge'
  | 'color-burn'
  | 'darken'
  | 'lighten'
  | 'difference'
  | 'exclusion'
  | 'hue'
  | 'saturation'
  | 'color'
  | 'luminosity';

export type AnchorPoint =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface Transform {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number; // degrees
  skewX: number; // degrees
  skewY: number; // degrees
  flipH: boolean;
  flipV: boolean;
  anchorPoint: AnchorPoint;
}

export type LayerType =
  | 'image'
  | 'gradient'
  | 'pattern'
  | 'shape'
  | 'text'
  | 'blur'
  | 'glass'
  | 'noise'
  | 'glow'
  | 'colorGrade'
  | 'shadow'
  | 'adjustment'
  | 'group';

export type MaskType = 'rect' | 'circle' | 'linear-gradient' | 'radial-gradient' | 'image' | 'pattern';

export interface LayerMask {
  id: string;
  enabled: boolean;
  type: MaskType;
  feather: number; // 0 - 100 px
  opacity: number; // 0 - 100 %
  invert: boolean;
  blur: number; // 0 - 50 px
  // Optional parameters for gradient or shape masks
  radius?: number;
  angle?: number;
  aspectRatio?: number;
  imageUrl?: string;
}

export interface ImageAdjustments {
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  hue: number; // -180 to 180 deg
  exposure: number; // -100 to 100
  temperature: number; // -100 (cool) to 100 (warm)
  tint: number; // -100 (green) to 100 (magenta)
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
  whites: number; // -100 to 100
  blacks: number; // -100 to 100
  sharpness: number; // 0 to 100 (unsharp mask)
  gamma: number; // 0.2 to 2.5 (1.0 default)
  vignette: number; // 0 to 100
  fade: number; // 0 to 100
  grain: number; // 0 to 100
}

export interface BaseLayer {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;
  opacity: number; // 0 to 100
  blendMode: BlendMode;
  solo?: boolean;
  transform: Transform;
  mask?: LayerMask;
  groupId?: string;
  order: number;
}

export interface ImageLayer extends BaseLayer {
  type: 'image';
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  crop?: { x: number; y: number; width: number; height: number };
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  adjustments: ImageAdjustments;
}

export type ExtendedGradientType =
  | 'linear'
  | 'radial'
  | 'conical'
  | 'mesh'
  | 'multipoint'
  | 'repeating'
  | 'noise';

export interface GradientPoint {
  id: string;
  x: number; // 0 - 100 %
  y: number; // 0 - 100 %
  color: string;
  radius: number; // 10 - 200 %
  opacity: number; // 0 - 100 %
}

export interface GradientLayer extends BaseLayer {
  type: 'gradient';
  gradientType: ExtendedGradientType;
  angle: number; // 0 - 360 deg
  stops: ColorStop[];
  meshColors: [string, string, string, string]; // 4 corners
  multiPoints?: GradientPoint[];
  repeatCount?: number;
  mirror?: boolean;
  noiseAmount?: number;
}

export interface PatternLayer extends BaseLayer {
  type: 'pattern';
  patternType: string;
  scale: number; // 10 - 300 %
  rotation: number; // 0 - 360 deg
  offsetX: number;
  offsetY: number;
  spacing: number;
  density: number;
  strokeWidth: number;
  strokeOpacity: number;
  fillOpacity: number;
  color: string;
  backgroundColor?: string;
  blur?: number;
  glow?: number;
  glowColor?: string;
  is3D?: boolean;
  depth3D?: number;
  pitch3D?: number;
  yaw3D?: number;
  lightAngle3D?: number;
  shading3D?: 'extrude' | 'isometric' | 'perspective' | 'emboss' | 'wireframe';
  fullFill?: boolean;
  fillMode?: 'stroke' | 'fill' | 'both';
  // Image to Pattern
  patternize?: boolean;
  patternizeMode?: 'mosaic' | 'halftone' | 'dotmatrix' | 'stipple' | 'lineart' | 'pixel' | 'polygon' | 'voronoi' | 'duotone' | 'stencil' | 'ascii';
  patternizeFidelity?: number;
  patternizeContrast?: number;
  patternizeInvert?: boolean;
  patternizeCellSize?: number;
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'ellipse' | 'triangle' | 'star' | 'hexagon' | 'polygon';
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWidth: number;
  strokeOpacity: number;
  cornerRadius?: number;
  sides?: number; // for polygon
}

export interface TextLayer extends BaseLayer {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: number | string;
  lineHeight: number;
  letterSpacing: number;
  color: string;
  align: 'left' | 'center' | 'right';
  shadowBlur?: number;
  shadowColor?: string;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
}

export interface BlurLayer extends BaseLayer {
  type: 'blur';
  category: BlurCategory | 'motion' | 'zoom';
  radius: number;
  angle: number;
  focalSize: number;
  glassFrost: number;
  glassSpecular: number;
  tiltPosition: number;
  tiltWidth: number;
}

export interface GlassLayer extends BaseLayer {
  type: 'glass';
  settings: FractalGlassSettings;
}

export interface NoiseLayer extends BaseLayer {
  type: 'noise';
  noiseType: NoiseType | 'rough' | 'colored';
  amount: number;
  monochrome: boolean;
  scale: number;
  contrast: number;
}

export interface GlowLayer extends BaseLayer {
  type: 'glow';
  glowType: 'outer' | 'inner' | 'bloom' | 'soft-light' | 'directional';
  intensity: number; // 0 - 100
  radius: number; // 0 - 150 px
  spread: number; // 0 - 100 %
  color: string;
  direction?: number; // 0 - 360 deg
}

export interface ColorGradeLayer extends BaseLayer {
  type: 'colorGrade';
  adjustments: ImageAdjustments;
}

export interface ShadowLayer extends BaseLayer {
  type: 'shadow';
  shadowType: 'drop' | 'long' | 'ambient' | 'directional';
  distance: number;
  angle: number;
  blur: number;
  spread: number;
  color: string;
  shadowOpacity: number;
}

export interface AdjustmentLayer extends BaseLayer {
  type: 'adjustment';
  adjustments: ImageAdjustments;
}

export interface GroupLayer extends BaseLayer {
  type: 'group';
  childrenIds: string[];
  expanded?: boolean;
}

export type Layer =
  | ImageLayer
  | GradientLayer
  | PatternLayer
  | ShapeLayer
  | TextLayer
  | BlurLayer
  | GlassLayer
  | NoiseLayer
  | GlowLayer
  | ColorGradeLayer
  | ShadowLayer
  | AdjustmentLayer
  | GroupLayer;

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  background: {
    type: 'color' | 'transparent' | 'gradient';
    color: string;
    gradient?: GradientLayer;
  };
  layers: Layer[];
  activeLayerId: string | null;
  selectedLayerIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type RecipeLayer = DistributiveOmit<Layer, 'id'>;

export interface DesignRecipe {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags?: string[];
  width: number;
  height: number;
  background: Project['background'];
  layers: RecipeLayer[];
  thumbnailUrl?: string;
}

export interface GeneratorSettings {
  count: number; // 1 to 1000
  variationStrength: number; // 0 to 100 %
  allowColors: boolean;
  allowGradient: boolean;
  allowPattern: boolean;
  allowPatternScale: boolean;
  allowRotation: boolean;
  allowBlur: boolean;
  allowNoise: boolean;
  allowGlow: boolean;
  allowImagePos: boolean;
  allowImageScale: boolean;
  allowEffects: boolean;
  allowBlendModes: boolean;
}

export interface ExportSettings {
  format: 'png' | 'jpg' | 'webp' | 'svg' | 'pdf' | 'json';
  scale: 1 | 2 | 4 | 8;
  quality: number; // 0.5 to 1.0
  transparent: boolean;
  backgroundColor: string;
  filename: string;
  includeMetadata: boolean;
  batchZip?: boolean;
}

export const DEFAULT_TRANSFORM: Transform = {
  x: 0,
  y: 0,
  width: 1200,
  height: 700,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  skewX: 0,
  skewY: 0,
  flipH: false,
  flipV: false,
  anchorPoint: 'center',
};

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  hue: 0,
  exposure: 0,
  temperature: 0,
  tint: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  sharpness: 0,
  gamma: 1.0,
  vignette: 0,
  fade: 0,
  grain: 0,
};
