const CACHE_NAME = "art-hq-v1";

export async function primeCache(url: string): Promise<void> {
  if (typeof window === "undefined" || !("caches" in window)) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const existing = await cache.match(url);
    if (existing) return;
    const response = await fetch(url);
    if (response.ok) {
      await cache.put(url, response);
    }
  } catch {
    // Cache API niet beschikbaar of netwerk fout — stil falen
  }
}

export async function getFromCache(url: string): Promise<string | null> {
  if (typeof window === "undefined" || !("caches" in window)) return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url);
    if (!cached) return null;
    const blob = await cached.blob();
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}
