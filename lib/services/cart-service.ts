<<<<<<<< HEAD:lib/favorites-service.ts
import type { Favorites, FavoritesItem, Product, IFavoritesService } from "./types"
========
import type { Cart, CartItem, Product, ICartService } from "../types"
>>>>>>>> d785179fef0256701e4716f7cc2c24e75284244c:lib/services/cart-service.ts

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function calculateFavorites(items: FavoritesItem[]): Favorites {
  return {
    items,
    total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    itemCount: items.length,
  }
}


class LocalStorageFavoritesService implements IFavoritesService {
  private readonly STORAGE_KEY = "byle-favorites"

  private getStoredItems(): FavoritesItem[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const items = JSON.parse(stored) as FavoritesItem[]
      // Restore Date objects
      return items.map(item => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }))
    } catch {
      return []
    }
  }

  private saveItems(items: FavoritesItem[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items))
  }

  async getFavorites(): Promise<Favorites> {
    const items = this.getStoredItems()
    return calculateFavorites(items)
  }

  async includesFavorite(favoriteItemId: string): Promise<boolean> {
    if (typeof window === undefined) return false;

    const items = this.getStoredItems()

    return items.some(item => item.id === favoriteItemId)
  }

  async addItem(product: Product, quantity: number = 1): Promise<Favorites> {
    const items = this.getStoredItems()

    // Check if product already in favorites
    const existingIndex = items.findIndex(item => item.product.id === product.id)

    if (existingIndex > -1) {
      // Update quantity
      items[existingIndex].quantity += quantity
    } else {
      // Add new item
      items.push({
        id: generateId(),
        product,
        quantity,
        addedAt: new Date(),
      })
    }

    this.saveItems(items)
    return calculateFavorites(items)
  }

  async removeItem(favoriteItemId: string): Promise<Favorites> {
    const items = this.getStoredItems()
    const filtered = items.filter(item => item.id !== favoriteItemId)
    this.saveItems(filtered)
    return calculateFavorites(filtered)
  }

  async updateQuantity(favoriteItemId: string, quantity: number): Promise<Favorites> {
    const items = this.getStoredItems()
    const index = items.findIndex(item => item.id === favoriteItemId)

    if (index > -1) {
      if (quantity <= 0) {
        items.splice(index, 1)
      } else {
        items[index].quantity = quantity
      }
    }

    this.saveItems(items)
    return calculateFavorites(items)
  }

  async clearFavorites(): Promise<Favorites> {
    this.saveItems([])
    return calculateFavorites([])
  }
}

export const favoritesService: IFavoritesService = new LocalStorageFavoritesService()
