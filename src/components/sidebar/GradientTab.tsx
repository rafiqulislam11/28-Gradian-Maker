import React from 'react';
import { Palette, Wand2, Plus, Trash2, Compass, Layers, Sliders } from 'lucide-react';
import { FilterSettings, GradientType, ColorStop } from '../../types/studio';

interface GradientTabProps {
  settings: FilterSettings['gradient'];
  onUpdate: (values: Partial<FilterSettings['gradient']>) => void;
  onExtractPalette: () => void;
  extractedPalette?: string[];
}

export const GradientTab: React.FC<GradientTabProps> = ({
  settings,
  onUpdate,
  onExtractPalette,
  extractedPalette,
}) => {
  const gradientTypes: { id: GradientType; label: string }[] = [
    { id: 'linear', label: 'Linear' },
    { id: 'radial', label: 'Radial' },
    { id: 'conical', label: 'Conical' },
    { id: 'mesh', label: '4-Point Mesh' },
  ];

  const blendModes = ['normal', 'overlay', 'soft-light', 'screen', 'multiply'] as const;

  const handleAddStop = () => {
    const newId = String(Date.now());
    const newStop: ColorStop = {
      id: newId,
      color: '#06b6d4',
      position: 50,
    };
    onUpdate({
      stops: [...settings.stops, newStop].sort((a, b) => a.position - b.position),
    });
  };

  const handleRemoveStop = (id: string) => {
    if (settings.stops.length <= 2) return;
    onUpdate({
      stops: settings.stops.filter(s => s.id !== id),
    });
  };

  const handleUpdateStop = (id: string, color?: string, position?: number) => {
    onUpdate({
      stops: settings.stops
        .map(s => (s.id === id ? { ...s, color: color ?? s.color, position: position ?? s.position } : s))
        .sort((a, b) => a.position - b.position),
    });
  };

  const handleMeshColorChange = (index: number, color: string) => {
    const updated = [...settings.meshColors] as [string, string, string, string];
    updated[index] = color;
    onUpdate({ meshColors: updated });
  };

  const stopsGradient = `linear-gradient(90deg, ${settings.stops.map(s => `${s.color} ${s.position}%`).join(', ')})`;

  return (
    <div className="space-y-5">
      {/* Enable Toggle & Extract AI Palette */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={e => onUpdate({ enabled: e.target.checked })}
            className="w-4 h-4 rounded text-brand-violet bg-dark-900 border-white/20 focus:ring-0"
          />
          <span className="text-xs font-semibold text-white">Enable Gradient Layer</span>
        </label>

        <button
          onClick={onExtractPalette}
          className="px-2.5 py-1.5 rounded-lg bg-brand-violet/20 hover:bg-brand-violet/30 text-brand-violet border border-brand-violet/30 text-xs font-medium flex items-center gap-1.5 transition"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>Extract From Image</span>
        </button>
      </div>

      {/* Extracted Palette Swatches */}
      {extractedPalette && extractedPalette.length > 0 && (
        <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 space-y-2">
          <span className="text-[11px] font-medium text-slate-400">Extracted Image Palette:</span>
          <div className="flex items-center gap-1.5">
            {extractedPalette.map((col, idx) => (
              <button
                key={idx}
                onClick={() => {
                  // Add stop with this color
                  onUpdate({
                    stops: [...settings.stops, { id: String(Date.now()), color: col, position: 50 }],
                  });
                }}
                className="flex-1 h-7 rounded-lg transition-transform hover:scale-110 relative group border border-white/10"
                style={{ backgroundColor: col }}
                title={`Click to add ${col}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Gradient Type Selector */}
      <div>
        <label className="text-xs font-medium text-slate-300 block mb-2">Gradient Style</label>
        <div className="grid grid-cols-2 gap-1.5 bg-dark-900/80 p-1 rounded-xl border border-white/10">
          {gradientTypes.map(t => (
            <button
              key={t.id}
              onClick={() => onUpdate({ type: t.id })}
              className={`py-1.5 text-xs font-medium rounded-lg transition ${
                settings.type === t.id
                  ? 'bg-brand-violet text-white shadow-glow-violet'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders: Opacity & Angle */}
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>Opacity</span>
            <span className="font-mono text-brand-cyan">{settings.opacity}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.opacity}
            onChange={e => onUpdate({ opacity: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {settings.type !== 'mesh' && settings.type !== 'radial' && (
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Angle</span>
              <span className="font-mono text-brand-violet">{settings.angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={settings.angle}
              onChange={e => onUpdate({ angle: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        )}

        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>Blend Mode</span>
            <span className="font-mono text-slate-400 uppercase">{settings.blendMode}</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-dark-900/60 p-1 rounded-xl border border-white/5">
            {blendModes.map(mode => (
              <button
                key={mode}
                onClick={() => onUpdate({ blendMode: mode })}
                className={`py-1 text-[11px] rounded-lg capitalize transition ${
                  settings.blendMode === mode
                    ? 'bg-white/15 text-white font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mesh 4-Corner Editor OR Stops Editor */}
      {settings.type === 'mesh' ? (
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 block">4-Corner Mesh Colors</label>
          <div className="grid grid-cols-2 gap-2">
            {(['Top-Left', 'Top-Right', 'Bottom-Right', 'Bottom-Left'] as const).map((label, idx) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-dark-900/80 border border-white/5">
                <input
                  type="color"
                  value={settings.meshColors[idx]}
                  onChange={e => handleMeshColorChange(idx, e.target.value)}
                  className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <div className="text-[11px]">
                  <span className="text-slate-400 block">{label}</span>
                  <span className="font-mono text-white text-[10px]">{settings.meshColors[idx]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-300">Color Stops</label>
            <button
              onClick={handleAddStop}
              className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Add Stop
            </button>
          </div>

          {/* Visual gradient bar */}
          <div
            className="w-full h-4 rounded-lg border border-white/10 shadow-inner"
            style={{ background: stopsGradient }}
          />

          {/* Stops List */}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {settings.stops.map(s => (
              <div
                key={s.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-dark-900/60 border border-white/5"
              >
                <input
                  type="color"
                  value={s.color}
                  onChange={e => handleUpdateStop(s.id, e.target.value)}
                  className="w-6 h-6 rounded-md bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={s.position}
                  onChange={e => handleUpdateStop(s.id, undefined, Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-[10px] font-mono text-slate-400 w-8 text-right">
                  {s.position}%
                </span>
                {settings.stops.length > 2 && (
                  <button
                    onClick={() => handleRemoveStop(s.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
