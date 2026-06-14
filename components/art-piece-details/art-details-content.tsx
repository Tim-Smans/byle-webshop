"use client"

import { getArtPieceById } from "@/lib/services/art-piece-service"
import { ArtPiece } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import { useEffect, useState } from "react"
import NotFound from "./not-found"
import ImageGalery from "./image/image-galery"
import ProductDetails from "./product-details"
import { useSearchParams, useRouter } from "next/navigation"

const CanvasLine = ({ delay = 0 }: { delay?: number }) => (
    <div
        style={{
            height: "1px",
            background: "var(--primary)",
            animation: `line-breathe 2.4s ease-in-out ${delay}s infinite`,
        }}
    />
)

const ArtDetailSkeleton = () => (
    <main className="min-h-screen pt-24 pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="h-4 w-28 rounded bg-muted/70 animate-pulse mb-8" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                {/* Canvas loading panel */}
                <div className="relative h-[600px] rounded-xl overflow-hidden border border-border">
                    {/* Slow warm light moving across the canvas */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                "linear-gradient(135deg, var(--muted) 0%, var(--warm-beige) 30%, var(--background) 50%, var(--warm-beige) 70%, var(--muted) 100%)",
                            backgroundSize: "300% 300%",
                            animation: "canvas-shimmer 5s ease-in-out infinite",
                        }}
                    />

                    {/* Centered composition */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
                        <CanvasLine delay={0} />

                        <div className="text-center space-y-2 px-8">
                            <p className="font-heading italic text-2xl text-foreground/35 tracking-wide">
                                Het doek wordt onthuld
                            </p>
                            <p className="font-sans text-[10px] tracking-[0.35em] uppercase text-muted-foreground/50">
                                Even geduld
                            </p>
                        </div>

                        <CanvasLine delay={0.8} />
                    </div>
                </div>

                {/* Details skeleton */}
                <div className="flex flex-col pt-2">
                    <div className="flex gap-2 mb-4">
                        <div className="h-5 w-16 rounded-full bg-muted animate-pulse" />
                        <div className="h-5 w-24 rounded-full bg-muted animate-pulse" />
                    </div>
                    <div className="space-y-2 mb-2">
                        <div className="h-10 w-4/5 rounded bg-muted animate-pulse" />
                        <div className="h-10 w-2/3 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="h-4 w-1/2 rounded bg-muted animate-pulse mb-6" />
                    <div className="h-12 w-1/3 rounded bg-muted animate-pulse mb-8" />
                    <div className="h-3 w-32 rounded bg-muted animate-pulse mb-3" />
                    <div className="space-y-2 mb-8">
                        {[1, 0.9, 0.85, 0.7, 0.6].map((w, i) => (
                            <div
                                key={i}
                                className="h-4 rounded bg-muted animate-pulse"
                                style={{ width: `${w * 100}%` }}
                            />
                        ))}
                    </div>
                    <div className="flex gap-3">
                        <div className="h-12 flex-1 rounded bg-muted animate-pulse" />
                        <div className="h-12 flex-1 rounded bg-muted animate-pulse" />
                        <div className="h-12 w-12 rounded bg-muted animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    </main>
)

const ArtDetailContent = ({ id }: { id: string }) => {
    const [artPiece, setArtPiece] = useState<ArtPiece | undefined>(undefined)
    const [isLoading, setIsLoading] = useState(true)
    const searchParams = useSearchParams()
    const router = useRouter()

    const page = searchParams.get("page");
    const collectionId = searchParams.get("collectionId");

    useEffect(() => {
        const getArtPieceFromDb = async () => {
            const artPiece = await getArtPieceById(id);
            setArtPiece(artPiece)
            setIsLoading(false)
        }

        getArtPieceFromDb();
    }, [id])

    const handleNavigateToShop = () => {
        router.push(
            `/gallery?page=${page}${collectionId ? `&collectionId=${collectionId}` : ""}`
        );
    }

    if (isLoading) {
        return <ArtDetailSkeleton />
    }

    if (!artPiece) {
        return <NotFound />
    }

    return (
        <main className="min-h-screen pt-24 pb-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Back Button */}
                <div
                    onClick={() => handleNavigateToShop()}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans text-sm cursor-pointer"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Terug naar Shop
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    <ImageGalery artPiece={artPiece} />
                    <ProductDetails artPiece={artPiece} />
                </div>
            </div>
        </main>
    )
}

export default ArtDetailContent