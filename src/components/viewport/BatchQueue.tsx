import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  RotateCcw,
  Trash2,
  Download,
  Eye,
  Filter,
  Layers,
  Sparkles,
  Search,
} from 'lucide-react';
import { ImageItem, QueueStats } from '../../types/studio';
import { Dropzone } from '../common/Dropzone';
import { ProgressBar } from '../common/ProgressBar';

interface BatchQueueProps {
  images: ImageItem[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onRemoveImage: (id: string) => void;
  onClearImages: () => void;
  onAddImages: (items: ImageItem[]) => void;
  isProcessing: boolean;
  isPaused: boolean;
  onStartBatch: () => void;
  onPauseBatch: () => void;
  onResumeBatch: () => void;
  onCancelBatch: () => void;
  onExportZip: () => void;
  isExportingZip: boolean;
  stats: QueueStats;
  onEditInStudio?: (id: string) => void;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  images,
  selectedImageId,
  onSelectImage,
  onRemoveImage,
  onClearImages,
  onAddImages,
  isProcessing,
  isPaused,
  onStartBatch,
  onPauseBatch,
  onResumeBatch,
  onCancelBatch,
  onExportZip,
  isExportingZip,
  stats,
  onEditInStudio,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'queued' | 'processing' | 'completed' | 'failed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 60; // Smooth pagination for 500+ items

  // Filtered list
  const filteredImages = useMemo(() => {
    return images.filter(img => {
      const matchesFilter = filterStatus === 'all' || img.status === filterStatus;
      const matchesSearch = img.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [images, filterStatus, searchQuery]);

  // Paginated slice
  const paginatedImages = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredImages.slice(start, start + itemsPerPage);
  }, [filteredImages, page]);

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage) || 1;

  const countCompleted = images.filter(i => i.status === 'completed').length;
  const countProcessing = images.filter(i => i.status === 'processing').length;
  const countQueued = images.filter(i => i.status === 'queued' || i.status === 'idle').length;
  const countFailed = images.filter(i => i.status === 'failed').length;

  if (images.length === 0) {
    return (
      <div className="flex-1 p-8 overflow-y-auto bg-dark-950 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl">
          <Dropzone onAddImages={onAddImages} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-dark-950 overflow-hidden">
      {/* Top Header & Metrics Bar */}
      <div className="p-6 pb-2">
        <ProgressBar
          stats={stats}
          isProcessing={isProcessing}
          isPaused={isPaused}
          onPause={onPauseBatch}
          onResume={onResumeBatch}
          onCancel={onCancelBatch}
        />

        {/* Filter and Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Status Pills */}
          <div className="flex items-center gap-1.5 bg-dark-900/90 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                setFilterStatus('all');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === 'all'
                  ? 'bg-brand-violet text-white shadow-glow-violet'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({images.length})
            </button>

            <button
              onClick={() => {
                setFilterStatus('completed');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Completed ({countCompleted})
            </button>

            <button
              onClick={() => {
                setFilterStatus('processing');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === 'processing'
                  ? 'bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Processing ({countProcessing})
            </button>

            <button
              onClick={() => {
                setFilterStatus('queued');
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterStatus === 'queued'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Queued ({countQueued})
            </button>

            {countFailed > 0 && (
              <button
                onClick={() => {
                  setFilterStatus('failed');
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filterStatus === 'failed'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Failed ({countFailed})
              </button>
            )}
          </div>

          {/* Right: Search & Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search images..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-dark-900 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-violet/50 w-44"
              />
            </div>

            <Dropzone onAddImages={onAddImages} compact />

            <button
              onClick={onClearImages}
              className="p-2 rounded-xl bg-dark-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 transition"
              title="Clear All Images"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View of Images */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
          {paginatedImages.map(item => {
            const isSelected = item.id === selectedImageId;
            const displayUrl = item.processedUrl || item.thumbnailUrl;

            return (
              <div
                key={item.id}
                onClick={() => onSelectImage(item.id)}
                className={`group relative rounded-xl overflow-hidden glass-card glass-card-hover border transition cursor-pointer flex flex-col ${
                  isSelected
                    ? 'border-brand-violet ring-2 ring-brand-violet/40 shadow-glow-violet/30'
                    : 'border-white/10'
                }`}
              >
                {/* Thumbnail Area */}
                <div className="relative aspect-video w-full bg-dark-900 overflow-hidden">
                  <img
                    src={displayUrl}
                    alt={item.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Status Overlay Badge */}
                  <div className="absolute top-2 left-2">
                    {item.status === 'completed' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/90 text-white shadow-md flex items-center gap-1 backdrop-blur-md">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.processingTimeMs ? `${item.processingTimeMs}ms` : 'Done'}
                      </span>
                    )}

                    {item.status === 'processing' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-brand-cyan/90 text-white shadow-md flex items-center gap-1 backdrop-blur-md animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        Processing...
                      </span>
                    )}

                    {item.status === 'queued' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/80 text-white shadow-md flex items-center gap-1 backdrop-blur-md">
                        <Clock className="w-2.5 h-2.5" />
                        Queued
                      </span>
                    )}

                    {item.status === 'failed' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/90 text-white shadow-md flex items-center gap-1 backdrop-blur-md">
                        <AlertCircle className="w-3 h-3" />
                        Error
                      </span>
                    )}
                  </div>

                  {/* Action on Hover */}
                  <div className="absolute inset-0 bg-dark-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {onEditInStudio && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onEditInStudio(item.id);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-dark-950 text-xs font-bold transition flex items-center gap-1 shadow-lg"
                        title="Edit this image in Studio"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                    )}

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onSelectImage(item.id);
                      }}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                      title="Inspect"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {item.processedUrl && (
                      <a
                        href={item.processedUrl}
                        download={`${item.name.replace(/\.[^/.]+$/, '')}_gradx.png`}
                        onClick={e => e.stopPropagation()}
                        className="p-1.5 rounded-lg bg-emerald-500/80 hover:bg-emerald-500 text-white transition"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Card Meta Info */}
                <div className="p-2.5 bg-dark-950/70 border-t border-white/5 flex flex-col justify-between flex-1">
                  <span className="text-xs font-medium text-white truncate block">{item.name}</span>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1 font-mono">
                    <span>{(item.size / 1024).toFixed(0)} KB</span>
                    {item.status === 'completed' && (
                      <span className="text-emerald-400 font-medium">Ready</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Bar for large batches (500+ items) */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10 text-xs text-slate-400">
            <span>
              Showing {paginatedImages.length} of {filteredImages.length} images (Page {page} of {totalPages})
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-dark-900 border border-white/10 text-slate-300 disabled:opacity-40 hover:bg-dark-800 transition"
              >
                Previous
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-dark-900 border border-white/10 text-slate-300 disabled:opacity-40 hover:bg-dark-800 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
