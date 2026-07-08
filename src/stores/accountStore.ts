import { create } from 'zustand';
import { Account, AccountTransaction, AccountSummary, ShopOutstanding } from '../types/account';
import { useAuthStore } from '../lib/auth';
import { UserRole } from '../types/user';

interface AccountState {
  accounts: Account[];
  transactions: AccountTransaction[];
  accountSummary: AccountSummary | null;
  shopOutstandings: ShopOutstanding[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAccountData: () => Promise<void>;
  createAccount: (account: Partial<Account>) => void;
  updateAccount: (id: string, data: Partial<Account>) => void;
  deleteAccount: (id: string) => void;
  
  // Transactions
  createTransaction: (transaction: Partial<AccountTransaction>) => void;
  updateTransaction: (id: string, data: Partial<AccountTransaction>) => void;
  
  // Filtered data based on user role
  getFilteredAccounts: () => Account[];
  getFilteredTransactions: () => AccountTransaction[];
  getShopOutstandings: () => ShopOutstanding[];
  getAccountSummary: () => AccountSummary | null;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  transactions: [],
  accountSummary: null,
  shopOutstandings: [],
  loading: false,
  error: null,

  fetchAccountData: async () => {
    set({ loading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const { user } = useAuthStore.getState();
      const mockAccounts = generateMockAccounts(user);
      const mockTransactions = generateMockTransactions(user);
      const mockSummary = generateMockSummary(user);
      const mockOutstandings = generateMockOutstandings(user);
      
      set({
        accounts: mockAccounts,
        transactions: mockTransactions,
        accountSummary: mockSummary,
        shopOutstandings: mockOutstandings,
        loading: false
      });
    } catch (error) {
      set({ error: 'Failed to fetch account data', loading: false });
    }
  },

  createAccount: (account) => {
    const newAccount: Account = {
      id: Date.now().toString(),
      accountNumber: `ACC-${Date.now()}`,
      status: 'ACTIVE',
      currency: 'LKR',
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...account
    } as Account;

    set(state => ({
      accounts: [...state.accounts, newAccount]
    }));
  },

  updateAccount: (id, data) => {
    set(state => ({
      accounts: state.accounts.map(account =>
        account.id === id
          ? { ...account, ...data, updatedAt: new Date().toISOString() }
          : account
      )
    }));
  },

  deleteAccount: (id) => {
    set(state => ({
      accounts: state.accounts.filter(account => account.id !== id)
    }));
  },

  createTransaction: (transaction) => {
    const newTransaction: AccountTransaction = {
      id: Date.now().toString(),
      status: 'PENDING',
      date: new Date().toISOString(),
      createdBy: useAuthStore.getState().user?.id || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...transaction
    } as AccountTransaction;

    set(state => ({
      transactions: [...state.transactions, newTransaction]
    }));
  },

  updateTransaction: (id, data) => {
    set(state => ({
      transactions: state.transactions.map(transaction =>
        transaction.id === id
          ? { ...transaction, ...data, updatedAt: new Date().toISOString() }
          : transaction
      )
    }));
  },

  getFilteredAccounts: () => {
    const { user } = useAuthStore.getState();
    const { accounts } = get();
    
    if (!user) return [];
    
    // Company (Super Admin/Admin) - View Only
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) {
      return accounts;
    }
    
    // Accountant - Full Control
    if (user.role === UserRole.ACCOUNTANT) {
      return accounts;
    }
    
    // Distributor (Agency Owner) - Agency Control Only
    if (user.role === UserRole.AGENCY_OWNER && user.companyId) {
      return accounts.filter(account => 
        account.companyId === user.companyId || account.accountType === 'AGENCY'
      );
    }
    
    // Sales Representative - Shop Outstanding Only (handled separately)
    if (user.role === UserRole.SALES_REP) {
      return [];
    }
    
    return [];
  },

  getFilteredTransactions: () => {
    const { user } = useAuthStore.getState();
    const { transactions } = get();
    
    if (!user) return [];
    
    // Company - View Only
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) {
      return transactions;
    }
    
    // Accountant - Full Control
    if (user.role === UserRole.ACCOUNTANT) {
      return transactions;
    }
    
    // Distributor - Agency transactions only
    if (user.role === UserRole.AGENCY_OWNER && user.companyId) {
      return transactions.filter(transaction => transaction.companyId === user.companyId);
    }
    
    // Sales Rep - Shop transactions only
    if (user.role === UserRole.SALES_REP) {
      return transactions.filter(transaction => transaction.salesRepId === user.id);
    }
    
    return [];
  },

