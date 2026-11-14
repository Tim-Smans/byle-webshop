import "server-only"
import { createAdminClient } from "../supabase/admin"

export interface OrderItemView {
  id: string
  artPieceId: string | null
  title: string
  dimensions: string | null
  imageUrl: string | null
  // What the customer paid for this work (also the refund amount)
  price: number
  // Price before the discount code; with the sale already applied
  linePrice: number
  // Normal price, null for orders from before discounts existed
  originalPrice: number | null
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
  discountCode: string | null
  discountAmount: number
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
    .select("*, OrderItem (id, artPieceId, title, dimensions, imageUrl, price, originalPrice, codeDiscount), Withdrawal (submittedAt, status, refundedAt)")
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
    discountCode: data.discountCode ?? null,
    discountAmount: Number(data.discountAmount ?? 0),
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
      // Price of the work before the discount code (the sale price when on sale)
      linePrice: Number(item.price) + Number(item.codeDiscount ?? 0),
      originalPrice: item.originalPrice == null ? null : Number(item.originalPrice),
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
