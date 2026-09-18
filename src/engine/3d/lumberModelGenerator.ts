import * as THREE from 'three';

export type WoodMaterialType =
  | 'weathered-pine' // Reference image look
  | 'aged-oak'       // Dark rustic weathered oak
  | 'sawmill-fresh'  // Golden fresh cut pine/cedar
  | 'dark-timber'    // Deep charred / walnut lumber
  | 'pallet-wood';   // Industrial weathered pallet wood

export interface LumberStackParams {
  layers: number;             // 3 to 14 layers (default 8)
  beamsPerLayer: number;      // 3 to 9 beams per layer (default 6)
  beamLength: number;         // Base length of beams (default 14)
  beamWidth: number;          // Beam width (default 1.6)
  beamHeight: number;         // Beam height / thickness (default 1.2)
  spacing: number;            // Gap between parallel beams (default 0.3)
  jumbleJitter: number;       // 0 to 1: offset and angle randomness (default 0.25)
  lengthVariation: number;    // 0 to 1: random variation in beam ends (default 0.35)
  topDiagonalPlanks: boolean; // Add the 2 diagonal planks on top (default true)
  diagonalAngle: number;      // Angle of top diagonal planks (default 32)
  woodType: WoodMaterialType; // Texture and color palette
  showGroundGravel: boolean;  // Show contact gravel ground plane
}

export const DEFAULT_LUMBER_PARAMS: LumberStackParams = {
  layers: 8,
  beamsPerLayer: 6,
  beamLength: 13,
  beamWidth: 1.5,
  beamHeight: 1.1,
  spacing: 0.25,
  jumbleJitter: 0.22,
  lengthVariation: 0.3,
  topDiagonalPlanks: true,
  diagonalAngle: 32,
  woodType: 'weathered-pine',
  showGroundGravel: true,
};

/**
 * Color palettes for different wood types
 */
const WOOD_PALETTES: Record<
  WoodMaterialType,
  {
    base: string;
    grainDark: string;
    grainLight: string;
    knot: string;
    weathering: string;
    endRing: string;
  }
> = {
  'weathered-pine': {
    base: '#c2ab87',
    grainDark: '#8a7153',
    grainLight: '#ddcaab',
    knot: '#5c4328',
    weathering: '#8c8c88',
    endRing: '#73573c',
  },
  'aged-oak': {
    base: '#8a7763',
    grainDark: '#4f3f31',
    grainLight: '#a99885',
    knot: '#36281b',
    weathering: '#5e5a55',
    endRing: '#453526',
  },
  'sawmill-fresh': {
    base: '#deb36e',
    grainDark: '#a37532',
    grainLight: '#f3d39b',
    knot: '#7a4e17',
    weathering: '#c79e55',
    endRing: '#916327',
  },
  'dark-timber': {
    base: '#4a382a',
    grainDark: '#281c12',
    grainLight: '#69513e',
    knot: '#18100a',
    weathering: '#382f28',
    endRing: '#261b11',
  },
  'pallet-wood': {
    base: '#b0a08a',
    grainDark: '#756550',
    grainLight: '#c9bca9',
    knot: '#473a2b',
    weathering: '#7a756e',
    endRing: '#594a38',
  },
};

/**
 * Generates high-detail procedural wood plank surface texture with fibers and knots
 */
