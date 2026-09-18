import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Undo2,
  Redo2,
  SplitSquareVertical,
  Download,
  Code,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Sliders,
  ExternalLink,
  Layers,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Zap,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  Eye,
  Box,
  RotateCcw,
} from 'lucide-react';
import { FilterSettings, ImageItem } from '../../types/studio';
import { applyAllFiltersToCanvas } from '../../engine/canvasFilters';
import { processAndScaleImage } from '../../engine/upscaleEngine';
import { RecentCreations, CreationItem, RECENT_CREATIONS } from './RecentCreations';
import { BatchStrip } from './BatchStrip';

interface CanvasStudioProps {
  settings: FilterSettings;
  onUpdateSettings: <K extends keyof FilterSettings>(category: K, values: Partial<FilterSettings[K]>) => void;
  onOpenCodeModal: () => void;
  images: ImageItem[];
  selectedImage: ImageItem | null;
  onSelectImage: (id: string) => void;
  onUploadImages: (files: File[]) => void;
  onRemoveImage: (id: string) => void;
  onStartBatch: () => void;
  onExportZip: () => void;
  isProcessingBatch?: boolean;
  isExportingZip?: boolean;
  onViewBatchQueue: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onRandomize?: () => void;
  onOpen3DStudio?: () => void;
  onOpenMobileTools?: () => void;
}

