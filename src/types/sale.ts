// NOTE: මේ file eke PaymentMethod/PaymentStatus enums දෙක
// sales.ts eka ekka conflict wenawa nisa,
// supabaseServices.ts eke use karana fields ekka match wenawa widihata fix karagena thiyenawa.

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_MONEY = 'MOBILE_MONEY'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface SaleItem {
  id: string;
  saleId: string;
  inventoryId: string;
  quantity: number;
  price: number;
  discount: number;
  isFree: number;
  totalAmount: number; // Bug fix: 'subtotal' wenuwata 'totalAmount' — supabaseServices.ts ekka match
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string;
  salesRepId: string;
  companyId: string;
  invoiceDate: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  tax: number;
  netAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}
