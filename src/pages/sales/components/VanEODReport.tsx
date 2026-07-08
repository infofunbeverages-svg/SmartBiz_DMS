import React from 'react';
import { BarChart2, DollarSign, Package, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useSFAStore } from '../../../stores/sfaStore';

const VanEODReport: React.FC = () => {
  const { generateUnloadingReport, getTodaysSales, getTodaysCollections, syncDataToServer } = useSFAStore();

  const unloading   = generateUnloadingReport();
  const sales       = getTodaysSales();
  const collections = getTodaysCollections();

  const totalSales  = sales.reduce((s, t) => s + t.totalAmount, 0);
  const cash        = sales.filter(s => s.paymentMethod === 'CASH').reduce((s, t) => s + t.totalAmount, 0);
  const credit      = sales.filter(s => s.paymentMethod === 'CREDIT').reduce((s, t) => s + t.totalAmount, 0);
  const card        = sales.filter(s => s.paymentMethod === 'CARD').reduce((s, t) => s + t.totalAmount, 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Van EOD Report</h2>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('si-LK')}</p>
        </div>
        <div className="flex gap-2 no-print">
          <Button variant="outline" onClick={() => window.print()}><Printer size={14} className="mr-1" />Print</Button>
          <Button onClick={async () => { await syncDataToServer(); alert('Synced! ✅'); }}>Sync & Close</Button>
        </div>
      </div>

      <style>{`@media print { .no-print { display:none; } }`}</style>

      {/* Sales summary */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign size={18} />Sales Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: 'Total Sales', value: totalSales, color: 'bg-blue-50 text-blue-700' },
              { label: 'Cash', value: cash, color: 'bg-green-50 text-green-700' },
              { label: 'Credit', value: credit, color: 'bg-red-50 text-red-700' },
              { label: 'Card', value: card, color: 'bg-purple-50 text-purple-700' },
            ].map((s, i) => (
              <div key={i} className={`p-3 rounded-lg ${s.color}`}>
                <p className="text-xs">{s.label}</p>
                <p className="font-bold">Rs. {s.value.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">Invoices: {sales.length}</p>
        </CardContent>
      </Card>

      {/* Stock reconciliation */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Package size={18} />Stock Reconciliation</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="text-left py-2">Product</th>
                <th className="text-right py-2">Loaded</th>
                <th className="text-right py-2">Sold</th>
                <th className="text-right py-2">Returns</th>
                <th className="text-right py-2 text-gray-900 font-bold">Balance</th>
              </tr>
            </thead>
            <tbody>
              {unloading.map((u, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="py-2 font-medium">{u.productName}</td>
                  <td className="py-2 text-right">{u.loadedQuantity}</td>
                  <td className="py-2 text-right text-green-600">{u.soldQuantity}</td>
                  <td className="py-2 text-right text-amber-600">{u.returnQuantity}</td>
                  <td className={`py-2 text-right font-bold ${u.balanceQuantity < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {u.balanceQuantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Physical count sign-off */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs font-medium text-gray-600 mb-3">Physical Count Verification</p>
            <div className="grid grid-cols-2 gap-4">
              {['Driver/Rep Signature', 'Verified By'].map(label => (
                <div key={label} className="text-center">
                  <div className="border-b border-gray-400 mb-2 h-8" />
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VanEODReport;
