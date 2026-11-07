import { create } from 'zustand';
import { SalesRecord, SalesTarget, SalesTerritory, SalesPerformance, SalesStats } from '../types/sales';
import { useAuthStore } from '../lib/auth';
import { UserRole } from '../types/user';
import { supabase } from '../lib/supabase';

interface SalesState {
  salesRecords: SalesRecord[];
  salesTargets: SalesTarget[];
  territories: SalesTerritory[];
  salesStats: SalesStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchSalesData: () => Promise<void>;
  createSalesRecord: (record: Partial<SalesRecord>) => void;
  updateSalesRecord: (id: string, data: Partial<SalesRecord>) => void;
  deleteSalesRecord: (id: string) => void;
  
  // Targets
  createSalesTarget: (target: Partial<SalesTarget>) => void;
  updateSalesTarget: (id: string, data: Partial<SalesTarget>) => void;
  
  // Territories
  createTerritory: (territory: Partial<SalesTerritory>) => void;
  updateTerritory: (id: string, data: Partial<SalesTerritory>) => void;
  
  // Filtered data based on user role and agency
  getFilteredSalesRecords: () => SalesRecord[];
  getFilteredTargets: () => SalesTarget[];
  getFilteredTerritories: () => SalesTerritory[];
  getSalesPerformance: () => SalesPerformance[];
  getAgencySalesData: (companyId?: string) => SalesRecord[];
}

