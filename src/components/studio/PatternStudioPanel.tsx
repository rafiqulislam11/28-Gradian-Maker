import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  RotateCw,
  Compass,
  Layers,
  Wand2,
  Shuffle,
  ChevronDown,
  ArrowRightLeft,
  Move,
  Sun,
  Eye,
  Check,
  Box,
  Zap,
} from 'lucide-react';
import { FilterSettings, PatternType, ImageItem } from '../../types/studio';
import { FEATURED_PATTERNS, PATTERN_MAP, PATTERN_LIBRARY } from '../../engine/patternLibrary';
import { extractPaletteFromImage } from '../../engine/colorExtractor';

interface PatternStudioPanelProps {
  settings: FilterSettings['patterns'];
  onUpdateSettings: (values: Partial<FilterSettings['patterns']>) => void;
  onOpenPatternModal: () => void;
  selectedImage: ImageItem | null;
}

// 8 Curated Iconic Pattern Style Presets
export const PATTERN_STYLE_PRESETS = [
  {
    name: 'Cyber Neon Grid',
    type: 'pat_geo_001',
    color: '#00f0ff',
    backgroundColor: 'transparent',
    strokeWidth: 1.5,
    rotation: 0,
    scale: 60,
    opacity: 90,
    glow: 10,
    glowColor: '#00f0ff',
    blendMode: 'screen' as const,
  },
  {
    name: 'Sacred Gold',
    type: 'pat_sac_001',
    color: '#ffd700',
    backgroundColor: 'transparent',
    strokeWidth: 1.5,
    rotation: 45,
    scale: 75,
    opacity: 85,
    glow: 6,
    glowColor: '#ffaa00',
    blendMode: 'overlay' as const,
  },
  {
    name: 'Minimal Blueprint',
    type: 'pat_min_001',
    color: '#ffffff',
    backgroundColor: 'transparent',
    strokeWidth: 0.8,
    rotation: 0,
    scale: 40,
    opacity: 50,
    glow: 0,
    blendMode: 'overlay' as const,
  },
  {
    name: 'Japanese Waves',
    type: 'pat_jap_001',
    color: '#67e8f9',
    backgroundColor: 'transparent',
    strokeWidth: 1.2,
    rotation: 0,
    scale: 70,
    opacity: 75,
    glow: 0,
    blendMode: 'soft-light' as const,
  },
  {
    name: 'Matrix Tech',
    type: 'pat_tec_001',
    color: '#10b981',
    backgroundColor: 'transparent',
    strokeWidth: 2.0,
    rotation: 90,
    scale: 65,
    opacity: 95,
    glow: 14,
    glowColor: '#10b981',
    blendMode: 'color-dodge' as const,
  },
  {
    name: 'Subtle Carbon',
    type: 'pat_fab_001',
    color: '#94a3b8',
    backgroundColor: 'transparent',
    strokeWidth: 1.0,
    rotation: 45,
    scale: 30,
    opacity: 35,
    glow: 0,
    blendMode: 'overlay' as const,
  },
  {
    name: 'Psychedelic Op-Art',
    type: 'pat_opt_001',
    color: '#ec4899',
    backgroundColor: 'transparent',
    strokeWidth: 2.5,
    rotation: 30,
    scale: 85,
    opacity: 80,
    glow: 8,
    glowColor: '#a855f7',
    blendMode: 'difference' as const,
  },
  {
    name: 'Cosmic Starmap',
    type: 'pat_cel_001',
    color: '#c084fc',
    backgroundColor: 'transparent',
    strokeWidth: 1.2,
    rotation: 15,
    scale: 80,
    opacity: 90,
    glow: 12,
    glowColor: '#a855f7',
    blendMode: 'screen' as const,
    is3D: false,
  },
  {
    name: '3D Isometric Voxels',
    type: 'pat_3d_001',
    color: '#00f0ff',
    backgroundColor: 'transparent',
    strokeWidth: 1.5,
    rotation: 0,
    scale: 65,
    opacity: 95,
    glow: 8,
    glowColor: '#00f0ff',
    blendMode: 'overlay' as const,
    is3D: true,
    depth3D: 22,
    pitch3D: 30,
    yaw3D: 0,
    shading3D: 'isometric' as const,
    lightAngle3D: 135,
  },
  {
    name: '3D Cyber Grid Horizon',
    type: 'pat_3d_003',
    color: '#ec4899',
    backgroundColor: 'transparent',
    strokeWidth: 1.8,
    rotation: 0,
    scale: 75,
    opacity: 95,
    glow: 12,
    glowColor: '#ec4899',
    blendMode: 'screen' as const,
    is3D: true,
    depth3D: 30,
    pitch3D: 45,
    yaw3D: 0,
    shading3D: 'perspective' as const,
    lightAngle3D: 90,
  },
  {
    name: '3D Extruded Hex Forest',
    type: 'pat_3d_002',
    color: '#10b981',
    backgroundColor: 'transparent',
    strokeWidth: 1.5,
    rotation: 0,
    scale: 70,
    opacity: 90,
    glow: 8,
    glowColor: '#10b981',
    blendMode: 'screen' as const,
    is3D: true,
    depth3D: 26,
    pitch3D: 25,
    yaw3D: 15,
    shading3D: 'extrude' as const,
    lightAngle3D: 120,
  },
  {
    name: '3D Pyramidal Bas-Relief',
    type: 'pat_3d_005',
    color: '#ffd700',
    backgroundColor: 'transparent',
    strokeWidth: 1.4,
    rotation: 45,
    scale: 60,
    opacity: 85,
    glow: 6,
    glowColor: '#ffd700',
    blendMode: 'overlay' as const,
    is3D: true,
    depth3D: 20,
    pitch3D: 20,
    yaw3D: 0,
    shading3D: 'emboss' as const,
    lightAngle3D: 135,
  },
  {
    name: 'Photo 3D Voxel Portrait',
    type: 'pat_3d_001',
    color: '#00f0ff',
    backgroundColor: '#080a10',
    strokeWidth: 1.0,
    rotation: 0,
    scale: 45,
    opacity: 100,
    glow: 0,
    blendMode: 'normal' as const,
    is3D: true,
    depth3D: 25,
    pitch3D: 25,
    yaw3D: 0,
    shading3D: 'isometric' as const,
    lightAngle3D: 135,
    patternize: true,
    patternizeMode: '3d-voxel' as const,
    patternizeFidelity: 75,
    patternizeContrast: 50,
  },
  {
    name: 'Photo Honeycomb Mosaic',
    type: 'pat_hex_001',
    color: '#10b981',
    backgroundColor: '#080a10',
    strokeWidth: 1.2,
    rotation: 0,
    scale: 40,
    opacity: 100,
    glow: 0,
    blendMode: 'normal' as const,
    patternize: true,
    patternizeMode: 'mosaic' as const,
    patternizeFidelity: 70,
    patternizeContrast: 50,
  },
  {
    name: 'Photo Banknote Engrave',
    type: 'pat_jap_001',
    color: '#00f0ff',
    backgroundColor: '#080a10',
    strokeWidth: 2.0,
    rotation: 0,
    scale: 45,
    opacity: 100,
    glow: 0,
    blendMode: 'normal' as const,
    patternize: true,
    patternizeMode: 'halftone' as const,
    patternizeFidelity: 80,
    patternizeContrast: 60,
  },
  {
    name: 'Photo Sacred Duotone',
    type: 'pat_sac_001',
    color: '#ffd700',
    backgroundColor: '#1a0b2e',
    strokeWidth: 1.5,
    rotation: 45,
    scale: 55,
    opacity: 100,
    glow: 6,
    glowColor: '#ffd700',
    blendMode: 'overlay' as const,
    patternize: true,
    patternizeMode: 'duotone' as const,
    patternizeFidelity: 65,
    patternizeContrast: 50,
  },
];

