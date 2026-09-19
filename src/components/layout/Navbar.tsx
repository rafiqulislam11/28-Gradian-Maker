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
  Sun,
  Moon,
  Globe,
  Download,
  Layout,
  Dices,
  Zap,
  Code,
  FolderOpen,
  Save,
  Plus,
  Undo2,
  Redo2,
  FileText,
} from 'lucide-react';
import { useThemeAndLanguage } from '../../context/ThemeLanguageContext';

export type MainNavTab = 'studio' | 'generator' | 'vector' | 'batch' | 'pricing';

interface NavbarProps {
  activeNavTab: MainNavTab;
  setActiveNavTab: (tab: MainNavTab) => void;
  batchCount?: number;
  isProcessing?: boolean;
  onOpen3DStudio?: () => void;
  onOpenPatternLibrary?: () => void;
  onOpenTemplates?: () => void;
  onOpenRandomize?: () => void;
  onOpenExport?: () => void;
  onOpenCodeExport?: () => void;
  onNewProject?: () => void;
  onSaveProject?: () => void;
  onOpenProjectFile?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeNavTab,
  setActiveNavTab,
  batchCount = 0,
  isProcessing = false,
  onOpen3DStudio,
  onOpenPatternLibrary,
  onOpenTemplates,
  onOpenRandomize,
  onOpenExport,
  onOpenCodeExport,
  onNewProject,
  onSaveProject,
  onOpenProjectFile,
  canUndo = false,
  canRedo = false,
  onUndo,
  onRedo,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'file' | 'edit' | 'view' | 'generate' | null>(null);
  const { theme, toggleTheme, language, toggleLanguage, t } = useThemeAndLanguage();

