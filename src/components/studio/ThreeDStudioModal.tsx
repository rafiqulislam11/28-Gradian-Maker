import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Box,
  RotateCw,
  Eye,
  Download,
  Sparkles,
  Camera,
  Layers,
  Sliders,
  Check,
  Wand2,
  RefreshCw,
  Sun,
  Palette,
} from 'lucide-react';
import {
  LumberStackParams,
  DEFAULT_LUMBER_PARAMS,
  WoodMaterialType,
  generate3DLumberModel,
} from '../../engine/3d/lumberModelGenerator';
import { initThreeStudio, ThreeStudioInstance } from '../../engine/3d/threeStudioEngine';
import { exportGroupToOBJ, exportGroupToGLTF, downloadFile } from '../../engine/3d/objExporter';
import { ImageItem } from '../../types/studio';

interface ThreeDStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToStudio?: (imageItem: ImageItem) => void;
}

const WOOD_TYPE_OPTIONS: { id: WoodMaterialType; name: string; desc: string; icon: string }[] = [
  {
    id: 'weathered-pine',
    name: 'Weathered Pine (Reference)',
    desc: 'Matches reference photo with golden highlights & gray grain',
    icon: '🌲',
  },
  {
    id: 'aged-oak',
    name: 'Aged Rustic Oak',
    desc: 'Deep weathered gray-brown rustic construction timber',
    icon: '🪵',
  },
  {
    id: 'sawmill-fresh',
    name: 'Sawmill Fresh Cedar',
    desc: 'Golden yellow freshly cut lumber with vivid annular rings',
    icon: '🪚',
  },
  {
    id: 'dark-timber',
    name: 'Charred Dark Timber',
    desc: 'Dark burned walnut architectural wood beams',
    icon: '⬛',
  },
  {
    id: 'pallet-wood',
    name: 'Industrial Pallet Wood',
    desc: 'Desaturated warehouse shipping crate lumber',
    icon: '📦',
  },
];

