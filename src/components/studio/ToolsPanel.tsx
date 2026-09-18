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
  Eye,
  Sliders,
  Palette,
  Sun,
  Disc,
  Grid,
  Maximize2,
  Box,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Dices,
} from 'lucide-react';
import { FilterSettings, BlurCategory, NoiseType, ImageItem, Preset, ExportFormat } from '../../types/studio';
import { CREATIVE_PRESETS } from '../../engine/presets';
import { GradientStudioPanel } from './GradientStudioPanel';
import { PatternStudioPanel } from './PatternStudioPanel';
import { EasyStudioPanel } from './EasyStudioPanel';

export type ToolFilterTab = 'gradient' | 'blur' | 'noise' | 'patterns' | 'upscale' | 'presets' | 'all';

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
  onSelectPreset?: (preset: Preset) => void;
  onRandomize?: () => void;
  onReset?: () => void;
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
  onSelectPreset,
  onRandomize,
  onReset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [processedStatus, setProcessedStatus] = useState<string | null>(null);
  const [panelMode, setPanelMode] = useState<'easy' | 'pro'>('easy');
  const [activeCategory, setActiveCategory] = useState<ToolFilterTab>('gradient');

  // Accordion state when 'all' is active
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    gradient: true,
    blur: true,
    noise: true,
    patterns: false,
    upscale: false,
    presets: false,
  });

  const toggleSection = (sec: string) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const blurPct = Math.round((settings.blur.radius / 60) * 100);
  const noisePct = settings.noise.amount;

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
    setProcessedStatus('Processing...');
    setTimeout(() => {
      setProcessedStatus('Done (48ms)');
      setTimeout(() => setProcessedStatus(null), 2500);
    }, 500);
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

  // Tool categories metadata with active indicators
  const categories: {
    id: ToolFilterTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    badge?: string;
  }[] = [
    {
      id: 'gradient',
      label: 'Gradient',
      icon: Palette,
      isActive: settings.gradient.enabled,
    },
    {
      id: 'blur',
      label: 'Blur',
      icon: Sun,
      isActive: settings.blur.enabled && settings.blur.radius > 0,
    },
    {
      id: 'noise',
      label: 'Noise',
      icon: Disc,
      isActive: settings.noise.enabled && settings.noise.amount > 0,
    },
    {
      id: 'patterns',
      label: 'Patterns',
      icon: Grid,
      isActive: settings.patterns.enabled && settings.patterns.type !== 'none',
    },
    {
      id: 'upscale',
      label: 'Upscale',
      icon: Maximize2,
      isActive: settings.upscale.factor > 1,
      badge: settings.upscale.factor > 1 ? `${settings.upscale.factor}x` : undefined,
    },
    {
      id: 'presets',
      label: 'Presets',
      icon: Sparkles,
      isActive: false,
    },
    {
      id: 'all',
      label: 'All Tools',
      icon: SlidersHorizontal,
      isActive: false,
    },
  ];

  return (
    <div className="w-full lg:w-[360px] xl:w-[385px] shrink-0 flex flex-col h-full overflow-hidden select-none">
      {/* Main Glass Control Card */}
      <div className="flex-1 flex flex-col rounded-2xl bg-[#121620]/95 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden min-h-0">
        
        {/* ======================================================== */}
        {/* 1. STICKY PANEL HEADER WITH QUICK ACTIONS               */}
        {/* ======================================================== */}
        <div className="p-3 pb-2.5 border-b border-white/10 bg-dark-950/70 backdrop-blur-md shrink-0 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-500 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
                <Sliders className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white tracking-wide uppercase">Tool Panels</h3>
                <span className="text-[10px] text-slate-400 font-mono block">
                  {images.length > 0 ? `${images.length} in Workspace` : 'Interactive Canvas'}
                </span>
              </div>
            </div>

            {/* Mode Switcher: Easy (সহজ) vs Pro */}
            <div className="flex items-center p-0.5 rounded-xl bg-dark-900 border border-white/10 shadow-inner">
              <button
                onClick={() => setPanelMode('easy')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  panelMode === 'easy'
                    ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-dark-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Easy Mode: 1-Click Simple Controls (সহজ ফিচার)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Easy (সহজ)</span>
              </button>
              <button
                onClick={() => setPanelMode('pro')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  panelMode === 'pro'
                    ? 'bg-dark-800 text-cyan-300 font-bold border border-cyan-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Pro Mode: Detailed granular controls (প্রো মোড)"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Pro</span>
              </button>
            </div>
          </div>

          {/* Subheader: Category Filter Pills (Pro) OR Simple Info Bar (Easy) */}
          {panelMode === 'pro' ? (
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
              {categories.map(tab => {
                const Icon = tab.icon;
                const isCurrent = activeCategory === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-2.5 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 shrink-0 relative ${
                      isCurrent
                        ? 'bg-cyan-400 text-dark-950 font-bold shadow-md shadow-cyan-400/20'
                        : 'text-slate-400 hover:text-slate-200 bg-dark-900/80 hover:bg-dark-900 border border-white/5 hover:border-white/15'
                    }`}
                  >
                    <Icon className={`w-3 h-3 ${isCurrent ? 'text-dark-950' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>

                    {tab.isActive && !isCurrent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
                    )}

                    {tab.badge && (
                      <span
                        className={`px-1 py-0.2 rounded text-[9px] font-mono font-bold ${
                          isCurrent
                            ? 'bg-dark-950 text-cyan-400'
                            : 'bg-cyan-400/20 text-cyan-300'
                        }`}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-between px-1 text-[11px]">
              <span className="text-cyan-300 font-medium flex items-center gap-1">
                <span>⚡</span>
                <span>সহজ মোড: ১-ক্লিকে চমৎকার লুক ও কন্ট্রোলস</span>
              </span>
              <div className="flex items-center gap-1">
                {onOpen3DStudio && (
                  <button
                    onClick={onOpen3DStudio}
                    className="p-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition active:scale-95"
                    title="Open 3D Wood Studio"
                  >
                    <Box className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={onOpenPatternModal}
                  className="p-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition active:scale-95"
                  title="Open 500+ Pattern Library"
                >
                  <Grid className="w-3.5 h-3.5" />
                </button>
              </div>
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
        {/* 2. SCROLLABLE MIDDLE CONTENT AREA                        */}
        {/* ======================================================== */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin min-h-0">
          
          {/* Active Source Image & Upload Box */}
          <div className="p-3 rounded-xl bg-dark-900/90 border border-white/10 space-y-2.5 shadow-md">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-slate-200">
                  {images.length > 1 ? `Source (#${activeIndex + 1}/${images.length})` : 'Source Image'}
                </span>
              </div>
              {images.length > 0 && (
                <button
                  onClick={onClearAllImages}
                  className="text-[10px] text-rose-400 hover:text-rose-300 transition flex items-center gap-1"
                  title="Clear all uploaded images"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {images.length === 0 ? (
              <div
                onDragOver={e => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileChange(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl border-2 border-dashed p-3 text-center cursor-pointer transition-all flex items-center gap-3 ${
                  isDragging
                    ? 'border-cyan-400 bg-cyan-400/10 ring-2 ring-cyan-400/20'
                    : 'border-white/10 hover:border-cyan-400/50 bg-dark-950/60 hover:bg-dark-950'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <Upload className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-semibold text-white block">Upload Images</span>
                  <span className="text-[10px] text-cyan-400 block font-medium">Select up to 30+ files at once</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <img
                      src={selectedImage?.processedUrl || selectedImage?.thumbnailUrl || selectedImage?.originalUrl}
                      alt="Active"
                      className="w-10 h-10 rounded-lg object-cover border border-white/15 shrink-0 bg-dark-950"
                    />
                    <div className="overflow-hidden">
                      <span className="text-xs font-semibold text-white truncate block" title={selectedImage?.name}>
                        {selectedImage?.name || 'Image'}
                      </span>
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-3 h-3" />
                        {selectedImage?.status === 'completed' ? 'Processed' : 'Ready'}
                      </span>
                    </div>
                  </div>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-[10px] font-medium text-cyan-300 border border-cyan-500/20 transition shrink-0 flex items-center gap-1"
                      title="Add more files to batch"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                </div>

                {/* Stepper when multiple images */}
                {images.length > 1 && (
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
                    <button
                      onClick={handlePrevImage}
                      className="px-2 py-0.5 rounded bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white transition flex items-center gap-0.5 text-[10px]"
                    >
                      <ChevronLeft className="w-3 h-3" /> Prev
                    </button>
                    <span className="font-mono text-[10px] text-slate-400">
                      <strong className="text-cyan-400">{activeIndex + 1}</strong> of {images.length}
                    </span>
                    <button
                      onClick={handleNextImage}
                      className="px-2 py-0.5 rounded bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white transition flex items-center gap-0.5 text-[10px]"
                    >
                      Next <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Compact Image Opacity Slider */}
                <div className="pt-1.5 border-t border-white/5 space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-cyan-400" /> Image Opacity:
                    </span>
                    <span className="font-mono text-cyan-400 font-semibold">
                      {settings.image?.opacity ?? 100}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.image?.opacity ?? 100}
                    onChange={e => onUpdateSettings('image', { opacity: Number(e.target.value) })}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5"
                  />
                </div>
              </div>
            )}
          </div>

          {/* EASY MODE VS PRO MODE CONTENT */}
          {panelMode === 'easy' ? (
            <EasyStudioPanel
              settings={settings}
              onUpdateSettings={onUpdateSettings}
              onOpenPatternModal={onOpenPatternModal}
              onOpen3DStudio={onOpen3DStudio}
              selectedImage={selectedImage}
              onRandomize={onRandomize}
              onReset={onReset}
            />
          ) : (
            <>
              {/* ====================================================== */}
              {/* TAB: GRADIENTS                                         */}
              {/* ====================================================== */}
              {(activeCategory === 'gradient' || activeCategory === 'all') && (
                <div className="space-y-2">
              {activeCategory === 'all' && (
                <button
                  onClick={() => toggleSection('gradient')}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-dark-900 border border-white/10 text-xs font-bold text-white hover:bg-dark-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-cyan-400" />
                    <span>Gradient Studio</span>
                  </div>
                  {expandedSections.gradient ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}

              {(activeCategory === 'gradient' || expandedSections.gradient) && (
                <GradientStudioPanel
                  settings={settings.gradient}
                  onUpdateSettings={vals => onUpdateSettings('gradient', vals)}
                  selectedImage={selectedImage}
                />
              )}
            </div>
          )}

          {/* ====================================================== */}
          {/* TAB: BLUR OPTICS                                       */}
          {/* ====================================================== */}
          {(activeCategory === 'blur' || activeCategory === 'all') && (
            <div className="space-y-2">
              {activeCategory === 'all' && (
                <button
                  onClick={() => toggleSection('blur')}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-dark-900 border border-white/10 text-xs font-bold text-white hover:bg-dark-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-cyan-400" />
                    <span>Blur Optics ({blurPct}%)</span>
                  </div>
                  {expandedSections.blur ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}

              {(activeCategory === 'blur' || expandedSections.blur) && (
                <div className="space-y-3 p-3.5 rounded-xl bg-dark-900/90 border border-white/10 shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-slate-200">Blur Studio Optics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-semibold">{blurPct}% ({settings.blur.radius}px)</span>
                      <button
                        onClick={() => onUpdateSettings('blur', { enabled: !settings.blur.enabled })}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded transition ${
                          settings.blur.enabled
                            ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                            : 'bg-dark-800 text-slate-400'
                        }`}
                      >
                        {settings.blur.enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Blur Category Selector */}
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
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
                        className={`py-1.5 px-1 rounded-lg transition font-medium text-center truncate ${
                          settings.blur.category === cat.id
                            ? 'bg-cyan-400 text-dark-950 font-bold shadow-sm'
                            : 'bg-dark-950 hover:bg-dark-800 text-slate-400 border border-white/5'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Radius Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Blur Radius</span>
                      <span className="font-mono text-cyan-400">{settings.blur.radius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={settings.blur.radius}
                      onChange={e => onUpdateSettings('blur', { radius: Number(e.target.value), enabled: true })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Category-Specific Fine Optics */}
                  {settings.blur.category === 'glass' && (
                    <div className="space-y-2 pt-2 border-t border-white/5 text-[11px]">
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
                          className="w-full accent-cyan-400"
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
                          className="w-full accent-cyan-400"
                        />
                      </div>
                    </div>
                  )}

                  {settings.blur.category === 'tiltshift' && (
                    <div className="space-y-2 pt-2 border-t border-white/5 text-[11px]">
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
                          className="w-full accent-cyan-400"
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
                          className="w-full accent-cyan-400"
                        />
                      </div>
                    </div>
                  )}

                  {(settings.blur.category === 'linear' || settings.blur.category === 'angular') && (
                    <div className="pt-2 border-t border-white/5">
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
                        className="w-full accent-cyan-400"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ====================================================== */}
          {/* TAB: NOISE & GRAIN                                     */}
          {/* ====================================================== */}
          {(activeCategory === 'noise' || activeCategory === 'all') && (
            <div className="space-y-2">
              {activeCategory === 'all' && (
                <button
                  onClick={() => toggleSection('noise')}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-dark-900 border border-white/10 text-xs font-bold text-white hover:bg-dark-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Disc className="w-4 h-4 text-cyan-400" />
                    <span>Noise & Grain ({noisePct}%)</span>
                  </div>
                  {expandedSections.noise ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}

              {(activeCategory === 'noise' || expandedSections.noise) && (
                <div className="space-y-3 p-3.5 rounded-xl bg-dark-900/90 border border-white/10 shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Disc className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-slate-200">Noise & Grain Studio</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-semibold">{noisePct}%</span>
                      <button
                        onClick={() => onUpdateSettings('noise', { enabled: !settings.noise.enabled })}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded transition ${
                          settings.noise.enabled
                            ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                            : 'bg-dark-800 text-slate-400'
                        }`}
                      >
                        {settings.noise.enabled ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  </div>

                  {/* Noise Aesthetic Selector */}
                  <div className="grid grid-cols-3 gap-1 text-[10px]">
                    {[
                      { id: 'film', label: '35mm Film' },
                      { id: 'retro', label: 'Retro Dust' },
                      { id: 'digital', label: 'Digital Sensor' },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => onUpdateSettings('noise', { type: t.id as NoiseType, enabled: true })}
                        className={`py-1.5 px-1 rounded-lg transition font-medium text-center ${
                          settings.noise.type === t.id
                            ? 'bg-cyan-400 text-dark-950 font-bold shadow-sm'
                            : 'bg-dark-950 hover:bg-dark-800 text-slate-400 border border-white/5'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Density Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Grain Density</span>
                      <span className="font-mono text-cyan-400">{settings.noise.amount}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.noise.amount}
                      onChange={e => onUpdateSettings('noise', { amount: Number(e.target.value), enabled: true })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Monochrome Switch & Blend Mode */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                      <input
                        type="checkbox"
                        checked={settings.noise.monochrome ?? false}
                        onChange={e => onUpdateSettings('noise', { monochrome: e.target.checked })}
                        className="rounded border-white/20 bg-dark-950 text-cyan-400 accent-cyan-400"
                      />
                      <span>Monochrome</span>
                    </label>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-500 text-[10px]">Blend:</span>
                      <select
                        value={settings.noise.blendMode ?? 'overlay'}
                        onChange={e => onUpdateSettings('noise', { blendMode: e.target.value as any })}
                        className="bg-dark-950 border border-white/10 text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
                      >
                        <option value="overlay">Overlay</option>
                        <option value="soft-light">Soft Light</option>
                        <option value="screen">Screen</option>
                        <option value="hard-light">Hard Light</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====================================================== */}
          {/* TAB: PATTERNS & 3D                                     */}
          {/* ====================================================== */}
          {(activeCategory === 'patterns' || activeCategory === 'all') && (
            <div className="space-y-2">
              {activeCategory === 'all' && (
                <button
                  onClick={() => toggleSection('patterns')}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-dark-900 border border-white/10 text-xs font-bold text-white hover:bg-dark-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-cyan-400" />
                    <span>Patterns & 3D Extrusion</span>
                  </div>
                  {expandedSections.patterns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}

              {(activeCategory === 'patterns' || expandedSections.patterns) && (
                <div className="space-y-3">
                  {/* 3D Wood Studio Launcher Banner */}
                  {onOpen3DStudio && (
                    <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-600/10 border border-amber-500/30 flex items-center justify-between shadow-md">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
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
                        className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-dark-950 font-bold text-[10px] transition shadow-sm shrink-0"
                      >
                        Open 3D
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
            </div>
          )}

          {/* ====================================================== */}
          {/* TAB: AI UPSCALE                                        */}
          {/* ====================================================== */}
          {(activeCategory === 'upscale' || activeCategory === 'all') && (
            <div className="space-y-2">
              {activeCategory === 'all' && (
                <button
                  onClick={() => toggleSection('upscale')}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-dark-900 border border-white/10 text-xs font-bold text-white hover:bg-dark-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Maximize2 className="w-4 h-4 text-cyan-400" />
                    <span>AI Super-Resolution ({settings.upscale.factor}x)</span>
                  </div>
                  {expandedSections.upscale ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}

              {(activeCategory === 'upscale' || expandedSections.upscale) && (
                <div className="space-y-3 p-3.5 rounded-xl bg-dark-900/90 border border-white/10 shadow-md">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <Maximize2 className="w-4 h-4 text-cyan-400" />
                      <span className="font-semibold text-slate-200">AI Super-Resolution</span>
                    </div>
                    <span className="font-mono text-cyan-400 font-semibold text-[11px]">
                      {settings.upscale.factor === 8
                        ? '8K Studio Master'
                        : settings.upscale.factor === 4
                        ? '4K Ultra HD'
                        : settings.upscale.factor === 2
                        ? '2K Quad HD'
                        : '1x Native'}
                    </span>
                  </div>

                  {/* Resolution Factor Buttons */}
                  <div className="grid grid-cols-4 gap-1 text-[10px]">
                    {[
                      { factor: 1, label: '1x Native' },
                      { factor: 2, label: '2K Crisp' },
                      { factor: 4, label: '4K Ultra' },
                      { factor: 8, label: '8K Master' },
                    ].map(item => (
                      <button
                        key={item.factor}
                        onClick={() => onUpdateSettings('upscale', { factor: item.factor as any })}
                        className={`py-1.5 rounded-lg font-medium transition text-center ${
                          settings.upscale.factor === item.factor
                            ? 'bg-cyan-400 text-dark-950 font-bold shadow-sm'
                            : 'bg-dark-950 hover:bg-dark-800 text-slate-400 border border-white/5'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>

                  {/* AI Unsharp Clarity Mask Sharpening */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>AI Clarity Sharpening</span>
                      <span className="font-mono text-cyan-400">{settings.upscale.sharpen ?? 30}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.upscale.sharpen ?? 30}
                      onChange={e => onUpdateSettings('upscale', { sharpen: Number(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Output Format Selector */}
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Output Format</span>
                      <span className="font-mono text-cyan-300">
                        {settings.upscale.format === 'image/jpeg' ? '.JPG' : settings.upscale.format === 'image/webp' ? '.WEBP' : '.PNG'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      {[
                        { id: 'image/png' as ExportFormat, label: 'PNG Lossless' },
                        { id: 'image/jpeg' as ExportFormat, label: 'JPEG Fast' },
                        { id: 'image/webp' as ExportFormat, label: 'WebP High-Q' },
                      ].map(fmt => (
                        <button
                          key={fmt.id}
                          onClick={() => onUpdateSettings('upscale', { format: fmt.id })}
                          className={`py-1 px-1 rounded-lg font-medium transition text-center truncate ${
                            settings.upscale.format === fmt.id
                              ? 'bg-purple-500/30 text-purple-300 border border-purple-500/50 font-bold'
                              : 'bg-dark-950 text-slate-400 hover:text-white border border-white/5'
                          }`}
                        >
                          {fmt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ====================================================== */}
          {/* TAB: PRESETS                                           */}
          {/* ====================================================== */}
          {(activeCategory === 'presets' || activeCategory === 'all') && (
            <div className="space-y-2">
              {activeCategory === 'all' && (
                <button
                  onClick={() => toggleSection('presets')}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-dark-900 border border-white/10 text-xs font-bold text-white hover:bg-dark-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Curated Style Presets</span>
                  </div>
                  {expandedSections.presets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}

              {(activeCategory === 'presets' || expandedSections.presets) && (
                <div className="space-y-2.5 p-3.5 rounded-xl bg-dark-900/90 border border-white/10 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-semibold text-white">Curated Presets</span>
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
                          className="p-2 rounded-lg bg-dark-950/80 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/40 text-left transition flex items-center gap-2 group"
                          title={preset.description}
                        >
                          <div className="w-5 h-5 rounded-md shrink-0 border border-white/15 shadow" style={{ background: gradStyle }} />
                          <div className="overflow-hidden">
                            <span className="text-[11px] font-semibold text-slate-200 group-hover:text-cyan-300 block truncate">
                              {preset.name}
                            </span>
                            <span className="text-[9px] text-slate-500 block truncate">
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
            </>
          )}
        </div>

        {/* ======================================================== */}
        {/* 3. ALWAYS VISIBLE DOCKED STICKY ACTION FOOTER            */}
        {/* ======================================================== */}
        <div className="p-3.5 bg-dark-950/95 border-t border-white/10 backdrop-blur-md shrink-0 flex flex-col gap-2">
          {images.length > 1 ? (
            <>
              {/* Batch Process All Button */}
              <button
                onClick={onStartBatch}
                disabled={isProcessingBatch}
                className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
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
                    <span>Process All {images.length} Images</span>
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
                      <span>Download {completedCount} Processed (ZIP)</span>
                    </>
                  )}
                </button>
              )}

              {/* View Batch Queue Link */}
              <button
                onClick={onViewBatchQueue}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 text-center py-0.5 transition flex items-center justify-center gap-1"
              >
                <Layers className="w-3 h-3" />
                <span>Open Full Batch Queue ({images.length})</span>
              </button>
            </>
          ) : (
            <button
              onClick={handleProcessSingleClick}
              disabled={isProcessingBatch}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 shadow-lg ${
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
                  <span>Apply on Image (Process)</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
