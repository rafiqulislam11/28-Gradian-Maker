import { useState, useEffect, useRef, useCallback } from 'react';
import { ImageItem, FilterSettings, QueueStats, Preset } from '../types/studio';
import { DEFAULT_FILTER_SETTINGS, CREATIVE_PRESETS } from '../engine/presets';
import { BatchWorkerPool } from '../engine/workerPool';
import { exportImagesAsZip, ZipExportProgress } from '../engine/exportZip';
import { extractPaletteFromImage } from '../engine/colorExtractor';

export type StudioTab = 'presets' | 'gradient' | 'blur' | 'noise' | 'patterns' | 'upscale';
export type ViewportMode = 'single' | 'batch';

export function useStudio() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<StudioTab>('presets');
  const [viewMode, setViewMode] = useState<ViewportMode>('single');
  const [settings, setSettings] = useState<FilterSettings>(DEFAULT_FILTER_SETTINGS);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<ZipExportProgress | null>(null);

  const [stats, setStats] = useState<QueueStats>({
    total: 0,
    completed: 0,
    processing: 0,
    queued: 0,
    failed: 0,
    startTime: null,
    elapsedMs: 0,
    estimatedRemainingMs: 0,
    throughputFps: 0,
    activeWorkers: 0,
  });

  const workerPoolRef = useRef<BatchWorkerPool | null>(null);

  // Initialize Worker Pool
  useEffect(() => {
    const pool = new BatchWorkerPool({
      onItemStart: (id: string) => {
        setImages(prev =>
          prev.map(img => (img.id === id ? { ...img, status: 'processing', progress: 50 } : img))
        );
      },
      onItemSuccess: (id: string, processedUrl: string, _blob: Blob, timeMs: number) => {
        setImages(prev =>
          prev.map(img =>
            img.id === id
              ? {
                  ...img,
                  status: 'completed',
                  progress: 100,
                  processedUrl,
                  processingTimeMs: timeMs,
                }
              : img
          )
        );
      },
      onItemError: (id: string, error: string) => {
        setImages(prev =>
          prev.map(img =>
            img.id === id
              ? {
                  ...img,
                  status: 'failed',
                  progress: 0,
                  error,
                }
              : img
          )
        );
      },
      onQueueComplete: () => {
        setIsProcessing(false);
        setIsPaused(false);
      },
      onStatsChange: (newStats: QueueStats) => {
        setStats(newStats);
      },
    });

    workerPoolRef.current = pool;

    return () => {
      pool.cancel();
    };
  }, []);

  // Add images to studio
  const addImages = useCallback((newItems: ImageItem[]) => {
    setImages(prev => {
      const combined = [...prev, ...newItems];
      if (!selectedImageId && combined.length > 0) {
        setSelectedImageId(combined[0].id);
      }
      return combined;
    });

    // Auto extract palette for first image if not present
    if (newItems.length > 0 && !newItems[0].extractedPalette) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = newItems[0].originalUrl;
      img.onload = async () => {
        try {
          const colors = await extractPaletteFromImage(img, 5);
          setImages(prev =>
            prev.map(item => (item.id === newItems[0].id ? { ...item, extractedPalette: colors } : item))
          );
        } catch (e) {
          console.warn('Palette auto extraction failed:', e);
        }
      };
    }
  }, [selectedImageId]);

  // Remove single image
  const removeImage = useCallback((id: string) => {
    setImages(prev => {
      const filtered = prev.filter(it => it.id !== id);
      if (selectedImageId === id) {
        setSelectedImageId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  }, [selectedImageId]);

  // Clear all images
  const clearImages = useCallback(() => {
    if (isProcessing && workerPoolRef.current) {
      workerPoolRef.current.cancel();
    }
    setIsProcessing(false);
    setIsPaused(false);
    setImages([]);
    setSelectedImageId(null);
    setStats({
      total: 0,
      completed: 0,
      processing: 0,
      queued: 0,
      failed: 0,
      startTime: null,
      elapsedMs: 0,
      estimatedRemainingMs: 0,
      throughputFps: 0,
      activeWorkers: 0,
    });
  }, [isProcessing]);

  // History Stack for Undo / Redo
  const historyRef = useRef<FilterSettings[]>([JSON.parse(JSON.stringify(DEFAULT_FILTER_SETTINGS))]);
  const historyIndexRef = useRef<number>(0);
  const [, setHistoryVersion] = useState(0);
  const isUndoRedoRef = useRef(false);
  const historyTimerRef = useRef<any>(null);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const pushHistory = useCallback((newSettings: FilterSettings) => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    if (historyTimerRef.current) {
      clearTimeout(historyTimerRef.current);
    }
    historyTimerRef.current = setTimeout(() => {
      const idx = historyIndexRef.current;
      const truncated = historyRef.current.slice(0, idx + 1);
      truncated.push(JSON.parse(JSON.stringify(newSettings)));
      if (truncated.length > 40) {
        truncated.shift();
      }
      historyRef.current = truncated;
      historyIndexRef.current = truncated.length - 1;
      setHistoryVersion(v => v + 1);
    }, 200);
  }, []);

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current -= 1;
      const prev = historyRef.current[historyIndexRef.current];
      isUndoRedoRef.current = true;
      setSettings(JSON.parse(JSON.stringify(prev)));
      setHistoryVersion(v => v + 1);
    }
  }, []);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current += 1;
      const next = historyRef.current[historyIndexRef.current];
      isUndoRedoRef.current = true;
      setSettings(JSON.parse(JSON.stringify(next)));
      setHistoryVersion(v => v + 1);
    }
  }, []);

  // Apply a preset
  const applyPreset = useCallback((preset: Preset) => {
    setSettings(prev => {
      const next: FilterSettings = {
        ...prev,
        ...preset.settings,
        gradient: { ...prev.gradient, ...(preset.settings.gradient || {}) },
        blur: { ...prev.blur, ...(preset.settings.blur || {}) },
        noise: { ...prev.noise, ...(preset.settings.noise || {}) },
        patterns: { ...prev.patterns, ...(preset.settings.patterns || {}) },
        upscale: { ...prev.upscale, ...(preset.settings.upscale || {}) },
      };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Update specific filter settings
  const updateSettings = useCallback(
    <K extends keyof FilterSettings>(category: K, values: Partial<FilterSettings[K]>) => {
      setSettings(prev => {
        const next = {
          ...prev,
          [category]: {
            ...prev[category],
            ...values,
          },
        };
        pushHistory(next);
        return next;
      });
    },
    [pushHistory]
  );

  // Randomize all settings for instant inspiration
  const randomizeSettings = useCallback(() => {
    const palettes = [
      ['#00f0ff', '#7928ca', '#ff0080', '#ff8000'],
      ['#00c6ff', '#0072ff', '#9d00ff', '#f107a3'],
      ['#f857a6', '#ff5858', '#fbc531', '#4cd137'],
      ['#0575e6', '#00f260', '#38ef7d', '#11998e'],
      ['#8a2387', '#e94057', '#f27121', '#ffa07a'],
      ['#130cb7', '#52e5e7', '#fbc531', '#4cd137'],
      ['#ff0844', '#ffb199', '#fa709a', '#fee140'],
      ['#6a11cb', '#2575fc', '#00d2ff', '#3a7bd5'],
      ['#10b981', '#06b6d4', '#6366f1', '#ec4899'],
    ];
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    const gradTypes: ('mesh' | 'linear' | 'radial' | 'conical')[] = ['mesh', 'linear', 'radial', 'conical'];
    const chosenType = gradTypes[Math.floor(Math.random() * gradTypes.length)];
    const randomAngle = Math.floor(Math.random() * 360);

    const blurTypes: ('mesh' | 'linear' | 'radial' | 'glass' | 'tiltshift')[] = ['mesh', 'radial', 'glass', 'tiltshift'];
    const chosenBlur = blurTypes[Math.floor(Math.random() * blurTypes.length)];

    const randomPatterns = ['lightning', 'pat_geo_001', 'pat_sac_001', 'pat_tec_001', 'pat_jap_001', 'pat_min_001', 'pat_fab_001', 'none'];
    const chosenPat = randomPatterns[Math.floor(Math.random() * randomPatterns.length)];

    setSettings(prev => {
      const next: FilterSettings = {
        ...prev,
        gradient: {
          ...prev.gradient,
          enabled: true,
          type: chosenType,
          angle: randomAngle,
          opacity: Math.floor(Math.random() * 25) + 75,
          stops: palette.map((c, i) => ({
            id: String(i + 1),
            color: c,
            position: Math.round((i / (palette.length - 1)) * 100),
          })),
          meshColors: [palette[0], palette[1], palette[2], palette[3]],
        },
        blur: {
          ...prev.blur,
          enabled: true,
          category: chosenBlur,
          radius: Math.floor(Math.random() * 35) + 15,
          glassFrost: Math.floor(Math.random() * 40) + 50,
        },
        noise: {
          ...prev.noise,
          enabled: true,
          amount: Math.floor(Math.random() * 18) + 8,
        },
        patterns: {
          ...prev.patterns,
          enabled: chosenPat !== 'none',
          type: chosenPat,
          color: palette[0],
          opacity: Math.floor(Math.random() * 30) + 65,
        },
      };
      pushHistory(next);
      return next;
    });
  }, [pushHistory]);

  // Extract palette from currently selected image and set gradient stops
  const extractAndApplyPalette = useCallback(async () => {
    const activeItem = images.find(it => it.id === selectedImageId);
    if (!activeItem) return;

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = activeItem.originalUrl;
      await img.decode();

      const colors = await extractPaletteFromImage(img, 5);
      
      // Update image item palette
      setImages(prev =>
        prev.map(it => (it.id === activeItem.id ? { ...it, extractedPalette: colors } : it))
      );

      // Apply to current gradient stops and mesh colors
      setSettings(prev => {
        const next: FilterSettings = {
          ...prev,
          gradient: {
            ...prev.gradient,
            enabled: true,
            stops: colors.map((col, idx) => ({
              id: String(idx + 1),
              color: col,
              position: Math.round((idx / (colors.length - 1)) * 100),
            })),
            meshColors: [colors[0], colors[1], colors[2], colors[3] || colors[0]],
          },
        };
        pushHistory(next);
        return next;
      });
    } catch (err) {
      console.error('Palette extraction error:', err);
    }
  }, [images, selectedImageId, pushHistory]);

  // Batch Processing Controls
  const startBatch = useCallback((forceAll: boolean = true) => {
    if (!workerPoolRef.current || images.length === 0) return;
    
    // Reset statuses of images to queued
    setImages(prev =>
      prev.map(it => (forceAll || it.status !== 'completed' ? { ...it, status: 'queued', progress: 0 } : it))
    );

    setIsProcessing(true);
    setIsPaused(false);
    workerPoolRef.current.enqueue(images, settings, forceAll);
    workerPoolRef.current.start();
  }, [images, settings]);

  const pauseBatch = useCallback(() => {
    if (workerPoolRef.current) {
      workerPoolRef.current.pause();
      setIsPaused(true);
    }
  }, []);

  const resumeBatch = useCallback(() => {
    if (workerPoolRef.current) {
      workerPoolRef.current.resume();
      setIsPaused(false);
    }
  }, []);

  const cancelBatch = useCallback(() => {
    if (workerPoolRef.current) {
      workerPoolRef.current.cancel();
      setIsProcessing(false);
      setIsPaused(false);
      setImages(prev =>
        prev.map(it => (it.status === 'processing' || it.status === 'queued' ? { ...it, status: 'idle' } : it))
      );
    }
  }, []);

  // Export processed images as ZIP
  const exportZip = useCallback(async () => {
    try {
      setIsExportingZip(true);
      await exportImagesAsZip(images, 'gradient-x-studio-export.zip', p => {
        setZipProgress(p);
      });
    } catch (err: any) {
      alert(err.message || 'Export failed');
    } finally {
      setIsExportingZip(false);
      setZipProgress(null);
    }
  }, [images]);

  const selectedImage = images.find(it => it.id === selectedImageId) || images[0] || null;

  return {
    images,
    selectedImage,
    selectedImageId,
    activeTab,
    viewMode,
    settings,
    isProcessing,
    isPaused,
    stats,
    isExportingZip,
    zipProgress,
    setSelectedImageId,
    setActiveTab,
    setViewMode,
    addImages,
    removeImage,
    clearImages,
    applyPreset,
    updateSettings,
    extractAndApplyPalette,
    undo,
    redo,
    canUndo,
    canRedo,
    randomizeSettings,
    startBatch,
    pauseBatch,
    resumeBatch,
    cancelBatch,
    exportZip,
  };
}
