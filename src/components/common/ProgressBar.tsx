import React from 'react';
import { Play, Pause, XCircle, Cpu, Clock, Zap, CheckCircle2 } from 'lucide-react';
import { QueueStats } from '../../types/studio';

interface ProgressBarProps {
  stats: QueueStats;
  isProcessing: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  stats,
  isProcessing,
  isPaused,
  onPause,
  onResume,
  onCancel,
}) => {
  if (stats.total === 0) return null;

  const percent = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const elapsedSec = (stats.elapsedMs / 1000).toFixed(1);
  const remainingSec = (stats.estimatedRemainingMs / 1000).toFixed(1);

  return (
    <div className="glass-panel rounded-2xl p-4 border border-brand-violet/20 shadow-glow-violet/20 mb-4 transition-all">
      {/* Header Line */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            {isProcessing && !isPaused ? (
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-cyan"></span>
              </span>
            ) : isPaused ? (
              <span className="h-3 w-3 rounded-full bg-brand-amber"></span>
            ) : percent === 100 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <span className="h-3 w-3 rounded-full bg-slate-500"></span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-white">
              {percent === 100
                ? 'Batch Complete'
                : isPaused
                ? 'Batch Paused'
                : 'Processing Queue'}
            </span>
            <span className="text-xs font-mono text-brand-cyan font-medium">
              {stats.completed}/{stats.total} images ({percent}%)
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isProcessing && (
            <>
              {isPaused ? (
                <button
                  onClick={onResume}
                  className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center gap-1.5 transition"
                >
                  <Play className="w-3 h-3 fill-emerald-300" />
                  Resume
                </button>
              ) : (
                <button
                  onClick={onPause}
                  className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 flex items-center gap-1.5 transition"
                >
                  <Pause className="w-3 h-3 fill-amber-300" />
                  Pause
                </button>
              )}

              <button
                onClick={onCancel}
                className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30 flex items-center gap-1.5 transition"
              >
                <XCircle className="w-3 h-3" />
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Glowing Bar */}
      <div className="w-full bg-dark-900 rounded-full h-2.5 overflow-hidden border border-white/5 relative mb-3">
        <div
          className="h-full bg-gradient-to-r from-brand-violet via-brand-cyan to-emerald-400 transition-all duration-300 relative rounded-full"
          style={{ width: `${percent}%` }}
        >
          {isProcessing && !isPaused && (
            <div className="absolute inset-0 bg-white/25 animate-pulse"></div>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono gap-y-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Elapsed: <span className="text-slate-200">{elapsedSec}s</span>
          </span>

          {isProcessing && !isPaused && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              ETA: <span className="text-brand-cyan">{remainingSec}s</span>
            </span>
          )}

          {stats.throughputFps > 0 && (
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-brand-amber" />
              Speed: <span className="text-brand-amber font-semibold">{stats.throughputFps} img/s</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-brand-violet" />
            Parallel Web Workers:{' '}
            <span className="text-brand-violet font-semibold">{stats.activeWorkers || 4} Cores</span>
          </span>

          {stats.failed > 0 && (
            <span className="text-rose-400 font-medium">Failed: {stats.failed}</span>
          )}
        </div>
      </div>
    </div>
  );
};
