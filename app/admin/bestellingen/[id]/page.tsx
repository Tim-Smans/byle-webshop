import { isAdmin } from "@/lib/auth/admin-auth"
import { getAdminOrder } from "@/lib/orders/admin-queries"
import {
    daysUntilRefundDeadline,
    formatDateString,
    getRefundDeadline,
    getWithdrawalLastDay,
    isWithinWithdrawalPeriod,
    toBrusselsDateString,
} from "@/lib/orders/withdrawal-period"
import { getCountryName } from "@/lib/shop/countries"
import { formatPrice } from "@/lib/utils"
import OrderStatusBadge from "@/components/admin/orders/order-status-badge"
import OrderNextStep from "@/components/admin/orders/order-next-step"
import OrderNoteForm from "@/components/admin/orders/order-note-form"
import ResendConfirmationButton from "@/components/admin/orders/resend-confirmation-button"
import WithdrawalCard from "@/components/admin/orders/withdrawal-card"
import CancelOrderButton from "@/components/admin/orders/cancel-order-button"
import Image from "next/image"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { AlertTriangle, ArrowLeft, ExternalLink, FileText } from "lucide-react"

const dateTime = new Intl.DateTimeFormat("nl-BE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Brussels",
})

const dateOnly = new Intl.DateTimeFormat("nl-BE", { dateStyle: "long", timeZone: "Europe/Brussels" })

const ACTOR_LABELS: Record<string, string> = {
    system: "Systeem",
    admin: "Jij",
    customer: "Klant",
    mollie: "Mollie",
}