function createWoodPlankCanvasTexture(type: WoodMaterialType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const pal = WOOD_PALETTES[type];

  // Base coat
  ctx.fillStyle = pal.base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Longitudinal wood grain lines
  const numLines = 600;
  for (let i = 0; i < numLines; i++) {
    const y = Math.random() * canvas.height;
    ctx.strokeStyle = Math.random() > 0.5 ? pal.grainDark : pal.grainLight;
    ctx.globalAlpha = 0.08 + Math.random() * 0.18;
    ctx.lineWidth = 0.5 + Math.random() * 2.2;

    ctx.beginPath();
    ctx.moveTo(0, y);

    // Subtle wave along fiber length
    const waveAmp = 2 + Math.random() * 6;
    const waveFreq = 0.005 + Math.random() * 0.01;
    for (let x = 0; x <= canvas.width; x += 32) {
      const ny = y + Math.sin(x * waveFreq) * waveAmp;
      ctx.lineTo(x, ny);
    }
    ctx.stroke();
  }

  // Weathering blotches and edge aging
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = pal.weathering;
  for (let b = 0; b < 40; b++) {
    const bx = Math.random() * canvas.width;
    const by = Math.random() * canvas.height;
    const brx = 20 + Math.random() * 80;
    const bry = 5 + Math.random() * 25;
    ctx.beginPath();
    ctx.ellipse(bx, by, brx, bry, (Math.random() - 0.5) * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // Realistic wood knots
  ctx.globalAlpha = 0.65;
  const knotCount = 2 + Math.floor(Math.random() * 3);
  for (let k = 0; k < knotCount; k++) {
    const kx = 100 + Math.random() * (canvas.width - 200);
    const ky = 50 + Math.random() * (canvas.height - 100);
    const kr = 12 + Math.random() * 18;

    ctx.fillStyle = pal.knot;
    ctx.beginPath();
    ctx.ellipse(kx, ky, kr * 1.6, kr, (Math.random() - 0.5) * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Knot growth rings
    ctx.strokeStyle = pal.grainDark;
    ctx.lineWidth = 1.2;
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      ctx.ellipse(kx, ky, (kr + ring * 6) * 1.4, kr + ring * 5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Generates procedural wood end-grain texture with annular tree growth rings
 */
function createWoodEndGrainCanvasTexture(type: WoodMaterialType): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;
  const pal = WOOD_PALETTES[type];

  // Base end coat
  ctx.fillStyle = pal.base;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width * (0.35 + Math.random() * 0.3);
  const cy = canvas.height * (0.35 + Math.random() * 0.3);

  // Concentric annular growth rings
  const maxR = Math.hypot(canvas.width, canvas.height);
  ctx.strokeStyle = pal.endRing;

  for (let r = 8; r < maxR; r += 4 + Math.random() * 5) {
    ctx.globalAlpha = 0.25 + Math.random() * 0.35;
    ctx.lineWidth = 1.0 + Math.random() * 2.0;

    ctx.beginPath();
    for (let angle = 0; angle <= Math.PI * 2; angle += 0.1) {
      // Natural organic ring distortion
      const distort = Math.sin(angle * 7) * 2 + Math.cos(angle * 13) * 1.5;
      const rx = cx + (r + distort) * Math.cos(angle);
      const ry = cy + (r + distort) * Math.sin(angle) * 0.85;
      if (angle === 0) ctx.moveTo(rx, ry);
      else ctx.lineTo(rx, ry);
    }
    ctx.closePath();
    ctx.stroke();
  }

  // Radial drying cracks from pith
  ctx.strokeStyle = pal.knot;
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5;
  for (let c = 0; c < 5; c++) {
    const crackAngle = Math.random() * Math.PI * 2;
    const crackLen = 40 + Math.random() * 120;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(crackAngle) * crackLen, cy + Math.sin(crackAngle) * crackLen);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Generates gravel / ground texture for shadow ground plane
 */
function createGroundGravelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#22252c';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gravel pebbles & dirt speckles
  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    const r = 0.8 + Math.random() * 2.5;
    const gray = 40 + Math.floor(Math.random() * 60);
    ctx.fillStyle = `rgb(${gray},${gray},${gray})`;
    ctx.globalAlpha = 0.4 + Math.random() * 0.4;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Procedural 3D Stacked Lumber Model Generator
 * Matches the reference photograph of stacked construction beams with top diagonal boards!
 */
export function generate3DLumberModel(params: LumberStackParams): THREE.Group {
  const group = new THREE.Group();
  group.name = 'LumberStack';

  // 1. Generate PBR Materials
  const sideTexture = createWoodPlankCanvasTexture(params.woodType);
  const endTexture = createWoodEndGrainCanvasTexture(params.woodType);

  const woodSideMaterial = new THREE.MeshStandardMaterial({
    map: sideTexture,
    roughness: 0.82,
    metalness: 0.05,
  });

  const woodEndMaterial = new THREE.MeshStandardMaterial({
    map: endTexture,
    roughness: 0.9,
    metalness: 0.02,
  });

  // Top / bottom wood material (slightly darker/weathered)
  const woodTopMaterial = new THREE.MeshStandardMaterial({
    map: sideTexture,
    roughness: 0.85,
    metalness: 0.04,
  });

  // Cube materials array: [Right, Left, Top, Bottom, Front, Back]
  // In BoxGeometry: 0=x+, 1=x-, 2=y+, 3=y-, 4=z+, 5=z-
  const xOrientedMaterials = [
    woodEndMaterial,  // x+ (end grain)
    woodEndMaterial,  // x- (end grain)
    woodTopMaterial,  // y+ (top)
    woodSideMaterial, // y- (bottom)
    woodSideMaterial, // z+ (side)
    woodSideMaterial, // z- (side)
  ];

  const zOrientedMaterials = [
    woodSideMaterial, // x+ (side)
    woodSideMaterial, // x- (side)
    woodTopMaterial,  // y+ (top)
    woodSideMaterial, // y- (bottom)
    woodEndMaterial,  // z+ (end grain)
    woodEndMaterial,  // z- (end grain)
  ];

  // 2. Build Stack Layer by Layer
  const totalStackWidth = (params.beamsPerLayer - 1) * (params.beamWidth + params.spacing);
  const startOffset = -totalStackWidth / 2;

  let currentY = params.beamHeight * 0.5;

  for (let l = 0; l < params.layers; l++) {
    const isX = l % 2 === 0; // Alternating criss-cross direction
    const materials = isX ? xOrientedMaterials : zOrientedMaterials;

    for (let b = 0; b < params.beamsPerLayer; b++) {
      // Natural jitter for realism
      const jumbleOffset = (Math.random() - 0.5) * params.jumbleJitter * 0.8;
      const angleJitter = (Math.random() - 0.5) * params.jumbleJitter * 0.05;
      const lengthMult = 1.0 + (Math.random() - 0.5) * params.lengthVariation;

      const beamLen = params.beamLength * lengthMult;
      const perpPos = startOffset + b * (params.beamWidth + params.spacing) + jumbleOffset;

      // Axial overhang jitter (some beams stick out more at ends)
      const axialJitter = (Math.random() - 0.5) * params.beamLength * params.jumbleJitter * 0.4;

      let geom: THREE.BoxGeometry;
      let posX = 0;
      let posZ = 0;

      if (isX) {
        // Oriented along X axis
        geom = new THREE.BoxGeometry(beamLen, params.beamHeight, params.beamWidth);
        posX = axialJitter;
        posZ = perpPos;
      } else {
        // Oriented along Z axis
        geom = new THREE.BoxGeometry(params.beamWidth, params.beamHeight, beamLen);
        posX = perpPos;
        posZ = axialJitter;
      }

      const mesh = new THREE.Mesh(geom, materials);
      mesh.position.set(posX, currentY, posZ);
      mesh.rotation.y = angleJitter;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      group.add(mesh);
    }

    currentY += params.beamHeight;
  }

  // 3. Top Diagonal Cross Planks (Just like in the reference image!)
  if (params.topDiagonalPlanks) {
    const diagPlankLen = params.beamLength * 1.05;
    const diagPlankWidth = params.beamWidth * 1.1;
    const diagPlankHeight = params.beamHeight * 0.55; // Thinner plank board

    const diagGeom = new THREE.BoxGeometry(diagPlankLen, diagPlankHeight, diagPlankWidth);

    // Plank 1: Main diagonal crossing over stack
    const plank1 = new THREE.Mesh(diagGeom, xOrientedMaterials);
    const rad1 = (params.diagonalAngle * Math.PI) / 180;
    plank1.position.set(-0.5, currentY + diagPlankHeight * 0.5, 0.8);
    plank1.rotation.y = rad1;
    plank1.rotation.z = 0.02; // Slight tilt
    plank1.castShadow = true;
    plank1.receiveShadow = true;
    group.add(plank1);

    // Plank 2: Second overlapping companion diagonal plank
    const plank2 = new THREE.Mesh(diagGeom, xOrientedMaterials);
    const rad2 = ((params.diagonalAngle + 14) * Math.PI) / 180;
    plank2.position.set(1.2, currentY + diagPlankHeight * 1.4, -0.6);
    plank2.rotation.y = rad2;
    plank2.rotation.z = -0.015;
    plank2.castShadow = true;
    plank2.receiveShadow = true;
    group.add(plank2);
  }

  // 4. Ground Gravel Shadow Receiver Plane
  if (params.showGroundGravel) {
    const groundTexture = createGroundGravelTexture();
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.95,
      metalness: 0.0,
      color: '#444852',
    });

    const groundGeom = new THREE.PlaneGeometry(params.beamLength * 2.2, params.beamLength * 2.2);
    const groundMesh = new THREE.Mesh(groundGeom, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = 0;
    groundMesh.receiveShadow = true;
    group.add(groundMesh);
  }

  return group;
}
