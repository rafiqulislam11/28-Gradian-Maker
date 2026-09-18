import React from 'react';
import { Sparkles, Disc, Radio, Tv } from 'lucide-react';
import { FilterSettings, NoiseType } from '../../types/studio';

interface GrainNoiseTabProps {
  settings: FilterSettings['noise'];
  onUpdate: (values: Partial<FilterSettings['noise']>) => void;
}

export const GrainNoiseTab: React.FC<GrainNoiseTabProps> = ({ settings, onUpdate }) => {
  const noiseTypes: { id: NoiseType; label: string; icon: any; desc: string }[] = [
    { id: 'film', label: '35mm Film Grain', icon: Disc, desc: 'Organic analogue grain texture' },
    { id: 'retro', label: 'Retro Textures', icon: Radio, desc: 'Vintage grain & dust flecks' },
    { id: 'digital', label: 'Digital Noise', icon: Tv, desc: 'Uniform sensor noise' },
  ];

  const blendModes = ['overlay', 'soft-light', 'screen', 'hard-light'] as const;

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
          <span className="text-xs font-semibold text-white">Enable Noise & Grain</span>
        </label>
      </div>

      {/* Noise Texture Type */}
      <div>
        <label className="text-xs font-medium text-slate-300 block mb-2">Grain Aesthetic</label>
        <div className="space-y-2">
          {noiseTypes.map(t => {
            const Icon = t.icon;
            const isSelected = settings.type === t.id;

            return (
              <button
                key={t.id}
                onClick={() => onUpdate({ type: t.id })}
                className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                  isSelected
                    ? 'border-brand-violet bg-brand-violet/15 text-white shadow-glow-violet/40'
                    : 'border-white/5 bg-dark-900/60 hover:border-white/15 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-brand-violet' : 'text-slate-500'}`} />
                  <div>
                    <span className="text-xs font-medium block">{t.label}</span>
                    <span className="text-[10px] text-slate-500">{t.desc}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Intensity Slider */}
      <div>
        <div className="flex justify-between text-xs text-slate-300 mb-1.5">
          <span>Grain Density</span>
          <span className="font-mono text-brand-cyan">{settings.amount}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.amount}
          onChange={e => onUpdate({ amount: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Monochrome Switch */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-dark-900/60 border border-white/5">
        <div>
          <span className="text-xs font-medium text-white block">Monochrome Grain</span>
          <span className="text-[10px] text-slate-500">Disable RGB chromatic grain noise</span>
        </div>
        <input
          type="checkbox"
          checked={settings.monochrome}
          onChange={e => onUpdate({ monochrome: e.target.checked })}
          className="w-4 h-4 rounded text-brand-violet bg-dark-900 border-white/20 focus:ring-0 cursor-pointer"
        />
      </div>

      {/* Blend Mode */}
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
  );
};
