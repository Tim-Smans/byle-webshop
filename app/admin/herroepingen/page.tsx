import { isAdmin } from "@/lib/auth/admin-auth"
import { listAdminWithdrawals } from "@/lib/orders/admin-queries"
import { formatPrice } from "@/lib/utils"
import { daysUntilRefundDeadline } from "@/lib/orders/withdrawal-period"
import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft, RotateCcw } from "lucide-react"

const dateOnly = new Intl.DateTimeFormat("nl-BE", { dateStyle: "medium", timeZone: "Europe/Brussels" })

const STATUS_LABELS: Record<string, string> = {
    registered: "Wacht op retour",
    return_received: "Terug te betalen",
    refunded: "Terugbetaald",
    rejected: "Afgewezen",
}

export default async function WithdrawalsAdminPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    const { tab } = await searchParams
    const showOpen = tab !== "afgehandeld"
    const withdrawals = await listAdminWithdrawals(showOpen)

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
                <h1 className="text-3xl font-light tracking-tight text-primary mb-1">Herroepingen & retours</h1>
                <p className="text-muted-foreground text-sm max-w-2xl">
                    Betaal terug binnen 14 dagen na de herroeping. Je mag wachten tot het werk terug is of de klant
                    een verzendbewijs stuurt. Open een herroeping om ze af te handelen.
                </p>
            </div>

            <div className="flex gap-2 mb-6">
                {[
                    { key: "open", label: "Open", active: showOpen },
                    { key: "afgehandeld", label: "Afgehandeld", active: !showOpen },
                ].map((item) => (
                    <Link
                        key={item.key}
                        href={`/admin/herroepingen?tab=${item.key}`}
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${item.active
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border hover:bg-card"
                            }`}
                    >
                        {item.label}
                    </Link>
                ))}
            </div>

            {withdrawals.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-10 text-center text-muted-foreground text-sm">
                    <RotateCcw size={20} className="mx-auto mb-3 opacity-60" />
                    {showOpen ? "Geen openstaande herroepingen" : "Nog geen afgehandelde herroepingen"}
                </div>
            ) : (
                <div className="bg-card border border-border rounded-lg overflow-hidden divide-y divide-border">
                    {withdrawals.map((withdrawal) => {
                        const daysLeft = daysUntilRefundDeadline(withdrawal.submittedAt)
                        return (
                            <Link
                                key={withdrawal.id}
                                href={`/admin/bestellingen/${withdrawal.orderId}`}
                                className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-4 hover:bg-muted/40 transition-colors"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-medium">{withdrawal.orderNumber}</span>
                                        <span className="rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-xs">
                                            {STATUS_LABELS[withdrawal.status] ?? withdrawal.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-muted-foreground truncate">
                                        {withdrawal.name} · {withdrawal.itemTitles.join(", ")}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm sm:justify-end">
                                    <span className="text-muted-foreground whitespace-nowrap">
                                        {dateOnly.format(new Date(withdrawal.submittedAt))}
                                    </span>
                                    {showOpen && (
                                        <span className={`whitespace-nowrap ${daysLeft <= 3 ? "text-red-700 font-medium" : "text-muted-foreground"}`}>
                                            {daysLeft < 0 ? `${-daysLeft} d te laat` : `nog ${daysLeft} d`}
                                        </span>
                                    )}
                                    <span className="font-medium whitespace-nowrap w-24 text-right">{formatPrice(withdrawal.amount)}</span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
