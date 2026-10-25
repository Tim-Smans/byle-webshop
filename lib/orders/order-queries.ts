import "server-only"
import { createAdminClient } from "../supabase/admin"

export interface OrderItemView {
  id: string
  artPieceId: string | null
  title: string
  dimensions: string | null
  imageUrl: string | null
  price: number
}

export interface OrderView {
  id: string
  orderNumber: string
  status: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  shippingMethod: "ship" | "pickup"
  shippingCountryCode: string | null
  shippingStreet: string | null
  shippingPostalCode: string | null
  shippingCity: string | null
  subtotal: number
  shippingCost: number
  total: number
  vatAmount: number
  createdAt: string
  paidAt: string | null
  shippedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  trackingCode: string | null
  withdrawals: { submittedAt: string; status: string; refundedAt: string | null }[]
  items: OrderItemView[]
}

// Looks up an order for the customer. The access token is the secret from the
// link in their e-mail / Mollie redirect; without it nothing is returned.
export async function getOrderForCustomer(orderNumber: string, accessToken: string): Promise<OrderView | null> {
  if (!orderNumber || !accessToken) return null

  const { data, error } = await createAdminClient()
    .from("Order")
    .select("*, OrderItem (id, artPieceId, title, dimensions, imageUrl, price), Withdrawal (submittedAt, status, refundedAt)")
    .eq("orderNumber", orderNumber)
    .eq("accessToken", accessToken)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return {
    id: data.id,
    orderNumber: data.orderNumber,
    status: data.status,
    customerFirstName: data.customerFirstName,
    customerLastName: data.customerLastName,
    customerEmail: data.customerEmail,
    shippingMethod: data.shippingMethod,
    shippingCountryCode: data.shippingCountryCode,
    shippingStreet: data.shippingStreet,
    shippingPostalCode: data.shippingPostalCode,
    shippingCity: data.shippingCity,
    subtotal: Number(data.subtotal),
    shippingCost: Number(data.shippingCost),
    total: Number(data.total),
    vatAmount: Number(data.vatAmount),
    createdAt: data.createdAt,
    paidAt: data.paidAt,
    shippedAt: data.shippedAt,
    deliveredAt: data.deliveredAt,
    cancelledAt: data.cancelledAt,
    trackingCode: data.trackingCode,
    withdrawals: ((data.Withdrawal ?? []) as { submittedAt: string; status: string; refundedAt: string | null }[])
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)),
    items: ((data.OrderItem ?? []) as Record<string, unknown>[]).map((item) => ({
      id: item.id as string,
      artPieceId: (item.artPieceId as string | null) ?? null,
      title: item.title as string,
      dimensions: (item.dimensions as string | null) ?? null,
      imageUrl: (item.imageUrl as string | null) ?? null,
      price: Number(item.price),
    })),
  }
}

export async function getLatestMolliePaymentId(orderId: string): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .from("Payment")
    .select("molliePaymentId")
    .eq("orderId", orderId)
    .order("createdAt", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data?.molliePaymentId ?? null
}
