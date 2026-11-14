import "server-only"
import { unstable_cache } from "next/cache"
import { createAdminClient } from "../supabase/admin"
import { describeDiscount, type DiscountType } from "../shop/discount"
import { brusselsToday, endOfBrusselsDay } from "../shop/brussels-time"
import { normalizeBannerTheme, type BannerData, type BannerMessage } from "./types"

// Everything the banner shows is cached under this tag. The admin actions
// (banner and discount codes) revalidate it, so a change is visible at once.
export const ANNOUNCEMENTS_TAG = "announcements"

// Also refreshed on its own, for messages and codes that start or run out
const REVALIDATE_SECONDS = 300

export interface BannerSettings {
  enabled: boolean
}

export async function getBannerSettings(): Promise<BannerSettings> {
  const { data } = await createAdminClient()
    .from("SiteSetting")
    .select("value")
    .eq("key", "announcementBar")
    .maybeSingle()
  return { enabled: Boolean((data?.value as { enabled?: boolean } | null)?.enabled) }
}

export interface CodeRow {
  id: string
  code: string
  type: DiscountType
  value: number
  isActive: boolean
  validFrom: string | null
  validUntil: string | null
  maxUses: number | null
}

// Whether customers can use the code right now (same rules as price_cart,
// except the minimum amount, which depends on the cart)
export async function getUsableCodes(codes: CodeRow[]): Promise<Set<string>> {
  const usable = new Set<string>()
  if (codes.length === 0) return usable

  const today = brusselsToday()
  const limited = codes.filter((code) => code.maxUses !== null).map((code) => code.id)
  const uses = new Map<string, number>()
  if (limited.length > 0) {
    const { data } = await createAdminClient()
      .from("Order")
      .select("discountCodeId")
      .in("discountCodeId", limited)
      .not("status", "in", "(expired,cancelled)")
    for (const row of data ?? []) uses.set(row.discountCodeId, (uses.get(row.discountCodeId) ?? 0) + 1)
  }

  for (const code of codes) {
    if (!code.isActive) continue
    if (code.validFrom && today < code.validFrom) continue
    if (code.validUntil && today > code.validUntil) continue
    if (code.maxUses !== null && (uses.get(code.id) ?? 0) >= code.maxUses) continue
    usable.add(code.id)
  }
  return usable
}

const earliest = (...values: (string | null)[]) =>
  values.filter((value): value is string => !!value).sort()[0] ?? null

// What the banner shows right now. ignoreSwitch: also when the banner is
// switched off (admin preview).
export async function loadBanner(options: { ignoreSwitch?: boolean } = {}): Promise<BannerData | null> {
  try {
    if (!options.ignoreSwitch) {
      const settings = await getBannerSettings()
      if (!settings.enabled) return null
    }

    const { data, error } = await createAdminClient()
      .from("Announcement")
      .select("*, DiscountCode (id, code, type, value, isActive, validFrom, validUntil, maxUses)")
      .eq("isActive", true)
      .order("sortOrder", { ascending: true })
      .order("createdAt", { ascending: true })
    if (error) throw new Error(error.message)

    // Only a handful of messages: the planning is filtered here
    const now = Date.now()
    const rows = (data ?? []).filter(
      (row) =>
        (!row.startsAt || new Date(row.startsAt).getTime() <= now) &&
        (!row.endsAt || new Date(row.endsAt).getTime() > now)
    )
    const codes = rows.map((row) => row.DiscountCode as CodeRow | null).filter((code): code is CodeRow => !!code)
    const usable = await getUsableCodes(codes)

    const messages: BannerMessage[] = []
    for (const row of rows) {
      const code = row.DiscountCode as CodeRow | null
      // A message about a code that can't be used would only disappoint
      if (code && !usable.has(code.id)) continue

      const codeEnd = code?.validUntil ? endOfBrusselsDay(code.validUntil) : null
      const hideAt = earliest(row.endsAt, codeEnd)

      messages.push({
        id: row.id,
        message: row.message,
        linkUrl: row.linkUrl,
        linkLabel: row.linkLabel,
        code: code?.code ?? null,
        codeLabel: code ? `-${describeDiscount(code.type, Number(code.value))}` : null,
        theme: normalizeBannerTheme(row.theme),
        countdownTo: row.showCountdown ? hideAt : null,
        hideAt,
      })
    }

    if (messages.length === 0) return null
    return { messages }
  } catch (err) {
    // The banner must never break the site (e.g. migration not run yet)
    console.error("[banner] could not load announcements:", err)
    return null
  }
}

// For the site: cached, refreshed by the admin actions and every 5 minutes
export const getAnnouncementBanner = unstable_cache(() => loadBanner(), ["announcement-banner"], {
  tags: [ANNOUNCEMENTS_TAG],
  revalidate: REVALIDATE_SECONDS,
})
