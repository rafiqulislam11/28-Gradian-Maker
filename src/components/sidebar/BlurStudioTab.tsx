import React from 'react';
import { Eye, Sun, Layers, Sparkles, Orbit, SplitSquareVertical } from 'lucide-react';
import { FilterSettings, BlurCategory } from '../../types/studio';

interface BlurStudioTabProps {
  settings: FilterSettings['blur'];
  onUpdate: (values: Partial<FilterSettings['blur']>) => void;
}

export const BlurStudioTab: React.FC<BlurStudioTabProps> = ({ settings, onUpdate }) => {
  const categories: { id: BlurCategory; label: string; icon: any; desc: string }[] = [
    { id: 'linear', label: 'Linear Gradient', icon: SplitSquareVertical, desc: 'Directional gradient blur' },
    { id: 'radial', label: 'Radial Blur', icon: Orbit, desc: 'Focal center falloff' },
    { id: 'angular', label: 'Angular Blur', icon: Layers, desc: 'Rotational lens effect' },
    { id: 'mesh', label: 'Mesh / Freeform', icon: Sparkles, desc: 'Smooth diffused color field' },
    { id: 'glass', label: 'Glassmorphism', icon: Sun, desc: 'Frosted rim & chromatic aberration' },
    { id: 'tiltshift', label: 'Tilt-Shift DoF', icon: Eye, desc: 'Miniature depth-of-field band' },
  ];

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
          <span className="text-xs font-semibold text-white">Enable Blur Studio</span>
        </label>
      </div>

      {/* Blur Categories Selector */}
      <div>
        <label className="text-xs font-medium text-slate-300 block mb-2">Blur Category</label>
        <div className="grid grid-cols-2 gap-2">
          {categories.map(cat => {
            const Icon = cat.icon;
            const isSelected = settings.category === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onUpdate({ category: cat.id })}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col gap-1 ${
                  isSelected
                    ? 'border-brand-violet bg-brand-violet/15 text-white shadow-glow-violet/50'
                    : 'border-white/5 bg-dark-900/60 hover:border-white/15 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-brand-violet' : 'text-slate-400'}`} />
                  <span className="text-xs font-medium">{cat.label}</span>
                </div>
                <span className="text-[10px] text-slate-500 leading-tight line-clamp-1">{cat.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Radius Slider */}
      <div>
        <div className="flex justify-between text-xs text-slate-300 mb-1.5">
          <span>Blur Intensity (Radius)</span>
          <span className="font-mono text-brand-cyan">{settings.radius}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="60"
          value={settings.radius}
          onChange={e => onUpdate({ radius: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Category Specific Fine-Tuning */}
      {settings.category === 'glass' && (
        <div className="space-y-4 p-3.5 rounded-xl bg-dark-900/60 border border-white/5">
          <span className="text-xs font-semibold text-white block">Glass Optics & Sheen</span>
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Frosted Sheen</span>
              <span className="font-mono text-brand-violet">{settings.glassFrost}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.glassFrost}
              onChange={e => onUpdate({ glassFrost: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Specular Rim Light</span>
              <span className="font-mono text-brand-violet">{settings.glassSpecular}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.glassSpecular}
              onChange={e => onUpdate({ glassSpecular: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {settings.category === 'tiltshift' && (
        <div className="space-y-4 p-3.5 rounded-xl bg-dark-900/60 border border-white/5">
          <span className="text-xs font-semibold text-white block">Tilt-Shift Focal Zone</span>
          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Focal Center Position</span>
              <span className="font-mono text-brand-violet">{settings.tiltPosition}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              value={settings.tiltPosition}
              onChange={e => onUpdate({ tiltPosition: Number(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 mb-1.5">
              <span>Focal Band Width</span>
              <span className="font-mono text-brand-cyan">{settings.tiltWidth}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={settings.tiltWidth}
              onChange={e => onUpdate({ tiltWidth: Number(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      )}

      {settings.category === 'radial' && (
        <div className="p-3.5 rounded-xl bg-dark-900/60 border border-white/5">
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>Sharp Focal Size</span>
            <span className="font-mono text-brand-violet">{settings.focalSize}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="90"
            value={settings.focalSize}
            onChange={e => onUpdate({ focalSize: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      )}

      {(settings.category === 'linear' || settings.category === 'angular') && (
        <div className="p-3.5 rounded-xl bg-dark-900/60 border border-white/5">
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>Direction Angle</span>
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
    </div>
  );
};
