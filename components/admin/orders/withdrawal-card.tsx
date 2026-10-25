"use client"

import { useState } from "react"
import { Loader2, PackageOpen, RotateCcw, Undo2, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useFeedback } from "@/lib/context/feedback-context"
import { formatPrice } from "@/lib/utils"
import { markReturnReceived, refundWithdrawalAction, rejectWithdrawal } from "@/app/admin/herroepingen/actions"

const STATUS_LABELS: Record<string, string> = {
    registered: "Wacht op retour",
    return_received: "Retour ontvangen – terug te betalen",
    refunded: "Terugbetaald",
    rejected: "Afgewezen",
}

interface Props {
    withdrawal: {
        id: string
        name: string
        email: string
        reason: string | null
        status: string
        adminNote: string | null
        submittedAtLabel: string
        refundDeadlineLabel: string
        refundDeadlinePassed: boolean
        refundedAtLabel: string | null
        items: { title: string; price: number }[]
        refundAmount: number
        includesShipping: boolean
    }
}

export default function WithdrawalCard({ withdrawal }: Props) {
    const { showWarning, showSuccess, showError } = useFeedback()
    const [makeAvailable, setMakeAvailable] = useState(true)
    const [rejecting, setRejecting] = useState(false)
    const [rejectNote, setRejectNote] = useState("")
    const [isBusy, setIsBusy] = useState(false)

    const isOpen = withdrawal.status === "registered" || withdrawal.status === "return_received"

    const run = async (action: () => Promise<void>) => {
        setIsBusy(true)
        try {
            await action()
        } catch (err) {
            showError(err instanceof Error ? err.message : "Onbekende fout")
        } finally {
            setIsBusy(false)
        }
    }

    const refund = () =>
        run(async () => {
            const result = await refundWithdrawalAction(withdrawal.id, makeAvailable)
            const extra = result.warnings.length ? ` Let op: ${result.warnings.join(" ")}` : ""
            showSuccess(`${formatPrice(result.amount)} terugbetaald. De klant kreeg een e-mail.${extra}`)
        })

    return (
        <section className={`rounded-lg border p-5 ${isOpen ? "border-rose-300 bg-rose-50/60" : "border-border bg-card"}`}>
            <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="flex items-center gap-2 font-medium">
                    <RotateCcw size={18} />
                    Herroeping
                </h2>
                <span className="text-xs rounded-full bg-background border border-border px-2.5 py-0.5">
                    {STATUS_LABELS[withdrawal.status] ?? withdrawal.status}
                </span>
            </div>

            <div className="text-sm space-y-1 mb-4">
                <p>
                    Ontvangen op {withdrawal.submittedAtLabel} van {withdrawal.name} ({withdrawal.email})
                </p>
                <ul className="list-disc pl-5">
                    {withdrawal.items.map((item, index) => (
                        <li key={index}>{item.title} – {formatPrice(item.price)}</li>
                    ))}
                </ul>
                {withdrawal.reason && <p className="text-muted-foreground">Reden: {withdrawal.reason}</p>}
                {withdrawal.status === "refunded" && withdrawal.refundedAtLabel && (
                    <p className="text-emerald-800">Terugbetaald op {withdrawal.refundedAtLabel}.</p>
                )}
                {withdrawal.status === "rejected" && withdrawal.adminNote && (
                    <p className="text-muted-foreground">Afgewezen: {withdrawal.adminNote}</p>
                )}
            </div>

            {isOpen && (
                <div className="space-y-4">
                    <p className={`text-sm ${withdrawal.refundDeadlinePassed ? "text-red-700 font-medium" : "text-muted-foreground"}`}>
                        Uiterlijk terugbetalen op {withdrawal.refundDeadlineLabel}
                        {withdrawal.refundDeadlinePassed && " – deze termijn is verstreken!"}. Je mag wachten tot het werk
                        terug is of de klant een verzendbewijs stuurt.
                    </p>

                    {withdrawal.status === "registered" && (
                        <Button
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => showWarning("Heb je het werk terug ontvangen en is het in orde?", () => run(async () => {
                                await markReturnReceived(withdrawal.id)
                                showSuccess("Retour aangeduid als ontvangen.")
                            }))}
                        >
                            <PackageOpen className="h-4 w-4" />
                            Retour ontvangen
                        </Button>
                    )}

                    <div className="rounded-md border border-border bg-background p-4 space-y-3">
                        <p className="text-sm">
                            Terug te betalen: <strong>{formatPrice(withdrawal.refundAmount)}</strong>
                            {withdrawal.includesShipping && <span className="text-muted-foreground"> (incl. oorspronkelijke verzendkosten)</span>}
                        </p>
                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                                type="checkbox"
                                checked={makeAvailable}
                                onChange={(e) => setMakeAvailable(e.target.checked)}
                                className="h-4 w-4 accent-primary"
                            />
                            Werk{withdrawal.items.length === 1 ? "" : "en"} terug te koop zetten
                        </label>
                        <Button
                            disabled={isBusy}
                            onClick={() => showWarning(`${formatPrice(withdrawal.refundAmount)} terugbetalen via Mollie? Dit kan niet ongedaan gemaakt worden.`, refund)}
                        >
                            {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Undo2 className="h-4 w-4" />}
                            Terugbetalen via Mollie
                        </Button>
                    </div>

                    {rejecting ? (
                        <div className="space-y-2">
                            <Textarea
                                rows={2}
                                placeholder="Reden, bv. buiten de herroepingstermijn"
                                value={rejectNote}
                                onChange={(e) => setRejectNote(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={isBusy}
                                    onClick={() => run(async () => {
                                        await rejectWithdrawal(withdrawal.id, rejectNote)
                                        showSuccess("Herroeping afgewezen. Laat de klant persoonlijk weten waarom.")
                                    })}
                                >
                                    Afwijzen
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setRejecting(false)}>Annuleren</Button>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={() => setRejecting(true)}
                            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-700"
                        >
                            <XCircle size={12} />
                            Herroeping afwijzen
                        </button>
                    )}
                </div>
            )}
        </section>
    )
}
