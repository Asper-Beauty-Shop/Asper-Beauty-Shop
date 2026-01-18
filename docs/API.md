# API Documentation

## Overview

This document describes the APIs and integrations used by Asper Beauty Shop.

## Shopify Storefront API

### Base Configuration

```typescript
const SHOPIFY_DOMAIN = 'your-store.myshopify.com';
const STOREFRONT_ACCESS_TOKEN = 'your_storefront_access_token';
const API_VERSION = '2024-01';

const GRAPHQL_ENDPOINT = `https://${SHOPIFY_DOMAIN}/api/${API_VERSION}/graphql.json`;
```

### Authentication

All requests require the `X-Shopify-Storefront-Access-Token` header:

```typescript
headers: {
  'Content-Type': 'application/json',
  'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN
}
```

### GraphQL Queries

#### Fetch Products

```graphql
query GetProducts($first: Int!) {
  products(first: $first) {
    edges {
      node {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 10) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              availableForSale
            }
          }
        }
      }
    }
  }
}
```

**Response**:
```typescript
interface ProductsResponse {
  data: {
    products: {
      edges: Array<{
        node: Product
      }>
    }
  }
}
```

#### Fetch Single Product

```graphql
query GetProduct($handle: String!) {
  productByHandle(handle: $handle) {
    id
    title
    handle
    description
    descriptionHtml
    vendor
    productType
    tags
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
      maxVariantPrice {
        amount
        currencyCode
      }
    }
    images(first: 10) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    variants(first: 50) {
      edges {
        node {
          id
          title
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          availableForSale
          quantityAvailable
          selectedOptions {
            name
            value
          }
        }
      }
    }
    metafields(identifiers: [
      { namespace: "custom", key: "benefits" },
      { namespace: "custom", key: "ingredients" },
      { namespace: "custom", key: "how_to_use" }
    ]) {
      key
      value
      type
    }
  }
}
```

#### Fetch Collections

```graphql
query GetCollections($first: Int!) {
  collections(first: $first) {
    edges {
      node {
        id
        title
        handle
        description
        image {
          url
          altText
        }
        products(first: 12) {
          edges {
            node {
              id
              title
              handle
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

#### Create Checkout

```graphql
mutation CreateCheckout($input: CheckoutCreateInput!) {
  checkoutCreate(input: $input) {
    checkout {
      id
      webUrl
      lineItems(first: 50) {
        edges {
          node {
            title
            quantity
            variant {
              id
              title
              price {
                amount
                currencyCode
              }
            }
          }
        }
      }
      totalPrice {
        amount
        currencyCode
      }
    }
    checkoutUserErrors {
      field
      message
    }
  }
}
```

**Variables**:
```typescript
{
  input: {
    lineItems: [
      {
        variantId: "gid://shopify/ProductVariant/123456",
        quantity: 1
      }
    ]
  }
}
```

### Helper Functions

#### makeShopifyRequest

```typescript
async function makeShopifyRequest<T>(
  query: string, 
  variables?: Record<string, any>
): Promise<T> {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API error: ${response.statusText}`);
  }

  const json = await response.json();
  
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }

  return json;
}
```

## Supabase API

### Authentication

#### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123',
});
```

#### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123',
});
```

#### Sign Out

```typescript
const { error } = await supabase.auth.signOut();
```

#### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Database Operations

#### Insert Order

```typescript
const { data, error } = await supabase
  .from('orders')
  .insert({
    customer_name: string,
    customer_email: string,
    customer_phone: string,
    customer_address: string,
    order_items: OrderItem[],
    total_amount: number,
    status: 'pending',
    payment_method: 'cod'
  })
  .select()
  .single();
```

#### Fetch Orders

```typescript
const { data, error } = await supabase
  .from('orders')
  .select('*')
  .order('created_at', { ascending: false })
  .range(startIndex, endIndex);
```

#### Update Order Status

```typescript
const { data, error } = await supabase
  .from('orders')
  .update({ status: 'confirmed' })
  .eq('id', orderId);
```

### Edge Functions

#### Beauty Assistant

**Endpoint**: `/functions/v1/beauty-assistant`

**Request**:
```typescript
const { data, error } = await supabase.functions.invoke('beauty-assistant', {
  body: {
    message: string,
    context?: {
      skinType?: string,
      concerns?: string[],
      budget?: string
    }
  }
});
```

**Response**:
```typescript
{
  response: string,
  recommendations?: Product[],
  confidence: number
}
```

#### Bulk Product Upload

**Endpoint**: `/functions/v1/bulk-product-upload`

**Request**:
```typescript
const { data, error } = await supabase.functions.invoke('bulk-product-upload', {
  body: {
    products: Array<{
      title: string,
      description: string,
      price: number,
      vendor: string,
      productType: string,
      tags: string[],
      images: string[]
    }>
  }
});
```

**Response**:
```typescript
{
  success: boolean,
  created: number,
  failed: number,
  errors?: Array<{
    product: string,
    error: string
  }>
}
```

## Client-Side Integration

### React Query Hooks

#### useProducts

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/shopify';

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

#### useProduct

```typescript
export const useProduct = (handle: string) => {
  return useQuery({
    queryKey: ['product', handle],
    queryFn: () => fetchProductByHandle(handle),
    enabled: !!handle,
    staleTime: 5 * 60 * 1000,
  });
};
```

#### useCollections

```typescript
export const useCollections = () => {
  return useQuery({
    queryKey: ['collections'],
    queryFn: fetchCollections,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

### Mutations

#### Create Order

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: OrderInput) => {
      const { data, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
```

## Rate Limiting

### Shopify Storefront API

- **Limit**: 1000 requests per 60 seconds
- **Calculation**: Based on estimated query cost
- **Headers**: Check `X-Shopify-Shop-Api-Call-Limit` response header

### Supabase

- **Free Tier**: 500,000 monthly reads, 200,000 monthly writes
- **Pro Tier**: Unlimited reads/writes with fair use policy

## Error Handling

### Standard Error Response

```typescript
interface ApiError {
  message: string;
  code?: string;
  field?: string;
}
```

### Error Handling Pattern

```typescript
try {
  const data = await fetchProducts();
  return data;
} catch (error) {
  if (error instanceof Error) {
    console.error('API Error:', error.message);
    // Show user-friendly error message
    toast.error('Failed to load products. Please try again.');
  }
  throw error;
}
```

## Best Practices

1. **Caching**: Use TanStack Query for automatic caching
2. **Error Handling**: Always handle errors gracefully
3. **Loading States**: Show loading indicators during API calls
4. **Retry Logic**: Implement automatic retries for transient failures
5. **Pagination**: Use pagination for large data sets
6. **Optimistic Updates**: Update UI before API confirmation
7. **Type Safety**: Use TypeScript interfaces for all API responses

## Testing APIs

### Using curl

```bash
# Test Shopify API
curl -X POST \
  https://your-store.myshopify.com/api/2024-01/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: YOUR_TOKEN" \
  -d '{"query":"{ products(first: 1) { edges { node { id title } } } }"}'

# Test Supabase Edge Function
curl -X POST \
  https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/beauty-assistant \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{"message": "Recommend a moisturizer"}'
```

## Related Documentation

- [Database Schema](./DATABASE.md)
- [Architecture](./ARCHITECTURE.md)
- [Shopify Storefront API Docs](https://shopify.dev/api/storefront)
- [Supabase Docs](https://supabase.com/docs)

---

**Last Updated**: January 2026
