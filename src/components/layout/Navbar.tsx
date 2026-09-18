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
} from 'lucide-react';
import { useThemeAndLanguage } from '../../context/ThemeLanguageContext';

export type MainNavTab = 'tools' | 'vector' | 'batch' | 'pricing' | 'account';

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
  const { theme, setTheme, toggleTheme, language, setLanguage, toggleLanguage, t } = useThemeAndLanguage();

  const handleNavClick = (tab: MainNavTab) => {
    setActiveNavTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="h-14 sm:h-16 px-3 sm:px-6 lg:px-8 flex items-center justify-between z-40 select-none bg-dark-950/60 dark:bg-dark-950/40 backdrop-blur-md border-b border-white/5 relative">
      {/* Brand Logo: "Gradient X Studio" */}
      <div
        className="flex items-center gap-2 cursor-pointer py-1 shrink-0"
        onClick={() => handleNavClick('tools')}
      >
        <div className="flex items-baseline gap-1 sm:gap-1.5 text-base sm:text-lg font-bold tracking-tight">
          <span className="text-cyan-400 font-extrabold">Gradient</span>
          <span className="text-purple-400 font-black">X</span>
          <span className="text-white font-semibold">Studio</span>
        </div>
      </div>

      {/* Desktop Navigation Links (Hidden on < lg) */}
      <nav className="hidden lg:flex items-center gap-3 xl:gap-5">
        <button
          onClick={() => handleNavClick('tools')}
          className={`text-xs xl:text-sm font-medium transition-colors ${
            activeNavTab === 'tools'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('nav_image_studio', 'Image Studio')}
        </button>

        {/* Victor Studio Tab */}
        <button
          onClick={() => handleNavClick('vector')}
          className={`text-xs xl:text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeNavTab === 'vector'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t('nav_victor_studio', 'Victor Studio')}</span>
          <span className="px-1.5 py-0.2 rounded text-[9px] bg-gradient-to-r from-cyan-400 to-teal-400 text-dark-950 font-bold font-mono">
            SVG
          </span>
        </button>

        <button
          onClick={() => handleNavClick('batch')}
          className={`text-xs xl:text-sm font-medium transition-colors flex items-center gap-1.5 ${
            activeNavTab === 'batch'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>{t('nav_batch', 'Batch (500+)')}</span>
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
            <span>{t('nav_3d_studio', '3D Studio')}</span>
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
            <span>{t('nav_patterns', '500+ Patterns')}</span>
          </button>
        )}

        <button
          onClick={() => handleNavClick('pricing')}
          className={`text-xs xl:text-sm font-medium transition-colors ${
            activeNavTab === 'pricing'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('nav_pricing', 'Pricing')}
        </button>

        <button
          onClick={() => handleNavClick('account')}
          className={`text-xs xl:text-sm font-medium transition-colors ${
            activeNavTab === 'account'
              ? 'text-cyan-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {t('nav_account', 'Account')}
        </button>
      </nav>

      {/* Right Controls: 2 Modes (Dark / Light) & 2 Languages (EN / বাংলা) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 2 MODES TOGGLE: Dark 🌙 | Light ☀️ */}
        <div
          className="flex items-center p-0.5 rounded-xl bg-dark-900/90 border border-white/10 shadow-sm"
          title={theme === 'dark' ? 'Switch to Light Mode (লাইট মোড)' : 'Switch to Dark Mode (ডার্ক মোড)'}
        >
          <button
            onClick={() => setTheme('dark')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-mono text-[11px]">{language === 'bn' ? 'ডার্ক' : 'Dark'}</span>
          </button>
          <button
            onClick={() => setTheme('light')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              theme === 'light'
                ? 'bg-amber-400 text-dark-950 font-bold shadow-md shadow-amber-400/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-dark-950' : 'text-amber-400'}`} />
            <span className="hidden sm:inline font-mono text-[11px]">{language === 'bn' ? 'লাইট' : 'Light'}</span>
          </button>
        </div>

        {/* 2 LANGUAGES TOGGLE: English 🇺🇸 | বাংলা 🇧🇩 */}
        <div
          className="flex items-center p-0.5 rounded-xl bg-dark-900/90 border border-white/10 shadow-sm"
          title={language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
        >
          <button
            onClick={() => setLanguage('bn')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              language === 'bn'
                ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300 border border-emerald-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xs">🇧🇩</span>
            <span className="text-[11px]">বাংলা</span>
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`px-2 sm:px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
              language === 'en'
                ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xs">🇺🇸</span>
            <span className="font-mono text-[11px]">EN</span>
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button (Shown only on < lg) */}
        <div className="flex lg:hidden items-center gap-1.5">
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
      </div>

      {/* Mobile Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 z-50 bg-[#0c101a] border-b border-white/10 p-4 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-top duration-200 flex flex-col gap-2.5 lg:hidden">
          {/* Quick Mode & Language Pill bar in Mobile Drawer */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
              <span>{language === 'bn' ? 'মোড ও ভাষা:' : 'Mode & Lang:'}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-dark-900 border border-white/10 text-cyan-300 flex items-center gap-1.5"
              >
                {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-cyan-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                <span>{theme === 'dark' ? (language === 'bn' ? 'ডার্ক মোড' : 'Dark Mode') : (language === 'bn' ? 'লাইট মোড' : 'Light Mode')}</span>
              </button>
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-dark-900 border border-white/10 text-white flex items-center gap-1.5"
              >
                <span>{language === 'bn' ? '🇧🇩 বাংলা' : '🇺🇸 EN'}</span>
              </button>
            </div>
          </div>

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
              <span>{t('nav_image_studio', 'Image Studio')}</span>
            </div>
            {activeNavTab === 'tools' && <span className="text-[10px] text-cyan-400 font-mono">Active</span>}
          </button>

          <button
            onClick={() => handleNavClick('vector')}
            className={`w-full py-2.5 px-3.5 rounded-xl text-left font-medium text-xs flex items-center justify-between transition ${
              activeNavTab === 'vector'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t('nav_victor_studio', 'Victor Studio')}</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-400 text-dark-950 font-bold font-mono">
              SVG
            </span>
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
              <span>{t('nav_batch', 'Batch Queue Grid')}</span>
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
                <span>{t('nav_3d_studio', '3D Wood & Texture Studio')}</span>
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
                <span>{t('nav_patterns', '500+ Pattern Library')}</span>
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
            <span>{t('nav_pricing', 'Pricing Plans')}</span>
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
            <span>{t('nav_account', 'Account & Licenses')}</span>
          </button>
        </div>
      )}
    </header>
  );
};

