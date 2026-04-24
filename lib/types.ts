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
export interface FavoritesItem {
  id: string // unique cart item id
  product: Product
  quantity: number
  addedAt: Date
}

export interface Favorites {
  items: FavoritesItem[]
  total: number
  itemCount: number
}

// Cart service interface - implement this for database integration
export interface IFavoritesService {
  getFavorites(): Promise<Favorites>
  addItem(product: Product, quantity?: number): Promise<Favorites>
  removeItem(cartItemId: string): Promise<Favorites>
  updateQuantity(cartItemId: string, quantity: number): Promise<Favorites>
  clearFavorites(): Promise<Favorites>
  includesFavorite(cartItemId: string) : Promise<boolean>
}
