import "server-only"
import { createAdminClient } from "../supabase/admin"
import {
  formatDateString,
  getWithdrawalLastDay,
  isWithinWithdrawalPeriod,
} from "../orders/withdrawal-period"

const WITHDRAWABLE_STATUSES = ["paid", "shipped", "delivered", "completed", "withdrawn"]

export interface WithdrawableItem {
  id: string
  title: string
  dimensions: string | null
  imageUrl: string | null
  price: number
}

export type WithdrawalLookup =
  | {
      ok: true
      orderId: string
      orderNumber: string
      orderedOn: string
      lastDayLabel: string | null
      items: WithdrawableItem[]
    }
  | { ok: false; reason: "not_found" | "not_paid" | "expired" | "nothing_left" | "custom_work"; lastDayLabel?: string }

const normalizeEmail = (email: string) => email.trim().toLowerCase()

// Finds the order by number and either the e-mail address used to order or
// the secret token from the order e-mail. Both are needed, so order numbers
// alone reveal nothing.
export async function lookupWithdrawableOrder(input: {
  orderNumber: string
  email: string
  token?: string
}): Promise<WithdrawalLookup> {
  const orderNumber = input.orderNumber.trim().toUpperCase()
  if (!orderNumber) return { ok: false, reason: "not_found" }

  const { data: order, error } = await createAdminClient()
    .from("Order")
    .select(`
      id, orderNumber, accessToken, customerEmail, status, createdAt, deliveredAt,
      OrderItem (id, title, dimensions, imageUrl, price, withdrawalApplicable,
        WithdrawalItem (Withdrawal (status)))
    `)
    .eq("orderNumber", orderNumber)
    .maybeSingle()
  if (error) throw new Error(error.message)

  const matches =
    !!order &&
    ((input.token && input.token === order.accessToken) ||
      normalizeEmail(order.customerEmail) === normalizeEmail(input.email))
  if (!order || !matches) return { ok: false, reason: "not_found" }

  if (!WITHDRAWABLE_STATUSES.includes(order.status)) return { ok: false, reason: "not_paid" }

  const lastDay = getWithdrawalLastDay(order.deliveredAt)
  const lastDayLabel = lastDay ? formatDateString(lastDay) : null
  if (!isWithinWithdrawalPeriod(order.deliveredAt)) {
    return { ok: false, reason: "expired", lastDayLabel: lastDayLabel ?? undefined }
  }

  type ItemRow = {
    id: string
    title: string
    dimensions: string | null
    imageUrl: string | null
    price: number
    withdrawalApplicable: boolean
    WithdrawalItem: { Withdrawal: { status: string } | null }[] | null
  }
  const rows = (order.OrderItem ?? []) as unknown as ItemRow[]

  const applicable = rows.filter((item) => item.withdrawalApplicable)
  if (applicable.length === 0) return { ok: false, reason: "custom_work" }

  const open = applicable.filter(
    (item) => !(item.WithdrawalItem ?? []).some((link) => link.Withdrawal && link.Withdrawal.status !== "rejected")
  )
  if (open.length === 0) return { ok: false, reason: "nothing_left" }

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderedOn: order.createdAt,
    lastDayLabel,
    items: open.map((item) => ({
      id: item.id,
      title: item.title,
      dimensions: item.dimensions,
      imageUrl: item.imageUrl,
      price: Number(item.price),
    })),
  }
}

const RPC_ERRORS: Record<string, string> = {
  ORDER_NOT_PAID: "Deze bestelling kan niet herroepen worden.",
  NO_ITEMS: "Kies minstens één kunstwerk.",
  INVALID_ITEMS: "Een van de gekozen werken kan niet herroepen worden.",
  ALREADY_WITHDRAWN: "Een van de gekozen werken werd al herroepen.",
}

export async function registerWithdrawal(input: {
  orderId: string
  name: string
  email: string
  orderNumberInput: string
  reason: string
  orderItemIds: string[]
}): Promise<{ id: string; submittedAt: string }> {
  const { data, error } = await createAdminClient().rpc("register_withdrawal", {
    p_order_id: input.orderId,
    p_name: input.name,
    p_email: input.email,
    p_order_number_input: input.orderNumberInput,
    p_reason: input.reason,
    p_order_item_ids: input.orderItemIds,
  })

  if (error) {
    const known = RPC_ERRORS[error.message]
    if (!known) console.error("[withdrawal] register failed:", error)
    throw new Error(known ?? "Je herroeping kon niet geregistreerd worden. Probeer opnieuw of neem contact op.")
  }

  const withdrawal = data as { id: string; submittedAt: string }
  return { id: withdrawal.id, submittedAt: withdrawal.submittedAt }
}
