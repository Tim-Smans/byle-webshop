// Webshop settings. Change here, not scattered through the code.

// VAT rate (%) included in all prices. To confirm with the accountant: the
// sale of original artworks by the artist may fall under the 6% rate.
export const VAT_RATE = 21

// How long a work stays reserved for someone who started paying
export const RESERVATION_MINUTES = 30

// Version of the terms the customer accepts at checkout. Update together with
// the "Laatst bijgewerkt" date in the Terms of Service dialog.
export const TERMS_VERSION = "2026-10-04"
export const TERMS_LAST_UPDATED = "4 oktober 2026"

// Shown before ordering (legally required delivery information)
export const DELIVERY_TIME_TEXT = "Je kunstwerk wordt binnen 5 werkdagen na betaling verzonden."

export const PICKUP_LOCATION_TEXT = "Afhalen in Vlimmeren (Beerse), op afspraak"

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  return url.replace(/\/$/, "")
}
