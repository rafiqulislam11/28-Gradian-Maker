import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { generate3DLumberModel, LumberStackParams, DEFAULT_LUMBER_PARAMS } from './lumberModelGenerator';

export interface ThreeStudioInstance {
  updateParams: (newParams: Partial<LumberStackParams>) => void;
  resetCamera: (preset?: 'perspective' | 'top' | 'front' | 'hero') => void;
  captureSnapshot: (transparent?: boolean) => string;
  setWireframe: (wireframe: boolean) => void;
  dispose: () => void;
}

/**
 * Initializes Three.js 3D Viewport Scene for Lumber & Model Studio
 */
export function initThreeStudio(
  container: HTMLDivElement,
  initialParams: LumberStackParams = DEFAULT_LUMBER_PARAMS
): ThreeStudioInstance {
  let currentParams = { ...initialParams };
  let currentLumberGroup: THREE.Group | null = null;
  let isWireframe = false;

  // 1. Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#12151e');

  // 2. Camera setup
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 600;
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);

  // Position camera matching the reference 3D perspective angle
  const setCameraPerspective = () => {
    camera.position.set(22, 18, 24);
    camera.lookAt(0, 4, 0);
  };
  setCameraPerspective();

  // 3. WebGL Renderer with Soft Shadow Mapping
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  container.appendChild(renderer.domElement);

  // 4. Smooth OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.target.set(0, 4, 0);
  controls.maxPolarAngle = Math.PI / 2 + 0.05; // Prevent camera sinking under ground
  controls.minDistance = 8;
  controls.maxDistance = 80;

  // 5. Studio Lighting Setup
  // Ambient Hemispheric Light (Sky blue tint + warm ground bounce)
  const hemiLight = new THREE.HemisphereLight('#f5f5f5', '#2c2b28', 0.85);
  hemiLight.position.set(0, 40, 0);
  scene.add(hemiLight);

  // Main Key Directional Sun Light (Casting rich contact shadows)
  const sunLight = new THREE.DirectionalLight('#fff8ea', 1.8);
  sunLight.position.set(24, 35, 18);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  sunLight.shadow.camera.near = 1;
  sunLight.shadow.camera.far = 100;
  const d = 22;
  sunLight.shadow.camera.left = -d;
  sunLight.shadow.camera.right = d;
  sunLight.shadow.camera.top = d;
  sunLight.shadow.camera.bottom = -d;
  sunLight.shadow.bias = -0.0003;
  scene.add(sunLight);

  // Secondary Soft Fill Light
  const fillLight = new THREE.DirectionalLight('#99bbff', 0.65);
  fillLight.position.set(-20, 15, -15);
  scene.add(fillLight);

  // Rim Back Light for edge definition
  const rimLight = new THREE.DirectionalLight('#ffffff', 0.5);
  rimLight.position.set(0, 10, -25);
  scene.add(rimLight);

  // 6. Generate Initial 3D Lumber Model
  const rebuildModel = () => {
    if (currentLumberGroup) {
      scene.remove(currentLumberGroup);
      currentLumberGroup.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    currentLumberGroup = generate3DLumberModel(currentParams);

    // Apply wireframe if active
    if (isWireframe) {
      currentLumberGroup.traverse(child => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => (m.wireframe = true));
          } else {
            child.material.wireframe = true;
          }
        }
      });
    }

    scene.add(currentLumberGroup);

    // Adjust controls target to center of stack height
    const stackHeight = currentParams.layers * currentParams.beamHeight;
    controls.target.set(0, stackHeight * 0.45, 0);
  };

  rebuildModel();

  // 7. Animation Frame Render Loop
  let animId: number;
  const animate = () => {
    animId = requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  // 8. Responsive Resize Observer
  const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
      const w = entry.contentRect.width;
      const h = entry.contentRect.height;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    }
  });
  resizeObserver.observe(container);

  // Public Controller API
  return {
    updateParams: (newParams: Partial<LumberStackParams>) => {
      currentParams = { ...currentParams, ...newParams };
      rebuildModel();
    },

    resetCamera: (preset: 'perspective' | 'top' | 'front' | 'hero' = 'perspective') => {
      const stackHeight = currentParams.layers * currentParams.beamHeight;
      controls.target.set(0, stackHeight * 0.45, 0);

      switch (preset) {
        case 'top':
          camera.position.set(0, 36, 0.1);
          break;
        case 'front':
          camera.position.set(0, stackHeight * 0.5, 32);
          break;
        case 'hero':
          camera.position.set(22, 6, 22);
          break;
        case 'perspective':
        default:
          camera.position.set(22, 18, 24);
          break;
      }
      controls.update();
    },

    captureSnapshot: (transparent: boolean = false): string => {
      const origBg = scene.background;
      if (transparent) {
        scene.background = null;
      }
      renderer.render(scene, camera);
      const dataUrl = renderer.domElement.toDataURL('image/png', 1.0);
      scene.background = origBg;
      renderer.render(scene, camera);
      return dataUrl;
    },

    setWireframe: (wireframe: boolean) => {
      isWireframe = wireframe;
      if (currentLumberGroup) {
        currentLumberGroup.traverse(child => {
          if (child instanceof THREE.Mesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(m => (m.wireframe = wireframe));
            } else {
              child.material.wireframe = wireframe;
            }
          }
        });
      }
    },

    dispose: () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      controls.dispose();

      if (currentLumberGroup) {
        scene.remove(currentLumberGroup);
      }

      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    },
  };
}
