"use client";

/**
 * Resize and re-encode an image client-side before uploading.
 *
 * Smartphone screenshots are often 3〜5MB at native resolution, which
 * is wasteful both for the network and for Claude vision (Claude reads
 * scaled-down images at the same accuracy as full-res ones for most
 * tasks). This helper resizes to a max dimension and re-encodes as JPEG
 * at quality 0.85, which typically yields ~200KB.
 */
export async function compressImage(
  file: File,
  options: { maxDimension?: number; quality?: number } = {},
): Promise<{ dataUrl: string; mediaType: string; sizeKB: number }> {
  const maxDimension = options.maxDimension ?? 1400;
  const quality = options.quality ?? 0.85;

  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);

  const ratio = Math.min(
    1,
    maxDimension / Math.max(img.width, img.height),
  );
  const targetWidth = Math.round(img.width * ratio);
  const targetHeight = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas 2D context not available");
  }
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const compressed = canvas.toDataURL("image/jpeg", quality);
  const sizeKB = Math.round((compressed.length * 0.75) / 1024); // base64 overhead approx
  return {
    dataUrl: compressed,
    mediaType: "image/jpeg",
    sizeKB,
  };
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Image failed to load"));
    img.src = src;
  });
}
