export type PatternCategory =
  | 'all'
  | 'geometric'
  | 'minimal'
  | 'sacred'
  | 'tech'
  | 'japanese'
  | 'moroccan'
  | 'waves'
  | 'halftone'
  | 'fractals'
  | 'fabric'
  | 'architecture'
  | 'celestial'
  | 'optical'
  | 'organic'
  | 'retro'
  | '3d';

export type PatternFamily =
  | 'grid'
  | 'dots'
  | 'hexagons'
  | 'triangles'
  | 'diamonds'
  | 'chevrons'
  | 'circles'
  | 'waves'
  | 'lines'
  | 'fractal'
  | 'sacred'
  | 'tech'
  | 'stars'
  | 'tiles'
  | 'weave'
  | 'optical'
  | 'organic'
  | '3d';

export interface PatternItem {
  id: string;
  name: string;
  category: PatternCategory;
  family: PatternFamily;
  params: {
    stepMultiplier?: number;
    density?: number;
    angle?: number;
    variant?: number;
    subType?: string;
    lineRatio?: number;
    curvature?: number;
    harmonics?: number;
  };
}

export interface PatternCategoryInfo {
  id: PatternCategory;
  name: string;
  icon: string;
  count: number;
}

export const PATTERN_CATEGORIES: PatternCategoryInfo[] = [
  { id: 'all', name: 'All 500 Patterns', icon: 'Sparkles', count: 500 },
  { id: 'geometric', name: 'Geometric & Polygons', icon: 'Hexagon', count: 35 },
  { id: 'minimal', name: 'Minimalist & Lines', icon: 'Grid', count: 35 },
  { id: 'sacred', name: 'Sacred Geometry', icon: 'Compass', count: 35 },
  { id: 'tech', name: 'Cyberpunk & Sci-Fi Tech', icon: 'Cpu', count: 35 },
  { id: 'japanese', name: 'Japanese & Asian Tradition', icon: 'Waves', count: 35 },
  { id: 'moroccan', name: 'Moroccan & Islamic Mosaic', icon: 'Star', count: 35 },
  { id: 'waves', name: 'Waves, Contours & Flow', icon: 'Activity', count: 35 },
  { id: 'halftone', name: 'Halftone & Stipple Dots', icon: 'CircleDot', count: 35 },
  { id: 'fractals', name: 'Fractals & Chaos Math', icon: 'Zap', count: 35 },
  { id: 'fabric', name: 'Fabric, Textile & Weaves', icon: 'Layers', count: 35 },
  { id: 'architecture', name: 'Architectural & Tiles', icon: 'Boxes', count: 35 },
  { id: 'celestial', name: 'Celestial & Cosmic Stars', icon: 'Sun', count: 35 },
  { id: 'optical', name: 'Optical Illusions & Moiré', icon: 'Eye', count: 30 },
  { id: 'organic', name: 'Organic & Voronoi Cellular', icon: 'Dna', count: 35 },
  { id: 'retro', name: 'Retro & 80s/90s Memphis', icon: 'Disc', count: 35 },
  { id: '3d', name: '3D Volumetric & Isometric', icon: 'Box', count: 35 },
];

/**
 * Procedural generation of all 500 distinct patterns
 */
