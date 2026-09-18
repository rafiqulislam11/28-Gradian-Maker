import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Palette,
  Eye,
  Check,
  Copy,
  RefreshCw,
  Sliders,
  Layers,
  Wand2,
  Upload,
  Dices,
  ChevronRight,
  Sun,
  Flame,
  Zap,
} from 'lucide-react';
import { FilterSettings, ImageItem, GradientType } from '../../types/studio';
import { extractImageToGradientData, ImageGradientData } from '../../engine/colorExtractor';

interface AutoImageToGradientProps {
  settings: FilterSettings;
  onUpdateSettings: <K extends keyof FilterSettings>(category: K, values: Partial<FilterSettings[K]>) => void;
  selectedImage: ImageItem | null;
  onUploadImages?: (files: File[]) => void;
  onLoadSampleImage?: () => void;
  compact?: boolean;
}

export const AutoImageToGradient: React.FC<AutoImageToGradientProps> = ({
  settings,
  onUpdateSettings,
  selectedImage,
  onUploadImages,
  onLoadSampleImage,
  compact = false,
}) => {
  const [extractedData, setExtractedData] = useState<ImageGradientData | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [activePresetId, setActivePresetId] = useState<string>('mesh');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Extract color data whenever active image changes
  useEffect(() => {
    let isCancelled = false;
    if (!selectedImage) {
      setExtractedData(null);
      return;
    }

    const runExtraction = async () => {
      setIsExtracting(true);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedImage.processedUrl || selectedImage.originalUrl;
        await img.decode();
        if (isCancelled) return;

        const data = await extractImageToGradientData(img);
        if (isCancelled) return;

        setExtractedData(data);
      } catch (err) {
        console.warn('Auto image gradient extraction error:', err);
      } finally {
        if (!isCancelled) setIsExtracting(false);
      }
    };

    runExtraction();

    return () => {
      isCancelled = true;
    };
  }, [selectedImage?.id, selectedImage?.processedUrl, selectedImage?.originalUrl]);

  const handleCopyColor = (hex: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1400);
  };

  // 1-Click Auto Gradient Presets
  const applyAutoGradientPreset = (type: 'mesh' | 'linear' | 'radial' | 'conical' | 'duotone' | 'soft') => {
    setActivePresetId(type);
    if (!extractedData) return;

    if (type === 'mesh') {
      onUpdateSettings('gradient', {
        enabled: true,
        type: 'mesh',
        position: 'background',
        meshColors: extractedData.quadrants,
        stops: extractedData.linearStops,
        opacity: Math.max(70, settings.gradient.opacity || 85),
      });
    } else if (type === 'linear') {
      onUpdateSettings('gradient', {
        enabled: true,
        type: 'linear',
        angle: 135,
        position: 'background',
        stops: extractedData.linearStops,
        opacity: Math.max(75, settings.gradient.opacity || 85),
      });
    } else if (type === 'radial') {
      onUpdateSettings('gradient', {
        enabled: true,
        type: 'radial',
        position: 'background',
        stops: extractedData.radialStops,
        opacity: Math.max(75, settings.gradient.opacity || 85),
      });
    } else if (type === 'conical') {
      onUpdateSettings('gradient', {
        enabled: true,
        type: 'conical',
        position: 'background',
        stops: extractedData.conicStops,
        opacity: Math.max(75, settings.gradient.opacity || 85),
      });
    } else if (type === 'duotone') {
      onUpdateSettings('gradient', {
        enabled: true,
        type: 'linear',
        angle: 90,
        position: 'background',
        stops: extractedData.duotoneStops,
        opacity: Math.max(75, settings.gradient.opacity || 85),
      });
    } else if (type === 'soft') {
      onUpdateSettings('gradient', {
        enabled: true,
        type: 'mesh',
        position: 'background',
        meshColors: [
          extractedData.palette[1] || '#38bdf8',
          extractedData.palette[2] || '#c084fc',
          extractedData.palette[3] || '#f472b6',
          extractedData.palette[0] || '#00d2ff',
        ],
        stops: extractedData.softStops,
        opacity: 70,
      });
    }

    // Auto-harmonize patterns stroke color to highlight
    if (settings.patterns.enabled && extractedData.highlight) {
      onUpdateSettings('patterns', { color: extractedData.highlight });
    }
  };

  // 1-Click apply extracted highlight color to patterns
  const handleApplyColorsToPatterns = () => {
    if (!extractedData) return;
    onUpdateSettings('patterns', {
      color: extractedData.highlight,
      glowColor: extractedData.palette[1] || extractedData.highlight,
    });
  };

  // 1-Click convert photo to 100% pure gradient wallpaper
  const handleMakeWallpaper = () => {
    onUpdateSettings('image', { opacity: 0 });
    onUpdateSettings('gradient', { enabled: true, position: 'background', opacity: 100 });
  };

  const imageOpacity = settings.image?.opacity ?? 100;
  const imageBlend = settings.image?.blendMode ?? 'normal';
  const gradientPosition = settings.gradient?.position ?? 'background';

  // No image uploaded state
  if (!selectedImage) {
    return (
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121826] to-[#0d121f] border border-cyan-500/20 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>Auto Image to Gradient</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/15 text-cyan-300 font-mono">
                  অটো সিস্টেম
                </span>
              </span>
              <p className="text-[10px] text-slate-400">
                ফটো থেকে কালার নিয়ে অটোমেটিক গ্রেডিয়েন্ট তৈরি করুন
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-dark-950/70 border border-dashed border-white/15 text-center space-y-2.5">
          <p className="text-[11px] text-slate-300">
            যেকোনো ছবি আপলোড করলেই কালার প্যালেট ও গ্রেডিয়েন্ট অটো জেনারেট হবে!
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => {
                if (e.target.files && onUploadImages) {
                  onUploadImages(Array.from(e.target.files));
                }
              }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-dark-950 text-xs font-bold flex items-center gap-1.5 transition shadow-sm active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>ছবি আপলোড করুন</span>
            </button>
            {onLoadSampleImage && (
              <button
                onClick={onLoadSampleImage}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition border border-white/10 active:scale-95"
              >
                <Dices className="w-3.5 h-3.5 text-purple-400" />
                <span>স্যাম্পল ছবি</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121826] to-[#0d121f] border border-cyan-500/20 shadow-xl space-y-3.5">
      {/* 1. Header with Photo Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Auto Image to Gradient</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-cyan-300 font-mono font-semibold">
                অটো গ্রেডিয়েন্ট
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              ছবি থেকে অটোমেটিক এক্সট্রাক্ট করা কালার ও লাইভ ব্লেন্ড
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            // Re-run extraction
            if (selectedImage) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = selectedImage.originalUrl;
              img.onload = async () => {
                const data = await extractImageToGradientData(img);
                setExtractedData(data);
              };
            }
          }}
          disabled={isExtracting}
          className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-cyan-300 border border-white/10 transition"
          title="কালার প্যালেট রি-স্ক্যান করুন"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isExtracting ? 'animate-spin text-cyan-400' : ''}`} />
        </button>
      </div>

      {/* 2. Extracted Palette Swatches */}
      <div className="p-2.5 rounded-xl bg-dark-950/80 border border-white/10 space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-300 font-medium flex items-center gap-1">
            <Palette className="w-3 h-3 text-cyan-400" />
            <span>Extracted Photo Palette (ছবি থেকে কালার)</span>
          </span>
          <span className="text-[9px] text-cyan-400/80 font-mono">
            {copiedColor ? `Copied ${copiedColor}!` : 'Click swatch to copy'}
          </span>
        </div>

        {extractedData ? (
          <div className="grid grid-cols-6 gap-1.5 pt-0.5">
            {extractedData.palette.map((hex, idx) => (
              <button
                key={`${hex}_${idx}`}
                onClick={e => handleCopyColor(hex, e)}
                className="group relative flex flex-col items-center p-1 rounded-lg bg-dark-900/90 hover:bg-dark-800 border border-white/10 hover:border-cyan-400/40 transition active:scale-95"
                title={`Copy ${hex} or click to use`}
              >
                <div
                  className="w-full h-5 rounded-md border border-white/20 shadow-sm"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-[8.5px] font-mono text-slate-400 group-hover:text-white mt-1 uppercase truncate w-full text-center">
                  {hex.replace('#', '')}
                </span>
                {copiedColor === hex && (
                  <span className="absolute inset-0 bg-dark-950/90 rounded-lg flex items-center justify-center text-[9px] font-bold text-cyan-300">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="py-2 text-center text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
            <span>Analyzing photo colors...</span>
          </div>
        )}
      </div>

      {/* 3. 1-Click Auto Gradient Presets Derived from Image */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-white flex items-center gap-1">
            <Wand2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>1-Click Auto Gradient Styles (অটো গ্রেডিয়েন্ট)</span>
          </span>
          <span className="text-[10px] text-slate-400">৬টি স্টাইল</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            {
              id: 'mesh',
              label: '4-Corner Mesh',
              bangla: '৪-কোণার মেশ',
              icon: '🌈',
              gradient: extractedData
                ? `linear-gradient(135deg, ${extractedData.quadrants[0]}, ${extractedData.quadrants[1]}, ${extractedData.quadrants[2]})`
                : 'linear-gradient(135deg, #00d2ff, #9d00ff)',
            },
            {
              id: 'linear',
              label: 'Linear Flow 135°',
              bangla: 'ডায়াগনাল ফ্লো',
              icon: '🌅',
              gradient: extractedData
                ? `linear-gradient(135deg, ${extractedData.palette[0]}, ${extractedData.palette[1]}, ${extractedData.palette[2]})`
                : 'linear-gradient(135deg, #00d2ff, #ff007f)',
            },
            {
              id: 'radial',
              label: 'Radial Glow',
              bangla: 'রেডিয়াল ব্লুম',
              icon: '💫',
              gradient: extractedData
                ? `radial-gradient(circle, ${extractedData.highlight}, ${extractedData.shadow})`
                : 'radial-gradient(circle, #00f0ff, #1a0b2e)',
            },
            {
              id: 'conical',
              label: 'Conic Sweep',
              bangla: '৩৬০° সুইপ',
              icon: '🌀',
              gradient: extractedData
                ? `conic-gradient(from 0deg, ${extractedData.palette[0]}, ${extractedData.palette[1]}, ${extractedData.palette[2]}, ${extractedData.palette[0]})`
                : 'conic-gradient(#00d2ff, #9d00ff, #ff007f, #00d2ff)',
            },
            {
              id: 'duotone',
              label: 'Duotone Pop',
              bangla: 'ডুওটোন কনট্রাস্ট',
              icon: '🔮',
              gradient: extractedData
                ? `linear-gradient(90deg, ${extractedData.shadow}, ${extractedData.highlight})`
                : 'linear-gradient(90deg, #1a0b2e, #00f0ff)',
            },
            {
              id: 'soft',
              label: 'Soft Ambient',
              bangla: 'সফট অ্যাম্বিয়েন্ট',
              icon: '💎',
              gradient: extractedData
                ? `linear-gradient(135deg, ${extractedData.palette[1]}, ${extractedData.palette[2]})`
                : 'linear-gradient(135deg, #38bdf8, #f472b6)',
            },
          ].map(preset => {
            const isActive = activePresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => applyAutoGradientPreset(preset.id as any)}
                className={`p-2 rounded-xl text-left transition relative border overflow-hidden flex flex-col gap-1 ${
                  isActive
                    ? 'bg-dark-900 border-cyan-400 ring-1 ring-cyan-400/50 shadow-md'
                    : 'bg-dark-950/80 hover:bg-dark-900 border-white/5 hover:border-cyan-400/30'
                }`}
              >
                <div
                  className="w-full h-4 rounded-md border border-white/10 shadow-sm"
                  style={{ background: preset.gradient }}
                />
                <div>
                  <span className="text-[10px] font-bold text-white block truncate">
                    {preset.icon} {preset.label}
                  </span>
                  <span className="text-[8.5px] text-slate-400 block truncate">
                    {preset.bangla}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. ACCURATE IMAGE OPACITY & BLENDING CONTROLS */}
      <div className="p-3 rounded-xl bg-dark-950/90 border border-white/10 space-y-3">
        {/* Opacity Slider & Live Value */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-white flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Image Opacity (ইমেজ অপাসিটি)</span>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-400/30">
                {imageOpacity}%
              </span>
            </div>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={imageOpacity}
            onChange={e => onUpdateSettings('image', { opacity: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-2"
          />

          {/* Quick Opacity Presets */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {[
              { label: '0% Pure Grad', val: 0, tip: 'শুধুমাত্র গ্রেডিয়েন্ট' },
              { label: '25% Ghost', val: 25, tip: 'হালকা ছবি' },
              { label: '50% Hybrid', val: 50, tip: 'অর্ধেক ছবি অর্ধেক গ্রেডিয়েন্ট' },
              { label: '75% Rich', val: 75, tip: 'স্পষ্ট ছবি' },
              { label: '100% Full', val: 100, tip: '১০০% অরিজিনাল' },
            ].map(item => (
              <button
                key={item.val}
                onClick={() => onUpdateSettings('image', { opacity: item.val })}
                className={`py-1 rounded text-[9px] font-mono transition text-center ${
                  imageOpacity === item.val
                    ? 'bg-cyan-400 text-dark-950 font-bold shadow-sm'
                    : 'bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5'
                }`}
                title={item.tip}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Layer Mode & Blend Mode in 2-column layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-white/5">
          {/* Layer Mode: Background vs Overlay */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Layers className="w-3 h-3 text-cyan-400" /> Layer Position:
            </span>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => onUpdateSettings('gradient', { position: 'background' })}
                className={`px-1.5 py-1 rounded-lg text-[9.5px] font-medium transition text-center ${
                  gradientPosition === 'background'
                    ? 'bg-cyan-400 text-dark-950 font-bold'
                    : 'bg-dark-900 text-slate-400 hover:text-white border border-white/5'
                }`}
                title="ইমেজ ব্যাকগ্রাউন্ড গ্রেডিয়েন্টের উপরে থাকবে, অপাসিটি কমালে গ্রেডিয়েন্ট দেখা যাবে"
              >
                🖼️ On Grad
              </button>
              <button
                onClick={() => onUpdateSettings('gradient', { position: 'overlay' })}
                className={`px-1.5 py-1 rounded-lg text-[9.5px] font-medium transition text-center ${
                  gradientPosition === 'overlay'
                    ? 'bg-cyan-400 text-dark-950 font-bold'
                    : 'bg-dark-900 text-slate-400 hover:text-white border border-white/5'
                }`}
                title="গ্রেডিয়েন্ট ছবির উপরে কালার ফিল্টার হিসেবে কাজ করবে"
              >
                🎨 Overlay
              </button>
            </div>
          </div>

          {/* Blend Mode */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Sliders className="w-3 h-3 text-cyan-400" /> Blend Mode:
            </span>
            <select
              value={imageBlend}
              onChange={e => onUpdateSettings('image', { blendMode: e.target.value as any })}
              className="w-full px-2 py-1 rounded-lg bg-dark-900 border border-white/10 text-white text-[10px] font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
            >
              <option value="normal">Normal (স্বাভাবিক)</option>
              <option value="overlay">Overlay (ওভারলে)</option>
              <option value="screen">Screen (স্ক্রিন - লাইট)</option>
              <option value="soft-light">Soft Light (সফট লাইট)</option>
              <option value="multiply">Multiply (মাল্টিপ্লাই - ডার্ক)</option>
              <option value="color-dodge">Color Dodge (কালার ডজ)</option>
              <option value="luminosity">Luminosity (লুমিনোসিটি)</option>
            </select>
          </div>
        </div>

        {/* Quick Utility Actions */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-white/5">
          <button
            onClick={handleApplyColorsToPatterns}
            className="px-2 py-1 rounded-lg bg-dark-900 hover:bg-dark-800 text-cyan-300 text-[9.5px] font-medium border border-cyan-500/20 flex items-center justify-center gap-1 transition"
            title="প্যাটার্ন এর রঙ ছবির সাথে ম্যাচ করুন"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Sync with Patterns</span>
          </button>
          <button
            onClick={handleMakeWallpaper}
            className="px-2 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 text-[9.5px] font-medium border border-purple-500/30 flex items-center justify-center gap-1 transition"
            title="ছবি হাইড করে শুধুমাত্র নিখুঁত গ্রেডিয়েন্ট ওয়ালপেপার ভিউ করুন"
          >
            <Sun className="w-3 h-3 text-purple-400" />
            <span>Pure Wallpaper</span>
          </button>
        </div>
      </div>
    </div>
  );
};
