import React from 'react';
import { Grid, Hexagon, Hash, Orbit, Compass, Box } from 'lucide-react';
import { FilterSettings, PatternType } from '../../types/studio';

interface PatternsTabProps {
  settings: FilterSettings['patterns'];
  onUpdate: (values: Partial<FilterSettings['patterns']>) => void;
}

export const PatternsTab: React.FC<PatternsTabProps> = ({ settings, onUpdate }) => {
  const patterns: { id: PatternType; label: string; icon: any; isFractal?: boolean }[] = [
    { id: 'none', label: 'Disabled', icon: Box },
    { id: 'grid', label: 'Tech Grid', icon: Grid },
    { id: 'dots', label: 'Halftone Dots', icon: Hash },
    { id: 'hexagons', label: 'Hexagon Mesh', icon: Hexagon },
    { id: 'isometric', label: 'Isometric Grid', icon: Compass },
    { id: 'mandelbrot', label: 'Mandelbrot Fractal', icon: Orbit, isFractal: true },
    { id: 'julia', label: 'Quantum Julia Set', icon: Orbit, isFractal: true },
  ];

  const blendModes = ['overlay', 'screen', 'normal', 'color-dodge'] as const;

  return (
    <div className="space-y-5">
      {/* Enable Toggle */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={e => onUpdate({ enabled: e.target.checked })}
            className="w-4 h-4 rounded text-brand-violet bg-dark-900 border-white/20 focus:ring-0"
          />
          <span className="text-xs font-semibold text-white">Enable Patterns & Fractals</span>
        </label>
      </div>

      {/* Pattern Style Selector */}
      <div>
        <label className="text-xs font-medium text-slate-300 block mb-2">Pattern Design</label>
        <div className="grid grid-cols-2 gap-1.5 bg-dark-900/80 p-1 rounded-xl border border-white/10">
          {patterns.map(p => {
            const Icon = p.icon;
            const isSelected = settings.type === p.id;

            return (
              <button
                key={p.id}
                onClick={() => onUpdate({ type: p.id, enabled: p.id !== 'none' })}
                className={`py-2 px-2.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-violet text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scale & Opacity */}
      {settings.type !== 'none' && (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>{settings.type.includes('fractal') || settings.type === 'mandelbrot' || settings.type === 'julia' ? 'Fractal Zoom' : 'Pattern Scale'}</span>
              <span className="font-mono text-brand-cyan">{settings.scale}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.scale}
              onChange={e => onUpdate({ scale: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Opacity</span>
              <span className="font-mono text-brand-violet">{settings.opacity}%</span>
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

          {/* Color Tint & Blend Mode */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900/60 border border-white/5">
            <span className="text-xs font-medium text-white">Pattern Overlay Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.color}
                onChange={e => onUpdate({ color: e.target.value })}
                className="w-7 h-7 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <span className="font-mono text-xs text-slate-300">{settings.color}</span>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-2">Blend Mode</label>
            <div className="grid grid-cols-2 gap-1.5 bg-dark-900/60 p-1 rounded-xl border border-white/5">
              {blendModes.map(mode => (
                <button
                  key={mode}
                  onClick={() => onUpdate({ blendMode: mode })}
                  className={`py-1.5 text-xs rounded-lg capitalize transition ${
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
      )}
    </div>
  );
};
