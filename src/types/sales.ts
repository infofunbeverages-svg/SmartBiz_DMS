// PaymentMethod ekai PaymentStatus ekai, sale.ts eke same names ekka conflict wena nisa,
// mehe rename karagena thiyenawa: InvoicePaymentMethod / InvoicePaymentStatus

export enum InvoicePaymentMethod {
  CASH = 'CASH',
  CREDIT = 'CREDIT',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOBILE_PAYMENT = 'MOBILE_PAYMENT'
}

export enum InvoicePaymentStatus {
  PAID = 'PAID',
  PENDING = 'PENDING',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL',
  CANCELLED = 'CANCELLED'
}

export interface SalesItem {
  id: string;
  saleId: string;
  inventoryId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  isFree: number;
  totalAmount: number;
}

export interface SalesRecord {
  id: string;
  invoiceNumber: string;
  companyId: string;
  agencyName: string;
  customerId: string;
  shopName: string;
  salesRepId: string;
  salesRepName: string;
  invoiceDate: string;
  items: SalesItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: InvoicePaymentMethod;
  paymentStatus: InvoicePaymentStatus;
  territory: string;
  route: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SalesTarget {
  id: string;
  companyId?: string;
  salesRepId?: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  year: number;
  month?: number;
  quarter?: number;
  targetAmount: number;
  achievedAmount: number;
  achievementPercentage: number;
  products?: {
    inventoryId: string;
    targetQuantity: number;
    achievedQuantity: number;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface SalesTerritory {
  id: string;
  name: string;
  companyId: string;
  districts: string[];
  routes: string[];
  salesRepIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SalesPerformance {
  salesRepId: string;
  salesRepName: string;
  companyId: string;
  period: string;
  totalSales: number;
  targetAmount: number;
  achievementRate: number;
  ordersCount: number;
  customersVisited: number;
  newCustomers: number;
  averageOrderValue: number;
  topProducts: {
    inventoryId: string;
    productName: string;
    quantity: number;
    revenue: number;
  }[];
}

export interface SalesStats {
  totalSales: number;
  monthlyGrowth: number;
  targetAchievement: number;
  averageOrderValue: number;
  totalOrders: number;
  activeCustomers: number;
  topPerformers: SalesPerformance[];
  salesTrend: {
    period: string;
    sales: number;
    target: number;
  }[];
  territoryPerformance: {
    territory: string;
    sales: number;
    target: number;
    achievement: number;
  }[];
}

// Backwards compat aliases (kalin code eka break nowanam)
/** @deprecated InvoicePaymentMethod use karanna */
export { InvoicePaymentMethod as PaymentMethod };
/** @deprecated InvoicePaymentStatus use karanna */
export { InvoicePaymentStatus as PaymentStatus };
