import type { CartItem, SizeClass } from "../types"
import { supabase } from "../supabase/client"
import { getAvailability } from "../shop/availability"

// The cart only keeps art piece ids in localStorage. Prices and availability
// are always fetched fresh, and the checkout validates everything again
// server-side.

export const CART_STORAGE_KEY = "byle-cart"

interface StoredCartEntry {
  artPieceId: string
  addedAt: string
}

const EMPTY_IDS: string[] = []

// In-memory fallback when localStorage is blocked (private mode, disabled storage)
let memoryEntries: StoredCartEntry[] = []
let cachedRaw: string | null | undefined
let cachedIds: string[] = EMPTY_IDS
const listeners = new Set<() => void>()

function readRaw(): string | null {
  try {
    return localStorage.getItem(CART_STORAGE_KEY)
  } catch {
    return JSON.stringify(memoryEntries)
  }
}

function parseEntries(raw: string | null): StoredCartEntry[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.filter((entry) => typeof entry?.artPieceId === "string")
      : []
  } catch {
    return []
  }
}

function readEntries(): StoredCartEntry[] {
  if (typeof window === "undefined") return []
  return parseEntries(readRaw())
}

function writeEntries(entries: StoredCartEntry[]): void {
  if (typeof window === "undefined") return

  memoryEntries = entries
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Storage full or blocked: the cart then only lives in memory
  }
  listeners.forEach((listener) => listener())
}

// External store for useSyncExternalStore: snapshots stay referentially
// stable until the stored value changes.
export const cartStorage = {
  subscribe(listener: () => void): () => void {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) listener()
    }

    listeners.add(listener)
    window.addEventListener("storage", handleStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener("storage", handleStorage)
    }
  },

  getSnapshot(): string[] {
    const raw = readRaw()
    if (raw !== cachedRaw) {
      cachedRaw = raw
      cachedIds = parseEntries(raw).map((entry) => entry.artPieceId)
    }
    return cachedIds
  },

  getServerSnapshot(): string[] {
    return EMPTY_IDS
  },

  // Every art piece is unique, so it is in the cart at most once
  add(artPieceId: string): void {
    const entries = readEntries()
    if (!entries.some((entry) => entry.artPieceId === artPieceId)) {
      writeEntries([...entries, { artPieceId, addedAt: new Date().toISOString() }])
    }
  },

  remove(artPieceIds: string[]): void {
    writeEntries(readEntries().filter((entry) => !artPieceIds.includes(entry.artPieceId)))
  },

  clear(): void {
    writeEntries([])
  },
}

// Returns the cart items in cart order. Ids of deleted art pieces are left out.
export async function fetchCartItems(artPieceIds: string[]): Promise<CartItem[]> {
  if (artPieceIds.length === 0) return []

  const { data, error } = await supabase
    .from("ArtPiece")
    .select("id, title, dimensions, price, isSold, status, reservedUntil, reservedByOrderId, sizeClass, Image (url, index)")
    .in("id", artPieceIds)

  if (error) throw error

  const byId = new Map((data ?? []).map((piece) => [piece.id as string, piece]))

  return artPieceIds.flatMap((id) => {
    const piece = byId.get(id)
    if (!piece) return []

    const images = [...((piece.Image ?? []) as { url: string; index: number }[])]
      .sort((a, b) => a.index - b.index)

    return [{
      artPieceId: piece.id,
      title: piece.title,
      dimensions: piece.dimensions ?? "",
      price: Number(piece.price),
      imageUrl: images[0]?.url ?? null,
      sizeClass: (piece.sizeClass ?? "small") as SizeClass,
      availability: getAvailability(piece),
      reservedByOrderId: piece.reservedByOrderId ?? null,
      reservedByMe: false,
    }]
  })
}
