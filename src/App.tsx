import React, { useState, useEffect, useRef } from 'react';
import { useStudio } from './store/useStudioStore';
import { useProjectStore } from './store/useProjectStore';
import { Navbar, MainNavTab } from './components/layout/Navbar';
import { LayerPanel } from './components/layers/LayerPanel';
import { CanvasViewport } from './components/editor/CanvasViewport';
import { InspectorPanel } from './components/inspector/InspectorPanel';
import { DesignGeneratorView } from './components/generator/DesignGeneratorView';
import { ExportCenterModal } from './components/export/ExportCenterModal';
import { TemplateLibraryModal } from './components/templates/TemplateLibraryModal';
import { ControlledRandomizeModal } from './components/randomize/ControlledRandomizeModal';
import { BatchQueue } from './components/viewport/BatchQueue';
import { CodeExportModal } from './components/common/CodeExportModal';
import { PatternLibraryModal } from './components/common/PatternLibraryModal';
import { ThreeDStudioModal } from './components/studio/ThreeDStudioModal';
import { VectorStudioView } from './components/studio/VectorStudioView';
import { generateSampleImages } from './engine/sampleGenerator';
import { ImageItem } from './types/studio';
import { Project, Layer, ImageLayer, DEFAULT_TRANSFORM, DEFAULT_ADJUSTMENTS } from './types/project';
import { triggerFileDownload } from './engine/export/exportEngine';
import { Check, Eye, Sliders, Layers } from 'lucide-react';