export const PatternStudioPanel: React.FC<PatternStudioPanelProps> = ({
  settings,
  onUpdateSettings,
  onOpenPatternModal,
  selectedImage,
}) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [showPresets, setShowPresets] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'style' | 'geometry' | 'effects' | '3d' | 'patternize'>('style');

  const activePattern = PATTERN_MAP.get(settings.type);
  const patternName = activePattern?.name || settings.type;

  // Swap Primary and Background Colors
  const handleSwapColors = () => {
    const currentPrimary = settings.color;
    const currentBg = settings.backgroundColor && settings.backgroundColor !== 'transparent'
      ? settings.backgroundColor
      : '#0a0d14';
    onUpdateSettings({
      color: currentBg,
      backgroundColor: currentPrimary,
    });
  };

  // Randomize Pattern & Parameters
  const handleRandomize = () => {
    const randomItem = PATTERN_LIBRARY[Math.floor(Math.random() * PATTERN_LIBRARY.length)];
    const neonColors = ['#00f0ff', '#ff007f', '#ffd700', '#10b981', '#a855f7', '#ff7a00', '#ffffff'];
    const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];
    const randomRotation = [0, 15, 30, 45, 60, 90][Math.floor(Math.random() * 6)];
    const randomScale = 35 + Math.floor(Math.random() * 55);

    onUpdateSettings({
      type: randomItem.id,
      enabled: true,
      color: randomColor,
      rotation: randomRotation,
      scale: randomScale,
      strokeWidth: 1 + Math.round(Math.random() * 2),
      is3D: randomItem.category === '3d' ? true : settings.is3D,
    });
  };

  // Extract from photo
  const handleExtractFromImage = async () => {
    if (!selectedImage) return;
    setIsExtracting(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedImage.originalUrl;
      await img.decode();
      const extracted = await extractPaletteFromImage(img, 3);
      if (extracted && extracted.length > 0) {
        onUpdateSettings({
          color: extracted[0],
          glowColor: extracted[1] || extracted[0],
        });
      }
    } catch (e) {
      console.warn('Pattern palette extraction notice:', e);
    } finally {
      setIsExtracting(false);
    }
  };

  // Apply style preset
  const handleApplyPreset = (preset: typeof PATTERN_STYLE_PRESETS[0]) => {
    const pAny = preset as any;
    const isPresetPatternize = pAny.patternize ?? false;
    onUpdateSettings({
      type: preset.type,
      enabled: true,
      color: preset.color,
      backgroundColor: preset.backgroundColor,
      strokeWidth: preset.strokeWidth,
      rotation: preset.rotation,
      scale: preset.scale,
      opacity: preset.opacity,
      glow: preset.glow,
      glowColor: preset.glowColor,
      blendMode: preset.blendMode,
      is3D: pAny.is3D ?? false,
      depth3D: pAny.depth3D ?? 15,
      pitch3D: pAny.pitch3D ?? 25,
      yaw3D: pAny.yaw3D ?? 0,
      lightAngle3D: pAny.lightAngle3D ?? 135,
      shading3D: pAny.shading3D ?? 'extrude',
      fullFill: true,
      fillMode: pAny.fillMode ?? 'both',
      fillOpacity: pAny.fillOpacity ?? 45,
      patternize: isPresetPatternize,
      patternizeMode: pAny.patternizeMode ?? 'mosaic',
      patternizeFidelity: pAny.patternizeFidelity ?? 75,
      patternizeContrast: pAny.patternizeContrast ?? 50,
      patternizeInvert: pAny.patternizeInvert ?? false,
      position: isPresetPatternize ? 'patternize' : (settings.position === 'patternize' ? 'overlay' : (settings.position ?? 'overlay')),
    });
    if (isPresetPatternize) {
      setActiveSubTab('patternize');
    }
  };

  const isPatternizeActive = settings.patternize === true || settings.position === 'patternize';

  return (
    <div className="space-y-3 pt-2 border-t border-white/5">
      {/* 1. Header: Title, 500+ Badge, Placement & Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Pattern Studio</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-400/20 text-cyan-300 font-bold border border-cyan-400/30">
            500+ Pro
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Layer placement: Overlay vs Backdrop vs Full Photo Patternize */}
          <select
            value={settings.position ?? (settings.patternize ? 'patternize' : 'overlay')}
            onChange={e => {
              const pos = e.target.value as 'overlay' | 'background' | 'patternize';
              onUpdateSettings({
                position: pos,
                patternize: pos === 'patternize',
                enabled: true,
              });
              if (pos === 'patternize') setActiveSubTab('patternize');
            }}
            className="bg-dark-900 border border-white/10 text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-400 cursor-pointer font-medium"
            title="Pattern layer placement relative to the uploaded image"
          >
            <option value="overlay">Overlay (On Top)</option>
            <option value="background">Backdrop (Behind)</option>
            <option value="patternize">✨ Full Photo Patternize</option>
          </select>

          {/* Toggle Enable/Disable */}
          <button
            onClick={() =>
              onUpdateSettings({
                enabled: !settings.enabled,
                type: settings.type === 'none' ? 'pat_geo_001' : settings.type,
              })
            }
            className={`text-[10px] font-medium px-2 py-0.5 rounded transition ${
              settings.enabled && settings.type !== 'none'
                ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                : 'bg-dark-800 text-slate-400 hover:text-white'
            }`}
          >
            {settings.enabled && settings.type !== 'none' ? 'Enabled' : 'Off'}
          </button>
        </div>
      </div>

      {/* 2. Big Browse 500+ Patterns Button */}
      <button
        onClick={onOpenPatternModal}
        className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-teal-500/20 hover:from-purple-500/30 hover:to-teal-500/30 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-between group transition shadow-md"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span className="truncate">
            {settings.enabled && settings.type !== 'none' ? patternName : 'Browse 500+ Patterns'}
          </span>
        </div>
        <span className="px-2 py-0.5 rounded-lg bg-cyan-400 text-dark-950 text-[10px] font-bold shadow shrink-0">
          Library
        </span>
      </button>

      {/* Quick Dropdown of Top Featured Patterns */}
      <div className="relative">
        <select
          value={settings.type}
          onChange={e => {
            const nextType = e.target.value as PatternType;
            const is3DPattern = nextType.startsWith('pat_3d_');
            onUpdateSettings({
              type: nextType,
              enabled: nextType !== 'none',
              ...(is3DPattern && !settings.is3D ? { is3D: true } : {}),
            });
          }}
          className="w-full appearance-none bg-dark-900 border border-white/10 text-xs font-medium text-slate-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:border-cyan-400 cursor-pointer truncate"
        >
          {FEATURED_PATTERNS.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
          {!FEATURED_PATTERNS.some(p => p.id === settings.type) && settings.type !== 'none' && (
            <option value={settings.type}>
              {PATTERN_MAP.get(settings.type)?.name || settings.type} (Selected)
            </option>
          )}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {/* FULL FILL & COVERAGE CARD (সম্পূর্ণ ইমেজ ফিল কন্ট্রোল) */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-dark-900 border border-cyan-500/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs">🔲</span>
            <span className="text-xs font-bold text-white">Full Fill (সম্পূর্ণ ইমেজ ফিল)</span>
          </div>
          <button
            onClick={() => {
              const nextFullFill = settings.fullFill === false ? true : false;
              onUpdateSettings({
                fullFill: nextFullFill,
                fillMode: nextFullFill ? (settings.fillMode === 'stroke' ? 'both' : (settings.fillMode || 'both')) : 'stroke',
              });
            }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono transition border ${
              settings.fullFill !== false
                ? 'bg-cyan-400 text-dark-950 border-cyan-300 shadow-md shadow-cyan-500/20'
                : 'bg-dark-800 text-slate-400 border-white/10 hover:text-white'
            }`}
          >
            {settings.fullFill !== false ? 'FULL FILL: ON' : 'OFF'}
          </button>
        </div>

        {/* Fill Mode Segment: Solid Fill vs Fill + Line vs Wireframe Line */}
        <div className="grid grid-cols-3 gap-1 text-[10px]">
          {[
            { id: 'fill', label: 'Solid Fill', icon: '🎨' },
            { id: 'both', label: 'Fill + Line', icon: '🔲' },
            { id: 'stroke', label: 'Outline', icon: '✏️' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => onUpdateSettings({ fillMode: m.id as any, fullFill: m.id !== 'stroke' ? true : settings.fullFill })}
              className={`py-1.5 px-1 rounded-lg transition font-bold text-center truncate flex items-center justify-center gap-1 ${
                (settings.fillMode || 'both') === m.id
                  ? 'bg-cyan-400 text-dark-950 shadow-sm'
                  : 'bg-dark-950 hover:bg-dark-800 text-slate-400 border border-white/5'
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
            </button>
          ))}
        </div>

        {/* Fill Opacity Slider when Fill is active */}
        {(settings.fillMode || 'both') !== 'stroke' && (
          <div className="space-y-1 pt-1 border-t border-white/5">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Fill Density / Opacity</span>
              <span className="font-mono text-cyan-400 font-bold">{settings.fillOpacity ?? 45}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={settings.fillOpacity ?? 45}
              onChange={e => onUpdateSettings({ fillOpacity: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-dark-950 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* 3. Comprehensive Customization Controls when Enabled */}
      {settings.enabled && settings.type !== 'none' && (
        <div className="space-y-3 p-3 rounded-xl bg-dark-900/80 border border-white/10 shadow-md">
          {/* Sub-tabs: Style & Colors, Geometry & Scale, Effects & Glow, 3D Engine, Full Photo Patternize */}
          <div className="grid grid-cols-5 gap-1 p-0.5 rounded-lg bg-dark-950 border border-white/5 text-[10px] font-semibold">
            <button
              onClick={() => setActiveSubTab('style')}
              className={`py-1 rounded-md transition ${
                activeSubTab === 'style' ? 'bg-cyan-400 text-dark-950 shadow font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Colors
            </button>
            <button
              onClick={() => setActiveSubTab('geometry')}
              className={`py-1 rounded-md transition ${
                activeSubTab === 'geometry' ? 'bg-cyan-400 text-dark-950 shadow font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Geometry
            </button>
            <button
              onClick={() => setActiveSubTab('effects')}
              className={`py-1 rounded-md transition ${
                activeSubTab === 'effects' ? 'bg-cyan-400 text-dark-950 shadow font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Stroke
            </button>
            <button
              onClick={() => setActiveSubTab('3d')}
              className={`py-1 rounded-md transition flex items-center justify-center gap-1 ${
                activeSubTab === '3d'
                  ? 'bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 text-dark-950 font-bold shadow'
                  : settings.is3D
                  ? 'text-cyan-300 bg-cyan-400/15 border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Universal 3D Depth Engine"
            >
              <Box className="w-3 h-3" />
              <span>3D</span>
              {settings.is3D && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => {
                setActiveSubTab('patternize');
                if (!isPatternizeActive) {
                  onUpdateSettings({ patternize: true, position: 'patternize' });
                }
              }}
              className={`py-1 rounded-md transition flex items-center justify-center gap-1 ${
                activeSubTab === 'patternize'
                  ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-dark-950 font-bold shadow'
                  : isPatternizeActive
                  ? 'text-purple-300 bg-purple-500/20 border border-purple-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Transform Full Photo into Pattern"
            >
              <Zap className="w-3 h-3" />
              <span>Photo</span>
              {isPatternizeActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* TAB 1: Colors & Blend */}
          {activeSubTab === 'style' && (
            <div className="space-y-2.5">
              {/* Dual Colors: Stroke Color & Background Fill */}
              <div className="p-2.5 rounded-lg bg-dark-950 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-300">Pattern Palette</span>
                  <button
                    onClick={handleSwapColors}
                    className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                    title="Swap primary and background colors"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Swap Colors</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Primary Stroke Color */}
                  <div className="flex items-center justify-between p-1.5 rounded-md bg-dark-900 border border-white/10">
                    <span className="text-[10px] text-slate-400">Stroke:</span>
                    <label className="cursor-pointer flex items-center gap-1.5" title="Pick stroke color">
                      <span className="text-[10px] font-mono text-slate-300 uppercase">{settings.color}</span>
                      <div
                        className="w-4 h-4 rounded-md border border-white/20 shadow-sm"
                        style={{ backgroundColor: settings.color }}
                      />
                      <input
                        type="color"
                        value={settings.color}
                        onChange={e => onUpdateSettings({ color: e.target.value })}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {/* Secondary Tile Background Color */}
                  <div className="flex items-center justify-between p-1.5 rounded-md bg-dark-900 border border-white/10">
                    <span className="text-[10px] text-slate-400">Tile Fill:</span>
                    <div className="flex items-center gap-1.5">
                      {settings.backgroundColor && settings.backgroundColor !== 'transparent' ? (
                        <label className="cursor-pointer flex items-center gap-1.5" title="Pick fill color">
                          <span className="text-[10px] font-mono text-slate-300 uppercase">
                            {settings.backgroundColor}
                          </span>
                          <div
                            className="w-4 h-4 rounded-md border border-white/20 shadow-sm"
                            style={{ backgroundColor: settings.backgroundColor }}
                          />
                          <input
                            type="color"
                            value={settings.backgroundColor}
                            onChange={e => onUpdateSettings({ backgroundColor: e.target.value })}
                            className="sr-only"
                          />
                        </label>
                      ) : (
                        <button
                          onClick={() => onUpdateSettings({ backgroundColor: '#0a0d14' })}
                          className="text-[10px] text-cyan-400 hover:underline"
                        >
                          Transparent
                        </button>
                      )}
                      {settings.backgroundColor && settings.backgroundColor !== 'transparent' && (
                        <button
                          onClick={() => onUpdateSettings({ backgroundColor: 'transparent' })}
                          className="text-[10px] text-rose-400 hover:underline"
                          title="Reset to Transparent"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Opacity & Blend Mode */}
              <div className="space-y-2">
                {/* Opacity Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Pattern Opacity</span>
                    <span className="font-mono text-cyan-400 font-bold">{settings.opacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.opacity}
                    onChange={e => onUpdateSettings({ opacity: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                  {/* Quick Opacity Presets */}
                  <div className="grid grid-cols-4 gap-1 pt-0.5">
                    {[100, 75, 50, 25].map(val => (
                      <button
                        key={val}
                        onClick={() => onUpdateSettings({ opacity: val })}
                        className={`py-0.5 rounded text-[10px] font-mono transition ${
                          settings.opacity === val
                            ? 'bg-cyan-400 text-dark-950 font-bold'
                            : 'bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Blend Mode */}
                <div className="space-y-1 pt-1 border-t border-white/5">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Blend Mode</span>
                  </div>
                  <select
                    value={settings.blendMode}
                    onChange={e => onUpdateSettings({ blendMode: e.target.value as any })}
                    className="w-full bg-dark-950 border border-white/10 text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="overlay">Overlay (Vibrant Texture)</option>
                    <option value="screen">Screen (Luminous / Glowing)</option>
                    <option value="color-dodge">Color Dodge (High Energy Neon)</option>
                    <option value="soft-light">Soft Light (Subtle Film)</option>
                    <option value="multiply">Multiply (Dark Engraving)</option>
                    <option value="difference">Difference (Invert / Psychedelic)</option>
                    <option value="normal">Normal (Solid Lines)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Geometry, Scale & Angle */}
          {activeSubTab === 'geometry' && (
            <div className="space-y-2.5">
              {/* Scale / Density */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Pattern Scale / Density</span>
                  <span className="font-mono text-cyan-400 font-bold">{settings.scale}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={settings.scale}
                  onChange={e => onUpdateSettings({ scale: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
                <div className="grid grid-cols-5 gap-1 pt-0.5">
                  {[25, 50, 75, 100, 125].map(val => (
                    <button
                      key={val}
                      onClick={() => onUpdateSettings({ scale: val })}
                      className={`py-0.5 rounded text-[10px] font-mono transition ${
                        settings.scale === val
                          ? 'bg-cyan-400 text-dark-950 font-bold'
                          : 'bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation Angle Dial */}
              <div className="space-y-1 pt-1 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3 h-3 text-cyan-400" />
                    <span>Rotation Angle</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-cyan-400 font-bold">{settings.rotation ?? 0}°</span>
                    {(settings.rotation ?? 0) !== 0 && (
                      <button
                        onClick={() => onUpdateSettings({ rotation: 0 })}
                        className="text-[9px] text-slate-400 hover:text-cyan-400 transition"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={settings.rotation ?? 0}
                  onChange={e => onUpdateSettings({ rotation: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
                <div className="grid grid-cols-6 gap-1 pt-0.5">
                  {[0, 45, 90, 135, 180, 270].map(deg => (
                    <button
                      key={deg}
                      onClick={() => onUpdateSettings({ rotation: deg })}
                      className={`py-0.5 rounded text-[10px] font-mono transition ${
                        (settings.rotation ?? 0) === deg
                          ? 'bg-cyan-400 text-dark-950 font-bold'
                          : 'bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>

              {/* X & Y Offsets */}
              <div className="space-y-1 pt-1 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Move className="w-3 h-3 text-cyan-400" />
                    <span>Position Offset (X / Y)</span>
                  </span>
                  {((settings.offsetX ?? 0) !== 0 || (settings.offsetY ?? 0) !== 0) && (
                    <button
                      onClick={() => onUpdateSettings({ offsetX: 0, offsetY: 0 })}
                      className="text-[9px] text-slate-400 hover:text-cyan-400 transition"
                    >
                      Center (0,0)
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>X-Shift</span>
                      <span className="font-mono text-cyan-400">{settings.offsetX ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.offsetX ?? 0}
                      onChange={e => onUpdateSettings({ offsetX: Number(e.target.value) })}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Y-Shift</span>
                      <span className="font-mono text-cyan-400">{settings.offsetY ?? 0}px</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={settings.offsetY ?? 0}
                      onChange={e => onUpdateSettings({ offsetY: Number(e.target.value) })}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Stroke Weight & Glow */}
          {activeSubTab === 'effects' && (
            <div className="space-y-2.5">
              {/* Stroke Width / Weight */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Line Weight / Stroke Width</span>
                  <span className="font-mono text-cyan-400 font-bold">{settings.strokeWidth ?? 1.5}px</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6"
                  step="0.5"
                  value={settings.strokeWidth ?? 1.5}
                  onChange={e => onUpdateSettings({ strokeWidth: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[
                    { label: '0.5px', val: 0.5, desc: 'Hairline' },
                    { label: '1.0px', val: 1.0, desc: 'Fine' },
                    { label: '2.0px', val: 2.0, desc: 'Medium' },
                    { label: '4.0px', val: 4.0, desc: 'Bold' },
                  ].map(item => (
                    <button
                      key={item.val}
                      onClick={() => onUpdateSettings({ strokeWidth: item.val })}
                      className={`py-0.5 rounded text-[10px] font-mono transition ${
                        (settings.strokeWidth ?? 1.5) === item.val
                          ? 'bg-cyan-400 text-dark-950 font-bold'
                          : 'bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5'
                      }`}
                      title={item.desc}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neon Glow Intensity & Glow Color */}
              <div className="space-y-1 pt-1 border-t border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3 h-3 text-cyan-400" />
                    <span>Neon Glow Intensity</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{settings.glow ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={settings.glow ?? 0}
                  onChange={e => onUpdateSettings({ glow: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />

                {/* Glow Color if glow > 0 */}
                {(settings.glow ?? 0) > 0 && (
                  <div className="flex items-center justify-between p-1.5 rounded-lg bg-dark-950 border border-white/5">
                    <span className="text-[10px] text-slate-400">Glow Aura Color:</span>
                    <label className="cursor-pointer flex items-center gap-1.5" title="Pick glow color">
                      <span className="text-[10px] font-mono text-slate-300 uppercase">
                        {settings.glowColor || settings.color}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: settings.glowColor || settings.color }}
                      />
                      <input
                        type="color"
                        value={settings.glowColor || settings.color}
                        onChange={e => onUpdateSettings({ glowColor: e.target.value })}
                        className="sr-only"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: 3D Depth Engine */}
          {activeSubTab === '3d' && (
            <div className="space-y-3">
              {/* Universal 3D Toggle Card */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-950/40 via-purple-950/30 to-dark-950 border border-cyan-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                        settings.is3D
                          ? 'bg-cyan-400 text-dark-950 shadow-md shadow-cyan-500/30'
                          : 'bg-dark-800 text-slate-400'
                      }`}
                    >
                      <Box className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Universal 3D Engine</span>
                        <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-cyan-400/20 text-cyan-300 font-bold border border-cyan-400/30">
                          PRO
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Applies to any of the 500 patterns
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onUpdateSettings({ is3D: !settings.is3D })}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shadow ${
                      settings.is3D
                        ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-dark-950 shadow-cyan-500/25 ring-1 ring-white/30'
                        : 'bg-dark-800 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {settings.is3D ? '3D Active' : 'Enable 3D'}
                  </button>
                </div>

                {/* Quick 1-click Project Active Pattern to 3D */}
                {!settings.is3D ? (
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        is3D: true,
                        depth3D: settings.depth3D || 20,
                        pitch3D: settings.pitch3D || 28,
                        yaw3D: settings.yaw3D || 0,
                        shading3D: settings.shading3D || 'extrude',
                      })
                    }
                    className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-cyan-500/25 via-purple-500/25 to-teal-500/25 hover:from-cyan-500/35 hover:to-teal-500/35 border border-cyan-400/40 text-cyan-200 text-[10.5px] font-bold flex items-center justify-between transition shadow-sm"
                  >
                    <span className="truncate">✨ Project "{patternName}" in 3D</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-400 text-dark-950 font-bold shrink-0">
                      Activate 3D
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-[10px]">
                    <span className="text-cyan-300 font-medium truncate">
                      🧊 3D Engine Active on <strong className="text-white">{patternName}</strong>
                    </span>
                    <span className="text-cyan-400 font-mono text-[9px] shrink-0">
                      {settings.depth3D ?? 15}px • {settings.shading3D ?? 'extrude'}
                    </span>
                  </div>
                )}
              </div>

              {/* 3D Shading Mode Selector */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-dark-950 border border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">3D Shading & Projection Mode</span>
                  <span className="font-mono text-cyan-400 uppercase font-bold">
                    {settings.shading3D ?? 'extrude'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'extrude', label: 'Volumetric Extrude', desc: 'Stacked depth slices with drop shadow' },
                    { id: 'isometric', label: 'Isometric 30°', desc: 'Axonometric projection with dual facet shade' },
                    { id: 'perspective', label: 'Horizon Perspective', desc: 'Vanishing-point tilt with spatial depth' },
                    { id: 'emboss', label: 'Chiseled Bas-Relief', desc: 'Sculpted 3D coin emboss with specular rims' },
                    { id: 'wireframe', label: 'Holographic Wireframe', desc: 'Dual-rim neon cage with matrix glow' },
                  ].map(mode => {
                    const isSelected = (settings.shading3D ?? 'extrude') === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => onUpdateSettings({ shading3D: mode.id as any, is3D: true })}
                        className={`p-1.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                          isSelected
                            ? 'bg-cyan-400/20 border-cyan-400/60 text-cyan-200 ring-1 ring-cyan-400/40'
                            : 'bg-dark-900 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-white leading-none">{mode.label}</span>
                        <span className="text-[8.5px] text-slate-400 leading-tight truncate">{mode.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Volumetric Depth Extrusion */}
              <div className="space-y-1 p-2.5 rounded-xl bg-dark-950 border border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Volumetric Depth / Extrusion</span>
                  <span className="font-mono text-cyan-400 font-bold">{settings.depth3D ?? 15}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={settings.depth3D ?? 15}
                  onChange={e => onUpdateSettings({ depth3D: Number(e.target.value), is3D: true })}
                  className="w-full accent-cyan-400"
                />
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[
                    { label: '5px Flat', val: 5 },
                    { label: '15px Mid', val: 15 },
                    { label: '25px Deep', val: 25 },
                    { label: '40px Ultra', val: 40 },
                  ].map(item => (
                    <button
                      key={item.val}
                      onClick={() => onUpdateSettings({ depth3D: item.val, is3D: true })}
                      className={`py-0.5 rounded text-[9.5px] font-mono transition ${
                        (settings.depth3D ?? 15) === item.val
                          ? 'bg-cyan-400 text-dark-950 font-bold'
                          : 'bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pitch (Tilt-X) & Yaw (Tilt-Y) Rotation */}
              <div className="p-2.5 rounded-xl bg-dark-950 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Compass className="w-3 h-3 text-cyan-400" />
                    <span>3D Angle: Pitch (Tilt-X) & Yaw (Tilt-Y)</span>
                  </span>
                  <button
                    onClick={() => onUpdateSettings({ pitch3D: 25, yaw3D: 0, is3D: true })}
                    className="text-[9px] text-cyan-400 hover:underline"
                    title="Reset to standard 3D isometric angle"
                  >
                    Reset (25°, 0°)
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Pitch / Tilt X */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Pitch (Tilt-X)</span>
                      <span className="font-mono text-cyan-400">{settings.pitch3D ?? 25}°</span>
                    </div>
                    <input
                      type="range"
                      min="-60"
                      max="60"
                      value={settings.pitch3D ?? 25}
                      onChange={e => onUpdateSettings({ pitch3D: Number(e.target.value), is3D: true })}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Yaw / Tilt Y */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] text-slate-400">
                      <span>Yaw (Tilt-Y)</span>
                      <span className="font-mono text-cyan-400">{settings.yaw3D ?? 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="-60"
                      max="60"
                      value={settings.yaw3D ?? 0}
                      onChange={e => onUpdateSettings({ yaw3D: Number(e.target.value), is3D: true })}
                      className="w-full accent-cyan-400"
                    />
                  </div>
                </div>

                {/* 3D Angle Presets */}
                <div className="grid grid-cols-4 gap-1 pt-1 border-t border-white/5">
                  {[
                    { label: 'Isometric', pitch: 30, yaw: 0 },
                    { label: 'Horizon', pitch: 48, yaw: 0 },
                    { label: 'Cyber Yaw', pitch: 25, yaw: 20 },
                    { label: 'Top View', pitch: 10, yaw: 0 },
                  ].map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => onUpdateSettings({ pitch3D: preset.pitch, yaw3D: preset.yaw, is3D: true })}
                      className="py-0.5 rounded text-[9px] font-mono bg-dark-900 hover:bg-dark-850 text-slate-400 hover:text-cyan-300 border border-white/5 transition"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3D Directional Light Sun Angle */}
              <div className="p-2.5 rounded-xl bg-dark-950 border border-white/5 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Sun className="w-3 h-3 text-cyan-400" />
                    <span>3D Light & Shadow Sun Angle</span>
                  </span>
                  <span className="font-mono text-cyan-400 font-bold">{settings.lightAngle3D ?? 135}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={settings.lightAngle3D ?? 135}
                  onChange={e => onUpdateSettings({ lightAngle3D: Number(e.target.value), is3D: true })}
                  className="w-full accent-cyan-400"
                />
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[
                    { label: '45° ↗ Top-R', deg: 45 },
                    { label: '135° ↖ Top-L', deg: 135 },
                    { label: '225° ↙ Bot-L', deg: 225 },
                    { label: '315° ↘ Bot-R', deg: 315 },
                  ].map(dir => (
                    <button
                      key={dir.deg}
                      onClick={() => onUpdateSettings({ lightAngle3D: dir.deg, is3D: true })}
                      className={`py-0.5 rounded text-[9px] font-mono transition ${
                        (settings.lightAngle3D ?? 135) === dir.deg
                          ? 'bg-cyan-400 text-dark-950 font-bold'
                          : 'bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {dir.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Click Fast 3D Preset Launcher */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-dark-950 border border-white/5">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-slate-300">1-Click Fast 3D Patterns</span>
                  <span className="text-[9px] text-cyan-400 font-mono">500+ Ready</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        type: 'pat_3d_001',
                        enabled: true,
                        is3D: true,
                        shading3D: 'isometric',
                        depth3D: 22,
                        pitch3D: 30,
                        yaw3D: 0,
                      })
                    }
                    className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/30 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>💎</span>
                    <span className="truncate">Isometric Voxels</span>
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        type: 'pat_3d_003',
                        enabled: true,
                        is3D: true,
                        shading3D: 'perspective',
                        depth3D: 30,
                        pitch3D: 45,
                        yaw3D: 0,
                      })
                    }
                    className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/30 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>⚡</span>
                    <span className="truncate">Cyber Horizon</span>
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        type: 'pat_3d_002',
                        enabled: true,
                        is3D: true,
                        shading3D: 'extrude',
                        depth3D: 26,
                        pitch3D: 25,
                        yaw3D: 15,
                      })
                    }
                    className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/30 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>🏛️</span>
                    <span className="truncate">Hex Pillars</span>
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        type: 'pat_3d_005',
                        enabled: true,
                        is3D: true,
                        shading3D: 'emboss',
                        depth3D: 20,
                        pitch3D: 20,
                        yaw3D: 0,
                        color: '#ffd700',
                      })
                    }
                    className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/30 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>👑</span>
                    <span className="truncate">Bas-Relief Gold</span>
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        type: settings.type && settings.type !== 'none' ? settings.type : 'pat_tec_001',
                        enabled: true,
                        is3D: true,
                        shading3D: 'wireframe',
                        depth3D: 25,
                        pitch3D: 35,
                        yaw3D: 15,
                        color: '#00f0ff',
                      })
                    }
                    className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/30 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>🌐</span>
                    <span className="truncate">Holo Wireframe</span>
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        type: 'pat_sac_003',
                        enabled: true,
                        is3D: true,
                        shading3D: 'isometric',
                        depth3D: 20,
                        pitch3D: 28,
                        yaw3D: -10,
                        color: '#a855f7',
                      })
                    }
                    className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/30 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>🌀</span>
                    <span className="truncate">Sacred 3D Torus</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Full Image Patternizer */}
          {activeSubTab === 'patternize' && (
            <div className="space-y-3">
              {/* Master Patternize Switch Banner */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-950/50 via-cyan-950/40 to-dark-950 border border-purple-500/40 space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition ${
                        isPatternizeActive
                          ? 'bg-gradient-to-r from-purple-400 to-cyan-400 text-dark-950 shadow-md shadow-purple-500/30'
                          : 'bg-dark-800 text-slate-400'
                      }`}
                    >
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Full Photo Patternize</span>
                        <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-purple-400/20 text-purple-300 font-bold border border-purple-400/30">
                          PRO
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Transform entire photo into pattern mosaic & vector engraving
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const nextState = !isPatternizeActive;
                      onUpdateSettings({
                        patternize: nextState,
                        position: nextState ? 'patternize' : 'overlay',
                        enabled: true,
                      });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition shadow ${
                      isPatternizeActive
                        ? 'bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 text-dark-950 shadow-purple-500/25 ring-1 ring-white/30'
                        : 'bg-dark-800 text-slate-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {isPatternizeActive ? 'Active' : 'Enable'}
                  </button>
                </div>

                {!isPatternizeActive && (
                  <p className="text-[10px] text-purple-300/80 bg-purple-950/40 p-1.5 rounded-lg border border-purple-500/20">
                    💡 Click "Enable" to transform the uploaded photo into a geometric mosaic or vector engraving using the 500+ patterns!
                  </p>
                )}
              </div>

              {/* Patternize Mode Selector (5 Modes) */}
              <div className="space-y-1.5 p-2.5 rounded-xl bg-dark-950 border border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">Transformation Style</span>
                  <span className="font-mono text-purple-400 uppercase font-bold">
                    {settings.patternizeMode ?? 'mosaic'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: 'mosaic', label: 'Photo Color Mosaic', desc: 'Vector tiles take photo RGB colors' },
                    { id: 'halftone', label: 'Banknote Engraving', desc: 'Brightness sculpts line weights' },
                    { id: '3d-voxel', label: '3D Voxel Sculpture', desc: 'Extruded 3D cubes with sun lighting' },
                    { id: 'stencil', label: 'Pattern Stencil Cutout', desc: 'Clips photo inside vector pattern' },
                    { id: 'duotone', label: 'Duotone Tapestry', desc: 'Harmonized 2-tone vector poster' },
                  ].map(mode => {
                    const isSelected = (settings.patternizeMode ?? 'mosaic') === mode.id;
                    return (
                      <button
                        key={mode.id}
                        onClick={() =>
                          onUpdateSettings({
                            patternizeMode: mode.id as any,
                            patternize: true,
                            position: 'patternize',
                          })
                        }
                        className={`p-1.5 rounded-lg border text-left transition flex flex-col gap-0.5 ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-400/60 text-purple-200 ring-1 ring-purple-400/40'
                            : 'bg-dark-900 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-white leading-none">{mode.label}</span>
                        <span className="text-[8.5px] text-slate-400 leading-tight truncate">{mode.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detail Fidelity Slider */}
              <div className="space-y-1 p-2.5 rounded-xl bg-dark-950 border border-white/5">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Photographic Detail Retention</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {settings.patternizeFidelity ?? 75}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={settings.patternizeFidelity ?? 75}
                  onChange={e =>
                    onUpdateSettings({
                      patternizeFidelity: Number(e.target.value),
                      patternize: true,
                      position: 'patternize',
                    })
                  }
                  className="w-full accent-cyan-400"
                />
                <div className="grid grid-cols-4 gap-1 pt-0.5">
                  {[
                    { label: '25% Abstract', val: 25 },
                    { label: '50% Balanced', val: 50 },
                    { label: '75% Detailed', val: 75 },
                    { label: '100% Crisp', val: 100 },
                  ].map(item => (
                    <button
                      key={item.val}
                      onClick={() =>
                        onUpdateSettings({
                          patternizeFidelity: item.val,
                          patternize: true,
                          position: 'patternize',
                        })
                      }
                      className={`py-0.5 rounded text-[9.5px] font-mono transition ${
                        (settings.patternizeFidelity ?? 75) === item.val
                          ? 'bg-cyan-400 text-dark-950 font-bold'
                          : 'bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contrast Sensitivity & Invert Modulation */}
              <div className="p-2.5 rounded-xl bg-dark-950 border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-300">Luminance Sensitivity & Invert</span>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        patternizeInvert: !settings.patternizeInvert,
                        patternize: true,
                        position: 'patternize',
                      })
                    }
                    className={`px-2 py-0.5 rounded text-[9px] font-mono transition border ${
                      settings.patternizeInvert
                        ? 'bg-purple-500/20 text-purple-300 border-purple-400/40 font-bold'
                        : 'bg-dark-900 text-slate-400 border-white/5 hover:text-white'
                    }`}
                    title="Invert light and dark tone mapping"
                  >
                    {settings.patternizeInvert ? 'Inverted (Dark on Light)' : 'Normal (Light on Dark)'}
                  </button>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Contrast Punch</span>
                    <span className="font-mono text-cyan-400">{settings.patternizeContrast ?? 50}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={settings.patternizeContrast ?? 50}
                    onChange={e =>
                      onUpdateSettings({
                        patternizeContrast: Number(e.target.value),
                        patternize: true,
                        position: 'patternize',
                      })
                    }
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>

              {/* 1-Click Fast Photo-to-Pattern Presets */}
              <div className="space-y-1.5 p-2 rounded-xl bg-dark-950 border border-white/5">
                <span className="text-[10px] font-semibold text-slate-300">1-Click Photo Transformation Presets</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        type: 'pat_3d_001',
                        enabled: true,
                        patternize: true,
                        position: 'patternize',
                        patternizeMode: '3d-voxel',
                        is3D: true,
                        depth3D: 25,
                        scale: 45,
                        patternizeFidelity: 75,
                      })
                    }
                    className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-purple-400/40 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>💎</span>
                    <span className="truncate">3D Voxel Portrait</span>
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        type: 'pat_hex_001',
                        enabled: true,
                        patternize: true,
                        position: 'patternize',
                        patternizeMode: 'mosaic',
                        scale: 40,
                        patternizeFidelity: 70,
                      })
                    }
                    className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-purple-400/40 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>🏛️</span>
                    <span className="truncate">Honeycomb Mosaic</span>
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        type: 'pat_jap_001',
                        enabled: true,
                        patternize: true,
                        position: 'patternize',
                        patternizeMode: 'halftone',
                        scale: 45,
                        strokeWidth: 2.0,
                        color: '#00f0ff',
                        patternizeFidelity: 80,
                        patternizeContrast: 60,
                      })
                    }
                    className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-purple-400/40 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>📜</span>
                    <span className="truncate">Banknote Engrave</span>
                  </button>
                  <button
                    onClick={() =>
                      onUpdateSettings({
                        type: 'pat_sac_001',
                        enabled: true,
                        patternize: true,
                        position: 'patternize',
                        patternizeMode: 'duotone',
                        scale: 55,
                        color: '#ffd700',
                        backgroundColor: '#1a0b2e',
                        patternizeFidelity: 65,
                      })
                    }
                    className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-purple-400/40 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <span>🌸</span>
                    <span className="truncate">Sacred Duotone</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 4. Action Helpers: AI Match Photo & Randomize */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
            {selectedImage && (
              <button
                onClick={handleExtractFromImage}
                disabled={isExtracting}
                className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-cyan-400/30 text-cyan-300 text-[10px] font-semibold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                title="Extract pattern tint matching active photo"
              >
                <Wand2 className={`w-3 h-3 ${isExtracting ? 'animate-spin' : ''}`} />
                <span>{isExtracting ? 'Matching...' : 'AI Match Photo'}</span>
              </button>
            )}

            <button
              onClick={handleRandomize}
              className="py-1.5 px-2.5 rounded-lg bg-dark-950 hover:bg-dark-800 border border-white/10 text-slate-300 hover:text-white text-[10px] font-medium flex items-center gap-1 transition"
              title="Pick random pattern and parameters"
            >
              <Shuffle className="w-3 h-3 text-cyan-400" />
              <span>Random</span>
            </button>
          </div>

          {/* 5. Curated Style Presets */}
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Curated Pattern Styles</span>
              </span>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                {showPresets ? 'Collapse' : `Show (${PATTERN_STYLE_PRESETS.length})`}
              </button>
            </div>

            {showPresets && (
              <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                {PATTERN_STYLE_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handleApplyPreset(preset)}
                    className="p-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/40 text-left transition flex items-center gap-2 group"
                  >
                    <div
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0 shadow-sm"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-[10px] text-slate-300 group-hover:text-white truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
