import React, { useState, useEffect } from 'react';
import { Printer, Truck, CheckCircle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuthStore } from '../../../lib/auth';
import { bookingService, loadingSheetService } from '../../../lib/supabaseServices';
import { Booking, LorryLoadingSheet } from '../../../types/sfa';

const LoadingSheetView: React.FC = () => {
  const { user } = useAuthStore();
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [selected, setSelected]   = useState<Set<string>>(new Set());
  const [sheet, setSheet]         = useState<LorryLoadingSheet | null>(null);
  const [collectorId, setCollector] = useState('');
  const [route, setRoute]         = useState('');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user?.agencyId) return;
    bookingService.getByAgency(user.agencyId)
      .then(data => setPendingBookings(data.filter(b => b.status === 'PENDING')))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const toggle = (id: string) => setSelected(prev => {
    const n = new Set(prev);
    n.has(id) ? n.delete(id) : n.add(id);
    return n;
  });

  const handleGenerate = async () => {
    if (!selected.size || !user?.agencyId) return;
    setGenerating(true);
    try {
      const s = await loadingSheetService.generate(
        user.agencyId,
        [...selected],
        { collectorId: collectorId || undefined, route: route || undefined, createdBy: user.id }
      );
      setSheet(s);
    } catch (err) {
      alert('Generate error: ' + (err as Error).message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  // ── Print view ──
  if (sheet) return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <h2 className="text-xl font-bold">Loading Sheet — {sheet.sheetNumber}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { setSheet(null); setSelected(new Set()); }}>← ආපසු</Button>
          <Button onClick={handlePrint}><Printer size={16} className="mr-2" />Print</Button>
          <Button onClick={async () => { await loadingSheetService.updateStatus(sheet.id, 'OUT_FOR_DELIVERY'); alert('Status: Out for Delivery ✅'); }}>
            <Truck size={16} className="mr-2" />Lorry Dispatch
          </Button>
        </div>
      </div>

      <style>{`@media print { .no-print { display:none; } body { font-size:12px; } }`}</style>

      <div className="bg-white border border-gray-300 rounded-lg p-6 print-sheet">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">LORRY LOADING SHEET</h1>
          <p className="text-gray-600">Sheet #: {sheet.sheetNumber} | Date: {sheet.loadingDate}</p>
          {sheet.route && <p className="text-gray-600">Route: {sheet.route}</p>}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Product-wise Summary</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="text-left p-2 border">Product</th>
                <th className="text-left p-2 border">Code</th>
                <th className="text-right p-2 border">Total Qty</th>
                <th className="text-right p-2 border">Unit Price</th>
                <th className="text-right p-2 border">Value</th>
              </tr>
            </thead>
            <tbody>
              {sheet.items.map((item, i) => (
                <tr key={i} className="border-b">
                  <td className="p-2 border">{item.productName}</td>
                  <td className="p-2 border">{item.productCode}</td>
                  <td className="p-2 border text-right font-medium">{item.totalQty}</td>
                  <td className="p-2 border text-right">Rs. {item.unitPrice.toLocaleString()}</td>
                  <td className="p-2 border text-right">Rs. {(item.totalQty * item.unitPrice).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 font-bold">
                <td colSpan={4} className="p-2 border text-right">Grand Total</td>
                <td className="p-2 border text-right">
                  Rs. {sheet.items.reduce((s, i) => s + i.totalQty * i.unitPrice, 0).toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-700 mb-3 border-b pb-2">Booking List ({sheet.bookingIds.length} bills)</h3>
          <div className="grid grid-cols-3 gap-2">
            {sheet.bookingIds.map((bid, i) => (
              <div key={i} className="border rounded p-2 text-xs">
                <p className="font-medium">Bill {i + 1}</p>
                <p className="text-gray-500">ID: {bid.slice(0, 8)}...</p>
                <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-1 text-[10px] text-gray-500">
                  <span>Delivered: ___</span><span>Paid: ___</span>
                  <span>Cash: ___</span><span>Cheque: ___</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mt-8 pt-4 border-t">
          {['Prepared By', 'Driver / Collector', 'Checked By'].map(label => (
            <div key={label} className="text-center">
              <div className="border-b border-gray-400 mb-2 h-8" />
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Selection view ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Lorry Loading Sheet Generate</h2>
          <p className="text-sm text-gray-500">Pending bookings select කරලා sheet generate කරන්න</p>
        </div>
        <button onClick={() => window.history.back()} className="text-sm text-gray-500">← ආපසු</button>
      </div>

      <Card>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={route} onChange={e => setRoute(e.target.value)} placeholder="Route name (eg: Kandy Route A)" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Collector ID (optional)</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={collectorId} onChange={e => setCollector(e.target.value)} placeholder="Collector user ID" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Pending Bookings ({pendingBookings.length})</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">{selected.size} selected</span>
              <Button onClick={handleGenerate} disabled={!selected.size || generating}>
                <Package size={16} className="mr-2" />
                {generating ? 'Generating...' : 'Sheet Generate කරන්න'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
            : !pendingBookings.length ? <p className="text-center text-gray-400 py-8">Pending bookings නැහැ</p>
            : (
              <div className="space-y-2">
                {pendingBookings.map(b => (
                  <div key={b.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selected.has(b.id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => toggle(b.id)}>
                    <input type="checkbox" checked={selected.has(b.id)} onChange={() => toggle(b.id)} className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">{b.bookingNumber}</span>
                        <span className="text-sm font-medium text-gray-900">Rs. {b.totalAmount.toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-gray-500">{b.shopName} • {b.items.length} items • {b.bookingDate}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingSheetView;
