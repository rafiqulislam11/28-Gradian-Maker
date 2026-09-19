# GRADIENT X STUDIO PRO

A commercial-grade, GPU-accelerated graphics design web studio, procedural pattern synthesizer, multi-layer editor, and batch design generation platform built with **React 18**, **TypeScript**, **Tailwind CSS**, **Three.js**, **OffscreenCanvas**, and **Web Workers**.

![Gradient X Studio PRO Banner](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)

---

## 🌟 Key Capabilities & Modules

### 1. 🎨 Photoshop-Style Layer System (`src/components/layers/`)
- **Non-Destructive Layers**: Edit and composite multiple layers without permanently altering underlying sources.
- **Layer Types Supported**:
  - `Image Layer`: Full bitmap styling, cropping, border radius, and non-destructive image adjustments.
  - `Gradient Layer`: Linear, Radial, Conical, 4-Corner Bilinear Mesh, and Multi-Point Auroras.
  - `Pattern Layer`: 500+ mathematical geometries with stroke/fill modes and 3D extrusion.
  - `Shape Layer`: Vector Rectangles, Circles/Ellipses, Triangles, Stars, and Hexagons with corner radii.
  - `Text Layer`: Typography engine with custom font weights, line heights, letter spacing, alignments, and drop shadows.
  - `Blur Layer`: Gaussian mesh, Radial focal, Tilt-shift DoF, and Glassmorphism sheen blurs.
  - `Glass Layer`: Refraction displacement shaders (Fluted Ribs, Diamond Prism, Voronoi Shards, Kaleidoscope).
  - `Noise Layer`: 35mm organic film grain, vintage retro flecks, and digital sensor noise.
  - `Glow Layer`: Outer glow, inner glow, neon bloom, and directional ambient lighting.
  - `Adjustment / Color Grade Layer`: Global tonal mapping and color temperature shift across underlying layers.
- **Layer Management**:
  - Reorder layers (up / down)
  - Show / Hide toggle (eye icon)
  - Lock / Unlock toggle
  - Solo layer preview
  - Duplicate & Delete layers
  - Double-click inline layer renaming
  - Opacity slider (0–100%)
  - 16 Composite Blend Modes (Normal, Multiply, Screen, Overlay, Soft Light, Hard Light, Color Dodge, Color Burn, Darken, Lighten, Difference, Exclusion, Hue, Saturation, Color, Luminosity)

---

### 2. 📐 Interactive Transform System & Canvas Gizmo (`src/components/editor/`)
- **Visual On-Canvas Transform Gizmo**:
  - 8-point resize handles (NW, N, NE, E, SE, S, SW, W)
  - Top rotation stem with snapping at 0°, 45°, 90°, 180°, 270°, 360°
  - Center drag repositioning
  - Center alignment guides with automatic magnetic snapping
  - Precise screen-to-canvas coordinate mapping accounting for zoom, pan, and DPI scaling
- **Precision Transform Panel**:
  - X, Y position inputs (px)
  - Width, Height inputs (px)
  - Rotation angle slider (0–360°)
  - Center Object button
  - Flip Horizontal & Flip Vertical buttons
  - Reset Transform button
- **Viewport Navigation**:
  - Smooth infinite pan (Spacebar + Drag or Hand Tool)
  - Smooth zoom (15% to 400% via wheel or toolbar)
  - Fit to Window & 100% 1:1 view shortcuts
  - Toggleable Grid overlay
  - Toggleable Safe Area margin boundaries
  - Before / After Split Slider with live comparison
  - Hold-to-preview Original button

---

### 3. ⚡ 1000 Design Generator (`src/components/generator/`)
- **Progressive Batch Variation Engine**:
  - Generates from 1 up to 1,000 distinct variations from a base design recipe.
  - **Zero Browser Freezing**: Uses chunked macro-task scheduling and OffscreenCanvas rendering.
  - **Variation Strength Slider**: From subtle refinements (5%) to dramatic redesigns (100%).
  - **Independent Parameter Control**: Choose selectively which parameters vary:
    - `[x] Colors & Harmonious Palettes`
    - `[x] Gradients & Flow Angles`
    - `[x] 500+ Pattern Selection`
    - `[x] Pattern Scale & Thickness`
    - `[x] Layer Rotations`
    - `[x] Optical Blurs`
    - `[x] 35mm Film Grain`
    - `[x] Glow & Neon Blooms`
    - `[x] Composite Blend Modes`
    - `[ ] Image Offsets`
- **Virtualized Gallery Grid**:
  - High-performance responsive card grid.
  - Favorite designs with heart icon and filter by favorites.
  - Fullscreen high-res preview modal.
  - 1-Click "Edit in Studio Pro" to transfer any generated design back to the canvas editor.
  - "Download All as ZIP" compressed archive export powered by JSZip.

---

### 4. 🌈 Professional Gradient Engine (`src/engine/`)
- **Gradient Modes**:
  - **Linear Gradient**: Directional degree angle flow (0–360°).
  - **Radial Gradient**: Focal center falloff with custom radius.
  - **Conic Gradient**: Rotational sweep gradient.
  - **4-Corner Bilinear Mesh Gradient**: Smooth, non-muddy GPU bilinear color interpolation.
  - **Multi-Point Aurora**: Freely placed radial color blooms.
- **Color Stop Editor**:
  - Unlimited color stops with individual positions (0–100%).
  - Integrated color picker and hex codes.
  - Add, delete, reverse, and randomize color stops.
  - Automatic K-Means palette extraction from uploaded photographs.

