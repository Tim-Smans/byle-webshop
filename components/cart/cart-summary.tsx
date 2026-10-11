"use client"

import Link from "next/link"
import { FC } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/context/cart-context"
import { formatPrice } from "@/lib/utils"

interface Props {
    onNavigate?: () => void
}

// Subtotal and checkout button, shared by the drawer and the cart page
const CartSummary: FC<Props> = ({ onNavigate }) => {
    const { items, subtotal, unavailableItems } = useCart()
    const canCheckout = unavailableItems.length === 0 && subtotal > 0
    const checkoutLabel = items.some((item) => item.reservedByMe) ? "Verder afrekenen" : "Afrekenen"

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-muted-foreground font-sans">Subtotaal</span>
                <span className="text-xl font-medium">{formatPrice(subtotal)}</span>
            </div>

            <p className="text-sm text-muted-foreground font-sans">
                Prijzen inclusief btw. Verzendkosten worden berekend bij het afrekenen.
            </p>

            <p className="text-sm text-muted-foreground font-sans">
                Elk werk is uniek. Het wordt pas voor jou gereserveerd wanneer je afrekent.
            </p>

            {unavailableItems.length > 0 && (
                <p className="text-sm font-sans text-red-700">
                    Verwijder eerst de werken die niet meer beschikbaar zijn.
                </p>
            )}

            {canCheckout ? (
                <Button asChild className="w-full py-6 text-base font-sans tracking-wide">
                    <Link href="/afrekenen" onClick={onNavigate}>
                        {checkoutLabel}
                    </Link>
                </Button>
            ) : (
                <Button disabled className="w-full py-6 text-base font-sans tracking-wide">
                    {checkoutLabel}
                </Button>
            )}
        </div>
    )
}

export default CartSummary
