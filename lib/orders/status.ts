export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "shipped"
  | "delivered"
  | "completed"
  | "expired"
  | "cancelled"
  | "withdrawn"
  | "refunded"

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Wacht op betaling",
  paid: "Betaald – klaarmaken",
  shipped: "Verzonden",
  delivered: "Geleverd",
  completed: "Afgerond",
  expired: "Betaling mislukt",
  cancelled: "Geannuleerd",
  withdrawn: "Herroepen",
  refunded: "Terugbetaald",
}

// Tailwind classes per status, for badges in the admin
export const ORDER_STATUS_STYLES: Record<OrderStatus, string> = {
  pending_payment: "bg-muted text-muted-foreground",
  paid: "bg-amber-100 text-amber-800",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  completed: "bg-emerald-100 text-emerald-800",
  expired: "bg-muted text-muted-foreground",
  cancelled: "bg-muted text-muted-foreground",
  withdrawn: "bg-rose-100 text-rose-800",
  refunded: "bg-rose-100 text-rose-800",
}

// Statuses where the customer actually paid
export const PAID_ORDER_STATUSES: OrderStatus[] = ["paid", "shipped", "delivered", "completed", "withdrawn", "refunded"]

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status as OrderStatus] ?? status
}

export function getOrderStatusStyle(status: string): string {
  return ORDER_STATUS_STYLES[status as OrderStatus] ?? "bg-muted text-muted-foreground"
}
