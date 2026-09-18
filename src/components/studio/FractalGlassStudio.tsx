import React from 'react';
import {
  Sun,
  Sparkles,
  Layers,
  Sliders,
  Compass,
  Eye,
  Zap,
  Check,
  SplitSquareVertical,
  Orbit,
  Dices,
  RotateCcw,
} from 'lucide-react';
import { FilterSettings, FractalGlassMode, FractalGlassSettings } from '../../types/studio';

interface FractalGlassStudioProps {
  settings: FractalGlassSettings;
  onUpdate: (values: Partial<FractalGlassSettings>) => void;
  onUpdateImageOpacity?: (opacity: number) => void;
  imageOpacity?: number;
}

export const FRACTAL_GLASS_MODES: {
  id: FractalGlassMode;
  label: string;
  subLabel: string;
  bangla: string;
  desc: string;
  icon: string;
  defaultConfig: Partial<FractalGlassSettings>;
}[] = [
  {
    id: '1',
    label: '1: Fluted Reeded Glass',
    subLabel: 'Fluted Ribs',
    bangla: 'লিনিয়ার রিবড গ্লাস',
    desc: 'Parallel cylindrical optical glass fluting with specular crest highlights',
    icon: '▥',
    defaultConfig: {
      mode: '1',
      distortion: 45,
      dispersion: 25,
      scale: 35,
      frost: 0,
      specular: 65,
      angle: 90,
      blendMode: 'normal',
      opacity: 100,
    },
  },
  {
    id: '2',
    label: '2: Diamond Crystal Facets',
    subLabel: 'Diamond Facets',
    bangla: 'ডায়মন্ড ক্রিস্টাল প্রিজম',
    desc: 'Multi-faceted diamond cut crystal grid refracting underlying photo',
    icon: '❖',
    defaultConfig: {
      mode: '2',
      distortion: 50,
      dispersion: 40,
      scale: 45,
      frost: 5,
      specular: 70,
      angle: 45,
      blendMode: 'normal',
      opacity: 100,
    },
  },
  {
    id: '3',
    label: '3: Fractured Voronoi Shards',
    subLabel: 'Broken Shards',
    bangla: 'ভোরোনয় ভাঙা কাঁচের শার্ড',
    desc: 'Natural fractured polygonal glass shards with angular refractive displacement',
    icon: '⧇',
    defaultConfig: {
      mode: '3',
      distortion: 55,
      dispersion: 35,
      scale: 40,
      frost: 10,
      specular: 60,
      angle: 0,
      blendMode: 'normal',
      opacity: 100,
    },
  },
  {
    id: '3.1',
    label: '3.1: Prismatic Dispersion',
    subLabel: 'RGB Rainbow Split',
    bangla: 'প্রিজম্যাটিক রেইনবো স্পেকট্রাম',
    desc: 'Intense chromatic aberration separating Red, Green, and Blue light rays',
    icon: '🌈',
    defaultConfig: {
      mode: '3.1',
      distortion: 65,
      dispersion: 90,
      scale: 35,
      frost: 0,
      specular: 85,
      angle: 0,
      blendMode: 'normal',
      opacity: 100,
    },
  },
  {
    id: '3.2',
    label: '3.2: Frosted Matte Shimmer',
    subLabel: 'Acid-Etched Matte',
    bangla: 'ম্যাট ফ্রস্টেড গ্লাস শিমার',
    desc: 'Translucent acid-etched glass with micro-refraction and silky diffuse blur',
    icon: '❄️',
    defaultConfig: {
      mode: '3.2',
      distortion: 30,
      dispersion: 20,
      scale: 50,
      frost: 65,
      specular: 45,
      angle: 0,
      blendMode: 'normal',
      opacity: 100,
    },
  },
  {
    id: '3.3',
    label: '3.3: Sacred Kaleidoscope',
    subLabel: 'Recursive Mirror',
    bangla: 'ক্যালাইডোস্কোপ মিরর গ্লাস',
    desc: 'Multi-fold radial glass symmetry transforming your photo into recursive mandala art',
    icon: '🔮',
    defaultConfig: {
      mode: '3.3',
      distortion: 40,
      dispersion: 50,
      scale: 64,
      frost: 0,
      specular: 75,
      angle: 15,
      blendMode: 'normal',
      opacity: 100,
    },
  },
];

