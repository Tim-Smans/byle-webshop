"use client"

import { useState } from "react"
import { Loader2, Mail } from "lucide-react"
import { useFeedback } from "@/lib/context/feedback-context"
import { resendOrderConfirmation } from "@/app/admin/bestellingen/actions"

export default function ResendConfirmationButton({ orderId, email }: { orderId: string; email: string }) {
    const { showWarning, showSuccess, showError } = useFeedback()
    const [isSending, setIsSending] = useState(false)

    const send = async () => {
        setIsSending(true)
        try {
            await resendOrderConfirmation(orderId)
            showSuccess(`Bevestiging opnieuw verstuurd naar ${email}.`)
        } catch (err) {
            showError(err instanceof Error ? err.message : "Versturen mislukt")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <button
            onClick={() => showWarning(`De orderbevestiging (met factuur) opnieuw sturen naar ${email}?`, send)}
            disabled={isSending}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
            {isSending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
            Bevestiging opnieuw versturen
        </button>
    )
}
