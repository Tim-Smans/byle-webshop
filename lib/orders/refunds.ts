import "server-only"
import { createAdminClient } from "../supabase/admin"
import { getMollieClient } from "../mollie/client"
import { createCreditNote, ensureInvoiceForOrder } from "../invoicing/invoice-service"
import { sendRefundEmail } from "../email/withdrawal-emails"

const PAID_STATUSES = ["paid", "shipped", "delivered", "completed", "withdrawn"]

export interface RefundResult {
  amount: number
  warnings: string[]
}

type Actor = "admin" | "customer"

async function logEvent(orderId: string, actor: Actor, type: string, message: string, data?: Record<string, unknown>) {
  await createAdminClient().from("OrderEvent").insert({ orderId, type, message, actor, data: data ?? null })
}

// Refunds (part of) an order through Mollie, issues the credit note and
// optionally puts the works up for sale again. Money moves first; anything
// that fails after that is reported as a warning instead of an error, so the
// admin never retries a refund that already happened.
async function refundOrder(options: {
  orderId: string
  orderItemIds: string[]
  includeShipping: boolean
  withdrawalId: string | null
  makeAvailable: boolean
  description: string
  actor?: Actor
  // The caller sends its own e-mail (e.g. the cancellation confirmation)
  skipRefundEmail?: boolean
}): Promise<RefundResult> {
  const supabase = createAdminClient()
  const warnings: string[] = []
  const actor = options.actor ?? "admin"

  const { data: order, error } = await supabase
    .from("Order")
    .select("id, orderNumber, status, total, shippingCost, OrderItem (id, price, artPieceId), Payment (molliePaymentId, status), Refund (amount, status)")
    .eq("id", options.orderId)
    .single()
  if (error) throw new Error(error.message)
  if (!PAID_STATUSES.includes(order.status)) throw new Error("Deze bestelling kan niet terugbetaald worden.")

  const items = (order.OrderItem ?? []) as { id: string; price: number; artPieceId: string | null }[]
  const selected = items.filter((item) => options.orderItemIds.includes(item.id))
  if (selected.length !== options.orderItemIds.length || selected.length === 0) {
    throw new Error("Ongeldige werken gekozen")
  }

  const amount =
    Math.round(
      (selected.reduce((sum, item) => sum + Number(item.price), 0) + (options.includeShipping ? Number(order.shippingCost) : 0)) * 100
    ) / 100

  const alreadyRefunded = ((order.Refund ?? []) as { amount: number; status: string }[])
    .filter((refund) => refund.status !== "failed")
    .reduce((sum, refund) => sum + Number(refund.amount), 0)
  if (amount + alreadyRefunded > Number(order.total) + 0.001) {
    throw new Error("Dit bedrag is hoger dan wat nog terugbetaald kan worden.")
  }

  const payment = ((order.Payment ?? []) as { molliePaymentId: string; status: string }[]).find((p) => p.status === "paid")
  if (!payment) throw new Error("Geen betaalde Mollie-betaling gevonden voor deze bestelling.")

  // Claim first: the unique index makes a second refund for the same
  // withdrawal impossible, even with two clicks at once
  const { data: refundRow, error: claimError } = await supabase
    .from("Refund")
    .insert({ orderId: order.id, withdrawalId: options.withdrawalId, amount, status: "creating" })
    .select("id")
    .single()
  if (claimError) {
    throw new Error(claimError.code === "23505" ? "Deze herroeping wordt al terugbetaald." : claimError.message)
  }

  try {
    const refund = await getMollieClient().paymentRefunds.create({
      paymentId: payment.molliePaymentId,
      amount: { currency: "EUR", value: amount.toFixed(2) },
      description: options.description,
      idempotencyKey: `refund-${refundRow.id}`,
    })
    await supabase.from("Refund").update({ mollieRefundId: refund.id, status: refund.status }).eq("id", refundRow.id)
  } catch (err) {
    await supabase.from("Refund").update({ status: "failed" }).eq("id", refundRow.id)
    const message = err instanceof Error ? err.message : "onbekende fout"
    throw new Error(`Mollie kon de terugbetaling niet uitvoeren: ${message}`)
  }

  await logEvent(order.id, actor, "refunded", `€ ${amount.toFixed(2)} terugbetaald via Mollie`, { amount })

  try {
    await ensureInvoiceForOrder(order.id)
    await createCreditNote(order.id, { orderItemIds: options.orderItemIds, includeShipping: options.includeShipping })
  } catch (err) {
    warnings.push(`De creditnota kon niet aangemaakt worden: ${err instanceof Error ? err.message : err}`)
  }

  // Shipping is only refunded when the whole order is refunded
  if (options.includeShipping) {
    await supabase.from("Order").update({ status: "refunded" }).eq("id", order.id)
  }

  if (options.makeAvailable) {
    const freed = await makeWorksAvailable(order.id, selected.map((item) => item.artPieceId).filter(Boolean) as string[])
    if (freed > 0) {
      warnings.push(
        `${freed} werk${freed === 1 ? " staat" : "en staan"} terug te koop. Zet ${freed === 1 ? "het" : "ze"} via "aanpassen" in de juiste collectie.`
      )
    }
  }

  if (!options.skipRefundEmail) {
    try {
      await sendRefundEmail(order.id, amount)
    } catch (err) {
      warnings.push(`De klant kreeg geen e-mail over de terugbetaling: ${err instanceof Error ? err.message : err}`)
    }
  }

  return { amount, warnings }
}

