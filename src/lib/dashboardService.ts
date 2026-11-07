import { supabase } from './supabase';

export interface DashboardStats {
  todaySales: number;
  monthlySales: number;
  pendingOrders: number;
  topProducts: Array<{ id: string; name: string; sales: number }>;
}

export interface GlobalStats {
  totalAgencies: number;
  totalUsers: number;
  totalGlobalSales: number;
}

const ymd = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const sum = (rows: any[] | null, key: string) =>
  (rows || []).reduce((s, r) => s + Number(r[key] || 0), 0);

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const now = new Date();
    const today = ymd(now);
    const monthStart = ymd(new Date(now.getFullYear(), now.getMonth(), 1));

    // Sales come from real invoices (RLS limits rows to what this user may see)
    const { data: monthInv, error: invErr } = await supabase
      .from('invoices')
      .select('id, date, net_amount')
      .gte('date', monthStart)
      .lte('date', today);
    if (invErr) console.error('dashboard invoices:', invErr);

    const monthlySales = sum(monthInv, 'net_amount');
    const todaySales = sum((monthInv || []).filter(i => i.date === today), 'net_amount');

    // Pending = bookings still waiting to be processed
    const { count: pendingCount, error: pErr } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'PENDING');
    if (pErr) console.error('dashboard bookings:', pErr);

    // Top products this month from invoice_items
    let topProducts: DashboardStats['topProducts'] = [];
    const ids = (monthInv || []).map(i => i.id);
    if (ids.length) {
      const { data: items } = await supabase
        .from('invoice_items')
        .select('inventory_id, total_amount')
        .in('invoice_id', ids);
      const totals = new Map<string, number>();
      (items || []).forEach(it =>
        totals.set(it.inventory_id, (totals.get(it.inventory_id) || 0) + Number(it.total_amount || 0)));
      const top = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (top.length) {
        const { data: prods } = await supabase.from('products').select('id, name').in('id', top.map(t => t[0]));
        const names = new Map((prods || []).map(p => [p.id, p.name]));
        topProducts = top.map(([id, sales]) => ({ id, name: names.get(id) || 'Unknown product', sales }));
      }
    }

    return { todaySales, monthlySales, pendingOrders: pendingCount || 0, topProducts };
  },

  async getGlobalStats(): Promise<GlobalStats> {
    const [{ count: agencies }, { count: users }, { data: inv }] = await Promise.all([
      supabase.from('agencies').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('invoices').select('net_amount'),
    ]);
    return {
      totalAgencies: agencies || 0,
      totalUsers: users || 0,
      totalGlobalSales: sum(inv, 'net_amount'),
    };
  },
};
