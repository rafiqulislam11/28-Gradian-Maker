import React, { useState } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Plus,
  Image as ImageIcon,
  Palette,
  Grid,
  Square,
  Type,
  Sparkles,
  Sun,
  Disc,
  Flame,
  Sliders,
  Maximize2,
  Check,
  Edit2,
  Volume2,
} from 'lucide-react';
import { Layer, LayerType, BlendMode } from '../../types/project';

interface LayerPanelProps {
  layers: Layer[];
  activeLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onAddLayer: (data: Partial<Layer>) => void;
  onRemoveLayer: (id: string) => void;
  onDuplicateLayer: (id: string) => void;
  onReorderLayers: (fromIdx: number, toIdx: number) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onToggleSolo: (id: string) => void;
  onRenameLayer: (id: string, name: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onUploadImage: (file: File) => void;
}

const BLEND_MODES: { value: BlendMode; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'multiply', label: 'Multiply' },
  { value: 'screen', label: 'Screen' },
  { value: 'overlay', label: 'Overlay' },
  { value: 'soft-light', label: 'Soft Light' },
  { value: 'hard-light', label: 'Hard Light' },
  { value: 'color-dodge', label: 'Color Dodge' },
  { value: 'color-burn', label: 'Color Burn' },
  { value: 'darken', label: 'Darken' },
  { value: 'lighten', label: 'Lighten' },
  { value: 'difference', label: 'Difference' },
  { value: 'exclusion', label: 'Exclusion' },
  { value: 'hue', label: 'Hue' },
  { value: 'saturation', label: 'Saturation' },
  { value: 'color', label: 'Color' },
  { value: 'luminosity', label: 'Luminosity' },
];

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  activeLayerId,
  onSelectLayer,
  onAddLayer,
  onRemoveLayer,
  onDuplicateLayer,
  onReorderLayers,
  onToggleVisibility,
  onToggleLock,
  onToggleSolo,
  onRenameLayer,
  onUpdateLayer,
  onUploadImage,
}) => {
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const activeLayer = layers.find(l => l.id === activeLayerId) || null;

  // In Photoshop, layers list displays highest order on top
  const displayLayers = [...layers].sort((a, b) => (b.order ?? 0) - (a.order ?? 0));

  const handleStartRename = (layer: Layer) => {
    setEditingLayerId(layer.id);
    setEditingName(layer.name);
  };

  const handleFinishRename = (id: string) => {
    if (editingName.trim()) {
      onRenameLayer(id, editingName.trim());
    }
    setEditingLayerId(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
  };

  const getLayerIcon = (type: LayerType) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-3.5 h-3.5 text-blue-400" />;
      case 'gradient': return <Palette className="w-3.5 h-3.5 text-cyan-400" />;
      case 'pattern': return <Grid className="w-3.5 h-3.5 text-violet-400" />;
      case 'shape': return <Square className="w-3.5 h-3.5 text-amber-400" />;
      case 'text': return <Type className="w-3.5 h-3.5 text-emerald-400" />;
      case 'blur': return <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" />;
      case 'glass': return <Sun className="w-3.5 h-3.5 text-indigo-400" />;
      case 'noise': return <Disc className="w-3.5 h-3.5 text-teal-400" />;
      case 'glow': return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'colorGrade':
      case 'adjustment': return <Sliders className="w-3.5 h-3.5 text-purple-400" />;
      default: return <Layers className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0e121d] border border-white/10 rounded-2xl overflow-hidden shadow-2xl select-none">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* 1. Header with Blend Mode & Opacity */}
      <div className="p-3 border-b border-white/10 bg-[#121624] space-y-2.5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Layers</h3>
            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {layers.length}
            </span>
          </div>

          {/* Add Layer Button */}
          <div className="relative">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-bold flex items-center gap-1 transition shadow-sm"
              title="Add New Layer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>

            {/* Add Layer Menu Dropdown */}
            {isAddMenuOpen && (
              <div
                className="absolute right-0 top-8 z-50 w-52 rounded-xl bg-[#141928] border border-white/15 shadow-2xl p-1.5 space-y-1 backdrop-blur-xl"
                onMouseLeave={() => setIsAddMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-mono text-slate-400 uppercase font-bold">Create New Layer</div>
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <ImageIcon className="w-4 h-4 text-blue-400" />
                  <span>Image Layer</span>
                </button>
                <button
                  onClick={() => {
                    onAddLayer({
                      name: 'Gradient Layer',
                      type: 'gradient',
                      gradientType: 'linear',
                      angle: 90,
                      stops: [
                        { id: '1', color: '#00f0ff', position: 0 },
                        { id: '2', color: '#ff007f', position: 100 },
                      ],
                      meshColors: ['#00f0ff', '#7928ca', '#ff007f', '#ff7a00'],
                    });
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <Palette className="w-4 h-4 text-cyan-400" />
                  <span>Gradient Layer</span>
                </button>
                <button
                  onClick={() => {
                    onAddLayer({
                      name: 'Pattern Layer',
                      type: 'pattern',
                      patternType: 'pat_geometric_001',
                      scale: 45,
                      rotation: 0,
                      color: '#00f0ff',
                      fillOpacity: 20,
                      strokeWidth: 1.5,
                      fullFill: true,
                    });
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <Grid className="w-4 h-4 text-violet-400" />
                  <span>500+ Pattern Layer</span>
                </button>
                <button
                  onClick={() => {
                    onAddLayer({
                      name: 'Text Layer',
                      type: 'text',
                      text: 'New Text',
                      fontSize: 48,
                      fontWeight: 800,
                      color: '#ffffff',
                    });
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <Type className="w-4 h-4 text-emerald-400" />
                  <span>Typography / Text</span>
                </button>
                <button
                  onClick={() => {
                    onAddLayer({
                      name: 'Shape Layer',
                      type: 'shape',
                      shapeType: 'rectangle',
                      fillColor: '#00f0ff',
                      fillOpacity: 80,
                      cornerRadius: 16,
                    });
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <Square className="w-4 h-4 text-amber-400" />
                  <span>Geometric Shape</span>
                </button>
                <button
                  onClick={() => {
                    onAddLayer({
                      name: 'Optical Blur',
                      type: 'blur',
                      category: 'mesh',
                      radius: 25,
                    });
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-fuchsia-400" />
                  <span>Optical Blur Layer</span>
                </button>
                <button
                  onClick={() => {
                    onAddLayer({
                      name: '35mm Film Grain',
                      type: 'noise',
                      noiseType: 'film',
                      amount: 25,
                      monochrome: true,
                    });
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-medium text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <Disc className="w-4 h-4 text-teal-400" />
                  <span>Noise & Grain</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Blend Mode & Opacity Controls for Active Layer */}
        {activeLayer && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-0.5">Blend Mode</label>
              <select
                value={activeLayer.blendMode}
                onChange={e => onUpdateLayer(activeLayer.id, { blendMode: e.target.value as BlendMode })}
                className="w-full px-2 py-1 rounded-lg bg-dark-950 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              >
                {BLEND_MODES.map(bm => (
                  <option key={bm.value} value={bm.value}>
                    {bm.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-0.5">
                <label className="text-[10px] font-mono text-slate-400">Opacity</label>
                <span className="text-[10px] font-mono text-cyan-300 font-bold">{activeLayer.opacity}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={activeLayer.opacity}
                onChange={e => onUpdateLayer(activeLayer.id, { opacity: Number(e.target.value) })}
                className="w-full h-1.5 bg-dark-950 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Scrollable Layer Stack (Displaying Top-to-Bottom) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0 custom-scrollbar">
        {displayLayers.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs font-mono">
            No layers added yet. Click &quot;Add&quot; to create a layer.
          </div>
        ) : (
          displayLayers.map((layer, index) => {
            const isSelected = layer.id === activeLayerId;
            const actualIndex = layers.findIndex(l => l.id === layer.id);

            return (
              <div
                key={layer.id}
                onClick={() => onSelectLayer(layer.id)}
                className={`group flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/60 to-[#141b2c] border-cyan-400/50 shadow-md shadow-cyan-950/20'
                    : 'bg-[#101422]/60 hover:bg-[#141828] border-white/5 hover:border-white/10'
                }`}
              >
                {/* Visibility Eye Toggle */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onToggleVisibility(layer.id);
                  }}
                  className={`p-1 rounded hover:bg-white/10 transition ${
                    layer.visible ? 'text-slate-300 hover:text-white' : 'text-slate-600'
                  }`}
                  title={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400/80" />}
                </button>

                {/* Layer Icon */}
                <div className="w-6 h-6 rounded-lg bg-dark-950 border border-white/10 flex items-center justify-center shrink-0">
                  {getLayerIcon(layer.type)}
                </div>

                {/* Layer Name / Inline Edit */}
                <div className="flex-1 min-w-0">
                  {editingLayerId === layer.id ? (
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleFinishRename(layer.id);
                          if (e.key === 'Escape') setEditingLayerId(null);
                        }}
                        autoFocus
                        className="w-full px-1.5 py-0.5 rounded bg-dark-950 border border-cyan-400 text-xs text-white font-medium focus:outline-none"
                      />
                      <button
                        onClick={() => handleFinishRename(layer.id)}
                        className="p-1 rounded bg-cyan-500 text-dark-950 hover:bg-cyan-400"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onDoubleClick={e => {
                        e.stopPropagation();
                        handleStartRename(layer);
                      }}
                      className="text-xs font-semibold text-slate-200 truncate group-hover:text-white flex items-center gap-1.5"
                    >
                      <span>{layer.name}</span>
                      {layer.solo && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          SOLO
                        </span>
                      )}
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1.5">
                    <span className="uppercase">{layer.type}</span>
                    <span>•</span>
                    <span>{layer.opacity}%</span>
                    <span>•</span>
                    <span className="capitalize">{layer.blendMode}</span>
                  </div>
                </div>

                {/* Layer Actions (Solo, Lock, Duplicate, Delete, Reorder) */}
                <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                  {/* Solo Toggle */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onToggleSolo(layer.id);
                    }}
                    className={`p-1 rounded hover:bg-white/10 transition ${
                      layer.solo ? 'text-amber-400 bg-amber-500/20' : 'text-slate-500 hover:text-amber-300'
                    }`}
                    title="Solo this layer"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>

                  {/* Lock Toggle */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onToggleLock(layer.id);
                    }}
                    className={`p-1 rounded hover:bg-white/10 transition ${
                      layer.locked ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                  >
                    {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </button>

                  {/* Reorder Up / Down */}
                  <div className="flex flex-col">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (actualIndex < layers.length - 1) onReorderLayers(actualIndex, actualIndex + 1);
                      }}
                      disabled={actualIndex >= layers.length - 1}
                      className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 transition"
                      title="Move layer up"
                    >
                      <ChevronUp className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (actualIndex > 0) onReorderLayers(actualIndex, actualIndex - 1);
                      }}
                      disabled={actualIndex <= 0}
                      className="p-0.5 text-slate-500 hover:text-white disabled:opacity-20 transition"
                      title="Move layer down"
                    >
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  {/* Duplicate */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDuplicateLayer(layer.id);
                    }}
                    className="p-1 text-slate-500 hover:text-cyan-300 rounded hover:bg-white/10 transition"
                    title="Duplicate layer"
                  >
                    <Copy className="w-3 h-3" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onRemoveLayer(layer.id);
                    }}
                    className="p-1 text-slate-500 hover:text-rose-400 rounded hover:bg-white/10 transition"
                    title="Delete layer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 3. Bottom Layer Stack Utilities */}
      <div className="p-2 border-t border-white/10 bg-[#121624] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1">
          <button
            onClick={() => activeLayer && onDuplicateLayer(activeLayer.id)}
            disabled={!activeLayer}
            className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-white disabled:opacity-30 border border-white/5 transition"
            title="Duplicate selected"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => activeLayer && onRemoveLayer(activeLayer.id)}
            disabled={!activeLayer}
            className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-rose-400 disabled:opacity-30 border border-white/5 transition"
            title="Delete selected"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <span className="text-[10px] font-mono text-slate-500">
          {activeLayer ? activeLayer.name : 'No Selection'}
        </span>
      </div>
    </div>
  );
};
