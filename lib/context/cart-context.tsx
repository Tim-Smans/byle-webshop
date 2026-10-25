"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import type { CartItem } from "../types"
import { cartStorage, fetchCartItems } from "../services/cart-service"
import { usePendingOrder } from "../orders/pending-order"

interface CartContextValue {
  items: CartItem[]
  unavailableItems: CartItem[]
  subtotal: number
  itemCount: number
  isLoading: boolean
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (artPieceId: string) => void
  removeItem: (artPieceId: string) => void
  clearCart: () => void
  isInCart: (artPieceId: string) => boolean
  refresh: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  // Ids live in localStorage (also synced across tabs); details are fetched
  const ids = useSyncExternalStore(cartStorage.subscribe, cartStorage.getSnapshot, cartStorage.getServerSnapshot)
  const pendingOrder = usePendingOrder()
  const [items, setItems] = useState<CartItem[]>([])
  const [loadedFor, setLoadedFor] = useState<string[] | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  // Bumped to refetch availability without the ids changing
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    fetchCartItems(ids)
      .then((loaded) => {
        if (cancelled) return

        // Drop ids of art pieces that no longer exist
        const missing = ids.filter((id) => !loaded.some((item) => item.artPieceId === id))
        if (missing.length > 0) cartStorage.remove(missing)

        setItems(loaded)
      })
      .catch((error) => console.error("Failed to load cart:", error))
      .finally(() => {
        if (!cancelled) setLoadedFor(ids)
      })

    return () => {
      cancelled = true
    }
  }, [ids, refreshKey])

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), [])

  const openCart = useCallback(() => {
    setIsOpen(true)
    refresh()
  }, [refresh])

  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback((artPieceId: string) => {
    cartStorage.add(artPieceId)
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((artPieceId: string) => {
    cartStorage.remove([artPieceId])
  }, [])

  const clearCart = useCallback(() => cartStorage.clear(), [])

  const isInCart = useCallback((artPieceId: string) => ids.includes(artPieceId), [ids])

  const value = useMemo<CartContextValue>(() => {
    // Only show items that are still in the cart, also while refetching.
    // A work reserved by this browser's own unfinished checkout stays
    // available to this customer: a new checkout cancels the old one.
    const visibleItems = items
      .filter((item) => ids.includes(item.artPieceId))
      .map((item) =>
        item.availability === "reserved" && pendingOrder && item.reservedByOrderId === pendingOrder.orderId
          ? { ...item, availability: "available" as const, reservedByMe: true }
          : item
      )
    const unavailableItems = visibleItems.filter((item) => item.availability !== "available")
    const subtotal = visibleItems
      .filter((item) => item.availability === "available")
      .reduce((sum, item) => sum + item.price, 0)

    return {
      items: visibleItems,
      unavailableItems,
      subtotal,
      itemCount: ids.length,
      isLoading: loadedFor === null || ids.some((id) => !loadedFor.includes(id)),
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem,
      clearCart,
      isInCart,
      refresh,
    }
  }, [items, ids, pendingOrder, loadedFor, isOpen, openCart, closeCart, addItem, removeItem, clearCart, isInCart, refresh])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
