export interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  companyId?: string;
  customerId?: string;
  status: AccountStatus;
  creditLimit?: number;
  paymentTerms?: number; // days
  lastTransactionDate?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AccountType {
  COMPANY = 'COMPANY',
  AGENCY = 'AGENCY',
  SHOP = 'SHOP',
  SUPPLIER = 'SUPPLIER',
  BANK = 'BANK'
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  CLOSED = 'CLOSED'
}

export interface AccountTransaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  balance: number;
  description: string;
  reference?: string;
  invoiceNumber?: string;
  paymentMethod?: string;
  companyId?: string;
  customerId?: string;
  salesRepId?: string;
  date: string;
  dueDate?: string;
  status: TransactionStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionType {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  PAYMENT = 'PAYMENT',
  INVOICE = 'INVOICE',
  ADJUSTMENT = 'ADJUSTMENT',
  TRANSFER = 'TRANSFER'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  OVERDUE = 'OVERDUE'
}

export interface AccountSummary {
  totalBalance: number;
  totalReceivables: number;
  totalPayables: number;
  overdueAmount: number;
  creditUtilization: number;
  accountsCount: number;
}

export interface ShopOutstanding {
  customerId: string;
  shopName: string;
  shopAddress: string;
  totalOutstanding: number;
  overdueAmount: number;
  lastPaymentDate?: string;
  creditLimit: number;
  paymentTerms: number;
  transactions: AccountTransaction[];
}