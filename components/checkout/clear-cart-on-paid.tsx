"use client"

import { useEffect } from "react"
import { useCart } from "@/lib/context/cart-context"

// The order is paid: its works are sold, so take them out of the cart
export default function ClearCartOnPaid({ artPieceIds }: { artPieceIds: string[] }) {
    const { removeItem } = useCart()
    const idsKey = artPieceIds.join(",")

    useEffect(() => {
        idsKey.split(",").filter(Boolean).forEach(removeItem)
    }, [idsKey, removeItem])

    return null
}
