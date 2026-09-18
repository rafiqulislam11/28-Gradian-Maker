import React from 'react';
import {
  Palette,
  Sparkles,
  Layers,
  Sliders,
  Sun,
  Flame,
  Zap,
  Check,
  Plus,
  Trash2,
  Wand2,
} from 'lucide-react';
import {
  GradientMakerSettings,
  GradientMakerMode,
  GradientMapPreset,
  ColorStop,
} from '../../types/studio';
import { GRADIENT_MAP_PALETTES } from '../../engine/gradientMakerEngine';

interface GradientMakerStudioProps {
  settings: GradientMakerSettings;
  onUpdate: (values: Partial<GradientMakerSettings>) => void;
  extractedPalette?: string[];
}

export const GRADIENT_MAKER_MODES: {
  id: GradientMakerMode;
  title: string;
  bangla: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: '1',
    title: 'Maker 1: Fluid Mesh Aurora',
    bangla: '৪-কোণার লিকুইড মেশ',
    desc: '4-point organic fluid gradient diffusing across your photo',
    icon: '🌊',
  },
  {
    id: '2',
    title: 'Maker 2: Radial Halo Sunburst',
    bangla: 'রেডিয়াল সানবার্স্ট হ্যালো',
    desc: 'High-intensity centric luminous bloom with smooth falloff',
    icon: '☀️',
  },
  {
    id: '3',
    title: 'Maker 3: Precision Angle Flow',
    bangla: 'প্রিসিশন অ্যাঙ্গেল স্পেকট্রাম',
    desc: 'Directional 360° linear gradient with customizable color stops',
    icon: '📐',
  },
  {
    id: '4',
    title: 'Maker 4: Holographic Gradient Map',
    bangla: 'লুমিন্যান্স গ্রেডিয়েন্ট ম্যাপ',
    desc: 'Converts your photo brightness into continuous rich gradient art',
    icon: '🔮',
  },
];

