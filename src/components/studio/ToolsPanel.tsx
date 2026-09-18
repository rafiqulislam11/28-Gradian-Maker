import React, { useRef, useState } from 'react';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  RefreshCw,
  Zap,
  Layers,
  Download,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sliders,
  Palette,
  Sun,
  Disc,
  Grid,
  Maximize2,
  Box,
  RotateCcw,
  Dices,
  Wand2,
  Image as ImageIcon,
  Flame,
} from 'lucide-react';
import { FilterSettings, BlurCategory, NoiseType, ImageItem, Preset, ExportFormat } from '../../types/studio';
import { CREATIVE_PRESETS } from '../../engine/presets';
import { GradientStudioPanel } from './GradientStudioPanel';
import { PatternStudioPanel } from './PatternStudioPanel';
import { EasyStudioPanel } from './EasyStudioPanel';
import { AutoImageToGradient } from './AutoImageToGradient';
import { FractalGlassStudio } from './FractalGlassStudio';
import { GradientMakerStudio } from './GradientMakerStudio';
import { UpscaleTab } from '../sidebar/UpscaleTab';
import { GrainNoiseTab } from '../sidebar/GrainNoiseTab';
import { useThemeAndLanguage } from '../../context/ThemeLanguageContext';

export type MainStudioTab =
  | 'gradient'
  | 'fractalGlass'
  | 'upscale'
  | 'filmGrain'
  | 'blur'
  | 'patterns'
  | 'presets';

export type GradientSubMode = 'auto' | 'maker' | 'pro';

interface ToolsPanelProps {
  settings: FilterSettings;
  onUpdateSettings: <K extends keyof FilterSettings>(category: K, values: Partial<FilterSettings[K]>) => void;
  onApplySingle: () => void;
  onStartBatch: () => void;
  onExportZip: () => void;
  images: ImageItem[];
  selectedImage: ImageItem | null;
  onSelectImage: (id: string) => void;
  onUploadImages: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onClearAllImages: () => void;
  isProcessingBatch?: boolean;
  isExportingZip?: boolean;
  onViewBatchQueue: () => void;
  onOpenPatternModal: () => void;
  onOpen3DStudio?: () => void;
  onOpenVictorStudio?: () => void;
  onSelectPreset?: (preset: Preset) => void;
  onRandomize?: () => void;
  onReset?: () => void;
  onLoadSampleImage?: () => void;
}

