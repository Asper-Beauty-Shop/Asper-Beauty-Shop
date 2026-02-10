# Bulk Upload Feature - Testing Guide

This guide explains how to test the Bulk Product Upload feature located at `/admin/bulk-upload`.

## Prerequisites

Before testing, ensure the following are configured:

### 1. Supabase Setup
- Project linked and `bulk-product-upload` edge function deployed
- Storage bucket `product-images` exists (for generated images)

### 2. Admin Access
- Your user must have `role = 'admin'` in the `public.user_roles` table
- You must be logged in to access the bulk upload page

### 3. Required Secrets (Supabase → Edge Functions → Secrets)
| Secret | Required For | Description |
|--------|-------------|-------------|
| `LOVABLE_API_KEY` | Steps 2-3 (Categorize, Images) | API key for Lovable AI image generation |
| `SHOPIFY_STORE_DOMAIN` | Step 5 (Shopify upload) | Your Shopify store domain |
| `SHOPIFY_ACCESS_TOKEN` | Step 5 (Shopify upload) | Shopify Admin API access token |

---

## Testing Flow

### Step 1: Upload Data

**What to do:**
1. Navigate to `http://localhost:5173/admin/bulk-upload`
2. Click **"Load sample file"** (uses `public/data/products-data.xlsx`) or upload your own `.xlsx`

**What it uses:**
- Local Excel parsing only (using `xlsx` library)
- No server calls

**Expected columns in Excel:**
| Column Purpose | Possible Names (Arabic/English) |
|---------------|--------------------------------|
| SKU/Code | الرمز, رمز, SKU, Code, Barcode, الباركود |
| Product Name | اسم المادة, اسم المنتج, Product Name, Name, المنتج, الاسم |
| Cost Price | الكلفة, سعر الشراء, Cost, Cost Price, التكلفة |
| Selling Price | سعر البيع, السعر, Price, Selling Price, Sale Price |

**Success indicator:**
- Toast: "Successfully loaded X products"
- Advances to Categorize step
- Shows preview table with first 10 products

---

### Step 2: Categorize Products

**What to do:**
1. Review the loaded products in the preview table
2. Click **"Categorize products"** (or "Auto-Categorize X Products")

**What it uses:**
- Edge function `bulk-product-upload` with `action: "categorize"`
- Requires admin role
- Requires `LOVABLE_API_KEY`

**What happens:**
- Products are categorized into: Skin Care, Hair Care, Body Care, Make Up, Fragrances, Health & Supplements, Medical Supplies, Personal Care
- Brand is extracted from product name
- AI image prompts are generated for each product

**Success indicator:**
- Toast: "Categorized X products into Y categories"
- Category summary cards appear
- Advances to Images step

---

### Step 3: Generate Images

**What to do:**
1. Click **"Start generating images"**
2. Monitor the queue progress dashboard
3. Use Pause/Resume controls if needed
4. Adjust settings (concurrent requests, delay) via the gear icon

**What it uses:**
- Edge function `bulk-product-upload` with `action: "generate-image"`
- Lovable AI (Gemini) for image generation
- Supabase Storage bucket `product-images`
- Requires `LOVABLE_API_KEY`

**Queue Controls:**
| Button | Action |
|--------|--------|
| Start | Begin processing the queue |
| Pause | Temporarily stop processing |
| Resume | Continue from where paused |
| Stop | Completely stop the queue |
| Retry Failed | Requeue all failed items |
| Settings (gear) | Adjust batch size and delays |

**Queue Settings:**
- **Concurrent Requests**: 1-5 (higher = faster but more rate limits)
- **Delay Between Requests**: 500ms-5000ms

**Success indicator:**
- Progress bar fills up
- Product cards show generated image thumbnails
- Green checkmarks appear on completed items
- Queue status shows "Completed: X"

---

### Step 4: Review Products

**What to do:**
1. Navigate to the Review tab
2. Check generated images and categorizations
3. Use tabs to filter: All, Ready (completed), Failed

**What it uses:**
- UI only (no server calls)

