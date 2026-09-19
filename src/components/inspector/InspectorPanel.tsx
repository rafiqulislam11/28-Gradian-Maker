import React, { useState } from 'react';
import {
  Sliders,
  Move,
  RotateCw,
  Maximize2,
  FlipHorizontal,
  FlipVertical,
  AlignCenter,
  RotateCcw,
  Palette,
  Grid,
  Type,
  Square,
  Sparkles,
  Sun,
  Disc,
  Flame,
  Shield,
  Plus,
  Trash2,
  Shuffle,
  Eye,
} from 'lucide-react';
import {
  Layer,
  ImageLayer,
  GradientLayer,
  PatternLayer,
  ShapeLayer,
  TextLayer,
  BlurLayer,
  GlassLayer,
  NoiseLayer,
  GlowLayer,
  Transform,
  ExtendedGradientType,
} from '../../types/project';

interface InspectorPanelProps {
  activeLayer: Layer | null;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onUpdateTransform: (id: string, updates: Partial<Transform>) => void;
  onCenterLayer: (id: string) => void;
  onFlipH: (id: string) => void;
  onFlipV: (id: string) => void;
  onResetTransform: (id: string) => void;
  onOpenPatternModal: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  activeLayer,
  onUpdateLayer,
  onUpdateTransform,
  onCenterLayer,
  onFlipH,
  onFlipV,
  onResetTransform,
  onOpenPatternModal,
}) => {
  const [activeTab, setActiveTab] = useState<'properties' | 'adjustments' | 'transform' | 'mask'>('properties');

  if (!activeLayer) {
    return (
      <div className="w-full lg:w-[340px] xl:w-[370px] shrink-0 h-full flex flex-col items-center justify-center p-8 text-center rounded-2xl bg-[#0d111c]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
          <Sliders className="w-6 h-6 text-slate-500" />
        </div>
        <h4 className="text-sm font-bold text-slate-300 mb-1">No Layer Selected</h4>
        <p className="text-xs text-slate-500 max-w-xs">
          Select a layer from the Layers panel or click an element on the canvas to inspect and edit its properties.
        </p>
      </div>
    );
  }

  const tf = activeLayer.transform;

  return (
    <div className="w-full lg:w-[340px] xl:w-[370px] shrink-0 h-full flex flex-col rounded-2xl bg-[#0d111c]/95 border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden select-none min-h-0">
      {/* 1. Header with Layer Info & Sub-Tabs */}
      <div className="p-3 border-b border-white/10 bg-[#121624] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {activeLayer.type}
            </span>
            <h3 className="text-xs font-bold text-white truncate">{activeLayer.name}</h3>
          </div>

          <button
            onClick={() => onResetTransform(activeLayer.id)}
            className="p-1 rounded bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-rose-400 border border-white/5 text-[10px] font-mono flex items-center gap-1 transition"
            title="Reset Transform"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>

        {/* Sub-Tabs: Properties, Adjustments (if image), Transform, Mask */}
        <div className="flex items-center p-0.5 rounded-xl bg-dark-950 border border-white/10">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'properties' ? 'bg-cyan-500 text-dark-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Properties
          </button>
          {activeLayer.type === 'image' && (
            <button
              onClick={() => setActiveTab('adjustments')}
              className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
                activeTab === 'adjustments' ? 'bg-cyan-500 text-dark-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Grading
            </button>
          )}
          <button
            onClick={() => setActiveTab('transform')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'transform' ? 'bg-cyan-500 text-dark-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Transform
          </button>
          <button
            onClick={() => setActiveTab('mask')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition ${
              activeTab === 'mask' ? 'bg-cyan-500 text-dark-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mask
          </button>
        </div>
      </div>

      {/* 2. Scrollable Inspector Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 min-h-0 custom-scrollbar">
        {/* ======================================================== */}
        {/* TAB 1: CONTEXT-SENSITIVE PROPERTIES                      */}
        {/* ======================================================== */}
        {activeTab === 'properties' && (
          <div className="space-y-4">
            {/* --- GRADIENT LAYER INSPECTOR --- */}
            {activeLayer.type === 'gradient' && (
              <GradientInspector layer={activeLayer as GradientLayer} onUpdate={updates => onUpdateLayer(activeLayer.id, updates)} />
            )}

            {/* --- PATTERN LAYER INSPECTOR --- */}
            {activeLayer.type === 'pattern' && (
              <PatternInspector
                layer={activeLayer as PatternLayer}
                onUpdate={updates => onUpdateLayer(activeLayer.id, updates)}
                onOpenPatternModal={onOpenPatternModal}
              />
            )}

            {/* --- TEXT LAYER INSPECTOR --- */}
            {activeLayer.type === 'text' && (
              <TextInspector layer={activeLayer as TextLayer} onUpdate={updates => onUpdateLayer(activeLayer.id, updates)} />
            )}

            {/* --- SHAPE LAYER INSPECTOR --- */}
            {activeLayer.type === 'shape' && (
              <ShapeInspector layer={activeLayer as ShapeLayer} onUpdate={updates => onUpdateLayer(activeLayer.id, updates)} />
            )}

            {/* --- BLUR LAYER INSPECTOR --- */}
            {activeLayer.type === 'blur' && (
              <BlurInspector layer={activeLayer as BlurLayer} onUpdate={updates => onUpdateLayer(activeLayer.id, updates)} />
            )}

            {/* --- GLASS LAYER INSPECTOR --- */}
            {activeLayer.type === 'glass' && (
              <GlassInspector layer={activeLayer as GlassLayer} onUpdate={updates => onUpdateLayer(activeLayer.id, updates)} />
            )}

            {/* --- NOISE LAYER INSPECTOR --- */}
            {activeLayer.type === 'noise' && (
              <NoiseInspector layer={activeLayer as NoiseLayer} onUpdate={updates => onUpdateLayer(activeLayer.id, updates)} />
            )}

            {/* --- GLOW LAYER INSPECTOR --- */}
            {activeLayer.type === 'glow' && (
              <GlowInspector layer={activeLayer as GlowLayer} onUpdate={updates => onUpdateLayer(activeLayer.id, updates)} />
            )}

            {/* --- IMAGE LAYER BASICS --- */}
            {activeLayer.type === 'image' && (
              <ImageBasicsInspector layer={activeLayer as ImageLayer} onUpdate={updates => onUpdateLayer(activeLayer.id, updates)} />
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: IMAGE ADJUSTMENTS & COLOR GRADING                 */}
        {/* ======================================================== */}
        {activeTab === 'adjustments' && activeLayer.type === 'image' && (
          <ImageAdjustmentsInspector
            layer={activeLayer as ImageLayer}
            onUpdate={updates => onUpdateLayer(activeLayer.id, updates)}
          />
        )}

        {/* ======================================================== */}
        {/* TAB 3: TRANSFORM INSPECTOR                               */}
        {/* ======================================================== */}
        {activeTab === 'transform' && (
          <div className="space-y-3.5">
            {/* X, Y & Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-0.5">X Position (px)</label>
                <input
                  type="number"
                  value={Math.round(tf.x)}
                  onChange={e => onUpdateTransform(activeLayer.id, { x: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg bg-dark-950 border border-white/10 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Y Position (px)</label>
                <input
                  type="number"
                  value={Math.round(tf.y)}
                  onChange={e => onUpdateTransform(activeLayer.id, { y: Number(e.target.value) })}
                  className="w-full px-2 py-1 rounded-lg bg-dark-950 border border-white/10 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Width (px)</label>
                <input
                  type="number"
                  value={Math.round(tf.width)}
                  onChange={e => onUpdateTransform(activeLayer.id, { width: Math.max(10, Number(e.target.value)) })}
                  className="w-full px-2 py-1 rounded-lg bg-dark-950 border border-white/10 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Height (px)</label>
                <input
                  type="number"
                  value={Math.round(tf.height)}
                  onChange={e => onUpdateTransform(activeLayer.id, { height: Math.max(10, Number(e.target.value)) })}
                  className="w-full px-2 py-1 rounded-lg bg-dark-950 border border-white/10 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Rotation Slider */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-mono text-slate-400">Rotation</label>
                <span className="text-[10px] font-mono text-cyan-300 font-bold">{Math.round(tf.rotation)}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={tf.rotation}
                onChange={e => onUpdateTransform(activeLayer.id, { rotation: Number(e.target.value) })}
                className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Flip & Alignment Utilities */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <label className="text-[10px] font-mono text-slate-400 block">Quick Align & Flip</label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => onCenterLayer(activeLayer.id)}
                  className="px-2 py-1.5 rounded-lg bg-dark-950 hover:bg-dark-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center justify-center gap-1 transition"
                  title="Center Layer on Canvas"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                  <span>Center</span>
                </button>
                <button
                  onClick={() => onFlipH(activeLayer.id)}
                  className={`px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition ${
                    tf.flipH ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' : 'bg-dark-950 hover:bg-dark-800 text-slate-300 border-white/10'
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>Flip H</span>
                </button>
                <button
                  onClick={() => onFlipV(activeLayer.id)}
                  className={`px-2 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1 transition ${
                    tf.flipV ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' : 'bg-dark-950 hover:bg-dark-800 text-slate-300 border-white/10'
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  <span>Flip V</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: MASK INSPECTOR                                    */}
        {/* ======================================================== */}
        {activeTab === 'mask' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-2 rounded-xl bg-dark-950 border border-white/10">
              <span className="text-xs font-semibold text-white">Enable Layer Mask</span>
              <input
                type="checkbox"
                checked={activeLayer.mask?.enabled ?? false}
                onChange={e =>
                  onUpdateLayer(activeLayer.id, {
                    mask: {
                      id: activeLayer.mask?.id || `mask_${Date.now()}`,
                      enabled: e.target.checked,
                      type: activeLayer.mask?.type || 'circle',
                      feather: activeLayer.mask?.feather ?? 15,
                      opacity: activeLayer.mask?.opacity ?? 100,
                      invert: activeLayer.mask?.invert ?? false,
                      blur: activeLayer.mask?.blur ?? 0,
                    },
                  })
                }
                className="w-4 h-4 rounded text-cyan-400 accent-cyan-400 cursor-pointer"
              />
            </div>

            {activeLayer.mask?.enabled && (
              <>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block mb-1">Mask Shape Type</label>
                  <select
                    value={activeLayer.mask.type}
                    onChange={e =>
                      onUpdateLayer(activeLayer.id, {
                        mask: { ...activeLayer.mask!, type: e.target.value as any },
                      })
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-white/10 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                  >
                    <option value="circle">Radial Circle</option>
                    <option value="rect">Rectangle</option>
                    <option value="linear-gradient">Linear Gradient Fade</option>
                    <option value="radial-gradient">Radial Gradient Fade</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[10px] font-mono text-slate-400">Feather Softness</label>
                    <span className="text-[10px] font-mono text-cyan-300 font-bold">{activeLayer.mask.feather}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={activeLayer.mask.feather}
                    onChange={e =>
                      onUpdateLayer(activeLayer.id, {
                        mask: { ...activeLayer.mask!, feather: Number(e.target.value) },
                      })
                    }
                    className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="flex items-center justify-between p-2 rounded-xl bg-dark-950 border border-white/10">
                  <span className="text-xs font-semibold text-white">Invert Mask</span>
                  <input
                    type="checkbox"
                    checked={activeLayer.mask.invert}
                    onChange={e =>
                      onUpdateLayer(activeLayer.id, {
                        mask: { ...activeLayer.mask!, invert: e.target.checked },
                      })
                    }
                    className="w-4 h-4 rounded text-cyan-400 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* SUB-INSPECTORS FOR SPECIFIC LAYER TYPES                                   */
/* ========================================================================= */

// --- 1. GRADIENT INSPECTOR ---
function GradientInspector({
  layer,
  onUpdate,
}: {
  layer: GradientLayer;
  onUpdate: (updates: Partial<GradientLayer>) => void;
}) {
  const gradientTypes: { id: ExtendedGradientType; label: string }[] = [
    { id: 'linear', label: 'Linear' },
    { id: 'radial', label: 'Radial' },
    { id: 'conical', label: 'Conic' },
    { id: 'mesh', label: '4-Mesh' },
  ];

  return (
    <div className="space-y-3.5">
      <div>
        <label className="text-[10px] font-mono text-slate-400 block mb-1">Gradient Type</label>
        <div className="grid grid-cols-4 gap-1">
          {gradientTypes.map(gt => (
            <button
              key={gt.id}
              onClick={() => onUpdate({ gradientType: gt.id })}
              className={`py-1 rounded-lg text-xs font-bold transition ${
                layer.gradientType === gt.id
                  ? 'bg-cyan-500 text-dark-950 shadow-md'
                  : 'bg-dark-950 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {gt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Angle Slider */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-mono text-slate-400">Angle Flow</label>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">{layer.angle}°</span>
        </div>
        <input
          type="range"
          min="0"
          max="360"
          value={layer.angle}
          onChange={e => onUpdate({ angle: Number(e.target.value) })}
          className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* Mesh 4 Corners */}
      {layer.gradientType === 'mesh' ? (
        <div className="space-y-2 pt-2 border-t border-white/5">
          <label className="text-[10px] font-mono text-slate-400 block">4-Corner Mesh Colors</label>
          <div className="grid grid-cols-2 gap-2">
            {['Top Left', 'Top Right', 'Bottom Right', 'Bottom Left'].map((lbl, idx) => (
              <div key={idx} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-dark-950 border border-white/10">
                <input
                  type="color"
                  value={layer.meshColors[idx] || '#00d2ff'}
                  onChange={e => {
                    const next: [string, string, string, string] = [...layer.meshColors];
                    next[idx] = e.target.value;
                    onUpdate({ meshColors: next });
                  }}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
                />
                <span className="text-[10px] font-mono text-slate-300">{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Color Stops Editor */
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono text-slate-400">Color Stops</label>
            <button
              onClick={() => {
                const next = [...layer.stops];
                next.push({ id: String(Date.now()), color: '#ff007f', position: 100 });
                onUpdate({ stops: next });
              }}
              className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-bold border border-cyan-500/40 flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Add Stop
            </button>
          </div>

          <div className="space-y-1.5">
            {layer.stops.map((stop, idx) => (
              <div key={stop.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-dark-950 border border-white/5">
                <input
                  type="color"
                  value={stop.color}
                  onChange={e => {
                    const next = [...layer.stops];
                    next[idx] = { ...stop, color: e.target.value };
                    onUpdate({ stops: next });
                  }}
                  className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent shrink-0"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stop.position}
                  onChange={e => {
                    const next = [...layer.stops];
                    next[idx] = { ...stop, position: Number(e.target.value) };
                    onUpdate({ stops: next });
                  }}
                  className="flex-1 h-1.5 bg-dark-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <span className="text-[10px] font-mono text-cyan-300 font-bold w-7 text-right">{stop.position}%</span>
                {layer.stops.length > 2 && (
                  <button
                    onClick={() => onUpdate({ stops: layer.stops.filter((_, i) => i !== idx) })}
                    className="p-1 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// --- 2. PATTERN INSPECTOR ---
function PatternInspector({
  layer,
  onUpdate,
  onOpenPatternModal,
}: {
  layer: PatternLayer;
  onUpdate: (updates: Partial<PatternLayer>) => void;
  onOpenPatternModal: () => void;
}) {
  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-white block">{layer.patternType}</span>
          <span className="text-[10px] text-slate-500 font-mono">500+ Curated Library</span>
        </div>
        <button
          onClick={onOpenPatternModal}
          className="px-2.5 py-1.5 rounded-xl bg-cyan-500 text-dark-950 hover:bg-cyan-400 text-xs font-bold shadow-md transition"
        >
          Browse Patterns
        </button>
      </div>

      {/* Pattern Color & Background */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-xl bg-dark-950 border border-white/10 flex items-center gap-2">
          <input
            type="color"
            value={layer.color || '#00f0ff'}
            onChange={e => onUpdate({ color: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
          />
          <div>
            <span className="text-[9px] font-mono text-slate-400 block">Stroke Color</span>
            <span className="text-xs font-mono text-white font-bold">{layer.color}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-dark-950 border border-white/10 flex items-center gap-2">
          <input
            type="color"
            value={layer.backgroundColor || '#0a0d16'}
            onChange={e => onUpdate({ backgroundColor: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
          />
          <div>
            <span className="text-[9px] font-mono text-slate-400 block">Backdrop Tile</span>
            <span className="text-xs font-mono text-white font-bold">{layer.backgroundColor || 'None'}</span>
          </div>
        </div>
      </div>

      {/* Pattern Scale & Stroke */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-mono text-slate-400">Pattern Scale</label>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">{layer.scale}%</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          value={layer.scale}
          onChange={e => onUpdate({ scale: Number(e.target.value) })}
          className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-mono text-slate-400">Stroke Thickness</label>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">{layer.strokeWidth}px</span>
        </div>
        <input
          type="range"
          min="0.5"
          max="10"
          step="0.5"
          value={layer.strokeWidth}
          onChange={e => onUpdate({ strokeWidth: Number(e.target.value) })}
          className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>

      {/* 3D Extrusion Toggle */}
      <div className="p-2.5 rounded-xl bg-dark-950 border border-white/10 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white">3D Extrusion & Depth</span>
          <input
            type="checkbox"
            checked={layer.is3D ?? false}
            onChange={e => onUpdate({ is3D: e.target.checked })}
            className="w-4 h-4 rounded text-cyan-400 accent-cyan-400 cursor-pointer"
          />
        </div>
        {layer.is3D && (
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
            <div>
              <span className="text-[9px] font-mono text-slate-400 block mb-1">Tilt Pitch ({layer.pitch3D ?? 0}°)</span>
              <input
                type="range"
                min="-60"
                max="60"
                value={layer.pitch3D ?? 0}
                onChange={e => onUpdate({ pitch3D: Number(e.target.value) })}
                className="w-full h-1 bg-dark-900 rounded accent-cyan-400"
              />
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-400 block mb-1">Tilt Yaw ({layer.yaw3D ?? 0}°)</span>
              <input
                type="range"
                min="-60"
                max="60"
                value={layer.yaw3D ?? 0}
                onChange={e => onUpdate({ yaw3D: Number(e.target.value) })}
                className="w-full h-1 bg-dark-900 rounded accent-cyan-400"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- 3. TEXT INSPECTOR ---
function TextInspector({
  layer,
  onUpdate,
}: {
  layer: TextLayer;
  onUpdate: (updates: Partial<TextLayer>) => void;
}) {
  return (
    <div className="space-y-3.5">
      <div>
        <label className="text-[10px] font-mono text-slate-400 block mb-1">Text Content</label>
        <textarea
          rows={3}
          value={layer.text}
          onChange={e => onUpdate({ text: e.target.value })}
          className="w-full p-2 rounded-xl bg-dark-950 border border-white/10 text-xs text-white font-medium focus:outline-none focus:border-cyan-400 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">Font Size ({layer.fontSize}px)</label>
          <input
            type="number"
            value={layer.fontSize}
            onChange={e => onUpdate({ fontSize: Math.max(8, Number(e.target.value)) })}
            className="w-full px-2 py-1.5 rounded-lg bg-dark-950 border border-white/10 text-xs text-white font-mono"
          />
        </div>
        <div>
          <label className="text-[10px] font-mono text-slate-400 block mb-1">Text Color</label>
          <div className="flex items-center gap-2 p-1 rounded-lg bg-dark-950 border border-white/10">
            <input
              type="color"
              value={layer.color}
              onChange={e => onUpdate({ color: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
            <span className="text-xs font-mono text-white">{layer.color}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 4. SHAPE INSPECTOR ---
function ShapeInspector({
  layer,
  onUpdate,
}: {
  layer: ShapeLayer;
  onUpdate: (updates: Partial<ShapeLayer>) => void;
}) {
  return (
    <div className="space-y-3.5">
      <div>
        <label className="text-[10px] font-mono text-slate-400 block mb-1">Geometry</label>
        <select
          value={layer.shapeType}
          onChange={e => onUpdate({ shapeType: e.target.value as any })}
          className="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-white/10 text-xs text-white font-mono"
        >
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle / Ellipse</option>
          <option value="triangle">Triangle</option>
          <option value="star">Star</option>
          <option value="hexagon">Hexagon</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-xl bg-dark-950 border border-white/10 flex items-center gap-2">
          <input
            type="color"
            value={layer.fillColor}
            onChange={e => onUpdate({ fillColor: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
          />
          <div>
            <span className="text-[9px] font-mono text-slate-400 block">Fill Color</span>
            <span className="text-xs font-mono text-white font-bold">{layer.fillColor}</span>
          </div>
        </div>

        <div className="p-2 rounded-xl bg-dark-950 border border-white/10 flex items-center gap-2">
          <input
            type="color"
            value={layer.strokeColor}
            onChange={e => onUpdate({ strokeColor: e.target.value })}
            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
          />
          <div>
            <span className="text-[9px] font-mono text-slate-400 block">Stroke Color</span>
            <span className="text-xs font-mono text-white font-bold">{layer.strokeColor}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 5. BLUR INSPECTOR ---
function BlurInspector({
  layer,
  onUpdate,
}: {
  layer: BlurLayer;
  onUpdate: (updates: Partial<BlurLayer>) => void;
}) {
  return (
    <div className="space-y-3.5">
      <div>
        <label className="text-[10px] font-mono text-slate-400 block mb-1">Blur Optics</label>
        <select
          value={layer.category}
          onChange={e => onUpdate({ category: e.target.value as any })}
          className="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-white/10 text-xs text-white font-mono"
        >
          <option value="mesh">Gaussian Mesh Blur</option>
          <option value="radial">Radial Focal Blur</option>
          <option value="tiltshift">Tilt-Shift Depth of Field</option>
          <option value="glass">Glassmorphism Sheen</option>
          <option value="linear">Linear Directional Blur</option>
          <option value="angular">Angular Lens Vortex</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-mono text-slate-400">Blur Radius</label>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">{layer.radius}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="60"
          value={layer.radius}
          onChange={e => onUpdate({ radius: Number(e.target.value) })}
          className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>
    </div>
  );
}

// --- 6. GLASS INSPECTOR ---
function GlassInspector({
  layer,
  onUpdate,
}: {
  layer: GlassLayer;
  onUpdate: (updates: Partial<GlassLayer>) => void;
}) {
  return (
    <div className="space-y-3.5">
      <div>
        <label className="text-[10px] font-mono text-slate-400 block mb-1">Refraction Mode</label>
        <select
          value={layer.settings.mode}
          onChange={e => onUpdate({ settings: { ...layer.settings, mode: e.target.value as any } })}
          className="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-white/10 text-xs text-white font-mono"
        >
          <option value="1">Fluted Ribs Architectural Glass</option>
          <option value="2">Diamond Prism Facets</option>
          <option value="3">Voronoi Shards Glass</option>
          <option value="3.1">Prismatic Chromatic Dispersion</option>
          <option value="3.2">Frosted Matte Sandblasted</option>
          <option value="3.3">Sacred Kaleidoscope Mirror</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-mono text-slate-400">Refractive Distortion</label>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">{layer.settings.distortion}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={layer.settings.distortion}
          onChange={e => onUpdate({ settings: { ...layer.settings, distortion: Number(e.target.value) } })}
          className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>
    </div>
  );
}

// --- 7. NOISE INSPECTOR ---
function NoiseInspector({
  layer,
  onUpdate,
}: {
  layer: NoiseLayer;
  onUpdate: (updates: Partial<NoiseLayer>) => void;
}) {
  return (
    <div className="space-y-3.5">
      <div>
        <label className="text-[10px] font-mono text-slate-400 block mb-1">Texture Type</label>
        <select
          value={layer.noiseType}
          onChange={e => onUpdate({ noiseType: e.target.value as any })}
          className="w-full px-2.5 py-1.5 rounded-lg bg-dark-950 border border-white/10 text-xs text-white font-mono"
        >
          <option value="film">35mm Organic Film Grain</option>
          <option value="digital">Digital Sensor Noise</option>
          <option value="retro">Vintage Retro Flecks</option>
        </select>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-mono text-slate-400">Noise Amount</label>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">{layer.amount}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="60"
          value={layer.amount}
          onChange={e => onUpdate({ amount: Number(e.target.value) })}
          className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>
    </div>
  );
}

// --- 8. GLOW INSPECTOR ---
function GlowInspector({
  layer,
  onUpdate,
}: {
  layer: GlowLayer;
  onUpdate: (updates: Partial<GlowLayer>) => void;
}) {
  return (
    <div className="space-y-3.5">
      <div className="p-2 rounded-xl bg-dark-950 border border-white/10 flex items-center gap-2">
        <input
          type="color"
          value={layer.color}
          onChange={e => onUpdate({ color: e.target.value })}
          className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
        />
        <div>
          <span className="text-[9px] font-mono text-slate-400 block">Glow Color</span>
          <span className="text-xs font-mono text-white font-bold">{layer.color}</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-mono text-slate-400">Glow Radius</label>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">{layer.radius}px</span>
        </div>
        <input
          type="range"
          min="10"
          max="200"
          value={layer.radius}
          onChange={e => onUpdate({ radius: Number(e.target.value) })}
          className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>
    </div>
  );
}

// --- 9. IMAGE BASICS INSPECTOR ---
function ImageBasicsInspector({
  layer,
  onUpdate,
}: {
  layer: ImageLayer;
  onUpdate: (updates: Partial<ImageLayer>) => void;
}) {
  return (
    <div className="space-y-3.5">
      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="text-[10px] font-mono text-slate-400">Corner Radius</label>
          <span className="text-[10px] font-mono text-cyan-300 font-bold">{layer.borderRadius ?? 0}px</span>
        </div>
        <input
          type="range"
          min="0"
          max="120"
          value={layer.borderRadius ?? 0}
          onChange={e => onUpdate({ borderRadius: Number(e.target.value) })}
          className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
      </div>
    </div>
  );
}

// --- 10. IMAGE ADJUSTMENTS / GRADING INSPECTOR ---
function ImageAdjustmentsInspector({
  layer,
  onUpdate,
}: {
  layer: ImageLayer;
  onUpdate: (updates: Partial<ImageLayer>) => void;
}) {
  const adj = layer.adjustments;

  const updateAdj = (key: keyof typeof adj, val: number) => {
    onUpdate({
      adjustments: {
        ...adj,
        [key]: val,
      },
    });
  };

  const sliders: { key: keyof typeof adj; label: string; min: number; max: number; unit?: string }[] = [
    { key: 'exposure', label: 'Exposure', min: -100, max: 100 },
    { key: 'contrast', label: 'Contrast', min: -100, max: 100 },
    { key: 'highlights', label: 'Highlights', min: -100, max: 100 },
    { key: 'shadows', label: 'Shadows', min: -100, max: 100 },
    { key: 'temperature', label: 'Temperature (Warm/Cool)', min: -100, max: 100 },
    { key: 'tint', label: 'Tint (Green/Magenta)', min: -100, max: 100 },
    { key: 'saturation', label: 'Saturation', min: -100, max: 100 },
    { key: 'sharpness', label: 'Clarity / Sharpness', min: 0, max: 100 },
    { key: 'vignette', label: 'Vignette Falloff', min: 0, max: 100 },
  ];

  return (
    <div className="space-y-3">
      {sliders.map(s => (
        <div key={s.key}>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-mono text-slate-400">{s.label}</label>
            <span className="text-[10px] font-mono text-cyan-300 font-bold">
              {adj[s.key]}
              {s.unit || ''}
            </span>
          </div>
          <input
            type="range"
            min={s.min}
            max={s.max}
            value={adj[s.key]}
            onChange={e => updateAdj(s.key, Number(e.target.value))}
            className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      ))}
    </div>
  );
}
