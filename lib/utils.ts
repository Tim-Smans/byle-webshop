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

const priceFormatter = new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" })
const wholePriceFormatter = new Intl.NumberFormat("nl-BE", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

// Belgian format; decimals only when there are any: "€ 1.250", "€ 12,50"
export function formatPrice(amount: number): string {
  return Number.isInteger(amount) ? wholePriceFormatter.format(amount) : priceFormatter.format(amount)
}

export function normalizeLabel(title: string): string {
  const words = title.toLowerCase().replace(/[-_]+/g, ' ').trim().split(/\s+/);
  return words.map((word, i) => (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)).join(' ');
}