export default async function OrderAdminDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    const { id } = await params
    const order = await getAdminOrder(id)
    if (!order) notFound()

    const hasStockConflict = order.events.some((event) => event.type === "stock_conflict")
    const activeWithdrawnIds = new Set(
        order.withdrawals.filter((w) => w.status !== "rejected").flatMap((w) => w.orderItemIds)
    )
    const canCancel =
        ["paid", "shipped", "delivered", "completed"].includes(order.status) &&
        order.refunds.every((refund) => refund.status === "failed") &&
        !order.withdrawals.some((w) => w.status === "registered" || w.status === "return_received")
    const refundedTotal = order.refunds
        .filter((refund) => refund.status !== "failed")
        .reduce((sum, refund) => sum + refund.amount, 0)
    const withdrawalLastDay = getWithdrawalLastDay(order.deliveredAt)
    const billingAddress = order.billingSameAsShipping
        ? null
        : [order.billingStreet, [order.billingPostalCode, order.billingCity].filter(Boolean).join(" "), order.billingCountryCode && getCountryName(order.billingCountryCode)]
            .filter(Boolean)

    return (
        <div className="min-h-screen px-6 pt-28 pb-10 max-w-5xl mx-auto">
            <Link
                href="/admin/bestellingen"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                Alle bestellingen
            </Link>

            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h1 className="text-3xl font-light tracking-tight text-primary">{order.orderNumber}</h1>
                        <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Besteld op {dateTime.format(new Date(order.createdAt))}
                        {order.paidAt && <> · betaald op {dateTime.format(new Date(order.paidAt))}</>}
                    </p>
                </div>
                <p className="text-2xl font-light">{formatPrice(order.total)}</p>
            </div>

            {hasStockConflict && (
                <div className="mb-6 flex gap-3 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
                    <AlertTriangle className="h-5 w-5 shrink-0" />
                    <div>
                        <p className="font-medium">Terugbetaling nodig</p>
                        <p>
                            Deze betaling kwam binnen nadat de reservatie verlopen was, en een of meer werken waren intussen
                            aan iemand anders verkocht. De klant kreeg geen bevestiging. Neem contact op en betaal terug.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
                <div className="space-y-6">
                    {order.withdrawals.map((withdrawal) => {
                        const items = order.items.filter((item) => withdrawal.orderItemIds.includes(item.id))
                        const refundDeadline = getRefundDeadline(withdrawal.submittedAt)
                        const includesShipping = order.shippingCost > 0 && order.items.every((item) => activeWithdrawnIds.has(item.id))
                        return (
                            <WithdrawalCard
                                key={withdrawal.id}
                                withdrawal={{
                                    id: withdrawal.id,
                                    name: withdrawal.name,
                                    email: withdrawal.email,
                                    reason: withdrawal.reason,
                                    status: withdrawal.status,
                                    adminNote: withdrawal.adminNote,
                                    submittedAtLabel: dateTime.format(new Date(withdrawal.submittedAt)),
                                    refundDeadlineLabel: dateOnly.format(refundDeadline),
                                    refundDeadlinePassed: daysUntilRefundDeadline(withdrawal.submittedAt) < 0,
                                    refundedAtLabel: withdrawal.refundedAt ? dateOnly.format(new Date(withdrawal.refundedAt)) : null,
                                    items: items.map((item) => ({ title: item.title, price: item.price })),
                                    refundAmount: items.reduce((sum, item) => sum + item.price, 0) + (includesShipping ? order.shippingCost : 0),
                                    includesShipping,
                                }}
                            />
                        )
                    })}

                    <OrderNextStep
                        orderId={order.id}
                        status={order.status}
                        shippingMethod={order.shippingMethod}
                        today={toBrusselsDateString(new Date())}
                        withdrawalLastDay={withdrawalLastDay}
                        withdrawalLastDayLabel={withdrawalLastDay ? formatDateString(withdrawalLastDay) : null}
                        withdrawalOpen={isWithinWithdrawalPeriod(order.deliveredAt)}
                    />

                    {/* Items */}
                    <section className="bg-card border border-border rounded-lg p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Werken</h2>
                        <ul className="space-y-4">
                            {order.items.map((item) => (
                                <li key={item.id} className="flex gap-3">
                                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                                        {item.imageUrl && (
                                            <Image src={item.imageUrl} alt={item.title} fill sizes="64px" className="object-cover" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 text-sm">
                                        {item.artPieceId ? (
                                            <Link href={`/art/${item.artPieceId}`} className="font-medium hover:underline underline-offset-4">
                                                {item.title}
                                            </Link>
                                        ) : (
                                            <p className="font-medium">{item.title}</p>
                                        )}
                                        {item.dimensions && <p className="text-muted-foreground">{item.dimensions}</p>}
                                        {!item.withdrawalApplicable && (
                                            <p className="text-xs text-muted-foreground">Maatwerk – geen herroepingsrecht</p>
                                        )}
                                    </div>
                                    <p className="text-sm whitespace-nowrap">{formatPrice(item.price)}</p>
                                </li>
                            ))}
                        </ul>
                        <dl className="mt-4 pt-4 border-t border-border space-y-1 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Subtotaal</dt>
                                <dd>{formatPrice(order.subtotal)}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">{order.shippingMethod === "pickup" ? "Afhalen" : "Verzending"}</dt>
                                <dd>{formatPrice(order.shippingCost)}</dd>
                            </div>
                            <div className="flex justify-between font-medium">
                                <dt>Totaal</dt>
                                <dd>{formatPrice(order.total)}</dd>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <dt>Waarvan btw</dt>
                                <dd>{formatPrice(order.vatAmount)}</dd>
                            </div>
                            {refundedTotal > 0 && (
                                <div className="flex justify-between text-rose-800">
                                    <dt>Terugbetaald</dt>
                                    <dd>– {formatPrice(refundedTotal)}</dd>
                                </div>
                            )}
                        </dl>
                    </section>

                    {/* Timeline */}
                    <section className="bg-card border border-border rounded-lg p-5">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Geschiedenis</h2>
                        <ol className="space-y-3">
                            {order.events.map((event) => (
                                <li key={event.id} className="flex gap-3 text-sm">
                                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${event.type === "stock_conflict" ? "bg-red-600" : "bg-primary/50"}`} />
                                    <div>
                                        <p>{event.message ?? event.type}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {dateTime.format(new Date(event.createdAt))} · {ACTOR_LABELS[event.actor] ?? event.actor}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-6">
                    <section className="bg-card border border-border rounded-lg p-5 text-sm space-y-1">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Klant</h2>
                        {order.companyName && (
                            <p className="font-medium">{order.companyName}{order.vatNumber && <span className="font-normal text-muted-foreground"> · {order.vatNumber}</span>}</p>
                        )}
                        <p className={order.companyName ? "" : "font-medium"}>{order.customerFirstName} {order.customerLastName}</p>
                        <p><a href={`mailto:${order.customerEmail}`} className="hover:underline underline-offset-4 break-all">{order.customerEmail}</a></p>
                        {order.customerPhone && <p><a href={`tel:${order.customerPhone}`} className="hover:underline underline-offset-4">{order.customerPhone}</a></p>}
                        {order.vatNumber && (
                            <p className="pt-2 text-xs text-amber-800">Bedrijfsklant: maak ook een Peppol e-factuur op in je boekhoudsoftware.</p>
                        )}
                    </section>

                    <section className="bg-card border border-border rounded-lg p-5 text-sm space-y-1">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                            {order.shippingMethod === "pickup" ? "Afhalen" : "Leveringsadres"}
                        </h2>
                        {order.shippingMethod === "pickup" ? (
                            <p>Komt afhalen in Vlimmeren</p>
                        ) : (
                            <>
                                <p>{order.shippingStreet}</p>
                                <p>{order.shippingPostalCode} {order.shippingCity}</p>
                                <p>{order.shippingCountryCode && getCountryName(order.shippingCountryCode)}</p>
                            </>
                        )}
                        {order.trackingUrl && (
                            <a href={order.trackingUrl} target="_blank" rel="noopener" className="inline-flex items-center gap-1 pt-2 hover:underline underline-offset-4">
                                Track & trace <ExternalLink size={12} />
                            </a>
                        )}
                        {billingAddress && (
                            <div className="pt-3">
                                <p className="text-xs text-muted-foreground mb-1">Factuuradres</p>
                                {billingAddress.map((line) => <p key={line}>{line}</p>)}
                            </div>
                        )}
                    </section>

                    <section className="bg-card border border-border rounded-lg p-5 text-sm space-y-3">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Documenten</h2>
                        {order.invoices.length === 0 ? (
                            <p className="text-muted-foreground">Nog geen factuur</p>
                        ) : (
                            <ul className="space-y-1">
                                {order.invoices.map((invoice) => (
                                    <li key={invoice.id}>
                                        <a href={`/api/admin/invoices/${invoice.id}`} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:underline underline-offset-4">
                                            <FileText size={14} />
                                            {invoice.type === "credit_note" ? "Creditnota" : "Factuur"} {invoice.invoiceNumber}
                                            <span className="text-muted-foreground">({formatPrice(invoice.total)})</span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {order.paidAt && <ResendConfirmationButton orderId={order.id} email={order.customerEmail} />}
                        <a
                            href={`/bestelling/${order.orderNumber}?t=${order.accessToken}`}
                            target="_blank"
                            rel="noopener"
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                        >
                            <ExternalLink size={14} />
                            Bekijk zoals de klant
                        </a>
                    </section>

                    <section className="bg-card border border-border rounded-lg p-5 text-sm space-y-2">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Betaling</h2>
                        {order.payments.map((payment) => (
                            <div key={payment.id} className="flex justify-between gap-2">
                                <span className="text-muted-foreground">{payment.method ?? "–"} · {payment.status}</span>
                                <span className="font-mono text-xs">{payment.molliePaymentId}</span>
                            </div>
                        ))}
                    </section>

                    <section className="bg-card border border-border rounded-lg p-5 text-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">Notitie</h2>
                        <OrderNoteForm orderId={order.id} initialNote={order.adminNote ?? ""} />
                    </section>

                    {canCancel && (
                        <CancelOrderButton orderId={order.id} total={order.total} defaultMakeAvailable={!hasStockConflict} />
                    )}
                </aside>
            </div>
        </div>
    )
}
