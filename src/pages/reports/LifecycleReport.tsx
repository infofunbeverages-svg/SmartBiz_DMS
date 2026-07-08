import React, { useState, useEffect } from 'react';
import { FileText, Download, Search, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface LifecycleRow {
  bookingNumber: string;
  bookingDate: string;
  shopName: string;
  salesRep: string;
  totalAmount: number;
  deliveryStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  cashAmount: number;
  creditAmount: number;
  deliveredAt: string;
}

const LifecycleReport: React.FC = () => {
  const { user } = useAuthStore();
  const [rows, setRows]         = useState<LifecycleRow[]>([]);
  const [loading, setLoading]   = useState(false);
  const [dateFrom, setFrom]     = useState(new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]);
  const [dateTo, setTo]         = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch]     = useState('');

  useEffect(() => { loadReport(); }, []);

  const loadReport = async () => {
    if (!user?.agencyId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          booking_number, booking_date, total_amount, status,
          shops(name),
          profiles(full_name),
          delivery_records(delivery_status, payment_status, payment_method, cash_amount, credit_amount, delivered_at)
        `)
        .eq('agency_id', user.agencyId)
        .gte('booking_date', dateFrom)
        .lte('booking_date', dateTo)
        .order('booking_date', { ascending: false });

      if (error) throw error;

      setRows((data ?? []).map((b: any) => {
        const dr = b.delivery_records?.[0];
        return {
          bookingNumber: b.booking_number,
          bookingDate:   b.booking_date,
          shopName:      b.shops?.name ?? '-',
          salesRep:      b.profiles?.full_name ?? '-',
          totalAmount:   b.total_amount,
          deliveryStatus: dr?.delivery_status ?? 'PENDING',
          paymentStatus:  dr?.payment_status ?? 'PENDING',
          paymentMethod:  dr?.payment_method ?? '-',
          cashAmount:     dr?.cash_amount ?? 0,
          creditAmount:   dr?.credit_amount ?? 0,
          deliveredAt:    dr?.delivered_at ?? '-',
        };
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = rows.filter(r =>
    r.bookingNumber.toLowerCase().includes(search.toLowerCase()) ||
    r.shopName.toLowerCase().includes(search.toLowerCase()) ||
    r.salesRep.toLowerCase().includes(search.toLowerCase())
  );

  const totals = {
    bookings:  filtered.length,
    delivered: filtered.filter(r => r.deliveryStatus === 'DELIVERED').length,
    cash:      filtered.reduce((s, r) => s + r.cashAmount, 0),
    credit:    filtered.reduce((s, r) => s + r.creditAmount, 0),
  };

  const statusColor: Record<string, string> = {
    DELIVERED:           'bg-green-100 text-green-700',
    PARTIALLY_DELIVERED: 'bg-amber-100 text-amber-700',
    NOT_DELIVERED:       'bg-red-100 text-red-700',
    CANCELLED:           'bg-gray-100 text-gray-600',
    PENDING:             'bg-blue-100 text-blue-700',
  };

  const exportCSV = () => {
    const header = 'Booking#,Date,Shop,Rep,Amount,Delivery,Payment,Method,Cash,Credit';
    const csvRows = filtered.map(r =>
      `${r.bookingNumber},${r.bookingDate},${r.shopName},${r.salesRep},${r.totalAmount},${r.deliveryStatus},${r.paymentStatus},${r.paymentMethod},${r.cashAmount},${r.creditAmount}`
    );
    const blob = new Blob([[header, ...csvRows].join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lifecycle_report_${dateFrom}_${dateTo}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText size={22} />Booking → Delivery → Payment Report
          </h2>
          <p className="text-sm text-gray-500 mt-1">Full lifecycle per bill</p>
        </div>
        <Button variant="outline" onClick={exportCSV}><Download size={14} className="mr-1" />CSV Export</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
          <Calendar size={14} className="text-gray-400" />
          <input type="date" value={dateFrom} onChange={e => setFrom(e.target.value)} className="text-sm outline-none" />
          <span className="text-gray-400">—</span>
          <input type="date" value={dateTo} onChange={e => setTo(e.target.value)} className="text-sm outline-none" />
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2 flex-1">
          <Search size={14} className="text-gray-400" />
          <input className="text-sm outline-none w-full" placeholder="Booking# / Shop / Rep search..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Button onClick={loadReport} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Bookings', value: totals.bookings,          color: 'bg-blue-50 text-blue-700' },
          { label: 'Delivered',      value: totals.delivered,         color: 'bg-green-50 text-green-700' },
          { label: 'Cash Collected', value: `Rs.${(totals.cash/1000).toFixed(1)}k`,   color: 'bg-purple-50 text-purple-700' },
          { label: 'Credit',         value: `Rs.${(totals.credit/1000).toFixed(1)}k`, color: 'bg-amber-50 text-amber-700' },
        ].map((s, i) => (
          <div key={i} className={`p-3 rounded-lg ${s.color}`}>
            <p className="text-xs">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Booking#', 'Date', 'Shop', 'Rep', 'Amount', 'Delivery', 'Payment', 'Method', 'Cash', 'Credit'].map(h => (
                    <th key={h} className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && (
                  <tr><td colSpan={10} className="py-8 text-center text-gray-400">Loading...</td></tr>
                )}
                {!loading && !filtered.length && (
                  <tr><td colSpan={10} className="py-8 text-center text-gray-400">Data නැහැ</td></tr>
                )}
                {filtered.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-blue-600">{r.bookingNumber}</td>
                    <td className="px-3 py-2 text-gray-500">{r.bookingDate}</td>
                    <td className="px-3 py-2">{r.shopName}</td>
                    <td className="px-3 py-2 text-gray-500">{r.salesRep}</td>
                    <td className="px-3 py-2 font-medium">Rs.{r.totalAmount.toLocaleString()}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[r.deliveryStatus] ?? ''}`}>{r.deliveryStatus}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{r.paymentStatus}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{r.paymentMethod}</td>
                    <td className="px-3 py-2 text-green-600">Rs.{r.cashAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-red-500">Rs.{r.creditAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LifecycleReport;
