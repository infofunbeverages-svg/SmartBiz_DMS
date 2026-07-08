import React, { useState, useEffect } from 'react';
import { AlertTriangle, Download, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface AgingRow {
  shopId: string;
  shopName: string;
  route: string;
  current: number;    // 0-30 days
  days31_60: number;
  days61_90: number;
  over90: number;
  total: number;
}

const AgingReport: React.FC = () => {
  const { user }  = useAuthStore();
  const [rows, setRows]       = useState<AgingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [routeFilter, setRoute] = useState('ALL');
  const [routes, setRoutes]   = useState<string[]>([]);

  useEffect(() => { loadAging(); }, []);

  const loadAging = async () => {
    if (!user?.agencyId) return;
    setLoading(true);
    try {
      // Credit pending delivery records eka ganna
      const { data, error } = await supabase
        .from('delivery_records')
        .select(`
          credit_amount, delivered_at,
          bookings(shop_id, shops(name, route))
        `)
        .eq('payment_method', 'CREDIT')
        .neq('credit_amount', 0);

      if (error) throw error;

      const now = Date.now();
      const shopMap = new Map<string, AgingRow>();

      (data ?? []).forEach((dr: any) => {
        const shop     = dr.bookings?.shops;
        const shopId   = dr.bookings?.shop_id;
        if (!shopId || !shop) return;

        const deliveredAt = dr.delivered_at ? new Date(dr.delivered_at).getTime() : now;
        const ageDays     = Math.floor((now - deliveredAt) / 86400000);
        const amount      = dr.credit_amount ?? 0;

        if (!shopMap.has(shopId)) {
          shopMap.set(shopId, { shopId, shopName: shop.name, route: shop.route ?? '-', current: 0, days31_60: 0, days61_90: 0, over90: 0, total: 0 });
        }
        const row = shopMap.get(shopId)!;
        if (ageDays <= 30)       row.current   += amount;
        else if (ageDays <= 60)  row.days31_60 += amount;
        else if (ageDays <= 90)  row.days61_90 += amount;
        else                     row.over90    += amount;
        row.total += amount;
      });

      const result = [...shopMap.values()].sort((a, b) => b.over90 - a.over90);
      setRows(result);
      setRoutes([...new Set(result.map(r => r.route).filter(r => r !== '-'))]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = rows.filter(r => routeFilter === 'ALL' || r.route === routeFilter);

  const totals = filtered.reduce((acc, r) => ({
    current:   acc.current   + r.current,
    days31_60: acc.days31_60 + r.days31_60,
    days61_90: acc.days61_90 + r.days61_90,
    over90:    acc.over90    + r.over90,
    total:     acc.total     + r.total,
  }), { current: 0, days31_60: 0, days61_90: 0, over90: 0, total: 0 });

  const exportCSV = () => {
    const header = 'Shop,Route,0-30 Days,31-60 Days,61-90 Days,90+ Days,Total';
    const csvRows = filtered.map(r => `${r.shopName},${r.route},${r.current},${r.days31_60},${r.days61_90},${r.over90},${r.total}`);
    const blob = new Blob([[header, ...csvRows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `aging_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={22} className="text-amber-500" />Credit Aging Report
          </h2>
          <p className="text-sm text-gray-500">Shop-wise outstanding credit — age bucket analysis</p>
        </div>
        <Button variant="outline" onClick={exportCSV}><Download size={14} className="mr-1" />CSV</Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: '0–30 Days',  value: totals.current,   color: 'bg-green-50 text-green-700' },
          { label: '31–60 Days', value: totals.days31_60, color: 'bg-amber-50 text-amber-700' },
          { label: '61–90 Days', value: totals.days61_90, color: 'bg-orange-50 text-orange-700' },
          { label: '90+ Days',   value: totals.over90,    color: 'bg-red-50 text-red-700' },
        ].map((s, i) => (
          <div key={i} className={`p-3 rounded-lg ${s.color}`}>
            <p className="text-xs">{s.label}</p>
            <p className="text-lg font-bold">Rs.{(s.value / 1000).toFixed(1)}k</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          value={routeFilter} onChange={e => setRoute(e.target.value)}>
          <option value="ALL">සියලු Routes</option>
          {routes.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <Button variant="outline" size="sm" onClick={loadAging}>Refresh</Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Shop', 'Route', '0-30', '31-60', '61-90', '90+', 'Total'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && <tr><td colSpan={7} className="py-8 text-center text-gray-400">Loading...</td></tr>}
                {!loading && !filtered.length && <tr><td colSpan={7} className="py-8 text-center text-gray-400">Outstanding credit නැහැ</td></tr>}
                {filtered.map((r, i) => (
                  <tr key={i} className={`hover:bg-gray-50 ${r.over90 > 0 ? 'bg-red-50/30' : ''}`}>
                    <td className="px-3 py-2 font-medium">{r.shopName}</td>
                    <td className="px-3 py-2 text-gray-500">{r.route}</td>
                    <td className="px-3 py-2 text-green-600">Rs.{r.current.toLocaleString()}</td>
                    <td className="px-3 py-2 text-amber-600">Rs.{r.days31_60.toLocaleString()}</td>
                    <td className="px-3 py-2 text-orange-600">Rs.{r.days61_90.toLocaleString()}</td>
                    <td className={`px-3 py-2 font-medium ${r.over90 > 0 ? 'text-red-600' : 'text-gray-400'}`}>Rs.{r.over90.toLocaleString()}</td>
                    <td className="px-3 py-2 font-bold">Rs.{r.total.toLocaleString()}</td>
                  </tr>
                ))}
                {/* Totals row */}
                {filtered.length > 0 && (
                  <tr className="bg-gray-100 font-bold border-t-2">
                    <td className="px-3 py-2" colSpan={2}>Total</td>
                    <td className="px-3 py-2 text-green-700">Rs.{totals.current.toLocaleString()}</td>
                    <td className="px-3 py-2 text-amber-700">Rs.{totals.days31_60.toLocaleString()}</td>
                    <td className="px-3 py-2 text-orange-700">Rs.{totals.days61_90.toLocaleString()}</td>
                    <td className="px-3 py-2 text-red-700">Rs.{totals.over90.toLocaleString()}</td>
                    <td className="px-3 py-2">Rs.{totals.total.toLocaleString()}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgingReport;
