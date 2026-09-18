import React, { useState } from 'react';
import {
  Menu,
  X,
  Box,
  Sparkles,
  Layers,
  Sliders,
  CreditCard,
  User,
} from 'lucide-react';

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: MainNavTab) => {
    setActiveNavTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="h-14 sm:h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between z-40 select-none bg-dark-950/40 backdrop-blur-md border-b border-white/5 relative">
      {/* Brand Logo: "Gradient X Studio" */}
      <div
        className="flex items-center gap-2 cursor-pointer py-1"
        onClick={() => handleNavClick('tools')}
      >
        <div className="flex items-baseline gap-1 sm:gap-1.5 text-base sm:text-lg font-bold tracking-tight">
          <span className="text-cyan-400 font-extrabold">Gradient</span>
          <span className="text-purple-400 font-black">X</span>
          <span className="text-white font-semibold">Studio</span>
        </div>
      </div>

      {/* Desktop Navigation Links & Action Buttons (Hidden on < md) */}
      <nav className="hidden md:flex items-center gap-4 lg:gap-6">
        <button
          onClick={() => handleNavClick('tools')}
          className={`text-xs sm:text-sm font-medium transition-colors ${
            activeNavTab === 'tools'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Tools
        </button>

        <button
          onClick={() => handleNavClick('batch')}
          className={`text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeNavTab === 'batch'
              ? 'text-cyan-400 font-bold'
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
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-600/15 hover:from-amber-500/25 hover:to-orange-500/25 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5 shadow-sm active:scale-95"
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
            className="text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 transition flex items-center gap-1.5 active:scale-95"
            title="Explore 500+ Vector & Fractal Patterns"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>500+ Patterns</span>
          </button>
        )}

        <button
          onClick={() => handleNavClick('pricing')}
          className={`text-xs sm:text-sm font-medium transition-colors ${
            activeNavTab === 'pricing'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pricing
        </button>

        <button
          onClick={() => handleNavClick('account')}
          className={`text-xs sm:text-sm font-medium transition-colors ${
            activeNavTab === 'account'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Account
        </button>
      </nav>

      {/* Mobile Hamburger Toggle Button (Shown only on < md) */}
      <div className="flex md:hidden items-center gap-2">
        {batchCount > 0 && (
          <button
            onClick={() => handleNavClick('batch')}
            className="px-2 py-1 rounded-lg text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono font-bold flex items-center gap-1"
          >
            <Layers className="w-3 h-3" />
            <span>{batchCount}</span>
          </button>
        )}

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl bg-dark-900 border border-white/10 text-slate-300 hover:text-white transition active:scale-95"
          aria-label="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-[#0c101a] border-b border-white/10 p-4 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top duration-200 flex flex-col gap-2 md:hidden">
          <button
            onClick={() => handleNavClick('tools')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-left font-medium text-xs flex items-center justify-between transition ${
              activeNavTab === 'tools'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Canvas & Tools Studio</span>
            </div>
            {activeNavTab === 'tools' && <span className="text-[10px] text-cyan-400 font-mono">Active</span>}
          </button>

          <button
            onClick={() => handleNavClick('batch')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-left font-medium text-xs flex items-center justify-between transition ${
              activeNavTab === 'batch'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Batch Queue Grid</span>
            </div>
            {batchCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/30 text-purple-300 font-mono font-bold">
                {batchCount}
              </span>
            )}
          </button>

          {onOpen3DStudio && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpen3DStudio();
              }}
              className="w-full py-2.5 px-3.5 rounded-xl text-left font-medium text-xs flex items-center justify-between bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition"
            >
              <div className="flex items-center gap-2.5">
                <Box className="w-4 h-4 text-amber-400" />
                <span>3D Wood & Texture Studio</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-dark-950 font-bold font-mono">
                Three.js
              </span>
            </button>
          )}

          {onOpenPatternLibrary && (
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenPatternLibrary();
              }}
              className="w-full py-2.5 px-3.5 rounded-xl text-left font-medium text-xs flex items-center justify-between bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>500+ Pattern Library</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400">Library</span>
            </button>
          )}

          <button
            onClick={() => handleNavClick('pricing')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-left font-medium text-xs flex items-center gap-2.5 transition ${
              activeNavTab === 'pricing'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>Pricing Plans</span>
          </button>

          <button
            onClick={() => handleNavClick('account')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-left font-medium text-xs flex items-center gap-2.5 transition ${
              activeNavTab === 'account'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4 text-slate-400" />
            <span>Account & Licenses</span>
          </button>
        </div>
      )}
    </header>
  );
};
