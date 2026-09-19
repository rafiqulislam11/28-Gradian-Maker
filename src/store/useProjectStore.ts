import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Project,
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
  ColorGradeLayer,
  ShadowLayer,
  AdjustmentLayer,
  Transform,
  DesignRecipe,
  DEFAULT_TRANSFORM,
  DEFAULT_ADJUSTMENTS,
} from '../types/project';

export type CanvasTool = 'select' | 'pan' | 'gradient' | 'pattern' | 'shape' | 'text' | 'crop';

export const DEFAULT_INITIAL_PROJECT: Project = {
  id: 'proj_default',
  name: 'Untitled Studio Project',
  width: 1200,
  height: 700,
  background: {
    type: 'color',
    color: '#0a0d16',
  },
  layers: [
    {
      id: 'layer_bg_gradient',
      name: 'Electric Aurora Mesh',
      type: 'gradient',
      visible: true,
      locked: false,
      opacity: 85,
      blendMode: 'normal',
      transform: { ...DEFAULT_TRANSFORM, width: 1200, height: 700 },
      order: 0,
      gradientType: 'mesh',
      angle: 45,
      stops: [
        { id: '1', color: '#00d2ff', position: 0 },
        { id: '2', color: '#9d00ff', position: 35 },
        { id: '3', color: '#ff007f', position: 70 },
        { id: '4', color: '#ff7a00', position: 100 },
      ],
      meshColors: ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00'],
    },
    {
      id: 'layer_pattern_overlay',
      name: 'Cyber Geometric Matrix',
      type: 'pattern',
      visible: true,
      locked: false,
      opacity: 50,
      blendMode: 'overlay',
      transform: { ...DEFAULT_TRANSFORM, width: 1200, height: 700 },
      order: 1,
      patternType: 'pat_tech_001',
      scale: 50,
      rotation: 0,
      offsetX: 0,
      offsetY: 0,
      spacing: 20,
      density: 50,
      strokeWidth: 1.5,
      strokeOpacity: 85,
      fillOpacity: 25,
      color: '#00f0ff',
      fullFill: true,
      fillMode: 'both',
    },
    {
      id: 'layer_title_text',
      name: 'Header Typography',
      type: 'text',
      visible: true,
      locked: false,
      opacity: 100,
      blendMode: 'normal',
      transform: { ...DEFAULT_TRANSFORM, x: 100, y: 260, width: 1000, height: 180 },
      order: 2,
      text: 'GRADIENT X\nSTUDIO PRO',
      fontFamily: 'system-ui, sans-serif',
      fontSize: 68,
      fontWeight: 900,
      lineHeight: 1.1,
      letterSpacing: -0.5,
      color: '#ffffff',
      align: 'left',
      shadowBlur: 20,
      shadowColor: 'rgba(0,0,0,0.85)',
      shadowOffsetX: 0,
      shadowOffsetY: 6,
    },
  ],
  activeLayerId: 'layer_title_text',
  selectedLayerIds: ['layer_title_text'],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export function useProjectStore() {
  const [project, setProject] = useState<Project>(() => {
    // Try restore from localStorage
    try {
      const saved = localStorage.getItem('gx_studio_active_project');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // fallback
    }
    return DEFAULT_INITIAL_PROJECT;
  });

  const [activeTool, setActiveTool] = useState<CanvasTool>('select');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(false);
  const [showGuides, setShowGuides] = useState<boolean>(true);
  const [showSafeArea, setShowSafeArea] = useState<boolean>(false);
  const [isSplitEnabled, setIsSplitEnabled] = useState<boolean>(false);
  const [splitPos, setSplitPos] = useState<number>(50); // 0 - 100 %
  const [isHoldingOriginal, setIsHoldingOriginal] = useState<boolean>(false);

  // History Stack (Undo / Redo)
  const historyRef = useRef<Project[]>([JSON.parse(JSON.stringify(DEFAULT_INITIAL_PROJECT))]);
  const historyIdxRef = useRef<number>(0);
  const [, setHistoryVer] = useState(0);
  const isUndoRedoRef = useRef(false);
  const debounceTimerRef = useRef<any>(null);

  const canUndo = historyIdxRef.current > 0;
  const canRedo = historyIdxRef.current < historyRef.current.length - 1;

  const pushHistory = useCallback((nextProject: Project) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const idx = historyIdxRef.current;
      const truncated = historyRef.current.slice(0, idx + 1);
      truncated.push(JSON.parse(JSON.stringify(nextProject)));
      if (truncated.length > 30) truncated.shift();
      historyRef.current = truncated;
      historyIdxRef.current = truncated.length - 1;
      setHistoryVer(v => v + 1);

      // Autosave to localStorage
      try {
        localStorage.setItem('gx_studio_active_project', JSON.stringify(nextProject));
      } catch (e) {
        // quota limit
      }
    }, 150);
  }, []);

  const undo = useCallback(() => {
    if (historyIdxRef.current > 0) {
      historyIdxRef.current -= 1;
      const prev = historyRef.current[historyIdxRef.current];
      isUndoRedoRef.current = true;
      setProject(JSON.parse(JSON.stringify(prev)));
      setHistoryVer(v => v + 1);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIdxRef.current < historyRef.current.length - 1) {
      historyIdxRef.current += 1;
      const next = historyRef.current[historyIdxRef.current];
      isUndoRedoRef.current = true;
      setProject(JSON.parse(JSON.stringify(next)));
      setHistoryVer(v => v + 1);
    }
  }, []);

  // Update Project Dimension / Background
  const updateProjectMeta = useCallback((updates: Partial<Project>) => {
    setProject(prev => {
      const next: Project = { ...prev, ...updates, updatedAt: Date.now() };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Select Active Layer
  const setSelectedLayer = useCallback((layerId: string | null) => {
    setProject(prev => ({
      ...prev,
      activeLayerId: layerId,
      selectedLayerIds: layerId ? [layerId] : [],
    }));
  }, []);

  // Add Layer
  const addLayer = useCallback((newLayerData: Partial<Layer>) => {
    setProject(prev => {
      const newId = `layer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const order = prev.layers.length;
      const base: Layer = {
        id: newId,
        name: newLayerData.name || `Layer ${order + 1}`,
        type: newLayerData.type || 'shape',
        visible: true,
        locked: false,
        opacity: 100,
        blendMode: 'normal',
        transform: {
          ...DEFAULT_TRANSFORM,
          width: Math.min(prev.width * 0.8, 600),
          height: Math.min(prev.height * 0.8, 400),
          x: prev.width / 2 - Math.min(prev.width * 0.8, 600) / 2,
          y: prev.height / 2 - Math.min(prev.height * 0.8, 400) / 2,
          ...(newLayerData.transform || {}),
        },
        order,
        ...(newLayerData as any),
      };

      const next: Project = {
        ...prev,
        layers: [...prev.layers, base],
        activeLayerId: newId,
        selectedLayerIds: [newId],
        updatedAt: Date.now(),
      };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Update Layer
  const updateLayer = useCallback(<T extends Layer>(layerId: string, updates: Partial<T>) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => (l.id === layerId ? ({ ...l, ...updates } as Layer) : l));
      const next: Project = {
        ...prev,
        layers: nextLayers,
        updatedAt: Date.now(),
      };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Update Transform of a Layer
  const updateTransform = useCallback((layerId: string, transformPartial: Partial<Transform>) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => {
        if (l.id !== layerId) return l;
        return {
          ...l,
          transform: {
            ...l.transform,
            ...transformPartial,
          },
        };
      });
      const next: Project = {
        ...prev,
        layers: nextLayers,
        updatedAt: Date.now(),
      };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Delete Layer
  const removeLayer = useCallback((layerId: string) => {
    setProject(prev => {
      const filtered = prev.layers.filter(l => l.id !== layerId);
      const reindexed = filtered.map((l, idx) => ({ ...l, order: idx }));
      const newActive = prev.activeLayerId === layerId ? (reindexed[reindexed.length - 1]?.id || null) : prev.activeLayerId;
      const next: Project = {
        ...prev,
        layers: reindexed,
        activeLayerId: newActive,
        selectedLayerIds: newActive ? [newActive] : [],
        updatedAt: Date.now(),
      };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Duplicate Layer
  const duplicateLayer = useCallback((layerId: string) => {
    setProject(prev => {
      const target = prev.layers.find(l => l.id === layerId);
      if (!target) return prev;
      const clone: Layer = JSON.parse(JSON.stringify(target));
      clone.id = `layer_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      clone.name = `${target.name} Copy`;
      clone.order = prev.layers.length;
      clone.transform.x += 25;
      clone.transform.y += 25;

      const next: Project = {
        ...prev,
        layers: [...prev.layers, clone],
        activeLayerId: clone.id,
        selectedLayerIds: [clone.id],
        updatedAt: Date.now(),
      };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Reorder Layers (e.g. move up/down in stack)
  const reorderLayers = useCallback((fromIndex: number, toIndex: number) => {
    setProject(prev => {
      if (fromIndex < 0 || fromIndex >= prev.layers.length || toIndex < 0 || toIndex >= prev.layers.length) return prev;
      const layers = [...prev.layers];
      const [moved] = layers.splice(fromIndex, 1);
      layers.splice(toIndex, 0, moved);
      const reordered = layers.map((l, i) => ({ ...l, order: i }));
      const next: Project = { ...prev, layers: reordered, updatedAt: Date.now() };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Toggle Visibility
  const toggleLayerVisibility = useCallback((layerId: string) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => (l.id === layerId ? { ...l, visible: !l.visible } : l));
      const next = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Toggle Lock
  const toggleLayerLock = useCallback((layerId: string) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => (l.id === layerId ? { ...l, locked: !l.locked } : l));
      const next = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Toggle Solo
  const toggleLayerSolo = useCallback((layerId: string) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => (l.id === layerId ? { ...l, solo: !l.solo } : l));
      const next = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Rename Layer
  const renameLayer = useCallback((layerId: string, newName: string) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => (l.id === layerId ? { ...l, name: newName } : l));
      const next = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Center Layer on Canvas
  const centerLayer = useCallback((layerId: string) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => {
        if (l.id !== layerId) return l;
        return {
          ...l,
          transform: {
            ...l.transform,
            x: Math.round((prev.width - l.transform.width) / 2),
            y: Math.round((prev.height - l.transform.height) / 2),
          },
        };
      });
      const next = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Flip Horizontal / Vertical
  const flipHorizontal = useCallback((layerId: string) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => (l.id === layerId ? { ...l, transform: { ...l.transform, flipH: !l.transform.flipH } } : l));
      const next = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  const flipVertical = useCallback((layerId: string) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => (l.id === layerId ? { ...l, transform: { ...l.transform, flipV: !l.transform.flipV } } : l));
      const next = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Reset Transform
  const resetTransform = useCallback((layerId: string) => {
    setProject(prev => {
      const nextLayers = prev.layers.map(l => {
        if (l.id !== layerId) return l;
        return {
          ...l,
          transform: {
            ...DEFAULT_TRANSFORM,
            width: l.transform.width,
            height: l.transform.height,
            x: Math.round((prev.width - l.transform.width) / 2),
            y: Math.round((prev.height - l.transform.height) / 2),
          },
        };
      });
      const next = { ...prev, layers: nextLayers, updatedAt: Date.now() };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Apply a Design Recipe
  const applyRecipe = useCallback((recipe: DesignRecipe) => {
    setProject(prev => {
      const newLayers: Layer[] = recipe.layers.map((l, idx) => ({
        ...l,
        id: `layer_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        order: idx,
      })) as Layer[];

      const next: Project = {
        ...prev,
        width: recipe.width || prev.width,
        height: recipe.height || prev.height,
        background: recipe.background || prev.background,
        layers: newLayers,
        activeLayerId: newLayers[newLayers.length - 1]?.id || null,
        selectedLayerIds: newLayers[newLayers.length - 1] ? [newLayers[newLayers.length - 1].id] : [],
        updatedAt: Date.now(),
      };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Reset Project to Default
  const resetProject = useCallback(() => {
    const fresh: Project = JSON.parse(JSON.stringify(DEFAULT_INITIAL_PROJECT));
    fresh.id = `proj_${Date.now()}`;
    setProject(fresh);
    pushHistory(fresh);
  }, [pushHistory]);

  const activeLayer = project.layers.find(l => l.id === project.activeLayerId) || null;

  return {
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
    canUndo,
    canRedo,
    setProject,
    setActiveTool,
    setZoomLevel,
    setPanOffset,
    setShowGrid,
    setShowGuides,
    setShowSafeArea,
    setIsSplitEnabled,
    setSplitPos,
    setIsHoldingOriginal,
    setSelectedLayer,
    addLayer,
    updateLayer,
    updateTransform,
    removeLayer,
    duplicateLayer,
    reorderLayers,
    toggleLayerVisibility,
    toggleLayerLock,
    toggleLayerSolo,
    renameLayer,
    centerLayer,
    flipHorizontal,
    flipVertical,
    resetTransform,
    applyRecipe,
    resetProject,
    updateProjectMeta,
    undo,
    redo,
  };
}
