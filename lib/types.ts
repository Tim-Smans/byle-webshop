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

// User / Auth types
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  createdAt: Date
}

export interface AuthResult {
  success: boolean
  user?: User
  error?: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface LoginData {
  email: string
  password: string
}

// Auth service interface - implement this for database integration
export interface IAuthService {
  getCurrentUser(): Promise<User | null>
  login(data: LoginData): Promise<AuthResult>
  register(data: RegisterData): Promise<AuthResult>
  logout(): Promise<void>
  updateProfile(userId: string, data: Partial<User>): Promise<AuthResult>
}
