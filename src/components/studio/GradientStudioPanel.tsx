import React, { useState } from 'react';
import {
  Palette,
  Wand2,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  Shuffle,
  ChevronDown,
  Layers,
  Check,
  ArrowRightLeft,
  Compass,
} from 'lucide-react';
import { FilterSettings, GradientType, ColorStop, ImageItem } from '../../types/studio';
import { extractPaletteFromImage } from '../../engine/colorExtractor';

interface GradientStudioPanelProps {
  settings: FilterSettings['gradient'];
  onUpdateSettings: (values: Partial<FilterSettings['gradient']>) => void;
  selectedImage: ImageItem | null;
}

// 12 Curated Aesthetic Designer Gradient Presets
export const DESIGNER_GRADIENTS = [
  {
    name: 'Cyberpunk Neon',
    type: 'linear' as GradientType,
    angle: 135,
    stops: [
      { id: 'p1', color: '#7928ca', position: 0 },
      { id: 'p2', color: '#ff0080', position: 50 },
      { id: 'p3', color: '#00dfd8', position: 100 },
    ],
    mesh: ['#7928ca', '#00dfd8', '#ff0080', '#10b981'] as [string, string, string, string],
  },
  {
    name: 'Sunset Bliss',
    type: 'linear' as GradientType,
    angle: 90,
    stops: [
      { id: 'p1', color: '#ff4b1f', position: 0 },
      { id: 'p2', color: '#ff9068', position: 50 },
      { id: 'p3', color: '#7928ca', position: 100 },
    ],
    mesh: ['#ff4b1f', '#ff9068', '#7928ca', '#ff0844'] as [string, string, string, string],
  },
  {
    name: 'Electric Aura',
    type: 'linear' as GradientType,
    angle: 45,
    stops: [
      { id: 'p1', color: '#00d2ff', position: 0 },
      { id: 'p2', color: '#9d00ff', position: 50 },
      { id: 'p3', color: '#ff007f', position: 100 },
    ],
    mesh: ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00'] as [string, string, string, string],
  },
  {
    name: 'Emerald Lagoon',
    type: 'linear' as GradientType,
    angle: 135,
    stops: [
      { id: 'p1', color: '#0ba360', position: 0 },
      { id: 'p2', color: '#3cba92', position: 50 },
      { id: 'p3', color: '#00f2fe', position: 100 },
    ],
    mesh: ['#0ba360', '#3cba92', '#00f2fe', '#11998e'] as [string, string, string, string],
  },
  {
    name: 'Cosmic Indigo',
    type: 'radial' as GradientType,
    angle: 0,
    stops: [
      { id: 'p1', color: '#302b63', position: 0 },
      { id: 'p2', color: '#0f0c29', position: 60 },
      { id: 'p3', color: '#24243e', position: 100 },
    ],
    mesh: ['#302b63', '#0f0c29', '#24243e', '#7928ca'] as [string, string, string, string],
  },
  {
    name: 'Golden Hour',
    type: 'linear' as GradientType,
    angle: 45,
    stops: [
      { id: 'p1', color: '#f12711', position: 0 },
      { id: 'p2', color: '#f5af19', position: 50 },
      { id: 'p3', color: '#ffea79', position: 100 },
    ],
    mesh: ['#f12711', '#f5af19', '#ffea79', '#ff8008'] as [string, string, string, string],
  },
  {
    name: 'Cotton Candy',
    type: 'linear' as GradientType,
    angle: 120,
    stops: [
      { id: 'p1', color: '#ff9a9e', position: 0 },
      { id: 'p2', color: '#fecfef', position: 50 },
      { id: 'p3', color: '#a1c4fd', position: 100 },
    ],
    mesh: ['#ff9a9e', '#fecfef', '#a1c4fd', '#c2e9fb'] as [string, string, string, string],
  },
  {
    name: 'Aurora Glow',
    type: 'linear' as GradientType,
    angle: 160,
    stops: [
      { id: 'p1', color: '#00c6ff', position: 0 },
      { id: 'p2', color: '#0072ff', position: 50 },
      { id: 'p3', color: '#00f2fe', position: 100 },
    ],
    mesh: ['#00c6ff', '#0072ff', '#00f2fe', '#0052d4'] as [string, string, string, string],
  },
  {
    name: 'Fire & Blood',
    type: 'linear' as GradientType,
    angle: 135,
    stops: [
      { id: 'p1', color: '#eb3349', position: 0 },
      { id: 'p2', color: '#f45c43', position: 100 },
    ],
    mesh: ['#eb3349', '#f45c43', '#d31027', '#ea384d'] as [string, string, string, string],
  },
  {
    name: 'Deep Ocean',
    type: 'linear' as GradientType,
    angle: 180,
    stops: [
      { id: 'p1', color: '#2b5876', position: 0 },
      { id: 'p2', color: '#4e4376', position: 100 },
    ],
    mesh: ['#2b5876', '#4e4376', '#141e30', '#243b55'] as [string, string, string, string],
  },
  {
    name: 'Mojito Mint',
    type: 'linear' as GradientType,
    angle: 90,
    stops: [
      { id: 'p1', color: '#1d976c', position: 0 },
      { id: 'p2', color: '#93f9b9', position: 100 },
    ],
    mesh: ['#1d976c', '#93f9b9', '#38ef7d', '#11998e'] as [string, string, string, string],
  },
  {
    name: 'Velvet Purpink',
    type: 'linear' as GradientType,
    angle: 45,
    stops: [
      { id: 'p1', color: '#654ea3', position: 0 },
      { id: 'p2', color: '#eaafc8', position: 100 },
    ],
    mesh: ['#654ea3', '#eaafc8', '#da22ff', '#9733ee'] as [string, string, string, string],
  },
];

