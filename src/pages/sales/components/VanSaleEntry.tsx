import React, { useState } from 'react';
import { Plus, Trash2, Printer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuthStore } from '../../../lib/auth';
import { useSFAStore } from '../../../stores/sfaStore';
import { SalesTransactionItem } from '../../../types/sfa';

const VanSaleEntry: React.FC = () => {
  const { user }    = useAuthStore();
  const { dailyLoading, addSalesTransaction, getCurrentLocation } = useSFAStore();

  const [customerName, setCustomer] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPayment] = useState<'CASH' | 'CREDIT' | 'CARD' | 'MOBILE'>('CASH');
  const [items, setItems]           = useState<Partial<SalesTransactionItem>[]>([]);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [invoiceNum, setInvoiceNum] = useState('');

  const addItem = () => {
    if (!dailyLoading.length) return;
    const p = dailyLoading[0];
    setItems(prev => [...prev, { id: Date.now().toString(), inventoryId: p.inventoryId, productName: p.productName, quantity: 1, unitPrice: p.unitPrice, discount: 0, totalAmount: p.unitPrice }]);
  };

  const updateItem = (id: string, field: string, value: unknown) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const u = { ...item, [field]: value };
      if (field === 'inventoryId') {
        const p = dailyLoading.find(l => l.inventoryId === value);
        if (p) { u.productName = p.productName; u.unitPrice = p.unitPrice; }
      }
      u.totalAmount = (u.quantity ?? 0) * (u.unitPrice ?? 0) - (u.discount ?? 0);
      return u;
    }));
  };

  const total    = items.reduce((s, i) => s + (i.totalAmount ?? 0), 0);
  const invoiceNo = `VAN-${Date.now()}`;

  const handleSave = async () => {
    if (!customerName) { alert('Customer name ලියන්න!'); return; }
    if (!items.length)  { alert('Items add කරන්න!'); return; }
    setSaving(true);
    try {
      const loc = await getCurrentLocation().catch(() => ({ latitude: 0, longitude: 0, address: 'Unknown' }));
      addSalesTransaction({
        customerId:    customerId || Date.now().toString(),
        customerName,
        customerType:  'RETAILER',
        invoiceNumber: invoiceNo,
        items:         items as SalesTransactionItem[],
        subtotal:      total,
        discount:      0,
        tax:           0,
        totalAmount:   total,
        paymentMethod,
        paymentStatus: paymentMethod === 'CREDIT' ? 'PENDING' : 'PAID',
        location:      loc,
        timestamp:     new Date().toISOString(),
      });
      setInvoiceNum(invoiceNo);
      setSaved(true);
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (saved) return (
    <div className="max-w-md mx-auto space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg p-6" id="invoice-print">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">VAN SALE INVOICE</h2>
          <p className="text-sm text-gray-500">#{invoiceNum}</p>
          <p className="text-xs text-gray-400">{new Date().toLocaleString('si-LK')}</p>
        </div>
        <div className="mb-4 pb-4 border-b">
          <p className="text-sm"><strong>Customer:</strong> {customerName}</p>
          <p className="text-sm"><strong>Payment:</strong> {paymentMethod}</p>
        </div>
        <table className="w-full text-sm mb-4">
          <thead><tr className="border-b"><th className="text-left py-1">Item</th><th className="text-right py-1">Qty</th><th className="text-right py-1">Amount</th></tr></thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-gray-50">
                <td className="py-1">{item.productName}</td>
                <td className="py-1 text-right">{item.quantity}</td>
                <td className="py-1 text-right">Rs. {item.totalAmount?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={2} className="pt-2 font-bold">Total</td><td className="pt-2 text-right font-bold">Rs. {total.toLocaleString()}</td></tr>
          </tfoot>
        </table>
        <p className="text-center text-xs text-gray-400">ස්තූතියි!</p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => window.print()}><Printer size={14} className="mr-1" />Print</Button>
        <Button className="flex-1" onClick={() => { setCustomer(''); setCustomerId(''); setItems([]); setSaved(false); }}>New Sale</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Van Sale</h2>
        <button onClick={() => window.history.back()} className="text-sm text-gray-500">← ආපසු</button>
      </div>

      <Card>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Customer Name *</label>
            <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              value={customerName} onChange={e => setCustomer(e.target.value)} placeholder="Shop / Customer name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Payment Method</label>
            <div className="flex gap-2">
              {(['CASH', 'CREDIT', 'CARD'] as const).map(m => (
                <button key={m}
                  className={`flex-1 py-2 rounded border-2 text-xs font-medium ${paymentMethod === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
                  onClick={() => setPayment(m)}>{m}</button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Items</CardTitle>
            <Button size="sm" onClick={addItem} disabled={!dailyLoading.length}>
              <Plus size={14} className="mr-1" />Add
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!items.length && <p className="text-center text-gray-400 py-6">Items add කරන්න</p>}
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex gap-2 items-center p-2 bg-gray-50 rounded">
                <select className="flex-1 px-2 py-1.5 border border-gray-300 rounded text-sm bg-white"
                  value={item.inventoryId}
                  onChange={e => updateItem(item.id!, 'inventoryId', e.target.value)}>
                  {dailyLoading.map(p => <option key={p.inventoryId} value={p.inventoryId}>{p.productName} (Bal: {p.loadedQuantity})</option>)}
                </select>
                <input type="number" min="1" className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center"
                  value={item.quantity}
                  onChange={e => updateItem(item.id!, 'quantity', Number(e.target.value))} />
                <span className="text-sm text-gray-600 w-20 text-right">Rs.{item.totalAmount?.toLocaleString()}</span>
                <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))} className="text-red-400"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          {items.length > 0 && (
            <div className="mt-4 pt-4 border-t flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="text-xl font-bold">Rs. {total.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSave} disabled={saving}>
        {saving ? 'Saving...' : '✅ Sale Complete + Invoice Print'}
      </Button>
    </div>
  );
};

export default VanSaleEntry;
