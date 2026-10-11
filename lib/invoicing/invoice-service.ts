import "server-only"
import { createAdminClient } from "../supabase/admin"
import { getCountryName } from "../shop/countries"
import { VAT_RATE } from "../shop/config"
import { makeLine, negateLine, sumLines } from "./invoice-lines"
import { SELLER } from "./seller"
import type { Invoice, InvoiceLine, InvoiceParty, InvoiceType } from "./types"

const PAID_STATUSES = ["paid", "shipped", "delivered", "completed", "withdrawn", "refunded"]

type Row = Record<string, unknown>

function buildBuyer(order: Row): InvoiceParty {
  const useShipping = order.billingSameAsShipping && order.shippingMethod === "ship"
  const prefix = useShipping ? "shipping" : "billing"
  const countryCode = order[`${prefix}CountryCode`] as string | null

  return {
    name: `${order.customerFirstName} ${order.customerLastName}`,
    companyName: (order.companyName as string | null) ?? null,
    vatNumber: (order.vatNumber as string | null) ?? null,
    street: (order[`${prefix}Street`] as string | null) ?? null,
    postalCode: (order[`${prefix}PostalCode`] as string | null) ?? null,
    city: (order[`${prefix}City`] as string | null) ?? null,
    country: countryCode ? getCountryName(countryCode) ?? countryCode : null,
    email: order.customerEmail as string,
  }
}

async function issue(
  orderId: string,
  type: InvoiceType,
  creditedInvoiceId: string | null,
  buyer: InvoiceParty,
  lines: InvoiceLine[]
): Promise<string> {
  const totals = sumLines(lines)

  const { data, error } = await createAdminClient().rpc("issue_invoice", {
    p_order_id: orderId,
    p_type: type,
    p_credited_invoice_id: creditedInvoiceId,
    p_seller: SELLER,
    p_buyer: buyer,
    p_lines: lines,
    p_subtotal_excl_vat: totals.subtotalExclVat,
    p_vat_amount: totals.vatAmount,
    p_total: totals.total,
  })
  if (error) throw new Error(error.message)

  return (data as { id: string }).id
}

// Creates the invoice for a paid order. Idempotent: returns the existing
// invoice id when there already is one.
export async function ensureInvoiceForOrder(orderId: string): Promise<string> {
  const { data: order, error } = await createAdminClient()
    .from("Order")
    .select("*, OrderItem (id, title, dimensions, price, vatRate)")
    .eq("id", orderId)
    .single()
  if (error) throw new Error(error.message)

  if (!PAID_STATUSES.includes(order.status)) {
    throw new Error("Only paid orders can be invoiced")
  }

  const items = (order.OrderItem ?? []) as Row[]
  const lines: InvoiceLine[] = items.map((item) =>
    makeLine(
      "item",
      item.id as string,
      [item.title, item.dimensions].filter(Boolean).join(" – ") + " (origineel kunstwerk)",
      Number(item.price),
      Number(item.vatRate)
    )
  )

  const shippingCost = Number(order.shippingCost)
  if (shippingCost > 0) {
    // Shipping follows the VAT rate of the goods
    const vatRate = items.length > 0 ? Number(items[0].vatRate) : VAT_RATE
    lines.push(makeLine("shipping", null, "Verzending", shippingCost, vatRate))
  }

  return issue(orderId, "invoice", null, buildBuyer(order), lines)
}