export const CanvasStudio: React.FC<CanvasStudioProps> = ({
  settings,
  onUpdateSettings,
  onOpenCodeModal,
  images,
  selectedImage,
  onSelectImage,
  onUploadImages,
  onRemoveImage,
  onStartBatch,
  onExportZip,
  isProcessingBatch = false,
  isExportingZip = false,
  onViewBatchQueue,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onRandomize,
  onOpen3DStudio,
  onOpenMobileTools,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeCreationId, setActiveCreationId] = useState<string>('electric-nebula');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [splitPos, setSplitPos] = useState<number>(50);
  const [isSplitEnabled, setIsSplitEnabled] = useState<boolean>(false);
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [isDraggingFile, setIsDraggingFile] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [bottomTab, setBottomTab] = useState<'queue' | 'presets'>('queue');

  // Source base image/canvas
  const sourceImageRef = useRef<HTMLImageElement | HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const debounceRef = useRef<any>(null);

  const currentIndex = images.findIndex(it => it.id === selectedImage?.id);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const completedCount = images.filter(it => it.status === 'completed').length;

  const renderCanvas = useCallback((isFastPreview: boolean = false) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (!sourceImageRef.current) {
        const bg = document.createElement('canvas');
        bg.width = 1200;
        bg.height = 700;
        sourceImageRef.current = bg;
      }

      const src = sourceImageRef.current;
      const origW = (src as any).naturalWidth || src.width || 1200;
      const origH = (src as any).naturalHeight || src.height || 700;

      // Display-optimized bounding box (crisp Retina viewport scaling)
      const MAX_PREVIEW = 1280;
      let prevW = origW;
      let prevH = origH;
      if (prevW > MAX_PREVIEW || prevH > MAX_PREVIEW) {
        const scale = Math.min(MAX_PREVIEW / prevW, MAX_PREVIEW / prevH);
        prevW = Math.round(prevW * scale);
        prevH = Math.round(prevH * scale);
      }

      if (canvas.width !== prevW || canvas.height !== prevH) {
        canvas.width = prevW;
        canvas.height = prevH;
      }

      applyAllFiltersToCanvas(canvas, settings, src, { isFastPreview });
    });
  }, [settings]);

  // Load active image or default generative background
  useEffect(() => {
    if (selectedImage) {
      const srcUrl = selectedImage.processedUrl || selectedImage.originalUrl;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = srcUrl;
      img.onload = () => {
        sourceImageRef.current = img;
        renderCanvas(false);
      };
    } else {
      // Default abstract gradient background
      const bg = document.createElement('canvas');
      bg.width = 1200;
      bg.height = 700;
      const ctx = bg.getContext('2d')!;

      const grad = ctx.createLinearGradient(0, 0, 1200, 700);
      grad.addColorStop(0, '#00d2ff');
      grad.addColorStop(0.35, '#9d00ff');
      grad.addColorStop(0.70, '#ff007f');
      grad.addColorStop(1, '#ff7a00');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1200, 700);

      sourceImageRef.current = bg;
      renderCanvas(false);
    }
  }, [selectedImage?.id, selectedImage?.processedUrl, selectedImage?.originalUrl, renderCanvas]);

  // Real-time smooth drag + debounced crisp settle
  useEffect(() => {
    renderCanvas(true);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      renderCanvas(false);
    }, 60);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [renderCanvas]);

  const handleSelectCreation = (creation: CreationItem) => {
    setActiveCreationId(creation.id);
    if (creation.settings.gradient) onUpdateSettings('gradient', creation.settings.gradient);
    if (creation.settings.blur) onUpdateSettings('blur', creation.settings.blur);
    if (creation.settings.noise) onUpdateSettings('noise', creation.settings.noise);
    if (creation.settings.patterns) onUpdateSettings('patterns', creation.settings.patterns);
    if (creation.settings.upscale) onUpdateSettings('upscale', creation.settings.upscale);
  };

  const handleDownload = async () => {
    if (!sourceImageRef.current) return;
    setIsExporting(true);
    try {
      const src = sourceImageRef.current;
      const { dataUrl } = await processAndScaleImage(src as any, settings);
      const link = document.createElement('a');
      const baseName = selectedImage ? selectedImage.name.replace(/\.[^/.]+$/, '') : 'gradient-x-creation';
      const ext = settings.upscale.format === 'image/jpeg' ? 'jpg' : settings.upscale.format === 'image/webp' ? 'webp' : 'png';
      link.download = `${baseName}_${settings.upscale.factor}x.${ext}`;
      link.href = dataUrl;
      link.click();
      URL.revokeObjectURL(dataUrl);
    } catch (e) {
      console.error('Export error, falling back to viewport canvas:', e);
      if (canvasRef.current) {
        const link = document.createElement('a');
        link.download = `gradient-x-creation.png`;
        link.href = canvasRef.current.toDataURL('image/png');
        link.click();
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSplit || !containerRef.current || !isSplitEnabled) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  const handleFileDrop = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const valid: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        valid.push(files[i]);
      }
    }
    if (valid.length > 0) {
      onUploadImages(valid);
    }
  };

  const handlePrevImage = () => {
    if (images.length <= 1) return;
    const prevIdx = (activeIndex - 1 + images.length) % images.length;
    onSelectImage(images[prevIdx].id);
  };

  const handleNextImage = () => {
    if (images.length <= 1) return;
    const nextIdx = (activeIndex + 1) % images.length;
    onSelectImage(images[nextIdx].id);
  };

  // Keyboard Shortcuts: Ctrl+Z (Undo), Ctrl+Y / Ctrl+Shift+Z (Redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          if (onRedo && canRedo) onRedo();
        } else {
          if (onUndo && canUndo) onUndo();
        }
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        if (onRedo && canRedo) onRedo();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUndo, onRedo, canUndo, canRedo]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-full overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDraggingSplit(false)}
      onMouseLeave={() => setIsDraggingSplit(false)}
    >
      {/* Hidden File Input for Multiple Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={e => {
          handleFileDrop(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Top Action Bar (Above Canvas) */}
      <div className="flex items-center justify-between mb-2 px-1 gap-2 overflow-x-auto scrollbar-none shrink-0 py-0.5">
        {/* Left: Editor Controls & Multi-Image Stepper */}
        <div className="flex items-center gap-2 shrink-0">
          {onOpenMobileTools && (
            <button
              onClick={onOpenMobileTools}
              className="lg:hidden px-2.5 py-1 rounded-xl bg-cyan-400 text-dark-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/25 shrink-0"
              title="Open Tool Panels"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Tools</span>
            </button>
          )}
          <span className="text-sm font-semibold text-white tracking-wide mr-1 hidden sm:inline">Editor</span>

          <div className="flex items-center bg-[#121620] p-1 rounded-xl border border-white/10 gap-0.5">
            {/* Direct Upload button (30+ files supported) */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-cyan-400 hover:bg-white/5 transition flex items-center gap-1.5"
              title="Upload images (Select 30+ files at once)"
            >
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              <span>Upload</span>
            </button>

            <span className="w-px h-4 bg-white/10 mx-0.5" />

            {/* Split View Toggle */}
            <button
              onClick={() => setIsSplitEnabled(prev => !prev)}
              className={`p-1.5 rounded-lg text-xs transition flex items-center gap-1 ${
                isSplitEnabled ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
              }`}
              title="Toggle Before/After Split Comparison View"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
            </button>

            {/* Functional Undo Button */}
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`p-1.5 rounded-lg transition ${
                canUndo ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 opacity-40 cursor-not-allowed'
              }`}
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            {/* Functional Redo Button */}
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`p-1.5 rounded-lg transition ${
                canRedo ? 'text-slate-300 hover:text-white hover:bg-white/5' : 'text-slate-600 opacity-40 cursor-not-allowed'
              }`}
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            {/* Magic Randomize Aesthetic Generator */}
            {onRandomize && (
              <button
                onClick={onRandomize}
                className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-lg transition flex items-center gap-1"
                title="Surprise Me (Generate Harmonious Aesthetic Gradient & Pattern Mix)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}

            {/* 3D Wood Studio Button */}
            {onOpen3DStudio && (
              <button
                onClick={onOpen3DStudio}
                className="p-1.5 text-amber-300 hover:text-white hover:bg-amber-500/15 rounded-lg transition flex items-center gap-1"
                title="Open 3D Wood / Lumber Texture Studio"
              >
                <Box className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>

          {/* Quick Stepper if 2+ images exist */}
          {images.length > 1 && (
            <div className="hidden lg:flex items-center bg-[#121620] px-2 py-1 rounded-xl border border-white/10 gap-1.5 text-xs text-slate-300">
              <button
                onClick={handlePrevImage}
                className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Previous Image"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-cyan-400 font-bold">#{activeIndex + 1}</span>
              <span className="text-slate-500">/</span>
              <span className="font-mono text-slate-400">{images.length}</span>
              <button
                onClick={handleNextImage}
                className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                title="Next Image"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Image Opacity Pill in Top Toolbar */}
          {images.length > 0 && (
            <div className="hidden sm:flex items-center bg-[#121620] px-2.5 py-1 rounded-xl border border-white/10 gap-2 text-xs text-slate-300 shadow-sm">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] text-slate-400">Photo:</span>
              <span className="font-mono text-cyan-400 font-bold text-xs">
                {settings.image?.opacity ?? 100}%
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.image?.opacity ?? 100}
                onChange={e => onUpdateSettings('image', { opacity: Number(e.target.value) })}
                className="w-16 accent-cyan-400 cursor-pointer h-1.5"
                title="Adjust photo opacity (0% = Pure Gradient, 100% = Full Photo)"
              />
              <div className="flex items-center gap-0.5 border-l border-white/10 pl-1">
                {[0, 50, 100].map(val => (
                  <button
                    key={val}
                    onClick={() => onUpdateSettings('image', { opacity: val })}
                    className={`px-1 py-0.2 rounded text-[9px] font-mono transition ${
                      (settings.image?.opacity ?? 100) === val
                        ? 'bg-cyan-400 text-dark-950 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                    title={val === 0 ? 'Pure Gradient (ছবি বন্ধ)' : val === 50 ? '50% Blend (হাইব্রিড)' : '100% Photo (সম্পূর্ণ ছবি)'}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Zoom Controls, Fullscreen, Code & Export */}
        <div className="flex items-center gap-2">
          {/* Zoom Control Pill */}
          <div className="flex items-center bg-[#121620] px-1 py-0.5 rounded-xl border border-white/10 text-xs text-slate-300">
            <button
              onClick={() => setZoomLevel(z => Math.max(0.3, +(z - 0.15).toFixed(2)))}
              className="p-1 hover:text-cyan-400 hover:bg-white/5 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setZoomLevel(1)}
              className="px-2 py-0.5 text-[11px] font-mono text-cyan-300 hover:text-white transition font-medium"
              title="Reset Zoom to 100%"
            >
              {Math.round(zoomLevel * 100)}%
            </button>

            <button
              onClick={() => setZoomLevel(z => Math.min(3, +(z + 0.15).toFixed(2)))}
              className="p-1 hover:text-cyan-400 hover:bg-white/5 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-3.5 bg-white/10 mx-0.5" />

            <button
              onClick={() => setZoomLevel(0.85)}
              className="px-1.5 py-0.5 text-[10px] text-slate-400 hover:text-white rounded transition"
              title="Fit Viewport"
            >
              Fit
            </button>
          </div>

          {/* Fullscreen Cinema View Toggle */}
          <button
            onClick={toggleFullscreen}
            className={`p-2 rounded-xl bg-[#121620] hover:bg-dark-800 text-slate-300 border border-white/10 transition ${
              isFullscreen ? 'text-cyan-400 border-cyan-400/40' : ''
            }`}
            title={isFullscreen ? 'Exit Fullscreen Cinema Mode' : 'Fullscreen Cinema Mode'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3.5 h-3.5" />
            ) : (
              <Maximize2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* Code Export Modal Trigger */}
          <button
            onClick={onOpenCodeModal}
            className="px-3 py-1.5 rounded-xl bg-[#121620] hover:bg-dark-800 text-xs font-medium text-slate-300 border border-white/10 flex items-center gap-1.5 transition"
            title="Export CSS, Tailwind, SVG & Canvas Code"
          >
            <Code className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Code</span>
          </button>

          {/* Download All ZIP button if completed images exist */}
          {images.length > 1 && completedCount > 0 && (
            <button
              onClick={onExportZip}
              disabled={isExportingZip}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              title="Download all processed images as ZIP archive"
            >
              {isExportingZip ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>ZIP ({completedCount})</span>
            </button>
          )}

          {/* Export Current Image Button */}
          <button
            onClick={handleDownload}
            disabled={isExporting}
            className="px-4 py-1.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-dark-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-500/25 transition active:scale-95 disabled:opacity-60 disabled:cursor-wait"
            title="Download full quality image with AI upscale"
          >
            {isExporting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-dark-950" />
                <span>Exporting...</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5 text-dark-950 stroke-[2.5]" />
                <span>Export</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Canvas Viewport (Supports 30+ File Drag & Drop) */}
      <div
        ref={containerRef}
        onDragOver={e => {
          e.preventDefault();
          setIsDraggingFile(true);
        }}
        onDragLeave={() => setIsDraggingFile(false)}
        onDrop={e => {
          e.preventDefault();
          setIsDraggingFile(false);
          handleFileDrop(e.dataTransfer.files);
        }}
        className={`flex-1 relative rounded-2xl overflow-hidden bg-[#0d1017] border shadow-2xl flex items-center justify-center p-2 transition-all min-h-[300px] ${
          isDraggingFile ? 'border-cyan-400 bg-cyan-400/10 ring-4 ring-cyan-400/20' : 'border-white/10'
        }`}
      >
        {isDraggingFile && (
          <div className="absolute inset-0 z-30 bg-dark-950/85 backdrop-blur-sm flex flex-col items-center justify-center pointer-events-none">
            <Upload className="w-12 h-12 text-cyan-400 animate-bounce mb-2" />
            <span className="text-base font-bold text-white">Drop your images here (Select up to 30+ files)</span>
            <span className="text-xs text-slate-400 mt-1">Batch processing & styling will be ready instantly</span>
          </div>
        )}

        <div
          className="relative max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl bg-transparency-grid"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Main Processed Canvas */}
          <canvas
            ref={canvasRef}
            className="block max-w-full max-h-[38vh] sm:max-h-[46vh] lg:max-h-[52vh] object-contain rounded-xl"
          />

          {/* Before view overlay if split enabled */}
          {isSplitEnabled && (
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{ width: `${splitPos}%` }}
            >
              {selectedImage ? (
                <img
                  src={selectedImage.originalUrl}
                  alt="Original"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, #00d2ff 0%, #9d00ff 35%, #ff007f 70%, #ff7a00 100%)`,
                  }}
                />
              )}
            </div>
          )}

          {/* Split divider handle */}
          {isSplitEnabled && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 shadow-glow-cyan cursor-ew-resize flex items-center justify-center z-20"
              style={{ left: `${splitPos}%` }}
              onMouseDown={() => setIsDraggingSplit(true)}
            >
              <div className="w-5 h-5 rounded-full bg-dark-900 border-2 border-cyan-400 flex items-center justify-center shadow-lg">
                <SplitSquareVertical className="w-2.5 h-2.5 text-cyan-400 rotate-90" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Batch Images Strip (30 Images) or Style Presets */}
      {images.length > 0 ? (
        <div className="flex flex-col mt-2">
          {/* Tab Bar: Uploaded Images vs Presets */}
          <div className="flex items-center justify-between px-1 mb-1">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBottomTab('queue')}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  bottomTab === 'queue'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Uploaded Images ({images.length})</span>
              </button>

              <button
                onClick={() => setBottomTab('presets')}
                className={`text-xs font-semibold px-3 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  bottomTab === 'presets'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Style Presets</span>
              </button>
            </div>

            <button
              onClick={onViewBatchQueue}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium transition"
            >
              Open Full Batch Table →
            </button>
          </div>

          {bottomTab === 'queue' ? (
            <BatchStrip
              images={images}
              selectedImageId={selectedImage?.id || null}
              onSelectImage={onSelectImage}
              onRemoveImage={onRemoveImage}
              onUploadImages={onUploadImages}
              onStartBatch={onStartBatch}
              onExportZip={onExportZip}
              isProcessing={isProcessingBatch}
              isExportingZip={isExportingZip}
              onViewBatchQueue={onViewBatchQueue}
            />
          ) : (
            <RecentCreations
              activeId={activeCreationId}
              onSelectCreation={handleSelectCreation}
              onViewAll={() => {}}
            />
          )}
        </div>
      ) : (
        <RecentCreations
          activeId={activeCreationId}
          onSelectCreation={handleSelectCreation}
          onViewAll={() => {}}
        />
      )}
    </div>
  );
};
