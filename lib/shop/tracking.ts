// All shipments go with bpost. Change CARRIER_NAME and the URL here if that
// ever changes; the e-mail, the order page and the admin follow.
export const CARRIER_NAME = "bpost"

// bpost Track & Trace. The postal code is optional; with it bpost shows the
// full delivery details straight away.
export function getTrackingUrl(trackingCode: string, postalCode?: string | null): string {
  const params = new URLSearchParams({ itemCode: trackingCode.trim(), lang: "nl" })
  if (postalCode) params.set("postalCode", postalCode.trim())
  return `https://track.bpost.cloud/btr/web/#/search?${params}`
}
