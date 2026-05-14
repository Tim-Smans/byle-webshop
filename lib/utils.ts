import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// utils/image.js

// utils/image.ts

interface ImageTransformOptions {
  width?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png" | "avif";
  resize?: "cover" | "contain" | "fill";
}

export function getOptimizedImageUrl(
  publicUrl: string,
  options: ImageTransformOptions = {}
): string {
  if (!publicUrl) return "";

  const { width = 800, quality = 75, format = "webp", resize = "contain" } = options;

  const transformedUrl = publicUrl.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );

  const params = new URLSearchParams({
    width: width.toString(),
    quality: quality.toString(),
    format,
    resize
  });

  return `${transformedUrl}?${params.toString()}`;
}