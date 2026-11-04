import { createClient } from '@supabase/supabase-js';

const supabaseUrl = String(import.meta.env.VITE_SUPABASE_URL ?? '').trim().replace(/^["']|["']$/g, '');
const supabaseAnonKey = String(import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim().replace(/^["']|["']$/g, '');

// Shown on screen by main.tsx instead of a blank white page
export const supabaseConfigError: string | null =
  !supabaseUrl || !supabaseAnonKey
    ? `Missing env vars → VITE_SUPABASE_URL: ${supabaseUrl ? 'OK' : 'MISSING'}, VITE_SUPABASE_ANON_KEY: ${supabaseAnonKey ? 'OK' : 'MISSING'}`
    : /^eyJ/.test(supabaseAnonKey) || supabaseAnonKey.startsWith('sb_publishable_')
      ? null
      : 'VITE_SUPABASE_ANON_KEY does not look like a Supabase anon/publishable key.';

if (supabaseConfigError) console.error(supabaseConfigError);

// Never throw at import time (that caused the white screen)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database types (these should match your Supabase schema)
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          code: string;
          sku: string | null;
          category: string | null;
          price: number;
          unit: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          code: string;
          sku?: string | null;
          category?: string | null;
          price: number;
          unit?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          code?: string;
          sku?: string | null;
          category?: string | null;
          price?: number;
          unit?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          company_id: string;
          draft_date: string;
          status: string;
          total_amount: number;
          notes: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          draft_date: string;
          status?: string;
          total_amount: number;
          notes?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          draft_date?: string;
          status?: string;
          total_amount?: number;
          notes?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          inventory_id: string;
          quantity: number;
          price: number;
          discount: number;
          is_free: number;
          total_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          inventory_id: string;
          quantity: number;
          price: number;
          discount?: number;
          is_free?: number;
          total_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          inventory_id?: string;
          quantity?: number;
          price?: number;
          discount?: number;
          is_free?: number;
          total_amount?: number;
          created_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          invoice_no: string;
          customer_id: string;
          sales_rep_id: string;
          company_id: string;
          date: string;
          total_amount: number;
          discount: number;
          tax: number;
          net_amount: number;
          payment_method: string;
          payment_status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_no: string;
          customer_id: string;
          sales_rep_id: string;
          company_id: string;
          date: string;
          total_amount: number;
          discount?: number;
          tax?: number;
          net_amount: number;
          payment_method: string;
          payment_status: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          invoice_no?: string;
          customer_id?: string;
          sales_rep_id?: string;
          company_id?: string;
          date?: string;
          total_amount?: number;
          discount?: number;
          tax?: number;
          net_amount?: number;
          payment_method?: string;
          payment_status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          inventory_id: string;
          quantity: number;
          price: number;
          discount: number;
          is_free: number;
          total_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          inventory_id: string;
          quantity: number;
          price: number;
          discount?: number;
          is_free?: number;
          total_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          inventory_id?: string;
          quantity?: number;
          price?: number;
          discount?: number;
          is_free?: number;
          total_amount?: number;
          created_at?: string;
        };
      };
    };
  };
}
