export interface Account {
  id: string;
  name: string;
  type: string;
  number: string;
  balance: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  reference?: string;
  date: string;
  category: string;
  attachments: {
    type: string;
    url: string;
  }[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  TRANSFER = 'TRANSFER',
}