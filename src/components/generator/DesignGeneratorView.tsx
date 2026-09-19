import React, { useState, useRef, useCallback } from 'react';
import {
  Sparkles,
  Zap,
  Heart,
  Edit3,
  Download,
  Trash2,
  Play,
  Square,
  Sliders,
  CheckSquare,
  FileArchive,
  RefreshCw,
  Eye,
  X,
  Layers,
} from 'lucide-react';
import { Project, GeneratorSettings } from '../../types/project';
import {
  DesignGeneratorEngine,
  GeneratedDesign,
  GenerationProgress,
} from '../../engine/generator/designGeneratorEngine';
import { exportBatchProjectsAsZip } from '../../engine/export/exportEngine';

interface DesignGeneratorViewProps {
  currentProject: Project;
  onEditInStudio: (project: Project) => void;
}

export const DesignGeneratorView: React.FC<DesignGeneratorViewProps> = ({
  currentProject,
  onEditInStudio,
}) => {
  const [designs, setDesigns] = useState<GeneratedDesign[]>([]);
  const [filterFavorites, setFilterFavorites] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [previewDesign, setPreviewDesign] = useState<GeneratedDesign | null>(null);

  const [progress, setProgress] = useState<GenerationProgress>({
    current: 0,
    total: 0,
    percent: 0,
    isComplete: false,
    estimatedRemainingSec: 0,
  });

  const [settings, setSettings] = useState<GeneratorSettings>({
    count: 24,
    variationStrength: 65,
    allowColors: true,
    allowGradient: true,
    allowPattern: true,
    allowPatternScale: true,
    allowRotation: true,
    allowBlur: true,
    allowNoise: true,
    allowGlow: true,
    allowImagePos: false,
    allowImageScale: false,
    allowEffects: true,
    allowBlendModes: true,
  });

  const engineRef = useRef<DesignGeneratorEngine | null>(null);

  const handleStartGeneration = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    const engine = new DesignGeneratorEngine();
    engineRef.current = engine;

    const accumulated: GeneratedDesign[] = [];

    try {
      await engine.generateDesigns(currentProject, settings, (p, batch) => {
        setProgress(p);
        accumulated.push(...batch);
        setDesigns([...accumulated]);
      });
    } catch (err) {
      console.error('Generation interrupted:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCancelGeneration = () => {
    if (engineRef.current) {
      engineRef.current.cancel();
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (id: string) => {
    setDesigns(prev => prev.map(d => (d.id === id ? { ...d, isFavorite: !d.isFavorite } : d)));
  };

  const removeDesign = (id: string) => {
    setDesigns(prev => prev.filter(d => d.id !== id));
  };

  const handleExportZip = async () => {
    const targets = filterFavorites ? designs.filter(d => d.isFavorite) : designs;
    if (targets.length === 0) return;

    setIsExportingZip(true);
    try {
      await exportBatchProjectsAsZip(
        targets.map(t => t.project),
        `gradient-x-variations-${targets.length}-pack.zip`,
        1
      );
    } catch (err) {
      console.error('ZIP export failed:', err);
    } finally {
      setIsExportingZip(false);
    }
  };

  const displayedDesigns = filterFavorites ? designs.filter(d => d.isFavorite) : designs;

  return (
    <div className="flex-1 flex overflow-hidden rounded-2xl bg-[#0c0f1a] border border-white/10 shadow-2xl min-h-0">
      {/* 1. LEFT CONFIGURATION DRAWER */}
      <div className="w-80 xl:w-96 p-4 border-r border-white/10 bg-[#0f1422] flex flex-col justify-between overflow-y-auto shrink-0 select-none custom-scrollbar">
        <div className="space-y-4">
          {/* Brand Header */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">1000 Design Generator</h3>
              <p className="text-[10px] text-slate-400 font-mono">Progressive Multi-Core Synthesis</p>
            </div>
          </div>

          {/* Quick Count Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-200">Target Outputs</label>
              <span className="text-xs font-mono text-cyan-300 font-bold">{settings.count} Variations</span>
            </div>
            <div className="grid grid-cols-5 gap-1 mb-2">
              {[12, 24, 50, 100, 250].map(c => (
                <button
                  key={c}
                  onClick={() => setSettings(s => ({ ...s, count: c }))}
                  className={`py-1 rounded-lg text-xs font-mono font-bold transition ${
                    settings.count === c
                      ? 'bg-cyan-500 text-dark-950 shadow-md'
                      : 'bg-dark-950 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            <input
              type="range"
              min="1"
              max="1000"
              value={settings.count}
              onChange={e => setSettings(s => ({ ...s, count: Number(e.target.value) }))}
              className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Variation Strength */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-200">Variation Strength</label>
              <span className="text-xs font-mono text-cyan-300 font-bold">{settings.variationStrength}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="100"
              value={settings.variationStrength}
              onChange={e => setSettings(s => ({ ...s, variationStrength: Number(e.target.value) }))}
              className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Independent Parameter Toggles */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
              Varying Parameters
            </span>
            <div className="space-y-1.5 text-xs text-slate-300">
              {[
                { key: 'allowColors', label: 'Colors & Harmonious Palettes' },
                { key: 'allowGradient', label: 'Gradients & Stop Angles' },
                { key: 'allowPattern', label: '500+ Pattern Synthesis' },
                { key: 'allowPatternScale', label: 'Pattern Scale & Stroke' },
                { key: 'allowRotation', label: 'Layer Rotations' },
                { key: 'allowBlur', label: 'Optical Blurs' },
                { key: 'allowNoise', label: '35mm Film Grain' },
                { key: 'allowGlow', label: 'Glow & Neon Blooms' },
                { key: 'allowBlendModes', label: 'Composite Blend Modes' },
              ].map(opt => (
                <label key={opt.key} className="flex items-center gap-2 cursor-pointer hover:text-white transition">
                  <input
                    type="checkbox"
                    checked={(settings as any)[opt.key]}
                    onChange={e => setSettings(s => ({ ...s, [opt.key]: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-400 accent-cyan-400 cursor-pointer"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          {isGenerating ? (
            <button
              onClick={handleCancelGeneration}
              className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Cancel Generation</span>
            </button>
          ) : (
            <button
              onClick={handleStartGeneration}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 text-dark-950 font-black text-xs uppercase tracking-wider shadow-xl shadow-cyan-500/25 hover:brightness-110 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Generate {settings.count} Variations</span>
            </button>
          )}

          {designs.length > 0 && (
            <button
              onClick={handleExportZip}
              disabled={isExportingZip}
              className="w-full py-2 rounded-xl bg-dark-950 hover:bg-dark-800 text-slate-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <FileArchive className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isExportingZip ? 'Packaging ZIP...' : `Download ${displayedDesigns.length} as ZIP`}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. RIGHT MAIN GALLERY VIEW */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#070912] overflow-hidden">
        {/* Gallery Top Filter Bar */}
        <div className="p-3 border-b border-white/10 bg-[#0e121d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-white">
              Generated Gallery ({designs.length})
            </span>
            <div className="flex items-center p-0.5 rounded-xl bg-dark-950 border border-white/10">
              <button
                onClick={() => setFilterFavorites(false)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                  !filterFavorites ? 'bg-cyan-500 text-dark-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({designs.length})
              </button>
              <button
                onClick={() => setFilterFavorites(true)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                  filterFavorites ? 'bg-cyan-500 text-dark-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Heart className="w-3 h-3 text-rose-400 fill-current" />
                <span>Favorites ({designs.filter(d => d.isFavorite).length})</span>
              </button>
            </div>
          </div>

          {/* Live Progress HUD if running */}
          {isGenerating && (
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-cyan-400 font-bold">
                {progress.current} / {progress.total} ({progress.percent}%)
              </span>
              <div className="w-24 h-2 bg-dark-950 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-cyan-400 transition-all duration-100"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              <span className="text-slate-500">~{progress.estimatedRemainingSec}s left</span>
            </div>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {displayedDesigns.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white mb-1">No Designs Generated Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mb-6">
                Click &quot;Generate Variations&quot; to synthesize unique procedural variations of your active design recipe in real-time.
              </p>
              <button
                onClick={handleStartGeneration}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-dark-950 font-bold text-xs shadow-lg shadow-cyan-500/25 hover:bg-cyan-400 transition"
              >
                Start Generating Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
              {displayedDesigns.map(design => (
                <div
                  key={design.id}
                  className="group relative rounded-xl bg-[#0f1422] border border-white/10 overflow-hidden shadow-lg hover:border-cyan-400/50 transition-all hover:shadow-xl hover:shadow-cyan-950/30 flex flex-col"
                >
                  {/* Thumbnail Image */}
                  <div
                    onClick={() => setPreviewDesign(design)}
                    className="relative aspect-video bg-dark-950 cursor-pointer overflow-hidden flex items-center justify-center"
                  >
                    <img
                      src={design.thumbnailUrl}
                      alt={`Variation ${design.index}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Hover Overlay Buttons */}
                    <div className="absolute inset-0 bg-dark-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setPreviewDesign(design);
                        }}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white backdrop-blur-md shadow-md transition"
                        title="View Fullscreen"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onEditInStudio(design.project);
                        }}
                        className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold shadow-md transition"
                        title="Open & Edit in Studio Pro"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Favorite Heart Button */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(design.id);
                      }}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-dark-950/80 backdrop-blur-md border border-white/10 text-slate-400 hover:text-rose-400 transition"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${design.isFavorite ? 'text-rose-400 fill-current' : ''}`}
                      />
                    </button>
                  </div>

                  {/* Card Info Footer */}
                  <div className="p-2 bg-[#121727] flex items-center justify-between text-[11px] font-mono border-t border-white/5">
                    <span className="text-slate-300 font-bold truncate">Var #{design.index}</span>
                    <button
                      onClick={() => removeDesign(design.id)}
                      className="text-slate-500 hover:text-rose-400 transition p-0.5"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Preview Modal */}
      {previewDesign && (
        <div
          onClick={() => setPreviewDesign(null)}
          className="fixed inset-0 z-50 bg-dark-950/90 backdrop-blur-2xl flex items-center justify-center p-6"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] rounded-2xl bg-[#0f1422] border border-white/15 p-4 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <span className="text-sm font-bold text-white">Variation #{previewDesign.index}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onEditInStudio(previewDesign.project);
                    setPreviewDesign(null);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500 text-dark-950 font-bold text-xs shadow-md hover:bg-cyan-400 transition"
                >
                  Edit in Studio Pro
                </button>
                <button
                  onClick={() => setPreviewDesign(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex items-center justify-center rounded-xl bg-dark-950">
              <img
                src={previewDesign.thumbnailUrl}
                alt="Preview"
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
