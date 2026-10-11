import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";
import { getInvoicesForOrder } from "@/lib/invoicing/invoice-service";
import { Button } from "@/components/ui/button";
import { getLatestMolliePaymentId, getOrderForCustomer, type OrderView } from "@/lib/orders/order-queries";
import { syncMolliePayment } from "@/lib/orders/payment-sync";
import { getCountryName } from "@/lib/shop/countries";
import { DELIVERY_TIME_TEXT, PICKUP_LOCATION_TEXT } from "@/lib/shop/config";
import { formatPrice } from "@/lib/utils";
import ClearCartOnPaid from "@/components/checkout/clear-cart-on-paid";
import PaymentPendingRefresher from "@/components/checkout/payment-pending-refresher";
import ForgetPendingOrder from "@/components/checkout/forget-pending-order";
import OrderTimeline from "@/components/checkout/order-timeline";
import CustomerCancelOrderButton from "@/components/checkout/cancel-order-button";
import { buildOrderTimeline } from "@/lib/orders/timeline";
import { isWithinWithdrawalPeriod } from "@/lib/orders/withdrawal-period";

export const metadata: Metadata = {
    title: "Je bestelling | Art by Lé",
    robots: { index: false, follow: false },
};

const PAID_STATUSES = ["paid", "shipped", "delivered", "completed"];