export const GradientMakerStudio: React.FC<GradientMakerStudioProps> = ({
  settings,
  onUpdate,
  extractedPalette,
}) => {
  const activeMode = settings.mode || '1';

  const handleMeshColorChange = (index: number, color: string) => {
    const updated = [...(settings.meshColors || ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00'])] as [
      string,
      string,
      string,
      string
    ];
    updated[index] = color;
    onUpdate({ meshColors: updated });
  };

  const handleAddStop = () => {
    const newStop: ColorStop = {
      id: String(Date.now()),
      color: '#00f0ff',
      position: 50,
    };
    onUpdate({
      stops: [...(settings.stops || []), newStop].sort((a, b) => a.position - b.position),
    });
  };

  const handleRemoveStop = (id: string) => {
    if ((settings.stops || []).length <= 2) return;
    onUpdate({
      stops: (settings.stops || []).filter(s => s.id !== id),
    });
  };

  const handleUpdateStop = (id: string, color?: string, position?: number) => {
    onUpdate({
      stops: (settings.stops || [])
        .map(s => (s.id === id ? { ...s, color: color ?? s.color, position: position ?? s.position } : s))
        .sort((a, b) => a.position - b.position),
    });
  };

  return (
    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#121826] to-[#0d121f] border border-cyan-500/30 shadow-xl space-y-4">
      {/* 1. Header & Enable Switch */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-500 p-0.5 shadow-md shadow-cyan-500/30 flex items-center justify-center">
            <Palette className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-white">Gradient Maker 1/2/3/4</h3>
              <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 font-mono font-bold border border-cyan-400/30">
                ৪টি ইঞ্জিন
              </span>
            </div>
            <span className="text-[10px] text-slate-400 block">
              ছবিকে সরাসরি গ্রেডিয়েন্টে রূপান্তর ও লাইভ ব্লেন্ড করুন
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

      {/* 2. Mode Selector: Maker 1, 2, 3, 4 */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-slate-200">Select Maker Engine (গ্রেডিয়েন্ট ইঞ্জিন):</span>
          <span className="text-[9.5px] font-mono text-cyan-400">Mode {activeMode}</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          {GRADIENT_MAKER_MODES.map(item => {
            const isSelected = settings.enabled && activeMode === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onUpdate({ enabled: true, mode: item.id })}
                className={`p-2 rounded-xl text-left transition flex flex-col gap-0.5 border active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-b from-cyan-500/20 to-teal-500/10 border-cyan-400 text-white shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40'
                    : 'bg-dark-950/80 hover:bg-dark-900 border-white/5 hover:border-cyan-400/30 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm">{item.icon}</span>
                  <span
                    className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${
                      isSelected ? 'bg-cyan-400 text-dark-950' : 'bg-dark-900 text-slate-400'
                    }`}
                  >
                    #{item.id}
                  </span>
                </div>
                <span className="text-[10px] font-bold block truncate">{item.title}</span>
                <span className="text-[8.5px] text-slate-400 block truncate">{item.bangla}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Mode-Specific Controls */}
      <div className="p-3 rounded-xl bg-dark-950/90 border border-white/10 space-y-3">
        {/* Mode 1: 4-Corner Fluid Mesh Aurora */}
        {activeMode === '1' && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-cyan-300 block">
              4-Corner Mesh Color Pins (৪-কোণার রঙ)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Top-Left (উপর-বামে)', idx: 0 },
                { label: 'Top-Right (উপর-ডানে)', idx: 1 },
                { label: 'Bottom-Right (নিচে-ডানে)', idx: 2 },
                { label: 'Bottom-Left (নিচে-বামে)', idx: 3 },
              ].map(pin => (
                <div key={pin.idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-dark-900 border border-white/10">
                  <input
                    type="color"
                    value={settings.meshColors?.[pin.idx] || '#00d2ff'}
                    onChange={e => handleMeshColorChange(pin.idx, e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[9px] text-slate-400 block truncate">{pin.label}</span>
                    <span className="text-[9px] font-mono text-white font-bold uppercase">
                      {settings.meshColors?.[pin.idx]}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick 1-Click Harmonious 4-Color Palettes */}
            <div className="space-y-1.5 pt-1.5 border-t border-white/5">
              <span className="text-[10px] text-slate-400 font-medium block">
                Harmonious 4-Color Palettes (১-ক্লিক প্যালেট):
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { name: '⚡ Cyber Neon', colors: ['#00f0ff', '#7928ca', '#ff007f', '#ff7a00'] },
                  { name: '🌅 Sunset Gold', colors: ['#f12711', '#f5af19', '#ff007f', '#7928ca'] },
                  { name: '🌿 Emerald Wave', colors: ['#00f2fe', '#10b981', '#064e3b', '#00d2ff'] },
                  { name: '🔮 Ultra Violet', colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4'] },
                  { name: '🌌 Deep Space', colors: ['#050510', '#9d00ff', '#00f0ff', '#ff007f'] },
                  { name: '🌸 Rose Luxe', colors: ['#ff9a9e', '#fecfef', '#a1c4fd', '#f472b6'] },
                ].map(p => (
                  <button
                    key={p.name}
                    onClick={() => onUpdate({ meshColors: p.colors as any })}
                    className="p-1 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/40 transition flex flex-col gap-1 text-left"
                  >
                    <div className="flex h-2.5 w-full rounded overflow-hidden">
                      {p.colors.map((c, i) => (
                        <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <span className="text-[8.5px] font-medium text-slate-300 truncate w-full">{p.name}</span>
                  </button>
                ))}
              </div>

              {extractedPalette && extractedPalette.length >= 4 && (
                <button
                  onClick={() => onUpdate({ meshColors: [extractedPalette[0], extractedPalette[1], extractedPalette[2], extractedPalette[3]] as any })}
                  className="w-full mt-1 py-1.5 px-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Match Active Photo Palette (ছবির সাথে মেলান)</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mode 2: Radial Sunburst Halo Bloom */}
        {activeMode === '2' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-cyan-300">Radial Glow Color Stops</span>
              <button
                onClick={handleAddStop}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add Stop</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {(settings.stops || []).map(s => (
                <div key={s.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-dark-900 border border-white/10">
                  <input
                    type="color"
                    value={s.color}
                    onChange={e => handleUpdateStop(s.id, e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={s.position}
                    onChange={e => handleUpdateStop(s.id, undefined, Number(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer h-1.5"
                  />
                  <span className="text-[9.5px] font-mono text-slate-300 w-8 text-right">{s.position}%</span>
                  <button
                    onClick={() => handleRemoveStop(s.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                    disabled={(settings.stops || []).length <= 2}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode 3: Precision Multi-Stop Angle Flow */}
        {activeMode === '3' && (
          <div className="space-y-2.5">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>Linear Flow Angle (কোণ)</span>
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

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="font-bold text-cyan-300">Color Stops</span>
              <button
                onClick={handleAddStop}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Add Stop</span>
              </button>
            </div>

            <div className="space-y-1.5">
              {(settings.stops || []).map(s => (
                <div key={s.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-dark-900 border border-white/10">
                  <input
                    type="color"
                    value={s.color}
                    onChange={e => handleUpdateStop(s.id, e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={s.position}
                    onChange={e => handleUpdateStop(s.id, undefined, Number(e.target.value))}
                    className="flex-1 accent-cyan-400 cursor-pointer h-1.5"
                  />
                  <span className="text-[9.5px] font-mono text-slate-300 w-8 text-right">{s.position}%</span>
                  <button
                    onClick={() => handleRemoveStop(s.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5"
                    disabled={(settings.stops || []).length <= 2}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mode 4: Holographic Luminance Gradient Map */}
        {activeMode === '4' && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-cyan-300 block">
              6 Curated Gradient Maps (লুমিন্যান্স ম্যাপ প্যালেট):
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {(Object.keys(GRADIENT_MAP_PALETTES) as GradientMapPreset[]).map(key => {
                const item = GRADIENT_MAP_PALETTES[key];
                const isSelected = (settings.mapPalettePreset || 'cyberpunk') === key;
                const gradCss = `linear-gradient(90deg, ${item.colors.join(', ')})`;

                return (
                  <button
                    key={key}
                    onClick={() => onUpdate({ mapPalettePreset: key })}
                    className={`p-2 rounded-xl text-left transition border flex flex-col gap-1 active:scale-95 ${
                      isSelected
                        ? 'bg-dark-900 border-cyan-400 ring-1 ring-cyan-400/40 shadow-sm'
                        : 'bg-dark-950 hover:bg-dark-900 border-white/5'
                    }`}
                  >
                    <div className="w-full h-3.5 rounded-md border border-white/10" style={{ background: gradCss }} />
                    <div>
                      <span className="text-[10px] font-bold text-white block truncate">{item.name}</span>
                      <span className="text-[8.5px] text-slate-400 block truncate">{item.bangla}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Universal Sliders: Opacity, Blend Mode & Position */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex justify-between text-[11px] text-slate-300">
            <span>Gradient Opacity (ঘনত্ব)</span>
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

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* Position */}
            {activeMode !== '4' && (
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400">Position:</span>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => onUpdate({ position: 'overlay' })}
                    className={`px-2 py-1 rounded-lg text-[9.5px] font-medium transition text-center ${
                      settings.position !== 'background'
                        ? 'bg-cyan-400 text-dark-950 font-bold'
                        : 'bg-dark-900 text-slate-400 border border-white/5'
                    }`}
                  >
                    🎨 Overlay
                  </button>
                  <button
                    onClick={() => onUpdate({ position: 'background' })}
                    className={`px-2 py-1 rounded-lg text-[9.5px] font-medium transition text-center ${
                      settings.position === 'background'
                        ? 'bg-cyan-400 text-dark-950 font-bold'
                        : 'bg-dark-900 text-slate-400 border border-white/5'
                    }`}
                  >
                    🖼️ Background
                  </button>
                </div>
              </div>
            )}

            {/* Blend Mode */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400">Blend Mode:</span>
              <select
                value={settings.blendMode || 'overlay'}
                onChange={e => onUpdate({ blendMode: e.target.value as any })}
                className="w-full px-2 py-1 rounded-lg bg-dark-900 border border-white/15 text-white text-[10px] font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="normal">Normal</option>
                <option value="overlay">Overlay</option>
                <option value="screen">Screen</option>
                <option value="soft-light">Soft Light</option>
                <option value="multiply">Multiply</option>
                <option value="color-dodge">Color Dodge</option>
                <option value="luminosity">Luminosity</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
