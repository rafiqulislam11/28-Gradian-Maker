import React from 'react';
import {
  Sparkles,
  Palette,
  Sun,
  Disc,
  Grid,
  Maximize2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { StudioTab, ViewportMode } from '../../store/useStudioStore';
import { FilterSettings, ImageItem, Preset, QueueStats } from '../../types/studio';
import { PresetsTab } from '../sidebar/PresetsTab';
import { GradientTab } from '../sidebar/GradientTab';
import { BlurStudioTab } from '../sidebar/BlurStudioTab';
import { GrainNoiseTab } from '../sidebar/GrainNoiseTab';
import { PatternsTab } from '../sidebar/PatternsTab';
import { UpscaleTab } from '../sidebar/UpscaleTab';
import { SinglePreview } from '../viewport/SinglePreview';
import { BatchQueue } from '../viewport/BatchQueue';

interface SplitLayoutProps {
  activeTab: StudioTab;
  setActiveTab: (tab: StudioTab) => void;
  viewMode: ViewportMode;
  settings: FilterSettings;
  images: ImageItem[];
  selectedImage: ImageItem | null;
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onClearImages: () => void;
  onAddImages: (items: ImageItem[]) => void;
  onSelectPreset: (preset: Preset) => void;
  onUpdateSettings: <K extends keyof FilterSettings>(category: K, values: Partial<FilterSettings[K]>) => void;
  onExtractPalette: () => void;
  onOpenCodeModal: () => void;
  isProcessing: boolean;
  isPaused: boolean;
  onStartBatch: () => void;
  onPauseBatch: () => void;
  onResumeBatch: () => void;
  onCancelBatch: () => void;
  onExportZip: () => void;
  isExportingZip: boolean;
  stats: QueueStats;
}

export const SplitLayout: React.FC<SplitLayoutProps> = ({
  activeTab,
  setActiveTab,
  viewMode,
  settings,
  images,
  selectedImage,
  selectedImageId,
  onSelectImage,
  onRemoveImage,
  onClearImages,
  onAddImages,
  onSelectPreset,
  onUpdateSettings,
  onExtractPalette,
  onOpenCodeModal,
  isProcessing,
  isPaused,
  onStartBatch,
  onPauseBatch,
  onResumeBatch,
  onCancelBatch,
  onExportZip,
  isExportingZip,
  stats,
}) => {
  const tabs: { id: StudioTab; label: string; icon: any; badge?: string }[] = [
    { id: 'presets', label: 'Presets', icon: Sparkles, badge: 'Quick' },
    { id: 'gradient', label: 'Gradient Lab', icon: Palette },
    { id: 'blur', label: 'Blur Studio', icon: Sun },
    { id: 'noise', label: 'Noise & Grain', icon: Disc },
    { id: 'patterns', label: 'Patterns & Fractals', icon: Grid },
    { id: 'upscale', label: 'AI Upscale & Export', icon: Maximize2, badge: '8K' },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar (Control Panel) */}
      <aside className="w-96 border-r border-white/10 bg-dark-950/70 backdrop-blur-xl flex flex-col z-20 shrink-0">
        {/* Tab Navigation */}
        <div className="flex items-center px-4 pt-3 pb-2 border-b border-white/5 gap-1 overflow-x-auto scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition flex items-center gap-1.5 shrink-0 relative ${
                  isActive
                    ? 'bg-brand-violet/20 text-brand-violet border border-brand-violet/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-brand-cyan/20 text-brand-cyan">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 p-5 overflow-y-auto">
          {activeTab === 'presets' && (
            <PresetsTab currentSettings={settings} onSelectPreset={onSelectPreset} />
          )}

          {activeTab === 'gradient' && (
            <GradientTab
              settings={settings.gradient}
              onUpdate={v => onUpdateSettings('gradient', v)}
              onExtractPalette={onExtractPalette}
              extractedPalette={selectedImage?.extractedPalette}
            />
          )}

          {activeTab === 'blur' && (
            <BlurStudioTab
              settings={settings.blur}
              onUpdate={v => onUpdateSettings('blur', v)}
            />
          )}

          {activeTab === 'noise' && (
            <GrainNoiseTab
              settings={settings.noise}
              onUpdate={v => onUpdateSettings('noise', v)}
            />
          )}

          {activeTab === 'patterns' && (
            <PatternsTab
              settings={settings.patterns}
              onUpdate={v => onUpdateSettings('patterns', v)}
            />
          )}

          {activeTab === 'upscale' && (
            <UpscaleTab
              settings={settings.upscale}
              onUpdate={v => onUpdateSettings('upscale', v)}
            />
          )}
        </div>
      </aside>

      {/* Right Viewport (Interactive View) */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {viewMode === 'single' ? (
          <SinglePreview
            image={selectedImage}
            settings={settings}
            onExtractPalette={onExtractPalette}
            onOpenCodeModal={onOpenCodeModal}
          />
        ) : (
          <BatchQueue
            images={images}
            selectedImageId={selectedImageId}
            onSelectImage={onSelectImage}
            onRemoveImage={onRemoveImage}
            onClearImages={onClearImages}
            onAddImages={onAddImages}
            isProcessing={isProcessing}
            isPaused={isPaused}
            onStartBatch={onStartBatch}
            onPauseBatch={onPauseBatch}
            onResumeBatch={onResumeBatch}
            onCancelBatch={onCancelBatch}
            onExportZip={onExportZip}
            isExportingZip={isExportingZip}
            stats={stats}
          />
        )}
      </main>
    </div>
  );
};
