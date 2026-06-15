"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getFromCache, primeCache } from "@/lib/client/image-cache";

interface Props {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
}

// Two-stage progressive loader (no Supabase render API):
// Stage 1 — CSS shimmer + spinner: instant feedback while Vercel CDN delivers the image
// Stage 2 — image appears: either from local Cache API (truly instant) or Vercel CDN edge cache
//
// On first visit: shimmer → Vercel-CDN-optimized image → original cached locally in background
// On repeat visit: blob from Cache API shown immediately, shimmer never visible
//
// Use key={src} on this component in the parent to reset state on image navigation.
export function ProgressiveImage({
  src,
  alt,
  fill = true,
  sizes,
  priority = false,
  className = "",
}: Props) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Check Cache API for instant display (no network needed)
      const cached = await getFromCache(src);
      if (cancelled) return;

      if (cached) {
        blobUrlRef.current = cached;
        setBlobUrl(cached);
        setIsLoaded(true);
        return;
      }

      // Not cached: prime in background so the next visit is instant.
      // next/image below will load via Vercel CDN in the meantime.
      primeCache(src);
    }

    load();

    return () => {
      cancelled = true;
      setBlobUrl(null);
      setIsLoaded(false);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src]);

  return (
    <>
      {/* CSS shimmer — only visible on first visit (cache miss) */}
      {!isLoaded && (
        <>
          <div className="absolute inset-0 bg-muted/40 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
          </div>
        </>
      )}

      {blobUrl ? (
        // Repeat visit: serve from local Cache API — zero network, full original quality
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={blobUrl}
          alt={alt}
          className={`absolute inset-0 w-full h-full ${className}`}
        />
      ) : (
        // First visit: Vercel CDN resizes, converts to WebP, and caches at the edge
        <Image
          src={src}
          alt={alt}
          fill={fill}
          sizes={sizes}
          priority={priority}
          className={`${className} transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setIsLoaded(true)}
        />
      )}
    </>
  );
}
