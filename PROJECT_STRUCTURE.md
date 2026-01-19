# Project Structure Guide

This document provides a comprehensive overview of the Asper Beauty Shop project structure and organization.

## 📁 Root Directory Structure

```
Asper-Beauty-Shop/
├── .github/              # GitHub configuration
│   └── agents/          # GitHub agent configurations
├── data/                # Data files and datasets
│   ├── inventory/       # Inventory data files
│   ├── products/        # Product catalog files
│   └── exports/         # Generated exports (gitignored)
├── docs/                # Project documentation
│   ├── ARCHITECTURE.md  # System architecture
│   ├── DATABASE.md      # Database schema
│   ├── API.md          # API documentation
│   └── README.md       # Documentation index
├── public/             # Static public assets
│   ├── data/           # Public data files
│   ├── lovable-uploads/ # Uploaded assets
│   └── *.ico, *.png    # Favicons and icons
├── src/                # Source code
│   ├── assets/         # Application assets
│   ├── components/     # React components
│   ├── constants/      # Application constants
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── integrations/   # External service integrations
│   ├── lib/            # Utility libraries
│   ├── pages/          # Page components
│   ├── stores/         # State management
│   └── types/          # TypeScript type definitions
├── supabase/           # Supabase configuration
│   ├── functions/      # Edge functions
│   └── migrations/     # Database migrations
├── .env                # Environment variables (not in git)
├── .env.example        # Example environment configuration
├── .gitignore          # Git ignore rules
├── CODE_OF_CONDUCT.md  # Community guidelines
├── CONTRIBUTING.md     # Contribution guidelines
├── LICENSE             # Project license
├── README.md           # Project overview
├── package.json        # Node dependencies
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
└── tailwind.config.ts  # Tailwind CSS configuration
```

## 🎯 Directory Purposes

### `/data` - Data Management
Centralized location for all data files used by the application.

**Subdirectories:**
- `inventory/` - Stock and inventory tracking data
- `products/` - Product catalog and reference data
- `exports/` - Temporary export files (not committed to git)

**Best Practices:**
- Use descriptive filenames with language suffixes
- Follow naming convention: `{category}-{description}-{language}.{ext}`
- Document new data files in `data/README.md`

### `/docs` - Documentation
Comprehensive technical documentation for the project.

**Key Documents:**
- `ARCHITECTURE.md` - System design and architecture
- `DATABASE.md` - Database schema and models
- `API.md` - API integration guides
- `README.md` - Documentation navigation

**When to Update:**
- New features added
- Architecture changes
- API modifications
- Database schema updates

### `/src/assets` - Static Assets
Images, fonts, and other static files used by the application.

```
assets/
├── brands/           # Brand logos (webp format)
├── categories/       # Category images
├── concerns/         # Skin concern images
├── hero/            # Hero section media
├── products/        # Product images
└── spotlights/      # Spotlight banners
```

**Naming Convention:**
- Use lowercase with hyphens: `vichy-logo.webp`
- Include purpose in name: `hero-slide-1.webp`
- Prefer webp format for images

### `/src/components` - React Components
Reusable UI components organized by function.

```
components/
├── ui/              # Base UI components (shadcn/ui)
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
├── Header.tsx       # Site header
├── Footer.tsx       # Site footer
├── ProductCard.tsx  # Product display
└── ...              # Feature components
```

**Component Guidelines:**
- One component per file
- Use functional components with hooks
- Include TypeScript props interface
- Keep components focused and small

### `/src/constants` - Application Constants
Centralized constants for consistency across the app.

**Includes:**
- Application metadata
- Design system tokens
- Error/success messages
- Storage keys
- Configuration values

**Usage:**
```typescript
import { APP_NAME, COLORS, ERROR_MESSAGES } from '@/constants';
```

### `/src/contexts` - React Contexts
React context providers for global state.

**Current Contexts:**
- `LanguageContext.tsx` - Internationalization

**When to Add:**
- Global state needed across many components
- Avoid prop drilling
- Theme/configuration management

### `/src/hooks` - Custom Hooks
Reusable React hooks for common patterns.

**Examples:**
- `useAuth.ts` - Authentication logic
- `use-mobile.tsx` - Mobile detection
- `useScrollAnimation.ts` - Scroll effects

**Hook Naming:**
- Prefix with `use`
- Descriptive name: `useProductFilters`
- One hook per file