// Credits (part of) an order's invoice, e.g. after a withdrawal. Items that
// were already credited before are refused.
export async function createCreditNote(
  orderId: string,
  options: { orderItemIds: string[]; includeShipping: boolean }
): Promise<string> {
  const supabase = createAdminClient()

  const { data: invoices, error } = await supabase
    .from("Invoice")
    .select("id, type, buyer, lines")
    .eq("orderId", orderId)
  if (error) throw new Error(error.message)

  const invoice = invoices?.find((row) => row.type === "invoice")
  if (!invoice) throw new Error("Deze bestelling heeft nog geen factuur")

  const alreadyCredited = new Set<string>()
  let shippingCredited = false
  for (const note of invoices.filter((row) => row.type === "credit_note")) {
    for (const line of note.lines as InvoiceLine[]) {
      if (line.orderItemId) alreadyCredited.add(line.orderItemId)
      if (line.kind === "shipping") shippingCredited = true
    }
  }

  const invoiceLines = invoice.lines as InvoiceLine[]
  const lines = invoiceLines
    .filter((line) =>
      line.kind === "item"
        ? !!line.orderItemId && options.orderItemIds.includes(line.orderItemId) && !alreadyCredited.has(line.orderItemId)
        : options.includeShipping && !shippingCredited
    )
    .map(negateLine)

  if (lines.length === 0) throw new Error("Er is niets (meer) te crediteren")

  return issue(orderId, "credit_note", invoice.id, invoice.buyer as InvoiceParty, lines)
}

function mapInvoice(row: Row, creditedNumbers: Map<string, string>): Invoice {
  const order = row.Order as Row | null
  return {
    id: row.id as string,
    orderId: row.orderId as string,
    orderNumber: (order?.orderNumber as string) ?? "",
    type: row.type as InvoiceType,
    invoiceNumber: row.invoiceNumber as string,
    creditedInvoiceNumber: row.creditedInvoiceId
      ? creditedNumbers.get(row.creditedInvoiceId as string) ?? null
      : null,
    issuedAt: row.issuedAt as string,
    seller: row.seller as InvoiceParty,
    buyer: row.buyer as InvoiceParty,
    lines: row.lines as InvoiceLine[],
    subtotalExclVat: Number(row.subtotalExclVat),
    vatAmount: Number(row.vatAmount),
    total: Number(row.total),
  }
}

async function loadInvoices(filter: { id?: string; orderId?: string }): Promise<Invoice[]> {
  let query = createAdminClient()
    .from("Invoice")
    .select("*, Order (orderNumber)")
    .order("issuedAt", { ascending: false })

  if (filter.id) query = query.eq("id", filter.id)
  if (filter.orderId) query = query.eq("orderId", filter.orderId)

  const { data, error } = await query
  if (error) throw new Error(error.message)

  const rows = (data ?? []) as Row[]
  const creditedIds = rows.map((row) => row.creditedInvoiceId).filter(Boolean) as string[]
  const creditedNumbers = new Map<string, string>()
  if (creditedIds.length > 0) {
    const { data: credited } = await createAdminClient()
      .from("Invoice")
      .select("id, invoiceNumber")
      .in("id", creditedIds)
    for (const row of credited ?? []) creditedNumbers.set(row.id, row.invoiceNumber)
  }

  return rows.map((row) => mapInvoice(row, creditedNumbers))
}

export async function getInvoice(id: string): Promise<Invoice | null> {
  return (await loadInvoices({ id }))[0] ?? null
}

export async function getInvoicesForOrder(orderId: string): Promise<Invoice[]> {
  return loadInvoices({ orderId })
}

export async function listInvoices(): Promise<Invoice[]> {
  return loadInvoices({})
}

// Paid orders without invoice, e.g. paid before invoicing existed or when
// invoicing failed right after payment
export async function createMissingInvoices(): Promise<number> {
  const supabase = createAdminClient()

  const [{ data: orders, error }, { data: invoiced }] = await Promise.all([
    supabase.from("Order").select("id").in("status", PAID_STATUSES),
    supabase.from("Invoice").select("orderId").eq("type", "invoice"),
  ])
  if (error) throw new Error(error.message)

  const invoicedIds = new Set((invoiced ?? []).map((row) => row.orderId))
  const missing = (orders ?? []).filter((order) => !invoicedIds.has(order.id))

  for (const order of missing) {
    await ensureInvoiceForOrder(order.id)
  }
  return missing.length
}
