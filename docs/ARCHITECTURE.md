# Asper Beauty Shop - Architecture Documentation

## Overview

Asper Beauty Shop is a modern, full-stack e-commerce application built with React, TypeScript, and integrated with Shopify and Supabase. This document describes the system architecture, design decisions, and technical implementation.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │   React SPA (Vite + TypeScript)                       │  │
│  │   - Component-based UI                                 │  │
│  │   - Client-side routing (React Router)                │  │
│  │   - State management (Zustand)                        │  │
│  │   - Tailwind CSS + shadcn/ui                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓ ↑
┌─────────────────────────────────────────────────────────────┐
│                     Integration Layer                        │
│  ┌──────────────────┐         ┌─────────────────────────┐  │
│  │  Shopify API     │         │  Supabase Services      │  │
│  │  - Products      │         │  - Authentication       │  │
│  │  - Collections   │         │  - Database (Orders)    │  │
│  │  - Checkout      │         │  - Edge Functions       │  │
│  └──────────────────┘         └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| TypeScript | 5.8.3 | Type safety |
| Vite | 5.4.19 | Build tool & dev server |
| Tailwind CSS | 3.4.17 | Styling |
| shadcn/ui | latest | UI components |
| React Router | 6.30.1 | Client-side routing |
| Zustand | 5.0.9 | State management |
| TanStack Query | 5.83.0 | Data fetching & caching |

### Directory Structure

```
src/
├── assets/              # Static assets (images, fonts)
│   ├── brands/         # Brand logos
│   ├── categories/     # Category images
│   ├── concerns/       # Skin concern images
│   ├── hero/          # Hero section media
│   ├── products/      # Product images
│   └── spotlights/    # Spotlight banners
│
├── components/          # React components
│   ├── ui/            # Base UI components (shadcn/ui)
│   ├── Header.tsx     # Site header with navigation
│   ├── Footer.tsx     # Site footer
│   ├── ProductCard.tsx # Product display card
│   ├── CartDrawer.tsx # Shopping cart drawer
│   └── ...            # Other shared components
│
├── pages/              # Route pages
│   ├── Index.tsx      # Home page
│   ├── ProductDetail.tsx # Product detail page
│   ├── Collections.tsx # Collections listing
│   ├── Brands.tsx     # Brands page
│   └── ...            # Other pages
│
├── hooks/              # Custom React hooks
│   ├── useAuth.ts     # Authentication hook
│   ├── use-mobile.tsx # Mobile detection
│   └── useScrollAnimation.ts # Scroll effects
│
├── stores/             # Zustand state stores
│   ├── cartStore.ts   # Shopping cart state
│   └── wishlistStore.ts # Wishlist state
│
├── contexts/           # React contexts
│   └── LanguageContext.tsx # i18n context
│
├── lib/               # Utility functions & helpers
│   ├── shopify.ts     # Shopify API integration
│   ├── utils.ts       # General utilities
│   ├── categoryMapping.ts # Category mapping logic
│   └── productUtils.ts # Product utilities
│
├── integrations/      # External service integrations
│   └── supabase/      # Supabase client & types
│
├── App.tsx            # Root component
├── main.tsx          # Application entry point
└── index.css         # Global styles & design tokens
```

## State Management

### Zustand Stores

**Cart Store** (`stores/cartStore.ts`)
- Manages shopping cart items
- Persists to localStorage
- Handles quantity updates, additions, removals

**Wishlist Store** (`stores/wishlistStore.ts`)
- Manages wishlist items
- Persists to localStorage
- Toggle add/remove functionality

### React Context

**Language Context** (`contexts/LanguageContext.tsx`)
- Manages UI language (English/Arabic)
- Handles RTL/LTR direction
- Persists language preference

## Data Flow

### Product Data Flow

```
Shopify API → TanStack Query → Components
     ↓
  Caching & Normalization
     ↓
Product Detail / Lists / Search Results
```

### Cart Flow

```
User Action → Cart Store → Local Storage
                ↓
         Cart Drawer Update
                ↓
    Checkout → Shopify Checkout
```

### Authentication Flow

```
User Login → Supabase Auth → Context Update
              ↓
       Session Storage
              ↓
    Protected Routes Access
```

## Routing Architecture

### Route Structure

```
/ (Index)
├── /brands
│   └── /brands/vichy
├── /collections
│   └── /collections/:handle
├── /products/:handle
├── /skin-concerns
├── /offers
├── /best-sellers
├── /contact
├── /philosophy
├── /wishlist
├── /account
├── /auth
└── /admin/orders
```

### Route Protection

