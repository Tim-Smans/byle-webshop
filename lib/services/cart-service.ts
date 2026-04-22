import type { Cart, CartItem, Product, ICartService } from "../types"

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function calculateCart(items: CartItem[]): Cart {
  return {
    items,
    total: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}


class LocalStorageCartService implements ICartService {
  private readonly STORAGE_KEY = "byle-cart"

  private getStoredItems(): CartItem[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return []

      const items = JSON.parse(stored) as CartItem[]
      // Restore Date objects
      return items.map(item => ({
        ...item,
        addedAt: new Date(item.addedAt)
      }))
    } catch {
      return []
    }
  }

  private saveItems(items: CartItem[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items))
  }

    async getCart(): Promise<Cart> {
    const items = this.getStoredItems()
    return calculateCart(items)
  }

  async addItem(product: Product, quantity: number = 1): Promise<Cart> {
    const items = this.getStoredItems()
    
    // Check if product already in cart
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
    return calculateCart(items)
  }

  async removeItem(cartItemId: string): Promise<Cart> {
    const items = this.getStoredItems()
    const filtered = items.filter(item => item.id !== cartItemId)
    this.saveItems(filtered)
    return calculateCart(filtered)
  }

  async updateQuantity(cartItemId: string, quantity: number): Promise<Cart> {
    const items = this.getStoredItems()
    const index = items.findIndex(item => item.id === cartItemId)
    
    if (index > -1) {
      if (quantity <= 0) {
        items.splice(index, 1)
      } else {
        items[index].quantity = quantity
      }
    }
    
    this.saveItems(items)
    return calculateCart(items)
  }

  async clearCart(): Promise<Cart> {
    this.saveItems([])
    return calculateCart([])
  }
}

export const cartService: ICartService = new LocalStorageCartService()