export const ThreeDStudioModal: React.FC<ThreeDStudioModalProps> = ({
  isOpen,
  onClose,
  onSendToStudio,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const studioRef = useRef<ThreeStudioInstance | null>(null);

  const [params, setParams] = useState<LumberStackParams>({ ...DEFAULT_LUMBER_PARAMS });
  const [isWireframe, setIsWireframe] = useState(false);
  const [activeCameraPreset, setActiveCameraPreset] = useState<'perspective' | 'top' | 'front' | 'hero'>('perspective');
  const [isExporting, setIsExporting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Initialize Three.js Scene when modal mounts or opens
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const studio = initThreeStudio(containerRef.current, params);
    studioRef.current = studio;

    return () => {
      studio.dispose();
      studioRef.current = null;
    };
  }, [isOpen]);

  // Update Three.js parameters when params change
  const handleUpdateParams = (updates: Partial<LumberStackParams>) => {
    const next = { ...params, ...updates };
    setParams(next);
    if (studioRef.current) {
      studioRef.current.updateParams(updates);
    }
  };

  // Switch camera view angle
  const handleSetCamera = (preset: 'perspective' | 'top' | 'front' | 'hero') => {
    setActiveCameraPreset(preset);
    if (studioRef.current) {
      studioRef.current.resetCamera(preset);
    }
  };

  // Toggle wireframe mode
  const handleToggleWireframe = () => {
    const next = !isWireframe;
    setIsWireframe(next);
    if (studioRef.current) {
      studioRef.current.setWireframe(next);
    }
  };

  // 1-Click Preset Loaders
  const handleApplyPreset = (presetName: string) => {
    let p: Partial<LumberStackParams> = {};
    if (presetName === 'ref') {
      p = { ...DEFAULT_LUMBER_PARAMS };
    } else if (presetName === 'heavy') {
      p = {
        layers: 10,
        beamsPerLayer: 5,
        beamLength: 15,
        beamWidth: 2.2,
        beamHeight: 1.5,
        woodType: 'dark-timber',
        jumbleJitter: 0.15,
        topDiagonalPlanks: true,
      };
    } else if (presetName === 'pallet') {
      p = {
        layers: 6,
        beamsPerLayer: 8,
        beamLength: 12,
        beamWidth: 1.2,
        beamHeight: 0.8,
        woodType: 'pallet-wood',
        jumbleJitter: 0.35,
        topDiagonalPlanks: false,
      };
    } else if (presetName === 'sawmill') {
      p = {
        layers: 12,
        beamsPerLayer: 6,
        beamLength: 14,
        beamWidth: 1.4,
        beamHeight: 1.1,
        woodType: 'sawmill-fresh',
        jumbleJitter: 0.3,
        lengthVariation: 0.45,
        topDiagonalPlanks: true,
      };
    }
    handleUpdateParams(p);
  };

  // Export OBJ format
  const handleExportOBJ = () => {
    setIsExporting(true);
    try {
      const group = generate3DLumberModel(params);
      const objData = exportGroupToOBJ(group, 'realistic_lumber_stack_3d.obj');
      downloadFile(objData, 'realistic_lumber_stack_3d.obj', 'text/plain');
      showNotice('3D Model (.OBJ) exported successfully!');
    } catch (e) {
      console.error('Failed to export OBJ:', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Export GLTF format
  const handleExportGLTF = async () => {
    setIsExporting(true);
    try {
      const group = generate3DLumberModel(params);
      await exportGroupToGLTF(group, 'realistic_lumber_stack_3d.gltf');
      showNotice('3D Model (.GLTF) exported successfully!');
    } catch (e) {
      console.error('Failed to export GLTF:', e);
    } finally {
      setIsExporting(false);
    }
  };

  // Export 4K PNG Snapshot
  const handleExportSnapshot = () => {
    if (!studioRef.current) return;
    const dataUrl = studioRef.current.captureSnapshot(false);
    downloadFile(dataUrl, '3d_lumber_stack_snapshot.png', 'image/png');
    showNotice('High-Res 3D Snapshot downloaded!');
  };

  // Send 3D Snapshot directly to Studio
  const handleSendToStudio = () => {
    if (!studioRef.current || !onSendToStudio) return;
    const dataUrl = studioRef.current.captureSnapshot(false);
    const newImage: ImageItem = {
      id: `3d_lumber_${Date.now()}`,
      name: `3D Lumber Stack (${params.woodType})`,
      size: 1024 * 1024,
      type: 'image/png',
      width: 1920,
      height: 1080,
      originalUrl: dataUrl,
      processedUrl: null,
      thumbnailUrl: dataUrl,
      status: 'idle',
      progress: 0,
    };
    onSendToStudio(newImage);
    showNotice('Sent 3D model snapshot to Studio!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const showNotice = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-dark-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Main Studio Modal Window */}
      <div className="relative w-full max-w-7xl h-[92vh] flex flex-col rounded-2xl bg-[#0f131e] border border-white/10 shadow-2xl overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-white/10 bg-[#121724]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-dark-950 font-black shadow-md shadow-cyan-500/20">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  3D Model Studio
                </h3>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  Three.js WebGL
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden sm:inline">
                  PBR Realistic Wood
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Photorealistic 3D stacked lumber & timber pile generator with 360° orbit inspection & 3D exports
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Close 3D Studio"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Central Workspace: Left 3D Viewport + Right Parameter Sidebar */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Left: Three.js Interactive 3D Canvas */}
          <div className="flex-1 relative bg-[#090b11] overflow-hidden flex items-center justify-center min-h-[250px] sm:min-h-[320px] lg:min-h-0">
            {/* Viewport Canvas Container */}
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Top-Left Floating Camera & Display Controls */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
              {/* Camera Presets */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-dark-950/80 backdrop-blur-md border border-white/10 shadow-lg text-[10px] font-medium">
                <span className="px-2 py-1 text-slate-400 font-mono">Camera:</span>
                {[
                  { id: 'perspective', label: 'Perspective (3D)' },
                  { id: 'top', label: 'Top-Down' },
                  { id: 'front', label: 'Front' },
                  { id: 'hero', label: 'Hero Angle' },
                ].map(cam => (
                  <button
                    key={cam.id}
                    onClick={() => handleSetCamera(cam.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition ${
                      activeCameraPreset === cam.id
                        ? 'bg-cyan-400 text-dark-950 font-bold shadow'
                        : 'text-slate-300 hover:text-white hover:bg-dark-800'
                    }`}
                  >
                    {cam.label}
                  </button>
                ))}
              </div>

              {/* Display Mode (Solid / Wireframe) */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-dark-950/80 backdrop-blur-md border border-white/10 shadow-lg text-[10px] font-medium w-fit">
                <button
                  onClick={handleToggleWireframe}
                  className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                    isWireframe
                      ? 'bg-purple-500 text-white font-bold shadow'
                      : 'text-slate-300 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>{isWireframe ? 'Wireframe Mesh' : 'PBR Solid Wood'}</span>
                </button>

                <button
                  onClick={() => handleSetCamera('perspective')}
                  className="px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition"
                  title="Reset Camera Target"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Bottom Floating Orbit Instruction Hint */}
            <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-xl bg-dark-950/70 backdrop-blur-md border border-white/5 text-[10px] text-slate-400 flex items-center gap-2 pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Left-Click Drag to Orbit • Scroll to Zoom • Right-Click to Pan</span>
            </div>

            {/* Notification Toast */}
            {notification && (
              <div className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-cyan-400 text-dark-950 text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 z-20 flex items-center gap-2">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{notification}</span>
              </div>
            )}
          </div>

          {/* Right: Deep 3D Customization Sidebar */}
          <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-[#101420] overflow-y-auto p-4 sm:p-5 space-y-4 scrollbar-thin shrink-0 max-h-[45vh] lg:max-h-none">
            {/* 1. Quick Presets Card */}
            <div className="space-y-2 p-3 rounded-xl bg-dark-950 border border-white/5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1-Click 3D Stack Presets</span>
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleApplyPreset('ref')}
                  className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-cyan-400/30 hover:border-cyan-400 text-left transition text-[10px] text-cyan-200 flex items-center gap-1.5"
                >
                  <span>🌲</span>
                  <span className="truncate font-semibold">Reference Image</span>
                </button>
                <button
                  onClick={() => handleApplyPreset('heavy')}
                  className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/30 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                >
                  <span>🏗️</span>
                  <span className="truncate">Heavy Timber</span>
                </button>
                <button
                  onClick={() => handleApplyPreset('pallet')}
                  className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/30 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                >
                  <span>📦</span>
                  <span className="truncate">Pallet Wood</span>
                </button>
                <button
                  onClick={() => handleApplyPreset('sawmill')}
                  className="p-1.5 rounded-lg bg-dark-900 hover:bg-dark-800 border border-white/5 hover:border-cyan-400/30 text-left transition text-[10px] text-slate-300 hover:text-white flex items-center gap-1.5"
                >
                  <span>🪓</span>
                  <span className="truncate">Tall Sawmill</span>
                </button>
              </div>
            </div>

            {/* 2. Wood Material & PBR Textures */}
            <div className="space-y-2 p-3 rounded-xl bg-dark-950 border border-white/5">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                <span>Wood PBR Texture & Finish</span>
              </span>
              <div className="space-y-1.5">
                {WOOD_TYPE_OPTIONS.map(wood => {
                  const isSelected = params.woodType === wood.id;
                  return (
                    <button
                      key={wood.id}
                      onClick={() => handleUpdateParams({ woodType: wood.id })}
                      className={`w-full p-2 rounded-xl border text-left transition flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-cyan-400/15 border-cyan-400 text-white ring-1 ring-cyan-400/30'
                          : 'bg-dark-900 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-dark-850'
                      }`}
                    >
                      <span className="text-base">{wood.icon}</span>
                      <div className="overflow-hidden">
                        <div className="text-xs font-semibold text-white truncate">{wood.name}</div>
                        <div className="text-[9.5px] text-slate-400 truncate">{wood.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Stack Dimensions & Architecture */}
            <div className="space-y-2.5 p-3 rounded-xl bg-dark-950 border border-white/5">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Stack Layers & Beam Dimensions</span>
              </span>

              {/* Layer Count */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Stack Height (Layers)</span>
                  <span className="font-mono text-cyan-400 font-bold">{params.layers} Layers</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="14"
                  value={params.layers}
                  onChange={e => handleUpdateParams({ layers: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Beams per Layer */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Beams per Layer</span>
                  <span className="font-mono text-cyan-400 font-bold">{params.beamsPerLayer} Beams</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="9"
                  value={params.beamsPerLayer}
                  onChange={e => handleUpdateParams({ beamsPerLayer: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Beam Length */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Beam Length</span>
                  <span className="font-mono text-cyan-400 font-bold">{params.beamLength}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="20"
                  step="0.5"
                  value={params.beamLength}
                  onChange={e => handleUpdateParams({ beamLength: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* Beam Width & Height */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/5">
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Width</span>
                    <span className="font-mono text-cyan-400">{params.beamWidth}</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="2.5"
                    step="0.1"
                    value={params.beamWidth}
                    onChange={e => handleUpdateParams({ beamWidth: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>
                <div className="space-y-0.5">
                  <div className="flex justify-between text-[9px] text-slate-400">
                    <span>Thickness</span>
                    <span className="font-mono text-cyan-400">{params.beamHeight}</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="2.0"
                    step="0.1"
                    value={params.beamHeight}
                    onChange={e => handleUpdateParams({ beamHeight: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* 4. Realism, Jumble Jitter & Jagged Ends */}
            <div className="space-y-2.5 p-3 rounded-xl bg-dark-950 border border-white/5">
              <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Natural Imperfection & Jumble</span>
              </span>

              {/* Jumble / Disarray */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Jumble & Stacking Misalignment</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {Math.round(params.jumbleJitter * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={params.jumbleJitter}
                  onChange={e => handleUpdateParams({ jumbleJitter: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>

              {/* End Length Variation */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Uneven Ends (Sawed Jitter)</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {Math.round(params.lengthVariation * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.6"
                  step="0.05"
                  value={params.lengthVariation}
                  onChange={e => handleUpdateParams({ lengthVariation: Number(e.target.value) })}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* 5. Top Diagonal Crossing Planks (Matches Reference Image) */}
            <div className="p-3 rounded-xl bg-dark-950 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span>Top Diagonal Planks</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-bold border border-cyan-400/30">
                    Ref Photo
                  </span>
                </span>
                <button
                  onClick={() => handleUpdateParams({ topDiagonalPlanks: !params.topDiagonalPlanks })}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                    params.topDiagonalPlanks
                      ? 'bg-cyan-400 text-dark-950 font-bold'
                      : 'bg-dark-850 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {params.topDiagonalPlanks ? 'Active' : 'Off'}
                </button>
              </div>

              {params.topDiagonalPlanks && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Plank Crossing Angle</span>
                    <span className="font-mono text-cyan-400 font-bold">{params.diagonalAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    value={params.diagonalAngle}
                    onChange={e => handleUpdateParams({ diagonalAngle: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Footer Bar */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#121724] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* 3D OBJ Export */}
            <button
              onClick={handleExportOBJ}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-xl bg-dark-900 hover:bg-dark-800 border border-white/10 hover:border-cyan-400/50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Download 3D Wavefront .OBJ model for Blender, Unity, etc."
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export .OBJ</span>
            </button>

            {/* 3D GLTF Export */}
            <button
              onClick={handleExportGLTF}
              disabled={isExporting}
              className="px-3.5 py-2 rounded-xl bg-dark-900 hover:bg-dark-800 border border-white/10 hover:border-purple-400/50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Download 3D GLTF asset"
            >
              <Box className="w-3.5 h-3.5 text-purple-400" />
              <span>Export .GLTF</span>
            </button>

            {/* 4K PNG Snapshot Export */}
            <button
              onClick={handleExportSnapshot}
              className="px-3.5 py-2 rounded-xl bg-dark-900 hover:bg-dark-800 border border-white/10 hover:border-cyan-400/50 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Capture high-resolution 3D snapshot"
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              <span>Save 4K Snapshot</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Send to Canvas Studio Button */}
            <button
              onClick={handleSendToStudio}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-300 to-purple-400 hover:from-cyan-300 hover:to-purple-300 text-dark-950 font-bold text-xs flex items-center gap-2 transition shadow-lg shadow-cyan-500/25 scale-[1.02]"
              title="Capture 3D model and load into Studio for gradient & pattern editing"
            >
              <Wand2 className="w-4 h-4 text-dark-950" />
              <span>Send 3D Model to Studio</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
