# Asper Beauty Shop

A luxury e-commerce storefront for premium skincare and beauty products, built with modern web technologies.

🔗 **Live Site**: [asperbeauty.lovable.app](https://asperbeautyshop.lovable.app)

## ✨ Features

- **Product Catalog** - Browse products by brand, category, and skin concerns
- **Shopping Cart** - Add products with real-time cart updates
- **Wishlist** - Save favorite products for later
- **Quick View** - Preview product details without leaving the page
- **Search** - Find products by name, brand, or category
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **RTL Support** - Full Arabic language support with right-to-left layout
- **Shopify Integration** - Connected to Shopify for product management and checkout
- **Dr. Rose Omnichannel AI** - Shared AI "brain" deployed for web + social channel routing

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: Zustand
- **Routing**: React Router v6
- **Data Fetching**: TanStack Query
- **E-commerce**: Shopify Storefront API
- **Animations**: CSS animations with Tailwind

## 🎨 Design System

The project uses a custom design system with:

| Token | Color | Usage |
|-------|-------|-------|
| `--maroon` | `#800020` | Primary brand color |
| `--soft-ivory` | `#F8F8FF` | Background |
| `--shiny-gold` | `#C5A028` | Accent color |
| `--dark-charcoal` | `#333333` | Text color |

Typography:
- **Display**: Playfair Display (headings)
- **Body**: Montserrat (body text)
- **RTL**: Tajawal (Arabic text)

## 📁 Project Structure

```
src/
├── assets/           # Images and static assets
├── components/       # Reusable UI components
│   └── ui/          # shadcn/ui components
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── pages/           # Route pages
└── stores/          # Zustand state stores
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/asperpharma/asperbeauty.git

# Navigate to project directory
cd asperbeauty

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
```

## 🌹 Dr. Rose Omnichannel Deployment

Dr. Rose is deployed through Supabase Edge Functions:

- `beauty-assistant` - Web chat streaming endpoint.
- `dr-rose-channel-router` - Omnichannel webhook/router for WhatsApp, Instagram, Facebook, TikTok/custom payloads.
- `tray` - Digital tray recommendation endpoint.

### Required Environment Variables

Set the following before deploying Supabase functions:

- `LOVABLE_API_KEY`
- `DR_ROSE_WEBHOOK_VERIFY_TOKEN`
- `DR_ROSE_CHANNEL_CALLBACK_URL` (optional but recommended)
- `DR_ROSE_CHANNEL_CALLBACK_TOKEN` (optional)
- `DR_ROSE_CHANNEL_CALLBACK_SECRET` (optional)

### Deploy Functions

```bash
./scripts/deploy-supabase.sh
```

### Verify Dr. Rose Channel Router

```bash
curl "https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/dr-rose-channel-router?health=1"
```

Expected: JSON with `status: "ok"` and `configured` flags.

### Preview Production Build

```bash
npm run preview
```

## 📱 Pages

| Route | Description |
|-------|-------------|
| `/` | Home page with hero, featured products, and categories |
| `/brands` | Browse all available brands |
| `/brands/vichy` | Vichy brand showcase page |
| `/collections` | Product collections |
| `/collections/:handle` | Individual collection page |
| `/products/:handle` | Product detail page |
| `/skin-concerns` | Shop by skin concern |
| `/offers` | Special offers and promotions |
| `/best-sellers` | Best selling products |
| `/contact` | Contact information |

## 🌐 Internationalization

The app supports:
- **English** (LTR)
- **Arabic** (RTL)

Language switching is available in the header.

## 🔧 Development

This project is built with [Lovable](https://lovable.dev). You can:

1. **Edit in Lovable**: Visit the project and start prompting
2. **Edit locally**: Clone the repo and push changes
3. **Edit in GitHub**: Use the web editor or Codespaces

Changes sync automatically between Lovable and GitHub.

## 📄 License

© 2025 Asper Beauty Shop. All rights reserved.

---

Built with ❤️ using [Lovable](https://lovable.dev)
