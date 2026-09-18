import React from 'react';
import { Sparkles, Maximize2, Zap, FileImage, ShieldCheck } from 'lucide-react';
import { FilterSettings, ExportFormat } from '../../types/studio';

interface UpscaleTabProps {
  settings: FilterSettings['upscale'];
  onUpdate: (values: Partial<FilterSettings['upscale']>) => void;
}

export const UpscaleTab: React.FC<UpscaleTabProps> = ({ settings, onUpdate }) => {
  const upscaleFactors: { factor: 1 | 2 | 4 | 8; label: string; badge: string; desc: string }[] = [
    { factor: 1, label: '1x Native', badge: 'Standard', desc: 'Original source resolution' },
    { factor: 2, label: '2K Crisp', badge: '2560x1440', desc: 'Sharpened high-density export' },
    { factor: 4, label: '4K Ultra', badge: '3840x2160', desc: 'Ultra-HD print & retina ready' },
    { factor: 8, label: '8K Studio Master', badge: '7680x4320', desc: 'Maximum fidelity bicubic upscale' },
  ];

  const formats: { id: ExportFormat; label: string; ext: string }[] = [
    { id: 'image/png', label: 'PNG', ext: '.png (Lossless)' },
    { id: 'image/jpeg', label: 'JPEG', ext: '.jpg (Fast)' },
    { id: 'image/webp', label: 'WebP', ext: '.webp (Compact)' },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Maximize2 className="w-4 h-4 text-brand-cyan" />
          AI Super-Resolution & Upscale
        </h4>
        <p className="text-xs text-slate-400 mt-0.5">
          Upscale bulk outputs to 2K, 4K, or 8K Studio resolution.
        </p>
      </div>

      {/* Factor Cards */}
      <div className="space-y-2">
        {upscaleFactors.map(f => {
          const isSelected = settings.factor === f.factor;

          return (
            <button
              key={f.factor}
              onClick={() => onUpdate({ factor: f.factor })}
              className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                isSelected
                  ? 'border-brand-cyan bg-brand-cyan/15 text-white shadow-glow-cyan/40'
                  : 'border-white/5 bg-dark-900/60 hover:border-white/15 text-slate-400'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">{f.label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                    {f.badge}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">{f.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sharpen Convolution Slider */}
      <div>
        <div className="flex justify-between text-xs text-slate-300 mb-1.5">
          <span>AI Unsharp Mask (Clarity)</span>
          <span className="font-mono text-brand-cyan">{settings.sharpen}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={settings.sharpen}
          onChange={e => onUpdate({ sharpen: Number(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Export Format */}
      <div>
        <label className="text-xs font-medium text-slate-300 block mb-2">Export File Format</label>
        <div className="grid grid-cols-3 gap-2">
          {formats.map(fmt => (
            <button
              key={fmt.id}
              onClick={() => onUpdate({ format: fmt.id })}
              className={`p-2.5 rounded-xl border text-center transition ${
                settings.format === fmt.id
                  ? 'border-brand-violet bg-brand-violet/20 text-white font-semibold'
                  : 'border-white/5 bg-dark-900/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-xs block">{fmt.label}</span>
              <span className="text-[9px] text-slate-500 block truncate">{fmt.ext.split(' ')[1]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Compression Quality */}
      {settings.format !== 'image/png' && (
        <div>
          <div className="flex justify-between text-xs text-slate-300 mb-1.5">
            <span>Compression Quality</span>
            <span className="font-mono text-brand-violet">
              {Math.round(settings.quality * 100)}%
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="1.0"
            step="0.01"
            value={settings.quality}
            onChange={e => onUpdate({ quality: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      )}
    </div>
  );
};
