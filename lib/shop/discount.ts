// Discounts, shared by the shop, the checkout and the admin.
//
// The real prices are always computed in the database (price_cart in
// supabase/migrations/009_discounts.sql); this is for display only and must
// give the same result.

// A valid sale percentage, or null when the work is not on sale
export function normalizeDiscountPercent(value: unknown): number | null {
  const percent = Number(value)
  return Number.isInteger(percent) && percent >= 1 && percent <= 99 ? percent : null
}

// Price after the sale percentage, rounded to the cent (same as sale_price() in SQL)
export function getSalePrice(price: number, discountPercent: number | null | undefined): number {
  const cents = Math.round(price * 100)
  const percent = normalizeDiscountPercent(discountPercent)
  return percent ? Math.round((cents * (100 - percent)) / 100) / 100 : cents / 100
}

// Codes are stored in capitals; customers may type them in any case
export function normalizeDiscountCode(value: unknown): string {
  return typeof value === "string" ? value.trim().toUpperCase().replace(/\s+/g, "").slice(0, 40) : ""
}

export const DISCOUNT_CODE_PATTERN = /^[A-Z0-9_-]{3,40}$/

export type DiscountType = "percent" | "amount"

export interface DiscountCode {
  id: string
  code: string
  description: string | null
  type: DiscountType
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  validFrom: string | null
  validUntil: string | null
  excludeSaleItems: boolean
  isActive: boolean
  createdAt: string
  // Orders that used the code (expired and cancelled checkouts not counted)
  timesUsed: number
  // Total discount given through paid orders
  totalDiscount: number
}

// Error codes raised by price_cart / create_order, as shown to the customer
const DISCOUNT_ERRORS: Record<string, string> = {
  DISCOUNT_INVALID: "Deze kortingscode bestaat niet of is niet meer geldig.",
  DISCOUNT_NOT_STARTED: "Deze kortingscode is nog niet geldig.",
  DISCOUNT_EXPIRED: "Deze kortingscode is verlopen.",
  DISCOUNT_USED_UP: "Deze kortingscode is al het maximum aantal keer gebruikt.",
  DISCOUNT_NOT_APPLICABLE: "Deze kortingscode geldt niet voor de werken in je winkelmand (ze staan al in korting).",
  DISCOUNT_TOO_HIGH: "Deze kortingscode kan niet gebruikt worden voor deze bestelling. Neem contact op.",
}

export function isDiscountError(code: string): boolean {
  return code.startsWith("DISCOUNT_")
}

// details: the minimum amount for DISCOUNT_MIN_AMOUNT (from the database error)
export function getDiscountErrorMessage(code: string, details?: string | null): string {
  if (code === "DISCOUNT_MIN_AMOUNT") {
    const minimum = Number(details)
    return Number.isFinite(minimum) && minimum > 0
      ? `Deze kortingscode geldt vanaf ${new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(minimum)} aan kunstwerken.`
      : "Je bestelling haalt het minimumbedrag voor deze kortingscode niet."
  }
  return DISCOUNT_ERRORS[code] ?? DISCOUNT_ERRORS.DISCOUNT_INVALID
}

// "20%" or "€ 15", for labels
export function describeDiscount(type: DiscountType, value: number): string {
  return type === "percent"
    ? `${value}%`
    : new Intl.NumberFormat("nl-BE", { style: "currency", currency: "EUR" }).format(value)
}
