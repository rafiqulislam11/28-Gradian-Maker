import React from 'react';
import { FilterSettings } from '../../types/studio';

export interface CreationItem {
  id: string;
  name: string;
  thumbnailGradient: string;
  settings: Partial<FilterSettings>;
}

interface RecentCreationsProps {
  activeId: string;
  onSelectCreation: (creation: CreationItem) => void;
  onViewAll?: () => void;
}

export const RECENT_CREATIONS: CreationItem[] = [
  {
    id: 'electric-nebula',
    name: 'Electric Nebula Fractal',
    thumbnailGradient: 'linear-gradient(135deg, #00d2ff, #9d00ff, #ff007f, #ff7a00)',
    settings: {
      gradient: {
        enabled: true,
        type: 'mesh',
        blendMode: 'normal',
        opacity: 85,
        angle: 135,
        stops: [
          { id: '1', color: '#00d2ff', position: 0 },
          { id: '2', color: '#9d00ff', position: 35 },
          { id: '3', color: '#ff007f', position: 70 },
          { id: '4', color: '#ff7a00', position: 100 },
        ],
        meshColors: ['#00d2ff', '#9d00ff', '#ff007f', '#ff7a00'],
      },
      blur: {
        enabled: true,
        category: 'mesh',
        radius: 45,
        angle: 45,
        focalSize: 40,
        glassFrost: 65,
        glassSpecular: 80,
        tiltPosition: 50,
        tiltWidth: 35,
      },
      noise: {
        enabled: true,
        type: 'film',
        amount: 15,
        monochrome: false,
        blendMode: 'overlay',
      },
      patterns: {
        enabled: true,
        type: 'lightning',
        scale: 65,
        opacity: 95,
        color: '#00f0ff',
        blendMode: 'screen',
      },
      upscale: {
        factor: 8,
        sharpen: 30,
        format: 'image/png',
        quality: 0.95,
      },
    },
  },
  {
    id: 'frosted-minimal',
    name: 'Frosted Mountain Dawn',
    thumbnailGradient: 'linear-gradient(180deg, #dbeafe 0%, #94a3b8 50%, #1e293b 100%)',
    settings: {
      gradient: {
        enabled: true,
        type: 'linear',
        blendMode: 'soft-light',
        opacity: 50,
        angle: 180,
        stops: [
          { id: '1', color: '#dbeafe', position: 0 },
          { id: '2', color: '#94a3b8', position: 50 },
          { id: '3', color: '#1e293b', position: 100 },
        ],
        meshColors: ['#dbeafe', '#94a3b8', '#64748b', '#1e293b'],
      },
      blur: {
        enabled: true,
        category: 'glass',
        radius: 35,
        angle: 90,
        focalSize: 50,
        glassFrost: 80,
        glassSpecular: 70,
        tiltPosition: 50,
        tiltWidth: 40,
      },
      noise: {
        enabled: true,
        type: 'film',
        amount: 8,
        monochrome: true,
        blendMode: 'soft-light',
      },
      patterns: {
        enabled: false,
        type: 'none',
        scale: 30,
        opacity: 20,
        color: '#ffffff',
        blendMode: 'overlay',
      },
      upscale: {
        factor: 4,
        sharpen: 20,
        format: 'image/png',
        quality: 0.95,
      },
    },
  },
  {
    id: 'monochrome-wave',
    name: 'Noir 35mm Horizon',
    thumbnailGradient: 'linear-gradient(135deg, #111827 0%, #4b5563 50%, #1f2937 100%)',
    settings: {
      gradient: {
        enabled: true,
        type: 'linear',
        blendMode: 'multiply',
        opacity: 40,
        angle: 135,
        stops: [
          { id: '1', color: '#111827', position: 0 },
          { id: '2', color: '#4b5563', position: 100 },
        ],
        meshColors: ['#1f2937', '#111827', '#4b5563', '#000000'],
      },
      blur: {
        enabled: true,
        category: 'tiltshift',
        radius: 25,
        angle: 0,
        focalSize: 40,
        glassFrost: 30,
        glassSpecular: 30,
        tiltPosition: 50,
        tiltWidth: 35,
      },
      noise: {
        enabled: true,
        type: 'retro',
        amount: 35,
        monochrome: true,
        blendMode: 'overlay',
      },
      patterns: {
        enabled: false,
        type: 'none',
        scale: 30,
        opacity: 20,
        color: '#ffffff',
        blendMode: 'overlay',
      },
      upscale: {
        factor: 2,
        sharpen: 30,
        format: 'image/jpeg',
        quality: 0.9,
      },
    },
  },
  {
    id: 'magma-ember',
    name: 'Magma Flare & Cyan',
    thumbnailGradient: 'linear-gradient(135deg, #0284c7 0%, #1e1b4b 30%, #ef4444 70%, #f97316 100%)',
    settings: {
      gradient: {
        enabled: true,
        type: 'mesh',
        blendMode: 'overlay',
        opacity: 70,
        angle: 120,
        stops: [
          { id: '1', color: '#0284c7', position: 0 },
          { id: '2', color: '#ef4444', position: 100 },
        ],
        meshColors: ['#0284c7', '#1e1b4b', '#ef4444', '#f97316'],
      },
      blur: {
        enabled: true,
        category: 'radial',
        radius: 20,
        angle: 0,
        focalSize: 40,
        glassFrost: 40,
        glassSpecular: 50,
        tiltPosition: 50,
        tiltWidth: 30,
      },
      noise: {
        enabled: true,
        type: 'film',
        amount: 18,
        monochrome: false,
        blendMode: 'soft-light',
      },
      patterns: {
        enabled: false,
        type: 'none',
        scale: 30,
        opacity: 20,
        color: '#f97316',
        blendMode: 'overlay',
      },
      upscale: {
        factor: 4,
        sharpen: 25,
        format: 'image/jpeg',
        quality: 0.92,
      },
    },
  },
  {
    id: 'quantum-purple',
    name: 'Quantum Violet Lightning',
    thumbnailGradient: 'linear-gradient(135deg, #3b0764 0%, #7e22ce 40%, #06b6d4 100%)',
    settings: {
      gradient: {
        enabled: true,
        type: 'conical',
        blendMode: 'screen',
        opacity: 65,
        angle: 45,
        stops: [
          { id: '1', color: '#3b0764', position: 0 },
          { id: '2', color: '#7e22ce', position: 50 },
          { id: '3', color: '#06b6d4', position: 100 },
        ],
        meshColors: ['#3b0764', '#7e22ce', '#06b6d4', '#c084fc'],
      },
      blur: {
        enabled: true,
        category: 'angular',
        radius: 18,
        angle: 45,
        focalSize: 50,
        glassFrost: 50,
        glassSpecular: 50,
        tiltPosition: 50,
        tiltWidth: 30,
      },
      noise: {
        enabled: true,
        type: 'digital',
        amount: 22,
        monochrome: false,
        blendMode: 'overlay',
      },
      patterns: {
        enabled: true,
        type: 'lightning',
        scale: 75,
        opacity: 90,
        color: '#c084fc',
        blendMode: 'screen',
      },
      upscale: {
        factor: 8,
        sharpen: 35,
        format: 'image/png',
        quality: 0.95,
      },
    },
  },
];