export const GradientStudioPanel: React.FC<GradientStudioPanelProps> = ({
  settings,
  onUpdateSettings,
  selectedImage,
}) => {
  const [selectedStopId, setSelectedStopId] = useState<string | null>(settings.stops[0]?.id || null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [showPresets, setShowPresets] = useState(true);

  const selectedStop = settings.stops.find(s => s.id === selectedStopId) || settings.stops[0];

  // Color Stops sorting
  const sortedStops = [...settings.stops].sort((a, b) => a.position - b.position);

  // Gradient CSS preview for UI elements
  const gradientCssString =
    settings.type === 'mesh'
      ? `radial-gradient(circle at 20% 20%, ${settings.meshColors[0]}, transparent 60%), radial-gradient(circle at 80% 20%, ${settings.meshColors[1]}, transparent 60%), radial-gradient(circle at 80% 80%, ${settings.meshColors[2]}, transparent 60%), radial-gradient(circle at 20% 80%, ${settings.meshColors[3]}, transparent 60%)`
      : `linear-gradient(90deg, ${sortedStops.map(s => `${s.color} ${s.position}%`).join(', ')})`;

  // Add new color stop
  const handleAddStop = (posPercent: number = 50) => {
    const newId = `stop_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newStop: ColorStop = {
      id: newId,
      color: '#00f0ff',
      position: Math.round(posPercent),
    };
    const updated = [...settings.stops, newStop].sort((a, b) => a.position - b.position);
    onUpdateSettings({ stops: updated });
    setSelectedStopId(newId);
  };

  // Click on gradient bar to add stop at position
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, Math.round((clickX / rect.width) * 100)));
    handleAddStop(percent);
  };

  // Remove stop
  const handleRemoveStop = (id: string) => {
    if (settings.stops.length <= 2) return;
    const updated = settings.stops.filter(s => s.id !== id);
    onUpdateSettings({ stops: updated });
    if (selectedStopId === id) {
      setSelectedStopId(updated[0]?.id || null);
    }
  };

  // Update selected stop color or position
  const handleUpdateStop = (id: string, color?: string, position?: number) => {
    const updated = settings.stops.map(s => {
      if (s.id === id) {
        return {
          ...s,
          color: color !== undefined ? color : s.color,
          position: position !== undefined ? Math.max(0, Math.min(100, position)) : s.position,
        };
      }
      return s;
    });
    onUpdateSettings({ stops: updated });
  };

  // Invert / Reverse stops
  const handleReverseStops = () => {
    const reversed = [...settings.stops].map(s => ({
      ...s,
      position: 100 - s.position,
    })).sort((a, b) => a.position - b.position);
    onUpdateSettings({ stops: reversed });
  };

  // Randomize colors
  const handleRandomize = () => {
    const vibrantPalettes = [
      ['#ff007f', '#7928ca', '#00dfd8', '#ffef78'],
      ['#00f2fe', '#4facfe', '#000000', '#f093fb'],
      ['#f12711', '#f5af19', '#e0c3fc', '#8ec5fc'],
      ['#0ba360', '#3cba92', '#00c6ff', '#0072ff'],
      ['#654ea3', '#eaafc8', '#ff0844', '#ffb199'],
    ];
    const picked = vibrantPalettes[Math.floor(Math.random() * vibrantPalettes.length)];
    if (settings.type === 'mesh') {
      onUpdateSettings({
        meshColors: [picked[0], picked[1], picked[2], picked[3]] as [string, string, string, string],
      });
    } else {
      const stops: ColorStop[] = picked.map((color, idx) => ({
        id: `rnd_${idx}_${Date.now()}`,
        color,
        position: Math.round((idx / (picked.length - 1)) * 100),
      }));
      onUpdateSettings({ stops });
    }
  };

  // Extract colors from active image
  const handleExtractFromImage = async () => {
    if (!selectedImage) return;
    setIsExtracting(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedImage.originalUrl;
      await img.decode();
      const extracted = await extractPaletteFromImage(img, 4);
      if (extracted && extracted.length >= 3) {
        const stops: ColorStop[] = extracted.map((color, idx) => ({
          id: `ai_${idx}_${Date.now()}`,
          color,
          position: Math.round((idx / (extracted.length - 1)) * 100),
        }));
        onUpdateSettings({
          stops,
          meshColors: [extracted[0], extracted[1], extracted[2], extracted[3] || extracted[0]] as [string, string, string, string],
        });
      }
    } catch (e) {
      console.warn('Palette extraction failed:', e);
    } finally {
      setIsExtracting(false);
    }
  };

  // Apply a designer preset
  const handleApplyPreset = (preset: typeof DESIGNER_GRADIENTS[0]) => {
    onUpdateSettings({
      type: preset.type,
      angle: preset.angle,
      stops: preset.stops.map((s, i) => ({ ...s, id: `preset_${Date.now()}_${i}` })),
      meshColors: preset.mesh,
    });
  };

  return (
    <div className="space-y-3 pt-2 border-t border-white/5">
      {/* 1. Header: Title, Toggle & Layer Placement */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Palette className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Gradient Studio</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-400/20 text-cyan-300 font-bold border border-cyan-400/30">
            Pro
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Layer placement: Overlay vs Backdrop */}
          <select
            value={settings.position ?? 'overlay'}
            onChange={e => onUpdateSettings({ position: e.target.value as 'overlay' | 'background' })}
            className="bg-dark-900 border border-white/10 text-[10px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none focus:border-cyan-400 cursor-pointer"
            title="Layer placement relative to the uploaded image"
          >
            <option value="overlay">Overlay (On Top)</option>
            <option value="background">Backdrop (Behind)</option>
          </select>

          {/* Toggle Enable/Disable */}
          <button
            onClick={() => onUpdateSettings({ enabled: !settings.enabled })}
            className={`text-[10px] font-medium px-2 py-0.5 rounded transition ${
              settings.enabled
                ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                : 'bg-dark-800 text-slate-400 hover:text-white'
            }`}
          >
            {settings.enabled ? 'Enabled' : 'Off'}
          </button>
        </div>
      </div>

      {settings.enabled && (
        <div className="space-y-3 p-3 rounded-xl bg-dark-900/80 border border-white/10 shadow-md">
          {/* 2. Gradient Style Selector (Mesh, Linear, Radial, Conic) */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-medium">Gradient Type</span>
            <div className="grid grid-cols-4 gap-1 p-0.5 rounded-lg bg-dark-950 border border-white/5">
              {[
                { id: 'mesh', label: 'Mesh' },
                { id: 'linear', label: 'Linear' },
                { id: 'radial', label: 'Radial' },
                { id: 'conical', label: 'Conic' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => onUpdateSettings({ type: t.id as GradientType })}
                  className={`py-1 text-[10px] font-semibold rounded-md transition ${
                    settings.type === t.id
                      ? 'bg-cyan-400 text-dark-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Interactive Multi-Stop Track (For Linear, Radial, Conic) */}
          {settings.type !== 'mesh' ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Color Stops ({settings.stops.length})</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleReverseStops}
                    className="p-1 rounded bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white text-[10px] flex items-center gap-1 transition"
                    title="Reverse gradient colors"
                  >
                    <ArrowRightLeft className="w-3 h-3" />
                    <span>Flip</span>
                  </button>
                  <button
                    onClick={() => handleAddStop(50)}
                    className="px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 hover:bg-cyan-400/30 text-[10px] font-semibold flex items-center gap-1 transition"
                    title="Add new color stop"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Stop</span>
                  </button>
                </div>
              </div>

              {/* Interactive Gradient Bar */}
              <div
                onClick={handleBarClick}
                className="relative h-6 w-full rounded-lg cursor-crosshair border border-white/20 shadow-inner group overflow-hidden"
                style={{ background: gradientCssString }}
                title="Click anywhere on the bar to add a color stop"
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors pointer-events-none" />
              </div>

              {/* Color Stop Handles */}
              <div className="relative h-6 w-full px-1">
                {sortedStops.map(stop => {
                  const isSelected = selectedStop?.id === stop.id;
                  return (
                    <button
                      key={stop.id}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedStopId(stop.id);
                      }}
                      className={`absolute top-0 -translate-x-1/2 flex flex-col items-center group transition-transform ${
                        isSelected ? 'scale-125 z-20' : 'z-10 hover:scale-110'
                      }`}
                      style={{ left: `${stop.position}%` }}
                      title={`Stop at ${stop.position}% (${stop.color})`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full border-2 shadow-md ${
                          isSelected ? 'border-white ring-2 ring-cyan-400' : 'border-dark-900'
                        }`}
                        style={{ backgroundColor: stop.color }}
                      />
                    </button>
                  );
                })}
              </div>

              {/* Selected Stop Details Editor */}
              {selectedStop && (
                <div className="p-2 rounded-lg bg-dark-950 border border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer relative" title="Pick color">
                      <div
                        className="w-6 h-6 rounded-md border border-white/30 shadow"
                        style={{ backgroundColor: selectedStop.color }}
                      />
                      <input
                        type="color"
                        value={selectedStop.color}
                        onChange={e => handleUpdateStop(selectedStop.id, e.target.value)}
                        className="sr-only"
                      />
                    </label>
                    <span className="text-[11px] font-mono text-slate-200 uppercase">
                      {selectedStop.color}
                    </span>
                  </div>

                  {/* Position Slider */}
                  <div className="flex-1 flex items-center gap-2 max-w-[150px]">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedStop.position}
                      onChange={e => handleUpdateStop(selectedStop.id, undefined, Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                    <span className="text-[10px] font-mono text-cyan-400 w-7 text-right">
                      {selectedStop.position}%
                    </span>
                  </div>

                  {/* Delete stop */}
                  {settings.stops.length > 2 && (
                    <button
                      onClick={() => handleRemoveStop(selectedStop.id)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/20 transition"
                      title="Remove this color stop"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* 4. 4-Corner Mesh Interactive Pad */
            <div className="space-y-2">
              <span className="text-[11px] text-slate-400 font-medium">4-Corner Mesh Colors</span>
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-dark-950 border border-white/5 relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-40 pointer-events-none rounded-xl"
                  style={{ background: gradientCssString }}
                />

                {[
                  { label: 'Top Left', idx: 0 },
                  { label: 'Top Right', idx: 1 },
                  { label: 'Bottom Left', idx: 3 },
                  { label: 'Bottom Right', idx: 2 },
                ].map(corner => (
                  <div
                    key={corner.idx}
                    className="relative z-10 flex items-center justify-between p-1.5 rounded-lg bg-dark-900/80 border border-white/10"
                  >
                    <span className="text-[10px] text-slate-300 font-medium">{corner.label}</span>
                    <label className="cursor-pointer flex items-center gap-1.5" title={`Pick ${corner.label} color`}>
                      <span className="text-[10px] font-mono text-slate-400">
                        {settings.meshColors[corner.idx]}
                      </span>
                      <div
                        className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: settings.meshColors[corner.idx] }}
                      />
                      <input
                        type="color"
                        value={settings.meshColors[corner.idx]}
                        onChange={e => {
                          const updated = [...settings.meshColors] as [string, string, string, string];
                          updated[corner.idx] = e.target.value;
                          onUpdateSettings({ meshColors: updated });
                        }}
                        className="sr-only"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Direction Angle Controls (For Linear and Conical) */}
          {(settings.type === 'linear' || settings.type === 'conical') && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  <span>Rotation Angle</span>
                </span>
                <span className="font-mono text-cyan-400 font-bold">{settings.angle}°</span>
              </div>

              <input
                type="range"
                min="0"
                max="360"
                value={settings.angle}
                onChange={e => onUpdateSettings({ angle: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />

              {/* Quick Angle Chips */}
              <div className="grid grid-cols-6 gap-1 pt-0.5">
                {[0, 45, 90, 135, 180, 270].map(deg => (
                  <button
                    key={deg}
                    onClick={() => onUpdateSettings({ angle: deg })}
                    className={`py-0.5 rounded text-[10px] font-mono transition ${
                      settings.angle === deg
                        ? 'bg-cyan-400 text-dark-950 font-bold'
                        : 'bg-dark-950 hover:bg-dark-800 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 6. Opacity & Blend Mode Row */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
            {/* Opacity */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Opacity</span>
                <span className="font-mono text-cyan-400">{settings.opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.opacity}
                onChange={e => onUpdateSettings({ opacity: Number(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            {/* Blend Mode */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Blend Mode</span>
              </div>
              <select
                value={settings.blendMode}
                onChange={e => onUpdateSettings({ blendMode: e.target.value as any })}
                className="w-full bg-dark-950 border border-white/10 text-[10px] text-slate-300 rounded px-2 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                <option value="overlay">Overlay (Vibrant)</option>
                <option value="soft-light">Soft Light (Subtle)</option>
                <option value="multiply">Multiply (Darken)</option>
                <option value="screen">Screen (Glow)</option>
                <option value="normal">Normal (Solid)</option>
              </select>
            </div>
          </div>

          {/* 7. Action Helpers: AI Color Extractor & Randomize */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
            {selectedImage && (
              <button
                onClick={handleExtractFromImage}
                disabled={isExtracting}
                className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-cyan-500/20 hover:from-purple-500/30 hover:to-cyan-500/30 border border-cyan-400/30 text-cyan-300 text-[10px] font-semibold flex items-center justify-center gap-1.5 transition shadow-sm disabled:opacity-50"
                title="Automatically extract gradient colors matching active photo"
              >
                <Wand2 className={`w-3 h-3 ${isExtracting ? 'animate-spin' : ''}`} />
                <span>{isExtracting ? 'Extracting...' : 'AI Match Photo'}</span>
              </button>
            )}

            <button
              onClick={handleRandomize}
              className="py-1.5 px-2.5 rounded-lg bg-dark-950 hover:bg-dark-800 border border-white/10 text-slate-300 hover:text-white text-[10px] font-medium flex items-center gap-1 transition"
              title="Generate random harmonious colors"
            >
              <Shuffle className="w-3 h-3 text-cyan-400" />
              <span>Random</span>
            </button>
          </div>

          {/* 8. Curated Designer Presets Swatches */}
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Curated Designer Palettes</span>
              </span>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="text-[10px] text-cyan-400 hover:underline"
              >
                {showPresets ? 'Collapse' : 'Show (12)'}
              </button>
            </div>

            {showPresets && (
              <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                {DESIGNER_GRADIENTS.map(preset => {
                  const previewCss = `linear-gradient(135deg, ${preset.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset)}
                      className="group p-1 rounded-lg bg-dark-950 border border-white/5 hover:border-cyan-400/50 transition flex flex-col items-center gap-1 text-left"
                      title={preset.name}
                    >
                      <div
                        className="w-full h-5 rounded border border-white/10 shadow-sm group-hover:scale-105 transition-transform"
                        style={{ background: previewCss }}
                      />
                      <span className="text-[9px] text-slate-300 truncate w-full text-center group-hover:text-white">
                        {preset.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
