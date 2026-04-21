// Product types
export interface Product {
  id: number
  name: string
  artist: string
  price: number
  image: string
  category: string
  size: string
  description?: string
}

// Cart types
export interface CartItem {
  id: string // unique cart item id
  product: Product
  quantity: number
  addedAt: Date
}

export interface Cart {
  items: CartItem[]
  total: number
  itemCount: number
}

// Cart service interface - implement this for database integration
export interface ICartService {
  getCart(): Promise<Cart>
  addItem(product: Product, quantity?: number): Promise<Cart>
  removeItem(cartItemId: string): Promise<Cart>
  updateQuantity(cartItemId: string, quantity: number): Promise<Cart>
  clearCart(): Promise<Cart>
}
