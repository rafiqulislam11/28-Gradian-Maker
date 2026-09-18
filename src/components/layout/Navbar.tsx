import { Layers, Grid3X3, Sliders, Cpu, Download, Box, Sparkles } from 'lucide-react';

export type MainNavTab = 'tools' | 'batch' | 'pricing' | 'account';

interface NavbarProps {
  activeNavTab: MainNavTab;
  setActiveNavTab: (tab: MainNavTab) => void;
  batchCount?: number;
  isProcessing?: boolean;
  onOpen3DStudio?: () => void;
  onOpenPatternLibrary?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeNavTab,
  setActiveNavTab,
  batchCount = 0,
  isProcessing = false,
  onOpen3DStudio,
  onOpenPatternLibrary,
}) => {
  return (
    <header className="h-16 px-8 flex items-center justify-between z-30 select-none bg-transparent">
      {/* Brand Logo: "Gradient X Studio" */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveNavTab('tools')}>
        <div className="flex items-baseline gap-1.5 text-lg font-bold tracking-tight">
          <span className="text-cyan-400 font-extrabold">Gradient</span>
          <span className="text-purple-400 font-black">X</span>
          <span className="text-white font-semibold">Studio</span>
        </div>
      </div>

      {/* Navigation Links & Action Buttons */}
      <nav className="flex items-center gap-6 sm:gap-7">
        <button
          onClick={() => setActiveNavTab('tools')}
          className={`text-sm font-medium transition-colors ${
            activeNavTab === 'tools'
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tools
        </button>

        <button
          onClick={() => setActiveNavTab('batch')}
          className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeNavTab === 'batch'
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Batch (500+)</span>
          {batchCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500/30 text-purple-300 font-mono border border-purple-500/40">
              {batchCount}
            </span>
          )}
        </button>

        {/* 3D Wood Studio Button */}
        {onOpen3DStudio && (
          <button
            onClick={onOpen3DStudio}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-600/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
            title="Open Interactive 3D Lumber & Texture Modeler"
          >
            <Box className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>3D Studio</span>
            <span className="px-1 py-0.2 rounded text-[9px] bg-amber-400 text-dark-950 font-bold font-mono">
              NEW
            </span>
          </button>
        )}

        {/* 500+ Patterns Button */}
        {onOpenPatternLibrary && (
          <button
            onClick={onOpenPatternLibrary}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 transition flex items-center gap-1.5 hover:scale-105 active:scale-95"
            title="Explore 500+ Vector & Fractal Patterns"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>500+ Patterns</span>
          </button>
        )}

        <button
          onClick={() => setActiveNavTab('pricing')}
          className={`text-sm font-medium transition-colors ${
            activeNavTab === 'pricing'
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pricing
        </button>

        <button
          onClick={() => setActiveNavTab('account')}
          className={`text-sm font-medium transition-colors ${
            activeNavTab === 'account'
              ? 'text-cyan-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Account
        </button>
      </nav>
    </header>
  );
};
