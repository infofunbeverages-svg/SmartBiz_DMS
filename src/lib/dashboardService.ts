import { supabase } from './supabase';

export interface DashboardStats {
  todaySales: number;
  monthlySales: number;
  pendingOrders: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
  }>;
}

export interface GlobalStats {
  totalAgencies: number;
  totalUsers: number;
  totalGlobalSales: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Fetch today's sales from orders using created_at
      const { data: todayOrders, error: todayError } = await supabase
        .from('draft_invoices')
        .select('total_amount')
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', now.toISOString());

      if (todayError) {
        console.error('Error fetching today\'s sales:', todayError);
      }

      // Fetch monthly sales from orders using created_at
      const { data: monthlyOrders, error: monthlyError } = await supabase
        .from('draft_invoices')
        .select('total_amount')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', now.toISOString());

      if (monthlyError) {
        console.error('Error fetching monthly sales:', monthlyError);
      }

      // Fetch pending orders
      const { data: pendingOrdersData, error: pendingError } = await supabase
        .from('draft_invoices')
        .select('id', { count: 'exact' })
        .eq('status', 'PENDING');

      if (pendingError) {
        console.error('Error fetching pending orders:', pendingError);
      }

      // Calculate today's sales
      const todaySales = (todayOrders || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // Calculate monthly sales
      const monthlySales = (monthlyOrders || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

      // Get pending orders count
      const pendingOrders = pendingOrdersData?.length || 0;

      // Fetch top products from order_items (check if table exists first)
      let orderItems: any[] = [];
      try {
        const { data, error: orderItemsError } = await supabase
          .from('draft_invoice_items')
          .select('inventory_id, total_amount, orders!inner(created_at)')
          .gte('orders.created_at', monthStart.toISOString())
          .lte('orders.created_at', now.toISOString());

        if (orderItemsError) {
          // Check if error is due to table not existing (404 or similar)
          if (orderItemsError.code === 'PGRST116' || orderItemsError.message?.includes('does not exist')) {
            console.warn('order_items table does not exist, skipping top products');
          } else {
            console.error('Error fetching order items for top products:', orderItemsError);
          }
        } else {
          orderItems = data || [];
        }
      } catch (err: any) {
        // Handle case where order_items table might not exist
        if (err.code === 'PGRST116' || err.message?.includes('does not exist')) {
          console.warn('order_items table does not exist, skipping top products');
        } else {
          console.error('Error checking order_items table:', err);
        }
      }

      // Aggregate product sales
      const productSalesMap = new Map<string, number>();
      orderItems.forEach((item: any) => {
        const inventoryId = item.inventory_id;
        const amount = item.total_amount || 0;
        productSalesMap.set(inventoryId, (productSalesMap.get(inventoryId) || 0) + amount);
      });

      // Get product details for top products
      const inventoryIds = Array.from(productSalesMap.keys()).slice(0, 10);
      let products: any[] = [];
      
      if (inventoryIds.length > 0) {
        const { data: productsData, error: productsError } = await supabase
          .from('inventory')
          .select('id, name')
          .in('id', inventoryIds);

        if (productsError) {
          console.error('Error fetching products for top products:', productsError);
        } else {
          products = productsData || [];
        }
      }

      // Map products with sales
      const topProducts = products
        .map(product => ({
          id: product.id,
          name: product.name,
          sales: productSalesMap.get(product.id) || 0,
        }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      return {
        todaySales,
        monthlySales,
        pendingOrders,
        topProducts,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default values on error
      return {
        todaySales: 0,
        monthlySales: 0,
        pendingOrders: 0,
        topProducts: [],
      };
    }
  },

  async getGlobalStats(): Promise<GlobalStats> {
    try {
      // Get total agencies count
      const { count: agenciesCount, error: agenciesError } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      if (agenciesError) {
        console.error('Error fetching agencies count:', agenciesError);
      }

      // Get total users count from profiles
      const { count: usersCount, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error('Error fetching users count:', usersError);
      }

      // Get total global sales (all time) from orders using created_at
      const { data: allOrders, error: salesError } = await supabase
        .from('draft_invoices')
        .select('total_amount');

      if (salesError) {
        console.error('Error fetching global sales:', salesError);
      }

      const totalGlobalSales = (allOrders || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);

      return {
        totalAgencies: agenciesCount || 0,
        totalUsers: usersCount || 0,
        totalGlobalSales,
      };
    } catch (error) {
      console.error('Error fetching global stats:', error);
      return {
        totalAgencies: 0,
        totalUsers: 0,
        totalGlobalSales: 0,
      };
    }
  },
};
