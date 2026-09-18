import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  Sliders,
  Sparkles,
  Layers,
  Copy,
  Check,
  SplitSquareVertical,
} from 'lucide-react';
import { ImageItem, FilterSettings } from '../../types/studio';
import { applyAllFiltersToCanvas } from '../../engine/canvasFilters';

interface SinglePreviewProps {
  image: ImageItem | null;
  settings: FilterSettings;
  onExtractPalette: () => void;
  onOpenCodeModal: () => void;
}

export const SinglePreview: React.FC<SinglePreviewProps> = ({
  image,
  settings,
  onExtractPalette,
  onOpenCodeModal,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [splitPos, setSplitPos] = useState<number>(50); // percentage (0 - 100)
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copiedColor, setCopiedColor] = useState<string | null>(null);
  const [renderTimeMs, setRenderTimeMs] = useState<number>(0);

  // Cached image object
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  // Load base image
  useEffect(() => {
    if (!image) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = image.originalUrl;
    img.onload = () => {
      imageObjRef.current = img;
      renderLivePreview();
    };
  }, [image?.id, image?.originalUrl]);

  // Re-render canvas whenever settings change
  const renderLivePreview = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageObjRef.current;
    if (!canvas || !img) return;

    const t0 = performance.now();

    // Set canvas dimensions to match image aspect ratio
    canvas.width = img.naturalWidth || 800;
    canvas.height = img.naturalHeight || 600;

    applyAllFiltersToCanvas(canvas, settings, img);

    setRenderTimeMs(Math.round(performance.now() - t0));
  }, [settings]);

  useEffect(() => {
    renderLivePreview();
  }, [renderLivePreview]);

  // Handle split slider drag
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingSplit || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 1500);
  };

  const handleDownloadCurrent = () => {
    if (!canvasRef.current || !image) return;
    const link = document.createElement('a');
    link.download = `${image.name.replace(/\.[^/.]+$/, '')}_styled.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  if (!image) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-dark-950">
        <div className="w-16 h-16 rounded-2xl bg-dark-900 border border-white/10 flex items-center justify-center mb-4 text-slate-500">
          <Layers className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-white mb-1">No Image Selected</h3>
        <p className="text-xs text-slate-400 max-w-sm">
          Select an image from the queue below or upload new files to inspect with real-time live preview.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 flex flex-col h-full bg-dark-950 overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={() => setIsDraggingSplit(false)}
      onMouseLeave={() => setIsDraggingSplit(false)}
    >
      {/* Top Inspector Toolbar */}
      <div className="h-12 border-b border-white/10 bg-dark-900/50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-white truncate max-w-xs">{image.name}</span>
          <span className="text-[11px] font-mono text-slate-500">
            {imageObjRef.current?.naturalWidth || 0} × {imageObjRef.current?.naturalHeight || 0}px
          </span>
          {renderTimeMs > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-violet/20 text-brand-violet border border-brand-violet/30">
              {renderTimeMs}ms render
            </span>
          )}
        </div>

        {/* Zoom & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-dark-800/80 p-0.5 rounded-lg border border-white/10">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
              className="p-1.5 text-slate-400 hover:text-white rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-300 px-1.5 min-w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
              className="p-1.5 text-slate-400 hover:text-white rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-slate-400 hover:text-white rounded transition"
              title="Fit"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleDownloadCurrent}
            className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5 transition"
          >
            <Download className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Save Preview</span>
          </button>
        </div>
      </div>

      {/* Center Interactive Split Viewport */}
      <div className="flex-1 relative flex items-center justify-center p-6 overflow-hidden bg-transparency-grid">
        <div
          ref={containerRef}
          className="relative max-w-full max-h-full rounded-xl overflow-hidden shadow-2xl border border-white/10"
          style={{
            transform: `scale(${zoomLevel})`,
            transition: isDraggingSplit ? 'none' : 'transform 0.15s ease',
          }}
        >
          {/* Base: Processed Live Canvas Output */}
          <canvas ref={canvasRef} className="block max-w-[80vw] max-h-[65vh] object-contain" />

          {/* Overlay: Original Image clipped by split percentage */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{ width: `${splitPos}%` }}
          >
            <img
              src={image.originalUrl}
              alt="Original"
              className="block max-w-[80vw] max-h-[65vh] object-contain"
              style={{
                width: canvasRef.current?.offsetWidth || '100%',
                height: canvasRef.current?.offsetHeight || '100%',
              }}
            />
          </div>

          {/* Split Divider Handle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-brand-cyan shadow-glow-cyan cursor-ew-resize flex items-center justify-center"
            style={{ left: `${splitPos}%` }}
            onMouseDown={() => setIsDraggingSplit(true)}
          >
            <div className="w-6 h-6 rounded-full bg-dark-900 border-2 border-brand-cyan flex items-center justify-center text-[10px] text-brand-cyan shadow-lg">
              <SplitSquareVertical className="w-3 h-3 rotate-90" />
            </div>
          </div>

          {/* Split Labels */}
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-dark-950/80 text-[10px] font-mono text-slate-300 backdrop-blur-md border border-white/10 pointer-events-none">
            Original (Before)
          </div>
          <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-dark-950/80 text-[10px] font-mono text-brand-cyan backdrop-blur-md border border-brand-cyan/20 pointer-events-none">
            Styled (After)
          </div>
        </div>
      </div>

      {/* Bottom Palette & Quick Action Bar */}
      <div className="h-14 border-t border-white/10 bg-dark-900/80 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">Extracted Palette:</span>
          {image.extractedPalette && image.extractedPalette.length > 0 ? (
            <div className="flex items-center gap-1.5">
              {image.extractedPalette.map((col, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCopyHex(col)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 border border-white/10 text-[11px] font-mono transition group"
                  title="Click to copy hex"
                >
                  <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: col }} />
                  <span className="text-slate-300 group-hover:text-white">{col}</span>
                  {copiedColor === col ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={onExtractPalette}
              className="text-xs text-brand-violet hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Auto-extract dominant palette
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCodeModal}
            className="text-xs text-slate-400 hover:text-brand-violet flex items-center gap-1 transition"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>View CSS/SVG Specs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
