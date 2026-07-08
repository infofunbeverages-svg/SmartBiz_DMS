# Supabase Integration Setup Guide

## Overview
This DMS (Distributor Management System) has been integrated with Supabase backend. The following changes have been made:

## Completed Integration

### 1. Environment Setup
- ✅ Installed `@supabase/supabase-js` package
- ✅ Created `.env.example` template file
- ⚠️ **ACTION REQUIRED**: You need to create a `.env` file with your Supabase credentials

### 2. Supabase Client Configuration
- ✅ Created `src/lib/supabase.ts` - Supabase client configuration
- ✅ Created `src/lib/supabaseServices.ts` - Service functions for:
  - Products (CRUD operations)
  - Orders (Create, Read, Update status)
  - Invoices/Sales (Create, Read)

### 3. Authentication
- ✅ Updated `src/lib/auth.ts` to use Supabase Auth
- ✅ Updated `src/pages/auth/Login.tsx` to use email/password authentication
- ✅ Added session checking on app initialization
- ✅ Protected routes now check Supabase session

### 4. Product Management
- ✅ Updated `src/pages/inventory/Dashboard.tsx` to fetch products from Supabase
- ✅ Products are now loaded from the `products` table instead of mock data

### 5. Orders Management
- ✅ Updated `src/stores/orderStore.ts` to use Supabase
- ✅ Updated `src/pages/orders/Dashboard.tsx` to fetch orders from Supabase
- ✅ Updated `src/pages/orders/components/CreateOrderModal.tsx` to save orders to Supabase
- ✅ Orders are saved to `orders` and `order_items` tables

### 6. Sales/Invoices
- ✅ Updated `src/stores/salesStore.ts` to save invoices to Supabase
- ✅ Invoices are saved to `invoices` and `invoice_items` tables

### 7. Branding
- ✅ Updated footer in `src/components/layouts/MainLayout.tsx` to show "All rights reserved Smartbiz DMS 2026"

## Required Supabase Database Tables

You need to create the following tables in your Supabase database:

### 1. `products` table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL UNIQUE,
  sku TEXT,
  category TEXT,
  price DECIMAL(10, 2) NOT NULL,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. `orders` table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agency_id UUID NOT NULL REFERENCES agencies(id),
  order_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. `order_items` table
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  free_issue INTEGER DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. `invoices` table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  shop_id UUID NOT NULL REFERENCES shops(id),
  sales_rep_id UUID NOT NULL REFERENCES users(id),
  agency_id UUID NOT NULL REFERENCES agencies(id),
  sale_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  tax DECIMAL(10, 2) DEFAULT 0,
  net_amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. `invoice_items` table
```sql
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) DEFAULT 0,
  free_issue INTEGER DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 6. `users` table (if not already exists)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT,
  name TEXT,
  email TEXT,
  role TEXT NOT NULL,
  agency_id UUID REFERENCES agencies(id),
  territory_id UUID,
  managed_agencies UUID[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 7. `agencies` table (if not already exists)
```sql
CREATE TABLE agencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 8. `shops` table (if not already exists)
```sql
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  owner TEXT,
  route_id UUID,
  agency_id UUID REFERENCES agencies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

You should set up RLS policies for these tables. Example policies:

```sql
-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Example: Allow authenticated users to read products
CREATE POLICY "Allow authenticated users to read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

-- Example: Allow authenticated users to create products
CREATE POLICY "Allow authenticated users to create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Similar policies should be created for other tables based on your business logic
```

## Next Steps

1. **Provide Supabase Credentials**: Please provide your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values
2. **Create Database Tables**: Run the SQL scripts above in your Supabase SQL editor
3. **Set up RLS Policies**: Configure Row Level Security based on your requirements
4. **Test the Integration**: 
   - Create a user account in Supabase Auth
   - Create a corresponding user record in the `users` table
   - Test login, product creation, order creation, and invoice creation

## Notes

- The authentication now uses email/password instead of username
- All data operations now go through Supabase instead of local mock data
- The footer branding has been updated to "All rights reserved Smartbiz DMS 2026"
- Some features (like sales targets, territories) still use mock data and can be migrated later
