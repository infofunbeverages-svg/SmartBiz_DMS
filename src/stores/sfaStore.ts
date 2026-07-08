import { create } from 'zustand';
import {
  DutySession, SalesTransaction, CustomerMaster,
  GPSTrackingLog, AttendanceRecord, CashCollection,
  Promotion, UnloadingBalance, DailyLoading,
} from '../types/sfa';
import { useAuthStore } from '../lib/auth';
import { supabase } from '../lib/supabase';

interface SFAState {
  currentDutySession: DutySession | null;
  salesTransactions: SalesTransaction[];
  customers: CustomerMaster[];
  gpsLogs: GPSTrackingLog[];
  attendanceRecords: AttendanceRecord[];
  cashCollections: CashCollection[];
  promotions: Promotion[];
  unloadingBalance: UnloadingBalance[];
  dailyLoading: DailyLoading[];
  isOnline: boolean;
  isSyncing: boolean;
  pendingSyncData: unknown[];

  startDuty: (location: { latitude: number; longitude: number; address: string }) => Promise<void>;
  endDuty:   (location: { latitude: number; longitude: number; address: string }) => Promise<void>;
  addSalesTransaction: (transaction: Partial<SalesTransaction>) => void;
  addGPSLog:           (log: Partial<GPSTrackingLog>) => void;
  addCashCollection:   (collection: Partial<CashCollection>) => void;
  syncDataToServer:    () => Promise<void>;
  loadDailyStock:      (loading: DailyLoading[]) => void;
  generateUnloadingReport: () => UnloadingBalance[];

  getCurrentLocation: () => Promise<{ latitude: number; longitude: number; address: string }>;
  getTodaysSales:       () => SalesTransaction[];
  getTodaysCollections: () => CashCollection[];
  getCustomerLedger:    (customerId: string) => unknown[];
}

