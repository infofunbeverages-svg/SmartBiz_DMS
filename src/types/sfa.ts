// ─────────────────────────────────────────────────────────
// Existing types — unchanged (keep backward compat)
// ─────────────────────────────────────────────────────────

export interface DutySession {
  id: string;
  salesRepId: string;
  dutyOnTime: string;
  dutyOffTime?: string;
  location: { latitude: number; longitude: number; address: string };
  status: 'ON_DUTY' | 'OFF_DUTY';
  dailyLoading: DailyLoading[];
  salesData: SalesTransaction[];
  unloadingBalance: UnloadingBalance[];
  syncStatus: 'PENDING' | 'SYNCED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface DailyLoading {
  id: string;
  inventoryId: string;
  productName: string;
  productCode: string;
  loadedQuantity: number;
  unitPrice: number;
  totalValue: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface SalesTransaction {
  id: string;
  customerId: string;
  customerName: string;
  customerType: 'RETAILER' | 'DISTRIBUTOR';
  invoiceNumber: string;
  items: SalesTransactionItem[];
  subtotal: number;
  discount: number;
  isFree: FreeIssueItem[];
  tax: number;
  totalAmount: number;
  paymentMethod: 'CASH' | 'CREDIT' | 'CARD' | 'MOBILE';
  paymentStatus: 'PAID' | 'PENDING' | 'PARTIAL';
  location: { latitude: number; longitude: number; address: string };
  timestamp: string;
  promotions: AppliedPromotion[];
  returns?: ReturnItem[];
}

export interface SalesTransactionItem {
  id: string;
  inventoryId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalAmount: number;
}

export interface FreeIssueItem {
  inventoryId: string;
  productName: string;
  quantity: number;
  reason: string;
}

export interface AppliedPromotion {
  id: string;
  name: string;
  type: 'DISCOUNT' | 'FREE_ISSUE' | 'BUNDLE';
  value: number;
  appliedAmount: number;
}

export interface ReturnItem {
  id: string;
  inventoryId: string;
  productName: string;
  quantity: number;
  reason: string;
  type: 'SALES_RETURN' | 'MARKET_RETURN';
  condition: 'GOOD' | 'DAMAGED' | 'EXPIRED';
}

export interface UnloadingBalance {
  inventoryId: string;
  productName: string;
  loadedQuantity: number;
  soldQuantity: number;
  returnQuantity: number;
  balanceQuantity: number;
  nextDayStock: number;
}

export interface CustomerMaster {
  id: string;
  code: string;
  name: string;
  type: 'RETAILER' | 'DISTRIBUTOR';
  address: string;
  phone: string;
  email?: string;
  location: { latitude: number; longitude: number };
  creditLimit: number;
  paymentTerms: number;
  route: string;
  salesRepId: string;
  status: 'ACTIVE' | 'INACTIVE';
  ledger: CustomerLedgerEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  type: 'SALE' | 'PAYMENT' | 'RETURN' | 'ADJUSTMENT';
  amount: number;
  balance: number;
  description: string;
  invoiceNumber?: string;
  date: string;
}

export interface GPSTrackingLog {
  id: string;
  salesRepId: string;
  latitude: number;
  longitude: number;
  address: string;
  activity: 'DUTY_ON' | 'DUTY_OFF' | 'CUSTOMER_VISIT' | 'SALE' | 'TRAVEL' | 'DELIVERY';
  timestamp: string;
  accuracy: number;
}

export interface AttendanceRecord {
  id: string;
  salesRepId: string;
  date: string;
  dutyOnTime: string;
  dutyOffTime?: string;
  totalHours?: number;
  customersVisited: number;
  salesMade: number;
  totalSalesAmount: number;
  status: 'PRESENT' | 'ABSENT' | 'HALF_DAY';
}

export interface CashCollection {
  id: string;
  salesRepId: string;
  customerId: string;
  customerName: string;
  amount: number;
  paymentMethod: 'CASH' | 'CHEQUE' | 'BANK_TRANSFER';
  chequeNumber?: string;
  bankDetails?: string;
  collectionDate: string;
  invoiceNumbers: string[];
  location: { latitude: number; longitude: number };
  status: 'COLLECTED' | 'DEPOSITED' | 'CLEARED';
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  type: 'DISCOUNT' | 'FREE_ISSUE' | 'BUNDLE' | 'CASHBACK';
  conditions: {
    minQuantity?: number;
    minAmount?: number;
    inventoryIds?: string[];
    customerTypes?: string[];
  };
  benefits: {
    discountPercentage?: number;
    discountAmount?: number;
    freeProducts?: { inventoryId: string; quantity: number }[];
    cashbackAmount?: number;
  };
  startDate: string;
  endDate: string;
  isActive: boolean;
}

// ─────────────────────────────────────────────────────────
// Phase 0 — New types
// ─────────────────────────────────────────────────────────

/** Mode 1 — Rep bike eken shop ekata visit kara gannawa pre-sell order.
 *  Delivery pamanak penesset wenna ona — Invoice nemei.
 *  IMPORTANT: Existing Order type eka (Agency→Company) ekka confuse nakara.
 */
export interface BookingItem {
  id: string;
  inventoryId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalAmount: number;
  isFree: boolean;
  freeReason?: string; // 'FREE_ISSUE' | 'SAMPLE' | 'PROMOTION'
}

export type BookingStatus =
  | 'PENDING'
  | 'LOADED_TO_LORRY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'PARTIALLY_DELIVERED'
  | 'CANCELLED';

export interface Booking {
  id: string;
  bookingNumber: string;
  agencyId: string;
  salesRepId: string;
  shopId: string;
  shopName: string;
  bookingDate: string;
  expectedDelivery?: string;
  gpsLocation?: { latitude: number; longitude: number; address: string };
  items: BookingItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

/** System eken auto-generate wena Lorry Loading Sheet.
 *  Bookings tika aggregate kara, product-wise total quantities hadanawa.
 *  PDF widihata print karaGanna puluwan.
 */
export type LorryLoadingSheetStatus =
  | 'GENERATED'
  | 'LOADED'
  | 'OUT_FOR_DELIVERY'
  | 'COMPLETED'
  | 'CANCELLED';

export interface LorryLoadingSheetItem {
  inventoryId: string;
  productName: string;
  productCode: string;
  totalQty: number;
  unitPrice: number;
}

export interface LorryLoadingSheet {
  id: string;
  sheetNumber: string;
  agencyId: string;
  vehicleId?: string;
  driverId?: string;
  collectorId?: string;
  route?: string;
  loadingDate: string;
  bookingIds: string[];           // eka sheet ekata yana bookings
  items: LorryLoadingSheetItem[]; // product-wise aggregate
  status: LorryLoadingSheetStatus;
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/** Per-bill delivery update — collector field eke mark karanawa. */
export type DeliveryStatus =
  | 'PENDING'
  | 'DELIVERED'
  | 'PARTIALLY_DELIVERED'
  | 'NOT_DELIVERED'
  | 'CANCELLED';

export type DeliveryPaymentStatus = 'PAID' | 'PENDING' | 'PARTIAL' | 'CREDIT';
export type DeliveryPaymentMethod = 'CASH' | 'CHEQUE' | 'CREDIT';

export interface AdjustedItem {
  inventoryId: string;
  productName: string;
  originalQty: number;
  deliveredQty: number;
  reason: string;
}

export interface DeliveryRecord {
  id: string;
  sheetId: string;
  bookingId: string;
  collectorId?: string;
  deliveryStatus: DeliveryStatus;
  paymentStatus: DeliveryPaymentStatus;
  paymentMethod?: DeliveryPaymentMethod;
  chequeNumber?: string;
  cashAmount: number;
  creditAmount: number;
  adjustedItems?: AdjustedItem[];
  cancelledItems?: { inventoryId: string; qty: number; reason: string }[];
  gpsLocation?: { latitude: number; longitude: number };
  deliveredAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Bill edit approval — DB Owner (Agency Owner) real-time approval workflow. */
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface BillEditApprovalRequest {
  id: string;
  bookingId?: string;
  deliveryId?: string;
  requestedBy: string;
  requestedByName: string;
  agencyId: string;
  reason: string;
  changesBefore: Record<string, unknown>; // snapshot
  changesAfter: Record<string, unknown>;  // requested new state
  status: ApprovalStatus;
  approvedBy?: string;
  respondedAt?: string;
  responseNote?: string;
  createdAt: string;
  updatedAt: string;
}
