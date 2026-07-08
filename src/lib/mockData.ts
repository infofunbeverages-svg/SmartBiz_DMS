import { 
  Agency, 
  DashboardStats, 
  Order,
  Product, 
  Sale, 
  Shop, 
  User, 
  UserRole 
} from '../types';
import { OrderStatus } from '../types/order';
import { PaymentMethod, PaymentStatus } from '../types/sale';

// Mock Users with expanded roles
export const users: User[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Admin User',
    email: 'admin@example.com',
    role: UserRole.SUPER_ADMIN,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    username: 'salesadmin',
    name: 'Sales Admin',
    email: 'salesadmin@example.com',
    role: UserRole.SALES_ADMIN,
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
  {
    id: '3',
    username: 'salesmanager',
    name: 'Sales Manager',
    email: 'salesmanager@example.com',
    role: UserRole.SALES_MANAGER,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
  },
  {
    id: '4',
    username: 'areasalesmanager1',
    name: 'Area Sales Manager - Western',
    email: 'areasales1@example.com',
    role: UserRole.AREA_SALES_MANAGER,
    territoryId: 'territory-1',
    managedAgencies: ['1', '2'],
    createdAt: '2023-01-04T00:00:00Z',
    updatedAt: '2023-01-04T00:00:00Z',
  },
  {
    id: '5',
    username: 'areasalesmanager2',
    name: 'Area Sales Manager - Central',
    email: 'areasales2@example.com',
    role: UserRole.AREA_SALES_MANAGER,
    territoryId: 'territory-2',
    managedAgencies: ['3', '4'],
    createdAt: '2023-01-05T00:00:00Z',
    updatedAt: '2023-01-05T00:00:00Z',
  },
  {
    id: '6',
    username: 'agency1',
    name: 'Agency Owner 1',
    email: 'agency1@example.com',
    role: UserRole.AGENCY_OWNER,
    companyId: '1',
    createdAt: '2023-01-06T00:00:00Z',
    updatedAt: '2023-01-06T00:00:00Z',
  },
  {
    id: '7',
    username: 'agency2',
    name: 'Agency Owner 2',
    email: 'agency2@example.com',
    role: UserRole.AGENCY_OWNER,
    companyId: '2',
    createdAt: '2023-01-07T00:00:00Z',
    updatedAt: '2023-01-07T00:00:00Z',
  },
  {
    id: '8',
    username: 'salesrep1',
    name: 'Sales Rep 1',
    email: 'salesrep1@example.com',
    role: UserRole.SALES_REP,
    companyId: '1',
    createdAt: '2023-01-08T00:00:00Z',
    updatedAt: '2023-01-08T00:00:00Z',
  },
  {
    id: '9',
    username: 'salesrep2',
    name: 'Sales Rep 2',
    email: 'salesrep2@example.com',
    role: UserRole.SALES_REP,
    companyId: '1',
    createdAt: '2023-01-09T00:00:00Z',
    updatedAt: '2023-01-09T00:00:00Z',
  },
  {
    id: '10',
    username: 'salesrep3',
    name: 'Sales Rep 3',
    email: 'salesrep3@example.com',
    role: UserRole.SALES_REP,
    companyId: '2',
    createdAt: '2023-01-10T00:00:00Z',
    updatedAt: '2023-01-10T00:00:00Z',
  },
  {
    id: '11',
    username: 'accountant',
    name: 'Accountant',
    email: 'accountant@example.com',
    role: UserRole.ACCOUNTANT,
    createdAt: '2023-01-11T00:00:00Z',
    updatedAt: '2023-01-11T00:00:00Z',
  }
];

// Mock Agencies with expanded data
export const agencies: Agency[] = [
  {
    id: '1',
    name: 'Western Province Agency',
    address: 'Colombo, Sri Lanka',
    phone: '+94 123 456 789',
    email: 'western@agency.com',
    ownerId: '6',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Gampaha District Agency',
    address: 'Gampaha, Sri Lanka',
    phone: '+94 987 654 321',
    email: 'gampaha@agency.com',
    ownerId: '7',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Central Province Agency',
    address: 'Kandy, Sri Lanka',
    phone: '+94 555 123 456',
    email: 'central@agency.com',
    ownerId: '12',
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
  },
  {
    id: '4',
    name: 'Matale District Agency',
    address: 'Matale, Sri Lanka',
    phone: '+94 777 888 999',
    email: 'matale@agency.com',
    ownerId: '13',
    createdAt: '2023-01-04T00:00:00Z',
    updatedAt: '2023-01-04T00:00:00Z',
  }
];

// Mock Products
export const products: Product[] = [
  {
    id: '1',
    name: 'Premium Rice 5kg',
    code: 'PR001',
    description: 'High quality basmati rice',
    category: 'Food & Beverages',
    price: 1200,
    unit: 'kg',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Coconut Oil 1L',
    code: 'CO002',
    description: 'Pure coconut oil',
    category: 'Food & Beverages',
    price: 850,
    unit: 'L',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '3',
    name: 'Tea Packets 100g',
    code: 'TP003',
    description: 'Ceylon black tea',
    category: 'Food & Beverages',
    price: 450,
    unit: 'pack',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '4',
    name: 'Washing Powder 1kg',
    code: 'WP004',
    description: 'Multi-purpose washing powder',
    category: 'Household',
    price: 650,
    unit: 'kg',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '5',
    name: 'Soap Bar 100g',
    code: 'SB005',
    description: 'Antibacterial soap',
    category: 'Personal Care',
    price: 120,
    unit: 'piece',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  }
];

