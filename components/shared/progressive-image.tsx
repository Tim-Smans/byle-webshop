"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/utils";
import { getFromCache, primeCache } from "@/lib/client/image-cache";

interface Props {
  src: string;
  blurDataUrl?: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  className?: string;
  hqWidth?: number;
  hqQuality?: number;
}

// Four-stage progressive loader:
// Stage 1 — tiny (20px) blurry placeholder: loads in ~100ms, shows immediately with spinner
// Stage 2 — medium quality via Next.js Image (~50-100KB): fades in when loaded, spinner disappears
// Stage 3 — HQ fades in from Cache API (instant) or background fetch, then stored in cache
//
// Use key={src} on this component in the parent to reset state cleanly on image navigation.
export function ProgressiveImage({
  src,
  blurDataUrl,
  alt,
  fill = true,
  sizes,
  priority = false,
  className = "",
  hqWidth = 1400,
  hqQuality = 90,
}: Props) {
  const tinySrc = getOptimizedImageUrl(src, { width: 20, quality: 10, format: "webp" });
  const mediumSrc = getOptimizedImageUrl(src, { width: 700, quality: 60, format: "webp" });
  const hqSrc = getOptimizedImageUrl(src, { width: hqWidth, quality: hqQuality, format: "webp" });

  // Track which mediumSrc has finished loading to detect cross-navigation state
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const mediumLoaded = loadedSrc === mediumSrc;

  const [hqObjectUrl, setHqObjectUrl] = useState<string | null>(null);
  const [hqReady, setHqReady] = useState(false);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadHq() {
      const cached = await getFromCache(hqSrc);
      if (cancelled) return;

      if (cached) {
        blobUrlRef.current = cached;
        setHqObjectUrl(cached);
        setHqReady(true);
        return;
      }

      await primeCache(hqSrc);
      if (cancelled) return;

      const fromCache = await getFromCache(hqSrc);
      if (cancelled) return;

      if (fromCache) {
        blobUrlRef.current = fromCache;
        setHqObjectUrl(fromCache);
        setHqReady(true);
      }
    }

    loadHq();

    return () => {
      cancelled = true;
      // Reset HQ state so old photo doesn't stay visible when navigating to a new image
      setHqObjectUrl(null);
      setHqReady(false);
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [hqSrc]);

  const blurProps = blurDataUrl
    ? { placeholder: "blur" as const, blurDataURL: blurDataUrl }
    : {};

  const showPlaceholder = !mediumLoaded;

  return (
    <>
      {/* Tiny blurry placeholder — loads in ~100ms, gives immediate context of the new image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={tinySrc}
        alt=""
        aria-hidden
        className={`absolute inset-0 w-full h-full object-cover scale-110 blur-xl transition-opacity duration-300 ${
          showPlaceholder ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Loading spinner — visible while medium quality is loading */}
      {showPlaceholder && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
        </div>
      )}

      {/* Medium quality — fades in when loaded */}
      <Image
        src={mediumSrc}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        className={`${className} transition-opacity duration-500 ${mediumLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setLoadedSrc(mediumSrc)}
        {...blurProps}
      />

      {/* HQ overlay — fades in from cache (instant) or after background fetch */}
      {hqObjectUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={hqObjectUrl}
          alt=""
          aria-hidden
          className={`absolute inset-0 w-full h-full ${className} transition-opacity duration-700 ${
            hqReady ? "opacity-100" : "opacity-0"
          }`}
        />
      )}
    </>
  );
}
