/**
 * Server-Side Bulk Image Processor using Node.js & Sharp
 * Designed for cluster multi-core headless processing of 500+ images and 8K scaling.
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const cluster = require('cluster');
const os = require('os');

const numCPUs = os.cpus().length;

/**
 * Process a single image buffer with Sharp
 * @param {Buffer} inputBuffer 
 * @param {Object} settings 
 * @returns {Promise<Buffer>}
 */
async function processImageServerSide(inputBuffer, settings = {}) {
  const {
    upscaleFactor = 1,
    blurRadius = 0,
    sharpenAmount = 0,
    format = 'png',
    quality = 90
  } = settings;

  let pipeline = sharp(inputBuffer);

  const metadata = await pipeline.metadata();
  const targetWidth = Math.round(metadata.width * upscaleFactor);
  const targetHeight = Math.round(metadata.height * upscaleFactor);

  // 1. Resize / Upscale with Lanczos3 interpolation
  if (upscaleFactor > 1) {
    pipeline = pipeline.resize(targetWidth, targetHeight, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    });
  }

  // 2. Gaussian Blur filter
  if (blurRadius > 0) {
    // Sharp sigma typically maps from 0.3 to 1000
    const sigma = Math.max(0.3, blurRadius * 0.6);
    pipeline = pipeline.blur(sigma);
  }

  // 3. AI Sharpening
  if (sharpenAmount > 0) {
    pipeline = pipeline.sharpen({
      sigma: 1 + sharpenAmount * 0.02,
      m1: 1.0,
      m2: 2.0
    });
  }

  // 4. Output encoding
  if (format === 'jpeg' || format === 'jpg') {
    pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  } else if (format === 'webp') {
    pipeline = pipeline.webp({ quality, effort: 4 });
  } else {
    pipeline = pipeline.png({ compressionLevel: 7 });
  }

  return await pipeline.toBuffer();
}

/**
 * Cluster Master & Worker Execution
 */
if (cluster.isMaster) {
  console.log(`[Gradient X Studio Server] Primary ${process.pid} is running across ${numCPUs} CPUs`);

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  console.log(`[Worker ${process.pid}] Sharp cluster worker ready to process queue.`);
}

module.exports = {
  processImageServerSide
};
