// Product types
export interface Product {
  id: string,
  title: string,
  artist: string,
  dimensions: string,
  price: number,
  description: string,
  isFeatured: boolean,
  frame: string,
  structure: string,
  presentation: string,
  edition: string,
  finish: string,
  isSold: boolean,
  status: ArtPieceStatus,
  sizeClass: SizeClass,
  collectionId: string,
  creationTime: string,
  images: Image[],
  labels: Label[],
  shippingInfo: string
}

export type ArtPieceStatus = "available" | "reserved" | "sold"
export type SizeClass = "small" | "large"

// What a customer sees: an expired reservation counts as available again
export type Availability = "available" | "reserved" | "sold"

// Shopping cart: only ids are stored client-side, details are always refetched
export interface CartItem {
  artPieceId: string
  title: string
  dimensions: string
  price: number
  imageUrl: string | null
  sizeClass: SizeClass
  availability: Availability
  reservedByOrderId: string | null
  // Reserved by the order this browser started paying for
  reservedByMe: boolean
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
  includesFavorite(cartItemId: string): Promise<boolean>
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

export interface Statistic {
  id: string,
  title: string
  value: string
}

export interface ArtPiece {
  id: string,
  title: string,
  artist: string,
  dimensions: string,
  price: number,
  description: string,
  isFeatured: boolean,
  frame: string,
  structure: string,
  presentation: string,
  edition: string,
  finish: string,
  isSold: boolean,
  status: ArtPieceStatus,
  sizeClass: SizeClass,
  reservedUntil: string | null,
  reservedByOrderId: string | null,
  collectionId: string,
  creationTime: string,
  images: Image[],
  labels: Label[],
  shippingInfo: string
}

export interface Image {
  id: string,
  pieceId: string,
  url: string,
  index: number,
  blurDataUrl?: string
}

export interface Collection {
  id: string,
  title: string,
  thumbnailUrl: string,
  description: string
}

export interface Label {
  id: string,
  title: string
}

export interface PieceLabel {
  id: string,
  pieceId: string,
  labelId: string
}

export type CvData = {
  events: { date: string; name: string }[]
  themes: string[]
  mediums: string[]
  commissions: number
}
