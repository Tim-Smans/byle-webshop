"use client"

import { Button } from "@/components/ui/button"
import { useFavorites } from "@/lib/context/favorites-context"
import { getArtPieceById } from "@/lib/services/art-piece-service"
import { ArtPiece } from "@/lib/types"
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Expand, RotateCcw, Share2, Shield, Star, Truck } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import NotFound from "./not-found"
import ImageGalery from "./image/image-galery"
import ProductDetails from "./product-details"

const ArtDetailContent = ({ id }: { id: string }) => {
    const [artPiece, setArtPiece] = useState<ArtPiece | undefined>(undefined)

    useEffect(() => {        
        const getArtPieceFromDb = async () => {
            const artPiece = await getArtPieceById(id);

            if (artPiece) {
                setArtPiece(artPiece)
            }
        }

        getArtPieceFromDb();
    }, [id])

    if (!artPiece) {
        return (
            <NotFound/>
        )
    }

    return (
        <>
            <main className="min-h-screen pt-24 pb-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Back Button */}
                    <Link
                        href="/#shop"
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Shop
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Image Gallery */}
                        <ImageGalery artPiece={artPiece}/>

                        {/* Product Details */}
                        <ProductDetails artPiece={artPiece}/>
                    </div>
                </div>
            </main>

    
        </>
    )
}

export default ArtDetailContent