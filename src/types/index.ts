/**
 * Core type definitions for the Asper Beauty Shop application
 * 
 * This file contains all the main TypeScript interfaces and types
 * used throughout the application for type safety and better DX.
 */

// ============================================================================
// Product Types
// ============================================================================

export interface Product {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  vendor: string;
  productType: string;
  tags: string[];
  priceRange: PriceRange;
  images: ProductImage[];
  variants: ProductVariant[];
  metafields?: ProductMetafield[];
  availableForSale?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

export interface ProductVariant {
  id: string;
  title: string;
  price: Money;
  compareAtPrice?: Money;
  availableForSale: boolean;
  quantityAvailable?: number;
  selectedOptions: SelectedOption[];
  sku?: string;
  weight?: number;
  weightUnit?: string;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface Money {
  amount: string;
  currencyCode: string;
}

export interface PriceRange {
  minVariantPrice: Money;
  maxVariantPrice: Money;
}

export interface ProductMetafield {
  key: string;
  value: string;
  type: string;
  namespace?: string;
}

// ============================================================================
// Collection Types
// ============================================================================

export interface Collection {
  id: string;
  title: string;
  handle: string;
  description: string;
  image?: CollectionImage;
  products: Product[];
  productsCount?: number;
}

export interface CollectionImage {
  url: string;
  altText: string | null;
  width?: number;
  height?: number;
}

// ============================================================================
// Cart Types
// ============================================================================

export interface CartItem {
  productId: string;
  variantId: string;
  title: string;
  variant?: string;
  price: number;
  quantity: number;
  image: string;
  handle: string;
  maxQuantity?: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// ============================================================================
// Order Types
// ============================================================================

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  order_items: OrderItem[];
  total_amount: number;
  status: OrderStatus;
  payment_method: PaymentMethod;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variant?: string;
  quantity: number;
  price: number;
  total: number;
}

export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'processing'
  | 'shipped' 
  | 'delivered' 
  | 'cancelled';

export type PaymentMethod = 'cod' | 'online' | 'bank_transfer';

export interface OrderInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  order_items: OrderItem[];
  total_amount: number;
  payment_method: PaymentMethod;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language: Language;
  newsletter: boolean;
  notifications: boolean;
}

// ============================================================================
// Language & Internationalization
// ============================================================================

export type Language = 'en' | 'ar';

export type Direction = 'ltr' | 'rtl';

export interface LanguageContextType {
  language: Language;
  direction: Direction;
  setLanguage: (lang: Language) => void;
}

// ============================================================================
// Search & Filter Types
// ============================================================================

export interface SearchFilters {
  query?: string;
  brand?: string;
  category?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  skinConcern?: string;
  sortBy?: SortOption;
}

export type SortOption = 
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'title-asc'
  | 'title-desc'
  | 'newest'
  | 'best-selling';

// ============================================================================
// Brand Types
// ============================================================================

export interface Brand {
  id: string;
  name: string;
  handle: string;
  logo: string;
  description?: string;
  featured?: boolean;
}

// ============================================================================
// Category Types
// ============================================================================

export interface Category {
  id: string;
  name: string;
  handle: string;
  image: string;
  description?: string;
  productCount?: number;
}

// ============================================================================
// Skin Concern Types
// ============================================================================

export interface SkinConcern {
  id: string;
  name: string;
  handle: string;
  image: string;
  description: string;
}

// ============================================================================
// Wishlist Types
// ============================================================================

export interface WishlistItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  handle: string;
  addedAt: string;
}

// ============================================================================
// Checkout Types
// ============================================================================

export interface Checkout {
  id: string;
  webUrl: string;
  lineItems: CheckoutLineItem[];
  totalPrice: Money;
  subtotalPrice: Money;
  totalTax: Money;
  shippingAddress?: Address;
  email?: string;
}

export interface CheckoutLineItem {
  id: string;
  title: string;
  quantity: number;
  variant: ProductVariant;
}

export interface Address {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  loading?: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  field?: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// ============================================================================
// Utility Types
// ============================================================================

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type ID = string | number;

export type Timestamp = string | Date;

// ============================================================================
// Feature Flag Types
// ============================================================================

export interface FeatureFlags {
  beautyAssistant: boolean;
  bulkUpload: boolean;
  guestCheckout: boolean;
  productReviews: boolean;
}