### `/src/integrations` - External Services
Integration code for external services.

```
integrations/
└── supabase/
    ├── client.ts    # Supabase client setup
    └── types.ts     # Supabase-generated types
```

**Add New Integrations:**
```
integrations/
└── service-name/
    ├── client.ts    # Client configuration
    ├── types.ts     # Type definitions
    └── utils.ts     # Helper functions
```

### `/src/lib` - Utility Libraries
Helper functions and utilities.

**Files:**
- `utils.ts` - General utilities (cn, formatters)
- `shopify.ts` - Shopify API integration
- `productUtils.ts` - Product-specific helpers
- `categoryMapping.ts` - Category logic

**Guidelines:**
- Pure functions when possible
- Well-documented with JSDoc
- Unit testable
- Single responsibility

### `/src/pages` - Page Components
Top-level route components.

**Files:**
- `Index.tsx` - Home page
- `ProductDetail.tsx` - Product detail page
- `Collections.tsx` - Collections listing
- `Brands.tsx` - Brands page
- etc.

**Page Structure:**
```typescript
export default function PageName() {
  // Hooks
  // State
  // Effects
  // Handlers
  // Render
  return (...)
}
```

### `/src/stores` - State Management
Zustand stores for application state.

**Current Stores:**
- `cartStore.ts` - Shopping cart
- `wishlistStore.ts` - Wishlist

**Store Pattern:**
```typescript
interface StoreState {
  // State
  // Actions
}

export const useStore = create<StoreState>((set) => ({
  // Initial state
  // Action implementations
}));
```

### `/src/types` - TypeScript Types
Centralized type definitions.

**Contents:**
- Interface definitions
- Type aliases
- Enums and constants types
- API response types

**Usage:**
```typescript
import type { Product, CartItem, Order } from '@/types';
```

### `/supabase` - Supabase Configuration
Backend as a Service configuration.

```
supabase/
├── config.toml      # Supabase configuration
├── functions/       # Edge functions
│   ├── beauty-assistant/
│   └── bulk-product-upload/
└── migrations/      # Database migrations
```

## 🔧 Configuration Files

### `package.json`
- Dependencies and devDependencies
- Scripts for build, dev, lint
- Project metadata

### `tsconfig.json`
- TypeScript compiler options
- Path aliases (`@/`)
- Strict type checking enabled

### `vite.config.ts`
- Vite build configuration
- Plugin setup
- Path resolution
- Dev server settings

### `tailwind.config.ts`
- Tailwind CSS configuration
- Custom theme extensions
- Plugin configuration

### `eslint.config.js`
- ESLint rules
- TypeScript integration
- React-specific rules

## 🎨 Naming Conventions

### Files
- **Components**: PascalCase - `ProductCard.tsx`
- **Hooks**: camelCase with 'use' prefix - `useAuth.ts`
- **Utils**: camelCase - `productUtils.ts`
- **Constants**: camelCase - `index.ts`
- **Types**: camelCase - `index.ts`

### Code
- **Interfaces**: PascalCase - `interface Product {}`
- **Types**: PascalCase - `type OrderStatus = ...`
- **Constants**: UPPER_SNAKE_CASE - `const API_URL = ...`
- **Functions**: camelCase - `function fetchProducts() {}`
- **Variables**: camelCase - `const cartItems = []`

## 📦 Import Order

```typescript
// 1. External packages
import React from 'react';
import { useNavigate } from 'react-router-dom';

// 2. Internal components
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/ProductCard';

// 3. Hooks
import { useAuth } from '@/hooks/useAuth';

// 4. Utils and helpers
import { cn } from '@/lib/utils';

// 5. Types
import type { Product } from '@/types';

// 6. Constants
import { APP_NAME } from '@/constants';

// 7. Styles
import './styles.css';
```

## 🔄 File Organization Best Practices

1. **Keep Related Files Together**: Group by feature, not type
2. **Use Index Files**: Export from `index.ts` for cleaner imports
3. **Separate Concerns**: UI, logic, and data should be separate
4. **Document Complex Logic**: Add comments for non-obvious code
5. **Follow Conventions**: Stick to established patterns

## 📚 Related Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Data Management](./data/README.md)
- [Documentation Index](./docs/README.md)

---

**Last Updated**: January 2026
