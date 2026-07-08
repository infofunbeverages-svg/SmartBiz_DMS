export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ON_HOLD = 'ON_HOLD'
}

export interface OrderItem {
  id: string;
  orderId: string;
  inventoryId: string;
  quantity: number;
  price: number;
  discount: number;
  isFree: number;
  totalAmount: number;
}

export interface Order {
  id: string;
  companyId: string;
  agencyName: string;
  agencyCode: string;
  draftDate: string;
  status: OrderStatus;
  totalAmount: number;
  items: OrderItem[];
  notes?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}