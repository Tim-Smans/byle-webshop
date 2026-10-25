import { isAdmin } from "@/lib/auth/admin-auth"
import { listAdminOrders, ORDER_TABS, parseOrderTab, type OrderTab } from "@/lib/orders/admin-queries"
import OrderStatusBadge from "@/components/admin/orders/order-status-badge"
import { formatPrice } from "@/lib/utils"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, Package, Search, Store, Truck } from "lucide-react"

const dateFormatter = new Intl.DateTimeFormat("nl-BE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Brussels",
})

export default async function OrdersAdminPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    const params = await searchParams
    const tab = parseOrderTab(params.tab)
    const search = typeof params.q === "string" ? params.q : ""

    const orders = await listAdminOrders(tab, search)

    const tabHref = (key: OrderTab) => {
        const query = new URLSearchParams({ tab: key })
        if (search) query.set("q", search)
        return `/admin/bestellingen?${query}`
    }

    return (
        <div className="min-h-screen px-6 pt-28 pb-10 max-w-5xl mx-auto">
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                Terug naar dashboard
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-light tracking-tight text-primary mb-1">Bestellingen</h1>
                <p className="text-muted-foreground text-sm">
                    Klik op een bestelling om ze af te handelen.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {(Object.keys(ORDER_TABS) as OrderTab[]).map((key) => (
                    <Link
                        key={key}
                        href={tabHref(key)}
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${key === tab
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-card"
                            }`}
                    >
                        {ORDER_TABS[key].label}
                    </Link>
                ))}
            </div>

            {/* Search: plain GET form, no client JS needed */}
            <form action="/admin/bestellingen" className="relative mb-6">
                <input type="hidden" name="tab" value={tab} />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    name="q"
                    defaultValue={search}
                    placeholder="Zoek op bestelnummer, naam of e-mail…"
                    className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </form>

            {orders.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">
                    <Package size={20} className="mx-auto mb-3 opacity-60" />
                    {tab === "te-verzenden" && !search
                        ? "Niets klaar te maken. Alle betaalde bestellingen zijn verwerkt."
                        : "Geen bestellingen gevonden"}
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
                    {orders.map((order) => (
                        <Link
                            key={order.id}
                            href={`/admin/bestellingen/${order.id}`}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-4 hover:bg-muted/40 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-foreground">{order.orderNumber}</span>
                                    <OrderStatusBadge status={order.status} />
                                </div>
                                <div className="text-sm text-muted-foreground truncate">
                                    {order.customerName} · {order.customerEmail}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground sm:justify-end">
                                <span className="inline-flex items-center gap-1.5" title={order.shippingMethod === "pickup" ? "Afhalen" : "Verzenden"}>
                                    {order.shippingMethod === "pickup" ? <Store size={14} /> : <Truck size={14} />}
                                    {order.itemCount} werk{order.itemCount === 1 ? "" : "en"}
                                </span>
                                <span className="whitespace-nowrap">{dateFormatter.format(new Date(order.createdAt))}</span>
                                <span className="font-medium text-foreground whitespace-nowrap w-24 text-right">
                                    {formatPrice(order.total)}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
