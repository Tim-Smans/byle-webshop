"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ExternalLink, Search } from "lucide-react"
import type { MolliePaymentRow } from "@/lib/mollie/dashboard-data"
import { methodLabel, PAYMENT_STATUS } from "@/lib/mollie/labels"
import { formatPrice } from "@/lib/utils"
import StatusPill from "./status-pill"

const dateTime = new Intl.DateTimeFormat("nl-BE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Brussels" })

const FILTERS = [
    { key: "all", label: "Alle" },
    { key: "paid", label: "Betaald" },
    { key: "busy", label: "Bezig", statuses: ["open", "pending", "authorized"] },
    { key: "unfinished", label: "Niet afgerond", statuses: ["expired", "canceled"] },
    { key: "failed", label: "Mislukt" },
    { key: "refunded", label: "Met terugbetaling" },
] as const

type FilterKey = (typeof FILTERS)[number]["key"]

export default function PaymentsTable({ payments }: { payments: MolliePaymentRow[] }) {
    const [filter, setFilter] = useState<FilterKey>("all")
    const [query, setQuery] = useState("")

    const visible = useMemo(() => {
        const term = query.trim().toLowerCase()
        return payments.filter((payment) => {
            const matchesFilter =
                filter === "all" ||
                (filter === "refunded" ? payment.amountRefunded > 0 :
                    filter === "busy" || filter === "unfinished"
                        ? (FILTERS.find((f) => f.key === filter) as { statuses: readonly string[] }).statuses.includes(payment.status)
                        : payment.status === filter)
            const matchesQuery =
                !term ||
                [payment.id, payment.description, payment.orderNumber, payment.order?.orderNumber, payment.methodDetail]
                    .some((value) => value?.toLowerCase().includes(term))
            return matchesFilter && matchesQuery
        })
    }, [payments, filter, query])

    const count = (key: FilterKey) =>
        key === "all" ? payments.length :
            key === "refunded" ? payments.filter((p) => p.amountRefunded > 0).length :
                key === "busy" || key === "unfinished"
                    ? payments.filter((p) => (FILTERS.find((f) => f.key === key) as { statuses: readonly string[] }).statuses.includes(p.status)).length
                    : payments.filter((p) => p.status === key).length

    return (
        <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2" role="group" aria-label="Filter op status">
                    {FILTERS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => setFilter(item.key)}
                            aria-pressed={filter === item.key}
                            className={`rounded-full border px-3 py-1 text-sm transition-colors ${filter === item.key
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border hover:bg-card"
                                }`}
                        >
                            {item.label} <span className="tabular-nums opacity-70">{count(item.key)}</span>
                        </button>
                    ))}
                </div>
                <label className="relative block lg:w-72">
                    <span className="sr-only">Zoek betalingen</span>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Zoek op bestelnummer, id, naam…"
                        className="w-full rounded-lg border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </label>
            </div>

            {visible.length === 0 ? (
                <p className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
                    Geen betalingen voor deze filter.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-lg border border-border bg-card">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                                <th className="px-4 py-3 font-semibold">Datum</th>
                                <th className="px-4 py-3 font-semibold">Bestelling</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Methode</th>
                                <th className="px-4 py-3 font-semibold text-right">Bedrag</th>
                                <th className="px-4 py-3 font-semibold text-right">Terugbetaald</th>
                                <th className="px-4 py-3 font-semibold">Mollie</th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((payment) => {
                                const status = PAYMENT_STATUS[payment.status] ?? { label: payment.status, tone: "neutral" as const }
                                return (
                                    <tr key={payment.id} className="border-b border-border last:border-0 align-top">
                                        <td className="px-4 py-3 whitespace-nowrap tabular-nums text-muted-foreground">
                                            {dateTime.format(new Date(payment.createdAt))}
                                        </td>
                                        <td className="px-4 py-3">
                                            {payment.order ? (
                                                <Link href={`/admin/bestellingen/${payment.order.id}`} className="font-medium hover:underline underline-offset-4">
                                                    {payment.order.orderNumber}
                                                </Link>
                                            ) : (
                                                <span className="text-muted-foreground" title="Deze betaling hoort niet bij een bestelling in deze webshop (bv. een andere omgeving)">
                                                    {payment.orderNumber ?? "–"}
                                                </span>
                                            )}
                                            {payment.methodDetail && (
                                                <span className="block text-xs text-muted-foreground">{payment.methodDetail}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusPill label={status.label} tone={status.tone} />
                                            {payment.amountChargedBack > 0 && (
                                                <span className="block mt-1">
                                                    <StatusPill label="Chargeback" tone="bad" />
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {methodLabel(payment.method)}
                                            {payment.countryCode && <span className="text-muted-foreground"> · {payment.countryCode}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap font-medium">
                                            {formatPrice(payment.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                                            {payment.amountRefunded > 0 ? (
                                                <span className="text-red-800">– {formatPrice(payment.amountRefunded)}</span>
                                            ) : (
                                                <span className="text-muted-foreground">–</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {payment.dashboardUrl ? (
                                                <a
                                                    href={payment.dashboardUrl}
                                                    target="_blank"
                                                    rel="noopener"
                                                    className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    {payment.id} <ExternalLink size={11} />
                                                </a>
                                            ) : (
                                                <span className="font-mono text-xs text-muted-foreground">{payment.id}</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
