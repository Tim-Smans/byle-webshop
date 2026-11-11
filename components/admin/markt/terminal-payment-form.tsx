"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, Loader2, RotateCcw, Send, Smartphone, X, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatPrice } from "@/lib/utils"
import type { TerminalPayment } from "@/lib/mollie/terminal"
import {
    cancelTerminalPaymentAction,
    getTerminalPaymentAction,
    sendToTerminalAction,
    type TerminalResult,
} from "@/app/admin/markt/actions"

const POLL_INTERVAL_MS = 2000
const WAITING_STATUSES = ["open", "pending", "authorized"]

const FINAL_STATUS: Record<string, { title: string; text: string; good: boolean }> = {
    paid: { title: "Betaald", text: "De betaling is gelukt.", good: true },
    canceled: { title: "Geannuleerd", text: "De betaling werd geannuleerd, op de terminal of hier.", good: false },
    failed: { title: "Mislukt", text: "De betaling is mislukt. Probeer opnieuw of laat de klant een andere kaart gebruiken.", good: false },
    expired: { title: "Verlopen", text: "De klant betaalde niet op tijd.", good: false },
}

export default function TerminalPaymentForm() {
    const [amount, setAmount] = useState("")
    const [description, setDescription] = useState("")
    const [payment, setPayment] = useState<TerminalPayment | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isSending, setIsSending] = useState(false)
    const [isCanceling, setIsCanceling] = useState(false)
    const [pollTick, setPollTick] = useState(0)
    // One key per payment attempt: sending twice by accident gives the same payment
    const idempotencyKey = useRef<string | null>(null)

    const isWaiting = payment !== null && WAITING_STATUSES.includes(payment.status)

    // Poll Mollie until the customer has paid, canceled or the payment expired
    useEffect(() => {
        if (!payment || !isWaiting) return
        let stopped = false
        const timer = setTimeout(async () => {
            const result = await getTerminalPaymentAction(payment.id).catch(() => null)
            if (stopped) return
            if (result && "payment" in result) setPayment(result.payment)
            // A failed check (e.g. bad reception) just retries on the next tick
            else setPollTick((tick) => tick + 1)
        }, POLL_INTERVAL_MS)
        return () => {
            stopped = true
            clearTimeout(timer)
        }
    }, [payment, isWaiting, pollTick])

    const apply = (result: TerminalResult) => {
        if ("error" in result) {
            setError(result.error)
            return false
        }
        setError(null)
        setPayment(result.payment)
        return true
    }

    const send = async (event: React.FormEvent) => {
        event.preventDefault()
        idempotencyKey.current ??= crypto.randomUUID()
        setIsSending(true)
        try {
            const result = await sendToTerminalAction(amount, description, idempotencyKey.current)
            // Mollie answered, so the next attempt is a new request
            idempotencyKey.current = null
            apply(result)
        } catch {
            // Unknown whether the payment was created: keep the key so a retry cannot charge twice
            setError("Geen verbinding met de server. Kijk je internet na en probeer opnieuw.")
        } finally {
            setIsSending(false)
        }
    }

    const cancel = async () => {
        if (!payment) return
        setIsCanceling(true)
        try {
            apply(await cancelTerminalPaymentAction(payment.id))
        } catch {
            setError("Geen verbinding met de server. Annuleer op de terminal zelf.")
        } finally {
            setIsCanceling(false)
        }
    }

    // keepValues: retry the same sale after a failed or canceled payment
    const reset = (keepValues: boolean) => {
        setPayment(null)
        setError(null)
        if (!keepValues) {
            setAmount("")
            setDescription("")
        }
    }

    if (payment) {
        const final = FINAL_STATUS[payment.status]
        return (
            <div className="rounded-lg border border-border bg-card p-6 space-y-5">
                <div className="text-center space-y-1">
                    <p className="text-4xl font-light tabular-nums">{formatPrice(payment.amount)}</p>
                    <p className="text-sm text-muted-foreground">{payment.description}</p>
                </div>

                {isWaiting || !final ? (
                    <div className="flex flex-col items-center gap-3 py-4 text-center" role="status" aria-live="polite">
                        <Smartphone className="h-10 w-10 text-primary animate-pulse" />
                        <p className="font-medium">Wachten op de klant…</p>
                        <p className="text-sm text-muted-foreground">Het bedrag staat op de terminal. Laat de klant de kaart of gsm tegen het toestel houden.</p>
                    </div>
                ) : (
                    <div
                        className={`flex flex-col items-center gap-2 rounded-lg p-5 text-center ${final.good ? "bg-emerald-50 text-emerald-900" : "bg-red-50 text-red-900"}`}
                        role="status"
                        aria-live="polite"
                    >
                        {final.good ? <CheckCircle2 className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
                        <p className="text-lg font-medium">{final.title}</p>
                        <p className="text-sm">{final.text}</p>
                        {final.good && payment.cardLabel && (
                            <p className="text-xs opacity-80">
                                {payment.cardLabel}{payment.cardNumber ? ` •••• ${payment.cardNumber}` : ""}
                            </p>
                        )}
                    </div>
                )}

                {error && <p className="text-sm text-red-700">{error}</p>}

                <div className="flex flex-col sm:flex-row gap-3">
                    {isWaiting && payment.isCancelable && (
                        <Button variant="outline" size="lg" className="flex-1" onClick={cancel} disabled={isCanceling}>
                            {isCanceling ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                            Annuleren
                        </Button>
                    )}
                    {!isWaiting && final && !final.good && (
                        <Button variant="outline" size="lg" className="flex-1" onClick={() => reset(true)}>
                            <RotateCcw className="h-4 w-4" />
                            Opnieuw proberen
                        </Button>
                    )}
                    {!isWaiting && (
                        <Button size="lg" className="flex-1" onClick={() => reset(false)}>
                            Nieuwe betaling
                        </Button>
                    )}
                </div>

                <p className="text-xs text-muted-foreground text-center font-mono">{payment.id}</p>
            </div>
        )
    }

    return (
        <form onSubmit={send} className="rounded-lg border border-border bg-card p-6 space-y-5">
            <div className="space-y-2">
                <Label htmlFor="markt-amount">Bedrag (€)</Label>
                <Input
                    id="markt-amount"
                    inputMode="decimal"
                    autoComplete="off"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => {
                        setAmount(e.target.value)
                        idempotencyKey.current = null
                    }}
                    className="h-14 text-3xl md:text-3xl font-light tabular-nums"
                    required
                    autoFocus
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="markt-description">Omschrijving</Label>
                <Input
                    id="markt-description"
                    placeholder="bv. Print 'Zomeravond' A4"
                    maxLength={255}
                    value={description}
                    onChange={(e) => {
                        setDescription(e.target.value)
                        idempotencyKey.current = null
                    }}
                    className="h-10"
                />
                <p className="text-xs text-muted-foreground">Leeg laten mag: dan wordt het &quot;Marktverkoop Art by Le&quot;.</p>
            </div>

            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}

            <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={isSending || !amount.trim()}>
                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Naar terminal sturen
            </Button>
        </form>
    )
}
