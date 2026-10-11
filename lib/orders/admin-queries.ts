import "server-only"
import { createAdminClient } from "../supabase/admin"

export const ORDER_TABS = {
  "te-verzenden": { label: "Klaar te maken", statuses: ["paid"] },
  onderweg: { label: "Onderweg", statuses: ["shipped"] },
  afgerond: { label: "Geleverd", statuses: ["delivered", "completed"] },
  "herroepen": { label: "Herroepen & terugbetaald", statuses: ["withdrawn", "refunded"] },
  alle: { label: "Alle", statuses: null },
} as const

export type OrderTab = keyof typeof ORDER_TABS

export function parseOrderTab(value: unknown): OrderTab {
  return typeof value === "string" && value in ORDER_TABS ? (value as OrderTab) : "te-verzenden"
}

export interface AdminOrderListItem {
  id: string
  orderNumber: string
  status: string
  createdAt: string
  customerName: string
  customerEmail: string
  shippingMethod: "ship" | "pickup"
  total: number
  itemCount: number
}

export async function listAdminOrders(tab: OrderTab, search: string): Promise<AdminOrderListItem[]> {
  let query = createAdminClient()
    .from("Order")
    .select("id, orderNumber, status, createdAt, customerFirstName, customerLastName, customerEmail, shippingMethod, total, OrderItem (id)")
    .order("createdAt", { ascending: tab === "te-verzenden" })
    .limit(200)

  const statuses = ORDER_TABS[tab].statuses
  if (statuses) query = query.in("status", statuses)

  // Characters that would break the PostgREST "or" filter syntax are dropped
  const term = search.replace(/[,()%*\\]/g, " ").trim()
  if (term) {
    const pattern = `%${term}%`
    query = query.or(
      ["orderNumber", "customerEmail", "customerFirstName", "customerLastName"]
        .map((column) => `${column}.ilike.${pattern}`)
        .join(",")
    )
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    id: row.id,
    orderNumber: row.orderNumber,
    status: row.status,
    createdAt: row.createdAt,
    customerName: `${row.customerFirstName} ${row.customerLastName}`,
    customerEmail: row.customerEmail,
    shippingMethod: row.shippingMethod,
    total: Number(row.total),
    itemCount: (row.OrderItem ?? []).length,
  }))
}

export async function countOrdersToPrepare(): Promise<number> {
  const { count, error } = await createAdminClient()
    .from("Order")
    .select("*", { count: "exact", head: true })
    .eq("status", "paid")
  if (error) throw new Error(error.message)
  return count ?? 0
}

// Revenue of orders paid this calendar month (refunds are subtracted once
// refunds exist)
export async function getRevenueThisMonth(): Promise<number> {
  const now = new Date()
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString()

  const supabase = createAdminClient()
  const [{ data: orders, error }, { data: refunds }] = await Promise.all([
    supabase.from("Order").select("total").gte("paidAt", monthStart),
    supabase.from("Refund").select("amount").gte("createdAt", monthStart).neq("status", "failed"),
  ])
  if (error) throw new Error(error.message)

  const paid = (orders ?? []).reduce((sum, row) => sum + Number(row.total), 0)
  const refunded = (refunds ?? []).reduce((sum, row) => sum + Number(row.amount), 0)
  return Math.round((paid - refunded) * 100) / 100
}

export interface AdminOrderDetail {
  id: string
  orderNumber: string
  accessToken: string
  status: string
  createdAt: string
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string | null
  companyName: string | null
  vatNumber: string | null
  shippingMethod: "ship" | "pickup"
  shippingCountryCode: string | null
  shippingStreet: string | null
  shippingPostalCode: string | null
  shippingCity: string | null
  billingSameAsShipping: boolean
  billingCountryCode: string | null
  billingStreet: string | null
  billingPostalCode: string | null
  billingCity: string | null
  subtotal: number
  shippingCost: number
  total: number
  vatAmount: number
  trackingUrl: string | null
  adminNote: string | null
  termsVersion: string
  items: { id: string; artPieceId: string | null; title: string; dimensions: string | null; imageUrl: string | null; price: number; withdrawalApplicable: boolean }[]
  payments: { id: string; molliePaymentId: string; status: string; method: string | null; amount: number; createdAt: string }[]
  invoices: { id: string; type: string; invoiceNumber: string; total: number; issuedAt: string }[]
  events: { id: string; type: string; message: string | null; actor: string; createdAt: string }[]
  withdrawals: AdminWithdrawal[]
  refunds: { id: string; amount: number; status: string; withdrawalId: string | null; createdAt: string }[]
}

export interface AdminWithdrawal {
  id: string
  name: string
  email: string
  reason: string | null
  status: string
  submittedAt: string
  returnReceivedAt: string | null
  refundedAt: string | null
  adminNote: string | null
  orderItemIds: string[]
}