export const FractalGlassStudio: React.FC<FractalGlassStudioProps> = ({
  settings,
  onUpdate,
  onUpdateImageOpacity,
  imageOpacity = 100,
}) => {
  const activeMode = settings.mode || '1';

  const handleSelectMode = (m: FractalGlassMode) => {
    const target = FRACTAL_GLASS_MODES.find(it => it.id === m);
    if (target) {
      onUpdate({
        enabled: true,
        ...target.defaultConfig,
      });
    } else {
      onUpdate({ enabled: true, mode: m });
    }
  };

  const handleReset = () => {
    const target = FRACTAL_GLASS_MODES.find(it => it.id === activeMode) || FRACTAL_GLASS_MODES[0];
    onUpdate({
      enabled: true,
      ...target.defaultConfig,
    });
  };

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121826] to-[#0d121f] border border-cyan-500/30 shadow-xl space-y-4">
      {/* 1. Header & Enable Switch */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-md shadow-cyan-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white">Fractal Glass Effect</h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-bold border border-cyan-400/30">
                1 / 2 / 3 / 3.1 / 3.2 / 3.3
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              আপলোড করা ছবির ওপর অপটিক্যাল গ্লাস রিফ্র্যাকশন ও প্রিজম
            </span>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={e => onUpdate({ enabled: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-dark-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 shadow-inner"></div>
        </label>
      </div>

      {/* 2. Quick Mode Selector Pill Row: 1, 2, 3, 3.1, 3.2, 3.3 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-200 flex items-center gap-1.5">
            <span>🧊</span>
            <span>Select Glass Preset (মোড নির্বাচন করুন)</span>
          </span>
          <button
            onClick={handleReset}
            className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition"
            title="Reset active mode to defaults"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {FRACTAL_GLASS_MODES.map(item => {
            const isSelected = settings.enabled && activeMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectMode(item.id)}
                className={`p-2 rounded-xl text-left transition flex flex-col gap-1 border relative overflow-hidden active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-500/20 to-blue-500/10 border-cyan-400 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                    : 'bg-dark-950/80 hover:bg-dark-900 border-white/5 hover:border-cyan-400/30 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base">{item.icon}</span>
                  <span
                    className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-cyan-400 text-dark-950' : 'bg-dark-900 text-slate-400'
                    }`}
                  >
                    {item.id}
                  </span>
                </div>
                <div>
                  <span className="text-[10.5px] font-bold block truncate leading-tight">
                    {item.subLabel}
                  </span>
                  <span className="text-[8.5px] text-slate-400 block truncate">
                    {item.bangla}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Real-Time Optical Sliders */}
      <div className="space-y-3.5 p-3 rounded-xl bg-dark-950/90 border border-white/10">
        <span className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 block">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span>Optical Refraction Controls (গ্লাস কন্ট্রোলস)</span>
        </span>

        {/* 1. Refraction Distortion */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Refraction Distortion (কাঁচের বক্রতা)</span>
            <span className="font-mono text-cyan-400 font-bold">{settings.distortion}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.distortion}
            onChange={e => onUpdate({ distortion: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5"
          />
        </div>

        {/* 2. Chromatic Dispersion (RGB Split) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <span>🌈 Chromatic Dispersion (RGB কালার স্প্লিট)</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">{settings.dispersion}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.dispersion}
            onChange={e => onUpdate({ dispersion: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5"
          />
        </div>

        {/* 3. Facet Scale / Rib Frequency */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>
              {activeMode === '1'
                ? 'Rib Density / Width (রিব সাইজ)'
                : activeMode === '3.3'
                ? 'Kaleidoscope Segments (মিরর খণ্ড)'
                : 'Facet Scale (শার্ড বা প্রিজম সাইজ)'}
            </span>
            <span className="font-mono text-cyan-400 font-bold">{settings.scale}%</span>
          </div>
          <input
            type="range"
            min="5"
            max="100"
            value={settings.scale}
            onChange={e => onUpdate({ scale: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5"
          />
        </div>

        {/* 4. Frosting Diffuse Blur */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Frosting Diffuse (ম্যাট ফ্রস্টেড ব্লার)</span>
            <span className="font-mono text-cyan-400 font-bold">{settings.frost}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.frost}
            onChange={e => onUpdate({ frost: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5"
          />
        </div>

        {/* 5. Specular Caustics / Edge Shine */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Specular Gloss & Rim Light (গ্লাস রিফ্লেকশন)</span>
            <span className="font-mono text-cyan-400 font-bold">{settings.specular}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.specular}
            onChange={e => onUpdate({ specular: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5"
          />
        </div>

        {/* 6. Flute / Facet Angle (For 1, 2, 3.3) */}
        {(activeMode === '1' || activeMode === '2' || activeMode === '3.3') && (
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Orientation Angle (অ্যাঙ্গেল রোটেশন)</span>
              <span className="font-mono text-cyan-400 font-bold">{settings.angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={settings.angle}
              onChange={e => onUpdate({ angle: Number(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5"
            />
          </div>
        )}

        {/* 7. Effect Layer Opacity */}
        <div className="space-y-1 pt-1 border-t border-white/5">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Effect Intensity / Opacity</span>
            <span className="font-mono text-cyan-400 font-bold">{settings.opacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.opacity}
            onChange={e => onUpdate({ opacity: Number(e.target.value) })}
            className="w-full accent-cyan-400 cursor-pointer h-1.5"
          />
        </div>

        {/* Blend Mode */}
        <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px]">
          <span className="text-slate-400 font-medium">Layer Blend:</span>
          <select
            value={settings.blendMode || 'normal'}
            onChange={e => onUpdate({ blendMode: e.target.value as any })}
            className="px-2 py-1 rounded-lg bg-dark-900 border border-white/15 text-white text-[10px] font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            <option value="normal">Normal (স্বাভাবিক)</option>
            <option value="overlay">Overlay (ওভারলে)</option>
            <option value="screen">Screen (স্ক্রিন)</option>
            <option value="soft-light">Soft Light (সফট লাইট)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