- Public routes: All product browsing pages
- Protected routes: `/account`, `/admin/*`
- Authentication via Supabase Auth

## API Integration

### Shopify Storefront API

**Base URL**: `{shop-name}.myshopify.com/api/2024-01/graphql.json`

**Key Operations**:
- `fetchProducts`: Get product catalog
- `fetchProductByHandle`: Get single product
- `fetchCollections`: Get collections
- `createCheckout`: Initialize checkout

**Authentication**: Storefront Access Token (via environment variables)

### Supabase Integration

**Services Used**:
- **Authentication**: User login/signup
- **Database**: Order tracking, user data
- **Edge Functions**: 
  - `beauty-assistant`: AI-powered product recommendations
  - `bulk-product-upload`: Bulk product import

## Design System

### Color Tokens

```css
--maroon: #800020          /* Primary brand color */
--soft-ivory: #F8F8FF      /* Background */
--shiny-gold: #C5A028      /* Accent/highlights */
--dark-charcoal: #333333   /* Text color */
```

### Typography

- **Headings**: Playfair Display (elegant serif)
- **Body**: Montserrat (clean sans-serif)
- **Arabic**: Tajawal (optimized for RTL)

### Component Library

Using **shadcn/ui** - a collection of re-usable components built with:
- Radix UI primitives (accessibility)
- Tailwind CSS (styling)
- CVA (component variants)

## Performance Optimizations

### Image Optimization

- **Lazy Loading**: `LazyImage` component with Intersection Observer
- **Optimized Formats**: WebP with fallbacks
- **Responsive Images**: Multiple sizes for different viewports
- **CDN**: Images served via Shopify CDN

### Code Splitting

- Route-based code splitting via React Router
- Dynamic imports for heavy components
- Vite's automatic chunking

### Caching Strategy

- **TanStack Query**: 
  - 5-minute stale time for product data
  - Background refetching
  - Optimistic updates for cart

- **Browser Cache**:
  - Assets cached via Vite build hashing
  - Service worker (future enhancement)

## Internationalization (i18n)

### Supported Languages

- **English (en)**: Default language, LTR
- **Arabic (ar)**: RTL layout, custom font

### Implementation

- Language switcher in header
- Direction (`dir`) attribute on `<html>`
- RTL-specific Tailwind classes
- Font switching based on language

### Content Translation

Currently handled via:
- Component-level translations
- Future: Integration with translation management system

## Security Considerations

### Environment Variables

All sensitive data stored in `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- Shopify credentials (if applicable)

### Data Protection

- No sensitive customer data stored client-side
- Checkout handled by Shopify (PCI compliant)
- Authentication tokens stored securely via Supabase

### Content Security

- Input sanitization on forms
- XSS protection via React's default escaping
- HTTPS enforced in production

## Build & Deployment

### Development

```bash
npm run dev          # Start dev server (port 8080)
npm run lint         # Run ESLint
```

### Production

```bash
npm run build        # Production build
npm run preview      # Preview production build
```

### Build Output

```
dist/
├── assets/         # Bundled JS/CSS with hashes
├── index.html      # Entry HTML
└── ...            # Other static assets
```

### Deployment Platform

- **Primary**: Lovable.dev (automatic deployment)
- **Domain**: asperbeautyshop.lovable.app
- **CDN**: Built-in via hosting platform

## Future Enhancements

### Planned Features

1. **Testing Infrastructure**
   - Unit tests (Vitest)
   - Integration tests (Testing Library)
   - E2E tests (Playwright)

2. **Performance**
   - Service Worker for offline support
   - Image optimization pipeline
   - Progressive Web App (PWA)

3. **Features**
   - User reviews & ratings
   - Advanced search with filters
   - Product recommendations
   - Order tracking
   - Multiple payment methods

4. **Analytics**
   - Google Analytics integration
   - Conversion tracking
   - User behavior analytics

## Maintenance & Support

### Code Quality

- **Linting**: ESLint with TypeScript rules
- **Formatting**: Consistent style enforcement
- **Type Safety**: Strict TypeScript configuration

### Monitoring

- Build status monitoring
- Error tracking (future: Sentry)
- Performance monitoring (future: Lighthouse CI)

### Documentation

- Inline code documentation
- README for each major module
- API documentation
- This architecture guide

## Contributing

See `CONTRIBUTING.md` for development guidelines and contribution process.

## Contact & Support

For technical questions or issues:
- GitHub Issues: [Repository Issues](https://github.com/Asper-Beauty-Shop/Asper-Beauty-Shop/issues)
- Documentation: This `/docs` directory

---

**Last Updated**: January 2026
**Version**: 1.0.0
