"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

const INTERVAL_MS = 4000
const MAX_ATTEMPTS = 15

// Re-renders the order page (which re-checks Mollie) until the payment is final
export default function PaymentPendingRefresher() {
    const router = useRouter()

    useEffect(() => {
        let attempts = 0
        const timer = setInterval(() => {
            attempts += 1
            router.refresh()
            if (attempts >= MAX_ATTEMPTS) clearInterval(timer)
        }, INTERVAL_MS)

        return () => clearInterval(timer)
    }, [router])

    return null
}
