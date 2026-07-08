import { create } from 'zustand';
import { Order, OrderStatus } from '../types';
import { orderService } from '../lib/supabaseServices';

interface OrderStats {
  total: number;
  completed: number;
  cancelled: number;
  onHold: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  topAgencies: Array<{
    name: string;
    orderCount: number;
    totalAmount: number;
  }>;
  recentActivity: Array<{
    type: 'created' | 'completed' | 'cancelled';
    message: string;
    time: string;
  }>;
}

interface OrderState {
  orders: Order[];
  orderStats: OrderStats;
  isLoading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  createOrder: (order: {
    companyId: string;
    draftDate: string;
    totalAmount: number;
    items: Array<{
      inventoryId: string;
      quantity: number;
      price: number;
      discount?: number;
      isFree?: number;
      totalAmount: number;
    }>;
    notes?: string;
    createdBy: string;
  }) => Promise<void>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  orderStats: {
    total: 0,
    completed: 0,
    cancelled: 0,
    onHold: 0,
    monthlyOrders: 0,
    monthlyRevenue: 0,
    topAgencies: [],
    recentActivity: []
  },
  isLoading: false,
  error: null,
  
  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const fetchedOrders = await orderService.getAll();
      
      // Calculate stats
      const stats: OrderStats = {
        total: fetchedOrders.length,
        completed: fetchedOrders.filter(o => o.status === OrderStatus.COMPLETED).length,
        cancelled: fetchedOrders.filter(o => o.status === OrderStatus.CANCELLED).length,
        onHold: fetchedOrders.filter(o => o.status === OrderStatus.ON_HOLD).length,
        monthlyOrders: fetchedOrders.filter(o => {
          const draftDate = new Date(o.draftDate);
          const now = new Date();
          return draftDate.getMonth() === now.getMonth() && draftDate.getFullYear() === now.getFullYear();
        }).length,
        monthlyRevenue: fetchedOrders
          .filter(o => {
            const draftDate = new Date(o.draftDate);
            const now = new Date();
            return draftDate.getMonth() === now.getMonth() && draftDate.getFullYear() === now.getFullYear();
          })
          .reduce((sum, o) => sum + o.totalAmount, 0),
        topAgencies: [],
        recentActivity: []
      };
      
      set({ orders: fetchedOrders, orderStats: stats, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      set({ error: error.message || 'Failed to fetch orders', isLoading: false });
    }
  },
  
  createOrder: async (order) => {
    set({ isLoading: true, error: null });
    try {
      const newOrder = await orderService.create(order);
      set((state) => ({
        orders: [...state.orders, newOrder],
        isLoading: false
      }));
      // Refresh stats
      get().fetchOrders();
    } catch (error: any) {
      console.error('Error creating order:', error);
      set({ error: error.message || 'Failed to create order', isLoading: false });
      throw error;
    }
  },
  
  updateOrderStatus: async (orderId, status) => {
    set({ isLoading: true, error: null });
    try {
      await orderService.updateStatus(orderId, status);
      set((state) => ({
        orders: state.orders.map(order =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order
        ),
        isLoading: false
      }));
      // Refresh stats
      get().fetchOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      set({ error: error.message || 'Failed to update order status', isLoading: false });
      throw error;
    }
  },
  
  deleteOrder: (orderId) => {
    set((state) => ({
      orders: state.orders.filter(order => order.id !== orderId)
    }));
  }
}));