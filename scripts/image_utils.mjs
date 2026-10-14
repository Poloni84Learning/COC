import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Upscales and saves an image ensuring min 1080 resolution while preserving alpha channel transparency.
 * Both width and height will be >= minDimension (default: 1080).
 * 
 * @param {string} inputPath - Source image path.
 * @param {string} outputPath - Target image path.
 * @param {number} minDimension - Minimum dimension threshold (default: 1080).
 */
export async function processAndSaveImage(inputPath, outputPath, minDimension = 1080) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Input file does not exist: ${inputPath}`);
  }

  const outDir = path.dirname(outputPath);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Scale so that BOTH width and height are at least minDimension
  const scale = Math.max(
    minDimension / metadata.width,
    minDimension / metadata.height,
    1.0 // Keep original if already larger than minDimension in both
  );

  const targetW = Math.round(metadata.width * scale);
  const targetH = Math.round(metadata.height * scale);

  await image
    .resize(targetW, targetH, {
      kernel: sharp.kernel.lanczos3,
      fit: 'fill'
    })
    .png({
      compressionLevel: 6,
      adaptiveFiltering: true
    })
    .toFile(outputPath);

  return {
    original: { width: metadata.width, height: metadata.height, format: metadata.format },
    exported: { width: targetW, height: targetH, format: 'png' },
    outputPath
  };
}
