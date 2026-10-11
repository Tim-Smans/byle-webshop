"use client"

import { useState } from "react"
import { CheckCircle2, Clock, Loader2, PackageCheck, Store, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFeedback } from "@/lib/context/feedback-context"
import { markOrderDelivered, markOrderShipped } from "@/app/admin/bestellingen/actions"

interface Props {
    orderId: string
    status: string
    shippingMethod: "ship" | "pickup"
    today: string
    withdrawalLastDay: string | null
    withdrawalLastDayLabel: string | null
    withdrawalOpen: boolean
}

// One clear card with the next thing to do for this order
export default function OrderNextStep(props: Props) {
    const { status, shippingMethod } = props

    if (status === "paid" && shippingMethod === "ship") return <ShipStep {...props} />
    if (status === "paid" && shippingMethod === "pickup") return <DeliveredStep {...props} pickup />
    if (status === "shipped") return <DeliveredStep {...props} pickup={false} />

    if (status === "delivered" || status === "completed") {
        return (
            <StepCard icon={<CheckCircle2 size={20} />} title="Geleverd" tone="done">
                {props.withdrawalLastDayLabel && (
                    <p className="text-sm text-muted-foreground">
                        {props.withdrawalOpen
                            ? <>De klant kan nog herroepen tot en met <strong>{props.withdrawalLastDayLabel}</strong>.</>
                            : <>De herroepingstermijn liep af op {props.withdrawalLastDayLabel}. Deze bestelling is afgerond.</>}
                    </p>
                )}
            </StepCard>
        )
    }

    if (status === "pending_payment") {
        return (
            <StepCard icon={<Clock size={20} />} title="Wacht op betaling">
                <p className="text-sm text-muted-foreground">
                    De klant is aan het betalen. De werken zijn tijdelijk gereserveerd. Er hoeft niets te gebeuren.
                </p>
            </StepCard>
        )
    }

    return null
}

function StepCard({
    icon,
    title,
    tone = "todo",
    children,
}: {
    icon: React.ReactNode
    title: string
    tone?: "todo" | "done"
    children: React.ReactNode
}) {
    return (
        <section className={`rounded-lg border p-5 ${tone === "todo" ? "border-primary/30 bg-primary/5" : "border-border bg-card"}`}>
            <div className={`flex items-center gap-2 mb-3 font-medium ${tone === "todo" ? "text-primary" : "text-emerald-800"}`}>
                {icon}
                {title}
            </div>
            {children}
        </section>
    )
}

function ShipStep({ orderId }: Props) {
    const { showWarning, showSuccess, showError } = useFeedback()
    const [trackingUrl, setTrackingUrl] = useState("")
    const [notifyCustomer, setNotifyCustomer] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const ship = async () => {
        setIsSaving(true)
        try {
            const { emailError } = await markOrderShipped(orderId, { trackingUrl, notifyCustomer })
            if (emailError) showError(`Aangeduid als verzonden, maar de e-mail naar de klant lukte niet: ${emailError}`)
            else showSuccess(notifyCustomer ? "Verzonden! De klant heeft een e-mail gekregen." : "Aangeduid als verzonden.")
        } catch (err) {
            showError(err instanceof Error ? err.message : "Onbekende fout")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <StepCard icon={<Truck size={20} />} title="Volgende stap: inpakken en verzenden">
            <div className="space-y-3">
                <label className="block text-sm">
                    <span className="block mb-1">Trackinglink (optioneel)</span>
                    <Input
                        type="url"
                        placeholder="https://…"
                        value={trackingUrl}
                        onChange={(e) => setTrackingUrl(e.target.value)}
                        disabled={isSaving}
                    />
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                        type="checkbox"
                        checked={notifyCustomer}
                        onChange={(e) => setNotifyCustomer(e.target.checked)}
                        className="h-4 w-4 accent-primary"
                    />
                    Klant een e-mail sturen dat het werk onderweg is
                </label>
                <Button
                    onClick={() => showWarning("Deze bestelling aanduiden als verzonden?", ship)}
                    disabled={isSaving}
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Truck className="h-4 w-4" />}
                    Markeer als verzonden
                </Button>
            </div>
        </StepCard>
    )
}

function DeliveredStep({ orderId, today, pickup }: Props & { pickup: boolean }) {
    const { showWarning, showSuccess, showError } = useFeedback()
    const [deliveredOn, setDeliveredOn] = useState(today)
    const [isSaving, setIsSaving] = useState(false)

    const deliver = async () => {
        setIsSaving(true)
        try {
            await markOrderDelivered(orderId, deliveredOn)
            showSuccess(pickup ? "Aangeduid als afgehaald." : "Aangeduid als geleverd.")
        } catch (err) {
            showError(err instanceof Error ? err.message : "Onbekende fout")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <StepCard
            icon={pickup ? <Store size={20} /> : <PackageCheck size={20} />}
            title={pickup ? "Volgende stap: laten afhalen" : "Volgende stap: levering bevestigen"}
        >
            <p className="text-sm text-muted-foreground mb-3">
                {pickup
                    ? "Spreek een moment af met de klant. Duid daarna aan op welke dag het werk werd afgehaald."
                    : "Kijk in de track & trace op welke dag het pakket werd afgeleverd."}{" "}
                Vanaf de dag erna loopt de bedenktijd van 14 dagen.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                <label className="block text-sm">
                    <span className="block mb-1">{pickup ? "Afgehaald op" : "Geleverd op"}</span>
                    <Input
                        type="date"
                        max={today}
                        value={deliveredOn}
                        onChange={(e) => setDeliveredOn(e.target.value)}
                        disabled={isSaving}
                        className="w-44"
                    />
                </label>
                <Button
                    onClick={() =>
                        showWarning(
                            pickup ? "Aanduiden als afgehaald op deze dag?" : "Aanduiden als geleverd op deze dag?",
                            deliver
                        )
                    }
                    disabled={isSaving || !deliveredOn}
                >
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {pickup ? "Markeer als afgehaald" : "Markeer als geleverd"}
                </Button>
            </div>
        </StepCard>
    )
}
