"use client"

import { FC, useEffect, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, Star } from "lucide-react"
import { useFavorites } from "@/lib/context/favorites-context"
import { ArtPiece, Product } from "@/lib/types"
import { getArtPieces, toggleArtPieceFeatured } from "@/lib/services/art-piece-service"
import Link from "next/link"
import { FaStar } from "react-icons/fa"
import { useAdmin } from "@/lib/hooks/use-admin"
import { getOptimizedImageUrl } from "@/lib/utils"
import { primeCache } from "@/lib/client/image-cache"


const FeaturedPieces: FC = () => {
  const [favorites, setFavorites] = useState<number[]>([])
  const [artPieces, setArtPieces] = useState<ArtPiece[]>([])

  const isAdmin = useAdmin();

  const { addItem } = useFavorites();

  const handleAddItem = (product: Product) => {
    addItem(product, 1)
  }

  const handleToggleFeatured = async (id: string) => {
    let updatedPieces: ArtPiece[] = [];

    setArtPieces((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
      );

      updatedPieces = updated.filter((p) => p.isFeatured);

      return updatedPieces;
    });

    try {
      await toggleArtPieceFeatured(id);
    } catch (err) {
      console.error(err);

      setArtPieces((prev) => {
        const reverted = prev.map((p) =>
          p.id === id ? { ...p, isFeatured: !p.isFeatured } : p
        );

        return reverted.filter((p) => p.isFeatured);
      });
    }
  };

  useEffect(() => {
    const getArtPiecesFromDb = async () => {
      const artPieces = await getArtPieces();

      if (artPieces) {
        const featuredPieces = artPieces.filter(ap => ap.isFeatured === true);
        setArtPieces(featuredPieces)

        // Background-prime HQ cache so detail page loads instantly on click
        featuredPieces.forEach((piece) => {
          const thumbnail = [...piece.images].sort((a, b) => a.index - b.index)[0];
          if (thumbnail?.url) {
            primeCache(getOptimizedImageUrl(thumbnail.url, { width: 1400, quality: 90, format: "webp" }));
          }
        });
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
            Zorgvuldig uitgekozen
          </p>
          <h2 className="text-oker text-4xl sm:text-5xl font-light tracking-tight text-foreground mb-4">
            <span className="italic font-medium">Uitgelicht</span>
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Duik in mijn meest geliefde werkjes, stuk voor stuk met zorg en liefde gemaakt. Benieuwd naar meer? Verken gerust de volledige gallerij via de Gallery.
          </p>
        </div>

        {/* Art Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {artPieces.map((piece) => {
            const thumbnailImage = [...piece.images].sort(
              (a, b) => a.index - b.index
            )[0];

            return (
              <div
                key={piece.id}
                className="group bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Image Container */}
                <div className="relative aspect-3/4 overflow-hidden">
                  {/* Geblurde achtergrond (museum-matte effect) */}
                  <Image
                    src={getOptimizedImageUrl(thumbnailImage?.url, { width: 100, quality: 50 })}
                    alt=""
                    fill
                    aria-hidden
                    className="object-cover scale-110 blur-xl brightness-40 saturate-75"
                  />

                  {/* Hoofdafbeelding — object-contain zodat alles zichtbaar blijft */}
                  <Image
                    src={getOptimizedImageUrl(thumbnailImage?.url, { width: 600, quality: 50 })}
                    alt={piece.title}
                    fill
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
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
                        <span className="sr-only">Toevoegen aan favorieten</span>
                      </Button>
                      {
                        isAdmin === true ?
                          <Button
                            size="icon"
                            variant="secondary"
                            className={`h-10 w-10 rounded-full backdrop-blur-sm ${piece.isFeatured
                              ? "bg-yellow-500 hover:bg-yellow-600"
                              : "bg-foreground/90 hover:bg-foreground"
                              }`}
                            onClick={() => handleToggleFeatured(piece.id)}
                          >
                            <FaStar />
                            <span className="sr-only">Toggle featured</span>
                          </Button>
                          : null
                      }
                    </div>
                  </div>

                  {/* Category Badge */}
                  {
                    piece.labels?.length > 0 && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 text-xs font-sans font-medium tracking-wide bg-background/90 backdrop-blur-sm rounded-full">
                          {piece.labels[0].title}
                        </span>
                      </div>
                    )
                  }
                </div>

                {/* Details */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-medium text-foreground">
                        {piece.title}
                      </h3>
                      <p className="text-sm text-muted-foreground font-sans">
                        door {piece.artist} · {piece.dimensions}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xl font-light text-foreground">
                      {piece.isSold ? <span className="text-red-700">NIET BESCHIKBAAR</span> : '€ ' + piece.price.toLocaleString("en-US")}
                    </p>
                    <Link href={`/art/${piece.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-sans text-sm tracking-wide"
                      >
                        Bekijk details
                      </Button>
                    </Link>

                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button
            size="lg"
            variant="outline"
            className="px-8 py-6 text-base font-sans font-medium tracking-wide"
            asChild
          >
            <Link href={'/gallery'}>
              Werken
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FeaturedPieces