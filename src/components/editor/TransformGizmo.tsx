import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Transform, Layer } from '../../types/project';

interface TransformGizmoProps {
  layer: Layer;
  canvasWidth: number;
  canvasHeight: number;
  zoomLevel: number;
  panOffset: { x: number; y: number };
  canvasRect: DOMRect | null;
  onUpdateTransform: (updates: Partial<Transform>) => void;
}

type DragMode = 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'rotate' | null;

export const TransformGizmo: React.FC<TransformGizmoProps> = ({
  layer,
  canvasWidth,
  canvasHeight,
  zoomLevel,
  panOffset,
  canvasRect,
  onUpdateTransform,
}) => {
  const tf = layer.transform;
  const [dragMode, setDragMode] = useState<DragMode>(null);
  const dragStartRef = useRef<{
    pointerX: number;
    pointerY: number;
    initTf: Transform;
    centerCanvasX: number;
    centerCanvasY: number;
  } | null>(null);

  // Snapping indicators
  const [snapX, setSnapX] = useState<boolean>(false);
  const [snapY, setSnapY] = useState<boolean>(false);

  // Screen to Canvas coordinate converter
  const screenToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRect) return { x: 0, y: 0 };
      const rawX = clientX - canvasRect.left;
      const rawY = clientY - canvasRect.top;
      // Undo zoom & pan
      const x = (rawX - panOffset.x) / zoomLevel;
      const y = (rawY - panOffset.y) / zoomLevel;
      return { x, y };
    },
    [canvasRect, panOffset.x, panOffset.y, zoomLevel]
  );

  const handlePointerDown = (e: React.PointerEvent, mode: DragMode) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    const canvasPt = screenToCanvas(e.clientX, e.clientY);
    dragStartRef.current = {
      pointerX: canvasPt.x,
      pointerY: canvasPt.y,
      initTf: { ...tf },
      centerCanvasX: tf.x + tf.width / 2,
      centerCanvasY: tf.y + tf.height / 2,
    };
    setDragMode(mode);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragMode || !dragStartRef.current) return;
    e.stopPropagation();

    const canvasPt = screenToCanvas(e.clientX, e.clientY);
    const start = dragStartRef.current;
    const dx = canvasPt.x - start.pointerX;
    const dy = canvasPt.y - start.pointerY;
    const init = start.initTf;

    if (dragMode === 'move') {
      let nextX = Math.round(init.x + dx);
      let nextY = Math.round(init.y + dy);

      // Snap to canvas center
      const layerCenterX = nextX + init.width / 2;
      const layerCenterY = nextY + init.height / 2;
      const canvasMidX = canvasWidth / 2;
      const canvasMidY = canvasHeight / 2;

      const snapThreshold = 10;
      let isSnapX = false;
      let isSnapY = false;

      if (Math.abs(layerCenterX - canvasMidX) < snapThreshold) {
        nextX = Math.round(canvasMidX - init.width / 2);
        isSnapX = true;
      }
      if (Math.abs(layerCenterY - canvasMidY) < snapThreshold) {
        nextY = Math.round(canvasMidY - init.height / 2);
        isSnapY = true;
      }

      setSnapX(isSnapX);
      setSnapY(isSnapY);

      onUpdateTransform({ x: nextX, y: nextY });
      return;
    }

    if (dragMode === 'rotate') {
      const cx = start.centerCanvasX;
      const cy = start.centerCanvasY;
      const angleRad = Math.atan2(canvasPt.y - cy, canvasPt.x - cx);
      let deg = Math.round((angleRad * 180) / Math.PI) + 90; // stem is at top (-90 deg offset)
      if (deg < 0) deg += 360;

      // Snap to 0, 45, 90, 180, 270 deg
      const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
      for (const sa of snapAngles) {
        if (Math.abs(deg - sa) < 4) {
          deg = sa % 360;
          break;
        }
      }

      onUpdateTransform({ rotation: deg });
      return;
    }

    // Resize Handles
    let nextW = init.width;
    let nextH = init.height;
    let nextX = init.x;
    let nextY = init.y;

    if (dragMode.includes('e')) {
      nextW = Math.max(20, Math.round(init.width + dx));
    }
    if (dragMode.includes('s')) {
      nextH = Math.max(20, Math.round(init.height + dy));
    }
    if (dragMode.includes('w')) {
      const candW = Math.max(20, Math.round(init.width - dx));
      nextX = Math.round(init.x + (init.width - candW));
      nextW = candW;
    }
    if (dragMode.includes('n')) {
      const candH = Math.max(20, Math.round(init.height - dy));
      nextY = Math.round(init.y + (init.height - candH));
      nextH = candH;
    }

    onUpdateTransform({ x: nextX, y: nextY, width: nextW, height: nextH });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragMode) {
      e.stopPropagation();
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch (err) {
        // pointer capture released
      }
      setDragMode(null);
      dragStartRef.current = null;
      setSnapX(false);
      setSnapY(false);
    }
  };

  // Nudge with arrow keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      const step = e.shiftKey ? 10 : 1;
      if (e.key === 'ArrowLeft') {
        onUpdateTransform({ x: tf.x - step });
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        onUpdateTransform({ x: tf.x + step });
        e.preventDefault();
      } else if (e.key === 'ArrowUp') {
        onUpdateTransform({ y: tf.y - step });
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        onUpdateTransform({ y: tf.y + step });
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tf.x, tf.y, onUpdateTransform]);

  if (layer.locked) return null;

  // Render bounding box in canvas coordinate space
  return (
    <>
      {/* Snap Guides */}
      {snapX && (
        <div
          className="absolute top-0 bottom-0 pointer-events-none border-l border-cyan-400 z-40"
          style={{ left: `${(canvasWidth / 2) * zoomLevel + panOffset.x}px` }}
        />
      )}
      {snapY && (
        <div
          className="absolute left-0 right-0 pointer-events-none border-t border-cyan-400 z-40"
          style={{ top: `${(canvasHeight / 2) * zoomLevel + panOffset.y}px` }}
        />
      )}

      {/* Main Bounding Box */}
      <div
        className="absolute pointer-events-auto select-none ring-1 ring-cyan-400 border border-cyan-400/80 shadow-lg cursor-move z-30"
        style={{
          left: `${tf.x * zoomLevel + panOffset.x}px`,
          top: `${tf.y * zoomLevel + panOffset.y}px`,
          width: `${tf.width * zoomLevel}px`,
          height: `${tf.height * zoomLevel}px`,
          transform: `rotate(${tf.rotation}deg)`,
          transformOrigin: 'center',
        }}
        onPointerDown={e => handlePointerDown(e, 'move')}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Rotation Stem & Handle */}
        <div
          className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing"
          onPointerDown={e => handlePointerDown(e, 'rotate')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-dark-950 shadow-md hover:scale-125 transition-transform" />
          <div className="w-0.5 h-3.5 bg-cyan-400" />
        </div>

        {/* 8 Resize Handles */}
        <div
          className="absolute -top-1.5 -left-1.5 w-3 h-3 rounded-sm bg-white border-2 border-cyan-500 cursor-nwse-resize shadow-md"
          onPointerDown={e => handlePointerDown(e, 'nw')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div
          className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-sm bg-white border-2 border-cyan-500 cursor-ns-resize shadow-md"
          onPointerDown={e => handlePointerDown(e, 'n')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div
          className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-sm bg-white border-2 border-cyan-500 cursor-nesw-resize shadow-md"
          onPointerDown={e => handlePointerDown(e, 'ne')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div
          className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 rounded-sm bg-white border-2 border-cyan-500 cursor-ew-resize shadow-md"
          onPointerDown={e => handlePointerDown(e, 'e')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div
          className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rounded-sm bg-white border-2 border-cyan-500 cursor-nwse-resize shadow-md"
          onPointerDown={e => handlePointerDown(e, 'se')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div
          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-sm bg-white border-2 border-cyan-500 cursor-ns-resize shadow-md"
          onPointerDown={e => handlePointerDown(e, 's')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div
          className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rounded-sm bg-white border-2 border-cyan-500 cursor-nesw-resize shadow-md"
          onPointerDown={e => handlePointerDown(e, 'sw')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />
        <div
          className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3 h-3 rounded-sm bg-white border-2 border-cyan-500 cursor-ew-resize shadow-md"
          onPointerDown={e => handlePointerDown(e, 'w')}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        />

        {/* Dimension HUD */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-dark-950/90 border border-white/20 text-[10px] font-mono text-cyan-300 font-bold whitespace-nowrap pointer-events-none shadow-md">
          {Math.round(tf.width)} × {Math.round(tf.height)} px {tf.rotation ? `• ${tf.rotation}°` : ''}
        </div>
      </div>
    </>
  );
};
