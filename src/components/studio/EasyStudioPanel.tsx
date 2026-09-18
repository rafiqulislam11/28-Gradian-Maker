import React, { useState } from 'react';
import {
  Sparkles,
  Sliders,
  Palette,
  Sun,
  Disc,
  Grid,
  Box,
  RotateCcw,
  Check,
  Dices,
  Eye,
  Wand2,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Compass,
  Move,
  ArrowRightLeft,
} from 'lucide-react';
import { FilterSettings, ImageItem, Preset } from '../../types/studio';
import { PATTERN_MAP } from '../../engine/patternLibrary';
import { AutoImageToGradient } from './AutoImageToGradient';

interface EasyStudioPanelProps {
  settings: FilterSettings;
  onUpdateSettings: <K extends keyof FilterSettings>(category: K, values: Partial<FilterSettings[K]>) => void;
  onOpenPatternModal: () => void;
  onOpen3DStudio?: () => void;
  onOpenProPatternStudio?: () => void;
  selectedImage: ImageItem | null;
  onRandomize?: () => void;
  onReset?: () => void;
  onUploadImages?: (files: File[]) => void;
  onLoadSampleImage?: () => void;
}

// 8 Curated Easy 1-Click Styles (সহজ ১-ক্লিক স্টাইল)
export const EASY_STYLES = [
  {
    id: 'cyber_neon',
    name: 'Cyber Neon',
    bangla: 'সাইবার নিয়ন',
    desc: 'Electric neon glow with 3D grid',
    icon: '⚡',
    gradientStyle: 'linear-gradient(135deg, #00d2ff, #9d00ff, #ff007f)',
    apply: (onUpdate: <K extends keyof FilterSettings>(c: K, v: Partial<FilterSettings[K]>) => void) => {
      onUpdate('gradient', {
        enabled: true,
        type: 'mesh',
        opacity: 85,
        meshColors: ['#00d2ff', '#9d00ff', '#ff007f', '#00f0ff'],
        stops: [
          { id: '1', color: '#00d2ff', position: 0 },
          { id: '2', color: '#9d00ff', position: 50 },
          { id: '3', color: '#ff007f', position: 100 },
        ],
      });
      onUpdate('blur', { enabled: true, category: 'mesh', radius: 25 });
      onUpdate('noise', { enabled: true, type: 'digital', amount: 12 });
      onUpdate('patterns', {
        enabled: true,
        type: 'pat_geo_001',
        scale: 60,
        opacity: 80,
        color: '#00f0ff',
        is3D: true,
        depth3D: 18,
        pitch3D: 30,
        yaw3D: 0,
        shading3D: 'isometric',
      });
    },
  },
  {
    id: 'soft_glass',
    name: 'Soft Glass',
    bangla: 'সফট গ্লাস',
    desc: 'Frosted smooth glassmorphism',
    icon: '💎',
    gradientStyle: 'linear-gradient(135deg, #a855f7, #ec4899, #3b82f6)',
    apply: (onUpdate: <K extends keyof FilterSettings>(c: K, v: Partial<FilterSettings[K]>) => void) => {
      onUpdate('gradient', {
        enabled: true,
        type: 'linear',
        opacity: 75,
        angle: 135,
        stops: [
          { id: '1', color: '#a855f7', position: 0 },
          { id: '2', color: '#ec4899', position: 50 },
          { id: '3', color: '#3b82f6', position: 100 },
        ],
      });
      onUpdate('blur', { enabled: true, category: 'glass', radius: 42, glassFrost: 70, glassSpecular: 75 });
      onUpdate('noise', { enabled: false, amount: 0 });
      onUpdate('patterns', { enabled: false, type: 'none', is3D: false });
    },
  },
  {
    id: 'sunset_chill',
    name: 'Sunset Glow',
    bangla: 'সানসেট গ্লো',
    desc: 'Warm golden radiant aura',
    icon: '🌅',
    gradientStyle: 'linear-gradient(135deg, #f59e0b, #ef4444, #7c3aed)',
    apply: (onUpdate: <K extends keyof FilterSettings>(c: K, v: Partial<FilterSettings[K]>) => void) => {
      onUpdate('gradient', {
        enabled: true,
        type: 'linear',
        opacity: 85,
        angle: 120,
        stops: [
          { id: '1', color: '#f59e0b', position: 0 },
          { id: '2', color: '#ef4444', position: 50 },
          { id: '3', color: '#7c3aed', position: 100 },
        ],
      });
      onUpdate('blur', { enabled: true, category: 'mesh', radius: 35 });
      onUpdate('noise', { enabled: true, type: 'film', amount: 15 });
      onUpdate('patterns', { enabled: false, type: 'none', is3D: false });
    },
  },
  {
    id: 'emerald_matrix',
    name: 'Emerald Tech',
    bangla: 'সবুজ ম্যাট্রিক্স',
    desc: 'Cyber green matrix grid',
    icon: '🌿',
    gradientStyle: 'linear-gradient(135deg, #064e3b, #10b981, #06b6d4)',
    apply: (onUpdate: <K extends keyof FilterSettings>(c: K, v: Partial<FilterSettings[K]>) => void) => {
      onUpdate('gradient', {
        enabled: true,
        type: 'linear',
        opacity: 80,
        angle: 90,
        stops: [
          { id: '1', color: '#064e3b', position: 0 },
          { id: '2', color: '#10b981', position: 50 },
          { id: '3', color: '#06b6d4', position: 100 },
        ],
      });
      onUpdate('blur', { enabled: true, category: 'mesh', radius: 20 });
      onUpdate('noise', { enabled: true, type: 'film', amount: 10 });
      onUpdate('patterns', {
        enabled: true,
        type: 'pat_tec_001',
        scale: 65,
        opacity: 85,
        color: '#10b981',
        is3D: true,
        depth3D: 22,
        pitch3D: 25,
        yaw3D: 10,
        shading3D: 'extrude',
      });
    },
  },
  {
    id: 'gold_luxury',
    name: 'Gold Luxury',
    bangla: 'গোল্ড লাক্সারি',
    desc: 'Regal golden 3D bas-relief',
    icon: '👑',
    gradientStyle: 'linear-gradient(135deg, #1e1b4b, #431407, #b45309)',
    apply: (onUpdate: <K extends keyof FilterSettings>(c: K, v: Partial<FilterSettings[K]>) => void) => {
      onUpdate('gradient', {
        enabled: true,
        type: 'linear',
        opacity: 85,
        angle: 45,
        stops: [
          { id: '1', color: '#1e1b4b', position: 0 },
          { id: '2', color: '#431407', position: 50 },
          { id: '3', color: '#b45309', position: 100 },
        ],
      });
      onUpdate('blur', { enabled: true, category: 'mesh', radius: 28 });
      onUpdate('noise', { enabled: false, amount: 0 });
      onUpdate('patterns', {
        enabled: true,
        type: 'pat_sac_001',
        scale: 70,
        opacity: 90,
        color: '#ffd700',
        is3D: true,
        depth3D: 24,
        pitch3D: 20,
        yaw3D: 0,
        shading3D: 'emboss',
      });
    },
  },
  {
    id: '3d_voxel_pop',
    name: '3D Voxel Pop',
    bangla: 'থ্রিডি পপ',
    desc: '3D isometric volumetric cubes',
    icon: '🧊',
    gradientStyle: 'linear-gradient(135deg, #00d2ff, #4f46e5, #ec4899)',
    apply: (onUpdate: <K extends keyof FilterSettings>(c: K, v: Partial<FilterSettings[K]>) => void) => {
      onUpdate('gradient', {
        enabled: true,
        type: 'mesh',
        opacity: 75,
        meshColors: ['#00d2ff', '#4f46e5', '#ec4899', '#f59e0b'],
        stops: [
          { id: '1', color: '#00d2ff', position: 0 },
          { id: '2', color: '#ec4899', position: 100 },
        ],
      });
      onUpdate('blur', { enabled: true, category: 'mesh', radius: 25 });
      onUpdate('noise', { enabled: false, amount: 0 });
      onUpdate('patterns', {
        enabled: true,
        type: 'pat_3d_001',
        scale: 65,
        opacity: 95,
        color: '#00f0ff',
        is3D: true,
        depth3D: 26,
        pitch3D: 30,
        yaw3D: 0,
        shading3D: 'isometric',
      });
    },
  },
  {
    id: 'holo_wireframe',
    name: 'Holo Hologram',
    bangla: 'ওয়্যারফ্রেম',
    desc: 'Futuristic 3D neon wireframe',
    icon: '🌐',
    gradientStyle: 'linear-gradient(135deg, #0f172a, #0369a1, #020617)',
    apply: (onUpdate: <K extends keyof FilterSettings>(c: K, v: Partial<FilterSettings[K]>) => void) => {
      onUpdate('gradient', {
        enabled: true,
        type: 'radial',
        opacity: 80,
        stops: [
          { id: '1', color: '#0369a1', position: 0 },
          { id: '2', color: '#020617', position: 100 },
        ],
      });
      onUpdate('blur', { enabled: false, radius: 0 });
      onUpdate('noise', { enabled: true, type: 'digital', amount: 8 });
      onUpdate('patterns', {
        enabled: true,
        type: 'pat_3d_003',
        scale: 75,
        opacity: 95,
        color: '#38bdf8',
        is3D: true,
        depth3D: 28,
        pitch3D: 40,
        yaw3D: 15,
        shading3D: 'wireframe',
      });
    },
  },
  {
    id: 'dark_minimal',
    name: 'Dark Minimal',
    bangla: 'ডার্ক মিনিমাল',
    desc: 'Clean sleek dark mode mood',
    icon: '🖤',
    gradientStyle: 'linear-gradient(135deg, #1e293b, #0f172a, #020617)',
    apply: (onUpdate: <K extends keyof FilterSettings>(c: K, v: Partial<FilterSettings[K]>) => void) => {
      onUpdate('gradient', {
        enabled: true,
        type: 'linear',
        opacity: 65,
        angle: 180,
        stops: [
          { id: '1', color: '#1e293b', position: 0 },
          { id: '2', color: '#0f172a', position: 100 },
        ],
      });
      onUpdate('blur', { enabled: true, category: 'mesh', radius: 45 });
      onUpdate('noise', { enabled: true, type: 'film', amount: 8 });
      onUpdate('patterns', { enabled: false, type: 'none', is3D: false });
    },
  },
];