export const useSalesStore = create<SalesState>((set, get) => ({
  salesRecords: [],
  salesTargets: [],
  territories: [],
  salesStats: null,
  loading: false,
  error: null,

  fetchSalesData: async () => {
    set({ loading: true, error: null });
    try {
      const { invoiceService } = await import('../lib/supabaseServices');
      const { supabase } = await import('../lib/supabase');
      
      // Fetch invoices from Supabase
      const invoices = await invoiceService.getAll();
      
      // Convert invoices to SalesRecord format
      // Note: This requires fetching related data (agencies, shops, users, products)
      const salesRecords: SalesRecord[] = await Promise.all(
        invoices.map(async (invoice) => {
          // Fetch related data
          const [agencyResult, shopResult, userResult] = await Promise.all([
            supabase.from('agencies').select('name').eq('id', invoice.companyId).single(),
            supabase.from('shops').select('name').eq('id', invoice.customerId).single(),
            supabase.from('profiles').select('full_name').eq('id', invoice.salesRepId).single(),
          ]);

          // Fetch product details for items
          const inventoryIds = invoice.items.map(item => item.inventoryId);
          const { data: products } = await supabase
            .from('products')
            .select('id, name, price')
            .in('id', inventoryIds);

          const productMap = new Map(products?.map(p => [p.id, p]) || []);

          return {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            companyId: invoice.companyId,
            agencyName: agencyResult.data?.name || 'Unknown Agency',
            customerId: invoice.customerId,
            shopName: shopResult.data?.name || 'Unknown Shop',
            salesRepId: invoice.salesRepId,
            salesRepName: userResult.data?.full_name || 'Unknown Rep',
            invoiceDate: invoice.invoiceDate,
            items: invoice.items.map(item => {
              const product = productMap.get(item.inventoryId);
              return {
                id: item.id,
                saleId: item.saleId,
                inventoryId: item.inventoryId,
                productName: product?.name || 'Unknown Product',
                productCode: product?.code || '',
                quantity: item.quantity,
                unitPrice: item.price,
                discount: item.discount,
                isFree: item.isFree,
                totalAmount: item.totalAmount,
              };
            }),
            subtotal: invoice.totalAmount,
            discount: invoice.discount,
            tax: invoice.tax,
            totalAmount: invoice.netAmount,
            paymentMethod: invoice.paymentMethod,
            paymentStatus: invoice.paymentStatus,
            territory: '',
            route: '',
            createdAt: invoice.createdAt.toISOString(),
            updatedAt: invoice.updatedAt.toISOString(),
          };
        })
      );

      // For now, keep mock data for targets, territories, and stats
      // These can be migrated to Supabase later
      const { user } = useAuthStore.getState();
      const mockTargets = generateMockTargets(user);
      const mockTerritories = generateMockTerritories(user);
      const mockStats = generateMockStats(user);
      
      set({
        salesRecords,
        salesTargets: mockTargets,
        territories: mockTerritories,
        salesStats: mockStats,
        loading: false
      });
    } catch (error: any) {
      console.error('Error fetching sales data:', error);
      set({ error: error.message || 'Failed to fetch sales data', loading: false });
    }
  },

  createSalesRecord: async (record) => {
    try {
      const { invoiceService } = await import('../lib/supabaseServices');
      
      // Convert SalesRecord to invoice format
      const invoice = await invoiceService.create({
        invoiceNumber: record.invoiceNumber || `INV-${Date.now()}`,
        customerId: record.customerId,
        salesRepId: record.salesRepId,
        companyId: record.companyId,
        invoiceDate: record.invoiceDate || new Date().toISOString(),
        totalAmount: record.totalAmount,
        discount: record.discount || 0,
        tax: record.tax || 0,
        netAmount: record.totalAmount - (record.discount || 0) + (record.tax || 0),
        paymentMethod: record.paymentMethod,
        paymentStatus: record.paymentStatus,
        items: record.items.map(item => ({
          inventoryId: item.inventoryId,
          quantity: item.quantity,
          price: item.unitPrice,
          discount: item.discount || 0,
          isFree: 0,
          totalAmount: item.totalAmount,
        })),
      });

      // Convert invoice back to SalesRecord format
      const newRecord: SalesRecord = {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        companyId: invoice.companyId,
        agencyName: '', // Will be populated from agency lookup
        customerId: invoice.customerId,
        shopName: '', // Will be populated from shop lookup
        salesRepId: invoice.salesRepId,
        salesRepName: '', // Will be populated from user lookup
        invoiceDate: invoice.invoiceDate,
        items: invoice.items.map(item => ({
          id: item.id,
          saleId: item.saleId,
          inventoryId: item.inventoryId,
          productName: '', // Will be populated from product lookup
          productCode: '', // Will be populated from product lookup
          quantity: item.quantity,
          unitPrice: item.price,
          discount: item.discount,
          isFree: item.isFree,
          totalAmount: item.totalAmount,
        })),
        subtotal: invoice.totalAmount,
        discount: invoice.discount,
        tax: invoice.tax,
        totalAmount: invoice.netAmount,
        paymentMethod: invoice.paymentMethod,
        paymentStatus: invoice.paymentStatus,
        territory: '',
        route: '',
        createdAt: invoice.createdAt.toISOString(),
        updatedAt: invoice.updatedAt.toISOString(),
      };

      set(state => ({
        salesRecords: [...state.salesRecords, newRecord]
      }));
    } catch (error) {
      console.error('Error creating sales record:', error);
      throw error;
    }
  },

  updateSalesRecord: (id, data) => {
    set(state => ({
      salesRecords: state.salesRecords.map(record =>
        record.id === id
          ? { ...record, ...data, updatedAt: new Date().toISOString() }
          : record
      )
    }));
  },

  deleteSalesRecord: (id) => {
    set(state => ({
      salesRecords: state.salesRecords.filter(record => record.id !== id)
    }));
  },

  createSalesTarget: (target) => {
    const newTarget: SalesTarget = {
      id: Date.now().toString(),
      achievedAmount: 0,
      achievementPercentage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...target
    } as SalesTarget;

    set(state => ({
      salesTargets: [...state.salesTargets, newTarget]
    }));
  },

  updateSalesTarget: (id, data) => {
    set(state => ({
      salesTargets: state.salesTargets.map(target =>
        target.id === id
          ? { ...target, ...data, updatedAt: new Date().toISOString() }
          : target
      )
    }));
  },

  createTerritory: (territory) => {
    const newTerritory: SalesTerritory = {
      id: Date.now().toString(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...territory
    } as SalesTerritory;

    set(state => ({
      territories: [...state.territories, newTerritory]
    }));
  },

  updateTerritory: (id, data) => {
    set(state => ({
      territories: state.territories.map(territory =>
        territory.id === id
          ? { ...territory, ...data, updatedAt: new Date().toISOString() }
          : territory
      )
    }));
  },

  getFilteredSalesRecords: () => {
    const { user } = useAuthStore.getState();
    const { salesRecords } = get();
    
    if (!user) return [];
    
    // Company (Super Admin/Admin) - All records
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user.role)) {
      return salesRecords;
    }
    
    // Sales Admin - All records with full control
    if (user.role === UserRole.SALES_ADMIN) {
      return salesRecords;
    }
    
    // Sales Manager - All records but can filter by agency
    if (user.role === UserRole.SALES_MANAGER) {
      return salesRecords;
    }
    
    // Area Sales Manager - Only agencies they manage
    if (user.role === UserRole.AREA_SALES_MANAGER && user.managedAgencies) {
      return salesRecords.filter(record => 
        user.managedAgencies!.includes(record.companyId)
      );
    }
    
    // Agency owners see only their agency's records
    if (user.role === UserRole.AGENCY_OWNER && user.companyId) {
      return salesRecords.filter(record => record.companyId === user.companyId);
    }
    
    // Sales reps see only their own records
    if (user.role === UserRole.SALES_REP) {
      return salesRecords.filter(record => record.salesRepId === user.id);
    }
    
    // Accountant - All records (view only)
    if (user.role === UserRole.ACCOUNTANT) {
      return salesRecords;
    }
    
    return [];
  },

  getAgencySalesData: (companyId) => {
    const { salesRecords } = get();
    
    if (!companyId) return salesRecords;
    
    return salesRecords.filter(record => record.companyId === companyId);
  },

  getFilteredTargets: () => {
    const { user } = useAuthStore.getState();
    const { salesTargets } = get();
    
    if (!user) return [];
    
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.SALES_MANAGER].includes(user.role)) {
      return salesTargets;
    }
    
    if (user.role === UserRole.AREA_SALES_MANAGER && user.managedAgencies) {
      return salesTargets.filter(target => 
        !target.companyId || user.managedAgencies!.includes(target.companyId)
      );
    }
    
    if (user.role === UserRole.AGENCY_OWNER && user.companyId) {
      return salesTargets.filter(target => 
        target.companyId === user.companyId || !target.companyId
      );
    }
    
    if (user.role === UserRole.SALES_REP) {
      return salesTargets.filter(target => target.salesRepId === user.id);
    }
    
    if (user.role === UserRole.ACCOUNTANT) {
      return salesTargets;
    }
    
    return [];
  },

  getFilteredTerritories: () => {
    const { user } = useAuthStore.getState();
    const { territories } = get();
    
    if (!user) return [];
    
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.SALES_MANAGER].includes(user.role)) {
      return territories;
    }
    
    if (user.role === UserRole.AREA_SALES_MANAGER && user.managedAgencies) {
      return territories.filter(territory => 
        user.managedAgencies!.includes(territory.companyId)
      );
    }
    
    if (user.role === UserRole.AGENCY_OWNER && user.companyId) {
      return territories.filter(territory => territory.companyId === user.companyId);
    }
    
    if (user.role === UserRole.SALES_REP) {
      return territories.filter(territory => 
        territory.salesRepIds.includes(user.id)
      );
    }
    
    return [];
  },

  getSalesPerformance: () => {
    const { user } = useAuthStore.getState();
    const filteredRecords = get().getFilteredSalesRecords();
    
    if (!user) return [];
    
    return generatePerformanceData(filteredRecords, user);
  }
}));


