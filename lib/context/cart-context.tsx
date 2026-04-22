"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { Cart, Product } from "../types"
import { cartService } from "../services/cart-service"

interface CartContextValue {
  cart: Cart
  isLoading: boolean
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
}

const emptyCart: Cart = { items: [], total: 0, itemCount: 0 }

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(emptyCart)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  // Load cart on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const loadedCart = await cartService.getCart()
        setCart(loadedCart)
      } catch (error) {
        console.error("Failed to load cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])
  const toggleCart = useCallback(() => setIsOpen(prev => !prev), [])

  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      const updatedCart = await cartService.addItem(product, quantity)
      setCart(updatedCart)
      setIsOpen(true) // Open cart when adding item
    } catch (error) {
      console.error("Failed to add item:", error)
      throw error
    }
  }, [])

  const removeItem = useCallback(async (cartItemId: string) => {
    try {
      const updatedCart = await cartService.removeItem(cartItemId)
      setCart(updatedCart)
    } catch (error) {
      console.error("Failed to remove item:", error)
      throw error
    }
  }, [])

  const updateQuantity = useCallback(async (cartItemId: string, quantity: number) => {
    try {
      const updatedCart = await cartService.updateQuantity(cartItemId, quantity)
      setCart(updatedCart)
    } catch (error) {
      console.error("Failed to update quantity:", error)
      throw error
    }
  }, [])

  const clearCart = useCallback(async () => {
    try {
      const updatedCart = await cartService.clearCart()
      setCart(updatedCart)
    } catch (error) {
      console.error("Failed to clear cart:", error)
      throw error
    }
  }, [])

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