// Mock Orders with agency relationships
export const orders: Order[] = [
  {
    id: '1',
    companyId: '1',
    draftDate: '2023-03-01T00:00:00Z',
    status: OrderStatus.DELIVERED,
    totalAmount: 15000,
    items: [
      {
        id: '1',
        orderId: '1',
        inventoryId: '1',
        quantity: 10,
        price: 1200,
        discount: 0,
        isFree: 1,
        totalAmount: 12000,
      },
      {
        id: '2',
        orderId: '1',
        inventoryId: '2',
        quantity: 4,
        price: 850,
        discount: 100,
        isFree: 0,
        totalAmount: 3000,
      }
    ],
    createdBy: '8',
    createdAt: '2023-03-01T00:00:00Z',
    updatedAt: '2023-03-02T00:00:00Z',
  },
  {
    id: '2',
    companyId: '2',
    draftDate: '2023-03-05T00:00:00Z',
    status: OrderStatus.PENDING,
    totalAmount: 8500,
    items: [
      {
        id: '3',
        orderId: '2',
        inventoryId: '3',
        quantity: 15,
        price: 450,
        discount: 0,
        isFree: 2,
        totalAmount: 6750,
      },
      {
        id: '4',
        orderId: '2',
        inventoryId: '4',
        quantity: 3,
        price: 650,
        discount: 50,
        isFree: 0,
        totalAmount: 1750,
      }
    ],
    createdBy: '10',
    createdAt: '2023-03-05T00:00:00Z',
    updatedAt: '2023-03-05T00:00:00Z',
  }
];

// Mock Shops with agency relationships
export const shops: Shop[] = [
  {
    id: '1',
    name: 'City Mart Colombo',
    address: 'Colombo 5, Sri Lanka',
    phone: '+94 111 222 333',
    owner: 'Sunil Perera',
    location: {
      latitude: 6.9271,
      longitude: 79.8612,
    },
    routeId: '1',
    companyId: '1',
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Super Store Gampaha',
    address: 'Gampaha, Sri Lanka',
    phone: '+94 444 555 666',
    owner: 'Kamala Silva',
    location: {
      latitude: 7.0873,
      longitude: 79.9990,
    },
    routeId: '2',
    companyId: '2',
    createdAt: '2023-01-02T00:00:00Z',
    updatedAt: '2023-01-02T00:00:00Z',
  },
  {
    id: '3',
    name: 'Central Grocery',
    address: 'Kandy, Sri Lanka',
    phone: '+94 777 888 999',
    owner: 'Nimal Fernando',
    location: {
      latitude: 7.2906,
      longitude: 80.6337,
    },
    routeId: '3',
    companyId: '3',
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
  }
];

// Mock Sales with detailed agency and rep relationships
export const sales: Sale[] = [
  {
    id: '1',
    invoiceNumber: 'INV-001',
    customerId: '1',
    salesRepId: '8',
    companyId: '1',
    invoiceDate: '2023-03-10T00:00:00Z',
    totalAmount: 5400,
    discount: 200,
    tax: 540,
    netAmount: 5740,
    paymentMethod: PaymentMethod.CASH,
    paymentStatus: PaymentStatus.PAID,
    items: [
      {
        id: '1',
        saleId: '1',
        inventoryId: '1',
        quantity: 3,
        price: 1200,
        discount: 100,
        isFree: 0,
        totalAmount: 3500,
      },
      {
        id: '2',
        saleId: '1',
        inventoryId: '2',
        quantity: 2,
        price: 850,
        discount: 100,
        isFree: 0,
        totalAmount: 1600,
      }
    ],
    location: {
      latitude: 6.9271,
      longitude: 79.8612,
    },
    createdAt: '2023-03-10T00:00:00Z',
    updatedAt: '2023-03-10T00:00:00Z',
  },
  {
    id: '2',
    invoiceNumber: 'INV-002',
    customerId: '2',
    salesRepId: '10',
    companyId: '2',
    invoiceDate: '2023-03-11T00:00:00Z',
    totalAmount: 3200,
    discount: 150,
    tax: 320,
    netAmount: 3370,
    paymentMethod: PaymentMethod.CREDIT,
    paymentStatus: PaymentStatus.PENDING,
    items: [
      {
        id: '3',
        saleId: '2',
        inventoryId: '3',
        quantity: 5,
        price: 450,
        discount: 50,
        isFree: 1,
        totalAmount: 2200,
      },
      {
        id: '4',
        saleId: '2',
        inventoryId: '4',
        quantity: 2,
        price: 650,
        discount: 100,
        isFree: 0,
        totalAmount: 1200,
      }
    ],
    location: {
      latitude: 7.0873,
      longitude: 79.9990,
    },
    createdAt: '2023-03-11T00:00:00Z',
    updatedAt: '2023-03-11T00:00:00Z',
  }
];

// Mock Dashboard Stats
export const dashboardStats: DashboardStats = {
  salesSummary: {
    today: 8600,
    thisWeek: 45000,
    thisMonth: 185000,
    lastMonth: 165000,
  },
  ordersSummary: {
    pending: 8,
    approved: 12,
    delivered: 45,
  },
  topProducts: [
    {
      id: '1',
      name: 'Premium Rice 5kg',
      sales: 85000,
    },
    {
      id: '2',
      name: 'Coconut Oil 1L',
      sales: 62000,
    },
    {
      id: '3',
      name: 'Tea Packets 100g',
      sales: 38000,
    }
  ],
  topSalesReps: [
    {
      id: '8',
      name: 'Sales Rep 1',
      sales: 125000,
    },
    {
      id: '9',
      name: 'Sales Rep 2',
      sales: 98000,
    },
    {
      id: '10',
      name: 'Sales Rep 3',
      sales: 87000,
    }
  ],
};