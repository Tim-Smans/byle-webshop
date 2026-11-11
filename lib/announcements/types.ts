// Announcement banner: shared by the site, the admin and the server

export const BANNER_THEMES = ["oker", "bruin", "creme", "teal", "feest"] as const
export type BannerTheme = (typeof BANNER_THEMES)[number]

export const BANNER_THEME_LABELS: Record<BannerTheme, string> = {
  oker: "Oker",
  bruin: "Bruin",
  creme: "Crème",
  teal: "Teal",
  feest: "Feest",
}

export function normalizeBannerTheme(value: unknown): BannerTheme {
  return BANNER_THEMES.includes(value as BannerTheme) ? (value as BannerTheme) : "oker"
}

// One message as the visitor gets it. Contains nothing secret: only the code
// the admin chose to show.
export interface BannerMessage {
  id: string
  message: string
  linkUrl: string | null
  linkLabel: string | null
  // Discount code shown as a chip (click = copy + applied at checkout)
  code: string | null
  // "-20%" or "-€ 15", shown on the chip
  codeLabel: string | null
  theme: BannerTheme
  // Moment the countdown runs to; null = no countdown
  countdownTo: string | null
  // Moment the message disappears by itself (end of the message or the code)
  hideAt: string | null
}

export interface BannerData {
  // Changes whenever a message changes: a visitor who closed the banner sees
  // it again when there is something new
  version: string
  messages: BannerMessage[]
}

// Gallery filter for works on sale (see components/shop/shop-component.tsx)
export const SALE_FILTER = "korting"
export const SALE_GALLERY_URL = `/gallery?collectionId=${SALE_FILTER}`

// localStorage key of the closed banner version, also read by the inline
// script in app/layout.tsx
export const BANNER_DISMISSED_KEY = "byle-banner-dismissed"
// Set on <html> when the banner is closed or has nothing to show
export const BANNER_HIDDEN_ATTRIBUTE = "data-banner-hidden"
