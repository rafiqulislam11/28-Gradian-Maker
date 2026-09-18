import React, { useState } from 'react';
import { X, Copy, Check, Code, FileCode, Layers } from 'lucide-react';
import { FilterSettings } from '../../types/studio';

interface CodeExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: FilterSettings;
}

export const CodeExportModal: React.FC<CodeExportModalProps> = ({
  isOpen,
  onClose,
  settings,
}) => {
  const [activeLang, setActiveLang] = useState<'css' | 'tailwind' | 'svg' | 'canvas'>('css');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Generate CSS code
  const generateCss = () => {
    const stopsStr = settings.gradient.stops
      .map(s => `${s.color} ${s.position}%`)
      .join(', ');
    
    let gradRule = '';
    if (settings.gradient.type === 'linear') {
      gradRule = `background: linear-gradient(${settings.gradient.angle}deg, ${stopsStr});`;
    } else if (settings.gradient.type === 'radial') {
      gradRule = `background: radial-gradient(circle, ${stopsStr});`;
    } else if (settings.gradient.type === 'conical') {
      gradRule = `background: conic-gradient(from ${settings.gradient.angle}deg, ${stopsStr});`;
    } else {
      const [tl, tr, br, bl] = settings.gradient.meshColors;
      gradRule = `background: \n    radial-gradient(at 0% 0%, ${tl} 0px, transparent 50%),\n    radial-gradient(at 100% 0%, ${tr} 0px, transparent 50%),\n    radial-gradient(at 100% 100%, ${br} 0px, transparent 50%),\n    radial-gradient(at 0% 100%, ${bl} 0px, transparent 50%);`;
    }

    const blurFilter = settings.blur.enabled
      ? `backdrop-filter: blur(${settings.blur.radius}px);\n  -webkit-backdrop-filter: blur(${settings.blur.radius}px);`
      : '';

    return `.gradient-x-studio {\n  ${gradRule}\n  ${blurFilter}\n  mix-blend-mode: ${settings.gradient.blendMode};\n  opacity: ${settings.gradient.opacity / 100};\n}`;
  };

  // Generate Tailwind CSS code
  const generateTailwind = () => {
    const colors = settings.gradient.stops.map(s => s.color);
    const fromColor = colors[0] || '#8b5cf6';
    const toColor = colors[colors.length - 1] || '#06b6d4';
    const viaColor = colors.length > 2 ? colors[1] : null;

    const blurClass = settings.blur.enabled ? `backdrop-blur-[` + settings.blur.radius + `px]` : '';
    const viaClass = viaColor ? `via-[` + viaColor + `]` : '';

    return `<!-- Tailwind CSS Container -->\n<div className="relative overflow-hidden ${blurClass}">\n  <div className="absolute inset-0 bg-gradient-to-tr from-[` + fromColor + `] ${viaClass} to-[` + toColor + `] opacity-${settings.gradient.opacity} mix-blend-${settings.gradient.blendMode}" />\n  <!-- Content here -->\n</div>`;
  };

  // Generate SVG Code
  const generateSvg = () => {
    const stopsXml = settings.gradient.stops
      .map(
        s =>
          `    <stop offset="${s.position}%" stop-color="${s.color}" stop-opacity="1" />`
      )
      .join('\n');

    return `<svg width="800" height="600" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n    <linearGradient id="gradX" x1="0%" y1="0%" x2="100%" y2="100%">\n${stopsXml}\n    </linearGradient>\n    <filter id="gradXBlur">\n      <feGaussianBlur stdDeviation="${settings.blur.radius}" />\n    </filter>\n  </defs>\n  <rect width="800" height="600" fill="url(#gradX)" filter="url(#gradXBlur)" opacity="${settings.gradient.opacity / 100}" />\n</svg>`;
  };

  // Generate Canvas JavaScript
  const generateCanvas = () => {
    return `// HTML5 Canvas Gradient & Blur Generator\nconst canvas = document.createElement('canvas');\ncanvas.width = 1920;\ncanvas.height = 1080;\nconst ctx = canvas.getContext('2d');\n\n// Blur filter\nctx.filter = 'blur(${settings.blur.radius}px)';\n\n// Gradient\nconst grad = ctx.createLinearGradient(0, 0, 1920, 1080);\n${settings.gradient.stops.map(s => `grad.addColorStop(${s.position / 100}, '${s.color}');`).join('\n')}\n\nctx.fillStyle = grad;\nctx.globalCompositeOperation = '${settings.gradient.blendMode}';\nctx.globalAlpha = ${settings.gradient.opacity / 100};\nctx.fillRect(0, 0, 1920, 1080);`;
  };

  const codeSnippets = {
    css: generateCss(),
    tailwind: generateTailwind(),
    svg: generateSvg(),
    canvas: generateCanvas(),
  };

  const currentCode = codeSnippets[activeLang];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-2xl glass-panel border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-dark-900/60">
          <div className="flex items-center gap-2.5">
            <Code className="w-5 h-5 text-brand-violet" />
            <h3 className="text-base font-semibold text-white">Export Styling & Gradient Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-dark-900/30">
          <div className="flex items-center gap-2">
            {(['css', 'tailwind', 'svg', 'canvas'] as const).map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLang(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition ${
                  activeLang === lang
                    ? 'bg-brand-violet text-white shadow-glow-violet'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-xs font-medium text-slate-200 border border-white/10 flex items-center gap-1.5 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-slate-300 bg-dark-950/80 leading-relaxed">
          <pre className="whitespace-pre-wrap selection:bg-brand-violet selection:text-white">
            <code>{currentCode}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};
