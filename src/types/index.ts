// ============================================================
// SmartBiz Nexus — Global Types (v2 - Full Feature Set)
// ============================================================

export type SubscriptionTier = 'FREE' | 'GROWTH' | 'ENTERPRISE'
export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER' | 'DELIVERY_BOY'
export type PaymentMode = 'CASH' | 'CARD' | 'QR' | 'CREDIT' | 'LANKAQR' | 'ONLINE_TRANSFER'
export type Language = 'en' | 'si' | 'ta'
export type PricingTier = 'RETAIL' | 'WHOLESALE' | 'LOYALTY' | 'SPECIAL'
export type ChequeStatus = 'PENDING' | 'DEPOSITED' | 'REALIZED' | 'BOUNCED'

// ---------- Tenant ----------
export interface Tenant {
  tenant_id: string
  business_name: string
  owner_phone: string
  subscription_tier: SubscriptionTier
  subscription_status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED'
  subscription_expires_at: string
  app_settings: AppSettings
  created_at: string
}

export interface AppSettings {
  allow_negative_stock: boolean
  manager_approval_for_price_edit: boolean
  tax_rate: number
  receipt_footer: string
  language: Language
}

// ---------- Branch ----------
export interface Branch {
  branch_id: string
  tenant_id: string
  branch_name: string
  address?: string
  is_active: boolean
  is_main_branch?: boolean
}

// ---------- User ----------
export interface User {
  user_id: string
  tenant_id: string
  branch_id: string
  name: string
  role: UserRole
  email: string
  is_active: boolean
}

// ---------- Category ----------
export interface Category {
  category_id: string
  tenant_id: string
  name_en: string
  name_si?: string
  name_ta?: string
}

// ---------- UOM Conversion ----------
export interface UOMConversion {
  unit: string        // 'kg', 'pack', 'piece'
  label: string       // display label
  factor: number      // 1 kg = 1000 (base: gram), 1 pack = 12 (base: pcs)
  price_override?: number  // optional price for this unit
}

// ---------- Item (Multi-UOM + Multi-Price + Expiry) ----------
export interface Item {
  item_id: string
  tenant_id: string
  branch_id: string
  category_id?: string
  barcode?: string
  name: string
  name_si?: string
  name_ta?: string
  base_unit: string           // smallest unit: 'gram', 'ml', 'pcs', 'inch'
  uom_conversions: UOMConversion[]  // [{unit:'kg',factor:1000,price:500}]
  prices: ItemPrices          // multi-tier pricing
  stock_in_base_unit: number  // always stored in base unit
  low_stock_threshold: number
  track_expiry: boolean
  track_serial: boolean
  updated_at: string
}

export interface ItemPrices {
  retail: number
  wholesale: number
  loyalty: number
  special: number
}

// ---------- Stock Batch (Expiry tracking) ----------
export interface StockBatch {
  batch_id: string
  item_id: string
  tenant_id: string
  batch_number?: string
  qty_in_base_unit: number
  cost_price_per_unit: number
  expiry_date?: string
  created_at: string
}

// ---------- Customer (Multi-tier + Blacklist) ----------
export interface Customer {
  customer_id: string
  tenant_id: string
  name: string
  phone?: string
  pricing_tier: PricingTier
  loyalty_points: number
  credit_limit: number
  outstanding_balance: number
  is_blacklisted: boolean
  created_at: string
}

// ---------- Cheque ----------
export interface Cheque {
  cheque_id: string
  tenant_id: string
  customer_id?: string
  customer_name?: string
  cheque_number: string
  bank_name: string
  amount: number
  due_date: string
  status: ChequeStatus
  notes?: string
  created_at: string
}

// ---------- Promotion / Flash Sale ----------
export interface Promotion {
  promo_id: string
  tenant_id: string
  name: string
  start_time: string
  end_time: string
  discount_type: 'FLAT_OFF' | 'PERCENTAGE'
  discount_value: number
  applied_item_ids: string[]
  is_active: boolean
}

// ---------- Invoice ----------
export interface Invoice {
  invoice_id: string
  tenant_id: string
  branch_id: string
  user_id: string
  customer_id?: string
  total_amount: number
  discount: number
  tax: number
  delivery_charge: number
  payment_mode: PaymentMode
  payment_status: 'PAID' | 'PENDING' | 'COD'
  is_synced: boolean
  client_timestamp: string
  created_at: string
}

// ---------- Invoice Item ----------
export interface InvoiceItem {
  id?: number
  invoice_id: string
  item_id: string
  item_name?: string
  serial_number?: string
  quantity_in_base_unit: number
  unit_label: string
  unit_price: number
  discount: number
}

// ---------- Expense ----------
export interface Expense {
  expense_id: string
  tenant_id: string
  branch_id: string
  category: string
  amount: number
  note?: string
  created_at: string
}

// ---------- Cart (POS local state) ----------
export interface CartItem {
  item_id: string
  name: string
  unit_label: string
  unit_factor: number        // base units per display unit
  selling_price: number      // price for selected unit
  quantity: number           // in display unit
  discount: number
  serial_number?: string
  promo_discount?: number    // auto-applied promo
}

export interface Cart {
  items: CartItem[]
  customer_id?: string
  customer_pricing_tier: PricingTier
  payment_mode: PaymentMode
  discount: number
  delivery_charge: number
}

// ---------- Sync ----------
export interface SyncRecord {
  id?: number
  tenant_id: string
  table_name: string
  record_id: string
  payload: unknown
  synced: boolean
  created_at: string
}

// ---------- Dashboard Stats ----------
export interface DailyStat {
  date: string
  total_sales: number
  invoice_count: number
  top_item?: string
}