import { create } from 'zustand';
import { Account, AccountTransaction, AccountSummary, ShopOutstanding } from '../types/account';
import { useAuthStore } from '../lib/auth';
import { UserRole } from '../types/user';
import { supabase } from '../lib/supabase';
import { AccountType, AccountStatus, TransactionType, TransactionStatus } from '../types/account';

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
      const [ag, led, sh] = await Promise.all([
        supabase.from('agencies').select('*').order('name'),
        supabase.from('agency_ledger').select('*').order('date', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('shops').select('*').order('name'),
      ]);
      const firstErr = ag.error || led.error || sh.error;
      if (firstErr) throw firstErr;

      const agencies = ag.data || [];
      const shops = sh.data || [];

      const accounts: Account[] = [
        ...agencies.map((a: any): Account => ({
          id: a.id, accountNumber: a.code || a.id.slice(0, 8).toUpperCase(), accountName: a.name,
          accountType: AccountType.AGENCY, balance: Number(a.outstanding || 0), currency: 'LKR',
          companyId: a.company_id, customerId: a.id,
          status: a.status === 'ACTIVE' ? AccountStatus.ACTIVE : AccountStatus.INACTIVE,
          creditLimit: Number(a.credit_limit || 0), createdAt: a.created_at, updatedAt: a.created_at,
        })),
        ...shops.map((x: any): Account => ({
          id: x.id, accountNumber: x.id.slice(0, 8).toUpperCase(), accountName: x.name,
          accountType: AccountType.SHOP, balance: Number(x.outstanding || 0), currency: 'LKR',
          companyId: x.company_id, customerId: x.id,
          status: x.status === 'ACTIVE' ? AccountStatus.ACTIVE : AccountStatus.INACTIVE,
          creditLimit: Number(x.credit_limit || 0), createdAt: x.created_at, updatedAt: x.created_at,
        })),
      ];

      // Ledger rows -> transactions with a running balance per agency
      const running = new Map<string, number>();
      const transactions: AccountTransaction[] = (led.data || []).map((r: any) => {
        const debit = Number(r.debit || 0), credit = Number(r.credit || 0);
        const bal = (running.get(r.agency_id) || 0) + debit - credit;
        running.set(r.agency_id, bal);
        const t = String(r.type || '').toUpperCase();
        const st = String(r.status || '').toUpperCase();
        return {
          id: r.id, accountId: r.agency_id, customerId: r.agency_id, companyId: r.company_id,
          type: (Object.values(TransactionType) as string[]).includes(t)
            ? (t as TransactionType) : (debit > 0 ? TransactionType.DEBIT : TransactionType.CREDIT),
          amount: debit > 0 ? debit : credit, balance: bal,
          description: r.description || r.type || '', reference: r.reference || undefined,
          date: r.date, status: (Object.values(TransactionStatus) as string[]).includes(st)
            ? (st as TransactionStatus) : TransactionStatus.COMPLETED,
          createdBy: '', createdAt: r.created_at, updatedAt: r.created_at,
        } as AccountTransaction;
      }).reverse(); // newest first

      const shopOutstandings: ShopOutstanding[] = shops
        .filter((x: any) => Number(x.outstanding || 0) > 0)
        .map((x: any) => ({
          customerId: x.id, shopName: x.name, shopAddress: x.address || x.area || '',
          totalOutstanding: Number(x.outstanding || 0), overdueAmount: 0,
          creditLimit: Number(x.credit_limit || 0), paymentTerms: 0, transactions: [],
        }));

      const totalReceivables = agencies.reduce((s: number, a: any) => s + Number(a.outstanding || 0), 0);
      const totalLimit = agencies.reduce((s: number, a: any) => s + Number(a.credit_limit || 0), 0);
      const overdueAmount = (led.data || [])
        .filter((r: any) => String(r.status || '').toUpperCase() === 'OVERDUE')
        .reduce((s: number, r: any) => s + Number(r.debit || 0) - Number(r.credit || 0), 0);

      const accountSummary: AccountSummary = {
        totalBalance: totalReceivables, totalReceivables, totalPayables: 0, overdueAmount,
        creditUtilization: totalLimit > 0 ? Math.round((totalReceivables / totalLimit) * 100) : 0,
        accountsCount: accounts.length,
      };

      set({ accounts, transactions, accountSummary, shopOutstandings, loading: false });
    } catch (e: any) {
      console.error('fetchAccountData:', e);
      set({ error: e?.message || 'Failed to fetch account data', loading: false });
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
      return accounts; // rows are already limited by Supabase RLS
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
      return transactions; // already limited by RLS
    }
    
    // Sales Rep - Shop transactions only
    if (user.role === UserRole.SALES_REP) {
      return transactions;
    }
    
    return [];
  },

  getShopOutstandings: () => {
    const { user } = useAuthStore.getState();
    const { shopOutstandings } = get();
    
    if (!user) return [];
    
    // Sales Rep - Only shops they manage
    if (user.role === UserRole.SALES_REP) {
      return shopOutstandings; // RLS limits shops to this rep's scope
    }
    
    // Agency Owner - Only shops in their agency
    if (user.role === UserRole.AGENCY_OWNER && user.companyId) {
      return shopOutstandings;
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
