import "server-only"
import { getMollieClient } from "./client"
import { createAdminClient } from "../supabase/admin"
import { toBrusselsDateString } from "../orders/withdrawal-period"

// Everything the Mollie dashboard (/admin/mollie) shows, fetched live from the
// Mollie API and linked to the webshop's own orders.

export const MOLLIE_PERIODS = {
  "30d": { label: "Laatste 30 dagen", days: 30, bucket: "day" },
  maand: { label: "Deze maand", days: null, bucket: "day" },
  jaar: { label: "Dit jaar", days: null, bucket: "month" },
  alles: { label: "Alles", days: null, bucket: "month" },
} as const

export type MolliePeriod = keyof typeof MOLLIE_PERIODS

export function parseMolliePeriod(value: unknown): MolliePeriod {
  return typeof value === "string" && value in MOLLIE_PERIODS ? (value as MolliePeriod) : "30d"
}

// Safety cap per list; far above what a small art shop processes
const MAX_ITEMS = 1000

const amount = (value?: { value: string } | null) => (value ? Number(value.value) : 0)

export interface MolliePaymentRow {
  id: string
  createdAt: string
  paidAt: string | null
  status: string
  method: string | null
  amount: number
  amountRefunded: number
  amountChargedBack: number
  description: string
  orderNumber: string | null
  // Extra detail from the payment method, e.g. card label or account holder
  methodDetail: string | null
  countryCode: string | null
  dashboardUrl: string | null
  // From the webshop database
  order: { id: string; orderNumber: string; status: string } | null
  dbPaymentStatus: string | null
}

export interface MollieRefundRow {
  id: string
  paymentId: string
  createdAt: string
  status: string
  amount: number
  description: string
  order: { id: string; orderNumber: string } | null
  dbStatus: string | null
}

export interface MollieChargebackRow {
  id: string
  paymentId: string
  createdAt: string
  reversedAt: string | null
  amount: number
  reason: string | null
  order: { id: string; orderNumber: string } | null
}

export interface MollieMethodRow {
  id: string
  description: string
  minimum: number | null
  maximum: number | null
  imageUrl: string | null
}

export interface MollieBucket {
  key: string
  label: string
  paid: number
  count: number
}

export interface MollieDashboardData {
  mode: "test" | "live"
  period: MolliePeriod
  since: string | null
  truncated: boolean
  payments: MolliePaymentRow[]
  refunds: MollieRefundRow[]
  chargebacks: MollieChargebackRow[]
  methods: MollieMethodRow[]
  methodsError: string | null
  summary: {
    received: number
    paidCount: number
    refunded: number
    refundCount: number
    chargedBack: number
    chargebackCount: number
    net: number
    averageOrder: number
    conversion: number | null
    byStatus: Record<string, number>
    byMethod: { method: string; amount: number; count: number }[]
  }
  buckets: MollieBucket[]
  issues: {
    // Paid at Mollie, but the webshop doesn't know yet
    unsynced: MolliePaymentRow[]
    // Refund status in the webshop differs from Mollie
    staleRefunds: MollieRefundRow[]
    failedRefunds: MollieRefundRow[]
  }
}

function getSince(period: MolliePeriod, now: Date): Date | null {
  const config = MOLLIE_PERIODS[period]
  if (config.days) return new Date(now.getTime() - config.days * 24 * 60 * 60 * 1000)
  if (period === "maand") return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  if (period === "jaar") return new Date(Date.UTC(now.getUTCFullYear(), 0, 1))
  return null
}

// Lists are newest first; stop at the start of the period
async function collect<T extends { createdAt: string }>(
  iterator: AsyncIterable<T>,
  since: Date | null
): Promise<{ items: T[]; truncated: boolean }> {
  const items: T[] = []
  for await (const item of iterator) {
    if (since && new Date(item.createdAt) < since) break
    items.push(item)
    if (items.length >= MAX_ITEMS) return { items, truncated: true }
  }
  return { items, truncated: false }
}

function describeMethodDetail(details: unknown): string | null {
  if (!details || typeof details !== "object") return null
  const d = details as Record<string, unknown>
  const parts = [d.cardLabel, d.cardNumber ? `•••• ${String(d.cardNumber).slice(-4)}` : null, d.consumerName]
    .filter((part): part is string => typeof part === "string" && part.length > 0)
  return parts.length ? parts.join(" ") : null
}

