// Webshop settings. Change here, not scattered through the code.

// Art by Lé falls under the Belgian VAT exemption for small enterprises
// (art. 56bis WBTW): no VAT is charged. If that ever changes, set the rate
// here; invoices, totals and texts follow automatically.
export const VAT_RATE = 0

// Legally required mention on invoices under the exemption
export const VAT_EXEMPTION_NOTE = "Bijzondere vrijstellingsregeling kleine ondernemingen"

// Shown with prices in the shop
export const PRICE_VAT_TEXT =
  VAT_RATE === 0
    ? "Geen btw van toepassing (vrijstellingsregeling kleine ondernemingen)."
    : "Prijzen inclusief btw."

// How long a work stays reserved for someone who started paying
export const RESERVATION_MINUTES = 30

// Version of the terms the customer accepts at checkout. Update together with
// the "Laatst bijgewerkt" date in the Terms of Service dialog.
export const TERMS_VERSION = "2026-10-11"
export const TERMS_LAST_UPDATED = "11 oktober 2026"

// Shown before ordering (legally required delivery information)
export const DELIVERY_TIME_TEXT = "Je kunstwerk wordt binnen 5 werkdagen na betaling verzonden."

export const PICKUP_LOCATION_TEXT = "Afhalen in Vlimmeren (Beerse), op afspraak"

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  return url.replace(/\/$/, "")
}
