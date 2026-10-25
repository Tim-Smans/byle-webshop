import "server-only"
import { createAdminClient } from "../supabase/admin"
import { getCountryName } from "../shop/countries"
import type { EmailOrderItem } from "./templates/layout"

export interface EmailOrder {
  id: string
  orderNumber: string
  accessToken: string
  status: string
  createdAt: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string | null
  companyName: string | null
  vatNumber: string | null
  shippingMethod: "ship" | "pickup"
  shippingStreet: string | null
  shippingPostalCode: string | null
  shippingCity: string | null
  shippingCountry: string | null
  subtotal: number
  shippingCost: number
  total: number
  vatAmount: number
  trackingCode: string | null
  hasStockConflict: boolean
  items: (EmailOrderItem & { withdrawalApplicable: boolean })[]
}

export async function loadEmailOrder(orderId: string): Promise<EmailOrder> {
  const { data, error } = await createAdminClient()
    .from("Order")
    .select("*, OrderItem (title, dimensions, imageUrl, price, withdrawalApplicable), OrderEvent (type)")
    .eq("id", orderId)
    .single()
  if (error) throw new Error(error.message)

  return {
    id: data.id,
    orderNumber: data.orderNumber,
    accessToken: data.accessToken,
    status: data.status,
    createdAt: data.createdAt,
    customerFirstName: data.customerFirstName,
    customerLastName: data.customerLastName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    companyName: data.companyName,
    vatNumber: data.vatNumber,
    shippingMethod: data.shippingMethod,
    shippingStreet: data.shippingStreet,
    shippingPostalCode: data.shippingPostalCode,
    shippingCity: data.shippingCity,
    shippingCountry: data.shippingCountryCode
      ? getCountryName(data.shippingCountryCode) ?? data.shippingCountryCode
      : null,
    subtotal: Number(data.subtotal),
    shippingCost: Number(data.shippingCost),
    total: Number(data.total),
    vatAmount: Number(data.vatAmount),
    trackingCode: data.trackingCode,
    hasStockConflict: ((data.OrderEvent ?? []) as { type: string }[]).some((event) => event.type === "stock_conflict"),
    items: ((data.OrderItem ?? []) as Record<string, unknown>[]).map((item) => ({
      title: item.title as string,
      dimensions: (item.dimensions as string | null) ?? null,
      imageUrl: (item.imageUrl as string | null) ?? null,
      price: Number(item.price),
      withdrawalApplicable: Boolean(item.withdrawalApplicable),
    })),
  }
}
