/**
 * Application-wide constants
 * 
 * This file contains all constants used throughout the application
 * for consistency and easy maintenance.
 */

// ============================================================================
// Application Info
// ============================================================================

export const APP_NAME = 'Asper Beauty Shop';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'A luxury e-commerce storefront for premium skincare and beauty products';

// ============================================================================
// URLs
// ============================================================================

export const SITE_URL = 'https://asperbeautyshop.lovable.app';
export const GITHUB_REPO = 'https://github.com/Asper-Beauty-Shop/Asper-Beauty-Shop';

// ============================================================================
// Contact Information
// ============================================================================

export const CONTACT_EMAIL = 'info@asperbeauty.com';
export const CONTACT_PHONE = '+962 123 456 789';
export const CONTACT_ADDRESS = 'Amman, Jordan';

// Social Media Links
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/asperbeauty',
  instagram: 'https://instagram.com/asperbeauty',
  twitter: 'https://twitter.com/asperbeauty',
  youtube: 'https://youtube.com/@asperbeauty',
} as const;

// ============================================================================
// Design System
// ============================================================================

export const COLORS = {
  maroon: '#800020',
  softIvory: '#F8F8FF',
  shinyGold: '#C5A028',
  darkCharcoal: '#333333',
} as const;

export const FONTS = {
  display: 'Playfair Display',
  body: 'Montserrat',
  arabic: 'Tajawal',
} as const;

// ============================================================================
// Pagination
// ============================================================================

export const ITEMS_PER_PAGE = {
  products: 12,
  collections: 9,
  orders: 20,
  search: 24,
} as const;

// ============================================================================
// Cache Duration (in milliseconds)
// ============================================================================

export const CACHE_TIME = {
  products: 5 * 60 * 1000, // 5 minutes
  collections: 10 * 60 * 1000, // 10 minutes
  brands: 15 * 60 * 1000, // 15 minutes
  user: 30 * 60 * 1000, // 30 minutes
} as const;

// ============================================================================
// Local Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  cart: 'asper-beauty-cart',
  wishlist: 'asper-beauty-wishlist',
  language: 'asper-beauty-language',
  theme: 'asper-beauty-theme',
  recentlyViewed: 'asper-beauty-recently-viewed',
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  generic: 'Something went wrong. Please try again.',
  network: 'Network error. Please check your connection.',
  notFound: 'The requested resource was not found.',
  unauthorized: 'You must be logged in to perform this action.',
  validation: 'Please check your input and try again.',
  productNotFound: 'Product not found.',
  outOfStock: 'This product is currently out of stock.',
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  addedToCart: 'Added to cart successfully!',
  addedToWishlist: 'Added to wishlist!',
  removedFromWishlist: 'Removed from wishlist.',
  orderPlaced: 'Order placed successfully!',
  profileUpdated: 'Profile updated successfully!',
  emailSent: 'Email sent successfully!',
} as const;
