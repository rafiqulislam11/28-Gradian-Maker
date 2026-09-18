import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, Sparkles, FolderPlus, Layers } from 'lucide-react';
import { ImageItem } from '../../types/studio';
import { generateSampleImages } from '../../engine/sampleGenerator';

interface DropzoneProps {
  onAddImages: (items: ImageItem[]) => void;
  compact?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onAddImages, compact = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newItems: ImageItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      const url = URL.createObjectURL(file);
      newItems.push({
        id: `file_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 6)}`,
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
      });
    }

    if (newItems.length > 0) {
      onAddImages(newItems);
    }
  };

  const handleQuickMock = async (count: number) => {
    setIsGenerating(true);
    try {
      const samples = await generateSampleImages(count);
      onAddImages(samples);
    } finally {
      setIsGenerating(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5 transition-colors"
        >
          <Upload className="w-3.5 h-3.5 text-brand-violet" />
          <span>Upload Files</span>
        </button>

        <button
          onClick={() => handleQuickMock(50)}
          disabled={isGenerating}
          className="px-3 py-1.5 rounded-lg bg-brand-violet/20 hover:bg-brand-violet/30 text-xs font-medium text-brand-violet border border-brand-violet/30 flex items-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>+50 Test Images</span>
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={e => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={e => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`relative rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
        isDragging
          ? 'border-brand-violet bg-brand-violet/10 scale-[1.01]'
          : 'border-white/10 hover:border-white/20 bg-dark-900/50'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />

      <div className="flex flex-col items-center justify-center max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-violet/20 to-brand-cyan/20 border border-brand-violet/30 flex items-center justify-center mb-4 text-brand-violet shadow-glow-violet">
          <Upload className="w-8 h-8 text-brand-violet" />
        </div>

        <h3 className="text-lg font-semibold text-white mb-1">
          Drop your image collection here
        </h3>
        <p className="text-sm text-slate-400 mb-6">
          Supports PNG, JPG, WebP. Optimized for bulk processing of <span className="text-brand-cyan font-medium">500+ images</span> simultaneously.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-violet to-brand-indigo text-white text-sm font-semibold shadow-lg shadow-brand-violet/25 hover:opacity-95 transition-opacity flex items-center gap-2"
          >
            <FolderPlus className="w-4 h-4" />
            Browse Images
          </button>

          <div className="flex items-center gap-1.5 bg-dark-800/80 p-1 rounded-xl border border-white/10">
            <span className="text-xs text-slate-400 pl-2 pr-1">Mock Bulk:</span>
            <button
              onClick={() => handleQuickMock(10)}
              disabled={isGenerating}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition"
            >
              +10
            </button>
            <button
              onClick={() => handleQuickMock(50)}
              disabled={isGenerating}
              className="px-2.5 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 transition"
            >
              +50
            </button>
            <button
              onClick={() => handleQuickMock(100)}
              disabled={isGenerating}
              className="px-2.5 py-1 text-xs rounded-lg bg-brand-violet/20 text-brand-violet hover:bg-brand-violet/30 font-medium transition"
            >
              +100
            </button>
            <button
              onClick={() => handleQuickMock(500)}
              disabled={isGenerating}
              className="px-2.5 py-1 text-xs rounded-lg bg-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/30 font-semibold transition"
            >
              +500
            </button>
          </div>
        </div>

        {isGenerating && (
          <div className="mt-4 flex items-center gap-2 text-xs text-brand-violet animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Synthesizing batch mock images...
          </div>
        )}
      </div>
    </div>
  );
};
