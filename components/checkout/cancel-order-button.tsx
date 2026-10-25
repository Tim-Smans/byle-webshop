"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cancelMyOrder } from "@/app/bestelling/actions"

interface Props {
    orderNumber: string
    // Either the secret link token or the e-mail used to order
    token?: string
    email?: string
    totalLabel?: string
    onCancelled?: (amountLabel: string) => void
}

// Customer-facing: cancel a paid order before it is shipped or picked up
export default function CustomerCancelOrderButton({ orderNumber, token, email, totalLabel, onCancelled }: Props) {
    const router = useRouter()
    const [confirming, setConfirming] = useState(false)
    const [isBusy, setIsBusy] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [doneLabel, setDoneLabel] = useState<string | null>(null)

    const cancel = async () => {
        setIsBusy(true)
        setMessage(null)
        try {
            const result = await cancelMyOrder({ orderNumber, token, email })
            if (result.ok) {
                setDoneLabel(result.amountLabel)
                onCancelled?.(result.amountLabel)
                // Show the updated status and timeline
                router.refresh()
            } else {
                setMessage(result.message)
            }
        } catch {
            setMessage("Er ging iets mis. Controleer je internetverbinding en probeer opnieuw.")
        }
        setIsBusy(false)
    }

    if (doneLabel) {
        return (
            <div role="status" className="rounded-lg border border-border bg-card p-5 text-sm">
                Je bestelling is geannuleerd en {doneLabel} wordt terugbetaald. Je krijgt een bevestiging per e-mail.
            </div>
        )
    }

    if (!confirming) {
        return (
            <button
                onClick={() => setConfirming(true)}
                className="inline-flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
            >
                <XCircle className="h-4 w-4" />
                Bestelling annuleren
            </button>
        )
    }

    return (
        <div className="rounded-lg border border-border bg-card p-5 text-sm space-y-3 text-left">
            <p className="font-medium">Wil je deze bestelling annuleren?</p>
            <p className="text-muted-foreground">
                Je bestelling is nog niet verzonden, dus je kan ze kosteloos annuleren. Je krijgt het volledige
                bedrag{totalLabel ? ` (${totalLabel})` : ""} meteen terug.
            </p>
            {message && (
                <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-red-800">{message}</p>
            )}
            <div className="flex flex-wrap gap-2">
                <Button variant="destructive" onClick={cancel} disabled={isBusy}>
                    {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                    Ja, annuleer mijn bestelling
                </Button>
                <Button variant="ghost" onClick={() => setConfirming(false)} disabled={isBusy}>
                    Nee, toch niet
                </Button>
            </div>
        </div>
    )
}