---

### 5. 🌀 500+ Curated Pattern Library & 3D Extrusion (`src/engine/`)
- **17 Curated Geometric Categories**:
  - Geometric & Polygons
  - Minimalist & Lines
  - Sacred Geometry & Mandalas
  - Cyberpunk & Sci-Fi Tech
  - Japanese & Asian Tradition
  - Moroccan & Islamic Mosaics
  - Waves, Contours & Flow
  - Halftone & Stipple Dots
  - Fractals & Chaos Mathematics
  - Fabric, Textile & Weaves
  - Architectural & Tiles
  - Celestial & Cosmic Stars
  - Optical Illusions & Moiré
  - Organic & Voronoi Cellular
  - Retro & 80s/90s Memphis
  - 3D Volumetric & Isometric
- **Pattern Customization**:
  - Scale, Rotation, Offset X/Y, Spacing, Stroke thickness.
  - Full canvas bleed edge-to-edge fill.
  - Stroke, Fill, or Both outline + solid modes.
  - Real-time 3D extrusion projection (Depth, Pitch, Yaw, Light angle shading).
- **Photographic Image → Pattern Synthesis**:
  - Synthesizes source photographs into Mosaic, Halftone, Dot Matrix, Stipple, Line Art, Pixel, Voronoi, Duotone, Stencil, and ASCII art.

---

### 6. 🎛️ Non-Destructive Image Grading (`src/engine/effects/`)
- Real-time pixel adjustments:
  - **Exposure** (-100 to 100)
  - **Contrast** (-100 to 100)
  - **Highlights & Shadows** (-100 to 100)
  - **White Balance**: Temperature (Warm/Cool) & Tint (Green/Magenta)
  - **Saturation & Vibrance**
  - **Clarity / Unsharp Mask Sharpness** (0 to 100)
  - **Vignette Falloff** (0 to 100)
  - **Shadow Matte Fade** (0 to 100)
  - **Corner Radius** for rounded cards and avatars

---

### 7. 🪟 Optical Blur & Fractal Glass Shaders (`src/engine/`)
- **Blur Optics**:
  - Gaussian Mesh Blur
  - Radial Focal Center Blur
  - Tilt-Shift Miniature Depth-of-Field
  - Glassmorphism Specular Sheen with Chromatic Rim Aberration
  - Linear Directional Motion Blur
  - Angular Lens Vortex
- **Procedural Glass Shaders**:
  - Fluted Ribs Architectural Glass
  - Diamond Prism Facets
  - Voronoi Shards Refraction
  - Prismatic Chromatic Dispersion (RGB split)
  - Frosted Matte Sandblasted Glass
  - Sacred Kaleidoscope Recursive Mirror Glass

---

### 8. 📦 Professional Export Center (`src/components/export/`)
- **Formats**:
  - **PNG Lossless** (with transparency support)
  - **JPEG Fast** (with quality compression slider)
  - **WebP Compact**
  - **SVG Vector Container**
  - **Print PDF Container**
  - **JSON Project Recipe** (`.gxproject.json`)
- **Super-Sampling Resolution Scales**:
  - **1x**: Native Canvas Resolution
  - **2x**: 2K Crisp HD (e.g. 2560×1440)
  - **4x**: 4K Ultra HD (e.g. 3840×2160)
  - **8x**: 8K AI Studio Master (up to 7680×4320)
- **Batch Export**:
  - Multi-threaded ZIP bundler with sequential naming.

---

### 9. 🌲 Three.js 3D Wood Studio & Vector Studio (`src/components/studio/`)
- **3D Lumber Model**: Interactive stacked timber generator with physics jitter, beam dimensions, and camera presets (Perspective, Top, Front, Hero angle).
- **Procedural Materials**: Weathered Pine, Aged Oak, Fresh Cedar, Charred Dark Timber.
- **Direct 1-Click Snapshot Transfer**: Sends high-resolution 3D textures straight into Studio Pro.
- **Vector Studio (Part 2)**:
  - Client-side Image to Vector (SVG) contour tracing.
  - Icon Sheet Maker (1x, 2x, 3x grid layouts).
  - Batch White Background Remover.
  - Icon Pack ZIP generator.

---

## ⌨️ Keyboard Shortcuts Reference

| Shortcut | Action |
| :--- | :--- |
| `Ctrl` / `Cmd` + `Z` | Undo last action |
| `Ctrl` / `Cmd` + `Shift` + `Z` or `Ctrl` + `Y` | Redo action |
| `Ctrl` / `Cmd` + `S` | Save Project (`.gxproject.json`) |
| `Ctrl` / `Cmd` + `E` | Open Export Center |
| `Ctrl` / `Cmd` + `D` | Duplicate Selected Layer |
| `Delete` / `Backspace` | Delete Selected Layer |
| `Space` + Drag | Pan Canvas |
| `V` | Select & Move Tool |
| `H` | Pan Hand Tool |
| `Arrow Keys` | Nudge selected layer by 1px (`Shift` for 10px) |
| `Ctrl` + Wheel | Zoom In / Zoom Out |

---

## 🚀 Getting Started

### Installation
```bash
# Clone the repository
git clone https://github.com/rafiqulislam11/28-Gradian-Maker.git
cd 28-Gradian-Maker

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🛡️ License
MIT License. Crafted with ❤️ for digital artists, UI/UX designers, and creative agencies.
