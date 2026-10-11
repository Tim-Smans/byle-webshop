"use client"

import { useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useFeedback } from "@/lib/context/feedback-context"
import { refreshRefundStatusesAction, syncPaymentsAction } from "@/app/admin/mollie/actions"

export function SyncPaymentsButton({ paymentIds }: { paymentIds: string[] }) {
    const { showSuccess, showError } = useFeedback()
    const [isBusy, setIsBusy] = useState(false)

    const run = async () => {
        setIsBusy(true)
        try {
            const { synced, failed } = await syncPaymentsAction(paymentIds)
            if (failed.length) showError(`${synced} gesynchroniseerd, ${failed.length} mislukt: ${failed.join(", ")}`)
            else showSuccess(`${synced} betaling${synced === 1 ? "" : "en"} gesynchroniseerd. Facturen en e-mails zijn verstuurd.`)
        } catch (err) {
            showError(err instanceof Error ? err.message : "Synchroniseren mislukt")
        } finally {
            setIsBusy(false)
        }
    }

    return (
        <Button size="sm" onClick={run} disabled={isBusy}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Nu synchroniseren
        </Button>
    )
}

export function RefreshRefundsButton() {
    const { showSuccess, showError } = useFeedback()
    const [isBusy, setIsBusy] = useState(false)

    const run = async () => {
        setIsBusy(true)
        try {
            const { updated } = await refreshRefundStatusesAction()
            showSuccess(updated === 0 ? "Alle terugbetalingen waren al up-to-date." : `${updated} terugbetaling${updated === 1 ? "" : "en"} bijgewerkt.`)
        } catch (err) {
            showError(err instanceof Error ? err.message : "Bijwerken mislukt")
        } finally {
            setIsBusy(false)
        }
    }

    return (
        <Button size="sm" variant="outline" onClick={run} disabled={isBusy}>
            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Statussen bijwerken
        </Button>
    )
}
