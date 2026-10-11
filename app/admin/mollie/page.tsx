import { isAdmin } from "@/lib/auth/admin-auth"
import {
    getMollieDashboardData,
    MOLLIE_PERIODS,
    parseMolliePeriod,
    type MollieDashboardData,
    type MolliePeriod,
} from "@/lib/mollie/dashboard-data"
import { methodLabel, PAYMENT_STATUS, REFUND_STATUS } from "@/lib/mollie/labels"
import { formatPrice } from "@/lib/utils"
import RevenueChart from "@/components/admin/mollie/revenue-chart"
import PaymentsTable from "@/components/admin/mollie/payments-table"
import StatusPill from "@/components/admin/mollie/status-pill"
import { RefreshRefundsButton, SyncPaymentsButton } from "@/components/admin/mollie/sync-buttons"
import Link from "next/link"
import { redirect } from "next/navigation"
import { AlertTriangle, ArrowLeft, ExternalLink, Info } from "lucide-react"

const MOLLIE_DASHBOARD_URL = "https://my.mollie.com/dashboard"
const BAR_COLOR = "#ac4e16"

const dateTime = new Intl.DateTimeFormat("nl-BE", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Brussels" })
const percent = new Intl.NumberFormat("nl-BE", { style: "percent", maximumFractionDigits: 0 })

export default async function MollieDashboardPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const admin = await isAdmin()
    if (!admin) {
        redirect("/admin/login")
    }

    const period = parseMolliePeriod((await searchParams).periode)

    let data: MollieDashboardData | null = null
    let loadError: string | null = null
    try {
        data = await getMollieDashboardData(period)
    } catch (err) {
        console.error("[mollie dashboard]", err)
        loadError = err instanceof Error ? err.message : "Onbekende fout"
    }

    return (
        <div className="min-h-screen px-6 pt-28 pb-16 max-w-6xl mx-auto">
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
            >
                <ArrowLeft className="h-4 w-4" />
                Terug naar dashboard
            </Link>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                        <h1 className="text-3xl font-light tracking-tight text-primary">Mollie</h1>
                        {data && (
                            data.mode === "live"
                                ? <StatusPill label="Live" tone="good" />
                                : <StatusPill label="Testmodus" tone="progress" />
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Betalingen, terugbetalingen en chargebacks, rechtstreeks uit Mollie en gekoppeld aan je bestellingen.
                    </p>
                </div>
                <a
                    href={MOLLIE_DASHBOARD_URL}
                    target="_blank"
                    rel="noopener"
                    className="inline-flex items-center gap-2 rounded-lg border border-border hover:bg-card px-4 py-2.5 text-sm font-medium transition-colors"
                >
                    Open Mollie-dashboard <ExternalLink size={14} />
                </a>
            </div>

            <PeriodTabs period={period} />

            {loadError || !data ? (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-900">
                    <p className="font-medium mb-1">De gegevens van Mollie konden niet geladen worden.</p>
                    <p>{loadError}</p>
                    <p className="mt-2">Kijk na of <code>MOLLIE_API_KEY</code> ingesteld is en probeer het opnieuw.</p>
                </div>
            ) : (
                <Dashboard data={data} />
            )}
        </div>
    )
}

function PeriodTabs({ period }: { period: MolliePeriod }) {
    return (
        <div className="flex flex-wrap gap-2" role="navigation" aria-label="Periode">
            {(Object.keys(MOLLIE_PERIODS) as MolliePeriod[]).map((key) => (
                <Link
                    key={key}
                    href={`/admin/mollie?periode=${key}`}
                    aria-current={key === period ? "page" : undefined}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${key === period
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-card"
                        }`}
                >
                    {MOLLIE_PERIODS[key].label}
                </Link>
            ))}
        </div>
    )
}

function Dashboard({ data }: { data: MollieDashboardData }) {
    const { summary, issues } = data
    const hasIssues = issues.unsynced.length > 0 || issues.staleRefunds.length > 0 || issues.failedRefunds.length > 0
    const maxMethod = Math.max(...summary.byMethod.map((m) => m.amount), 0)

    return (
        <div className="mt-8 space-y-10">
            {data.mode === "test" && (
                <Notice>
                    Je gebruikt een <strong>test-API-sleutel</strong>. Je ziet hier alleen testbetalingen; er wordt geen echt geld
                    verwerkt. Op productie gebruik je de live-sleutel.
                </Notice>
            )}
            {data.truncated && (
                <Notice>Er zijn meer dan 1000 items in deze periode; alleen de nieuwste worden getoond. Kies een kortere periode.</Notice>
            )}

            {/* Things that need attention first */}
            {hasIssues && (
                <section className="rounded-lg border border-red-300 bg-red-50/70 p-5 space-y-5">
                    <h2 className="flex items-center gap-2 font-medium text-red-900">
                        <AlertTriangle size={18} /> Aandacht nodig
                    </h2>

                    {issues.unsynced.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm">
                                <strong>{issues.unsynced.length} betaling{issues.unsynced.length === 1 ? "" : "en"}</strong> {issues.unsynced.length === 1 ? "is" : "zijn"} betaald
                                bij Mollie, maar de webshop weet dat nog niet (bijvoorbeeld omdat de webhook niet aankwam). Synchroniseren zet
                                de bestelling op betaald en verstuurt de factuur en de bevestiging.
                            </p>
                            <ul className="text-sm list-disc pl-5">
                                {issues.unsynced.map((payment) => (
                                    <li key={payment.id}>
                                        {payment.order ? (
                                            <Link href={`/admin/bestellingen/${payment.order.id}`} className="underline underline-offset-4">
                                                {payment.order.orderNumber}
                                            </Link>
                                        ) : payment.id}{" "}
                                        – {formatPrice(payment.amount)}
                                    </li>
                                ))}
                            </ul>
                            <SyncPaymentsButton paymentIds={issues.unsynced.map((p) => p.id)} />
                        </div>
                    )}

                    {issues.staleRefunds.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm">
                                <strong>{issues.staleRefunds.length} terugbetaling{issues.staleRefunds.length === 1 ? "" : "en"}</strong> {issues.staleRefunds.length === 1 ? "heeft" : "hebben"} in
                                de webshop een andere status dan bij Mollie.
                            </p>
                            <RefreshRefundsButton />
                        </div>
                    )}

                    {issues.failedRefunds.length > 0 && (
                        <div className="space-y-1 text-sm">
                            <p>
                                <strong>{issues.failedRefunds.length} terugbetaling{issues.failedRefunds.length === 1 ? "" : "en"} mislukt</strong>. Meestal is
                                je Mollie-saldo te laag. Kijk in het Mollie-dashboard en betaal opnieuw terug vanaf de bestelling.
                            </p>
                            <ul className="list-disc pl-5">
                                {issues.failedRefunds.map((refund) => (
                                    <li key={refund.id}>
                                        {refund.order ? (
                                            <Link href={`/admin/bestellingen/${refund.order.id}`} className="underline underline-offset-4">
                                                {refund.order.orderNumber}
                                            </Link>
                                        ) : refund.paymentId}{" "}
                                        – {formatPrice(refund.amount)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}

            {/* Key figures */}
            <section>
                <SectionTitle>Overzicht – {MOLLIE_PERIODS[data.period].label.toLowerCase()}</SectionTitle>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Figure label="Ontvangen" value={formatPrice(summary.received)} detail={`${summary.paidCount} betaling${summary.paidCount === 1 ? "" : "en"}`} />
                    <Figure label="Terugbetaald" value={summary.refunded > 0 ? `– ${formatPrice(summary.refunded)}` : formatPrice(0)} detail={`${summary.refundCount} terugbetaling${summary.refundCount === 1 ? "" : "en"}`} />
                    <Figure label="Netto" value={formatPrice(summary.net)} detail="ontvangen min terugbetaald en chargebacks" emphasis />
                    <Figure label="Gemiddelde betaling" value={formatPrice(summary.averageOrder)} detail="per betaalde bestelling" />
                    <Figure
                        label="Geslaagde betalingen"
                        value={summary.conversion === null ? "–" : percent.format(summary.conversion)}
                        detail="van alle afgeronde betaalpogingen"
                    />
                    <Figure
                        label="Chargebacks"
                        value={String(summary.chargebackCount)}
                        detail={summary.chargebackCount > 0 ? formatPrice(summary.chargedBack) : "geen"}
                    />
                    <Figure label="Betaalpogingen" value={String(data.payments.length)} detail="alle statussen samen" />
                    <Figure label="Actieve betaalmethoden" value={String(data.methods.length)} detail="ingeschakeld in Mollie" />
                </div>
            </section>

            {/* Chart */}
            <section className="bg-card border border-border rounded-lg p-5">
                <SectionTitle>Ontvangen per {MOLLIE_PERIODS[data.period].bucket === "day" ? "dag" : "maand"}</SectionTitle>
                {summary.paidCount === 0 ? (
                    <p className="text-sm text-muted-foreground py-8 text-center">Nog geen betaalde bestellingen in deze periode.</p>
                ) : (
                    <RevenueChart buckets={data.buckets} unit={MOLLIE_PERIODS[data.period].bucket} />
                )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* By method */}
                <section className="bg-card border border-border rounded-lg p-5">
                    <SectionTitle>Per betaalmethode</SectionTitle>
                    {summary.byMethod.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nog geen betaalde bestellingen.</p>
                    ) : (
                        <ul className="space-y-3">
                            {summary.byMethod.map((row) => (
                                <li key={row.method}>
                                    <div className="flex justify-between gap-2 text-sm mb-1">
                                        <span>{methodLabel(row.method)}</span>
                                        <span className="tabular-nums">
                                            {formatPrice(row.amount)}
                                            <span className="text-muted-foreground"> · {row.count}× · {percent.format(summary.received ? row.amount / summary.received : 0)}</span>
                                        </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-border/50 overflow-hidden">
                                        <div
                                            className="h-full rounded-full"
                                            style={{ width: `${maxMethod ? (row.amount / maxMethod) * 100 : 0}%`, backgroundColor: BAR_COLOR }}
                                        />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* By status */}
                <section className="bg-card border border-border rounded-lg p-5">
                    <SectionTitle>Status van alle betaalpogingen</SectionTitle>
                    {data.payments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Nog geen betaalpogingen in deze periode.</p>
                    ) : (
                        <ul className="divide-y divide-border">
                            {Object.entries(summary.byStatus)
                                .sort(([, a], [, b]) => b - a)
                                .map(([status, count]) => {
                                    const info = PAYMENT_STATUS[status] ?? { label: status, tone: "neutral" as const }
                                    return (
                                        <li key={status} className="flex items-center justify-between py-2 text-sm">
                                            <StatusPill label={info.label} tone={info.tone} />
                                            <span className="tabular-nums">{count}</span>
                                        </li>
                                    )
                                })}
                        </ul>
                    )}
                    <p className="mt-3 text-xs text-muted-foreground">
                        Verlopen en geannuleerd betekent dat de klant het betalen niet afrondde; het werk kwam dan automatisch terug vrij.
                    </p>
                </section>
            </div>

            {/* Payments */}
            <section>
                <SectionTitle>Betalingen</SectionTitle>
                <PaymentsTable payments={data.payments} />
            </section>

            {/* Refunds */}
            <section>
                <div className="flex items-center justify-between gap-3 mb-4">
                    <SectionTitle className="mb-0">Terugbetalingen</SectionTitle>
                    {data.refunds.length > 0 && <RefreshRefundsButton />}
                </div>
                {data.refunds.length === 0 ? (
                    <EmptyRow>Geen terugbetalingen in deze periode.</EmptyRow>
                ) : (
                    <SimpleTable
                        head={["Datum", "Bestelling", "Status", "Omschrijving", "Bedrag", "Mollie"]}
                        alignRight={[4]}
                        rows={data.refunds.map((refund) => {
                            const status = REFUND_STATUS[refund.status] ?? { label: refund.status, tone: "neutral" as const }
                            return [
                                <span key="d" className="tabular-nums text-muted-foreground whitespace-nowrap">{dateTime.format(new Date(refund.createdAt))}</span>,
                                refund.order
                                    ? <Link key="o" href={`/admin/bestellingen/${refund.order.id}`} className="font-medium hover:underline underline-offset-4">{refund.order.orderNumber}</Link>
                                    : <span key="o" className="text-muted-foreground">–</span>,
                                <StatusPill key="s" label={status.label} tone={status.tone} />,
                                <span key="desc" className="text-muted-foreground">{refund.description || "–"}</span>,
                                <span key="a" className="tabular-nums whitespace-nowrap font-medium">– {formatPrice(refund.amount)}</span>,
                                <span key="m" className="font-mono text-xs text-muted-foreground">{refund.id}</span>,
                            ]
                        })}
                    />
                )}
            </section>

            {/* Chargebacks */}
            <section>
                <SectionTitle>Chargebacks</SectionTitle>
                {data.chargebacks.length === 0 ? (
                    <EmptyRow>Geen chargebacks in deze periode. Een chargeback is een betaling die de klant via zijn bank of kaartuitgever terugdraaide.</EmptyRow>
                ) : (
                    <SimpleTable
                        head={["Datum", "Bestelling", "Reden", "Bedrag", "Status"]}
                        alignRight={[3]}
                        rows={data.chargebacks.map((chargeback) => [
                            <span key="d" className="tabular-nums text-muted-foreground whitespace-nowrap">{dateTime.format(new Date(chargeback.createdAt))}</span>,
                            chargeback.order
                                ? <Link key="o" href={`/admin/bestellingen/${chargeback.order.id}`} className="font-medium hover:underline underline-offset-4">{chargeback.order.orderNumber}</Link>
                                : <span key="o" className="font-mono text-xs text-muted-foreground">{chargeback.paymentId}</span>,
                            <span key="r">{chargeback.reason ?? "–"}</span>,
                            <span key="a" className="tabular-nums whitespace-nowrap font-medium">– {formatPrice(chargeback.amount)}</span>,
                            chargeback.reversedAt
                                ? <StatusPill key="s" label="Teruggedraaid" tone="good" />
                                : <StatusPill key="s" label="Actief" tone="bad" />,
                        ])}
                    />
                )}
            </section>

            {/* Methods */}
            <section>
                <SectionTitle>Ingeschakelde betaalmethoden</SectionTitle>
                {data.methodsError ? (
                    <EmptyRow>De betaalmethoden konden niet geladen worden: {data.methodsError}</EmptyRow>
                ) : data.methods.length === 0 ? (
                    <EmptyRow>Er zijn nog geen betaalmethoden ingeschakeld. Doe dat in het Mollie-dashboard.</EmptyRow>
                ) : (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {data.methods.map((method) => (
                            <li key={method.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                                {method.imageUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element -- small logo served by Mollie
                                    <img src={method.imageUrl} alt="" width={32} height={24} className="h-6 w-8 object-contain" />
                                )}
                                <div className="min-w-0 text-sm">
                                    <p className="font-medium">{method.description}</p>
                                    <p className="text-xs text-muted-foreground tabular-nums">
                                        {method.minimum !== null ? `vanaf ${formatPrice(method.minimum)}` : ""}
                                        {method.maximum !== null ? ` tot ${formatPrice(method.maximum)}` : ""}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                {data.methods.some((m) => m.id === "banktransfer") && (
                    <p className="mt-3 text-sm text-amber-800">
                        Overschrijving staat aan. Die duurt dagen, veel langer dan de reservatie van 30 minuten. Zet ze best uit in Mollie.
                    </p>
                )}
            </section>

            <Notice>
                <strong>Saldo, uitbetalingen naar je rekening en Mollie-kosten</strong> zijn met deze API-sleutel niet op te
                vragen. Die vind je in het{" "}
                <a href={MOLLIE_DASHBOARD_URL} target="_blank" rel="noopener" className="underline underline-offset-4">Mollie-dashboard</a>{" "}
                onder Saldo en Facturen.
            </Notice>
        </div>
    )
}

function SectionTitle({ children, className = "mb-4" }: { children: React.ReactNode; className?: string }) {
    return <h2 className={`text-xs font-semibold uppercase tracking-widest text-muted-foreground ${className}`}>{children}</h2>
}

function Figure({ label, value, detail, emphasis }: { label: string; value: string; detail: string; emphasis?: boolean }) {
    return (
        <div className={`rounded-lg border p-4 flex flex-col gap-1 ${emphasis ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className={`text-2xl font-light tabular-nums ${emphasis ? "text-primary" : "text-foreground"}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{detail}</div>
        </div>
    )
}

function Notice({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
            <p>{children}</p>
        </div>
    )
}

function EmptyRow({ children }: { children: React.ReactNode }) {
    return <p className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground">{children}</p>
}

function SimpleTable({ head, rows, alignRight = [] }: { head: string[]; rows: React.ReactNode[][]; alignRight?: number[] }) {
    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
                <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-widest text-muted-foreground">
                        {head.map((cell, index) => (
                            <th key={cell} className={`px-4 py-3 font-semibold ${alignRight.includes(index) ? "text-right" : ""}`}>{cell}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, index) => (
                        <tr key={index} className="border-b border-border last:border-0 align-top">
                            {row.map((cell, cellIndex) => (
                                <td key={cellIndex} className={`px-4 py-3 ${alignRight.includes(cellIndex) ? "text-right" : ""}`}>{cell}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
