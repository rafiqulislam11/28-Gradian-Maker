"""
Server-side Python Bulk Image Processing Worker
Gradient X Studio - High Performance 8K Upscale & Styling Engine
"""

import sys
import os
import cv2
import numpy as np
from PIL import Image, ImageFilter, ImageEnhance
import concurrent.futures
from pathlib import Path

def apply_gradient_blend(image_np, colors, blend_mode="overlay", opacity=0.5):
    """Generates and blends a gradient over an OpenCV image numpy array"""
    h, w, _ = image_np.shape
    grad = np.zeros((h, w, 3), dtype=np.float32)

    # Linear gradient interpolation
    c1 = np.array(colors[0], dtype=np.float32)
    c2 = np.array(colors[1], dtype=np.float32)

    for y in range(h):
        t = y / max(1, h - 1)
        grad[y, :] = (1.0 - t) * c1 + t * c2

    img_float = image_np.astype(np.float32)

    if blend_mode == "overlay":
        mask = img_float < 128
        blended = np.zeros_like(img_float)
        blended[mask] = (2 * img_float[mask] * grad[mask]) / 255.0
        blended[~mask] = 255.0 - (2 * (255.0 - img_float[~mask]) * (255.0 - grad[~mask])) / 255.0
    else:
        blended = grad

    out = (1.0 - opacity) * img_float + opacity * blended
    return np.clip(out, 0, 255).astype(np.uint8)

def process_image(file_path, output_dir, scale_factor=2, blur_radius=5, noise_amount=15):
    """Processes a single image file with super-resolution and styling"""
    try:
        img = cv2.imread(str(file_path))
        if img is None:
            return False, f"Could not read {file_path}"

        h, w = img.shape[:2]

        # 1. 2K/4K/8K Upscale using Lanczos4 interpolation
        if scale_factor > 1:
            target_w = w * scale_factor
            target_h = h * scale_factor
            img = cv2.resize(img, (target_w, target_h), interpolation=cv2.INTER_LANCZOS4)

        # 2. Gaussian Blur
        if blur_radius > 0:
            ksize = int(blur_radius * 2 + 1)
            img = cv2.GaussianBlur(img, (ksize, ksize), 0)

        # 3. Add Film Noise
        if noise_amount > 0:
            noise = np.random.normal(0, noise_amount, img.shape).astype(np.float32)
            img = np.clip(img.astype(np.float32) + noise, 0, 255).astype(np.uint8)

        # 4. Save output
        out_name = Path(file_path).stem + f"_gradx_{scale_factor}x.png"
        out_path = Path(output_dir) / out_name
        cv2.imwrite(str(out_path), img)
        return True, str(out_path)
    except Exception as e:
        return False, str(e)

def batch_process(input_dir, output_dir, max_workers=8):
    """Multi-threaded pool processing 500+ images concurrently"""
    files = list(Path(input_dir).glob("*.jpg")) + list(Path(input_dir).glob("*.png"))
    os.makedirs(output_dir, exist_ok=True)

    print(f"[*] Starting Python Batch Engine: {len(files)} files on {max_workers} threads...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(process_image, f, output_dir): f for f in files}
        completed = 0
        for future in concurrent.futures.as_completed(futures):
            completed += 1
            success, msg = future.result()
            if completed % 25 == 0 or completed == len(files):
                print(f"[*] Processed {completed}/{len(files)} images ({completed/len(files)*100:.1f}%)")

if __name__ == "__main__":
    if len(sys.argv) > 2:
        batch_process(sys.argv[1], sys.argv[2])
    else:
        print("Usage: python pythonWorker.py <input_folder> <output_folder>")
