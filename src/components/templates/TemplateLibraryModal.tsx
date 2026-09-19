import React, { useState } from 'react';
import { X, Sparkles, Check, Flame, Layers, Layout } from 'lucide-react';
import { DESIGN_TEMPLATES, TEMPLATE_CATEGORIES } from '../../engine/templates/templateLibrary';
import { DesignRecipe } from '../../types/project';

interface TemplateLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (recipe: DesignRecipe) => void;
}

export const TemplateLibraryModal: React.FC<TemplateLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredTemplates =
    activeCategory === 'all'
      ? DESIGN_TEMPLATES
      : DESIGN_TEMPLATES.filter(t => t.category === activeCategory);

  return (
    <div className="fixed inset-0 z-50 bg-dark-950/80 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-5xl h-[85vh] rounded-3xl bg-[#0e121d] border border-white/15 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-[#121624] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Layout className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Curated Design Templates</h3>
              <p className="text-xs text-slate-400">Professional multi-layer recipes ready to customize</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-dark-900 hover:bg-dark-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-3 border-b border-white/5 bg-dark-950 flex items-center gap-2 overflow-x-auto shrink-0 custom-scrollbar">
          {TEMPLATE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                activeCategory === cat.id
                  ? 'bg-cyan-500 text-dark-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'bg-dark-900 text-slate-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#090b14]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTemplates.map(tmpl => (
              <div
                key={tmpl.id}
                className="group rounded-2xl bg-[#111626] border border-white/10 hover:border-cyan-400/50 overflow-hidden shadow-xl hover:shadow-cyan-950/30 transition-all flex flex-col"
              >
                {/* Mock Visual Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-tr from-cyan-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 overflow-hidden">
                  <div className="text-center">
                    <span className="text-xs font-black text-white block drop-shadow-md">
                      {tmpl.name}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-300 mt-1 block">
                      {tmpl.width} × {tmpl.height} px
                    </span>
                  </div>

                  {/* Layers Count Badge */}
                  <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-dark-950/80 text-slate-300 border border-white/10 backdrop-blur-md">
                    {tmpl.layers.length} Layers
                  </span>
                </div>

                {/* Info & Apply */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {tmpl.name}
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {tmpl.tags?.map(t => (
                        <span
                          key={t}
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-dark-950 border border-white/5"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectTemplate(tmpl);
                      onClose();
                    }}
                    className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-dark-950 font-bold text-xs shadow-md transition"
                  >
                    Apply Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
