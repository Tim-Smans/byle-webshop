"use client"

import { getArtPieceById } from "@/lib/services/art-piece-service"
import { ArtPiece } from "@/lib/types"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import NotFound from "./not-found"
import ImageGalery from "./image/image-galery"
import ProductDetails from "./product-details"
import { useSearchParams, useRouter } from "next/navigation"

const ArtDetailContent = ({ id }: { id: string }) => {
    const [artPiece, setArtPiece] = useState<ArtPiece | undefined>(undefined)
    const searchParams = useSearchParams()
    const router = useRouter()

    const page = searchParams.get("page");
    const collectionId = searchParams.get("collectionId");

    useEffect(() => {
        const getArtPieceFromDb = async () => {
            const artPiece = await getArtPieceById(id);

            if (artPiece) {
                setArtPiece(artPiece)
            }
        }

        getArtPieceFromDb();
    }, [id])

    const handleNavigateToShop = () => {
        router.push(
            `/gallery?page=${page}${collectionId ? `&collectionId=${collectionId}` : ""
            }`
        );
    }

    if (!artPiece) {
        return (
            <NotFound />
        )
    }

    return (
        <>
            <main className="min-h-screen pt-24 pb-16">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Back Button */}
                    <div
                        onClick={() => handleNavigateToShop()}
                        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 font-sans text-sm"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Terug naar Shop
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                        {/* Image Gallery */}
                        <ImageGalery artPiece={artPiece} />

                        {/* Product Details */}
                        <ProductDetails artPiece={artPiece} />
                    </div>
                </div>
            </main>


        </>
    )
}

export default ArtDetailContent