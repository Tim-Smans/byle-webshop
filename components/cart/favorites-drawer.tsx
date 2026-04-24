"use client"

import Image from "next/image"
import { X, ShoppingBag, Trash2, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFavorites } from "@/lib/context/favorites-context"
import { FC } from "react"

<<<<<<< HEAD:components/cart/favorites-drawer.tsx
const FavoritesDrawer: FC = () => {
    const { favorites, isOpen, closeFavorites, removeItem, clearFavorites, isLoading } = useFavorites()

    const etsyUrl = process.env.NEXT_PUBLIC_ETSY_STORE_URL;

    if (!etsyUrl) {
    throw new Error("NEXT_PUBLIC_ETSY_STORE_URL is not defined");
    }
=======
const CartDrawer: FC = () => {
    const { cart, isOpen, closeCart, removeItem, clearCart, isLoading } = useCart()
>>>>>>> d785179fef0256701e4716f7cc2c24e75284244c:components/cart/cart-drawer.tsx

    if (!isOpen) return null
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
                        <Star className="h-5 w-5" />
                        <h2 className="text-xl font-medium">Your Favorites</h2>
                        {favorites.itemCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-sans font-medium bg-accent text-accent-foreground rounded-full">
                                {favorites.itemCount}
                            </span>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={closeFavorites}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close favorites</span>
                    </Button>
                </div>

                {/* Cart Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
                        </div>
                    ) : favorites.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-medium text-foreground mb-2">
                                Your favorites are empty
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Discover our collection and add some beautiful pieces to your favorites.
                            </p>
                            <Button onClick={closeFavorites}>
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="px-6 py-4 space-y-4">
                            {favorites.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-4 p-4 bg-muted/30 rounded-lg"
                                >
                                    {/* Image */}
                                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md">
                                        <Image
                                            src={item.product.image}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="flex-1 flex flex-col">
                                        <div className="flex justify-between">
                                            <div>
                                                <h3 className="font-medium text-foreground">
                                                    {item.product.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground font-sans">
                                                    {item.product.size}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 -mt-1 -mr-2"
                                                onClick={() => removeItem(item.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Remove</span>
                                            </Button>
                                        </div>

                                        <div className="mt-auto flex items-center justify-between">
                                            {/* Price */}
                                            <p className="font-medium">
                                                ${(item.product.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {favorites.items.length > 0 && (
                    <div className="border-t border-border px-6 py-4 space-y-4">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-sans">Subtotal</span>
                            <span className="text-xl font-medium">
                                ${favorites.total.toLocaleString()}
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground font-sans">
                            Final prices and taxes will be calculated on Etsy
                        </p>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Button asChild className="w-full py-6 text-base font-sans tracking-wide">
                                <a target="blank" href={etsyUrl}>   
                                    Go to Etsy store
                                </a>
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full font-sans"
                                onClick={closeFavorites}
                            >
                                Continue Shopping
                            </Button>
                        </div>

                        {/* Clear Favorites */}
                        <button
                            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-sans underline"
                            onClick={clearFavorites}
                        >
                            Clear Favorites
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default FavoritesDrawer