function buildPatternLibrary(): PatternItem[] {
  const library: PatternItem[] = [];

  // Helper to add items
  const addCategoryPatterns = (
    cat: PatternCategory,
    family: PatternFamily,
    names: string[],
    paramGenerator: (idx: number) => PatternItem['params']
  ) => {
    names.forEach((name, i) => {
      const padded = String(library.length + 1).padStart(3, '0');
      const id = `pat_${cat}_${padded}`;
      library.push({
        id,
        name: `${name} (#${padded})`,
        category: cat,
        family,
        params: paramGenerator(i),
      });
    });
  };

  // 1. Geometric & Polygons (35 patterns)
  const geometricNames = [
    'Hexagonal Honeycomb Lattice', 'Isometric Rhombus Cube', 'Triangular Deltoid Grid',
    'Diamond Prism Array', 'Octagonal Star Tile', 'Concentric Polygon Matrix',
    'Tessellated Rhomboid Mesh', 'Nested Equilateral Triangles', 'Kagome Star Weave',
    'Hexagram Star Mosaic', 'Isometric Wireframe Cube', 'Polyhedral Facet Grid',
    'Truncated Octahedron Net', 'Penrose Quasicrystal Lattice', 'Golden Rhombus Matrix',
    'Parquet Chevron Geometry', 'Trapezoidal Stepped Facets', 'Triaxial Coordinate Lattice',
    'Concentric Hexagon Echo', 'Dual Hexagonal Net', 'Trilateral Intersecting Rays',
    'Rhombic Dodecahedron Mesh', 'Equilateral Fractal Grid', 'Hexagonal Prism Projection',
    'Skew Polygon Maze', 'Cuboctahedral Frame', 'Diamond Accordion Folds',
    'Triangular Prism Array', 'Nested Diamond Tessellation', 'Hypercube 4D Projection',
    'Isometric Staircase Illusion', 'Staggered Hex Polyhedra', 'Triquetra Polygon Knot',
    'Rhombus Herringbone Lattice', 'Symmetrical Prism Shards'
  ];
  addCategoryPatterns('geometric', 'hexagons', geometricNames, i => ({
    stepMultiplier: 0.8 + (i % 6) * 0.15,
    density: 20 + (i % 8) * 8,
    angle: (i * 15) % 360,
    variant: i,
    subType: 'geometric',
  }));

  // 2. Minimalist & Lines (35 patterns)
  const minimalNames = [
    'Ultra-fine Pinstripe Vertical', 'Horizontal Scanline Matrix', 'Diagonal 45° Parallel Haze',
    'Dense Micro Crosshatch', 'Variable Spacing Gradient Lines', 'Staggered Morse Code Dashes',
    'Dual Axis Blueprint Grid', 'Orthogonal Minimal Wire', 'Subdivided Cartesian Graph',
    'Alternating Heavy/Light Stripe', 'Double Parallel Slices', 'Angled Diagonal Razor Lines',
    'Perpendicular Intersect Lattice', 'Triple Stranded Pinstripe', 'Staccato Broken Dashes',
    'High-Density Velocity Lines', 'Isometric Ruled Coordinates', 'Fine Architectural Hatching',
    'Offset Linear Chevron', 'Bilinear Matrix Ruler', 'Micro-dot Pinstripe',
    'Vertical Blind Slits', '45-Degree Diamond Hatch', 'Radial Divergence Lines',
    'Linear Perspective Horizon', 'Crosshair Coordinate Array', 'Stepped Interval Lines',
    'Zen Minimalist Stripes', 'Frequency Modulated Lines', 'Slanted Parallelogram Lines',
    'Thin Monospace Grids', 'Parallel Harmonic Strands', 'Minimal Box Quadrants',
    'Staggered Tickmarks', 'Vector Field Compass Lines'
  ];
  addCategoryPatterns('minimal', 'lines', minimalNames, i => ({
    stepMultiplier: 0.6 + (i % 5) * 0.2,
    density: 15 + (i % 10) * 6,
    angle: (i * 30) % 180,
    variant: i,
    lineRatio: 0.5 + (i % 4) * 0.25,
  }));

  // 3. Sacred Geometry (35 patterns)
  const sacredNames = [
    'Flower of Life Classic', 'Metatron Cube Harmonic Net', 'Seed of Life 7-Circle Rosette',
    'Sri Yantra Interlocking Triangles', 'Torus Vortex Energetic Field', 'Vesica Piscis Sacred Portal',
    'Golden Ratio Fibonacci Spiral', 'Merkaba Star Tetrahedron', 'Tree of Life Sephirot Net',
    'Fruit of Life 13-Sphere System', 'Concentric Mandala Chakra', 'Octagram Celestial Star',
    'Platonic Solid Nested Sphere', 'Hexagram Mystic Seal', 'Icosahedron Geometric Matrix',
    'Dodecahedron Cosmic Sphere', 'Sacred Spiral Golden Section', 'Chakra Lotus 16-Petal Star',
    'Infinite Toroidal Knot', 'Pythagorean Tetractys Array', 'Double Torus Infinity Ring',
    'Vesica Mandorla Halo', 'Sun Mandala Sunburst', 'Labyrinth of Chartres Geometry',
    'Sacred Geometry Rosette Window', 'Metatron Hyper-dimensional Net', 'Kabbalah Matrix Ray',
    'Golden Triangle Star Pentagram', 'Concentric Fibonacci Orbit', 'Flower of Life Dense Weave',
    'Mystic Solfeggio Harmonic Grid', 'Enneagram Sacred Circle', 'Hexagonal Mandala Chakra',
    'Sacred Cube Inscription', 'Celestial Cosmic Alignment'
  ];
  addCategoryPatterns('sacred', 'sacred', sacredNames, i => ({
    stepMultiplier: 1.0 + (i % 4) * 0.2,
    density: 25 + (i % 7) * 7,
    angle: (i * 12) % 360,
    variant: i,
    harmonics: 3 + (i % 6),
  }));

  // 4. Cyberpunk & Sci-Fi Tech (35 patterns)
  const techNames = [
    'Cyberpunk Motherboard Circuit Traces', 'Hex-Tech Kinetic Energy Grid', 'HUD Targeting Tactical Reticle',
    'Quantum Data Bus Lines', 'Cybernetic Orthogonal Bus', 'Nano-Scale Microprocessor Grid',
    'Holographic Matrix Data Stream', 'Futuristic UI Hex Shield', 'Fiber-Optic Network Array',
    'Spacecraft Hull Panel Seams', 'Augmented Reality HUD Crosshairs', 'Deep-Space Telemetry Grid',
    'Graphene Molecular Hex Lattice', 'Cyber Core Energy Conduits', 'Sci-Fi Corridor Trench Run',
    'Terminal Green Phosphor Grid', 'Quantum Silicon Wafer Mask', 'Orbital Defense Radar Sweep',
    'Sub-Atomic Particle Tracks', 'Neural Network Synapse Traces', 'Robotic Servomotor Gear Teeth',
    'Exoskeleton Armor Honeycomb', 'Digital Glitch Data Packets', 'Holo-deck Coordinate Cubes',
    'Ion Thruster Vector Nozzle', 'Avionics Flight Display Lines', 'Cyberpunk Neon Alley Mesh',
    'Nanite Swarm Hex Cluster', 'Superconducting Bus Bar', 'Crypto Hash Block Matrix',
    'Optoelectronic Sensor Array', 'Plasma Conduit Power Grid', 'Mecha Joint Hydraulic Lines',
    'Starship Warp Core Stator', 'Cyber Matrix Terminal Flow'
  ];
  addCategoryPatterns('tech', 'tech', techNames, i => ({
    stepMultiplier: 0.9 + (i % 5) * 0.15,
    density: 20 + (i % 8) * 6,
    angle: (i * 45) % 360,
    variant: i,
    subType: 'circuit',
  }));

  // 5. Japanese & Asian Tradition (35 patterns)
  const japaneseNames = [
    'Seigaiha Blue Ocean Waves', 'Asanoha Geometric Hemp Leaf', 'Shippo Seven Treasures Circles',
    'Sayagata Swastika Interlock', 'Yagasuri Archer Arrow Feathers', 'Kikkou Turtle Shell Hexagons',
    'Uroko Fish Scale Triangles', 'Ichimatsu Checkered Chessboard', 'Koushi Lattice Bamboo Screen',
    'Tatewaku Rising Steam Waves', 'Hishi Diamond Loom Weave', 'Kanoko Spotted Fawn Dappling',
    'Matsu Pine Needle Radial Spray', 'Sakura Cherry Blossom Petals', 'Ume Plum Blossom Crest',
    'Kumiko Woodcraft Grid Pattern', 'Chidori Flying Plover Waves', 'Rinzu Damask Interlocking Swirls',
    'Same Komon Shark Skin Dots', 'Mimasu Three Square Measuring Boxes', 'Karakusa Winding Vine Tendrils',
    'Higaki Interwoven Cypress Fence', 'Suzushi Mountain Mist Horizon', 'Nami Big Wave Breakers',
    'Kamon Samurai Family Crest', 'Sudare Bamboo Blind Slats', 'Fudo-Myo Fire Flame Waves',
    'Sensu Folding Fan Ribs', 'Kuroshio Deep Current Eddies', 'Enso Zen Circle Harmony',
    'Shoji Paper Screen Geometry', 'Bonsai Branching Tendrils', 'Origami Crane Fold Creases',
    'Taiko Drum Triple Tomoe Swirl', 'Kyoto Palace Bamboo Lattice'
  ];
  addCategoryPatterns('japanese', 'circles', japaneseNames, i => ({
    stepMultiplier: 0.8 + (i % 4) * 0.25,
    density: 25 + (i % 6) * 8,
    angle: (i * 20) % 180,
    variant: i,
    curvature: 0.5 + (i % 5) * 0.2,
  }));

  // 6. Moroccan & Islamic Mosaic (35 patterns)
  const moroccanNames = [
    'Zellij 8-Pointed Star Tile', 'Marrakesh Arabesque Floral Lattice', 'Girih Strapwork Interlock',
    'Alhambra Palace Geometric Mosaic', 'Fes Ceramic Star Polygons', 'Casablanca Moorish Archway',
    'Damascus Royal Medallion', 'Isfahan Mosque Dome Tessellation', 'Ottoman Iznik Lotus Star',
    'Cordoba Great Mosque Arch Ribs', 'Persian Muqarnas Honeycomb Vault', 'Andalusian Star Octagram',
    'Cairo Sultan Hassan Lattice', 'Mashrabiya Wooden Screen Grille', 'Maghreb Geometric Diamond Mosaic',
    'Kairouan Islamic Star Rosette', 'Moorish Interlaced Hexagram', 'Arabian Nights Star Burst',
    'Sahara Desert Star Lattice', 'Tangier Medallion Tile Net', 'Atlas Mountain Berber Knot',
    'Rabat Royal Gatework Ironwork', 'Sufi Mystic Geometry Grid', 'Oasis Palm Frond Lattice',
    'Gilded Minaret Star Tile', 'Tunisian Glazed Ceramic Mesh', 'Aleppo Ancient Bazaar Tiles',
    'Baghdad House of Wisdom Grid', 'Mamluk Geometric Star Octagon', 'Samarkand Silk Road Tiles',
    'Sultanahmet Blue Mosque Star', 'Moroccan Quatrefoil Filigree', 'Moorish Horseshoe Arch Weave',
    'Zellij Multi-Star Radiance', 'Almoravid Interlocking Strapwork'
  ];
  addCategoryPatterns('moroccan', 'tiles', moroccanNames, i => ({
    stepMultiplier: 0.9 + (i % 4) * 0.2,
    density: 25 + (i % 8) * 5,
    angle: (i * 15) % 180,
    variant: i,
    harmonics: 4 + (i % 4),
  }));

  // 7. Waves, Contours & Flow (35 patterns)
  const waveNames = [
    'Topographic Map Elevation Contours', 'Harmonic Sine Wave Oscillations', 'Acoustic Soundwave Pulse',
    'Ocean Swell Deep Breakers', 'Fluidic Laminar Flow Streamlines', 'Doppler Radar Wavefronts',
    'Concentric Water Drop Ripples', 'Gravitational Wave Interference', 'Atmospheric Jet Stream Curves',
    'Electromagnetic Field Lines', 'Bioluminescent Tidal Swirls', 'Seismic S-Wave Ground Vibrations',
    'Supersonic Mach Shock Cone', 'Vorticity Turbulence Eddies', 'Interferometric Fringes',
    'Radio Frequency Carrier Waves', 'Microscopic Soundwave Resonance', 'Coastal Sand Dune Ridges',
    'Glacial Crevasse Flow Paths', 'Solar Wind Aurora Ripples', 'Chladni Plate Cymatic Resonance',
    'Magnetic Flux Divergence Lines', 'Sub-surface Seismic Contours', 'River Delta Braided Currents',
    'Lissajous Wave Harmonograph', 'Harmonic Frequency Resonance', 'Kelvin-Helmholtz Billow Waves',
    'Standing Acoustic Wave Nodes', 'Diffraction Grating Wavefront', 'Perlin Terrain Contour Slice',
    'Thermal Gradient Convection Flow', 'Vortex Filament Core Swirl', 'Acoustic Doppler Compression',
    'Ocean Trench Bathymetry Lines', 'Equipotential Electric Curves'
  ];
  addCategoryPatterns('waves', 'waves', waveNames, i => ({
    stepMultiplier: 0.7 + (i % 5) * 0.2,
    density: 20 + (i % 7) * 7,
    angle: (i * 18) % 360,
    variant: i,
    harmonics: 1 + (i % 5),
  }));

  // 8. Halftone & Stipple Dots (35 patterns)
  const halftoneNames = [
    'Classic CMYK Offset Halftone', 'Eulerian Hexagonal Dot Matrix', 'Stipple Noise Shading Screen',
    'Radial Dot Vortex Array', 'Gradated Dot Matrix Screen', 'Micro Polka Dot Minimalist',
    'Staggered Diagonal Dot Lattice', 'Vintage Comic Book Ben-Day Dots', 'Diamond Dot Screen Density',
    'Newspaper Rotary Print Raster', 'Fine Pointillist Stipple Cloud', 'Perforated Speaker Grille Mesh',
    'Hexagonal Close-Packed Dots', 'Audio Meter Equalizer Dot Array', 'LED Jumbotron Screen Pixels',
    'Variable Diameter Pulse Dots', 'Circular Radar Target Blips', 'Stippled Shadow Gradient',
    'Braille Textured Micro Dots', 'Binary Core Punched Tape Dots', 'CRT Shadow Mask Triad Dots',
    'Thermal Paper Pinhead Grid', 'Halftone Diamond Rosette Screen', 'Radial Wave Dot Cluster',
    'Halftone Archimedean Spiral', 'Crossed Grid Halftone Raster', 'Inkjet Droplet Scatter Array',
    'Quantum Electron Cloud Dots', 'Fine Sand Dune Stippling', 'Astro-photometry Star Dots',
    'Micro-pore Aeration Mesh', 'Laser Engraved Raster Dots', 'Industrial Sheet Metal Punch',
    'Sub-pixel OLED Hex Array', 'High-speed Particle Stipple'
  ];
  addCategoryPatterns('halftone', 'dots', halftoneNames, i => ({
    stepMultiplier: 0.6 + (i % 6) * 0.18,
    density: 18 + (i % 8) * 8,
    angle: (i * 22.5) % 180,
    variant: i,
    lineRatio: 0.2 + (i % 5) * 0.15,
  }));

  // 9. Fractals & Chaos Math (35 patterns)
  const fractalNames = [
    'Mandelbrot Boundary Filament Core', 'Quantum Julia Set Orbit Traps', 'Sierpinski Gasket Triangle',
    'Koch Snowflake Recursive Crystal', 'Dielectric Electric Lightning Tendrils', 'Heighway Dragon Fractal Curve',
    'Lorenz Strange Attractor Orbit', 'Barnsley Fern Self-Similar Fronds', 'Apollonian Gasket Circle Packing',
    'Cantor Dust Discontinuous Set', 'Vicsek Fractal Cross Matrix', 'Levy C-Curve Recursive Weave',
    'Harter-Heighway Dragon Spiral', 'Mandelbulb 3D Projection Slice', 'Newton Fractal Basin Boundaries',
    'Lyapunov Chaos Exponent Grid', 'Pfeiffer Cell Fractal Mesh', 'Gosper Flowsnake Space-Filling',
    'Hilbert Space-Filling Curve', 'Peano Continuous Fractal Curve', 'Moore Plane-Filling Sweep',
    'Feigenbaum Period-Doubling Tree', 'Henon Attractor Phase Map', 'Rössler Spiral Chaos Sheet',
    'Chua Double Scroll Oscillation', 'Plasma Fractal Cloud Synthesis', 'Diffusion Limited Aggregation Cluster',
    'Percolation Cluster Threshold', 'Self-Avoiding Random Walk Path', 'Fractal Tree Branching Arteries',
    'Dendritic Metal Crystal Growth', 'Electric Arc Dielectric Breakdown', 'Vortex Soliton Filament Net',
    'Collatz Sequence Graph Lattice', 'Quantum Wavefunction Probability'
  ];
  addCategoryPatterns('fractals', 'fractal', fractalNames, i => ({
    stepMultiplier: 1.0 + (i % 4) * 0.25,
    density: 30 + (i % 6) * 8,
    angle: (i * 15) % 360,
    variant: i,
    harmonics: 2 + (i % 5),
  }));

  // 10. Fabric, Textile & Weaves (35 patterns)
  const fabricNames = [
    'Classic Herringbone Tweed Weave', 'Houndstooth Deconstructed Glen', 'Scottish Royal Tartan Plaid',
    'Diamond Argyle Knit Lattice', 'Heavy Canvas Basketweave', 'Denim Twill Diagonal Ribs',
    'Chevron Zigzag Herringbone', 'Gingham Check Country Picnic', 'Tattersall Equestrian Check',
    'Windowpane Tailored Suiting Grid', 'Loomed Waffle Pique Texture', 'Oxford Cloth Pinpoint Weave',
    'Corduroy Vertical Ribbed Wale', 'Jacquard Floral Damask Silhouette', 'Herringbone Broken Twill',
    'Shepherds Check Rustic Wool', 'Gun Club Sporting Plaid', 'Prince of Wales Glen Urquhart',
    'Chambray Micro Slub Weave', 'Ripstop Parachute Grid Reinforce', 'Mesh Jersey Athletic Knit',
    'Fishnet Diamond Open Weave', 'Crochet Lace Rosette Matrix', 'Macrame Knotted Square Weave',
    'Carbon Fiber Plain Weave Fabric', 'Burlap Jute Coarse Warp/Weft', 'Pinstripe Bankers Flannel',
    'Madras Multi-color Plaid', 'Houndstooth Micro Miniature', 'Chainmail Interlocked Ring Armor',
    'Braided Cord Herringbone Strands', 'Silk Twill 45° Sheen Lines', 'Gabardine Stepped Steep Twill',
    'Huckaback Textured Towel Weave', 'Jacquard Tapestry Interlace'
  ];
  addCategoryPatterns('fabric', 'weave', fabricNames, i => ({
    stepMultiplier: 0.8 + (i % 5) * 0.16,
    density: 22 + (i % 7) * 7,
    angle: (i * 45) % 180,
    variant: i,
  }));

  // 11. Architectural & Tiles (35 patterns)
  const archNames = [
    'Classic Subway Brick Running Bond', 'Herringbone Hardwood Parquet', 'Fish Scale Moroccan Scallop',
    'Hexagonal Marble Pavers', 'Venetian Terrazzo Mineral Mosaic', 'Basketweave Terracotta Patio',
    'Stacked Bond Modern Glass Brick', 'Cobblestone Old World Fan Pavers', 'Chevron French Oak Flooring',
    'Flemish Bond Historic Brickwork', 'Spanish Talavera Ceramic Fan', 'Hexagon Mosaic Backsplash',
    'Diagonal Checkerboard Marble Tiles', 'Octagon & Dot Victorian Floor', 'Interlocking Paver Driveway',
    'Stretcher Bond Architectural Block', 'English Cross Bond Brickwork', 'Roman Travertine Opus Incertum',
    'Subway Beveled Edge Tiles', 'Hexagonal Quarry Floor Tiles', 'Scalloped Roof Slate Shingles',
    'Dutch Windmill Paver Pattern', 'Versailles Parquet Panel Pattern', 'Curved Fan Granite Setts',
    'Interlocking Wave Edge Pavers', 'Encaustic Cement Floor Tiles', 'Glass Mosaic Pool Tile Grid',
    'Ashlar Stone Masonry Wall', 'Diamond Slate Roof Tiles', 'Reticulated Brick Solar Screen',
    'Cast Concrete Waffle Slab Grid', 'Curtain Wall Facade Mullions', 'Brise Soleil Sunshade Louvers',
    'Islamic Muqarnas Ceiling Grid', 'Granite Cobble Radial Rings'
  ];
  addCategoryPatterns('architecture', 'tiles', archNames, i => ({
    stepMultiplier: 0.9 + (i % 5) * 0.2,
    density: 20 + (i % 6) * 8,
    angle: (i * 30) % 180,
    variant: i,
  }));

  // 12. Celestial & Cosmic Stars (35 patterns)
  const celestialNames = [
    'Deep Space Starlight 4-Point Crosses', 'Zodiac Constellation Line Net', 'Orbital Planetary Ring Paths',
    'Solar Flare Corona Rays', 'Crescent Moon Phase Orbit', 'Supernova Shockwave Rings',
    'Galaxy Spiral Arm Density Waves', 'Meteor Shower Radiant Trails', 'Cosmic Dust Filament Lattice',
    'Pulsar Beam Sweep Fan', 'Astrolabe Ancient Brass Grid', 'Celestial Equator Coordinate Web',
    'Binary Star Orbit Ellipses', 'Nebula Particle Dispersion Grid', 'Eclipse Diamond Ring Sparkle',
    'Saturn Ringlets Resonance Divisions', 'North Star Polaris Concentric Trails', 'Comet Tail Plasma Streamers',
    'Hubble Deep Field Galaxy Points', 'Solar Granulation Cell Mesh', 'Black Hole Gravitational Lensing',
    'Aurora Borealis Curtain Folds', 'Telescope Crosshair Reticle Net', 'Starlight Diffraction Spikes 8-Point',
    'Stellar Parallax Measurement Grid', 'Quasar Relativistic Jet Lines', 'Interstellar Magnetohydrodynamic Net',
    'Planetary Transit Chord Lines', 'Cosmic Microwave Background Map', 'Andromeda Core Star Cluster',
    'Sirius Bright Sparkle Crosses', 'Orion Nebula Filaments', 'Celestial Sphere Armillary Rings',
    'Solar Prominence Magnetic Loops', 'Cosmic Horizon Expansion Rays'
  ];
  addCategoryPatterns('celestial', 'stars', celestialNames, i => ({
    stepMultiplier: 1.0 + (i % 4) * 0.22,
    density: 24 + (i % 7) * 7,
    angle: (i * 24) % 360,
    variant: i,
    harmonics: 4 + (i % 5),
  }));

  // 13. Optical Illusions & Moiré (30 patterns)
  const opticalNames = [
    'Op-Art Victor Vasarely Cube', 'Hypnotic Bullseye Concentric Echo', 'Moiré Radial Wave Interference',
    'Bridget Riley Wave Vibration', 'Concentric Diamond Optical Pulse', 'Impossible Penrose Staircase',
    'Scintillating Grid Optical Illusion', 'Hering Line Curvature Distortion', 'Ehrenstein Brightness Circle Illusion',
    'Cafe Wall Parallel Line Offset', 'Zöllner Tilted Diagonal Distortion', 'Kanizsa Triangle Illusory Contours',
    'Moiré Screen Angle Offset Mesh', 'Hypnotic Archimedean Vortex Tunnel', 'Checkerboard Bulge Distortion Field',
    'Concentric Squircle Depth Tunnel', 'Op-Art Herringbone Vibration', 'Intersecting Circular Wave Moiré',
    'Perspective Infinite Grid Hallway', 'Oscillating Contrast Bars Illusion', 'Wavy Line Density Distortion',
    'Rotational Starburst Afterimage', 'Concentric Polygon Hypnosis', 'Interlocking Square Depth Steps',
    'Diamond Shimmer Illusion Screen', 'Kinetic Op-Art Slit Mask', 'Optical Illusion Endless Corridor',
    'Expanding Wavefront Flash Illusion', 'Radial Spoke Rotation Mirage', 'Hyperbolic Tessellation Depth'
  ];
  addCategoryPatterns('optical', 'optical', opticalNames, i => ({
    stepMultiplier: 0.8 + (i % 5) * 0.2,
    density: 22 + (i % 6) * 8,
    angle: (i * 15) % 180,
    variant: i,
    harmonics: 2 + (i % 4),
  }));

  // 14. Organic & Voronoi Cellular (35 patterns)
  const organicNames = [
    'Voronoi Cellular Tissue Partition', 'Botanical Leaf Venation Network', 'Tree Growth Rings Dendrochronology',
    'Dragonfly Wing Membrane Net', 'Coral Polyps Skeleton Matrix', 'Animal Skin Giraffe Reticulation',
    'Reptilian Scale Tessellation', 'Marine Diatom Microscopic Shell', 'Drying Mud Cracked Earth Desiccation',
    'Cellular Mitosis Division Mesh', 'Soap Bubble Cluster Foam Film', 'Wood Grain Natural Annual Rings',
    'Human Capillary Vessel Tree', 'Porous Bone Trabecular Lattice', 'Fungal Mycelium Spore Web',
    'Pollen Grain Exine Architecture', 'Spider Silk Radial Orb Web', 'Butterfly Wing Scale Shingles',
    'Sea Sponge Glass Spicule Matrix', 'Bacterial Biofilm Micro-colonies', 'Bamboo Stalk Segment Nodes',
    'Nautilus Shell Golden Chambers', 'Radiolarian Deep Sea Skeleton', 'Honeybee Comb Perfect Hex Cells',
    'Sunflower Seed Phyllotaxis Spiral', 'Pinecone Fibonacci Scale Packing', 'Cactus Ribbed Spines Lattice',
    'Bird Feather Barbule Interlock', 'Snake Belly Ventral Scales', 'Diatom Frustule Puncta Net',
    'Fern Spore Cluster Sori Grid', 'Algal Filament Entangled Net', 'Volcanic Basalt Column Joints',
    'Water Surface Sunlight Caustics', 'Biomimetic Architectural Mesh'
  ];
  addCategoryPatterns('organic', 'organic', organicNames, i => ({
    stepMultiplier: 0.85 + (i % 5) * 0.18,
    density: 24 + (i % 7) * 7,
    angle: (i * 20) % 360,
    variant: i,
  }));

  // 15. Retro & 80s/90s Memphis (35 patterns)
  const retroNames = [
    'Memphis Design Squiggle Worms', 'Synthwave 80s Perspective Grid', '90s Geometric Confetti Triangles',
    'Vaporwave Sun Horizon Scanlines', 'Outrun Neon Cyber Gridwave', '80s Pastel Geo Confetti Sprinkles',
    'Memphis Zigzag Lightning Bolt', 'Radical 90s Arc Lattice Grid', 'Retro Arcade Pixel Waveform',
    'Miami Vice Sunset Gradient Slits', 'Memphis Dot & Dash Abstract', '80s Trapper Keeper Geometric Foil',
    'Cassette Tape Spool Cog Circles', 'Synthwave Sunset Wireframe Sun', 'Retro Roller Rink Carpet Swirls',
    '80s Fitness Neon Triangle Scatter', 'Memphis Asymmetric Step Blocks', 'Postmodernist Arch & Column Wire',
    'Retro Television Static Noise Lines', '90s Grunge Slanted Crosses', 'Memphis Polka Confetti Wave',
    'Synthwave Highway Grid Perspective', '80s Bowling Alley Neon Carpet', 'MTV Era Kinetic Geometric Pop',
    'Vaporwave Marble Column Wireframe', 'Memphis Squiggly Doodle Mesh', 'Retro Neon Grid Tunnel Horizon',
    'Cyberwave Wireframe Mountain Mesh', '90s Mall Food Court Tile Grid', 'Retro Compact Disc Prism Rays',
    'Memphis Floating Geo Shapes', 'Synthwave Neon Laser Barricade', '80s Boombox Speaker Grille Wire',
    'Retro Futuristic Starburst Rays', 'Vaporwave Palm Silhouette Mesh'
  ];
  addCategoryPatterns('retro', 'lines', retroNames, i => ({
    stepMultiplier: 0.9 + (i % 5) * 0.2,
    density: 22 + (i % 6) * 8,
    angle: (i * 30) % 360,
    variant: i,
  }));

  // 16. 3D Volumetric & Isometric (35 patterns)
  const threeDNames = [
    '3D Isometric Cube Voxels', '3D Hexagonal Column Pillars', '3D Cyber Horizon Grid',
    '3D Torus Vortex Rings', '3D Pyramidal Bas-Relief', '3D Geodesic Icosahedron Field',
    '3D Topographic Terrain Slices', '3D Ribbon Wave Mesh', '3D Wormhole Tunnel',
    '3D Floating Diamond Crystals', '3D DNA Double Helix Lattice', '3D Stepped Ziggurat Geometry',
    '3D Gyroid Minimal Surface', '3D Hypercube Tesseract Projection', '3D Voronoi Cellular Foam',
    '3D Honeycomb Extrusions', '3D Folding Origami Facets', '3D Architectural Spaceframe Truss',
    '3D Prismatic Light Crystals', '3D Optical Anaglyph Depth', '3D Penrose Impossible Stairs',
    '3D Floating Cubes Voxel Field', '3D Sine Terrain Mesh', '3D Spherical Coordinate Shells',
    '3D Quantum Lattice Matrix', '3D Platonic Solids Array', '3D Möbius Strip Ribbons',
    '3D Infinite Spiral Staircase', '3D Cyberpunk City Grid', '3D Crystal Geode Facets',
    '3D Wireframe Mountain Peak', '3D Extruded Chevron Tiles', '3D Octagonal Prism Towers',
    '3D Floating Tetrahedron Cloud', '3D Kinetic Wave Strands'
  ];
  addCategoryPatterns('3d', '3d', threeDNames, i => ({
    stepMultiplier: 1.0 + (i % 4) * 0.25,
    density: 20 + (i % 6) * 6,
    angle: (i * 15) % 360,
    variant: i,
  }));

  return library;
}

