import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// New-style uploads: stored as {uuid}.webp (display) and {uuid}-t.webp (thumb).
// Old-style uploads: {uuid}-{filename}.{ext} — no thumb variant exists, fall back to original.
function isNewStyleImage(url: string): boolean {
  return /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.webp$/.test(url);
}

export function getThumbUrl(url: string): string {
  if (!url) return '';
  return isNewStyleImage(url) ? url.replace(/\.webp$/, '-t.webp') : url;
}