  getShopOutstandings: () => {
    const { user } = useAuthStore.getState();
    const { shopOutstandings } = get();
    
    if (!user) return [];
    
    // Sales Rep - Only shops they manage
    if (user.role === UserRole.SALES_REP) {
      return shopOutstandings.filter(outstanding => 
        outstanding.transactions.some(t => t.salesRepId === user.id)
      );
    }
    
    // Agency Owner - Only shops in their agency
    if (user.role === UserRole.AGENCY_OWNER && user.companyId) {
      return shopOutstandings.filter(outstanding =>
        outstanding.transactions.some(t => t.companyId === user.companyId)
      );
    }
    
    // Company and Accountant - All shops
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT].includes(user.role)) {
      return shopOutstandings;
    }
    
    return [];
  },

  getAccountSummary: () => {
    const { user } = useAuthStore.getState();
    const { accountSummary } = get();
    
    if (!user || !accountSummary) return null;
    
    // Filter summary based on user role
    const filteredAccounts = get().getFilteredAccounts();
    const filteredTransactions = get().getFilteredTransactions();
    
    if (filteredAccounts.length === 0 && user.role !== UserRole.SALES_REP) {
      return null;
    }
    
    return accountSummary;
  }
}));

// Helper functions for generating mock data
function generateMockAccounts(user: any): Account[] {
  const accounts: Account[] = [];
  
  if (!user) return accounts;
  
  // Company accounts (visible to all except sales reps)
  if (user.role !== UserRole.SALES_REP) {
    accounts.push(
      {
        id: 'acc-company-1',
        accountNumber: 'COMP-001',
        accountName: 'Main Company Account',
        accountType: 'COMPANY',
        balance: 5000000,
        currency: 'LKR',
        status: 'ACTIVE',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'acc-bank-1',
        accountNumber: 'BANK-001',
        accountName: 'Commercial Bank Current',
        accountType: 'BANK',
        balance: 2500000,
        currency: 'LKR',
        status: 'ACTIVE',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    );
  }
  
  // Agency accounts
  if (user.role === UserRole.AGENCY_OWNER || [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT].includes(user.role)) {
    const companyId = user.companyId || 'agency-1';
    accounts.push({
      id: `acc-agency-${companyId}`,
      accountNumber: `AGY-${companyId.toUpperCase()}`,
      accountName: `Agency ${companyId} Account`,
      accountType: 'AGENCY',
      companyId,
      balance: 750000,
      currency: 'LKR',
      status: 'ACTIVE',
      creditLimit: 1000000,
      paymentTerms: 30,
      createdAt: '2023-02-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    });
  }
  
  // Shop accounts
  for (let i = 1; i <= 5; i++) {
    accounts.push({
      id: `acc-shop-${i}`,
      accountNumber: `SHOP-${String(i).padStart(3, '0')}`,
      accountName: `Shop ${i} Account`,
      accountType: 'SHOP',
      customerId: `shop-${i}`,
      companyId: user.companyId || 'agency-1',
      balance: -Math.random() * 50000,
      currency: 'LKR',
      status: 'ACTIVE',
      creditLimit: 100000,
      paymentTerms: 15,
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    });
  }
  
  return accounts;
}

function generateMockTransactions(user: any): AccountTransaction[] {
  const transactions: AccountTransaction[] = [];
  
  if (!user) return transactions;
  
  for (let i = 1; i <= 20; i++) {
    const isCredit = Math.random() > 0.5;
    const amount = Math.floor(Math.random() * 50000) + 5000;
    
    transactions.push({
      id: `txn-${i}`,
      accountId: `acc-shop-${Math.floor(Math.random() * 5) + 1}`,
      type: isCredit ? 'CREDIT' : 'DEBIT',
      amount,
      balance: Math.random() * 100000 - 50000,
      description: isCredit ? `Payment received - INV-${1000 + i}` : `Invoice - INV-${1000 + i}`,
      reference: `REF-${1000 + i}`,
      invoiceNumber: `INV-${1000 + i}`,
      paymentMethod: ['CASH', 'BANK_TRANSFER', 'CARD'][Math.floor(Math.random() * 3)],
      companyId: user.companyId || 'agency-1',
      customerId: `shop-${Math.floor(Math.random() * 5) + 1}`,
      salesRepId: user.role === UserRole.SALES_REP ? user.id : `rep-${Math.floor(Math.random() * 3) + 1}`,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      dueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: ['PENDING', 'COMPLETED', 'OVERDUE'][Math.floor(Math.random() * 3)],
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  return transactions;
}

function generateMockSummary(user: any): AccountSummary {
  return {
    totalBalance: 2750000,
    totalReceivables: 450000,
    totalPayables: 180000,
    overdueAmount: 75000,
    creditUtilization: 65,
    accountsCount: 15
  };
}

function generateMockOutstandings(user: any): ShopOutstanding[] {
  const outstandings: ShopOutstanding[] = [];
  
  for (let i = 1; i <= 10; i++) {
    const outstanding = Math.floor(Math.random() * 80000) + 10000;
    const overdue = Math.floor(outstanding * 0.3);
    
    outstandings.push({
      customerId: `shop-${i}`,
      shopName: `Shop ${i}`,
      shopAddress: `Address ${i}, Colombo`,
      totalOutstanding: outstanding,
      overdueAmount: overdue,
      lastPaymentDate: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString(),
      creditLimit: 100000,
      paymentTerms: 15,
      transactions: []
    });
  }
  
  return outstandings;
}