import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Layers,
  Download,
  Copy,
  Check,
  Upload,
  RefreshCw,
  Sliders,
  Grid,
  FileImage,
  Package,
  Wand2,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Trash2,
  Plus,
} from 'lucide-react';
import { ImageItem } from '../../types/studio';
import { vectorizeImage, VectorizeResult, downloadSvgFile } from '../../engine/vectorizerEngine';
import {
  removeWhiteBackground,
  batchRemoveWhiteBackground,
  RemoveBackgroundOptions,
} from '../../engine/backgroundRemoverEngine';
import {
  generateIconSheet,
  IconSheetMode,
  IconSheetOptions,
  IconSheetResult,
} from '../../engine/iconSheetEngine';
import { buildIconPackZip, IconPackOptions } from '../../engine/iconPackEngine';
import { useThemeAndLanguage } from '../../context/ThemeLanguageContext';

export type VictorSubTab = 'vectorize' | 'iconSheet' | 'removeWhite' | 'iconPack';

interface VectorStudioViewProps {
  images: ImageItem[];
  selectedImage: ImageItem | null;
  onSelectImage: (id: string) => void;
  onUploadImages: (files: File[]) => void;
  onUpdateImages: (items: ImageItem[]) => void;
  onLoadSampleImage?: () => void;
  onSwitchToImagePart?: () => void;
}