function mapWithdrawal(row: Record<string, unknown>): AdminWithdrawal {
  return {
    id: row.id as string,
    name: row.name as string,
    email: row.email as string,
    reason: (row.reason as string | null) ?? null,
    status: row.status as string,
    submittedAt: row.submittedAt as string,
    returnReceivedAt: (row.returnReceivedAt as string | null) ?? null,
    refundedAt: (row.refundedAt as string | null) ?? null,
    adminNote: (row.adminNote as string | null) ?? null,
    orderItemIds: ((row.WithdrawalItem ?? []) as { orderItemId: string }[]).map((item) => item.orderItemId),
  }
}

const OPEN_WITHDRAWAL_STATUSES = ["registered", "return_received"]

export async function countOpenWithdrawals(): Promise<number> {
  const { count, error } = await createAdminClient()
    .from("Withdrawal")
    .select("*", { count: "exact", head: true })
    .in("status", OPEN_WITHDRAWAL_STATUSES)
  if (error) throw new Error(error.message)
  return count ?? 0
}

export interface AdminWithdrawalListItem extends AdminWithdrawal {
  orderId: string
  orderNumber: string
  itemTitles: string[]
  amount: number
}

export async function listAdminWithdrawals(open: boolean): Promise<AdminWithdrawalListItem[]> {
  let query = createAdminClient()
    .from("Withdrawal")
    .select("*, Order (orderNumber), WithdrawalItem (orderItemId, OrderItem (title, price))")
    .order("submittedAt", { ascending: open })
    .limit(200)

  query = open
    ? query.in("status", OPEN_WITHDRAWAL_STATUSES)
    : query.not("status", "in", `(${OPEN_WITHDRAWAL_STATUSES.join(",")})`)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => {
    const links = (row.WithdrawalItem ?? []) as { OrderItem: { title: string; price: number } | null }[]
    return {
      ...mapWithdrawal(row),
      orderId: row.orderId,
      orderNumber: (row.Order as { orderNumber: string } | null)?.orderNumber ?? "",
      itemTitles: links.map((link) => link.OrderItem?.title ?? ""),
      amount: links.reduce((sum, link) => sum + Number(link.OrderItem?.price ?? 0), 0),
    }
  })
}

export async function getAdminOrder(id: string): Promise<AdminOrderDetail | null> {
  const { data, error } = await createAdminClient()
    .from("Order")
    .select(`
      *,
      OrderItem (id, artPieceId, title, dimensions, imageUrl, price, withdrawalApplicable),
      Payment (id, molliePaymentId, status, method, amount, createdAt),
      Invoice (id, type, invoiceNumber, total, issuedAt),
      OrderEvent (id, type, message, actor, createdAt),
      Withdrawal (*, WithdrawalItem (orderItemId)),
      Refund (id, amount, status, withdrawalId, createdAt)
    `)
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  const byDate = <T extends { createdAt: string }>(rows: T[]) =>
    [...rows].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return {
    ...data,
    subtotal: Number(data.subtotal),
    shippingCost: Number(data.shippingCost),
    total: Number(data.total),
    vatAmount: Number(data.vatAmount),
    items: (data.OrderItem ?? []).map((item: Record<string, unknown>) => ({
      id: item.id as string,
      artPieceId: (item.artPieceId as string | null) ?? null,
      title: item.title as string,
      dimensions: (item.dimensions as string | null) ?? null,
      imageUrl: (item.imageUrl as string | null) ?? null,
      price: Number(item.price),
      withdrawalApplicable: Boolean(item.withdrawalApplicable),
    })),
    payments: byDate((data.Payment ?? []).map((payment: Record<string, unknown>) => ({
      id: payment.id as string,
      molliePaymentId: payment.molliePaymentId as string,
      status: payment.status as string,
      method: (payment.method as string | null) ?? null,
      amount: Number(payment.amount),
      createdAt: payment.createdAt as string,
    }))),
    invoices: [...(data.Invoice ?? [])]
      .map((invoice: Record<string, unknown>) => ({
        id: invoice.id as string,
        type: invoice.type as string,
        invoiceNumber: invoice.invoiceNumber as string,
        total: Number(invoice.total),
        issuedAt: invoice.issuedAt as string,
      }))
      .sort((a, b) => a.issuedAt.localeCompare(b.issuedAt)),
    events: byDate(data.OrderEvent ?? []),
    withdrawals: ((data.Withdrawal ?? []) as Record<string, unknown>[])
      .map(mapWithdrawal)
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)),
    refunds: byDate((data.Refund ?? []).map((refund: Record<string, unknown>) => ({
      id: refund.id as string,
      amount: Number(refund.amount),
      status: refund.status as string,
      withdrawalId: (refund.withdrawalId as string | null) ?? null,
      createdAt: refund.createdAt as string,
    }))),
  }
}
