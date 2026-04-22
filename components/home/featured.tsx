"use client"

import { FC, useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingBag } from "lucide-react"
import { useCart } from "@/lib/context/cart-context"
import { CartItem, Product } from "@/lib/types"

const artPieces = [
  {
    id: 1,
    name: "Sunset Reverie",
    artist: "Lé",
    price: 1250,
    image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&h=800&fit=crop",
    category: "Abstract",
    size: "24\" × 36\"",
  },
  {
    id: 2,
    name: "Ocean Whispers",
    artist: "Lé",
    price: 980,
    image: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&h=800&fit=crop",
    category: "Seascape",
    size: "20\" × 30\"",
  },
  {
    id: 3,
    name: "Golden Hour",
    artist: "Lé",
    price: 1450,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&h=800&fit=crop",
    category: "Abstract",
    size: "30\" × 40\"",
  },
  {
    id: 4,
    name: "Terracotta Dreams",
    artist: "Lé",
    price: 890,
    image: "https://images.unsplash.com/photo-1582201942988-13e60e4556ee?w=600&h=800&fit=crop",
    category: "Texture",
    size: "18\" × 24\"",
  },
  {
    id: 5,
    name: "Midnight Blue",
    artist: "Lé",
    price: 1680,
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&h=800&fit=crop",
    category: "Abstract",
    size: "36\" × 48\"",
  },
  {
    id: 6,
    name: "Autumn Palette",
    artist: "Lé",
    price: 1120,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=800&fit=crop",
    category: "Impressionist",
    size: "24\" × 32\"",
  },
]

const FeaturedPieces: FC = () => {
    const [favorites, setFavorites] = useState<number[]>([])

    const { addItem } = useCart();

    const toggleFavorite = (id: number) => {
        setFavorites(prev =>
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        )
    }

    const handleAddItem = (product: Product) => {
      addItem(product, 1)
    }

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
                  src={piece.image}
                  alt={piece.name}
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
                      onClick={() => toggleFavorite(piece.id)}
                    >
                      <Heart 
                        className={`h-5 w-5 ${favorites.includes(piece.id) ? 'fill-accent text-accent' : ''}`} 
                      />
                      <span className="sr-only">Add to favorites</span>
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full bg-foreground/90 backdrop-blur-sm hover:bg-foreground"
                      onClick={() => 
                        handleAddItem({...piece})}
                    >
                      <ShoppingBag className="h-5 w-5" />
                      <span className="sr-only">Add to cart</span>
                    </Button>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 text-xs font-sans font-medium tracking-wide bg-background/90 backdrop-blur-sm rounded-full">
                    {piece.category}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-medium text-foreground">
                      {piece.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-sans">
                      by {piece.artist} · {piece.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <p className="text-2xl font-light text-foreground">
                    ${piece.price.toLocaleString("en-US")}
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="font-sans text-sm tracking-wide"
                  >
                    View Details
                  </Button>
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