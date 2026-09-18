import React from 'react';
import { Sparkles, Check, Flame, ShieldCheck, Palette, Wand2 } from 'lucide-react';
import { CREATIVE_PRESETS } from '../../engine/presets';
import { Preset, FilterSettings } from '../../types/studio';

interface PresetsTabProps {
  currentSettings: FilterSettings;
  onSelectPreset: (preset: Preset) => void;
}

export const PresetsTab: React.FC<PresetsTabProps> = ({ onSelectPreset }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-amber" />
            Curated Global Presets
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            1-click creative stylings applied across your batch.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {CREATIVE_PRESETS.map(preset => {
          const stops = preset.settings.gradient?.stops || [
            { color: '#8b5cf6', position: 0 },
            { color: '#06b6d4', position: 100 },
          ];
          const gradStyle = `linear-gradient(135deg, ${stops.map(s => s.color).join(', ')})`;

          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className="w-full text-left p-3.5 rounded-xl glass-card glass-card-hover border border-white/5 transition group flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-6 h-6 rounded-lg shadow-sm group-hover:scale-110 transition-transform"
                    style={{ background: gradStyle }}
                  />
                  <span className="text-xs font-semibold text-white group-hover:text-brand-violet transition-colors">
                    {preset.name}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-violet/20 text-brand-violet border border-brand-violet/30">
                  {preset.badge}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>

              <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-[10px] text-slate-500">
                <span>Blur: {preset.settings.blur?.category}</span>
                <span>•</span>
                <span>Noise: {preset.settings.noise?.type}</span>
                <span>•</span>
                <span>Scale: {preset.settings.upscale?.factor}x</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