export const RecentCreations: React.FC<RecentCreationsProps> = ({
  activeId,
  onSelectCreation,
  onViewAll,
}) => {
  return (
    <div className="mt-5 select-none">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold text-slate-200">Recent Creations</h4>
        <button
          onClick={onViewAll}
          className="text-[11px] text-slate-400 hover:text-cyan-400 transition font-medium"
        >
          View All
        </button>
      </div>

      {/* Horizontal Responsive Carousel Thumbnails */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3.5">
        {RECENT_CREATIONS.map(c => {
          const isSelected = c.id === activeId;

          return (
            <button
              key={c.id}
              onClick={() => onSelectCreation(c)}
              className={`relative aspect-[16/9] w-full rounded-xl overflow-hidden border transition-all duration-200 group ${
                isSelected
                  ? 'border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-500/20 scale-[1.02]'
                  : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
              }`}
              style={{ background: c.thumbnailGradient }}
            >
              {/* Overlay sheen on hover */}
              <div className="absolute inset-0 bg-dark-950/20 group-hover:bg-transparent transition-colors" />

              {/* Title tag on hover */}
              <span className="absolute bottom-1.5 left-2 right-2 text-[10px] font-medium text-white truncate drop-shadow text-left opacity-90 group-hover:opacity-100">
                {c.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
