"use client"

import { FC, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ArtPiece } from "@/lib/types"
import { getOptimizedImageUrl } from "@/lib/utils"
import { getFromCache, primeCache } from "@/lib/client/image-cache"

type Props = {
    artPiece: ArtPiece
    selectedImageIndex: number
    isOpen: boolean
    onClose: () => void
    onNext: () => void
    onPrev: () => void
}

const ExpandedImageModal: FC<Props> = ({
    artPiece,
    selectedImageIndex,
    isOpen,
    onClose,
    onNext,
    onPrev
}) => {
    // placeholderSrc: tiny blurry version shown instantly while HQ loads
    const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null)
    // mainSrc: HQ image (blob URL from cache or direct Supabase URL)
    const [mainSrc, setMainSrc] = useState<string | null>(null)
    const [mainReady, setMainReady] = useState(false)

    const rawUrl = artPiece.images[selectedImageIndex]?.url || ""
    const tinySrc = getOptimizedImageUrl(rawUrl, { width: 20, quality: 10, format: "webp" })
    const hqSrc = getOptimizedImageUrl(rawUrl, { width: 1800, quality: 92, format: "webp" })

    useEffect(() => {
        if (!isOpen || !rawUrl) return

        let cancelled = false

        // Reset: show tiny blurry placeholder immediately so there's never a blank screen
        setPlaceholderSrc(tinySrc)
        setMainSrc(null)
        setMainReady(false)

        async function load() {
            // Check cache first — instant on repeat opens or if gallery pre-cached it
            const cached = await getFromCache(hqSrc)
            if (cancelled) return

            if (cached) {
                setMainSrc(cached)
                setMainReady(true)
                return
            }

            // Fetch and cache HQ, placeholder stays visible during this time
            await primeCache(hqSrc)
            if (cancelled) return

            const fromCache = await getFromCache(hqSrc)
            if (cancelled) return

            if (fromCache) {
                setMainSrc(fromCache)
                setMainReady(true)
            } else {
                // Fallback: show direct URL if cache failed
                setMainSrc(hqSrc)
                setMainReady(true)
            }
        }

        load()
        return () => { cancelled = true }
    }, [isOpen, hqSrc, rawUrl, tinySrc])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 h-10 w-10 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            >
                <span className="sr-only">Close</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            <div className="relative w-full max-w-5xl h-[90vh] flex items-center justify-center overflow-hidden">

                {/* Tiny blurry placeholder — shows immediately, hides when HQ is ready */}
                {placeholderSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={placeholderSrc}
                        alt=""
                        aria-hidden
                        className={`absolute inset-0 w-full h-full object-contain scale-110 blur-2xl transition-opacity duration-300 ${
                            mainReady ? "opacity-0" : "opacity-100"
                        }`}
                    />
                )}

                {/* Loading spinner — visible while HQ loads */}
                {!mainReady && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="h-10 w-10 rounded-full border-2 border-foreground/20 border-t-foreground/70 animate-spin" />
                    </div>
                )}

                {/* HQ image — fades in when ready */}
                {mainSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={mainSrc}
                        alt={artPiece.title}
                        className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${
                            mainReady ? "opacity-100" : "opacity-0"
                        }`}
                        onClick={(e) => e.stopPropagation()}
                    />
                )}
            </div>

            {artPiece.images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev() }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onNext() }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </>
            )}
        </div>
    )
}

export default ExpandedImageModal
