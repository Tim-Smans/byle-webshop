"use client"

import { FC, useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useFavorites } from "@/lib/context/favorites-context"
import { ArtPiece, Product } from "@/lib/types"
import { getArtPieces } from "@/lib/services/art-piece-service"
import Link from "next/link"


const FeaturedPieces: FC = () => {
  const [favorites, setFavorites] = useState<number[]>([])
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([])

  const { addItem } = useFavorites();

  const handleAddItem = (product: Product) => {
    addItem(product, 1)
  }

  useEffect(() => {
    const getArtPiecesFromDb = async () => {
      const artPieces = await getArtPieces();

      if (artPieces) {
        const featuredPieces = artPieces.filter(ap => ap.isFeatured === true);
        
        setArtPieces(featuredPieces)
      }
    }

    getArtPiecesFromDb();
  }, [])

  return (
    <section id="shop" className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
            Curated Selection
          </p>
          <h2 className="text-oker text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-4">
            Featured <span className="italic font-medium">Pieces</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Discover my most beloved works, each one a testament to the beauty
            of handcrafted artistry. Make sure to check out the entire store on the `Shop` page.
          </p>
        </div>

        {/* Art Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artPieces.map((piece) => (
            <div
              key={piece.id}
              className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
            >
              {/* Image Container */}
              <div className="relative aspect-3/4 overflow-hidden">
                <Image
                  src={piece.images[0].url}
                  alt={piece.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300">
                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full bg-foreground/90 backdrop-blur-sm hover:bg-foreground"
                      onClick={() => handleAddItem({ ...piece })}
                    >
                      <Heart
                        className={`h-5 w-5`}
                      />
                      <span className="sr-only">Add to favorites</span>
                    </Button>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-sans font-medium tracking-wide bg-background/90 backdrop-blur-sm rounded-full">
                    {piece.labels[0].title}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-medium text-foreground">
                      {piece.title}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans">
                      by {piece.artist} · {piece.dimensions}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-2xl font-light text-foreground">
                    ${piece.price.toLocaleString("en-US")}
                  </p>
                  <Link href={`/art/${piece.id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-sans text-sm tracking-wide"
                    >
                      View Details
                    </Button>
                  </Link>

                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-base font-sans font-medium tracking-wide"
          >
            View All Pieces
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FeaturedPieces