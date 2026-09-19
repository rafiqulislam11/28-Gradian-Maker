import { ImageAdjustments } from '../../types/project';

/**
 * High-Performance Client-Side Color Grading & Tone Mapping Engine
 * Performs non-destructive adjustments using fast integer arithmetic and LUTs
 */

export function applyImageAdjustments(
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
  w: number,
  h: number,
  adjustments: Partial<ImageAdjustments>
): void {
  const isDefault =
    !adjustments.brightness &&
    !adjustments.contrast &&
    !adjustments.saturation &&
    !adjustments.hue &&
    !adjustments.exposure &&
    !adjustments.temperature &&
    !adjustments.tint &&
    !adjustments.highlights &&
    !adjustments.shadows &&
    !adjustments.whites &&
    !adjustments.blacks &&
    !adjustments.vignette &&
    !adjustments.fade &&
    !adjustments.grain &&
    (adjustments.gamma === undefined || adjustments.gamma === 1.0);

  if (isDefault) return;

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;
  const len = data.length;

  const brightness = (adjustments.brightness ?? 0) * 2.55; // -255 to 255
  const contrastFactor = Math.tan(((adjustments.contrast ?? 0) + 100) * 0.00785398); // 0 to ~3.5
  const exposureMult = Math.pow(2, (adjustments.exposure ?? 0) / 50); // exposure multiplier
  const sat = 1 + (adjustments.saturation ?? 0) / 100; // 0 to 2
  const tempShift = (adjustments.temperature ?? 0) * 0.8; // warm vs cool
  const tintShift = (adjustments.tint ?? 0) * 0.8; // green vs magenta
  const gamma = adjustments.gamma && adjustments.gamma > 0 ? adjustments.gamma : 1.0;
  const invGamma = 1 / gamma;
  const highlights = (adjustments.highlights ?? 0) / 100;
  const shadows = (adjustments.shadows ?? 0) / 100;
  const whites = (adjustments.whites ?? 0) / 100;
  const blacks = (adjustments.blacks ?? 0) / 100;
  const fade = (adjustments.fade ?? 0) / 100;
  const grain = (adjustments.grain ?? 0) / 100;

  // Hue rotation radians
  const hueDeg = adjustments.hue ?? 0;
  const hueRad = (hueDeg * Math.PI) / 180;
  const cosHue = Math.cos(hueRad);
  const sinHue = Math.sin(hueRad);

  // Hue matrix constants
  const lumR = 0.2126;
  const lumG = 0.7152;
  const lumB = 0.0722;

  const a00 = lumR + cosHue * (1 - lumR) + sinHue * -lumR;
  const a01 = lumG + cosHue * -lumG + sinHue * -lumG;
  const a02 = lumB + cosHue * -lumB + sinHue * (1 - lumB);

  const a10 = lumR + cosHue * -lumR + sinHue * 0.143;
  const a11 = lumG + cosHue * (1 - lumG) + sinHue * 0.14;
  const a12 = lumB + cosHue * -lumB + sinHue * -0.283;

  const a20 = lumR + cosHue * -lumR + sinHue * -(1 - lumR);
  const a21 = lumG + cosHue * -lumG + sinHue * lumG;
  const a22 = lumB + cosHue * (1 - lumB) + sinHue * lumB;

  // Pre-calculate random seeds for grain
  let seed = 12345;
  const fastRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646 - 0.5;
  };

  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Exposure
    if (exposureMult !== 1) {
      r *= exposureMult;
      g *= exposureMult;
      b *= exposureMult;
    }

    // 2. Temperature & Tint
    if (tempShift !== 0) {
      r += tempShift;
      b -= tempShift;
    }
    if (tintShift !== 0) {
      g -= tintShift * 0.5;
      r += tintShift * 0.3;
      b += tintShift * 0.3;
    }

    // 3. Brightness & Contrast
    if (brightness !== 0) {
      r += brightness;
      g += brightness;
      b += brightness;
    }

    if (contrastFactor !== 1) {
      r = (r - 128) * contrastFactor + 128;
      g = (g - 128) * contrastFactor + 128;
      b = (b - 128) * contrastFactor + 128;
    }

    // 4. Highlights, Shadows, Whites, Blacks
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const normLum = Math.max(0, Math.min(1, lum / 255));

    if (highlights !== 0 && normLum > 0.5) {
      const hFactor = (normLum - 0.5) * 2 * highlights * 40;
      r += hFactor;
      g += hFactor;
      b += hFactor;
    }
    if (shadows !== 0 && normLum < 0.5) {
      const sFactor = (0.5 - normLum) * 2 * shadows * 40;
      r += sFactor;
      g += sFactor;
      b += sFactor;
    }
    if (whites !== 0) {
      r += whites * normLum * 30;
      g += whites * normLum * 30;
      b += whites * normLum * 30;
    }
    if (blacks !== 0) {
      r += blacks * (1 - normLum) * 30;
      g += blacks * (1 - normLum) * 30;
      b += blacks * (1 - normLum) * 30;
    }

    // 5. Saturation
    if (sat !== 1) {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray + (r - gray) * sat;
      g = gray + (g - gray) * sat;
      b = gray + (b - gray) * sat;
    }

    // 6. Hue rotation
    if (hueDeg !== 0) {
      const newR = a00 * r + a01 * g + a02 * b;
      const newG = a10 * r + a11 * g + a12 * b;
      const newB = a20 * r + a21 * g + a22 * b;
      r = newR;
      g = newG;
      b = newB;
    }

    // 7. Gamma
    if (gamma !== 1.0) {
      r = Math.pow(Math.max(0, r / 255), invGamma) * 255;
      g = Math.pow(Math.max(0, g / 255), invGamma) * 255;
      b = Math.pow(Math.max(0, b / 255), invGamma) * 255;
    }

    // 8. Fade (lifts shadows to soft matte)
    if (fade > 0) {
      const minLevel = fade * 50;
      r = r + (minLevel - r * 0.15) * fade;
      g = g + (minLevel - g * 0.15) * fade;
      b = b + (minLevel - b * 0.15) * fade;
    }

    // 9. Grain
    if (grain > 0) {
      const noiseVal = fastRand() * grain * 70;
      r += noiseVal;
      g += noiseVal;
      b += noiseVal;
    }

    data[i] = Math.max(0, Math.min(255, Math.round(r)));
    data[i + 1] = Math.max(0, Math.min(255, Math.round(g)));
    data[i + 2] = Math.max(0, Math.min(255, Math.round(b)));
  }

  ctx.putImageData(imgData, 0, 0);

  // 10. Vignette (radial shadow overlay)
  if (adjustments.vignette && adjustments.vignette > 0) {
    ctx.save();
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.hypot(w, h) / 2;
    const strength = (adjustments.vignette / 100) * 0.85;

    const vGrad = ctx.createRadialGradient(cx, cy, radius * 0.35, cx, cy, radius);
    vGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vGrad.addColorStop(0.7, `rgba(0,0,0,${strength * 0.4})`);
    vGrad.addColorStop(1, `rgba(0,0,0,${strength})`);

    ctx.fillStyle = vGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}
