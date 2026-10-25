import type { SizeClass } from "../types"

export interface ShippingRate {
  id: string
  countryCode: string
  countryName: string
  priceSmall: number
  priceLarge: number
  isActive: boolean
}

// One shipment per order: the largest work determines the rate
export function getShippingCost(rate: ShippingRate, sizeClasses: SizeClass[]): number {
  if (sizeClasses.length === 0) return 0
  return sizeClasses.includes("large") ? rate.priceLarge : rate.priceSmall
}

export function mapShippingRate(row: Record<string, unknown>): ShippingRate {
  return {
    id: row.id as string,
    countryCode: row.countryCode as string,
    countryName: row.countryName as string,
    priceSmall: Number(row.priceSmall),
    priceLarge: Number(row.priceLarge),
    isActive: Boolean(row.isActive),
  }
}
