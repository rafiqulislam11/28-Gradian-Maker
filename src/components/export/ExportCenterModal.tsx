import React, { useState } from 'react';
import {
  Download,
  X,
  FileImage,
  FileCode,
  FileText,
  Sliders,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Project, ExportSettings } from '../../types/project';
import { exportProject } from '../../engine/export/exportEngine';

interface ExportCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
}

export const ExportCenterModal: React.FC<ExportCenterModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  const [settings, setSettings] = useState<ExportSettings>({
    format: 'png',
    scale: 2,
    quality: 0.95,
    transparent: false,
    backgroundColor: '#000000',
    filename: project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
    includeMetadata: true,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const targetW = project.width * settings.scale;
  const targetH = project.height * settings.scale;

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    try {
      await exportProject(project, settings);
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 2500);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Please check image memory.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-3xl bg-[#0e121d] border border-white/15 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-[#121624] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Export Center</h3>
              <p className="text-[11px] text-slate-400 font-mono">Multi-Resolution Master Export</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Format Selector */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1.5 font-bold uppercase">
              Export Format
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {[
                { id: 'png', label: 'PNG' },
                { id: 'jpg', label: 'JPG' },
                { id: 'webp', label: 'WebP' },
                { id: 'svg', label: 'SVG' },
                { id: 'pdf', label: 'PDF' },
                { id: 'json', label: 'JSON' },
              ].map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => setSettings(s => ({ ...s, format: fmt.id as any }))}
                  className={`py-1.5 rounded-xl font-bold font-mono transition ${
                    settings.format === fmt.id
                      ? 'bg-cyan-500 text-dark-950 shadow-md'
                      : 'bg-dark-950 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Resolution Super-Sampling Scale */}
          {settings.format !== 'json' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-mono text-slate-400 font-bold uppercase">
                  Resolution Scale
                </label>
                <span className="font-mono text-cyan-300 font-bold">
                  {targetW} × {targetH} px ({settings.scale}x)
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { s: 1, label: '1x Native' },
                  { s: 2, label: '2x (2K Crisp)' },
                  { s: 4, label: '4x (4K Ultra)' },
                  { s: 8, label: '8x (8K Studio)' },
                ].map(item => (
                  <button
                    key={item.s}
                    onClick={() => setSettings(st => ({ ...st, scale: item.s as any }))}
                    className={`py-2 px-1 rounded-xl text-center font-mono font-bold transition ${
                      settings.scale === item.s
                        ? 'bg-gradient-to-r from-cyan-500 to-indigo-500 text-white shadow-md'
                        : 'bg-dark-950 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    <span className="block text-xs">{item.s}x</span>
                    <span className="text-[9px] opacity-70 block font-normal">{item.label.split(' ')[1]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quality Slider for JPG/WebP */}
          {(settings.format === 'jpg' || settings.format === 'webp') && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-slate-400">Quality Compression</label>
                <span className="font-mono text-cyan-300 font-bold">{Math.round(settings.quality * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.0"
                step="0.05"
                value={settings.quality}
                onChange={e => setSettings(s => ({ ...s, quality: Number(e.target.value) }))}
                className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          )}

          {/* Transparency Toggle (PNG/WebP/SVG) */}
          {(settings.format === 'png' || settings.format === 'webp' || settings.format === 'svg') && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-dark-950 border border-white/10">
              <span className="font-semibold text-slate-200">Transparent Background</span>
              <input
                type="checkbox"
                checked={settings.transparent}
                onChange={e => setSettings(s => ({ ...s, transparent: e.target.checked }))}
                className="w-4 h-4 rounded text-cyan-400 accent-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {/* Filename Input */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">Output Filename</label>
            <input
              type="text"
              value={settings.filename}
              onChange={e => setSettings(s => ({ ...s, filename: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-white/10 bg-[#121624] flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-slate-500">
            {project.layers.length} Layers • Non-Destructive Master
          </span>

          <button
            onClick={handleExport}
            disabled={isExporting}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white font-black text-xs uppercase tracking-wide shadow-lg shadow-cyan-500/25 hover:brightness-110 flex items-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            {isExporting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : exportSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isExporting ? 'Rendering...' : exportSuccess ? 'Exported!' : 'Export Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
