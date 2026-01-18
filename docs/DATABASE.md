# Database Schema Documentation

## Overview

Asper Beauty Shop uses Supabase (PostgreSQL) for persistent data storage. This document outlines the database schema, relationships, and data models.

## Database Tables

### 1. Orders

Stores customer order information for COD (Cash on Delivery) orders.

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  order_items JSONB NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT DEFAULT 'cod',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Fields**:
- `id`: Unique order identifier (UUID)
- `customer_name`: Customer's full name
- `customer_email`: Customer's email address
- `customer_phone`: Contact phone number
- `customer_address`: Delivery address
- `order_items`: JSON array of ordered products
- `total_amount`: Order total in decimal format
- `status`: Order status (pending, confirmed, shipped, delivered, cancelled)
- `payment_method`: Payment type (currently 'cod')
- `created_at`: Order creation timestamp
- `updated_at`: Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_email ON orders(customer_email);
```

### 2. Users (Supabase Auth)

User authentication is handled by Supabase Auth. The `auth.users` table is managed by Supabase and includes:

**Fields**:
- `id`: UUID primary key
- `email`: User email
- `encrypted_password`: Hashed password
- `email_confirmed_at`: Email verification timestamp
- `created_at`: Account creation date
- `updated_at`: Last update date

**Extended Profile** (if implemented):
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Data Models

### Order Item Structure

Each order contains an array of items in the `order_items` JSONB field:

```typescript
interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  variant?: string;
  quantity: number;
  price: number;
  total: number;
}
```

**Example**:
```json
[
  {
    "productId": "vichy-liftactiv-b3-serum",
    "productName": "Vichy Liftactiv B3 Serum",
    "productImage": "https://...",
    "quantity": 2,
    "price": 45.00,
    "total": 90.00
  }
]
```

## Relationships

```
auth.users (1) ──< (many) orders
     │
     └──< (many) profiles
```

## Row Level Security (RLS)

### Orders Table Policies

**Read Access**:
```sql
-- Users can read their own orders
CREATE POLICY "Users can view own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

-- Admin can view all orders
CREATE POLICY "Admins can view all orders"
ON orders FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');
```

**Insert Access**:
```sql
-- Anyone can create orders (for guest checkout)
CREATE POLICY "Anyone can create orders"
ON orders FOR INSERT
WITH CHECK (true);
```

**Update Access**:
```sql
-- Only admins can update orders
CREATE POLICY "Admins can update orders"
ON orders FOR UPDATE
USING (auth.jwt() ->> 'role' = 'admin');
```

## Migrations

Database migrations are stored in `/supabase/migrations/` and are applied automatically by Supabase.

### Migration Files

- `20260108101335_a1fec8b0-8543-4794-b337-151590ec9220.sql` - Initial schema
- `20260108104132_8b81a715-c349-4d84-9fd4-fbfbe258cead.sql` - Orders table
- `20260110023044_ddb98b76-77cd-4651-ba26-40551ea607d1.sql` - RLS policies
- `20260116215547_9aaccc31-ff38-42b5-b13e-739e31c65da0.sql` - Additional indexes
- `20260116215613_3b54b825-c8e6-42ff-8fee-3f6ea20e07cb.sql` - Profile extensions

## Data Access Patterns

### Creating an Order

```typescript
const { data, error } = await supabase
  .from('orders')
  .insert({
    customer_name: 'John Doe',
    customer_email: 'john@example.com',
    customer_phone: '+1234567890',
    customer_address: '123 Main St, City, Country',
    order_items: cartItems,
    total_amount: calculateTotal(cartItems),
    status: 'pending',
    payment_method: 'cod'
  })
  .select()
  .single();
```

### Fetching Orders (Admin)

```typescript
const { data: orders, error } = await supabase
  .from('orders')
  .select('*')
  .order('created_at', { ascending: false })
  .range(0, 49); // Pagination
```

### Updating Order Status

```typescript
const { data, error } = await supabase
  .from('orders')
  .update({ 
    status: 'confirmed',
    updated_at: new Date().toISOString()
  })
  .eq('id', orderId);
```

## External Data Sources

### Shopify Products

Product data is fetched from Shopify via the Storefront API and is not stored in the database. This ensures:
- Always up-to-date product information
- Centralized inventory management
- Reduced data duplication

**Note**: Product data can be cached client-side using TanStack Query for performance.

### Excel Data Files

Product catalog data is also available in Excel format for:
- Bulk uploads via the admin interface
- Offline product management
- Data backup and migration

See `/data/README.md` for more information on data files.

## Backup & Recovery

### Automatic Backups

Supabase provides automatic daily backups:
- Retained for 7 days (free tier)
- Point-in-time recovery available (pro tier)

### Manual Backup

Export data using Supabase CLI:

```bash
# Export orders table
supabase db dump --table=orders > backup_orders.sql

# Export all data
supabase db dump > backup_full.sql
```

### Restore

```bash
# Restore from backup
psql -h db.xxx.supabase.co -U postgres < backup_full.sql
```

## Performance Considerations

### Indexing Strategy

- Primary keys on all tables
- Index on frequently queried fields (status, email, created_at)
- Composite indexes for complex queries

### Query Optimization

- Use `.select()` to specify only needed columns
- Implement pagination for large result sets
- Use `.single()` when expecting one result
- Leverage Supabase's connection pooling

### Caching

- Client-side caching via TanStack Query
- Cache product data for 5 minutes
- Invalidate cache on mutations

## Security Best Practices

1. **Never expose service role keys** - Use anon key in client
2. **Implement RLS policies** - Control data access at database level
3. **Validate input** - Always validate and sanitize user input
4. **Use prepared statements** - Supabase client handles this automatically
5. **Audit logs** - Enable Supabase audit logs for tracking changes

## Related Documentation

- [Architecture Documentation](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Supabase Documentation](https://supabase.com/docs)

---

**Last Updated**: January 2026
