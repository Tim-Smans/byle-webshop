"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { Favorites, Product } from "../types"
import { favoritesService } from "../services/favorites-service"

interface FavoritesContextValue {
  favorites: Favorites
  isLoading: boolean
  isOpen: boolean
  openFavorites: () => void
  closeFavorites: () => void
  toggleFavorites: () => void
  addItem: (product: Product, quantity?: number) => Promise<void>
  removeItem: (cartItemId: string) => Promise<void>
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>
  clearFavorites: () => Promise<void>
}

const emptyFavorites: Favorites = { items: [], total: 0, itemCount: 0 }

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorites>(emptyFavorites)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)

  // Load favorites on mount
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const loadedFavorites = await favoritesService.getFavorites()
        setFavorites(loadedFavorites)
      } catch (error) {
        console.error("Failed to load favorites:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFavorites()
  }, [])

  const openFavorites = useCallback(() => setIsOpen(true), [])
  const closeFavorites = useCallback(() => setIsOpen(false), [])
  const toggleFavorites = useCallback(() => setIsOpen(prev => !prev), [])

  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      const updatedFavorites = await favoritesService.addItem(product, quantity)
      setFavorites(updatedFavorites)
      setIsOpen(true) // Open favorites when adding item
    } catch (error) {
      console.error("Failed to add item:", error)
      throw error
    }
  }, [])

  const removeItem = useCallback(async (favoritesItemId: string) => {
    try {
      const updatedFavorites = await favoritesService.removeItem(favoritesItemId)
      setFavorites(updatedFavorites)
    } catch (error) {
      console.error("Failed to remove item:", error)
      throw error
    }
  }, [])

  const updateQuantity = useCallback(async (favoritesItemId: string, quantity: number) => {
    try {
      const updatedFavorites = await favoritesService.updateQuantity(favoritesItemId, quantity)
      setFavorites(updatedFavorites)
    } catch (error) {
      console.error("Failed to update quantity:", error)
      throw error
    }
  }, [])

  const clearFavorites = useCallback(async () => {
    try {
      const updatedFavorites = await favoritesService.clearFavorites()
      setFavorites(updatedFavorites)
    } catch (error) {
      console.error("Failed to clear cart:", error)
      throw error
    }
  }, [])

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        isLoading,
        isOpen,
        openFavorites,
        closeFavorites,
        toggleFavorites,
        addItem,
        removeItem,
        updateQuantity,
        clearFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}
