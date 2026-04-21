"use client"

import Image from "next/image"
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context/cart-context"
import { FC } from "react"

const CartDrawer: FC = () => {
    const { cart, isOpen, closeCart, removeItem, updateQuantity, clearCart, isLoading } = useCart()

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
                        <h2 className="text-xl font-medium">Your Cart</h2>
                        {cart.itemCount > 0 && (
                            <span className="px-2 py-0.5 text-xs font-sans font-medium bg-accent text-accent-foreground rounded-full">
                                {cart.itemCount}
                            </span>
                        )}
                    </div>
                    <Button variant="ghost" size="icon" onClick={closeCart}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close cart</span>
                    </Button>
                </div>

                {/* Cart Content */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
                        </div>
                    ) : cart.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-6">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                            <h3 className="text-xl font-medium text-foreground mb-2">
                                Your cart is empty
                            </h3>
                            <p className="text-muted-foreground mb-6">
                                Discover our collection and add some beautiful pieces to your cart.
                            </p>
                            <Button onClick={closeCart}>
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="px-6 py-4 space-y-4">
                            {cart.items.map((item) => (
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
                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center font-sans text-sm">
                                                    {item.quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>

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
                {cart.items.length > 0 && (
                    <div className="border-t border-border px-6 py-4 space-y-4">
                        {/* Subtotal */}
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground font-sans">Subtotal</span>
                            <span className="text-xl font-medium">
                                ${cart.total.toLocaleString()}
                            </span>
                        </div>

                        <p className="text-sm text-muted-foreground font-sans">
                            Shipping and taxes calculated at checkout
                        </p>

                        {/* Actions */}
                        <div className="space-y-2">
                            <Button className="w-full py-6 text-base font-sans tracking-wide">
                                Proceed to Checkout
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full font-sans"
                                onClick={closeCart}
                            >
                                Continue Shopping
                            </Button>
                        </div>

                        {/* Clear Cart */}
                        <button
                            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors font-sans underline"
                            onClick={clearCart}
                        >
                            Clear Cart
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}

export default CartDrawer