async function loadOrderLinks(paymentIds: string[]) {
  const byPayment = new Map<string, { status: string; order: { id: string; orderNumber: string; status: string } | null }>()
  const supabase = createAdminClient()

  for (let i = 0; i < paymentIds.length; i += 200) {
    const chunk = paymentIds.slice(i, i + 200)
    const { data, error } = await supabase
      .from("Payment")
      .select("molliePaymentId, status, Order (id, orderNumber, status)")
      .in("molliePaymentId", chunk)
    if (error) throw new Error(error.message)
    for (const row of data ?? []) {
      byPayment.set(row.molliePaymentId, {
        status: row.status,
        order: (row.Order as unknown as { id: string; orderNumber: string; status: string } | null) ?? null,
      })
    }
  }
  return byPayment
}

async function loadDbRefunds(refundIds: string[]) {
  const byRefund = new Map<string, string>()
  if (refundIds.length === 0) return byRefund
  const { data, error } = await createAdminClient()
    .from("Refund")
    .select("mollieRefundId, status")
    .in("mollieRefundId", refundIds.slice(0, 500))
  if (error) throw new Error(error.message)
  for (const row of data ?? []) byRefund.set(row.mollieRefundId, row.status)
  return byRefund
}

function bucketKey(date: string, bucket: "day" | "month"): string {
  const day = toBrusselsDateString(date)
  return bucket === "day" ? day : day.slice(0, 7)
}

const dayLabel = new Intl.DateTimeFormat("nl-BE", { day: "numeric", month: "short", timeZone: "UTC" })
const monthLabel = new Intl.DateTimeFormat("nl-BE", { month: "short", year: "numeric", timeZone: "UTC" })

// Every day / month in the period, also the empty ones, so the chart has an
// honest time axis
function buildBuckets(payments: MolliePaymentRow[], since: Date | null, now: Date, bucket: "day" | "month"): MollieBucket[] {
  const paid = payments.filter((p) => p.status === "paid" && p.paidAt)
  const start =
    since ??
    (paid.length ? new Date(paid[paid.length - 1].paidAt!) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000))

  const buckets = new Map<string, MollieBucket>()
  const [sy, sm, sd] = toBrusselsDateString(start).split("-").map(Number)
  const cursor = new Date(Date.UTC(sy, sm - 1, bucket === "day" ? sd : 1))
  const endKey = bucketKey(now.toISOString(), bucket)

  for (let guard = 0; guard < 400; guard++) {
    const key = bucket === "day" ? cursor.toISOString().slice(0, 10) : cursor.toISOString().slice(0, 7)
    buckets.set(key, {
      key,
      label: bucket === "day" ? dayLabel.format(cursor) : monthLabel.format(cursor),
      paid: 0,
      count: 0,
    })
    if (key >= endKey) break
    if (bucket === "day") cursor.setUTCDate(cursor.getUTCDate() + 1)
    else cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  for (const payment of paid) {
    const entry = buckets.get(bucketKey(payment.paidAt!, bucket))
    if (entry) {
      entry.paid = Math.round((entry.paid + payment.amount) * 100) / 100
      entry.count += 1
    }
  }
  return [...buckets.values()]
}

const round2 = (value: number) => Math.round(value * 100) / 100

