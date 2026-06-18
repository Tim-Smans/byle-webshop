"use client"

import { FC, useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ArtPiece } from "@/lib/types"
import { getFromCache, primeCache } from "@/lib/client/image-cache"
import { useSwipe } from "@/hooks/use-swipe"

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
    const [imgSrc, setImgSrc] = useState<string | null>(null)
    const [imgReady, setImgReady] = useState(false)

    const rawUrl = artPiece.images[selectedImageIndex]?.url || ""

    useEffect(() => {
        if (!isOpen || !rawUrl) return

        let cancelled = false
        setImgSrc(null)
        setImgReady(false)

        async function load() {
            // Try Cache API first — instant on repeat opens or if gallery already primed it
            const cached = await getFromCache(rawUrl)
            if (cancelled) return

            if (cached) {
                setImgSrc(cached)
                setImgReady(true)
                return
            }

            // Not cached: show original URL directly (Vercel CDN may already have it cached)
            // and prime Cache API in the background for future opens
            setImgSrc(rawUrl)
            setImgReady(true)
            primeCache(rawUrl)
        }

        load()
        return () => { cancelled = true }
    }, [isOpen, rawUrl])

    const swipeHandlers = useSwipe(onNext, onPrev)

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 select-none"
            onClick={onClose}
            {...(artPiece.images.length > 1 ? swipeHandlers : {})}
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

                {/* CSS shimmer + spinner while image loads */}
                {!imgReady && (
                    <>
                        <div className="absolute inset-0 bg-muted/20 animate-pulse rounded-lg" />
                        <div className="h-10 w-10 rounded-full border-2 border-foreground/20 border-t-foreground/70 animate-spin" />
                    </>
                )}

                {/* Main image — from Cache API (instant) or Vercel CDN */}
                {imgSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={imgSrc}
                        alt={artPiece.title}
                        className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${
                            imgReady ? "opacity-100" : "opacity-0"
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
