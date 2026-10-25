"use client"

import Link from "next/link"
import { FC } from "react"
import { ShoppingBag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context/cart-context"
import CartLine from "./cart-line"
import CartSummary from "./cart-summary"

const CartDrawer: FC = () => {
    const { items, itemCount, isOpen, isLoading, closeCart, removeItem } = useCart()

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
                onClick={closeCart}
            />

            {/* Drawer */}
            <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background shadow-2xl z-50 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <ShoppingBag className="h-5 w-5" />
                        <h2 className="text-xl font-medium">Winkelmand</h2>
                        {itemCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-sans font-medium bg-accent text-accent-foreground rounded-full">
                                {itemCount}
                            </span>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={closeCart}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Sluit winkelmand</span>
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading && items.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-medium text-foreground mb-2">
                                Je winkelmand is leeg
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Bekijk de galerie en voeg een kunstwerk toe.
                            </p>
                            <Button asChild>
                                <Link href="/gallery" onClick={closeCart}>
                                    Naar de galerie
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="px-6 py-4 space-y-4">
                            {items.map((item) => (
                                <CartLine
                                    key={item.artPieceId}
                                    item={item}
                                    onRemove={() => removeItem(item.artPieceId)}
                                    onNavigate={closeCart}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-border px-6 py-4 space-y-2">
                        <CartSummary onNavigate={closeCart} />
                        <Button asChild variant="outline" className="w-full font-sans">
                            <Link href="/winkelmand" onClick={closeCart}>
                                Bekijk winkelmand
                            </Link>
                        </Button>
                        <button
                            className="w-full pt-2 text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-sans underline"
                            onClick={closeCart}
                        >
                            Verder winkelen
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default CartDrawer
