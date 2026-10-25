"use client"

import Image from "next/image"
import Link from "next/link"
import { X, Heart, Trash2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/lib/context/favorites-context"
import { useCart } from "@/lib/context/cart-context"
import { formatPrice } from "@/lib/utils"
import { FC } from "react"

const FavoritesDrawer: FC = () => {
    const { favorites, isOpen, closeFavorites, removeItem, clearFavorites, isLoading } = useFavorites()
    const { addItem: addToCart, isInCart } = useCart()

    if (!isOpen) return null

    const handleAddToCart = (artPieceId: string) => {
        closeFavorites()
        addToCart(artPieceId)
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
                onClick={closeFavorites}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <Heart className="h-5 w-5" />
                        <h2 className="text-xl font-medium">Jouw favorieten</h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={closeFavorites}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Sluit favorieten</span>
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
                        </div>
                    ) : favorites.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <Heart className="h-12 w-12 text-muted-foreground/30 mb-4" />
                            <p className="text-muted-foreground mb-6">
                                Tik op het hartje bij een kunstwerk om het hier te bewaren.
                            </p>
                            <Button variant="outline" onClick={closeFavorites}>
                                Verder rondkijken
                            </Button>
                        </div>
                    ) : (
                        <div className="px-6 py-4 divide-y divide-border">
                            {favorites.items.map((item) => (
                                <div key={item.id} className="flex gap-4 py-4">
                                    <Link
                                        href={`/art/${item.product.id}`}
                                        onClick={closeFavorites}
                                        className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted"
                                    >
                                        {item.product.images[0] && (
                                            <Image
                                                src={item.product.images[0].url}
                                                alt={item.product.title}
                                                fill
                                                sizes="64px"
                                                className="object-cover"
                                            />
                                        )}
                                    </Link>

                                    <div className="flex-1 flex flex-col min-w-0">
                                        <div className="flex justify-between gap-2">
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/art/${item.product.id}`}
                                                    onClick={closeFavorites}
                                                    className="font-medium text-foreground hover:underline underline-offset-4"
                                                >
                                                    {item.product.title}
                                                </Link>
                                                <p className="text-sm text-muted-foreground font-sans">
                                                    {item.product.isSold ? "Verkocht" : formatPrice(item.product.price)}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 -mt-1 -mr-2 shrink-0"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Verwijder uit favorieten</span>
                                            </Button>
                                        </div>

                                        {!item.product.isSold && (
                                            <div className="mt-auto pt-2">
                                                {isInCart(item.product.id) ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-sans text-muted-foreground">
                                                        <Check className="h-3.5 w-3.5" />
                                                        In je winkelmand
                                                    </span>
                                                ) : (
                                                    <button
                                                        className="text-xs font-sans tracking-wide text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                                                        onClick={() => handleAddToCart(item.product.id)}
                                                    >
                                                        In winkelmand
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {favorites.items.length > 0 && (
                    <div className="border-t border-border px-6 py-4 flex items-center justify-between">
                        <button
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors font-sans underline"
                            onClick={clearFavorites}
                        >
                            Lijst leegmaken
                        </button>
                        <Button variant="outline" className="font-sans" onClick={closeFavorites}>
                            Verder rondkijken
                        </Button>
                    </div>
                )}
            </div>
        </>
    )
}

export default FavoritesDrawer