export async function getMollieDashboardData(period: MolliePeriod): Promise<MollieDashboardData> {
  const now = new Date()
  const since = getSince(period, now)
  const client = getMollieClient()
  const mode = (process.env.MOLLIE_API_KEY ?? "").startsWith("live_") ? "live" : "test"

  const [paymentResult, refundResult, chargebackResult, methodsResult] = await Promise.all([
    collect(client.payments.iterate(), since),
    collect(client.refunds.iterate(), since),
    collect(client.chargebacks.iterate(), since),
    client.methods.list().then(
      (methods) => ({ methods, error: null as string | null }),
      (err: unknown) => ({ methods: [], error: err instanceof Error ? err.message : "Onbekende fout" })
    ),
  ])

  const paymentIds = [
    ...new Set([
      ...paymentResult.items.map((p) => p.id),
      ...refundResult.items.map((r) => r.paymentId),
      ...chargebackResult.items.map((c) => c.paymentId),
    ]),
  ]
  const [links, dbRefunds] = await Promise.all([
    loadOrderLinks(paymentIds),
    loadDbRefunds(refundResult.items.map((r) => r.id)),
  ])

  const payments: MolliePaymentRow[] = paymentResult.items.map((p) => {
    const metadata = (p.metadata ?? {}) as Record<string, unknown>
    const link = links.get(p.id)
    return {
      id: p.id,
      createdAt: p.createdAt,
      paidAt: p.paidAt ?? null,
      status: p.status,
      method: p.method ?? null,
      amount: amount(p.amount),
      amountRefunded: amount(p.amountRefunded),
      amountChargedBack: amount(p.amountChargedBack),
      description: p.description,
      orderNumber: typeof metadata.orderNumber === "string" ? metadata.orderNumber : null,
      methodDetail: describeMethodDetail(p.details),
      countryCode: p.countryCode ?? null,
      dashboardUrl: p._links?.dashboard?.href ?? null,
      order: link?.order ?? null,
      dbPaymentStatus: link?.status ?? null,
    }
  })

  const refunds: MollieRefundRow[] = refundResult.items.map((r) => {
    const link = links.get(r.paymentId)
    return {
      id: r.id,
      paymentId: r.paymentId,
      createdAt: r.createdAt,
      status: r.status,
      amount: amount(r.amount),
      description: r.description,
      order: link?.order ? { id: link.order.id, orderNumber: link.order.orderNumber } : null,
      dbStatus: dbRefunds.get(r.id) ?? null,
    }
  })

  const chargebacks: MollieChargebackRow[] = chargebackResult.items.map((c) => {
    const link = links.get(c.paymentId)
    return {
      id: c.id,
      paymentId: c.paymentId,
      createdAt: c.createdAt,
      reversedAt: c.reversedAt ?? null,
      amount: amount(c.amount),
      reason: c.reason?.description ?? null,
      order: link?.order ? { id: link.order.id, orderNumber: link.order.orderNumber } : null,
    }
  })

  const methods: MollieMethodRow[] = methodsResult.methods.map((m) => ({
    id: m.id,
    description: m.description,
    minimum: m.minimumAmount ? amount(m.minimumAmount) : null,
    maximum: m.maximumAmount ? amount(m.maximumAmount) : null,
    imageUrl: m.image?.svg ?? null,
  }))

  // Summary
  const paidPayments = payments.filter((p) => p.status === "paid")
  const received = round2(paidPayments.reduce((sum, p) => sum + p.amount, 0))
  const activeRefunds = refunds.filter((r) => r.status !== "failed" && r.status !== "canceled")
  const refunded = round2(activeRefunds.reduce((sum, r) => sum + r.amount, 0))
  const activeChargebacks = chargebacks.filter((c) => !c.reversedAt)
  const chargedBack = round2(activeChargebacks.reduce((sum, c) => sum + c.amount, 0))

  const byStatus: Record<string, number> = {}
  for (const p of payments) byStatus[p.status] = (byStatus[p.status] ?? 0) + 1
  const finished = (byStatus.paid ?? 0) + (byStatus.expired ?? 0) + (byStatus.canceled ?? 0) + (byStatus.failed ?? 0)

  const methodTotals = new Map<string, { amount: number; count: number }>()
  for (const p of paidPayments) {
    const key = p.method ?? "onbekend"
    const entry = methodTotals.get(key) ?? { amount: 0, count: 0 }
    entry.amount = round2(entry.amount + p.amount)
    entry.count += 1
    methodTotals.set(key, entry)
  }

  const bucket = MOLLIE_PERIODS[period].bucket

  return {
    mode,
    period,
    since: since?.toISOString() ?? null,
    truncated: paymentResult.truncated || refundResult.truncated || chargebackResult.truncated,
    payments,
    refunds,
    chargebacks,
    methods,
    methodsError: methodsResult.error,
    summary: {
      received,
      paidCount: paidPayments.length,
      refunded,
      refundCount: activeRefunds.length,
      chargedBack,
      chargebackCount: activeChargebacks.length,
      net: round2(received - refunded - chargedBack),
      averageOrder: paidPayments.length ? round2(received / paidPayments.length) : 0,
      conversion: finished ? (byStatus.paid ?? 0) / finished : null,
      byStatus,
      byMethod: [...methodTotals.entries()]
        .map(([method, totals]) => ({ method, ...totals }))
        .sort((a, b) => b.amount - a.amount),
    },
    buckets: buildBuckets(payments, since, now, bucket),
    issues: {
      unsynced: paidPayments.filter((p) => p.dbPaymentStatus !== null && p.dbPaymentStatus !== "paid"),
      staleRefunds: refunds.filter((r) => r.dbStatus !== null && r.dbStatus !== r.status),
      failedRefunds: refunds.filter((r) => r.status === "failed"),
    },
  }
}
