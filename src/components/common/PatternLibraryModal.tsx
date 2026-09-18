import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Search,
  Sparkles,
  Check,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Zap,
  Box,
} from 'lucide-react';
import {
  PATTERN_LIBRARY,
  PATTERN_CATEGORIES,
  PatternItem,
  PatternCategory,
  PATTERN_MAP,
} from '../../engine/patternLibrary';
import { renderPatternThumbnail } from '../../engine/patternRenderer';

interface PatternLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePatternId: string;
  onSelectPattern: (patternId: string, enable3D?: boolean) => void;
  currentColor?: string;
}

export const PatternLibraryModal: React.FC<PatternLibraryModalProps> = ({
  isOpen,
  onClose,
  activePatternId,
  onSelectPattern,
  currentColor = '#00f0ff',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<PatternCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [is3DView, setIs3DView] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 36;

  // Reset page when category or search changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory, searchQuery]);

  // Filtered patterns
  const filteredPatterns = useMemo(() => {
    return PATTERN_LIBRARY.filter(item => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Paginated patterns slice
  const paginatedPatterns = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredPatterns.slice(start, start + itemsPerPage);
  }, [filteredPatterns, page]);

  const totalPages = Math.ceil(filteredPatterns.length / itemsPerPage) || 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col rounded-2xl bg-[#0f131d] border border-white/10 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121622]/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/15 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Pattern Library
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                  500 Patterns
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 hidden sm:inline">
                  {PATTERN_CATEGORIES.length - 1} Categories
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-gradient-to-r from-cyan-400/20 to-purple-500/20 text-cyan-200 border border-cyan-400/30 hidden sm:inline">
                  🧊 All 500 in 3D
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Mathematical vectors, sacred geometries, traditional tiles, and tech grids (All 3D customizable)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Section */}
        <div className="px-6 py-3 border-b border-white/5 bg-[#121622]/40 flex flex-col gap-3 shrink-0">
          {/* Search Input & 3D Preview Toggle */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search 500+ patterns (e.g. circuit, waves, hex, star, sacred, chevron, tile)..."
                className="w-full pl-10 pr-10 py-2 rounded-xl bg-dark-900 border border-white/10 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 3D Mode Live Preview Toggle */}
            <button
              onClick={() => setIs3DView(prev => !prev)}
              className={`shrink-0 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
                is3DView
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-400 text-dark-950 border-cyan-300 shadow-cyan-500/25 ring-1 ring-cyan-300'
                  : 'bg-dark-900/90 text-slate-300 hover:text-white border-white/10 hover:border-cyan-400/40'
              }`}
              title="Toggle real-time 3D volumetric depth preview on all 500 patterns"
            >
              <Box className="w-4 h-4" />
              <span>{is3DView ? '3D Preview: ON' : '3D Preview: OFF'}</span>
              <span
                className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                  is3DView ? 'bg-dark-950/30 text-dark-950 font-bold' : 'bg-cyan-500/20 text-cyan-300'
                }`}
              >
                500 3D
              </span>
            </button>
          </div>

          {/* Category Pill Filters (Horizontal scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {PATTERN_CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-400 text-dark-950 font-bold shadow-md shadow-cyan-500/25 scale-[1.02]'
                      : 'bg-dark-900/80 text-slate-300 hover:text-white hover:bg-dark-800 border border-white/5'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      isActive ? 'bg-dark-950/25 text-dark-950' : 'text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Patterns Grid Container */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin bg-[#0b0e16]">
          {filteredPatterns.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <Filter className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-base font-semibold text-white">No patterns found</p>
              <p className="text-xs text-slate-400 mt-1">
                Try searching for another keyword like "grid", "star", "wave", or "hex"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-cyan-400 text-dark-950 text-xs font-bold transition hover:bg-cyan-300"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {paginatedPatterns.map(item => (
                <PatternCard
                  key={item.id}
                  item={item}
                  isSelected={activePatternId === item.id}
                  currentColor={currentColor}
                  is3DView={is3DView}
                  onSelect={() => {
                    onSelectPattern(item.id, is3DView);
                    onClose();
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer: Pagination & Info */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/10 bg-[#121622]/80 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="text-white">{filteredPatterns.length}</strong> patterns
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Active:{' '}
              <strong className="text-cyan-400 font-mono">
                {PATTERN_MAP.get(activePatternId)?.name || activePatternId || 'None'}
              </strong>
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400 mr-2">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-dark-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 transition"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-dark-900 border border-white/10 text-slate-300 hover:text-white disabled:opacity-40 transition"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface PatternCardProps {
  item: PatternItem;
  isSelected: boolean;
  currentColor: string;
  is3DView: boolean;
  onSelect: () => void;
}

const PatternCard: React.FC<PatternCardProps> = ({
  item,
  isSelected,
  currentColor,
  is3DView,
  onSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderPatternThumbnail(canvasRef.current, item, currentColor, is3DView);
    }
  }, [item, currentColor, is3DView]);

  const show3DBadge = is3DView || item.category === '3d';

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-xl border p-2 flex flex-col gap-2 cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-cyan-400 bg-cyan-400/10 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/20 scale-[1.02]'
          : 'border-white/10 hover:border-cyan-400/50 hover:bg-dark-900/90 bg-dark-900/50 hover:scale-[1.01]'
      }`}
    >
      {/* Pattern Canvas Preview */}
      <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-white/5 bg-[#0a0d14]">
        <canvas
          ref={canvasRef}
          width={128}
          height={128}
          className="w-full h-full object-cover block group-hover:scale-105 transition-transform duration-300"
        />

        {isSelected && (
          <div className="absolute top-1 right-1 p-1 rounded-full bg-cyan-400 text-dark-950 shadow-md">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
        )}

        {show3DBadge && (
          <div className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold bg-cyan-500/90 text-dark-950 shadow-sm flex items-center gap-0.5">
            <span>3D</span>
          </div>
        )}
      </div>

      {/* Pattern Metadata */}
      <div className="flex flex-col overflow-hidden">
        <span
          className="text-xs font-semibold text-white truncate group-hover:text-cyan-300 transition-colors"
          title={item.name}
        >
          {item.name.replace(/\s\(#\d+\)$/, '')}
        </span>
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-slate-500 capitalize truncate">
            {item.category}
          </span>
          {show3DBadge && (
            <span className="text-[9px] font-mono text-cyan-400 font-semibold shrink-0">
              Depth 3D
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
