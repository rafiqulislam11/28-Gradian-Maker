import React, { useRef } from 'react';
import {
  ImageItem,
} from '../../types/studio';
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Zap,
  Download,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BatchStripProps {
  images: ImageItem[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onUploadImages: (files: File[]) => void;
  onStartBatch: () => void;
  onExportZip: () => void;
  isProcessing: boolean;
  isExportingZip: boolean;
  onViewBatchQueue?: () => void;
}

export const BatchStrip: React.FC<BatchStripProps> = ({
  images,
  selectedImageId,
  onSelectImage,
  onRemoveImage,
  onUploadImages,
  onStartBatch,
  onExportZip,
  isProcessing,
  isExportingZip,
  onViewBatchQueue,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const currentIndex = images.findIndex(it => it.id === selectedImageId);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;
  const activeItem = images[activeIndex] || images[0];

  const completedCount = images.filter(it => it.status === 'completed').length;

  const handleScroll = (dir: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 240;
    scrollContainerRef.current.scrollBy({
      left: dir === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handlePrev = () => {
    if (images.length <= 1) return;
    const prevIdx = (activeIndex - 1 + images.length) % images.length;
    onSelectImage(images[prevIdx].id);
  };

  const handleNext = () => {
    if (images.length <= 1) return;
    const nextIdx = (activeIndex + 1) % images.length;
    onSelectImage(images[nextIdx].id);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const valid: File[] = [];
    for (let i = 0; i < e.target.files.length; i++) {
      if (e.target.files[i].type.startsWith('image/')) {
        valid.push(e.target.files[i]);
      }
    }
    if (valid.length > 0) {
      onUploadImages(valid);
    }
    e.target.value = '';
  };

  return (
    <div className="mt-3 rounded-2xl bg-[#121620]/95 border border-white/10 p-3 shadow-xl flex flex-col gap-2.5">
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Header Controls of the Strip */}
      <div className="flex items-center justify-between px-1">
        {/* Left: Active Image Info & Stepper */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>{images.length} Images in Studio</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-300">
            <button
              onClick={handlePrev}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-cyan-400 font-bold px-1">
              #{activeIndex + 1}
            </span>
            <span className="text-slate-500">/</span>
            <span className="font-mono text-slate-400">{images.length}</span>
            <button
              onClick={handleNext}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition"
              title="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-xs text-slate-400 truncate max-w-[200px] hidden sm:inline" title={activeItem?.name}>
            {activeItem?.name}
          </span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Add more button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-lg bg-dark-800 hover:bg-dark-700 text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1 transition"
            title="Upload more images (Select up to 30+ files)"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Add More</span>
          </button>

          {/* Process All Batch Button */}
          <button
            onClick={onStartBatch}
            disabled={isProcessing}
            className="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-dark-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition active:scale-95 disabled:opacity-60"
            title="Process and style all images with current filters"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-dark-950" />
                <span>Process All ({images.length})</span>
              </>
            )}
          </button>

          {/* Download All ZIP */}
          {completedCount > 0 && (
            <button
              onClick={onExportZip}
              disabled={isExportingZip}
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1 transition"
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
        </div>
      </div>

      {/* Horizontal Scrollable Thumbnails Carousel */}
      <div className="relative group">
        {/* Left Arrow Scroll */}
        <button
          onClick={() => handleScroll('left')}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-dark-950/80 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-cyan-500 hover:text-dark-950"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Scroll Row */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 scrollbar-thin scroll-smooth"
        >
          {images.map((item, idx) => {
            const isSelected = item.id === selectedImageId || (!selectedImageId && idx === 0);
            const isDone = item.status === 'completed';
            const isRunning = item.status === 'processing';

            return (
              <div
                key={item.id}
                onClick={() => onSelectImage(item.id)}
                className={`relative shrink-0 w-24 h-16 rounded-xl overflow-hidden cursor-pointer border transition-all duration-200 group/card ${
                  isSelected
                    ? 'border-cyan-400 ring-2 ring-cyan-400/50 scale-[1.04] shadow-lg shadow-cyan-500/25 z-10'
                    : 'border-white/10 hover:border-cyan-400/50 hover:scale-[1.02] bg-dark-900'
                }`}
              >
                {/* Thumbnail Image */}
                <img
                  src={item.processedUrl || item.thumbnailUrl || item.originalUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />

                {/* Index badge */}
                <span className="absolute top-1 left-1 px-1 py-0.2 rounded bg-dark-950/80 text-[9px] font-mono text-cyan-300 border border-white/10">
                  #{idx + 1}
                </span>

                {/* Status Indicator */}
                {isDone && (
                  <span className="absolute top-1 right-1 p-0.5 rounded-full bg-emerald-500 text-dark-950 shadow-md">
                    <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
                {isRunning && (
                  <span className="absolute top-1 right-1 p-0.5 rounded-full bg-cyan-400 text-dark-950 animate-spin shadow-md">
                    <RefreshCw className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}

                {/* Remove Image Button on hover */}
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onRemoveImage(item.id);
                  }}
                  className="absolute bottom-1 right-1 p-0.5 rounded bg-rose-500/80 hover:bg-rose-600 text-white opacity-0 group-hover/card:opacity-100 transition shadow"
                  title="Remove from batch"
                >
                  <X className="w-2.5 h-2.5" />
                </button>

                {/* Filename hover tooltip */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-dark-950/90 to-transparent p-0.5 pointer-events-none">
                  <span className="text-[8px] text-slate-300 truncate block px-1 text-center">
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Quick Add Card at the end */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 w-20 h-16 rounded-xl border-2 border-dashed border-white/15 hover:border-cyan-400/60 bg-dark-900/50 hover:bg-dark-900 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-cyan-300 transition group"
            title="Upload more images (supports 30+ at once)"
          >
            <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="text-[9px] font-medium">+ Add</span>
          </button>
        </div>

        {/* Right Arrow Scroll */}
        <button
          onClick={() => handleScroll('right')}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-dark-950/80 border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-lg hover:bg-cyan-500 hover:text-dark-950"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
