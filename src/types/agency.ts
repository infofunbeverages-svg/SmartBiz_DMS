export enum AgencyRole {
  OWNER      = 'OWNER',
  MANAGER    = 'MANAGER',
  CLERK      = 'CLERK',      // Bug fix: kalin nebba — add karagena thiyenawa
  SALES_REP  = 'SALES_REP'
}

export interface Agency {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  ownerId: string;
  territory: {
    region: string;
    districts: string[];
  };
  creditLimit: number;
  status: 'ACTIVE' | 'INACTIVE';
  salesTarget: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgencyUser {
  id: string;
  agencyId: string;
  userId: string;
  name: string;
  email: string;
  role: AgencyRole;
  territory?: {
    districts: string[];
    routes: string[];
  };
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface AgencyStats {
  totalSales: number;
  monthlyTarget: number;
  achievementRate: number;
  orderCount: number;
  activeCustomers: number;
  pendingOrders: number;
  pendingBookings: number;      // Phase 0: bookings count
  pendingDeliveries: number;    // Phase 0: deliveries count
  topProducts: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  salesTrend: Array<{
    month: string;
    sales: number;
    target: number;
  }>;
}