export const VectorStudioView: React.FC<VectorStudioViewProps> = ({
  images,
  selectedImage,
  onSelectImage,
  onUploadImages,
  onUpdateImages,
  onLoadSampleImage,
  onSwitchToImagePart,
}) => {
  const { t } = useThemeAndLanguage();
  const [activeTab, setActiveTab] = useState<VictorSubTab>('vectorize');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Vectorizer States
  const [vectorColors, setVectorColors] = useState<number>(6);
  const [vectorMonochrome, setVectorMonochrome] = useState<boolean>(false);
  const [vectorMinArea, setVectorMinArea] = useState<number>(2);
  const [vectorResult, setVectorResult] = useState<VectorizeResult | null>(null);
  const [isVectorizing, setIsVectorizing] = useState<boolean>(false);
  const [copiedSvg, setCopiedSvg] = useState<boolean>(false);

  // 2. Icon Sheet States
  const [sheetMode, setSheetMode] = useState<IconSheetMode>('1');
  const [sheetColumns, setSheetColumns] = useState<number>(4);
  const [sheetTileSize, setSheetTileSize] = useState<number>(96);
  const [sheetBg, setSheetBg] = useState<'dark' | 'light' | 'transparent' | 'gradient'>('dark');
  const [sheetResult, setSheetResult] = useState<IconSheetResult | null>(null);
  const [isGeneratingSheet, setIsGeneratingSheet] = useState<boolean>(false);

  // 3. Remove White States
  const [whiteThreshold, setWhiteThreshold] = useState<number>(35);
  const [whiteFeather, setWhiteFeather] = useState<number>(4);
  const [isRemovingWhite, setIsRemovingWhite] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<string | null>(null);

  // 4. Icon Pack States
  const [packName, setPackName] = useState<string>('gradient-x-icon-pack');
  const [packAuthor, setPackAuthor] = useState<string>('Creator');
  const [includeSvg, setIncludeSvg] = useState<boolean>(true);
  const [includePngs, setIncludePngs] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [isBuildingPack, setIsBuildingPack] = useState<boolean>(false);
  const [packProgress, setPackProgress] = useState<string | null>(null);

  // Auto-run Vectorizer when active image or parameters change
  useEffect(() => {
    let isCancelled = false;
    if (!selectedImage) {
      setVectorResult(null);
      return;
    }

    const runVectorize = async () => {
      setIsVectorizing(true);
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = selectedImage.processedUrl || selectedImage.originalUrl;
        await img.decode();
        if (isCancelled) return;

        const res = await vectorizeImage(img, {
          colors: vectorColors,
          monochrome: vectorMonochrome,
          minArea: vectorMinArea,
          smoothness: 4,
        });

        if (!isCancelled) {
          setVectorResult(res);
        }
      } catch (err) {
        console.warn('Vectorization error:', err);
      } finally {
        if (!isCancelled) setIsVectorizing(false);
      }
    };

    runVectorize();
    return () => {
      isCancelled = true;
    };
  }, [selectedImage?.id, selectedImage?.processedUrl, selectedImage?.originalUrl, vectorColors, vectorMonochrome, vectorMinArea]);

  // Auto-run Icon Sheet Generator when sheet tab is active
  useEffect(() => {
    let isCancelled = false;
    if (activeTab !== 'iconSheet') return;

    const runSheet = async () => {
      setIsGeneratingSheet(true);
      try {
        const res = await generateIconSheet(images, {
          mode: sheetMode,
          columns: sheetColumns,
          tileSize: sheetTileSize,
          bgType: sheetBg,
          showLabels: true,
        });
        if (!isCancelled) setSheetResult(res);
      } catch (e) {
        console.warn('Icon sheet generation failed:', e);
      } finally {
        if (!isCancelled) setIsGeneratingSheet(false);
      }
    };

    runSheet();
    return () => {
      isCancelled = true;
    };
  }, [activeTab, sheetMode, sheetColumns, sheetTileSize, sheetBg, images.length, selectedImage?.id]);

  // Handle Copy SVG
  const handleCopySvg = () => {
    if (!vectorResult) return;
    navigator.clipboard.writeText(vectorResult.svgString);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  // Handle Remove White from Single Active Image
  const handleRemoveWhiteActive = async () => {
    if (!selectedImage) return;
    setIsRemovingWhite(true);
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedImage.processedUrl || selectedImage.originalUrl;
      await img.decode();

      const { dataUrl } = await removeWhiteBackground(img, {
        threshold: whiteThreshold,
        feather: whiteFeather,
      });

      const updated = images.map(it =>
        it.id === selectedImage.id
          ? { ...it, processedUrl: dataUrl, thumbnailUrl: dataUrl, status: 'completed' as const }
          : it
      );
      onUpdateImages(updated);
    } catch (e) {
      console.warn('Remove white failed:', e);
    } finally {
      setIsRemovingWhite(false);
    }
  };

  // Handle Batch Remove White from ALL Images
  const handleBatchRemoveWhite = async () => {
    if (images.length === 0) return;
    setIsRemovingWhite(true);
    try {
      const updated = await batchRemoveWhiteBackground(
        images,
        { threshold: whiteThreshold, feather: whiteFeather },
        (done, total) => setBatchProgress(`${done} / ${total} icons cleaned`)
      );
      onUpdateImages(updated);
      setBatchProgress('All white backgrounds removed!');
      setTimeout(() => setBatchProgress(null), 3000);
    } catch (e) {
      console.warn('Batch white removal failed:', e);
    } finally {
      setIsRemovingWhite(false);
    }
  };

  // Handle Icon Pack ZIP Download
  const handleDownloadIconPack = async () => {
    if (images.length === 0) return;
    setIsBuildingPack(true);
    try {
      const zipBlob = await buildIconPackZip(
        images,
        {
          packName,
          author: packAuthor,
          includeSvg,
          includePng1x: includePngs,
          includePng2x: includePngs,
          includePng4x: includePngs,
          includeSymbols,
          includeJson: true,
        },
        (pct, text) => setPackProgress(`${pct}%: ${text}`)
      );

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${packName || 'icon-pack'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPackProgress('Download ready!');
      setTimeout(() => setPackProgress(null), 3000);
    } catch (e) {
      console.warn('Icon pack build failed:', e);
      setPackProgress('Failed creating pack');
    } finally {
      setIsBuildingPack(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0d14] text-slate-100 min-h-0">
      {/* Hidden File Upload */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        className="hidden"
        onChange={e => {
          if (e.target.files && onUploadImages) {
            onUploadImages(Array.from(e.target.files));
          }
          e.target.value = '';
        }}
      />

      {/* Top Victor Studio Navbar */}
      <div className="h-13 px-4 sm:px-6 border-b border-white/10 bg-dark-950/80 backdrop-blur-md flex items-center justify-between shrink-0 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 p-0.5 shadow-md shadow-cyan-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-dark-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30 uppercase">
                {t('part_2_badge', 'PART 2')}
              </span>
              <h2 className="text-sm font-bold text-white tracking-wide">{t('part_2_name', 'Victor Part')}</h2>
            </div>
            <span className="text-[10px] text-slate-400 block hidden sm:inline">
              Image to Vector • Icon Sheet Maker (1/2/3) • Remove White Batch • Icon Pack Maker
            </span>
          </div>
        </div>

        {/* Center/Right: 4 Feature Sub-Tabs + Return to Image Part */}
        <div className="flex items-center gap-2">
          {onSwitchToImagePart && (
            <button
              onClick={onSwitchToImagePart}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-400/40 text-xs font-bold transition flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
              title="Return to Part 1: Image Studio"
            >
              <span>{t('switch_to_image_part', 'Go to Part 1: Image Part ➔')}</span>
            </button>
          )}

        {/* 4 Feature Sub-Tabs */}
        <div className="flex items-center bg-[#121620] p-1 rounded-xl border border-white/10 gap-1 overflow-x-auto scrollbar-none text-xs">
          {[
            { id: 'vectorize', label: t('victor_tab_tracer', 'Image to Vector (SVG)'), icon: Wand2, badge: 'SVG' },
            { id: 'iconSheet', label: t('victor_tab_sheets', 'Icon Sheet Maker (1/2/3)'), icon: Grid, badge: '1/2/3' },
            { id: 'removeWhite', label: t('victor_tab_bg_remove', 'Remove White Batch'), icon: Layers, badge: 'Batch' },
            { id: 'iconPack', label: t('victor_tab_pack', 'Icon Pack Maker (ZIP)'), icon: Package, badge: 'ZIP' },
          ].map(tab => {
            const isCur = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as VictorSubTab)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition shrink-0 ${
                  isCur
                    ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-dark-950 shadow-md shadow-cyan-500/20 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[9px] font-mono px-1 rounded ${
                    isCur ? 'bg-dark-950/20 text-dark-950 font-bold' : 'bg-dark-900 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
        </div>
      </div>

      {/* Main Content Area: Left Controls + Right Canvas/SVG Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-3 sm:p-5 gap-4 min-h-0">
        {/* Left Side: Controls Panel */}
        <div className="w-full lg:w-[360px] xl:w-[380px] shrink-0 flex flex-col rounded-2xl bg-[#121620]/95 border border-white/10 shadow-xl overflow-y-auto p-4 space-y-4 scrollbar-thin min-h-0">
          {/* Active Image / Multi-Icon Bar */}
          <div className="p-3 rounded-xl bg-dark-900/90 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Active Source Icon</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-2 py-0.8 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-medium border border-cyan-500/30 flex items-center gap-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Upload Icons</span>
              </button>
            </div>

            {images.length > 0 ? (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => onSelectImage(img.id)}
                    className={`relative rounded-lg p-1 shrink-0 border transition ${
                      selectedImage?.id === img.id
                        ? 'border-cyan-400 bg-cyan-500/10 ring-1 ring-cyan-400/40'
                        : 'border-white/10 hover:border-white/20 bg-dark-950'
                    }`}
                  >
                    <img
                      src={img.processedUrl || img.thumbnailUrl || img.originalUrl}
                      alt={img.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-slate-400 space-y-2">
                <p>কোনো আইকন আপলোড করা নেই। স্যাম্পল আইকন লোড করুন বা ফাইল আপলোড করুন।</p>
                {onLoadSampleImage && (
                  <button
                    onClick={onLoadSampleImage}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs text-white"
                  >
                    স্যাম্পল আইকন লোড করুন
                  </button>
                )}
              </div>
            )}
          </div>

          {/* TAB 1: IMAGE TO VICTOR (SVG TRACER) CONTROLS */}
          {activeTab === 'vectorize' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-dark-950/80 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Wand2 className="w-4 h-4 text-cyan-400" />
                    <span>SVG Tracing & Quantization</span>
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {vectorResult?.pathCount ?? 0} paths
                  </span>
                </div>

                {/* Color Count Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Color Layers (রঙের লেয়ার)</span>
                    <span className="font-mono text-cyan-400 font-bold">{vectorColors} Colors</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="16"
                    value={vectorColors}
                    onChange={e => setVectorColors(Number(e.target.value))}
                    disabled={vectorMonochrome}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5"
                  />
                </div>

                {/* Minimum Detail Filter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Detail / Noise Reduction</span>
                    <span className="font-mono text-cyan-400 font-bold">{vectorMinArea}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={vectorMinArea}
                    onChange={e => setVectorMinArea(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5"
                  />
                </div>

                {/* Monochrome Silhouette Toggle */}
                <label className="flex items-center justify-between p-2 rounded-lg bg-dark-900 border border-white/5 cursor-pointer">
                  <span className="text-xs text-slate-300">Monochrome / Black & White</span>
                  <input
                    type="checkbox"
                    checked={vectorMonochrome}
                    onChange={e => setVectorMonochrome(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-400 bg-dark-950 border-white/20"
                  />
                </label>

                {/* Palette Swatches */}
                {vectorResult && vectorResult.colorPalette.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-white/5">
                    <span className="text-[10px] text-slate-400">Extracted SVG Color Palette:</span>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                      {vectorResult.colorPalette.map((hex, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded border border-white/20 shrink-0"
                          style={{ backgroundColor: hex }}
                          title={hex}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Copy SVG & Download SVG */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleCopySvg}
                  disabled={!vectorResult || isVectorizing}
                  className="py-2 px-3 rounded-xl bg-dark-900 hover:bg-dark-800 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  {copiedSvg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSvg ? 'Copied SVG!' : 'Copy SVG Code'}</span>
                </button>

                <button
                  onClick={() => vectorResult && downloadSvgFile(vectorResult.svgString, selectedImage?.name || 'icon')}
                  disabled={!vectorResult || isVectorizing}
                  className="py-2 px-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-dark-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-cyan-500/20 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ICON SHEET MAKER (MODES 1, 2, 3) CONTROLS */}
          {activeTab === 'iconSheet' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-dark-950/80 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white block">Icon Sheet Style / Mode (১/২/৩)</span>

                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    {
                      id: '1',
                      title: 'Mode 1: Sprite Grid Sheet',
                      desc: 'Tiled grid with customizable matrix columns & labels',
                      icon: '▦',
                    },
                    {
                      id: '2',
                      title: 'Mode 2: App Icon Master Sheet',
                      desc: 'iOS, Android & Favicon multi-resolution master (16 to 1024px)',
                      icon: '📱',
                    },
                    {
                      id: '3',
                      title: 'Mode 3: Die-Cut Sticker Sheet',
                      desc: 'Die-cut white contour border & soft ambient drop shadow',
                      icon: '🏷️',
                    },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSheetMode(m.id as IconSheetMode)}
                      className={`p-2.5 rounded-xl text-left transition border flex items-center gap-2.5 ${
                        sheetMode === m.id
                          ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-400/40'
                          : 'bg-dark-900/60 hover:bg-dark-900 border-white/5 text-slate-300'
                      }`}
                    >
                      <span className="text-lg">{m.icon}</span>
                      <div>
                        <span className="text-xs font-bold block">{m.title}</span>
                        <span className="text-[10px] text-slate-400 block">{m.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Grid Columns (Mode 1 & 3) */}
                {sheetMode !== '2' && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Grid Columns</span>
                      <span className="font-mono text-cyan-400 font-bold">{sheetColumns} Cols</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={sheetColumns}
                      onChange={e => setSheetColumns(Number(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5"
                    />
                  </div>
                )}

                {/* Sheet Background */}
                <div className="space-y-1">
                  <span className="text-xs text-slate-300 block">Sheet Background</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['dark', 'light', 'transparent', 'gradient'] as const).map(bg => (
                      <button
                        key={bg}
                        onClick={() => setSheetBg(bg)}
                        className={`py-1 text-[10px] font-medium rounded-lg transition capitalize text-center ${
                          sheetBg === bg
                            ? 'bg-cyan-400 text-dark-950 font-bold'
                            : 'bg-dark-900 text-slate-400 border border-white/5 hover:text-white'
                        }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Download Sheet Button */}
              {sheetResult && (
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = sheetResult.dataUrl;
                    a.download = `icon-sheet-mode-${sheetMode}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                  }}
                  className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-dark-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-cyan-500/20 active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Icon Sheet ({sheetResult.width}x{sheetResult.height} PNG)</span>
                </button>
              )}
            </div>
          )}

          {/* TAB 3: REMOVE WHITE BATCH CONTROLS */}
          {activeTab === 'removeWhite' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-dark-950/80 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white block">Remove White Background (সাদা ব্যাকগ্রাউন্ড রিমুভার)</span>
                <p className="text-[10px] text-slate-400">
                  আইকন বা লোগো থেকে সাদা ব্যাকগ্রাউন্ড মুছে দিয়ে ট্রান্সপারেন্ট PNG বানান
                </p>

                {/* Tolerance / Threshold */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>White Tolerance (টলারেন্স)</span>
                    <span className="font-mono text-cyan-400 font-bold">{whiteThreshold}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="90"
                    value={whiteThreshold}
                    onChange={e => setWhiteThreshold(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5"
                  />
                </div>

                {/* Edge Feathering */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Edge Feathering (স্মুথ এজ)</span>
                    <span className="font-mono text-cyan-400 font-bold">{whiteFeather}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={whiteFeather}
                    onChange={e => setWhiteFeather(Number(e.target.value))}
                    className="w-full accent-cyan-400 cursor-pointer h-1.5"
                  />
                </div>

                {batchProgress && (
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs text-center font-mono">
                    {batchProgress}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={handleRemoveWhiteActive}
                  disabled={!selectedImage || isRemovingWhite}
                  className="py-2.5 px-3 rounded-xl bg-dark-900 hover:bg-dark-800 text-cyan-300 border border-cyan-500/30 font-semibold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Remove White (Active Icon Only)</span>
                </button>

                <button
                  onClick={handleBatchRemoveWhite}
                  disabled={images.length === 0 || isRemovingWhite}
                  className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-dark-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-md shadow-cyan-500/20 active:scale-95"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Remove White Batch ({images.length} Icons)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: ICON PACK MAKER CONTROLS */}
          {activeTab === 'iconPack' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-dark-950/80 border border-white/10 space-y-3">
                <span className="text-xs font-bold text-white block">Icon Pack Generator (.ZIP)</span>
                <p className="text-[10px] text-slate-400">
                  সব আইকনকে একসাথে SVG, 1x/2x/4x PNG, icons.json এবং symbols.svg আকারে প্যাক করুন
                </p>

                <div className="space-y-1">
                  <label className="text-xs text-slate-300 block">Pack Name</label>
                  <input
                    type="text"
                    value={packName}
                    onChange={e => setPackName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-dark-900 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="space-y-2 pt-1 border-t border-white/5 text-xs text-slate-300">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSvg}
                      onChange={e => setIncludeSvg(e.target.checked)}
                      className="rounded text-cyan-400 bg-dark-900 border-white/20"
                    />
                    <span>Include Scalable Vector SVGs (/svg/)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includePngs}
                      onChange={e => setIncludePngs(e.target.checked)}
                      className="rounded text-cyan-400 bg-dark-900 border-white/20"
                    />
                    <span>Include Multi-Res PNGs (1x, 2x, 4x)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={e => setIncludeSymbols(e.target.checked)}
                      className="rounded text-cyan-400 bg-dark-900 border-white/20"
                    />
                    <span>Include SVG Symbols Sprite Sheet (symbols.svg)</span>
                  </label>
                </div>

                {packProgress && (
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs text-center font-mono">
                    {packProgress}
                  </div>
                )}
              </div>

              <button
                onClick={handleDownloadIconPack}
                disabled={images.length === 0 || isBuildingPack}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 hover:from-cyan-300 hover:to-indigo-400 text-dark-950 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-lg shadow-cyan-500/25 active:scale-95"
              >
                <Package className="w-4 h-4" />
                <span>Build & Download Icon Pack (.ZIP)</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Interactive Preview Canvas / SVG Viewport */}
        <div className="flex-1 flex flex-col rounded-2xl bg-[#0e121b] border border-white/10 shadow-2xl overflow-hidden min-w-0 min-h-0 relative">
          {/* Viewport Header */}
          <div className="h-10 px-4 border-b border-white/10 bg-dark-950/60 flex items-center justify-between shrink-0 text-xs text-slate-400">
            <span className="font-medium text-slate-300">
              {activeTab === 'vectorize'
                ? 'Vector SVG Viewport'
                : activeTab === 'iconSheet'
                ? `Icon Sheet Preview (Mode ${sheetMode})`
                : activeTab === 'removeWhite'
                ? 'Transparency Checkerboard View'
                : 'Icon Pack Overview'}
            </span>

            {activeTab === 'vectorize' && vectorResult && (
              <span className="font-mono text-[11px] text-cyan-400">
                Scalable SVG • {vectorResult.width}x{vectorResult.height}px
              </span>
            )}
          </div>

          {/* Viewport Canvas / Stage */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-auto min-h-0 bg-[#07090e] checkerboard-pattern relative">
            {/* TAB 1: SVG Vector Display */}
            {activeTab === 'vectorize' && (
              <div className="flex flex-col items-center justify-center gap-4 max-w-full max-h-full">
                {isVectorizing ? (
                  <div className="flex flex-col items-center gap-2 text-cyan-400 text-xs font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Tracing scalable vector contours...</span>
                  </div>
                ) : vectorResult ? (
                  <div className="p-4 rounded-2xl bg-dark-950/90 border border-white/10 shadow-2xl max-w-full max-h-[70vh] flex items-center justify-center">
                    <img
                      src={vectorResult.dataUrl}
                      alt="Vector SVG"
                      className="max-h-[60vh] max-w-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Select an image to vectorize</span>
                )}
              </div>
            )}

            {/* TAB 2: Icon Sheet Display */}
            {activeTab === 'iconSheet' && (
              <div className="flex items-center justify-center max-w-full max-h-full">
                {isGeneratingSheet ? (
                  <div className="flex flex-col items-center gap-2 text-cyan-400 text-xs font-mono">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Rendering Icon Sheet Mode {sheetMode}...</span>
                  </div>
                ) : sheetResult ? (
                  <div className="p-2 rounded-xl bg-dark-950/90 border border-white/10 shadow-2xl max-w-full max-h-[75vh] overflow-auto">
                    <img
                      src={sheetResult.dataUrl}
                      alt="Icon Sheet"
                      className="max-h-[70vh] max-w-full object-contain rounded-lg"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">Generating sheet...</span>
                )}
              </div>
            )}

            {/* TAB 3: Remove White Preview Display */}
            {activeTab === 'removeWhite' && selectedImage && (
              <div className="flex flex-col items-center gap-3">
                <div className="p-4 rounded-2xl bg-dark-950/80 border border-white/10 shadow-2xl max-w-full max-h-[65vh] flex items-center justify-center">
                  <img
                    src={selectedImage.processedUrl || selectedImage.originalUrl}
                    alt="Active Icon"
                    className="max-h-[55vh] max-w-full object-contain rounded-lg"
                  />
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Transparent alpha background displayed with checkerboard grid
                </span>
              </div>
            )}

            {/* TAB 4: Icon Pack Overview Display */}
            {activeTab === 'iconPack' && (
              <div className="max-w-md p-6 rounded-2xl bg-dark-900/90 border border-white/10 shadow-2xl text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto text-cyan-400">
                  <Package className="w-7 h-7 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{packName || 'Icon Pack'}</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {images.length} icons ready to be compiled into scalable SVGs and retina PNGs
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left text-xs bg-dark-950/80 p-3 rounded-xl border border-white/5 font-mono text-slate-300">
                  <div>📁 /svg/ (SVGs)</div>
                  <div>📁 /png-1x/ (64px)</div>
                  <div>📁 /png-2x/ (128px)</div>
                  <div>📁 /png-4x/ (256px)</div>
                  <div>📄 symbols.svg</div>
                  <div>📋 icons.json</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
