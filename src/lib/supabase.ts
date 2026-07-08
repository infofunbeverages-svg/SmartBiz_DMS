import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

console.log('Supabase connection initialized with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