export const PATTERN_LIBRARY: PatternItem[] = buildPatternLibrary();

export const PATTERN_MAP = new Map<string, PatternItem>(
  PATTERN_LIBRARY.map(item => [item.id, item])
);

// Quick popular featured patterns for dropdown
export const FEATURED_PATTERNS: { id: string; name: string }[] = [
  { id: 'none', name: 'None (Disabled)' },
  { id: 'pat_3d_001', name: '3D Isometric Cube Voxels' },
  { id: 'pat_3d_002', name: '3D Hexagonal Column Pillars' },
  { id: 'pat_3d_003', name: '3D Cyber Horizon Grid' },
  { id: 'pat_3d_004', name: '3D Torus Vortex Rings' },
  { id: 'pat_tech_001', name: 'Cyberpunk Motherboard Circuit' },
  { id: 'pat_fractals_005', name: 'Dielectric Lightning Branches' },
  { id: 'pat_sacred_001', name: 'Flower of Life Classic' },
  { id: 'pat_japanese_001', name: 'Seigaiha Blue Ocean Waves' },
  { id: 'pat_moroccan_001', name: 'Zellij 8-Pointed Star Tile' },
  { id: 'pat_waves_001', name: 'Topographic Elevation Contours' },
  { id: 'pat_geometric_001', name: 'Hexagonal Honeycomb Lattice' },
  { id: 'pat_geometric_002', name: 'Isometric Rhombus Cube' },
  { id: 'pat_halftone_001', name: 'Classic Offset Halftone' },
  { id: 'pat_fabric_001', name: 'Classic Herringbone Tweed' },
  { id: 'pat_architecture_001', name: 'Subway Brick Running Bond' },
  { id: 'pat_celestial_001', name: 'Deep Space Starlight Crosses' },
  { id: 'pat_optical_001', name: 'Op-Art Victor Vasarely Cube' },
  { id: 'pat_organic_001', name: 'Voronoi Cellular Partition' },
  { id: 'pat_retro_002', name: 'Synthwave 80s Perspective Grid' },
  { id: 'lightning', name: 'Original Electric Lightning' },
  { id: 'mandelbrot', name: 'Mandelbrot Fractal' },
  { id: 'julia', name: 'Quantum Julia Set' },
  { id: 'grid', name: 'Geometric Tech Grid' },
  { id: 'hexagons', name: 'Hexagon Honeycomb' },
  { id: 'dots', name: 'Halftone Dots' },
  { id: 'isometric', name: 'Isometric 3D Lattice' },
];
