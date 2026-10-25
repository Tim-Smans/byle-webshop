"use client"

import Link from "next/link"
import { FC } from "react"
import { RotateCcw, Shield, ShoppingBag, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context/cart-context"
import CartLine from "./cart-line"
import CartSummary from "./cart-summary"

const CartPage: FC = () => {
    const { items, isLoading, removeItem } = useCart()

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                <div className="mb-10">
                    <p className="text-sm font-sans font-medium tracking-[0.3em] uppercase text-secondary mb-4">
                        Jouw selectie
                    </p>
                    <h1 className="text-oker text-4xl sm:text-5xl font-light tracking-tight">
                        Winkelmand
                    </h1>
                </div>

                {isLoading && items.length === 0 ? (
                    <div className="flex justify-center py-24">
                        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center text-center py-24">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mb-4" />
                        <h2 className="text-xl font-medium text-foreground mb-2">
                            Je winkelmand is leeg
                        </h2>
                        <p className="text-muted-foreground mb-6">
                            Bekijk de galerie en voeg een kunstwerk toe.
                        </p>
                        <Button asChild>
                            <Link href="/gallery">Naar de galerie</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10 items-start">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <CartLine
                                    key={item.artPieceId}
                                    item={item}
                                    onRemove={() => removeItem(item.artPieceId)}
                                />
                            ))}
                            <Link
                                href="/gallery"
                                className="inline-block pt-2 text-sm font-sans text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                            >
                                ← Verder winkelen
                            </Link>
                        </div>

                        <aside className="bg-card border border-border rounded-lg p-6 space-y-6 lg:sticky lg:top-32">
                            <CartSummary />

                            <ul className="space-y-3 pt-6 border-t border-border text-sm font-sans text-muted-foreground">
                                <li className="flex items-center gap-3">
                                    <Shield className="h-4 w-4 shrink-0" />
                                    Certificaat van echtheid
                                </li>
                                <li className="flex items-center gap-3">
                                    <Truck className="h-4 w-4 shrink-0" />
                                    Zorgvuldig verpakt verzonden, of gratis afhalen
                                </li>
                                <li className="flex items-center gap-3">
                                    <RotateCcw className="h-4 w-4 shrink-0" />
                                    14 dagen bedenktijd
                                </li>
                            </ul>
                        </aside>
                    </div>
                )}
            </div>
        </main>
    )
}

export default CartPage
