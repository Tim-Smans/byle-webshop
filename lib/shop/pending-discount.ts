// A discount code the visitor picked up (e.g. by clicking it in the banner),
// applied automatically at checkout. Only a convenience: the checkout checks
// the code like any typed code.

import { normalizeDiscountCode } from "./discount"

const STORAGE_KEY = "byle-discount-code"
export const PENDING_DISCOUNT_EVENT = "byle:discount-code"

export const pendingDiscountStore = {
  get(): string | null {
    try {
      return normalizeDiscountCode(localStorage.getItem(STORAGE_KEY)) || null
    } catch {
      return null
    }
  },

  // Also tells an open checkout to apply it right away
  set(code: string): void {
    const normalized = normalizeDiscountCode(code)
    if (!normalized) return
    try {
      localStorage.setItem(STORAGE_KEY, normalized)
    } catch {
      // Storage blocked: the event below still reaches an open checkout
    }
    window.dispatchEvent(new CustomEvent(PENDING_DISCOUNT_EVENT, { detail: normalized }))
  },

  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
  },
}