export const ToolsPanel: React.FC<ToolsPanelProps> = ({
  settings,
  onUpdateSettings,
  onApplySingle,
  onStartBatch,
  onExportZip,
  images,
  selectedImage,
  onSelectImage,
  onUploadImages,
  onRemoveImage,
  onClearAllImages,
  isProcessingBatch = false,
  isExportingZip = false,
  onViewBatchQueue,
  onOpenPatternModal,
  onOpen3DStudio,
  onOpenVictorStudio,
  onSelectPreset,
  onRandomize,
  onReset,
  onLoadSampleImage,
}) => {
  const { t, language } = useThemeAndLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [panelMode, setPanelMode] = useState<'pro' | 'easy'>('pro');
  const [activeTab, setActiveTab] = useState<MainStudioTab>('gradient');
  const [gradientSubMode, setGradientSubMode] = useState<GradientSubMode>('auto');
  const [processedStatus, setProcessedStatus] = useState<string | null>(null);

  const currentIndex = images.findIndex(it => it.id === selectedImage?.id);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const completedCount = images.filter(it => it.status === 'completed').length;

  const handleFileChange = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const valid: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        valid.push(files[i]);
      }
    }
    if (valid.length > 0) {
      onUploadImages(valid);
    }
  };

  const handleProcessSingleClick = () => {
    onApplySingle();
    setProcessedStatus('Applied Live (48ms)');
    setTimeout(() => {
      setProcessedStatus(null);
    }, 2200);
  };

  const handlePrevImage = () => {
    if (images.length <= 1) return;
    const prevIdx = (activeIndex - 1 + images.length) % images.length;
    onSelectImage(images[prevIdx].id);
  };

  const handleNextImage = () => {
    if (images.length <= 1) return;
    const nextIdx = (activeIndex + 1) % images.length;
    onSelectImage(images[nextIdx].id);
  };

  // Main Studio Navigation Tabs List
  const studioTabs: {
    id: MainStudioTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    isActive: boolean;
    color: string;
  }[] = [
    {
      id: 'gradient',
      label: t('tab_gradient', 'Gradient'),
      icon: Palette,
      badge: 'Auto/1-4',
      isActive: settings.gradient?.enabled || settings.gradientMaker?.enabled,
      color: 'from-cyan-400 to-teal-400',
    },
    {
      id: 'fractalGlass',
      label: t('tab_fractal_glass', 'Fractal Glass'),
      icon: Sun,
      badge: '1-3.3',
      isActive: settings.fractalGlass?.enabled,
      color: 'from-blue-400 to-indigo-500',
    },
    {
      id: 'upscale',
      label: t('tab_upscale', 'Upscale'),
      icon: Maximize2,
      badge: settings.upscale?.factor > 1 ? `${settings.upscale.factor}x` : '2K-8K',
      isActive: settings.upscale?.factor > 1,
      color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'filmGrain',
      label: t('tab_film_grain', 'Film Grain'),
      icon: Disc,
      badge: '35mm',
      isActive: settings.noise?.enabled && settings.noise.amount > 0,
      color: 'from-emerald-400 to-teal-500',
    },
    {
      id: 'blur',
      label: t('tab_blur', 'Blur Optics'),
      icon: Sparkles,
      badge: settings.blur?.enabled ? `${settings.blur.radius}px` : undefined,
      isActive: settings.blur?.enabled && settings.blur.radius > 0,
      color: 'from-fuchsia-400 to-purple-500',
    },
    {
      id: 'patterns',
      label: t('tab_patterns', 'Patterns & 3D'),
      icon: Grid,
      badge: '500+',
      isActive: settings.patterns?.enabled && settings.patterns.type !== 'none',
      color: 'from-violet-400 to-pink-500',
    },
    {
      id: 'presets',
      label: t('tab_presets', 'Presets'),
      icon: Flame,
      badge: 'Styles',
      isActive: false,
      color: 'from-rose-400 to-amber-500',
    },
  ];

  return (
    <div className="w-full lg:w-[365px] xl:w-[395px] shrink-0 flex flex-col h-full overflow-hidden select-none">
      {/* Main Glass Studio Card Container */}
      <div className="flex-1 flex flex-col rounded-2xl bg-[#0d111c]/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden min-h-0">
        
        {/* ======================================================== */}
        {/* 1. TOP HEADER: BRANDING + UTILITY BUTTONS + MODE TOGGLE  */}
        {/* ======================================================== */}
        <div className="p-3 pb-2.5 border-b border-white/10 bg-gradient-to-r from-dark-950/90 via-[#0f1424]/90 to-dark-950/90 backdrop-blur-md shrink-0 space-y-2.5">
          <div className="flex items-center justify-between">
            {/* Logo and Status */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-500 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
                <Sliders className="w-4 h-4 text-white drop-shadow" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-black text-white tracking-wide uppercase">{t('tools_header', 'Tool Panels')}</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-glow-emerald" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {images.length > 0 ? `${images.length} Image${images.length > 1 ? 's' : ''} ${t('status_in_studio', 'in Studio')}` : t('status_active', 'GPU Canvas Active')}
                </span>
              </div>
            </div>

            {/* Right cluster: Reset, Randomize, and Mode Toggle */}
            <div className="flex items-center gap-1.5">
              {onReset && (
                <button
                  onClick={onReset}
                  className="p-1.5 rounded-lg bg-dark-900/80 hover:bg-dark-800 text-slate-400 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 transition active:scale-95"
                  title={t('reset_tooltip', 'Reset all settings to default')}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}

              {onRandomize && (
                <button
                  onClick={onRandomize}
                  className="p-1.5 rounded-lg bg-dark-900/80 hover:bg-dark-800 text-slate-400 hover:text-amber-300 border border-white/5 hover:border-amber-500/30 transition active:scale-95"
                  title={t('randomize_tooltip', 'Surprise randomize creative styles')}
                >
                  <Dices className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Mode Switcher: Pro vs Easy */}
              <div className="flex items-center p-0.5 rounded-xl bg-dark-900 border border-white/10 shadow-inner">
                <button
                  onClick={() => setPanelMode('pro')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    panelMode === 'pro'
                      ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-dark-950 shadow-md shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Pro Mode: Detailed granular controls"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{t('mode_pro', 'Pro')}</span>
                </button>
                <button
                  onClick={() => setPanelMode('easy')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                    panelMode === 'easy'
                      ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white shadow-md shadow-purple-500/20 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Easy Mode: 1-Click Simple Controls"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{t('mode_easy', 'সহজ')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* QUICK PRO NAVIGATION PILLS BAR (Visible in Pro Mode) */}
          {panelMode === 'pro' && (
            <div className="flex items-center gap-1 overflow-x-auto pb-1 pt-0.5 scrollbar-none text-[11px]">
              {studioTabs.map(tab => {
                const Icon = tab.icon;
                const isCurrent = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      // Auto-enable engine if switching into it
                      if (tab.id === 'fractalGlass' && !settings.fractalGlass?.enabled) {
                        onUpdateSettings('fractalGlass', { enabled: true });
                      }
                      if (tab.id === 'gradient' && !settings.gradientMaker?.enabled && !settings.gradient?.enabled) {
                        onUpdateSettings('gradientMaker', { enabled: true });
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded-xl font-bold transition-all duration-150 flex items-center gap-1.5 shrink-0 relative ${
                      isCurrent
                        ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-dark-950 shadow-md shadow-cyan-500/25 scale-[1.02]'
                        : 'text-slate-400 hover:text-slate-200 bg-dark-900/80 hover:bg-dark-900 border border-white/5 hover:border-white/15'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-dark-950' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>

                    {tab.isActive && !isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
                    )}

                    {tab.badge && (
                      <span
                        className={`px-1 py-0.2 rounded text-[9px] font-mono font-black ${
                          isCurrent
                            ? 'bg-dark-950/80 text-cyan-300'
                            : 'bg-white/10 text-slate-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Hidden Multi-File Input */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={e => {
            handleFileChange(e.target.files);
            e.target.value = '';
          }}
        />

        {/* ======================================================== */}
        {/* 2. SCROLLABLE MIDDLE WORKSPACE                           */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 scrollbar-thin min-h-0">

          {/* ACTIVE IMAGE STATUS STRIP & UPLOAD CAPSULE */}
          <div className="p-3 rounded-2xl bg-gradient-to-b from-[#131828] to-[#0d121f] border border-white/10 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-white tracking-wide">
                  {images.length > 0 ? `Active Photo (#${activeIndex + 1}/${images.length})` : 'Source Photo'}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {images.length > 0 && (
                  <button
                    onClick={onClearAllImages}
                    className="text-[10px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1 hover:underline"
                    title="Clear all workspace photos"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}
              </div>
            </div>

            {images.length === 0 ? (
              /* No Image Uploaded State */
              <div className="p-3.5 rounded-xl border border-dashed border-cyan-500/30 bg-cyan-950/10 hover:bg-cyan-950/20 transition flex flex-col items-center justify-center text-center gap-2 group">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">
                    ইমেজ আপলোড করুন (Upload Photo)
                  </p>
                  <p className="text-[10px] text-slate-400">
                    PNG, JPG, WebP supported • Direct Live Blend
                  </p>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-dark-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition active:scale-95"
                  >
                    Select Images
                  </button>
                  {onLoadSampleImage && (
                    <button
                      onClick={onLoadSampleImage}
                      className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-white/10 text-xs transition active:scale-95"
                    >
                      Sample Photo
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* Active Image Loaded Capsule */
              <div className="flex items-center justify-between p-2 rounded-xl bg-dark-950/80 border border-white/10">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <img
                    src={selectedImage?.processedUrl || selectedImage?.thumbnailUrl || selectedImage?.originalUrl}
                    alt="Active"
                    className="w-10 h-10 rounded-lg object-cover border border-cyan-400/40 shrink-0 bg-dark-900 shadow-md shadow-cyan-500/10"
                  />
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-white truncate block" title={selectedImage?.name}>
                      {selectedImage?.name || 'Image'}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                      <span>{selectedImage?.width || 1920}×{selectedImage?.height || 1080}</span>
                      <span>•</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {selectedImage?.status === 'completed' ? 'Rendered' : 'Ready'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {images.length > 1 && (
                    <div className="flex items-center gap-1 mr-1 bg-dark-900 px-1 py-0.5 rounded-lg border border-white/5">
                      <button
                        onClick={handlePrevImage}
                        className="p-1 rounded hover:bg-dark-800 text-slate-300 hover:text-white transition"
                        title="Previous Image"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[10px] text-slate-400 px-0.5">
                        <strong className="text-cyan-400">{activeIndex + 1}</strong>/{images.length}
                      </span>
                      <button
                        onClick={handleNextImage}
                        className="p-1 rounded hover:bg-dark-800 text-slate-300 hover:text-white transition"
                        title="Next Image"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition active:scale-95"
                    title="Upload more images"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* QUICK BANNER: DIRECT JUMP TO VICTOR STUDIO */}
          {onOpenVictorStudio && (
            <button
              onClick={onOpenVictorStudio}
              className="w-full p-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-teal-500/10 to-indigo-500/15 hover:from-cyan-500/25 hover:to-indigo-500/25 border border-cyan-400/30 text-cyan-300 font-bold text-xs flex items-center justify-between transition shadow-md active:scale-98 group"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <span className="block text-white font-bold group-hover:text-cyan-300 transition">
                    Victor Studio (ভেক্টর ও আইকন)
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Image to Vector, Icon Sheets 1/2/3, White Remover, ZIP
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-cyan-400 text-dark-950 font-mono font-black text-[10px] shadow-sm">
                SVG →
              </span>
            </button>
          )}

          {/* ======================================================== */}
          {/* TAB CONTENT PANELS                                       */}
          {/* ======================================================== */}

          {panelMode === 'easy' ? (
            /* EASY MODE (সহজ ১-ক্লিক মোড) */
            <EasyStudioPanel
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              onOpenPatternModal={onOpenPatternModal}
              onOpen3DStudio={onOpen3DStudio}
              onOpenProPatternStudio={() => {
                setPanelMode('pro');
                setActiveTab('patterns');
              }}
              selectedImage={selectedImage}
              onRandomize={onRandomize}
              onReset={onReset}
              onUploadImages={onUploadImages}
              onLoadSampleImage={onLoadSampleImage}
            />
          ) : (
            /* PRO STUDIO MODE */
            <div className="space-y-3">
              {/* ---------------------------------------------------- */}
              {/* TAB 1: GRADIENT SUITE (Auto / Maker 1-4 / Pro Layer) */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'gradient' && (
                <div className="space-y-3">
                  {/* Sub-Switch: Auto Img-to-Grad vs Grad Maker (1-4) vs Pro Gradient */}
                  <div className="p-1 rounded-xl bg-dark-950 border border-white/10 flex items-center gap-1">
                    <button
                      onClick={() => setGradientSubMode('auto')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition text-center truncate ${
                        gradientSubMode === 'auto'
                          ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-dark-950 shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🌈 Auto Img-Grad</span>
                    </button>
                    <button
                      onClick={() => {
                        setGradientSubMode('maker');
                        if (!settings.gradientMaker?.enabled) {
                          onUpdateSettings('gradientMaker', { enabled: true });
                        }
                      }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition text-center truncate ${
                        gradientSubMode === 'maker'
                          ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-dark-950 shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🎨 Maker (1-4)</span>
                    </button>
                    <button
                      onClick={() => setGradientSubMode('pro')}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition text-center truncate ${
                        gradientSubMode === 'pro'
                          ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-dark-950 shadow-md shadow-cyan-500/20'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>🎛️ Pro Layers</span>
                    </button>
                  </div>

                  {/* Render Gradient Sub-View */}
                  {gradientSubMode === 'auto' && (
                    <AutoImageToGradient
                      settings={settings}
                      onUpdateSettings={onUpdateSettings}
                      selectedImage={selectedImage}
                      onUploadImages={onUploadImages}
                      onLoadSampleImage={onLoadSampleImage}
                    />
                  )}

                  {gradientSubMode === 'maker' && (
                    <GradientMakerStudio
                      settings={settings.gradientMaker}
                      onUpdate={vals => onUpdateSettings('gradientMaker', vals)}
                      extractedPalette={selectedImage?.extractedPalette}
                    />
                  )}

                  {gradientSubMode === 'pro' && (
                    <GradientStudioPanel
                      settings={settings.gradient}
                      onUpdateSettings={vals => onUpdateSettings('gradient', vals)}
                      selectedImage={selectedImage}
                    />
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 2: FRACTAL GLASS EFFECT (1, 2, 3, 3.1, 3.2, 3.3) */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'fractalGlass' && (
                <div className="space-y-3">
                  <FractalGlassStudio
                    settings={settings.fractalGlass}
                    onUpdate={vals => onUpdateSettings('fractalGlass', vals)}
                    imageOpacity={settings.image?.opacity ?? 100}
                    onUpdateImageOpacity={op => onUpdateSettings('image', { opacity: op })}
                  />
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 3: UPSCALE 2K TO 8K ULTRA-HD                     */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'upscale' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121826] to-[#0d121f] border border-cyan-500/30 shadow-xl">
                  <UpscaleTab
                    settings={settings.upscale}
                    onUpdate={vals => onUpdateSettings('upscale', vals)}
                  />
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 4: 35MM FILM GRAIN & ANALOG FX                   */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'filmGrain' && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121826] to-[#0d121f] border border-cyan-500/30 shadow-xl">
                  <GrainNoiseTab
                    settings={settings.noise}
                    onUpdate={vals => onUpdateSettings('noise', vals)}
                  />
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 5: BLUR STUDIO OPTICS                            */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'blur' && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-gradient-to-br from-[#121826] to-[#0d121f] border border-white/10 shadow-xl">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white">Blur Studio Optics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-semibold">{settings.blur.radius}px</span>
                      <button
                        onClick={() => onUpdateSettings('blur', { enabled: !settings.blur.enabled })}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition ${
                          settings.blur.enabled
                            ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                            : 'bg-dark-800 text-slate-400'
                        }`}
                      >
                        {settings.blur.enabled ? 'ACTIVE' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Blur Category Selector */}
                  <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                    {[
                      { id: 'mesh', label: 'Gaussian' },
                      { id: 'glass', label: 'Glassmorphism' },
                      { id: 'tiltshift', label: 'Tilt-Shift DoF' },
                      { id: 'radial', label: 'Radial Focal' },
                      { id: 'linear', label: 'Linear Direction' },
                      { id: 'angular', label: 'Angular Lens' },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => onUpdateSettings('blur', { category: cat.id as BlurCategory, enabled: true })}
                        className={`py-1.5 px-1 rounded-xl transition font-bold text-center truncate ${
                          settings.blur.category === cat.id
                            ? 'bg-cyan-400 text-dark-950 shadow-md shadow-cyan-400/20'
                            : 'bg-dark-950 hover:bg-dark-900 text-slate-400 border border-white/5'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Radius Slider */}
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-[11px] text-slate-300">
                      <span>Blur Radius</span>
                      <span className="font-mono text-cyan-400 font-bold">{settings.blur.radius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={settings.blur.radius}
                      onChange={e => onUpdateSettings('blur', { radius: Number(e.target.value), enabled: true })}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-dark-950 rounded-lg"
                    />
                  </div>

                  {/* Category-Specific Fine Optics */}
                  {settings.blur.category === 'glass' && (
                    <div className="space-y-2 pt-2 border-t border-white/10 text-[11px]">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Frosted Sheen</span>
                          <span className="font-mono text-cyan-400">{settings.blur.glassFrost ?? 65}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.blur.glassFrost ?? 65}
                          onChange={e => onUpdateSettings('blur', { glassFrost: Number(e.target.value), enabled: true })}
                          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-dark-950 rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Specular Highlight</span>
                          <span className="font-mono text-cyan-400">{settings.blur.glassSpecular ?? 80}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.blur.glassSpecular ?? 80}
                          onChange={e => onUpdateSettings('blur', { glassSpecular: Number(e.target.value), enabled: true })}
                          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-dark-950 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {settings.blur.category === 'tiltshift' && (
                    <div className="space-y-2 pt-2 border-t border-white/10 text-[11px]">
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Focus Center Position</span>
                          <span className="font-mono text-cyan-400">{settings.blur.tiltPosition ?? 50}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={settings.blur.tiltPosition ?? 50}
                          onChange={e => onUpdateSettings('blur', { tiltPosition: Number(e.target.value), enabled: true })}
                          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-dark-950 rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Focus Band Width</span>
                          <span className="font-mono text-cyan-400">{settings.blur.tiltWidth ?? 35}%</span>
                        </div>
                        <input
                          type="range"
                          min="10"
                          max="100"
                          value={settings.blur.tiltWidth ?? 35}
                          onChange={e => onUpdateSettings('blur', { tiltWidth: Number(e.target.value), enabled: true })}
                          className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-dark-950 rounded-lg"
                        />
                      </div>
                    </div>
                  )}

                  {(settings.blur.category === 'linear' || settings.blur.category === 'angular') && (
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>Direction Angle</span>
                        <span className="font-mono text-cyan-400">{settings.blur.angle ?? 45}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        value={settings.blur.angle ?? 45}
                        onChange={e => onUpdateSettings('blur', { angle: Number(e.target.value), enabled: true })}
                        className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-dark-950 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 6: PATTERNS & 3D STUDIO                          */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'patterns' && (
                <div className="space-y-3">
                  {/* 3D Wood Studio Launcher Banner */}
                  {onOpen3DStudio && (
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-500/30 flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                          <Box className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">3D Wood Studio</span>
                            <span className="px-1 py-0.2 rounded text-[8px] bg-amber-400 text-dark-950 font-black font-mono">
                              Three.js
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 block">Lumber & 3D textures</span>
                        </div>
                      </div>
                      <button
                        onClick={onOpen3DStudio}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-dark-950 font-bold text-xs transition shadow-sm shrink-0 active:scale-95"
                      >
                        Launch 3D
                      </button>
                    </div>
                  )}

                  <PatternStudioPanel
                    settings={settings.patterns}
                    onUpdateSettings={vals => onUpdateSettings('patterns', vals)}
                    onOpenPatternModal={onOpenPatternModal}
                    selectedImage={selectedImage}
                  />
                </div>
              )}

              {/* ---------------------------------------------------- */}
              {/* TAB 7: CREATIVE PRESETS                              */}
              {/* ---------------------------------------------------- */}
              {activeTab === 'presets' && (
                <div className="space-y-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-[#121826] to-[#0d121f] border border-white/10 shadow-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-white">Curated Style Presets</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono">1-Click Apply</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {CREATIVE_PRESETS.slice(0, 10).map(preset => {
                      const stops = preset.settings.gradient?.stops || [
                        { color: '#00f0ff', position: 0 },
                        { color: '#7928ca', position: 100 },
                      ];
                      const gradStyle = `linear-gradient(135deg, ${stops.map(s => s.color).join(', ')})`;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            if (onSelectPreset) {
                              onSelectPreset(preset);
                            } else {
                              onUpdateSettings('gradient', preset.settings.gradient || {});
                              if (preset.settings.blur) onUpdateSettings('blur', preset.settings.blur);
                              if (preset.settings.noise) onUpdateSettings('noise', preset.settings.noise);
                            }
                          }}
                          className="p-2 rounded-xl bg-dark-950/80 hover:bg-dark-900 border border-white/5 hover:border-cyan-400/40 text-left transition flex items-center gap-2 group"
                          title={preset.description}
                        >
                          <div className="w-6 h-6 rounded-lg shrink-0 border border-white/15 shadow" style={{ background: gradStyle }} />
                          <div className="overflow-hidden">
                            <span className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-300 block truncate">
                              {preset.name}
                            </span>
                            <span className="text-[9px] text-slate-400 block truncate font-mono">
                              {preset.badge}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. DOCKED STICKY ACTION FOOTER                           */}
        {/* ======================================================== */}
        <div className="p-3 bg-gradient-to-t from-dark-950 via-[#0d121f] to-dark-950/80 border-t border-white/10 backdrop-blur-md shrink-0 flex flex-col gap-2">
          {images.length > 1 ? (
            <>
              {/* Batch Process All Button */}
              <button
                onClick={onStartBatch}
                disabled={isProcessingBatch}
                className={`w-full py-2.5 px-3 rounded-xl font-black text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                  isProcessingBatch
                    ? 'bg-cyan-500/50 text-dark-950 cursor-wait animate-pulse'
                    : 'bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-dark-950 shadow-cyan-500/25 hover:shadow-cyan-500/50 active:scale-[0.98]'
                }`}
              >
                {isProcessingBatch ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-dark-950" />
                    <span>Processing ({images.length})...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-dark-950 text-dark-950" />
                    <span>{t('process_all', 'Process All Photos')} ({images.length})</span>
                  </>
                )}
              </button>

              {/* Download ZIP if completed */}
              {completedCount > 0 && (
                <button
                  onClick={onExportZip}
                  disabled={isExportingZip}
                  className="w-full py-2 px-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-[0.98]"
                >
                  {isExportingZip ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Bundling ZIP...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>{t('download_zip', 'Download Processed (ZIP)')} ({completedCount})</span>
                    </>
                  )}
                </button>
              )}

              {/* View Batch Queue Link */}
              <button
                onClick={onViewBatchQueue}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 text-center py-0.5 transition flex items-center justify-center gap-1 font-semibold"
              >
                <Layers className="w-3 h-3" />
                <span>{t('open_batch_queue', 'Open Full Batch Queue')} ({images.length}) →</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleProcessSingleClick}
              disabled={isProcessingBatch}
              className={`w-full py-2.5 px-3 rounded-xl font-black text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
                isProcessingBatch
                  ? 'bg-cyan-500/50 text-dark-950 cursor-wait animate-pulse'
                  : 'bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-dark-950 shadow-cyan-500/25 hover:shadow-cyan-500/50 active:scale-[0.98]'
              }`}
            >
              {processedStatus ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-dark-950" />
                  <span>{processedStatus}</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-dark-950 text-dark-950" />
                  <span>{t('apply_live', 'Apply on Image (Live 60 FPS)')}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