function generateMockTargets(user: any): SalesTarget[] {
  const targets: SalesTarget[] = [];
  const currentYear = new Date().getFullYear();
  
  if (user?.role === UserRole.SALES_REP) {
    // Individual targets for sales rep
    for (let month = 1; month <= 12; month++) {
      const targetAmount = 75000 + Math.random() * 25000;
      const achievedAmount = Math.random() * targetAmount * 1.2;
      
      targets.push({
        id: `target-rep-${user.id}-${month}`,
        salesRepId: user.id,
        period: 'MONTHLY',
        year: currentYear,
        month,
        targetAmount,
        achievedAmount,
        achievementPercentage: (achievedAmount / targetAmount) * 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  } else {
    // Agency or company-wide targets
    const relevantAgencies = user?.role === UserRole.AGENCY_OWNER && user.companyId ? 
                            [user.companyId] :
                            user?.role === UserRole.AREA_SALES_MANAGER && user.managedAgencies ?
                            user.managedAgencies :
                            agencies.map(a => a.id);
    
    relevantAgencies.forEach(companyId => {
      for (let month = 1; month <= 12; month++) {
        const targetAmount = 300000 + Math.random() * 200000;
        const achievedAmount = Math.random() * targetAmount * 1.1;
        
        targets.push({
          id: `target-agency-${companyId}-${month}`,
          companyId,
          period: 'MONTHLY',
          year: currentYear,
          month,
          targetAmount,
          achievedAmount,
          achievementPercentage: (achievedAmount / targetAmount) * 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });
  }
  
  return targets;
}

function generateMockTerritories(user: any): SalesTerritory[] {
  const territories: SalesTerritory[] = [];
  
  const territoryData = [
    { name: 'Western Province', districts: ['Colombo', 'Gampaha', 'Kalutara'], agencies: ['1', '2'] },
    { name: 'Central Province', districts: ['Kandy', 'Matale', 'Nuwara Eliya'], agencies: ['3', '4'] },
    { name: 'Southern Province', districts: ['Galle', 'Matara', 'Hambantota'], agencies: ['5', '6'] },
    { name: 'Northern Province', districts: ['Jaffna', 'Kilinochchi', 'Mannar'], agencies: ['7', '8'] },
    { name: 'Eastern Province', districts: ['Batticaloa', 'Ampara', 'Trincomalee'], agencies: ['9', '10'] }
  ];
  
  territoryData.forEach((territory, index) => {
    const relevantAgencies = user?.role === UserRole.AREA_SALES_MANAGER && user.managedAgencies ?
                            territory.agencies.filter(a => user.managedAgencies.includes(a)) :
                            user?.role === UserRole.AGENCY_OWNER && user.companyId ?
                            territory.agencies.filter(a => a === user.companyId) :
                            territory.agencies;
    
    if (relevantAgencies.length > 0) {
      relevantAgencies.forEach(companyId => {
        // Note: In a real implementation, you would fetch sales reps from profiles table
        // For mock data, use placeholder IDs
        const placeholderRepIds = [`rep-${companyId}-1`, `rep-${companyId}-2`];
        
        territories.push({
          id: `territory-${index + 1}-${companyId}`,
          name: `${territory.name} - Agency ${companyId}`,
          companyId,
          districts: territory.districts,
          routes: [`Route ${index + 1}A`, `Route ${index + 1}B`, `Route ${index + 1}C`],
          salesRepIds: placeholderRepIds,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    }
  });
  
  return territories;
}

function generateMockStats(user: any): SalesStats {
  const baseStats = {
    totalSales: 2500000 + Math.random() * 1000000,
    monthlyGrowth: Math.random() * 25 - 5,
    targetAchievement: 85 + Math.random() * 30,
    averageOrderValue: 3500 + Math.random() * 1500,
    totalOrders: 850 + Math.floor(Math.random() * 300),
    activeCustomers: 220 + Math.floor(Math.random() * 80),
    topPerformers: [],
    salesTrend: [],
    territoryPerformance: []
  };
  
  // Adjust stats based on user role
  if (user?.role === UserRole.SALES_REP) {
    baseStats.totalSales = 150000 + Math.random() * 50000;
    baseStats.totalOrders = 45 + Math.floor(Math.random() * 20);
    baseStats.activeCustomers = 15 + Math.floor(Math.random() * 10);
  } else if (user?.role === UserRole.AGENCY_OWNER) {
    baseStats.totalSales = 500000 + Math.random() * 200000;
    baseStats.totalOrders = 180 + Math.floor(Math.random() * 80);
    baseStats.activeCustomers = 45 + Math.floor(Math.random() * 20);
  }
  
  return baseStats;
}

function generatePerformanceData(records: SalesRecord[], user: any): SalesPerformance[] {
  const performance: SalesPerformance[] = [];
  
  // Group records by sales rep
  const repGroups = records.reduce((acc, record) => {
    if (!acc[record.salesRepId]) {
      acc[record.salesRepId] = [];
    }
    acc[record.salesRepId].push(record);
    return acc;
  }, {} as Record<string, SalesRecord[]>);
  
  Object.entries(repGroups).forEach(([repId, repRecords]) => {
    const totalSales = repRecords.reduce((sum, record) => sum + record.totalAmount, 0);
    const ordersCount = repRecords.length;
    const averageOrderValue = totalSales / ordersCount;
    const targetAmount = 75000; // Base monthly target
    
    // Note: In a real implementation, you would fetch from profiles table
    // For mock data, use placeholder name
    const salesRepName = `Sales Rep ${repId}`;
    
    performance.push({
      salesRepId: repId,
      salesRepName: salesRepName,
      companyId: repRecords[0].companyId,
      period: 'Current Month',
      totalSales,
      targetAmount,
      achievementRate: (totalSales / targetAmount) * 100,
      ordersCount,
      customersVisited: Math.floor(ordersCount * 1.3),
      newCustomers: Math.floor(ordersCount * 0.25),
      averageOrderValue,
      topProducts: []
    });
  });
  
  return performance.sort((a, b) => b.totalSales - a.totalSales);
}