export function App() {
  // Existing Studio store (Batch Queue, Worker pool, Samples, etc.)
  const {
    images,
    selectedImage,
    selectedImageId,
    settings,
    isProcessing,
    isPaused,
    stats,
    isExportingZip,
    zipProgress,
    setSelectedImageId,
    setImages,
    addImages,
    removeImage,
    clearImages,
    updateSettings,
    startBatch,
    pauseBatch,
    resumeBatch,
    cancelBatch,
    exportZip,
  } = useStudio();

  // Upgraded Project Store (Layers, Transforms, Compositor, History)
  const {
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
  } = useProjectStore();

  const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('studio');
  const [mobileTab, setMobileTab] = useState<'canvas' | 'layers' | 'inspector'>('canvas');

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isRandomizeModalOpen, setIsRandomizeModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  const projectFileInputRef = useRef<HTMLInputElement>(null);

  // Multi-image upload handler
  const handleUploadImages = async (files: File[]) => {
    if (!files || files.length === 0) return;

    const newItems: ImageItem[] = files.map((file, i) => {
      const url = URL.createObjectURL(file);
      return {
        id: `upload_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        width: 0,
        height: 0,
        originalUrl: url,
        processedUrl: null,
        thumbnailUrl: url,
        status: 'idle',
        progress: 0,
        file,
      };
    });

    addImages(newItems);

    // Also add as ImageLayer in the Project
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const imgLayer: Partial<ImageLayer> = {
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: 'image',
          src: url,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          adjustments: { ...DEFAULT_ADJUSTMENTS },
          transform: {
            ...DEFAULT_TRANSFORM,
            width: Math.min(project.width * 0.8, img.naturalWidth || 800),
            height: Math.min(project.height * 0.8, img.naturalHeight || 600),
            x: Math.round((project.width - Math.min(project.width * 0.8, img.naturalWidth || 800)) / 2),
            y: Math.round((project.height - Math.min(project.height * 0.8, img.naturalHeight || 600)) / 2),
          },
        };
        addLayer(imgLayer);
      };
    });
  };

  // Upload single image from LayerPanel
  const handleUploadSingleImage = (file: File) => {
    handleUploadImages([file]);
  };

  // 3D Studio texture snapshot receiver
  const handleSendFrom3D = (newImage: ImageItem) => {
    addImages([newImage]);
    const imgLayer: Partial<ImageLayer> = {
      name: '3D Lumber Texture',
      type: 'image',
      src: newImage.originalUrl,
      naturalWidth: 1920,
      naturalHeight: 1080,
      adjustments: { ...DEFAULT_ADJUSTMENTS },
      transform: {
        ...DEFAULT_TRANSFORM,
        width: project.width,
        height: project.height,
        x: 0,
        y: 0,
      },
    };
    addLayer(imgLayer);
    setActiveNavTab('studio');
  };

  // Save Project JSON
  const handleSaveProject = () => {
    const json = JSON.stringify(project, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    triggerFileDownload(url, `${project.name.toLowerCase().replace(/[^a-z0-9_-]/g, '_')}.gxproject.json`);
    URL.revokeObjectURL(url);
  };

  // Load Project JSON
  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed && parsed.layers) {
          setProject(parsed);
        }
      } catch (err) {
        alert('Invalid .gxproject JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Edit generated design in studio
  const handleEditGeneratedDesign = (genProject: Project) => {
    setProject(genProject);
    setActiveNavTab('studio');
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (canUndo) undo();
      }
      // Redo: Ctrl+Shift+Z or Ctrl+Y
      else if ((e.ctrlKey || e.metaKey) && ((e.key.toLowerCase() === 'z' && e.shiftKey) || e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        if (canRedo) redo();
      }
      // Save: Ctrl+S
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveProject();
      }
      // Export: Ctrl+E
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        setIsExportModalOpen(true);
      }
      // Duplicate: Ctrl+D
      else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (activeLayer) duplicateLayer(activeLayer.id);
      }
      // Delete: Delete or Backspace
      else if (e.key === 'Delete') {
        if (activeLayer) {
          e.preventDefault();
          removeLayer(activeLayer.id);
        }
      }
      // Tool shortcuts: V = select, H = pan
      else if (e.key.toLowerCase() === 'v') {
        setActiveTool('select');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('pan');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canUndo, canRedo, undo, redo, activeLayer, duplicateLayer, removeLayer, setActiveTool]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070912] text-slate-100 font-sans selection:bg-cyan-400 selection:text-dark-950">
      {/* Hidden Project JSON File Input */}
      <input
        ref={projectFileInputRef}
        type="file"
        accept=".json,.gxproject"
        className="hidden"
        onChange={handleProjectFileChange}
      />

      {/* 1. TOP NAVBAR & MODULE SWITCHER */}
      <Navbar
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
        batchCount={images.length}
        isProcessing={isProcessing}
        onOpen3DStudio={() => setIs3DModalOpen(true)}
        onOpenPatternLibrary={() => setIsPatternModalOpen(true)}
        onOpenTemplates={() => setIsTemplatesModalOpen(true)}
        onOpenRandomize={() => setIsRandomizeModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenCodeExport={() => setIsCodeModalOpen(true)}
        onNewProject={() => resetProject()}
        onSaveProject={handleSaveProject}
        onOpenProjectFile={() => projectFileInputRef.current?.click()}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={undo}
        onRedo={redo}
      />

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 flex flex-col px-2 sm:px-4 lg:px-6 pb-2 sm:pb-4 overflow-hidden min-h-0 pt-2">
        {/* ======================================================== */}
        {/* VIEW 1: STUDIO PRO (MAIN MULTI-LAYER CREATIVE SUITE)    */}
        {/* ======================================================== */}
        {activeNavTab === 'studio' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Mobile / Tablet View Switcher (Visible on < lg) */}
            <div className="lg:hidden flex items-center justify-center pb-2 shrink-0">
              <div className="flex items-center p-1 rounded-xl bg-[#121624] border border-white/10 shadow-lg">
                <button
                  onClick={() => setMobileTab('layers')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    mobileTab === 'layers'
                      ? 'bg-cyan-500 text-dark-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Layers</span>
                </button>
                <button
                  onClick={() => setMobileTab('canvas')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    mobileTab === 'canvas'
                      ? 'bg-cyan-500 text-dark-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Canvas</span>
                </button>
                <button
                  onClick={() => setMobileTab('inspector')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    mobileTab === 'inspector'
                      ? 'bg-cyan-500 text-dark-950 font-bold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Inspector</span>
                </button>
              </div>
            </div>

            {/* Main Creative Layout: LEFT (Layers) | CENTER (Canvas) | RIGHT (Inspector) */}
            <div className="flex-1 flex overflow-hidden gap-3 lg:gap-4 min-h-0">
              {/* LEFT: Photoshop-Style Layer Panel */}
              <div
                className={`h-full ${
                  mobileTab === 'layers' ? 'flex flex-1 w-full' : 'hidden'
                } lg:flex lg:w-[280px] xl:w-[310px] shrink-0 min-h-0`}
              >
                <LayerPanel
                  layers={project.layers}
                  activeLayerId={project.activeLayerId}
                  onSelectLayer={setSelectedLayer}
                  onAddLayer={addLayer}
                  onRemoveLayer={removeLayer}
                  onDuplicateLayer={duplicateLayer}
                  onReorderLayers={reorderLayers}
                  onToggleVisibility={toggleLayerVisibility}
                  onToggleLock={toggleLayerLock}
                  onToggleSolo={toggleLayerSolo}
                  onRenameLayer={renameLayer}
                  onUpdateLayer={updateLayer}
                  onUploadImage={handleUploadSingleImage}
                />
              </div>

              {/* CENTER: Interactive Canvas Viewport */}
              <div
                className={`h-full ${
                  mobileTab === 'canvas' ? 'flex flex-1 w-full' : 'hidden'
                } lg:flex lg:flex-1 min-w-0 min-h-0`}
              >
                <CanvasViewport
                  project={project}
                  activeLayer={activeLayer}
                  activeTool={activeTool}
                  zoomLevel={zoomLevel}
                  panOffset={panOffset}
                  showGrid={showGrid}
                  showGuides={showGuides}
                  showSafeArea={showSafeArea}
                  isSplitEnabled={isSplitEnabled}
                  splitPos={splitPos}
                  isHoldingOriginal={isHoldingOriginal}
                  onSetZoom={setZoomLevel}
                  onSetPan={setPanOffset}
                  onToggleGrid={() => setShowGrid(!showGrid)}
                  onToggleSafeArea={() => setShowSafeArea(!showSafeArea)}
                  onToggleSplit={() => setIsSplitEnabled(!isSplitEnabled)}
                  onSetSplitPos={setSplitPos}
                  onSetHoldingOriginal={setIsHoldingOriginal}
                  onUpdateTransform={updateTransform}
                  onSelectLayer={setSelectedLayer}
                  onSetActiveTool={setActiveTool}
                />
              </div>

              {/* RIGHT: Properties Inspector */}
              <div
                className={`h-full ${
                  mobileTab === 'inspector' ? 'flex flex-1 w-full' : 'hidden'
                } lg:flex lg:w-[330px] xl:w-[360px] shrink-0 min-h-0`}
              >
                <InspectorPanel
                  activeLayer={activeLayer}
                  onUpdateLayer={updateLayer}
                  onUpdateTransform={updateTransform}
                  onCenterLayer={centerLayer}
                  onFlipH={flipHorizontal}
                  onFlipV={flipVertical}
                  onResetTransform={resetTransform}
                  onOpenPatternModal={() => setIsPatternModalOpen(true)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 2: 1000 DESIGN GENERATOR                            */}
        {/* ======================================================== */}
        {activeNavTab === 'generator' && (
          <DesignGeneratorView
            currentProject={project}
            onEditInStudio={handleEditGeneratedDesign}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 3: VECTOR STUDIO (SVG, ICON SHEET, REMOVE WHITE)    */}
        {/* ======================================================== */}
        {activeNavTab === 'vector' && (
          <VectorStudioView
            images={images}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImageId}
            onUploadImages={handleUploadImages}
            onUpdateImages={setImages}
            onLoadSampleImage={async () => {
              const samples = await generateSampleImages(1);
              addImages(samples);
            }}
            onSwitchToImagePart={() => setActiveNavTab('studio')}
          />
        )}

        {/* ======================================================== */}
        {/* VIEW 4: BATCH WORKER QUEUE                               */}
        {/* ======================================================== */}
        {activeNavTab === 'batch' && (
          <div className="flex-1 flex flex-col rounded-2xl bg-[#0e121b] border border-white/10 overflow-hidden shadow-2xl">
            <BatchQueue
              images={images}
              selectedImageId={selectedImageId}
              onSelectImage={setSelectedImageId}
              onRemoveImage={removeImage}
              onClearImages={clearImages}
              onAddImages={addImages}
              isProcessing={isProcessing}
              isPaused={isPaused}
              onStartBatch={() => startBatch(true)}
              onPauseBatch={pauseBatch}
              onResumeBatch={resumeBatch}
              onCancelBatch={cancelBatch}
              onExportZip={exportZip}
              isExportingZip={isExportingZip}
              stats={stats}
              onEditInStudio={id => {
                setSelectedImageId(id);
                setActiveNavTab('studio');
              }}
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW 5: PRICING / PLANS                                  */}
        {/* ======================================================== */}
        {activeNavTab === 'pricing' && (
          <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 my-auto">
              <div className="p-6 rounded-2xl bg-[#121620] border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Starter</h4>
                  <p className="text-xs text-slate-400 mb-4">For individual creative exploration</p>
                  <div className="text-2xl font-black text-white mb-4">$0 <span className="text-xs text-slate-400 font-normal">/ forever</span></div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Layer & Transform Suite</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> 500+ Pattern Engine</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Up to 50 design variations</li>
                  </ul>
                </div>
                <button onClick={() => setActiveNavTab('studio')} className="w-full py-2 rounded-xl bg-dark-800 text-xs font-semibold text-slate-200 hover:bg-dark-700 transition">Current Free Mode</button>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1a2338] to-[#121620] border border-cyan-400/50 shadow-xl shadow-cyan-500/10 flex flex-col justify-between relative">
                <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-400 text-dark-950">Active License</span>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Studio Pro Master</h4>
                  <p className="text-xs text-slate-400 mb-4">Complete Creative Graphics Suite</p>
                  <div className="text-2xl font-black text-cyan-400 mb-4">PRO <span className="text-xs text-slate-400 font-normal">/ Unlimited</span></div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> 1000 Design Generator Engine</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> 8K Studio AI Upscale Master</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Photoshop Layer Stack & Masks</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> SVG & Icon Pack Exporters</li>
                  </ul>
                </div>
                <button onClick={() => setActiveNavTab('studio')} className="w-full py-2 rounded-xl bg-cyan-400 text-dark-950 font-bold text-xs shadow-lg shadow-cyan-500/25 hover:bg-cyan-300 transition">Launch Studio Pro</button>
              </div>

              <div className="p-6 rounded-2xl bg-[#121620] border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Enterprise Cloud</h4>
                  <p className="text-xs text-slate-400 mb-4">Dedicated Node/GPU Rendering API</p>
                  <div className="text-2xl font-black text-white mb-4">$79 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Cluster Sharp & GPU Workers</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> 10,000+ Concurrent Images</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Custom API & Webhook Dispatch</li>
                  </ul>
                </div>
                <button onClick={() => setActiveNavTab('studio')} className="w-full py-2 rounded-xl bg-dark-800 text-xs font-semibold text-slate-200 hover:bg-dark-700 transition">Contact Enterprise</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MODALS */}
      {/* Export Center Modal */}
      <ExportCenterModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
      />

      {/* Template Library Modal */}
      <TemplateLibraryModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        onSelectTemplate={recipe => applyRecipe(recipe)}
      />

      {/* Controlled Randomize Modal */}
      <ControlledRandomizeModal
        isOpen={isRandomizeModalOpen}
        onClose={() => setIsRandomizeModalOpen(false)}
        currentProject={project}
        onApplyProject={setProject}
      />

      {/* Universal Code Exporter Modal */}
      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        settings={settings}
      />

      {/* 500+ Pattern Library Modal */}
      <PatternLibraryModal
        isOpen={isPatternModalOpen}
        onClose={() => setIsPatternModalOpen(false)}
        activePatternId={
          activeLayer && activeLayer.type === 'pattern' ? (activeLayer as any).patternType : 'pat_geometric_001'
        }
        onSelectPattern={(patId, enable3D) => {
          if (activeLayer && activeLayer.type === 'pattern') {
            updateLayer(activeLayer.id, {
              patternType: patId,
              is3D: enable3D !== undefined ? enable3D : (activeLayer as any).is3D,
            } as any);
          } else {
            addLayer({
              name: 'Pattern Layer',
              type: 'pattern',
              patternType: patId,
              scale: 45,
              rotation: 0,
              color: '#00f0ff',
              is3D: enable3D,
              fullFill: true,
            } as any);
          }
        }}
        currentColor="#00f0ff"
      />

      {/* 3D Wood Studio Modal (Three.js) */}
      <ThreeDStudioModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        onSendToStudio={handleSendFrom3D}
      />

      {/* Batch ZIP Export Notification Toast */}
      {isExportingZip && zipProgress && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-[#0e121d] border border-cyan-400/40 shadow-2xl flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-mono">
            <span className="font-semibold text-white block">Bundling ZIP Export</span>
            <span className="text-slate-400">
              {zipProgress.current} / {zipProgress.total} ({zipProgress.percent}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
