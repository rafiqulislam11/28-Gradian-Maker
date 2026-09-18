# Gradient X Studio — Pro Bulk Image Styling & Gradient Studio

A state-of-the-art bulk image processing, procedural pattern synthesis, 3D texture modeling, and creative gradient studio built with React, TypeScript, Tailwind CSS, Three.js, and multi-threaded Web Workers.

🔗 **Live Demo**: [https://rafiqulislam11.github.io/28-Gradian-Maker/](https://rafiqulislam11.github.io/28-Gradian-Maker/)

![Gradient X Studio](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80)

---

## ✨ Features

### 1. 🎨 Pro Gradient Studio
- **Multi-mode Gradients**: Mesh (4-corner color blending), Linear, Radial, and Conical gradients.
- **Palette Extraction**: Automated k-means color palette extraction from uploaded photographs to dynamically match gradient stops.
- **Color Stop Editor**: Interactive gradient slider with custom color picker, hex codes, and opacity stops.

### 2. 🌲 3D Wood & Texture Studio (Three.js)
- **Interactive 3D Lumber Model**: Realistic stacked timber generator with physics, randomized jumble jitter, beam dimensions, and camera presets (Perspective, Top, Front, Hero angle).
- **Procedural Wood Materials**: Weathered Pine, Aged Rustic Oak, Sawmill Fresh Cedar, Charred Dark Timber, Pallet Wood.
- **Direct Snapshot Transfer**: 1-click snapshot rendering that sends high-resolution 3D wood textures straight into Canvas Studio for grading and styling.
- **3D Export**: Export models to `.OBJ`, `.GLTF`, and 4K PNG snapshots.

### 3. 🌀 Blur Studio with Advanced Optics
- **6 Optical Blur Categories**:
  - **Gaussian Mesh**: Smooth diffused field blur.
  - **Glassmorphism**: Frosted sheen, specular highlights, and chromatic rim aberration.
  - **Tilt-Shift DoF**: Miniature focal depth-of-field band with position and width controls.
  - **Radial Blur**: Focal center falloff.
  - **Linear Gradient**: Directional gradient blur.
  - **Angular Lens**: Rotational lens vortex.

### 4. 📻 Noise & Grain Synthesis
- **Texture Types**: 35mm Organic Film Grain, Vintage Retro Dust Flecks, and Uniform Digital Sensor Noise.
- **Monochrome Grain Switch**: Toggle between chromatic RGB noise and pure black & white analogue film grain.
- **Layer Blend Modes**: Overlay, Soft Light, Screen, and Hard Light.

### 5. ⚡ 500+ Mathematical Pattern Library & 3D Extrusion
- **500+ Curated Patterns**: Sacred geometries, Islamic arabesques, Japanese waves, tech circuit grids, voronoi cells, minimal blueprints, and generative fractals.
- **3D Pattern Extrusion**: Real-time 3D projection with Depth, Pitch, Yaw, and directional light angle shading.
- **Full Image Patternize Engine**: Synthesizes the source photograph directly into mosaic, halftone, ascii, dot matrix, stippling, and lineart.

### 6. 🚀 AI Super-Resolution & Upscale Engine
- **Multi-resolution Target**: 1x Native, 2K Crisp (2560×1440), 4K Ultra HD (3840×2160), and 8K Studio AI Master (7680×4320).
- **AI Unsharp Mask Clarity**: Convolution sharpening kernel for ultra-crisp edges and micro-details.
- **Format Selection**: PNG Lossless (`.png`), JPEG Fast (`.jpg`), and WebP Compact (`.webp`).

### 7. 📦 Multi-Core Batch Processing & ZIP Bundler
- **500+ Concurrent Batch Queue**: Process hundreds of images simultaneously using multi-threaded OffscreenCanvas Web Workers.
- **Batch Export**: Real-time JSZip compression engine packaging all processed images into a clean ZIP archive with live progress indicators.

### 8. 💻 Universal Code Exporter
- Export active styles and gradients instantly to:
  - **CSS3 / Backdrop Filter**
  - **Tailwind CSS Utility Classes**
  - **SVG Vector `<linearGradient>` with Filters**
  - **HTML5 Canvas 2D JavaScript**

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React
- **3D Graphics**: Three.js, OrbitControls, OBJ/GLTF Exporters
- **Processing**: OffscreenCanvas, Multi-Threaded Web Workers, JSZip
- **Bundler**: Vite 5

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `yarn`

### Installation
```bash
# Clone the repository
git clone https://github.com/rafiqulislam11/28-Gradian-Maker.git

# Navigate to project directory
cd 28-Gradian-Maker

# Install dependencies
npm install

# Start local development server
npm run dev
```

The app will be running at `http://localhost:3000/`.

---

## 📜 License

MIT License. Crafted with ❤️ for creators and digital designers.