// 6 Easy Color Themes
export const EASY_COLOR_MOODS = [
  { label: 'Cyan / Purple', colors: ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00'], bg: 'from-cyan-400 to-purple-600' },
  { label: 'Sunset Glow', colors: ['#ff4b1f', '#ff9068', '#f59e0b', '#ec4899'], bg: 'from-amber-400 to-rose-600' },
  { label: 'Emerald Forest', colors: ['#059669', '#10b981', '#06b6d4', '#047857'], bg: 'from-emerald-400 to-teal-600' },
  { label: 'Cyber Pink', colors: ['#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4'], bg: 'from-pink-500 to-violet-600' },
  { label: 'Royal Gold', colors: ['#d97706', '#f59e0b', '#fbbf24', '#78350f'], bg: 'from-amber-500 to-yellow-400' },
  { label: 'Dark Slate', colors: ['#334155', '#1e293b', '#0f172a', '#020617'], bg: 'from-slate-600 to-slate-950' },
];

export const EasyStudioPanel: React.FC<EasyStudioPanelProps> = ({
  settings,
  onUpdateSettings,
  onOpenPatternModal,
  onOpen3DStudio,
  onOpenProPatternStudio,
  selectedImage,
  onRandomize,
  onReset,
  onUploadImages,
  onLoadSampleImage,
}) => {
  const [selectedStyleId, setSelectedStyleId] = useState<string>('cyber_neon');
  const [patternTab, setPatternTab] = useState<'transform' | 'colors' | 'stroke' | '3d'>('transform');
  const [showPatternCustomizer, setShowPatternCustomizer] = useState<boolean>(true);

  // Magic Auto-Enhance
  const handleMagicAutoEnhance = () => {
    if (selectedImage?.extractedPalette && selectedImage.extractedPalette.length >= 2) {
      const p = selectedImage.extractedPalette;
      onUpdateSettings('gradient', {
        enabled: true,
        type: 'mesh',
        opacity: 85,
        meshColors: [p[0], p[1] || p[0], p[2] || p[0], p[3] || p[1] || p[0]],
        stops: [
          { id: '1', color: p[0], position: 0 },
          { id: '2', color: p[1] || p[0], position: 50 },
          { id: '3', color: p[2] || p[1] || p[0], position: 100 },
        ],
      });
      onUpdateSettings('blur', { enabled: true, category: 'mesh', radius: 30 });
      onUpdateSettings('noise', { enabled: true, type: 'film', amount: 12 });
    } else {
      onUpdateSettings('gradient', {
        enabled: true,
        type: 'mesh',
        opacity: 85,
        meshColors: ['#00d2ff', '#9d00ff', '#ff007f', '#00f0ff'],
        stops: [
          { id: '1', color: '#00d2ff', position: 0 },
          { id: '2', color: '#9d00ff', position: 50 },
          { id: '3', color: '#ff007f', position: 100 },
        ],
      });
      onUpdateSettings('blur', { enabled: true, category: 'mesh', radius: 32 });
      onUpdateSettings('noise', { enabled: true, type: 'film', amount: 10 });
    }
  };

  const activePatternName = PATTERN_MAP.get(settings.patterns?.type)?.name || settings.patterns?.type || 'None';

  return (
    <div className="space-y-3.5 select-none">
      {/* 1. Magic 1-Click Auto-Enhance & Surprise Header */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-teal-500/20 border border-cyan-400/40 shadow-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center text-dark-950 shadow-md shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Magic Auto-Style</span>
            <span className="text-[10px] text-cyan-300 block font-medium">
              এক ক্লিকে অটো সুন্দর লুক
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleMagicAutoEnhance}
            className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-dark-950 font-black text-[11px] transition shadow-md active:scale-95 flex items-center gap-1 shrink-0"
            title="Auto-enhance gradient, blur, and noise automatically"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>অটো স্টাইল</span>
          </button>

          {onRandomize && (
            <button
              onClick={onRandomize}
              className="p-1.5 rounded-xl bg-dark-900/80 hover:bg-dark-800 text-slate-300 hover:text-cyan-300 border border-white/10 transition active:scale-95 shrink-0"
              title="Surprise me with a new random style (নতুন স্টাইল)"
            >
              <Dices className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. 8 Curated 1-Click Styles (সহজ ১-ক্লিক স্টাইল) */}
      <div className="space-y-2 p-3 rounded-2xl bg-dark-900/90 border border-white/10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white">1-Click Styles (সহজ স্টাইল)</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">8 Presets</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {EASY_STYLES.map(style => {
            const isSelected = selectedStyleId === style.id;
            return (
              <button
                key={style.id}
                onClick={() => {
                  setSelectedStyleId(style.id);
                  style.apply(onUpdateSettings);
                }}
                className={`p-2 rounded-xl text-left transition flex items-center gap-2 border relative overflow-hidden group ${
                  isSelected
                    ? 'bg-cyan-400/15 border-cyan-400 ring-1 ring-cyan-400/40 shadow-md shadow-cyan-500/20'
                    : 'bg-dark-950/80 hover:bg-dark-800 border-white/5 hover:border-white/20'
                }`}
              >
                {/* Thumbnail gradient dot */}
                <div
                  className="w-7 h-7 rounded-lg shrink-0 border border-white/20 shadow-sm flex items-center justify-center text-xs"
                  style={{ background: style.gradientStyle }}
                >
                  <span>{style.icon}</span>
                </div>

                <div className="overflow-hidden flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-bold text-white truncate block">
                      {style.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block truncate">
                    {style.bangla}
                  </span>
                </div>

                {isSelected && (
                  <div className="w-4 h-4 rounded-full bg-cyan-400 text-dark-950 flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2.5 Auto Image to Gradient Full System */}
      <AutoImageToGradient
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        selectedImage={selectedImage}
        onUploadImages={onUploadImages}
        onLoadSampleImage={onLoadSampleImage}
      />

      {/* 3. Quick Color Moods (কালার থিম) */}
      <div className="space-y-2 p-3 rounded-2xl bg-dark-900/90 border border-white/10 shadow-md">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white flex items-center gap-1.5">
            <span>🎨</span>
            <span>Color Moods (কালার থিম)</span>
          </span>
          <span className="text-[10px] text-slate-400">1-Click Colors</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {EASY_COLOR_MOODS.map(mood => (
            <button
              key={mood.label}
              onClick={() => {
                onUpdateSettings('gradient', {
                  enabled: true,
                  meshColors: mood.colors as [string, string, string, string],
                  stops: [
                    { id: '1', color: mood.colors[0], position: 0 },
                    { id: '2', color: mood.colors[1], position: 50 },
                    { id: '3', color: mood.colors[2], position: 100 },
                  ],
                });
                if (settings.patterns.enabled) {
                  onUpdateSettings('patterns', { color: mood.colors[0] });
                }
              }}
              className="p-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/30 text-left transition flex items-center gap-1.5 text-[10px] text-slate-300 hover:text-white"
            >
              <div className={`w-3.5 h-3.5 rounded-full bg-gradient-to-r ${mood.bg} shrink-0 shadow-sm`} />
              <span className="truncate">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Easy Master Sliders (সহজ কন্ট্রোলস) */}
      <div className="space-y-3 p-3.5 rounded-2xl bg-dark-900/90 border border-white/10 shadow-md">
        <div className="flex items-center justify-between text-xs border-b border-white/5 pb-2">
          <span className="font-bold text-white flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simple Sliders (সহজ কন্ট্রোল)</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400">Live Preview</span>
        </div>

        {/* 0. Image Opacity Slider (when image is present) */}
        {selectedImage && (
          <div className="space-y-1 pb-2 border-b border-white/5">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span className="font-medium flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Image Opacity (ইমেজ অপাসিটি)</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{settings.image?.opacity ?? 100}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.image?.opacity ?? 100}
              onChange={e => onUpdateSettings('image', { opacity: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5"
            />
            <div className="grid grid-cols-4 gap-1 pt-0.5">
              {[
                { label: '0% Pure', val: 0 },
                { label: '50% Blend', val: 50 },
                { label: '80% Rich', val: 80 },
                { label: '100% Full', val: 100 },
              ].map(item => (
                <button
                  key={item.val}
                  onClick={() => onUpdateSettings('image', { opacity: item.val })}
                  className={`py-0.5 rounded text-[9.5px] font-mono transition ${
                    (settings.image?.opacity ?? 100) === item.val
                      ? 'bg-cyan-400 text-dark-950 font-bold'
                      : 'bg-dark-950 hover:bg-dark-800 text-slate-400 border border-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 1. Color Intensity / Opacity */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span className="font-medium">1. Color Glow / Intensity (রঙের উজ্জ্বলতা)</span>
            <span className="font-mono text-cyan-400 font-bold">{settings.gradient.opacity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={settings.gradient.opacity}
            onChange={e => onUpdateSettings('gradient', { opacity: Number(e.target.value), enabled: true })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5"
          />
          <div className="grid grid-cols-4 gap-1 pt-0.5">
            {[
              { label: 'Soft 40%', val: 40 },
              { label: 'Mid 65%', val: 65 },
              { label: 'Vibrant 85%', val: 85 },
              { label: 'Full 100%', val: 100 },
            ].map(item => (
              <button
                key={item.val}
                onClick={() => onUpdateSettings('gradient', { opacity: item.val, enabled: true })}
                className={`py-0.5 rounded text-[9.5px] font-mono transition ${
                  settings.gradient.opacity === item.val
                    ? 'bg-cyan-400 text-dark-950 font-bold'
                    : 'bg-dark-950 hover:bg-dark-800 text-slate-400 border border-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Blur / Softness */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-medium">2. Blur Softness (স্মুথ ব্লার)</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-cyan-400 font-bold">
                {settings.blur.enabled ? `${settings.blur.radius}px` : 'OFF'}
              </span>
              <button
                onClick={() => onUpdateSettings('blur', { enabled: !settings.blur.enabled, radius: settings.blur.radius || 30 })}
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  settings.blur.enabled ? 'bg-cyan-400 text-dark-950' : 'bg-dark-800 text-slate-400'
                }`}
              >
                {settings.blur.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={settings.blur.enabled ? settings.blur.radius : 0}
            onChange={e => onUpdateSettings('blur', { radius: Number(e.target.value), enabled: true })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5"
          />
          <div className="grid grid-cols-4 gap-1 pt-0.5">
            {[
              { label: 'Off', val: 0, enabled: false },
              { label: 'Soft', val: 15, enabled: true },
              { label: 'Medium', val: 32, enabled: true },
              { label: 'Heavy', val: 50, enabled: true },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => onUpdateSettings('blur', { radius: item.val, enabled: item.enabled })}
                className="py-0.5 rounded text-[9.5px] font-mono bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5 transition"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Texture Grain */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-medium">3. Film Grain (ফিল্ম গ্রেইন)</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-cyan-400 font-bold">
                {settings.noise.enabled ? `${settings.noise.amount}%` : 'OFF'}
              </span>
              <button
                onClick={() => onUpdateSettings('noise', { enabled: !settings.noise.enabled, amount: settings.noise.amount || 15 })}
                className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                  settings.noise.enabled ? 'bg-cyan-400 text-dark-950' : 'bg-dark-800 text-slate-400'
                }`}
              >
                {settings.noise.enabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            value={settings.noise.enabled ? settings.noise.amount : 0}
            onChange={e => onUpdateSettings('noise', { amount: Number(e.target.value), enabled: true })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5"
          />
          <div className="grid grid-cols-4 gap-1 pt-0.5">
            {[
              { label: 'None', val: 0, enabled: false },
              { label: 'Subtle 8%', val: 8, enabled: true },
              { label: 'Film 18%', val: 18, enabled: true },
              { label: 'Heavy 35%', val: 35, enabled: true },
            ].map(item => (
              <button
                key={item.label}
                onClick={() => onUpdateSettings('noise', { amount: item.val, enabled: item.enabled })}
                className="py-0.5 rounded text-[9.5px] font-mono bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5 transition"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. 3D Depth Engine (থ্রিডি ডেপথ) */}
        <div className="space-y-1.5 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-medium flex items-center gap-1">
              <Box className="w-3.5 h-3.5 text-cyan-400" />
              <span>4. 3D Depth Engine (থ্রিডি ডেপথ)</span>
            </span>
            <button
              onClick={() => onUpdateSettings('patterns', { is3D: !settings.patterns.is3D, enabled: true })}
              className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition flex items-center gap-1 ${
                settings.patterns.is3D
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-dark-950 shadow'
                  : 'bg-dark-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{settings.patterns.is3D ? '🧊 3D Active' : 'Enable 3D'}</span>
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="40"
            value={settings.patterns.depth3D ?? 18}
            onChange={e => onUpdateSettings('patterns', { depth3D: Number(e.target.value), is3D: true, enabled: true })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5"
          />

          <div className="grid grid-cols-4 gap-1">
            {[
              { label: '5px Flat', val: 5 },
              { label: '15px Mid', val: 15 },
              { label: '25px Deep', val: 25 },
              { label: '40px Ultra', val: 40 },
            ].map(d => (
              <button
                key={d.val}
                onClick={() => onUpdateSettings('patterns', { depth3D: d.val, is3D: true, enabled: true })}
                className={`py-0.5 rounded text-[9.5px] font-mono transition ${
                  (settings.patterns.depth3D ?? 18) === d.val
                    ? 'bg-cyan-400 text-dark-950 font-bold'
                    : 'bg-dark-950 hover:bg-dark-800 text-slate-400 border border-white/5'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* 1-Click 3D Shading Mode Selector */}
          <div className="grid grid-cols-3 gap-1 pt-1">
            {[
              { id: 'extrude', label: 'Extrude' },
              { id: 'isometric', label: 'Isometric' },
              { id: 'perspective', label: 'Horizon' },
              { id: 'wireframe', label: 'Wireframe' },
              { id: 'emboss', label: 'Bas-Relief' },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => onUpdateSettings('patterns', { shading3D: mode.id as any, is3D: true, enabled: true })}
                className={`py-1 rounded text-[9.5px] font-bold transition text-center ${
                  (settings.patterns.shading3D ?? 'extrude') === mode.id
                    ? 'bg-cyan-400 text-dark-950 shadow-sm'
                    : 'bg-dark-950 hover:bg-dark-800 text-slate-400 border border-white/5'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* 5. Pattern Overlay (প্যাটার্ন যোগ করুন) */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-medium flex items-center gap-1">
              <Grid className="w-3.5 h-3.5 text-cyan-400" />
              <span>5. Pattern Overlay (প্যাটার্ন)</span>
            </span>
            <button
              onClick={() => onUpdateSettings('patterns', { enabled: !settings.patterns.enabled, type: settings.patterns.type === 'none' ? 'pat_geo_001' : settings.patterns.type })}
              className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition ${
                settings.patterns.enabled && settings.patterns.type !== 'none'
                  ? 'bg-cyan-400 text-dark-950 shadow'
                  : 'bg-dark-800 text-slate-400'
              }`}
            >
              {settings.patterns.enabled && settings.patterns.type !== 'none' ? 'Active' : 'Off'}
            </button>
          </div>

          {/* 6 Quick Patterns */}
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            {[
              { id: 'pat_geo_001', label: '⊞ Grid' },
              { id: 'pat_jap_001', label: '≈ Waves' },
              { id: 'pat_tec_001', label: '⚡ Circuit' },
              { id: 'pat_sac_001', label: '🔯 Sacred' },
              { id: 'pat_geo_004', label: '⬡ Hexagon' },
              { id: 'pat_cel_001', label: '★ Stars' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => onUpdateSettings('patterns', { type: p.id, enabled: true })}
                className={`py-1 rounded text-center transition font-medium ${
                  settings.patterns.type === p.id && settings.patterns.enabled
                    ? 'bg-cyan-400 text-dark-950 font-bold'
                    : 'bg-dark-950 hover:bg-dark-800 text-slate-400 border border-white/5'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Big Browse 500+ Patterns Button */}
          <button
            onClick={onOpenPatternModal}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/15 via-purple-500/15 to-teal-500/15 hover:from-cyan-500/25 hover:to-teal-500/25 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-between transition shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate">Active: {activePatternName}</span>
            </div>
            <span className="px-2 py-0.5 rounded text-[9.5px] font-mono bg-cyan-400 text-dark-950 font-bold shrink-0">
              Browse 500+ 3D
            </span>
          </button>

          {/* Full Pattern Customizer Drawer */}
          {settings.patterns.enabled && settings.patterns.type !== 'none' && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              {/* Header: Title & Sub-tabs */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowPatternCustomizer(prev => !prev)}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-white hover:text-cyan-300 transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Pattern Customizer (সম্পূর্ণ কন্ট্রোল)</span>
                  {showPatternCustomizer ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                {onOpenProPatternStudio && (
                  <button
                    onClick={onOpenProPatternStudio}
                    className="text-[9.5px] text-cyan-400 hover:text-cyan-300 transition flex items-center gap-0.5 font-medium"
                    title="Open Full Advanced Pattern Studio"
                  >
                    <span>Pro Studio</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              {showPatternCustomizer && (
                <div className="space-y-2.5 p-2.5 rounded-xl bg-dark-950 border border-white/5 shadow-inner">
                  {/* Sub-tab pills: Size & Angle | Color | Line & Glow | 3D Space */}
                  <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-dark-900 border border-white/5 text-[9.5px] font-semibold text-center">
                    {[
                      { id: 'transform', label: 'Size/Angle' },
                      { id: 'colors', label: 'Colors' },
                      { id: 'stroke', label: 'Line/Glow' },
                      { id: '3d', label: '3D Depth' },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setPatternTab(tab.id as any)}
                        className={`py-1 rounded transition ${
                          patternTab === tab.id
                            ? 'bg-cyan-400 text-dark-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* TAB 1: SIZE & ANGLE (Scale, Rotation, Position Shift) */}
                  {patternTab === 'transform' && (
                    <div className="space-y-2 text-[10px]">
                      {/* Scale */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-slate-300">
                          <span>Pattern Scale (সাইজ)</span>
                          <span className="font-mono text-cyan-400 font-bold">{settings.patterns.scale}%</span>
                        </div>
                        <input
                          type="range"
                          min="15"
                          max="150"
                          value={settings.patterns.scale}
                          onChange={e => onUpdateSettings('patterns', { scale: Number(e.target.value) })}
                          className="w-full accent-cyan-400 cursor-pointer h-1.5"
                        />
                        <div className="grid grid-cols-5 gap-1 pt-0.5">
                          {[25, 50, 75, 100, 125].map(sc => (
                            <button
                              key={sc}
                              onClick={() => onUpdateSettings('patterns', { scale: sc })}
                              className={`py-0.5 rounded text-[9px] font-mono transition ${
                                settings.patterns.scale === sc
                                  ? 'bg-cyan-400 text-dark-950 font-bold'
                                  : 'bg-dark-900 hover:bg-dark-850 text-slate-400 border border-white/5'
                              }`}
                            >
                              {sc}%
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Rotation */}
                      <div className="space-y-0.5 pt-1.5 border-t border-white/5">
                        <div className="flex justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <Compass className="w-3 h-3 text-cyan-400" />
                            <span>Rotation (ঘূর্ণন কোণ)</span>
                          </span>
                          <span className="font-mono text-cyan-400 font-bold">{settings.patterns.rotation ?? 0}°</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={settings.patterns.rotation ?? 0}
                          onChange={e => onUpdateSettings('patterns', { rotation: Number(e.target.value) })}
                          className="w-full accent-cyan-400 cursor-pointer h-1.5"
                        />
                        <div className="grid grid-cols-5 gap-1 pt-0.5">
                          {[0, 45, 90, 180, 270].map(deg => (
                            <button
                              key={deg}
                              onClick={() => onUpdateSettings('patterns', { rotation: deg })}
                              className={`py-0.5 rounded text-[9px] font-mono transition ${
                                (settings.patterns.rotation ?? 0) === deg
                                  ? 'bg-cyan-400 text-dark-950 font-bold'
                                  : 'bg-dark-900 hover:bg-dark-850 text-slate-400 border border-white/5'
                              }`}
                            >
                              {deg}°
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* X & Y Shift */}
                      <div className="space-y-0.5 pt-1.5 border-t border-white/5">
                        <div className="flex items-center justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <Move className="w-3 h-3 text-cyan-400" />
                            <span>Position Shift (পজিশন)</span>
                          </span>
                          {((settings.patterns.offsetX ?? 0) !== 0 || (settings.patterns.offsetY ?? 0) !== 0) && (
                            <button
                              onClick={() => onUpdateSettings('patterns', { offsetX: 0, offsetY: 0 })}
                              className="text-[9px] text-cyan-400 hover:underline"
                            >
                              Reset (0,0)
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>X: {settings.patterns.offsetX ?? 0}px</span>
                            </div>
                            <input
                              type="range"
                              min="-80"
                              max="80"
                              value={settings.patterns.offsetX ?? 0}
                              onChange={e => onUpdateSettings('patterns', { offsetX: Number(e.target.value) })}
                              className="w-full accent-cyan-400 h-1.5"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span>Y: {settings.patterns.offsetY ?? 0}px</span>
                            </div>
                            <input
                              type="range"
                              min="-80"
                              max="80"
                              value={settings.patterns.offsetY ?? 0}
                              onChange={e => onUpdateSettings('patterns', { offsetY: Number(e.target.value) })}
                              className="w-full accent-cyan-400 h-1.5"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: COLORS & BACKGROUND (Stroke Color, Background Fill, Blend Mode) */}
                  {patternTab === 'colors' && (
                    <div className="space-y-2 text-[10px]">
                      {/* Stroke Color */}
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-dark-900 border border-white/5">
                        <span className="text-slate-300 font-medium">Stroke Color (রঙ):</span>
                        <label className="cursor-pointer flex items-center gap-1.5" title="Pick stroke color">
                          <span className="font-mono text-cyan-300 uppercase">{settings.patterns.color}</span>
                          <div
                            className="w-4 h-4 rounded border border-white/20 shadow-sm"
                            style={{ backgroundColor: settings.patterns.color }}
                          />
                          <input
                            type="color"
                            value={settings.patterns.color}
                            onChange={e => onUpdateSettings('patterns', { color: e.target.value })}
                            className="sr-only"
                          />
                        </label>
                      </div>

                      {/* Quick Color Swatches */}
                      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                        {['#00f0ff', '#ff007f', '#ffd700', '#10b981', '#c084fc', '#ff7a00', '#ffffff'].map(c => (
                          <button
                            key={c}
                            onClick={() => onUpdateSettings('patterns', { color: c })}
                            className="w-5 h-5 rounded-full border border-white/20 shrink-0 transition active:scale-95 shadow-sm"
                            style={{ backgroundColor: c }}
                            title={`Select ${c}`}
                          />
                        ))}
                      </div>

                      {/* Background Tile Fill */}
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-dark-900 border border-white/5">
                        <span className="text-slate-300 font-medium">Background Fill:</span>
                        <div className="flex items-center gap-1.5">
                          {settings.patterns.backgroundColor && settings.patterns.backgroundColor !== 'transparent' ? (
                            <label className="cursor-pointer flex items-center gap-1">
                              <span className="font-mono text-cyan-300 uppercase">{settings.patterns.backgroundColor}</span>
                              <div
                                className="w-4 h-4 rounded border border-white/20 shadow-sm"
                                style={{ backgroundColor: settings.patterns.backgroundColor }}
                              />
                              <input
                                type="color"
                                value={settings.patterns.backgroundColor}
                                onChange={e => onUpdateSettings('patterns', { backgroundColor: e.target.value })}
                                className="sr-only"
                              />
                            </label>
                          ) : (
                            <button
                              onClick={() => onUpdateSettings('patterns', { backgroundColor: '#090d16' })}
                              className="text-[9.5px] text-cyan-400 hover:underline font-medium"
                            >
                              Transparent (Add Fill)
                            </button>
                          )}
                          {settings.patterns.backgroundColor && settings.patterns.backgroundColor !== 'transparent' && (
                            <button
                              onClick={() => onUpdateSettings('patterns', { backgroundColor: 'transparent' })}
                              className="text-[9px] text-rose-400 hover:text-rose-300"
                              title="Remove background"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Pattern Opacity */}
                      <div className="space-y-0.5 pt-1 border-t border-white/5">
                        <div className="flex justify-between text-slate-400">
                          <span>Pattern Opacity</span>
                          <span className="font-mono text-cyan-400">{settings.patterns.opacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={settings.patterns.opacity}
                          onChange={e => onUpdateSettings('patterns', { opacity: Number(e.target.value) })}
                          className="w-full accent-cyan-400 h-1.5"
                        />
                      </div>

                      {/* Blend Mode */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <span className="text-slate-400">Blend Mode:</span>
                        <select
                          value={settings.patterns.blendMode || 'screen'}
                          onChange={e => onUpdateSettings('patterns', { blendMode: e.target.value as any })}
                          className="bg-dark-900 border border-white/10 text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
                        >
                          <option value="screen">Screen (Light Glow)</option>
                          <option value="overlay">Overlay (Rich Contrast)</option>
                          <option value="normal">Normal (Solid)</option>
                          <option value="color-dodge">Color Dodge (Intense)</option>
                          <option value="soft-light">Soft Light (Subtle)</option>
                          <option value="multiply">Multiply (Darken)</option>
                          <option value="difference">Difference (Invert)</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: STROKE & GLOW (Line Thickness, Neon Glow Aura) */}
                  {patternTab === 'stroke' && (
                    <div className="space-y-2 text-[10px]">
                      {/* Line Thickness */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-slate-300">
                          <span>Line Thickness / Stroke (পুরুত্ব)</span>
                          <span className="font-mono text-cyan-400 font-bold">{settings.patterns.strokeWidth ?? 1.5}px</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="6"
                          step="0.5"
                          value={settings.patterns.strokeWidth ?? 1.5}
                          onChange={e => onUpdateSettings('patterns', { strokeWidth: Number(e.target.value) })}
                          className="w-full accent-cyan-400 h-1.5"
                        />
                        <div className="grid grid-cols-4 gap-1 pt-0.5">
                          {[
                            { label: '0.5px Fine', val: 0.5 },
                            { label: '1.0px Mid', val: 1.0 },
                            { label: '2.0px Thick', val: 2.0 },
                            { label: '4.0px Bold', val: 4.0 },
                          ].map(st => (
                            <button
                              key={st.val}
                              onClick={() => onUpdateSettings('patterns', { strokeWidth: st.val })}
                              className={`py-0.5 rounded text-[9px] font-mono transition ${
                                (settings.patterns.strokeWidth ?? 1.5) === st.val
                                  ? 'bg-cyan-400 text-dark-950 font-bold'
                                  : 'bg-dark-900 hover:bg-dark-850 text-slate-400 border border-white/5'
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Neon Glow Aura */}
                      <div className="space-y-0.5 pt-1.5 border-t border-white/5">
                        <div className="flex justify-between text-slate-300">
                          <span className="flex items-center gap-1">
                            <Sun className="w-3 h-3 text-cyan-400" />
                            <span>Neon Glow Aura (নিয়ন গ্লো)</span>
                          </span>
                          <span className="font-mono text-cyan-400 font-bold">{settings.patterns.glow ?? 0}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          value={settings.patterns.glow ?? 0}
                          onChange={e => onUpdateSettings('patterns', { glow: Number(e.target.value) })}
                          className="w-full accent-cyan-400 h-1.5"
                        />
                      </div>
                    </div>
                  )}

                  {/* TAB 4: 3D SPACE (Extrusion, Shading, Pitch/Yaw) */}
                  {patternTab === '3d' && (
                    <div className="space-y-2 text-[10px]">
                      {/* 3D Master Switch */}
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-dark-900 border border-white/5">
                        <span className="font-medium text-slate-200 flex items-center gap-1">
                          <Box className="w-3 h-3 text-cyan-400" />
                          <span>3D Volumetric Extrusion</span>
                        </span>
                        <button
                          onClick={() => onUpdateSettings('patterns', { is3D: !settings.patterns.is3D })}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold transition ${
                            settings.patterns.is3D
                              ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-dark-950 shadow'
                              : 'bg-dark-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {settings.patterns.is3D ? '3D Active' : 'Enable 3D'}
                        </button>
                      </div>

                      {/* 5 Shading Modes */}
                      <div className="grid grid-cols-3 gap-1">
                        {[
                          { id: 'extrude', label: 'Extrude' },
                          { id: 'isometric', label: 'Isometric' },
                          { id: 'perspective', label: 'Horizon' },
                          { id: 'wireframe', label: 'Wireframe' },
                          { id: 'emboss', label: 'Bas-Relief' },
                        ].map(m => (
                          <button
                            key={m.id}
                            onClick={() => onUpdateSettings('patterns', { shading3D: m.id as any, is3D: true })}
                            className={`py-1 rounded text-[9px] font-bold transition text-center ${
                              (settings.patterns.shading3D ?? 'extrude') === m.id
                                ? 'bg-cyan-400 text-dark-950 shadow-sm'
                                : 'bg-dark-900 hover:bg-dark-850 text-slate-400 border border-white/5'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>

                      {/* Extrusion Depth */}
                      <div className="space-y-0.5 pt-1 border-t border-white/5">
                        <div className="flex justify-between text-slate-300">
                          <span>3D Extrusion Depth (গভীরতা)</span>
                          <span className="font-mono text-cyan-400 font-bold">{settings.patterns.depth3D ?? 18}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="40"
                          value={settings.patterns.depth3D ?? 18}
                          onChange={e => onUpdateSettings('patterns', { depth3D: Number(e.target.value), is3D: true })}
                          className="w-full accent-cyan-400 h-1.5"
                        />
                      </div>

                      {/* Tilt Pitch / Yaw */}
                      <div className="space-y-0.5 pt-1 border-t border-white/5">
                        <div className="flex justify-between text-slate-300">
                          <span>3D Tilt Angle (Pitch / Yaw)</span>
                          <span className="font-mono text-cyan-400">{settings.patterns.pitch3D ?? 25}°, {settings.patterns.yaw3D ?? 0}°</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1">
                          {[
                            { label: 'Isometric', p: 30, y: 0 },
                            { label: 'Horizon', p: 48, y: 0 },
                            { label: 'Cyber Yaw', p: 25, y: 20 },
                            { label: 'Top View', p: 10, y: 0 },
                          ].map(ang => (
                            <button
                              key={ang.label}
                              onClick={() => onUpdateSettings('patterns', { pitch3D: ang.p, yaw3D: ang.y, is3D: true })}
                              className="py-0.5 rounded text-[8.5px] font-mono bg-dark-900 hover:bg-dark-850 text-slate-400 hover:text-cyan-300 border border-white/5 transition"
                            >
                              {ang.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 5. Reset / Clear helper button */}
      <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
        <span>Need a clean start?</span>
        {onReset && (
          <button
            onClick={onReset}
            className="text-rose-400 hover:text-rose-300 font-medium transition flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to Default</span>
          </button>
        )}
      </div>
    </div>
  );
};
