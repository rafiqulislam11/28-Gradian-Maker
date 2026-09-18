import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppTheme = 'dark' | 'light';
export type AppLanguage = 'en' | 'bn';

export interface ThemeLanguageContextType {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  toggleTheme: () => void;
  language: AppLanguage;
  setLanguage: (l: AppLanguage) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultVal?: string) => string;
}

export const DICTIONARY: Record<AppLanguage, Record<string, string>> = {
  en: {
    // Top Navigation
    'app_name': 'Gradian Maker',
    'app_tagline': 'AI Canvas Studio',
    'part_1_badge': 'PART 1',
    'part_1_name': 'Image Part',
    'part_1_desc': 'Gradient, Fractal Glass & Upscale',
    'part_2_badge': 'PART 2',
    'part_2_name': 'Victor Part',
    'part_2_desc': 'Vector SVG, Icon Sheets & White Remover',
    'switch_to_victor_part': 'Go to Part 2: Victor Part ➔',
    'switch_to_image_part': 'Go to Part 1: Image Part ➔',
    'nav_image_studio': 'Image Part',
    'nav_victor_studio': 'Victor Part',
    'nav_batch': 'Batch (500+)',
    'nav_3d_studio': '3D Studio',
    'nav_patterns': '500+ Patterns',
    'nav_pricing': 'Pricing',
    'nav_account': 'Account',
    'theme_dark': 'Dark Mode',
    'theme_light': 'Light Mode',
    'lang_en': 'English',
    'lang_bn': 'বাংলা',

    // Tools Header
    'tools_header': 'Tool Panels',
    'status_in_studio': 'in Studio',
    'status_active': 'GPU Canvas Active',
    'mode_pro': 'Pro',
    'mode_easy': 'Easy',
    'reset_tooltip': 'Reset all settings to default',
    'randomize_tooltip': 'Surprise randomize creative styles',

    // Tabs
    'tab_gradient': 'Gradient',
    'tab_fractal_glass': 'Fractal Glass',
    'tab_upscale': 'Upscale',
    'tab_film_grain': 'Film Grain',
    'tab_blur': 'Blur Optics',
    'tab_patterns': 'Patterns & 3D',
    'tab_presets': 'Presets',

    // Source Image Capsule
    'active_photo': 'Active Photo',
    'source_photo': 'Source Photo',
    'clear_all': 'Clear All',
    'upload_title': 'Upload Photo',
    'upload_desc': 'PNG, JPG, WebP supported • Direct Live Blend',
    'select_images': 'Select Images',
    'sample_photo': 'Sample Photo',
    'status_rendered': 'Rendered',
    'status_ready': 'Ready',

    // Victor Banner
    'victor_banner_title': 'Victor Studio: Vector & Icons',
    'victor_banner_desc': 'Image to Vector, Icon Sheets 1/2/3, White Remover, ZIP',

    // Gradient Suite
    'grad_sub_auto': 'Auto Img-Grad',
    'grad_sub_maker': 'Maker (1-4)',
    'grad_sub_pro': 'Pro Layers',

    // Pattern Full Fill
    'full_fill_title': 'Full Fill (Full Image Coverage)',
    'full_fill_on': 'FULL FILL: ON',
    'full_fill_off': 'OFF',
    'fill_mode_solid': 'Solid Fill',
    'fill_mode_both': 'Fill + Line',
    'fill_mode_stroke': 'Outline',
    'fill_density': 'Fill Density / Opacity',

    // Action Footer
    'apply_live': 'Apply on Image (Live 60 FPS)',
    'process_all': 'Process All Photos',
    'download_zip': 'Download Processed (ZIP)',
    'open_batch_queue': 'Open Full Batch Queue',

    // Victor Studio View
    'victor_tab_tracer': 'Image to Vector (SVG)',
    'victor_tab_sheets': 'Icon Sheet Maker (1/2/3)',
    'victor_tab_bg_remove': 'Remove White Batch',
    'victor_tab_pack': 'Icon Pack Maker (ZIP)',
    'btn_convert_svg': 'Vectorize Image (Convert to SVG)',
    'btn_download_svg': 'Download .SVG',
    'btn_copy_svg': 'Copy SVG Code',
    'btn_generate_sheet': 'Generate Sheet PNG',
    'btn_remove_white_batch': 'Clean All Backgrounds (Batch)',
    'btn_export_icon_pack': 'Export Icon Pack ZIP',
  },
  bn: {
    // Top Navigation
    'app_name': 'গ্রেডিয়ান মেকার',
    'app_tagline': 'এআই ক্যানভাস স্টুডিও',
    'part_1_badge': 'পার্ট ১',
    'part_1_name': 'ইমেজ পার্ট',
    'part_1_desc': 'গ্রেডিয়েন্ট, ফ্র্যাক্টাল গ্লাস ও আপস্কেল',
    'part_2_badge': 'পার্ট ২',
    'part_2_name': 'ভেক্টর পার্ট',
    'part_2_desc': 'ভেক্টর SVG, আইকন শিট ও ব্যাকগ্রাউন্ড রিমুভার',
    'switch_to_victor_part': 'পার্ট ২: ভেক্টর পার্টে যান ➔',
    'switch_to_image_part': 'পার্ট ১: ইমেজ পার্টে যান ➔',
    'nav_image_studio': 'ইমেজ পার্ট',
    'nav_victor_studio': 'ভেক্টর পার্ট',
    'nav_batch': 'ব্যাচ কিউ (৫০০+)',
    'nav_3d_studio': '৩ডি স্টুডিও',
    'nav_patterns': '৫০০+ প্যাটার্ন',
    'nav_pricing': 'মূল্যতালিকা',
    'nav_account': 'অ্যাকাউন্ট',
    'theme_dark': 'ডার্ক মোড',
    'theme_light': 'লাইট মোড',
    'lang_en': 'English',
    'lang_bn': 'বাংলা',

    // Tools Header
    'tools_header': 'টুল প্যানেল',
    'status_in_studio': 'ওয়ার্কস্পেসে আছে',
    'status_active': 'জিপিইউ ক্যানভাস সক্রিয়',
    'mode_pro': 'প্রো মোড',
    'mode_easy': 'সহজ মোড',
    'reset_tooltip': 'সব ফিল্টার রিসেট করুন',
    'randomize_tooltip': 'র‍্যান্ডম ক্রিয়েটিভ স্টাইল তৈরি করুন',

    // Tabs
    'tab_gradient': 'গ্রেডিয়েন্ট',
    'tab_fractal_glass': 'ফ্র্যাক্টাল গ্লাস',
    'tab_upscale': 'আপস্কেল',
    'tab_film_grain': 'ফিল্ম গ্রেইন',
    'tab_blur': 'ব্লার অপটিক্স',
    'tab_patterns': 'প্যাটার্ন ও ৩ডি',
    'tab_presets': 'প্রিসেটস',

    // Source Image Capsule
    'active_photo': 'সক্রিয় ছবি',
    'source_photo': 'সোর্স ফটো',
    'clear_all': 'সব মুছুন',
    'upload_title': 'ইমেজ আপলোড করুন',
    'upload_desc': 'PNG, JPG, WebP সমর্থিত • সরাসরি লাইভ ব্লেন্ড',
    'select_images': 'ছবি নির্বাচন করুন',
    'sample_photo': 'স্যাম্পল ছবি',
    'status_rendered': 'রেন্ডার করা',
    'status_ready': 'প্রস্তুত',

    // Victor Banner
    'victor_banner_title': 'ভেক্টর স্টুডিও: ভেক্টর ও আইকন',
    'victor_banner_desc': 'ইমেজ থেকে ভেক্টর, আইকন শিট ১/২/৩, ব্যাকগ্রাউন্ড রিমুভার, জিপ',

    // Gradient Suite
    'grad_sub_auto': 'অটো ইমেজ-গ্রেড',
    'grad_sub_maker': 'মেকার (১-৪)',
    'grad_sub_pro': 'প্রো লেয়ারস',

    // Pattern Full Fill
    'full_fill_title': 'ফুল ফিল (সম্পূর্ণ ইমেজ ফিল)',
    'full_fill_on': 'ফুল ফিল: চালু',
    'full_fill_off': 'বন্ধ',
    'fill_mode_solid': 'সলিড ফিল',
    'fill_mode_both': 'ফিল ও লাইন',
    'fill_mode_stroke': 'আউটলাইন',
    'fill_density': 'ফিলের ঘনত্ব / অপাসিটি',

    // Action Footer
    'apply_live': 'ইমেজে অ্যাপ্লাই করুন (৬০ এফপিএস)',
    'process_all': 'সব ছবি প্রসেস করুন',
    'download_zip': 'প্রসেস করা ছবি ডাউনলোড (জিপ)',
    'open_batch_queue': 'সম্পূর্ণ ব্যাচ কিউ খুলুন',

    // Victor Studio View
    'victor_tab_tracer': 'ইমেজ টু ভেক্টর (SVG)',
    'victor_tab_sheets': 'আইকন শিট মেকার (১/২/৩)',
    'victor_tab_bg_remove': 'হোয়াইট ব্যাকগ্রাউন্ড রিমুভার',
    'victor_tab_pack': 'আইকন প্যাক মেকার (ZIP)',
    'btn_convert_svg': 'ভেক্টরে রূপান্তর করুন (SVG)',
    'btn_download_svg': 'SVG ডাউনলোড করুন',
    'btn_copy_svg': 'SVG কোড কপি করুন',
    'btn_generate_sheet': 'আইকন শিট PNG তৈরি করুন',
    'btn_remove_white_batch': 'সব ছবির ব্যাকগ্রাউন্ড মুছুন (ব্যাচ)',
    'btn_export_icon_pack': 'আইকন প্যাক ZIP এক্সপোর্ট করুন',
  },
};

const ThemeLanguageContext = createContext<ThemeLanguageContextType | undefined>(undefined);

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gx_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gx_lang');
      if (saved === 'bn' || saved === 'en') return saved;
    }
    return 'bn'; // Default to Bengali as requested by user
  });

  // Synchronize document classes & attributes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('gx_theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('gx_lang', language);
  }, [language]);

  const setTheme = (t: AppTheme) => setThemeState(t);
  const toggleTheme = () => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));

  const setLanguage = (l: AppLanguage) => setLanguageState(l);
  const toggleLanguage = () => setLanguageState(prev => (prev === 'en' ? 'bn' : 'en'));

  const t = (key: string, defaultVal?: string): string => {
    const langDict = DICTIONARY[language];
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    if (DICTIONARY.en[key]) {
      return DICTIONARY.en[key];
    }
    return defaultVal || key;
  };

  return (
    <ThemeLanguageContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        t,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export function useThemeAndLanguage() {
  const ctx = useContext(ThemeLanguageContext);
  if (!ctx) {
    throw new Error('useThemeAndLanguage must be used within ThemeLanguageProvider');
  }
  return ctx;
}