  const handleNavClick = (tab: MainNavTab) => {
    setActiveNavTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-5 lg:px-6 flex items-center justify-between z-40 select-none bg-[#090c14]/95 border-b border-white/10 backdrop-blur-xl relative">
      {/* 1. BRAND LOGO + APP MENU */}
      <div className="flex items-center gap-4 shrink-0">
        <div
          className="flex items-center gap-2 cursor-pointer py-1"
          onClick={() => handleNavClick('studio')}
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-indigo-500 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center font-black text-dark-950 text-xs">
            GX
          </div>
          <div className="flex items-baseline gap-1 text-sm sm:text-base font-bold tracking-tight">
            <span className="text-cyan-400 font-extrabold">GRADIENT</span>
            <span className="text-purple-400 font-black">X</span>
            <span className="text-white font-semibold">STUDIO</span>
            <span className="text-[10px] font-mono px-1 py-0.2 rounded font-black bg-cyan-400 text-dark-950 uppercase ml-0.5 shadow-sm">
              PRO
            </span>
          </div>
        </div>

        {/* Top Desktop Menu: File, Edit, Generate */}
        <div className="hidden lg:flex items-center gap-1 text-xs text-slate-300 font-medium ml-2">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'file' ? null : 'file')}
              className={`px-2.5 py-1 rounded-lg hover:bg-white/10 hover:text-white transition ${
                activeDropdown === 'file' ? 'bg-white/10 text-white' : ''
              }`}
            >
              File
            </button>
            {activeDropdown === 'file' && (
              <div
                className="absolute left-0 top-8 z-50 w-48 rounded-xl bg-[#141928] border border-white/15 shadow-2xl p-1 space-y-0.5 backdrop-blur-xl"
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => {
                    onNewProject?.();
                    setActiveDropdown(null);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  <span>New Project</span>
                </button>
                <button
                  onClick={() => {
                    onOpenProjectFile?.();
                    setActiveDropdown(null);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open Project JSON</span>
                </button>
                <button
                  onClick={() => {
                    onSaveProject?.();
                    setActiveDropdown(null);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Save Project (Ctrl+S)</span>
                </button>
                <div className="h-[1px] bg-white/10 my-1" />
                <button
                  onClick={() => {
                    onOpenTemplates?.();
                    setActiveDropdown(null);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <Layout className="w-3.5 h-3.5 text-purple-400" />
                  <span>Template Library</span>
                </button>
                <button
                  onClick={() => {
                    onOpenExport?.();
                    setActiveDropdown(null);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-2 transition"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Export Center (Ctrl+E)</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(activeDropdown === 'edit' ? null : 'edit')}
              className={`px-2.5 py-1 rounded-lg hover:bg-white/10 hover:text-white transition ${
                activeDropdown === 'edit' ? 'bg-white/10 text-white' : ''
              }`}
            >
              Edit
            </button>
            {activeDropdown === 'edit' && (
              <div
                className="absolute left-0 top-8 z-50 w-48 rounded-xl bg-[#141928] border border-white/15 shadow-2xl p-1 space-y-0.5 backdrop-blur-xl"
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button
                  onClick={() => {
                    onUndo?.();
                    setActiveDropdown(null);
                  }}
                  disabled={!canUndo}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:text-white hover:bg-white/10 flex items-center justify-between disabled:opacity-30 transition"
                >
                  <span className="flex items-center gap-2">
                    <Undo2 className="w-3.5 h-3.5" /> Undo
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Ctrl+Z</span>
                </button>
                <button
                  onClick={() => {
                    onRedo?.();
                    setActiveDropdown(null);
                  }}
                  disabled={!canRedo}
                  className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs text-slate-200 hover:text-white hover:bg-white/10 flex items-center justify-between disabled:opacity-30 transition"
                >
                  <span className="flex items-center gap-2">
                    <Redo2 className="w-3.5 h-3.5" /> Redo
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">Ctrl+Y</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. CENTER MASTER MODULE NAVIGATION SWITCHER */}
      <div className="hidden md:flex items-center p-1 rounded-2xl bg-dark-950 border border-white/10 shadow-lg backdrop-blur-xl">
        <button
          onClick={() => handleNavClick('studio')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeNavTab === 'studio'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25 ring-1 ring-cyan-300/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Studio Pro</span>
        </button>

        <button
          onClick={() => handleNavClick('generator')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeNavTab === 'generator'
              ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-md shadow-fuchsia-500/25 ring-1 ring-pink-300/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>1000 Generator</span>
        </button>

        <button
          onClick={() => handleNavClick('vector')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeNavTab === 'vector'
              ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-dark-950 shadow-md shadow-teal-500/25 font-extrabold ring-1 ring-teal-300/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Vector Part</span>
        </button>

        <button
          onClick={() => handleNavClick('batch')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
            activeNavTab === 'batch'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-dark-950 shadow-md shadow-amber-500/25 font-extrabold'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>Batch Queue</span>
          {batchCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black bg-black/40 text-white">
              {batchCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. RIGHT UTILITY BUTTONS CLUSTER */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* 3D Wood Studio Trigger */}
        {onOpen3DStudio && (
          <button
            onClick={onOpen3DStudio}
            className="px-2.5 py-1.5 rounded-xl bg-dark-900 hover:bg-dark-800 text-slate-300 hover:text-amber-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
            title="3D Wood & Lumber Studio"
          >
            <Box className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">3D Studio</span>
          </button>
        )}

        {/* 500+ Pattern Library Modal Trigger */}
        {onOpenPatternLibrary && (
          <button
            onClick={onOpenPatternLibrary}
            className="px-2.5 py-1.5 rounded-xl bg-dark-900 hover:bg-dark-800 text-slate-300 hover:text-violet-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
            title="500+ Pattern Library"
          >
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span className="hidden sm:inline">500+ Patterns</span>
          </button>
        )}

        {/* Template Library Trigger */}
        {onOpenTemplates && (
          <button
            onClick={onOpenTemplates}
            className="px-2.5 py-1.5 rounded-xl bg-dark-900 hover:bg-dark-800 text-slate-300 hover:text-cyan-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
            title="Design Templates"
          >
            <Layout className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Templates</span>
          </button>
        )}

        {/* Controlled Randomize Trigger */}
        {onOpenRandomize && (
          <button
            onClick={onOpenRandomize}
            className="p-2 rounded-xl bg-dark-900 hover:bg-dark-800 text-slate-300 hover:text-amber-300 border border-white/10 transition"
            title="Controlled Randomize"
          >
            <Dices className="w-4 h-4 text-amber-400" />
          </button>
        )}

        {/* Universal Code Exporter */}
        {onOpenCodeExport && (
          <button
            onClick={onOpenCodeExport}
            className="p-2 rounded-xl bg-dark-900 hover:bg-dark-800 text-slate-300 hover:text-cyan-300 border border-white/10 transition"
            title="Export CSS / SVG / Tailwind Code"
          >
            <Code className="w-4 h-4 text-cyan-400" />
          </button>
        )}

        {/* Export Center Trigger */}
        {onOpenExport && (
          <button
            onClick={onOpenExport}
            className="px-3 sm:px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:brightness-110 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        )}

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-dark-900 border border-white/10 text-slate-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-14 left-0 right-0 z-50 bg-[#0e121d] border-b border-white/10 p-4 space-y-2 shadow-2xl backdrop-blur-xl">
          <button
            onClick={() => handleNavClick('studio')}
            className="w-full py-2 px-3 rounded-xl text-left text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Studio Pro Editor</span>
          </button>
          <button
            onClick={() => handleNavClick('generator')}
            className="w-full py-2 px-3 rounded-xl text-left text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span>1000 Design Generator</span>
          </button>
          <button
            onClick={() => handleNavClick('vector')}
            className="w-full py-2 px-3 rounded-xl text-left text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Vector Studio & Icon Packs</span>
          </button>
          <button
            onClick={() => handleNavClick('batch')}
            className="w-full py-2 px-3 rounded-xl text-left text-xs font-bold text-slate-200 hover:bg-white/10 flex items-center gap-2"
          >
            <Box className="w-4 h-4 text-amber-400" />
            <span>Batch Queue ({batchCount})</span>
          </button>
        </div>
      )}
    </header>
  );
};
