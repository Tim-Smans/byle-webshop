"use client"

import { useState } from "react"
import { Loader2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFeedback } from "@/lib/context/feedback-context"
import { formatPrice } from "@/lib/utils"
import { cancelAndRefundOrderAction } from "@/app/admin/herroepingen/actions"

// Full cancellation with refund, e.g. after a stock conflict or when a work
// got damaged before it was shipped
export default function CancelOrderButton({
    orderId,
    total,
    defaultMakeAvailable,
}: {
    orderId: string
    total: number
    defaultMakeAvailable: boolean
}) {
    const { showWarning, showSuccess, showError } = useFeedback()
    const [open, setOpen] = useState(false)
    const [makeAvailable, setMakeAvailable] = useState(defaultMakeAvailable)
    const [isBusy, setIsBusy] = useState(false)

    const cancel = async () => {
        setIsBusy(true)
        try {
            const result = await cancelAndRefundOrderAction(orderId, makeAvailable)
            const extra = result.warnings.length ? ` Let op: ${result.warnings.join(" ")}` : ""
            showSuccess(`Bestelling geannuleerd en ${formatPrice(result.amount)} terugbetaald.${extra}`)
            setOpen(false)
        } catch (err) {
            showError(err instanceof Error ? err.message : "Onbekende fout")
        } finally {
            setIsBusy(false)
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-red-700 transition-colors"
            >
                <XCircle size={14} />
                Bestelling annuleren en terugbetalen
            </button>
        )
    }

    return (
        <div className="rounded-md border border-red-200 bg-red-50/60 p-4 space-y-3 text-sm">
            <p>
                De volledige bestelling ({formatPrice(total)}) wordt terugbetaald via Mollie en er wordt een creditnota
                gemaakt. De klant krijgt een e-mail.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
                <input
                    type="checkbox"
                    checked={makeAvailable}
                    onChange={(e) => setMakeAvailable(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                />
                Werken terug te koop zetten
            </label>
            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant="destructive"
                    disabled={isBusy}
                    onClick={() => showWarning(`Zeker? ${formatPrice(total)} wordt terugbetaald. Dit kan niet ongedaan gemaakt worden.`, cancel)}
                >
                    {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                    Annuleren en terugbetalen
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setOpen(false)} disabled={isBusy}>
                    Terug
                </Button>
            </div>
        </div>
    )
}
