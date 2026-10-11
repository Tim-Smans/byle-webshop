"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { formatPrice } from "@/lib/utils"
import CustomerCancelOrderButton from "@/components/checkout/cancel-order-button"
import {
    lookupOrderForWithdrawal,
    submitWithdrawal,
    type LookupResult,
    type SubmitResult,
} from "@/app/herroepen/actions"

interface Props {
    initial: { name: string; email: string; orderNumber: string; token: string }
}

type FoundOrder = Extract<LookupResult, { ok: true }>
type Confirmation = Extract<SubmitResult, { ok: true }>

// Step 1: identify the order. Step 2: choose works and confirm.
// Step 3: confirmation (also sent by e-mail).
export default function WithdrawalFlow({ initial }: Props) {
    const [form, setForm] = useState({ ...initial, website: "" })
    const [order, setOrder] = useState<FoundOrder | null>(null)
    const [selected, setSelected] = useState<string[]>([])
    const [reason, setReason] = useState("")
    const [confirmation, setConfirmation] = useState<Confirmation | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [cancellable, setCancellable] = useState<{ orderNumber: string } | null>(null)
    const [isBusy, setIsBusy] = useState(false)

    const update = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

    const findOrder = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsBusy(true)
        setMessage(null)
        setCancellable(null)
        try {
            const result = await lookupOrderForWithdrawal(form)
            if (result.ok) {
                setOrder(result)
                setSelected(result.items.map((item) => item.id))
            } else {
                setMessage(result.message)
                setCancellable(result.canCancel ?? null)
            }
        } catch {
            setMessage("Er ging iets mis. Controleer je internetverbinding en probeer opnieuw.")
        }
        setIsBusy(false)
    }

    const confirm = async () => {
        setIsBusy(true)
        setMessage(null)
        try {
            const result = await submitWithdrawal({ ...form, reason, orderItemIds: selected })
            if (result.ok) setConfirmation(result)
            else setMessage(result.message)
        } catch {
            setMessage("Er ging iets mis. Controleer je internetverbinding en probeer opnieuw.")
        }
        setIsBusy(false)
    }

    if (confirmation) {
        return (
            <div role="status" className="bg-card border border-border rounded-lg p-8 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-emerald-700" />
                <h2 className="text-2xl font-light mb-3">Je herroeping is geregistreerd</h2>
                <p className="text-muted-foreground mb-4">
                    Ontvangen op <strong>{confirmation.submittedAtLabel}</strong> voor bestelling{" "}
                    <strong>{confirmation.orderNumber}</strong>: {confirmation.itemTitles.join(", ")}.
                </p>
                <p className="text-muted-foreground mb-4">
                    {confirmation.emailSent
                        ? "Je krijgt een bevestiging per e-mail met de instructies om het werk terug te sturen."
                        : "Je herroeping is geldig, maar de bevestigingsmail kon niet verstuurd worden. Maak een schermafdruk van deze pagina; ik neem contact met je op."}
                </p>
                <p className="text-sm text-muted-foreground">
                    Stuur het werk binnen 14 dagen zorgvuldig verpakt terug naar Art by Lé, Hei-Ende 102,
                    2340 Vlimmeren (Beerse). Je krijgt je geld terug binnen 14 dagen na je herroeping.
                </p>
            </div>
        )
    }

    if (order) {
        const total = order.items.filter((item) => selected.includes(item.id)).reduce((sum, item) => sum + item.price, 0)

        return (
            <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                            Bestelling {order.orderNumber}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {order.lastDayLabel
                                ? <>Je kan herroepen tot en met {order.lastDayLabel}.</>
                                : <>Je werk is nog niet geleverd; je kan nu al herroepen.</>}
                        </p>
                    </div>

                    <fieldset className="space-y-3">
                        <legend className="text-sm mb-2">Welke werken wil je herroepen?</legend>
                        {order.items.map((item) => (
                            <label key={item.id} className="flex items-center gap-3 rounded-md border border-border p-3 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 accent-primary"
                                    checked={selected.includes(item.id)}
                                    onChange={(e) =>
                                        setSelected((prev) =>
                                            e.target.checked ? [...prev, item.id] : prev.filter((id) => id !== item.id)
                                        )
                                    }
                                />
                                <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded bg-muted">
                                    {item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                                </div>
                                <span className="flex-1 text-sm">
                                    {item.title}
                                    {item.dimensions && <span className="block text-muted-foreground">{item.dimensions}</span>}
                                </span>
                                <span className="text-sm">{formatPrice(item.price)}</span>
                            </label>
                        ))}
                    </fieldset>

                    <label className="block text-sm">
                        <span className="block mb-1">Reden (optioneel, je hoeft geen reden op te geven)</span>
                        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} disabled={isBusy} />
                    </label>
                </div>

                <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground space-y-1">
                    <p><strong className="text-foreground">Naam:</strong> {form.name}</p>
                    <p><strong className="text-foreground">E-mail:</strong> {form.email}</p>
                    <p><strong className="text-foreground">Aankoopbedrag van de gekozen werken:</strong> {formatPrice(total)}</p>
                </div>

                {message && <ErrorMessage message={message} />}

                <div className="flex flex-col sm:flex-row gap-3">
                    <Button onClick={confirm} disabled={isBusy || selected.length === 0} className="py-6 text-base">
                        {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                        Herroeping bevestigen
                    </Button>
                    <Button variant="outline" onClick={() => setOrder(null)} disabled={isBusy} className="py-6">
                        Terug
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={findOrder} noValidate className="bg-card border border-border rounded-lg p-6 space-y-4">
            <label className="block text-sm">
                <span className="block mb-1">Naam</span>
                <Input autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} disabled={isBusy} />
            </label>
            <label className="block text-sm">
                <span className="block mb-1">E-mailadres waarmee je bestelde</span>
                <Input type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} disabled={isBusy} />
            </label>
            <label className="block text-sm">
                <span className="block mb-1">Bestelnummer</span>
                <Input placeholder="ABL-2026-0001" value={form.orderNumber} onChange={(e) => update("orderNumber", e.target.value)} disabled={isBusy} />
                <span className="block mt-1 text-xs text-muted-foreground">Je vindt het in je bevestigingsmail.</span>
            </label>

            {/* Honeypot, hidden from people */}
            <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
                <input tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} />
            </div>

            {cancellable ? (
                <div className="space-y-3">
                    <p className="rounded-md border border-border bg-muted/40 p-3 text-sm">{message}</p>
                    <CustomerCancelOrderButton
                        orderNumber={cancellable.orderNumber}
                        token={form.token || undefined}
                        email={form.email}
                    />
                </div>
            ) : (
                message && <ErrorMessage message={message} />
            )}

            <Button type="submit" disabled={isBusy} className="w-full py-6 text-base">
                {isBusy && <Loader2 className="h-4 w-4 animate-spin" />}
                Bestelling zoeken
            </Button>
            <p className="text-xs text-muted-foreground text-center">
                In de volgende stap kies je de werken en bevestig je je herroeping.{" "}
                <Link href="/contact" className="underline underline-offset-4">Hulp nodig?</Link>
            </p>
        </form>
    )
}

function ErrorMessage({ message }: { message: string }) {
    return (
        <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            {message}
        </div>
    )
}
