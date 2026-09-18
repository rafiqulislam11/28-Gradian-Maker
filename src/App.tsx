import React, { useState, useEffect } from 'react';
import { useStudio } from './store/useStudioStore';
import { Navbar, MainNavTab } from './components/layout/Navbar';
import { ToolsPanel } from './components/studio/ToolsPanel';
import { CanvasStudio } from './components/studio/CanvasStudio';
import { BatchQueue } from './components/viewport/BatchQueue';
import { CodeExportModal } from './components/common/CodeExportModal';
import { PatternLibraryModal } from './components/common/PatternLibraryModal';
import { ThreeDStudioModal } from './components/studio/ThreeDStudioModal';
import { generateSampleImages } from './engine/sampleGenerator';
import { extractPaletteFromImage } from './engine/colorExtractor';
import { Check, Zap, Sparkles, Shield, User, Key, HardDrive } from 'lucide-react';
import { ImageItem } from './types/studio';

export function App() {
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
    addImages,
    removeImage,
    clearImages,
    updateSettings,
    applyPreset,
    undo,
    redo,
    canUndo,
    canRedo,
    resetSettings,
    randomizeSettings,
    startBatch,
    pauseBatch,
    resumeBatch,
    cancelBatch,
    exportZip,
  } = useStudio();

  const [activeNavTab, setActiveNavTab] = useState<MainNavTab>('tools');
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
  const [is3DModalOpen, setIs3DModalOpen] = useState(false);

  // Multi-image upload handler (supports 30+ files simultaneously)
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

    // Auto extract palette from first image to tune mesh gradient
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = newItems[0].originalUrl;
      await img.decode();
      const colors = await extractPaletteFromImage(img, 4);
      if (colors.length >= 4) {
        updateSettings('gradient', {
          meshColors: [colors[0], colors[1], colors[2], colors[3]],
        });
      }
    } catch (e) {
      console.warn('Auto color extraction notice:', e);
    }
  };

  const handleApplySingle = () => {
    if (images.length === 0) return;
    startBatch(false);
  };

  const handleEditInStudio = (id: string) => {
    setSelectedImageId(id);
    setActiveNavTab('tools');
  };

  const handleSendFrom3D = (newImage: ImageItem) => {
    addImages([newImage]);
    setSelectedImageId(newImage.id);
    setActiveNavTab('tools');
  };

  // Lazy load batch sample images when user opens Batch tab
  useEffect(() => {
    let isMounted = true;
    if (activeNavTab === 'batch' && images.length === 0) {
      generateSampleImages(8).then(initialSamples => {
        if (isMounted && images.length === 0) {
          addImages(initialSamples);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [activeNavTab, images.length, addImages]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0d14] text-slate-100 font-sans selection:bg-cyan-400 selection:text-dark-950">
      {/* Top Navbar */}
      <Navbar
        activeNavTab={activeNavTab}
        setActiveNavTab={setActiveNavTab}
        batchCount={images.length}
        isProcessing={isProcessing}
        onOpen3DStudio={() => setIs3DModalOpen(true)}
        onOpenPatternLibrary={() => setIsPatternModalOpen(true)}
      />

      {/* Main Container */}
      <div className="flex-1 flex px-8 pb-6 overflow-hidden gap-6">
        {activeNavTab === 'tools' && (
          <>
            {/* Left: Tools Panel (With Multi-Image Upload & Batch Processing Controls) */}
            <ToolsPanel
              settings={settings}
              onUpdateSettings={updateSettings}
              onApplySingle={handleApplySingle}
              onStartBatch={() => startBatch(true)}
              onExportZip={exportZip}
              images={images}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImageId}
              onUploadImages={handleUploadImages}
              onRemoveImage={removeImage}
              onClearAllImages={clearImages}
              isProcessingBatch={isProcessing}
              isExportingZip={isExportingZip}
              onViewBatchQueue={() => setActiveNavTab('batch')}
              onOpenPatternModal={() => setIsPatternModalOpen(true)}
              onOpen3DStudio={() => setIs3DModalOpen(true)}
              onSelectPreset={applyPreset}
              onRandomize={randomizeSettings}
              onReset={resetSettings}
            />

            {/* Right: Center Canvas Viewport + Bottom Multi-Image Strip */}
            <CanvasStudio
              settings={settings}
              onUpdateSettings={updateSettings}
              onOpenCodeModal={() => setIsCodeModalOpen(true)}
              images={images}
              selectedImage={selectedImage}
              onSelectImage={setSelectedImageId}
              onUploadImages={handleUploadImages}
              onRemoveImage={removeImage}
              onStartBatch={() => startBatch(true)}
              onExportZip={exportZip}
              isProcessingBatch={isProcessing}
              isExportingZip={isExportingZip}
              onViewBatchQueue={() => setActiveNavTab('batch')}
              onOpen3DStudio={() => setIs3DModalOpen(true)}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              onRandomize={randomizeSettings}
            />
          </>
        )}

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
              onEditInStudio={handleEditInStudio}
            />
          </div>
        )}

        {activeNavTab === 'pricing' && (
          <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
            <div className="w-full max-w-4xl grid grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className="p-6 rounded-2xl bg-[#121620] border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Starter</h4>
                  <p className="text-xs text-slate-400 mb-4">For individual creative styling</p>
                  <div className="text-2xl font-black text-white mb-4">$0 <span className="text-xs text-slate-400 font-normal">/ forever</span></div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Full Gradient & Blur Studio</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Noise & Fractal Generator</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Up to 50 batch images</li>
                  </ul>
                </div>
                <button onClick={() => setActiveNavTab('tools')} className="w-full py-2 rounded-xl bg-dark-800 text-xs font-semibold text-slate-200 hover:bg-dark-700 transition">Current Plan</button>
              </div>

              {/* Pro Studio Plan */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1a2338] to-[#121620] border border-cyan-400/50 shadow-xl shadow-cyan-500/10 flex flex-col justify-between relative">
                <span className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-400 text-dark-950">Most Popular</span>
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Studio Pro</h4>
                  <p className="text-xs text-slate-400 mb-4">For professional designers & agencies</p>
                  <div className="text-2xl font-black text-cyan-400 mb-4">$19 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Unlimited 500+ Batch Queue</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> 8K Studio AI Upscale Master</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Multi-Core Web Worker Pool</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> High-Speed ZIP Bundler</li>
                  </ul>
                </div>
                <button onClick={() => setActiveNavTab('tools')} className="w-full py-2 rounded-xl bg-cyan-400 text-dark-950 font-bold text-xs shadow-lg shadow-cyan-500/25 hover:bg-cyan-300 transition">Get Studio Pro</button>
              </div>

              {/* Enterprise */}
              <div className="p-6 rounded-2xl bg-[#121620] border border-white/10 flex flex-col justify-between">
                <div>
                  <h4 className="text-lg font-bold text-white mb-1">Cluster Enterprise</h4>
                  <p className="text-xs text-slate-400 mb-4">Dedicated Node.js/Python cluster</p>
                  <div className="text-2xl font-black text-white mb-4">$79 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Server-side Sharp & GPU Cluster</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> 10,000+ Concurrent Images</li>
                    <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-cyan-400" /> Custom API & Webhook Dispatch</li>
                  </ul>
                </div>
                <button onClick={() => setActiveNavTab('tools')} className="w-full py-2 rounded-xl bg-dark-800 text-xs font-semibold text-slate-200 hover:bg-dark-700 transition">Contact Enterprise</button>
              </div>
            </div>
          </div>
        )}

        {activeNavTab === 'account' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-xl p-6 rounded-2xl bg-[#121620] border border-white/10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-500 flex items-center justify-center text-dark-950 font-bold text-xl shadow-lg shadow-cyan-500/20">
                  GX
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Creative Director</h3>
                  <p className="text-xs text-slate-400">pro@gradientx.studio • Studio Pro License Active</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <div>
                      <span className="text-xs font-medium text-white block">Local Hardware Concurrency</span>
                      <span className="text-[10px] text-slate-500">Multi-core OffscreenCanvas Web Workers</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 font-semibold">Active</span>
                </div>

                <div className="p-3 rounded-xl bg-dark-900/60 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Key className="w-4 h-4 text-purple-400" />
                    <div>
                      <span className="text-xs font-medium text-white block">Studio Secret API Token</span>
                      <span className="text-[10px] text-slate-500">gx_live_9481948301948109</span>
                    </div>
                  </div>
                  <button className="text-xs text-slate-400 hover:text-white transition">Copy</button>
                </div>
              </div>

              <button
                onClick={() => setActiveNavTab('tools')}
                className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-dark-950 font-bold text-xs transition"
              >
                Back to Canvas Studio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Code Export Modal */}
      <CodeExportModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        settings={settings}
      />

      {/* 500+ Pattern Library Modal */}
      <PatternLibraryModal
        isOpen={isPatternModalOpen}
        onClose={() => setIsPatternModalOpen(false)}
        activePatternId={settings.patterns.type}
        onSelectPattern={(patId) => {
          updateSettings('patterns', {
            type: patId,
            enabled: patId !== 'none',
          });
        }}
        currentColor={settings.patterns.color}
      />

      {/* 3D Wood & Texture Studio Modal */}
      <ThreeDStudioModal
        isOpen={is3DModalOpen}
        onClose={() => setIs3DModalOpen(false)}
        onSendToStudio={handleSendFrom3D}
      />

      {/* ZIP Generation Modal / Toast */}
      {isExportingZip && zipProgress && (
        <div className="fixed bottom-6 right-6 z-50 glass-panel p-4 rounded-2xl border border-cyan-400/40 shadow-2xl flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs">
            <span className="font-semibold text-white block">Bundling ZIP Export</span>
            <span className="text-slate-400 font-mono">
              {zipProgress.current} / {zipProgress.total} ({zipProgress.percent}%)
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
