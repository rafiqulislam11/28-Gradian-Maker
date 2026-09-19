import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Shield,
  SplitSquareVertical,
  Eye,
  Hand,
  MousePointer,
  RotateCcw,
} from 'lucide-react';
import { Project, Layer, Transform } from '../../types/project';
import { compositeProjectToCanvas } from '../../engine/renderer/layerCompositor';
import { TransformGizmo } from './TransformGizmo';
import { CanvasTool } from '../../store/useProjectStore';

interface CanvasViewportProps {
  project: Project;
  activeLayer: Layer | null;
  activeTool: CanvasTool;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  showGrid: boolean;
  showGuides: boolean;
  showSafeArea: boolean;
  isSplitEnabled: boolean;
  splitPos: number;
  isHoldingOriginal: boolean;
  onSetZoom: (zoom: number) => void;
  onSetPan: (pan: { x: number; y: number }) => void;
  onToggleGrid: () => void;
  onToggleSafeArea: () => void;
  onToggleSplit: () => void;
  onSetSplitPos: (pos: number) => void;
  onSetHoldingOriginal: (hold: boolean) => void;
  onUpdateTransform: (layerId: string, transform: Partial<Transform>) => void;
  onSelectLayer: (layerId: string | null) => void;
  onSetActiveTool: (tool: CanvasTool) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  project,
  activeLayer,
  activeTool,
  zoomLevel,
  panOffset,
  showGrid,
  showGuides,
  showSafeArea,
  isSplitEnabled,
  splitPos,
  isHoldingOriginal,
  onSetZoom,
  onSetPan,
  onToggleGrid,
  onToggleSafeArea,
  onToggleSplit,
  onSetSplitPos,
  onSetHoldingOriginal,
  onUpdateTransform,
  onSelectLayer,
  onSetActiveTool,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);

  // Pan dragging state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ clientX: number; clientY: number; initPan: { x: number; y: number } } | null>(null);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  // Split divider dragging state
  const [isDraggingSplit, setIsDraggingSplit] = useState(false);

  const rafRef = useRef<number | null>(null);
  const debounceRef = useRef<any>(null);

  // Render canvas pipeline
  const renderCanvas = useCallback(
    (isFast: boolean = false) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const w = project.width || 1200;
        const h = project.height || 700;

        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }

        // Check if user is holding original
        if (isHoldingOriginal) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0a0d16';
            ctx.fillRect(0, 0, w, h);
            // find first image layer and draw cleanly
            const imgLayer = project.layers.find(l => l.type === 'image');
            if (imgLayer && (imgLayer as any).src) {
              const img = new Image();
              img.crossOrigin = 'anonymous';
              img.src = (imgLayer as any).src;
              if (img.complete) {
                ctx.drawImage(img, 0, 0, w, h);
              }
            }
          }
          return;
        }

        compositeProjectToCanvas(canvas, project, { isFastPreview: isFast });
      });
    },
    [project, isHoldingOriginal]
  );

  // Re-render on project changes
  useEffect(() => {
    renderCanvas(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      renderCanvas(false);
    }, 40);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [renderCanvas]);

  // Update canvas bounds for accurate transform gizmo coordinate calculations
  useEffect(() => {
    const updateRect = () => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect());
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect);
    };
  }, [zoomLevel, panOffset, project.width, project.height]);

  // Spacebar panning shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.code === 'Space' && !e.repeat) {
        setIsSpacePressed(true);
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Wheel zoom / pan
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      const nextZoom = Math.max(0.15, Math.min(4.0, zoomLevel + delta));
      onSetZoom(Number(nextZoom.toFixed(2)));
    } else {
      onSetPan({
        x: panOffset.x - e.deltaX,
        y: panOffset.y - e.deltaY,
      });
    }
  };

  // Canvas Pan Handler
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSpacePressed || activeTool === 'pan' || e.button === 1) {
      setIsPanning(true);
      panStartRef.current = {
        clientX: e.clientX,
        clientY: e.clientY,
        initPan: { ...panOffset },
      };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isPanning && panStartRef.current) {
      const dx = e.clientX - panStartRef.current.clientX;
      const dy = e.clientY - panStartRef.current.clientY;
      onSetPan({
        x: panStartRef.current.initPan.x + dx,
        y: panStartRef.current.initPan.y + dy,
      });
      return;
    }

    if (isDraggingSplit && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
      onSetSplitPos(pct);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPanning) {
      setIsPanning(false);
      panStartRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
        // released
      }
    }
    if (isDraggingSplit) {
      setIsDraggingSplit(false);
    }
  };

  const handleFitToScreen = () => {
    if (!containerRef.current) return;
    const cw = containerRef.current.clientWidth - 80;
    const ch = containerRef.current.clientHeight - 80;
    const s = Math.min(cw / project.width, ch / project.height, 1.0);
    onSetZoom(Number(s.toFixed(2)));
    onSetPan({ x: 0, y: 0 });
  };

  const isPanMode = isSpacePressed || activeTool === 'pan';

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative flex-1 h-full w-full overflow-hidden bg-[#070910] select-none flex items-center justify-center ${
        isPanMode ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default'
      }`}
    >
      {/* 1. TOP FLOATING CONTROLS TOOLBAR */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 p-1 rounded-2xl bg-[#0e121d]/90 border border-white/10 shadow-2xl backdrop-blur-xl">
        <button
          onClick={() => onSetActiveTool('select')}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
            activeTool === 'select'
              ? 'bg-cyan-500 text-dark-950 font-bold shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Select & Move Tool (V)"
        >
          <MousePointer className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={() => onSetActiveTool('pan')}
          className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
            activeTool === 'pan'
              ? 'bg-cyan-500 text-dark-950 font-bold shadow-md shadow-cyan-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Pan Hand Tool (H / Space)"
        >
          <Hand className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Zoom Controls */}
        <button
          onClick={() => onSetZoom(Math.max(0.15, Number((zoomLevel - 0.15).toFixed(2))))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onSetZoom(1.0)}
          className="px-2 py-0.5 rounded-md font-mono text-[11px] text-cyan-300 font-bold hover:bg-white/5 transition"
          title="Reset 100%"
        >
          {Math.round(zoomLevel * 100)}%
        </button>
        <button
          onClick={() => onSetZoom(Math.min(4.0, Number((zoomLevel + 0.15).toFixed(2))))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleFitToScreen}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
          title="Fit to Window"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Grid & Guides */}
        <button
          onClick={onToggleGrid}
          className={`p-1.5 rounded-lg transition ${
            showGrid ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle Grid (Ctrl+')"
        >
          <Grid className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onToggleSafeArea}
          className={`p-1.5 rounded-lg transition ${
            showSafeArea ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle Safe Area"
        >
          <Shield className="w-3.5 h-3.5" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        {/* Before / After Split Slider */}
        <button
          onClick={onToggleSplit}
          className={`p-1.5 rounded-lg transition ${
            isSplitEnabled ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle Before/After Split Comparison"
        >
          <SplitSquareVertical className="w-3.5 h-3.5" />
        </button>

        {/* Hold to Preview Original */}
        <button
          onMouseDown={() => onSetHoldingOriginal(true)}
          onMouseUp={() => onSetHoldingOriginal(false)}
          onTouchStart={() => onSetHoldingOriginal(true)}
          onTouchEnd={() => onSetHoldingOriginal(false)}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
            isHoldingOriginal
              ? 'bg-amber-400 text-dark-950 shadow-md shadow-amber-400/30'
              : 'bg-dark-950/80 text-slate-300 hover:text-white border border-white/10'
          }`}
          title="Hold down to preview original base"
        >
          <Eye className="w-3 h-3" />
          <span>Hold Original</span>
        </button>
      </div>

      {/* 2. MAIN TRANSFORMED VIEWPORT STAGE */}
      <div
        className="relative shadow-2xl transition-transform duration-75 origin-center"
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          width: `${project.width}px`,
          height: `${project.height}px`,
        }}
      >
        {/* Render Canvas */}
        <canvas
          ref={canvasRef}
          width={project.width}
          height={project.height}
          className="rounded-lg shadow-2xl block bg-transparent"
        />

        {/* Grid Overlay */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none rounded-lg"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                                linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        )}

        {/* Safe Area Guides */}
        {showSafeArea && (
          <div className="absolute inset-10 border border-dashed border-cyan-400/50 pointer-events-none rounded flex items-start justify-end p-2">
            <span className="text-[9px] font-mono text-cyan-300 font-bold bg-dark-950/80 px-1 py-0.5 rounded border border-cyan-400/30">
              Safe Zone
            </span>
          </div>
        )}

        {/* Split Screen Divider */}
        {isSplitEnabled && (
          <div
            className="absolute top-0 bottom-0 z-30 cursor-ew-resize flex items-center justify-center select-none"
            style={{ left: `${splitPos}%` }}
            onPointerDown={e => {
              e.stopPropagation();
              setIsDraggingSplit(true);
            }}
          >
            <div className="w-0.5 h-full bg-cyan-400 shadow-glow-cyan" />
            <div className="absolute w-6 h-6 rounded-full bg-cyan-400 border-2 border-dark-950 shadow-xl flex items-center justify-center text-dark-950 font-black text-[9px]">
              ↔
            </div>
          </div>
        )}
      </div>

      {/* 3. TRANSFORM GIZMO (Mounted when active layer is selected and tool is 'select') */}
      {activeLayer && activeTool === 'select' && (
        <TransformGizmo
          layer={activeLayer}
          canvasWidth={project.width}
          canvasHeight={project.height}
          zoomLevel={zoomLevel}
          panOffset={panOffset}
          canvasRect={canvasRect}
          onUpdateTransform={updates => onUpdateTransform(activeLayer.id, updates)}
        />
      )}

      {/* 4. BOTTOM STATUS HUD */}
      <div className="absolute bottom-3 left-4 z-40 flex items-center gap-3 px-3 py-1 rounded-xl bg-[#0e121d]/85 border border-white/10 text-[11px] font-mono text-slate-400 backdrop-blur-md">
        <span>
          {project.width} × {project.height} px
        </span>
        <span>•</span>
        <span>{project.layers.length} Layers</span>
        <span>•</span>
        <span className="text-cyan-400">{activeLayer ? activeLayer.name : 'Canvas'}</span>
      </div>
    </div>
  );
};
