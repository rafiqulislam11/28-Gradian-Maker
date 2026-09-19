import React, { useState } from 'react';
import { X, Dices, Sparkles, CheckSquare, Square, RefreshCw } from 'lucide-react';
import { Project, GeneratorSettings } from '../../types/project';
import { createProjectVariation } from '../../engine/generator/designGeneratorEngine';

interface ControlledRandomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProject: Project;
  onApplyProject: (project: Project) => void;
}

export const ControlledRandomizeModal: React.FC<ControlledRandomizeModalProps> = ({
  isOpen,
  onClose,
  currentProject,
  onApplyProject,
}) => {
  const [strength, setStrength] = useState<number>(70);
  const [params, setParams] = useState({
    colors: true,
    gradient: true,
    pattern: true,
    patternScale: true,
    rotation: true,
    blur: true,
    noise: true,
    glow: true,
    imagePos: false,
    blendModes: true,
  });

  if (!isOpen) return null;

  const handleRandomize = () => {
    const settings: GeneratorSettings = {
      count: 1,
      variationStrength: strength,
      allowColors: params.colors,
      allowGradient: params.gradient,
      allowPattern: params.pattern,
      allowPatternScale: params.patternScale,
      allowRotation: params.rotation,
      allowBlur: params.blur,
      allowNoise: params.noise,
      allowGlow: params.glow,
      allowImagePos: params.imagePos,
      allowImageScale: false,
      allowEffects: true,
      allowBlendModes: params.blendModes,
    };

    const randomized = createProjectVariation(currentProject, settings, 0);
    onApplyProject(randomized);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-[#0e121d] border border-white/15 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#121624] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Controlled Randomize</h3>
              <p className="text-[11px] text-slate-400 font-mono">Selective Inspiration Engine</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Strength */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-200">Randomization Strength</label>
              <span className="font-mono text-cyan-300 font-bold">{strength}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={strength}
              onChange={e => setStrength(Number(e.target.value))}
              className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          {/* Checklist */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
              Parameters Allowed to Vary
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              {[
                { key: 'colors', label: 'Colors & Palettes' },
                { key: 'gradient', label: 'Gradients' },
                { key: 'pattern', label: 'Pattern Geometry' },
                { key: 'patternScale', label: 'Pattern Scale' },
                { key: 'rotation', label: 'Layer Angles' },
                { key: 'blur', label: 'Optical Blur' },
                { key: 'noise', label: 'Film Grain' },
                { key: 'glow', label: 'Neon Glow' },
                { key: 'blendModes', label: 'Blend Modes' },
                { key: 'imagePos', label: 'Image Offset' },
              ].map(item => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 p-2 rounded-xl bg-dark-950 border border-white/5 hover:border-white/10 cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={(params as any)[item.key]}
                    onChange={e => setParams(p => ({ ...p, [item.key]: e.target.checked }))}
                    className="w-4 h-4 rounded text-cyan-400 accent-cyan-400 cursor-pointer"
                  />
                  <span className="text-[11px] font-medium text-slate-200 truncate">{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#121624] flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={handleRandomize}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs uppercase tracking-wide shadow-lg shadow-rose-500/25 hover:brightness-110 flex items-center gap-2 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Randomize Design</span>
          </button>
        </div>
      </div>
    </div>
  );
};
