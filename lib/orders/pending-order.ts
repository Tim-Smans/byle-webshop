"use client"

import { useSyncExternalStore } from "react"

// Remembers the order this browser started paying for. Lets the customer see
// their own reservation as theirs, and lets a new checkout cancel the old one
// instead of being blocked by it for the whole reservation period.

const STORAGE_KEY = "byle-pending-order"

export interface PendingOrder {
  orderId: string
  orderNumber: string
  accessToken: string
}

let cachedRaw: string | null | undefined
let cachedValue: PendingOrder | null = null
const listeners = new Set<() => void>()

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function notify() {
  listeners.forEach((listener) => listener())
}

export const pendingOrderStore = {
  subscribe(listener: () => void): () => void {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) listener()
    }

    listeners.add(listener)
    window.addEventListener("storage", handleStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener("storage", handleStorage)
    }
  },

  get(): PendingOrder | null {
    const raw = readRaw()
    if (raw !== cachedRaw) {
      cachedRaw = raw
      try {
        const parsed = raw ? JSON.parse(raw) : null
        cachedValue =
          parsed && typeof parsed.orderId === "string" && typeof parsed.accessToken === "string"
            ? parsed
            : null
      } catch {
        cachedValue = null
      }
    }
    return cachedValue
  },

  set(order: PendingOrder): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
    } catch {
      // Storage blocked: the customer just waits for the reservation to expire
    }
    notify()
  },

  // Only forgets it when it is still the given order
  clear(orderNumber?: string): void {
    const current = pendingOrderStore.get()
    if (!current || (orderNumber && current.orderNumber !== orderNumber)) return

    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    notify()
  },
}

const getServerSnapshot = () => null

export function usePendingOrder(): PendingOrder | null {
  return useSyncExternalStore(pendingOrderStore.subscribe, pendingOrderStore.get, getServerSnapshot)
}