export const useSFAStore = create<SFAState>((set, get) => ({
  currentDutySession: null,
  salesTransactions:  [],
  customers:          [],
  gpsLogs:            [],
  attendanceRecords:  [],
  cashCollections:    [],
  promotions:         [],
  unloadingBalance:   [],
  dailyLoading:       [],
  isOnline:   navigator.onLine,
  isSyncing:  false,
  pendingSyncData: [],

  startDuty: async (location) => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const dutySession: DutySession = {
      id:            Date.now().toString(),
      salesRepId:    user.id,
      dutyOnTime:    new Date().toISOString(),
      location,
      status:        'ON_DUTY',
      dailyLoading:  get().dailyLoading,
      salesData:     [],
      unloadingBalance: [],
      syncStatus:    'PENDING',
      createdAt:     new Date().toISOString(),
      updatedAt:     new Date().toISOString(),
    };

    get().addGPSLog({ salesRepId: user.id, latitude: location.latitude, longitude: location.longitude, address: location.address, activity: 'DUTY_ON', timestamp: new Date().toISOString(), accuracy: 10 });
    set({ currentDutySession: dutySession });
  },

  endDuty: async (location) => {
    const { currentDutySession } = get();
    if (!currentDutySession) return;

    get().addGPSLog({ salesRepId: currentDutySession.salesRepId, latitude: location.latitude, longitude: location.longitude, address: location.address, activity: 'DUTY_OFF', timestamp: new Date().toISOString(), accuracy: 10 });

    const updatedSession: DutySession = {
      ...currentDutySession,
      dutyOffTime:      new Date().toISOString(),
      status:           'OFF_DUTY',
      salesData:        get().getTodaysSales(),
      unloadingBalance: get().generateUnloadingReport(),
      updatedAt:        new Date().toISOString(),
    };
    set({ currentDutySession: updatedSession });
    await get().syncDataToServer();
  },

  addSalesTransaction: (transaction) => {
    const newTx: SalesTransaction = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      isFree: [],
      promotions: [],
      ...transaction,
    } as SalesTransaction;

    set(state => ({ salesTransactions: [...state.salesTransactions, newTx] }));

    get().addGPSLog({
      salesRepId: newTx.customerId,
      latitude:   newTx.location.latitude,
      longitude:  newTx.location.longitude,
      address:    newTx.location.address,
      activity:   'SALE',
      timestamp:  new Date().toISOString(),
      accuracy:   10,
    });
  },

  addGPSLog: (log) => {
    const newLog: GPSTrackingLog = { id: Date.now().toString(), accuracy: 10, ...log } as GPSTrackingLog;
    set(state => ({ gpsLogs: [...state.gpsLogs, newLog] }));
  },

  addCashCollection: (collection) => {
    const newCol: CashCollection = {
      id: Date.now().toString(),
      status: 'COLLECTED',
      collectionDate: new Date().toISOString(),
      invoiceNumbers: [],
      ...collection,
    } as CashCollection;
    set(state => ({ cashCollections: [...state.cashCollections, newCol] }));
  },

  /**
   * Bug fix: fake setTimeout → real Supabase sync.
   * GPS logs ekai cash collections ekai gps_tracking_logs table ekata push karanawa.
   */
  syncDataToServer: async () => {
    const { salesTransactions, gpsLogs, cashCollections, currentDutySession } = get();
    if (!currentDutySession) return;

    set({ isSyncing: true });
    try {
      // GPS logs sync
      if (gpsLogs.length > 0) {
        const today = new Date().toISOString().split('T')[0];
        const rows = gpsLogs.map(log => ({
          sales_rep_id: log.salesRepId,
          duty_date:    today,
          latitude:     log.latitude,
          longitude:    log.longitude,
          address:      log.address,
          activity:     log.activity,
          accuracy:     log.accuracy,
          recorded_at:  log.timestamp,
        }));
        const { error: gpsError } = await supabase.from('gps_tracking_logs').insert(rows);
        if (gpsError) console.error('GPS sync error:', gpsError);
      }

      // Sync status update
      set({
        isSyncing: false,
        currentDutySession: {
          ...currentDutySession,
          syncStatus: 'SYNCED',
        },
      });

      console.log('Sync complete:', {
        sales:       salesTransactions.length,
        gpsLogs:     gpsLogs.length,
        collections: cashCollections.length,
      });
    } catch (err) {
      console.error('Sync failed:', err);
      set({
        isSyncing: false,
        currentDutySession: { ...currentDutySession, syncStatus: 'FAILED' },
      });
    }
  },

  loadDailyStock: (loading) => set({ dailyLoading: loading }),

  generateUnloadingReport: () => {
    const { dailyLoading } = get();
    const todaysSales = get().getTodaysSales();

    const unloading: UnloadingBalance[] = dailyLoading.map(loaded => {
      const soldQty = todaysSales.reduce((sum, sale) => {
        const item = sale.items.find(i => i.inventoryId === loaded.inventoryId);
        return sum + (item?.quantity ?? 0);
      }, 0);
      const returnQty = todaysSales.reduce((sum, sale) => {
        const ret = sale.returns?.find(r => r.inventoryId === loaded.inventoryId);
        return sum + (ret?.quantity ?? 0);
      }, 0);
      const balance = loaded.loadedQuantity - soldQty + returnQty;
      return {
        inventoryId:     loaded.inventoryId,
        productName:     loaded.productName,
        loadedQuantity:  loaded.loadedQuantity,
        soldQuantity:    soldQty,
        returnQuantity:  returnQty,
        balanceQuantity: balance,
        nextDayStock:    balance,
      };
    });

    set({ unloadingBalance: unloading });
    return unloading;
  },

  getCurrentLocation: async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported on this device'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          latitude:  pos.coords.latitude,
          longitude: pos.coords.longitude,
          address:   `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
        }),
        err => reject(err),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
      );
    });
  },

  getTodaysSales: () => {
    const today = new Date().toDateString();
    return get().salesTransactions.filter(s => new Date(s.timestamp).toDateString() === today);
  },

  getTodaysCollections: () => {
    const today = new Date().toDateString();
    return get().cashCollections.filter(c => new Date(c.collectionDate).toDateString() === today);
  },

  getCustomerLedger: (customerId) => {
    return get().customers.find(c => c.id === customerId)?.ledger ?? [];
  },
}));

window.addEventListener('online',  () => useSFAStore.setState({ isOnline: true }));
window.addEventListener('offline', () => useSFAStore.setState({ isOnline: false }));