// Puts works back on sale, unless another paid order owns them (e.g. after
// a stock conflict the work belongs to the other buyer)
async function makeWorksAvailable(orderId: string, artPieceIds: string[]): Promise<number> {
  if (artPieceIds.length === 0) return 0
  const supabase = createAdminClient()

  const { data: otherOrders } = await supabase
    .from("OrderItem")
    .select("artPieceId, Order!inner (id, status)")
    .in("artPieceId", artPieceIds)
    .neq("orderId", orderId)
    .in("Order.status", ["paid", "shipped", "delivered", "completed"])

  const ownedByOthers = new Set((otherOrders ?? []).map((row) => row.artPieceId))
  const toFree = artPieceIds.filter((id) => !ownedByOthers.has(id))
  if (toFree.length === 0) return 0

  const { error } = await supabase.from("ArtPiece").update({ status: "available" }).in("id", toFree)
  if (error) throw new Error(error.message)
  return toFree.length
}

// Refund after a withdrawal. The original shipping cost is included when the
// customer withdrew from the whole order (legal requirement).
export async function refundWithdrawal(withdrawalId: string, makeAvailable: boolean): Promise<RefundResult> {
  const supabase = createAdminClient()

  const { data: withdrawal, error } = await supabase
    .from("Withdrawal")
    .select("id, orderId, status, WithdrawalItem (orderItemId), Order (orderNumber)")
    .eq("id", withdrawalId)
    .single()
  if (error) throw new Error(error.message)
  if (!["registered", "return_received"].includes(withdrawal.status)) {
    throw new Error("Deze herroeping is al afgehandeld.")
  }

  const orderItemIds = (withdrawal.WithdrawalItem ?? []).map((item: { orderItemId: string }) => item.orderItemId)

  // Whole order withdrawn (this and other non-rejected withdrawals)?
  const [{ data: allItems }, { data: activeLinks }] = await Promise.all([
    supabase.from("OrderItem").select("id").eq("orderId", withdrawal.orderId),
    supabase
      .from("WithdrawalItem")
      .select("orderItemId, Withdrawal!inner (orderId, status)")
      .eq("Withdrawal.orderId", withdrawal.orderId)
      .neq("Withdrawal.status", "rejected"),
  ])
  const withdrawnIds = new Set((activeLinks ?? []).map((link) => link.orderItemId))
  const includeShipping = (allItems ?? []).every((item) => withdrawnIds.has(item.id))

  const orderNumber = (withdrawal.Order as unknown as { orderNumber: string } | null)?.orderNumber ?? ""
  const result = await refundOrder({
    orderId: withdrawal.orderId,
    orderItemIds,
    includeShipping,
    withdrawalId,
    makeAvailable,
    description: `Art by Lé – terugbetaling herroeping ${orderNumber}`,
  })

  await supabase
    .from("Withdrawal")
    .update({ status: "refunded", refundedAt: new Date().toISOString() })
    .eq("id", withdrawalId)

  return result
}

// Cancels a paid order completely and refunds everything: by the admin (e.g.
// stock conflict, damage before shipping) or by the customer before shipping
export async function cancelAndRefundOrder(
  orderId: string,
  makeAvailable: boolean,
  options: { actor?: Actor; skipRefundEmail?: boolean } = {}
): Promise<RefundResult> {
  const { data: order, error } = await createAdminClient()
    .from("Order")
    .select("orderNumber, OrderItem (id)")
    .eq("id", orderId)
    .single()
  if (error) throw new Error(error.message)

  return refundOrder({
    orderId,
    orderItemIds: (order.OrderItem ?? []).map((item: { id: string }) => item.id),
    includeShipping: true,
    withdrawalId: null,
    makeAvailable,
    description: `Art by Lé – terugbetaling bestelling ${order.orderNumber}`,
    ...options,
  })
}
