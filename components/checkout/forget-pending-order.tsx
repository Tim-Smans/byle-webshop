"use client"

import { useEffect } from "react"
import { pendingOrderStore } from "@/lib/orders/pending-order"

// The order is final (paid, expired or cancelled): stop treating it as this
// browser's open checkout
export default function ForgetPendingOrder({ orderNumber }: { orderNumber: string }) {
    useEffect(() => {
        pendingOrderStore.clear(orderNumber)
    }, [orderNumber])

    return null
}