**Success indicator:**
- All products display with images
- Categories and brands are correctly assigned
- Prices are correct

---

### Step 5: Upload to Shopify

**What to do:**
1. Click **"Upload All Products to Shopify"**
2. Monitor upload progress
3. Review any failures in the error list

**What it uses:**
- Edge function `bulk-product-upload` with `action: "create-shopify-product"`
- Shopify Admin API
- Requires `SHOPIFY_STORE_DOMAIN` and `SHOPIFY_ACCESS_TOKEN`

**What gets created:**
- Product with title, description, vendor (brand), product type (category)
- Single variant with SKU and price
- Product image from generated URL
- Tags: category, brand, "bulk-upload"

**Success indicator:**
- Progress bar shows upload completion
- Toast: "Successfully created X products in Shopify!"
- Green completion card appears

---

## Common Errors and Troubleshooting

### Authentication Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Not logged in or expired session | Log in again |
| 403 Forbidden | User not admin | Add admin role: `INSERT INTO user_roles (user_id, role) VALUES ('your-uuid', 'admin')` |

### API Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "LOVABLE_API_KEY is not configured" | Missing secret | Add `LOVABLE_API_KEY` to edge function secrets |
| "SHOPIFY_ACCESS_TOKEN is not configured" | Missing secret | Add Shopify credentials to secrets |
| 429 Rate Limited | Too many requests | Queue will auto-pause and retry; reduce concurrent requests |

### Image Generation Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "No image returned from AI" | AI failed to generate | Retry the item |
| Storage upload error | Bucket missing or permissions | Create `product-images` bucket in Supabase Storage |

### Shopify Upload Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Rate limited by Shopify" | Too many API calls | Wait and retry; reduce batch size |
| Invalid product data | Missing required fields | Check product has title and price |

---

## Quick Test Checklist

- [ ] Can access `/admin/bulk-upload` (logged in as admin)
- [ ] Sample file loads correctly (or your Excel file)
- [ ] Categorization completes without auth errors
- [ ] At least one image generates successfully
- [ ] Images appear in product cards
- [ ] (Optional) Shopify upload creates products

---

## Sample Data

If you don't have an Excel file, use the **"Use Sample Data"** button which loads 10 test products:

| SKU | Product Name | Category (after categorization) |
|-----|--------------|--------------------------------|
| 777284 | BLACK HAIR PINS | Personal Care |
| 737383722396 | PALMERS OLIVE OIL COND 400 ML | Hair Care |
| 737383722622 | PALMER-S OLIVE OIL BODY LOTION PUMP (400ML) | Body Care |
| 737383743893 | PALMERS COCOA BUTTER FORMULA BODY LOTION 400 ML | Body Care |
| 737383772223 | PALMERS SKINSUCCESS FADE CREAM (OILY SKIN) (75GM) | Skin Care |
| 737383787772 | PALMERS SKIN SUCCESS DEEP CLEANSING (250 ML) | Skin Care |
| 737768773629 | SUNDOWN PAPAYA ENZYME (100 CHEWABLE TAB) | Health & Supplements |
| 764642727334 | JAMIESON VIT C 500 CHEWABLE (100+20TABLETS) | Health & Supplements |
| 722277947238 | SPEED STICK OCEAN SURF (51G) | Body Care |
| 7447477 | ARTELAC ADVANCED E/D (30*0.5ML) | Medical Supplies |

---

## Development Notes

### Files involved:
- `src/pages/BulkUpload.tsx` - Main UI component
- `src/lib/imageGenerationQueue.ts` - Queue system for image generation
- `supabase/functions/bulk-product-upload/index.ts` - Edge function

### Image Queue Configuration:
```typescript
const DEFAULT_CONFIG = {
  batchSize: 3,        // Process 3 images concurrently
  retryLimit: 3,       // Max retries per item
  retryDelay: 5000,    // 5 seconds between retries
  rateLimitDelay: 60000, // 60 seconds after rate limit
  requestDelay: 2000,  // 2 seconds between batches
};
```