export default async function OrderPage({
    params,
    searchParams,
}: {
    params: Promise<{ orderNumber: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { orderNumber } = await params;
    const { t } = await searchParams;
    const token = typeof t === "string" ? t : "";

    let order = await getOrderForCustomer(orderNumber, token);
    if (!order) notFound();

    // Coming back from Mollie: the webhook may not have arrived yet (and never
    // does locally), so ask Mollie directly
    if (order.status === "pending_payment") {
        const paymentId = await getLatestMolliePaymentId(order.id);
        if (paymentId) {
            try {
                await syncMolliePayment(paymentId);
                order = (await getOrderForCustomer(orderNumber, token)) ?? order;
            } catch (error) {
                console.error("[order page] payment sync failed:", error);
            }
        }
    }

    const hasInvoice = (await getInvoicesForOrder(order.id)).some((invoice) => invoice.type === "invoice");
    // Before shipping: cancel. From shipping on: withdraw (the /herroepen page
    // re-checks the period and which works are left).
    const canCancel = order.status === "paid" && !order.cancelledAt;
    const canWithdraw =
        ["shipped", "delivered", "completed"].includes(order.status) && isWithinWithdrawalPeriod(order.deliveredAt);
    const timeline = buildOrderTimeline(order, DELIVERY_TIME_TEXT);

    return (
        <main className="min-h-screen pt-32 pb-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                <StatusHeader order={order} />
                {PAID_STATUSES.includes(order.status) && (
                    <ClearCartOnPaid
                        artPieceIds={order.items.flatMap((item) => (item.artPieceId ? [item.artPieceId] : []))}
                    />
                )}
                {order.status === "pending_payment"
                    ? <PaymentPendingRefresher />
                    : <ForgetPendingOrder orderNumber={order.orderNumber} />}
                <OrderTimeline steps={timeline} />
                <OrderSummary order={order} />
                {canCancel && (
                    <div className="mt-6 text-center">
                        <CustomerCancelOrderButton
                            orderNumber={order.orderNumber}
                            token={token}
                            totalLabel={formatPrice(order.total)}
                        />
                    </div>
                )}
                {canWithdraw && (
                    <div className="mt-6 text-center">
                        <Link
                            href={`/herroepen?bestelling=${order.orderNumber}&t=${token}`}
                            className="text-sm font-sans text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                        >
                            Bestelling herroepen
                        </Link>
                    </div>
                )}
                {hasInvoice && (
                    <div className="mt-6 text-center">
                        <a
                            href={`/bestelling/${order.orderNumber}/factuur?t=${token}`}
                            target="_blank"
                            rel="noopener"
                            className="inline-flex items-center gap-2 text-sm font-sans text-muted-foreground hover:text-foreground underline underline-offset-4 transition-colors"
                        >
                            <FileText className="h-4 w-4" />
                            Factuur downloaden
                        </a>
                    </div>
                )}
            </div>
        </main>
    );
}

function StatusHeader({ order }: { order: OrderView }) {
    // Later visits: the timeline tells the story
    if (["shipped", "delivered", "completed"].includes(order.status)) {
        return (
            <div className="mb-10 text-center">
                <h1 className="text-oker text-4xl font-light tracking-tight mb-3">
                    Je bestelling {order.orderNumber}
                </h1>
                <p className="text-muted-foreground">Hieronder zie je hoe ver je bestelling staat.</p>
            </div>
        );
    }

    if (order.status === "refunded" && order.cancelledAt) {
        return (
            <div className="mb-10 text-center">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-oker text-4xl font-light tracking-tight mb-3">
                    Je bestelling is geannuleerd
                </h1>
                <p className="text-muted-foreground">
                    Het volledige bedrag werd terugbetaald met je oorspronkelijke betaalmiddel.
                </p>
            </div>
        );
    }

    if (PAID_STATUSES.includes(order.status)) {
        return (
            <div className="mb-10 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-emerald-700" />
                <h1 className="text-oker text-4xl font-light tracking-tight mb-3">
                    Bedankt voor je bestelling, {order.customerFirstName}!
                </h1>
                <p className="text-muted-foreground">
                    Je betaling is ontvangen. Je krijgt een bevestiging op <strong>{order.customerEmail}</strong>.
                </p>
                <p className="text-muted-foreground mt-2">
                    {order.shippingMethod === "pickup"
                        ? "Ik neem contact met je op om een moment af te spreken om je werk af te halen."
                        : DELIVERY_TIME_TEXT}
                </p>
            </div>
        );
    }

    if (order.status === "pending_payment") {
        return (
            <div className="mb-10 text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h1 className="text-oker text-4xl font-light tracking-tight mb-3">
                    Je betaling wordt verwerkt
                </h1>
                <p className="text-muted-foreground">
                    We wachten nog op de bevestiging van je betaling. Deze pagina vernieuwt vanzelf.
                </p>
            </div>
        );
    }

    if (order.status === "expired" || order.status === "cancelled") {
        return (
            <div className="mb-10 text-center">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-red-700" />
                <h1 className="text-oker text-4xl font-light tracking-tight mb-3">
                    Je betaling is niet gelukt
                </h1>
                <p className="text-muted-foreground mb-6">
                    De betaling werd geannuleerd of is verlopen. Er is niets aangerekend.
                    De werken staan nog in je winkelmand, zolang ze beschikbaar zijn.
                </p>
                <Button asChild>
                    <Link href="/winkelmand">Opnieuw proberen</Link>
                </Button>
            </div>
        );
    }

    // withdrawn / refunded
    return (
        <div className="mb-10 text-center">
            <h1 className="text-oker text-4xl font-light tracking-tight mb-3">
                Bestelling {order.orderNumber}
            </h1>
            <p className="text-muted-foreground">
                {order.status === "refunded"
                    ? "Deze bestelling is terugbetaald."
                    : "Deze bestelling is herroepen."}
            </p>
        </div>
    );
}

function OrderSummary({ order }: { order: OrderView }) {
    return (
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
            <div className="flex flex-wrap justify-between gap-2 text-sm font-sans">
                <span className="text-muted-foreground">Bestelnummer</span>
                <span className="font-medium">{order.orderNumber}</span>
            </div>

            <ul className="space-y-4 pt-4 border-t border-border">
                {order.items.map((item) => (
                    <li key={item.id} className="flex gap-3">
                        <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                            {item.imageUrl && (
                                <Image src={item.imageUrl} alt={item.title} fill sizes="56px" className="object-cover" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 text-sm">
                            <p className="font-medium text-foreground">{item.title}</p>
                            {item.dimensions && <p className="text-muted-foreground font-sans">{item.dimensions}</p>}
                        </div>
                        <p className="text-sm font-medium whitespace-nowrap">{formatPrice(item.price)}</p>
                    </li>
                ))}
            </ul>

            <dl className="space-y-2 pt-4 border-t border-border text-sm font-sans">
                <div className="flex justify-between">
                    <dt className="text-muted-foreground">Subtotaal</dt>
                    <dd>{formatPrice(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                    <dt className="text-muted-foreground">{order.shippingMethod === "pickup" ? "Afhalen" : "Verzending"}</dt>
                    <dd>{order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}</dd>
                </div>
                <div className="flex justify-between pt-2 border-t border-border text-base">
                    <dt className="font-medium">Totaal</dt>
                    <dd className="font-medium">{formatPrice(order.total)}</dd>
                </div>
                {order.vatAmount > 0 && (
                    <p className="text-xs text-muted-foreground">Waarvan btw: {formatPrice(order.vatAmount)}</p>
                )}
            </dl>

            <div className="pt-4 border-t border-border text-sm">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                    {order.shippingMethod === "pickup" ? "Afhalen" : "Leveringsadres"}
                </p>
                {order.shippingMethod === "pickup" ? (
                    <p>{PICKUP_LOCATION_TEXT}</p>
                ) : (
                    <address className="not-italic">
                        {order.customerFirstName} {order.customerLastName}<br />
                        {order.shippingStreet}<br />
                        {order.shippingPostalCode} {order.shippingCity}<br />
                        {order.shippingCountryCode && getCountryName(order.shippingCountryCode)}
                    </address>
                )}
            </div>
        </div>
    );
}
