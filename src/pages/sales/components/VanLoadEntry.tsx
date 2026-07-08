import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useSFAStore } from '../../../stores/sfaStore';
import { productService } from '../../../lib/supabaseServices';
import { Product } from '../../../types/inventory';
import { DailyLoading } from '../../../types/sfa';

const VanLoadEntry: React.FC = () => {
  const { loadDailyStock } = useSFAStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems]       = useState<Partial<DailyLoading>[]>([]);
  const [saving, setSaving]     = useState(false);

  useEffect(() => { productService.getAll().then(setProducts).catch(console.error); }, []);

  const addItem = () => {
    if (!products.length) return;
    const p = products[0];
    setItems(prev => [...prev, { id: Date.now().toString(), inventoryId: p.id, productName: p.name, productCode: p.sku, loadedQuantity: 1, unitPrice: p.price, totalValue: p.price }]);
  };

  const updateItem = (id: string, field: string, value: unknown) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const u = { ...item, [field]: value };
      if (field === 'inventoryId') {
        const p = products.find(p => p.id === value);
        if (p) { u.productName = p.name; u.productCode = p.sku; u.unitPrice = p.price; }
      }
      u.totalValue = (u.loadedQuantity ?? 0) * (u.unitPrice ?? 0);
      return u;
    }));
  };

  const handleSave = () => {
    if (!items.length) { alert('Items add කරන්න!'); return; }
    setSaving(true);
    setTimeout(() => {
      loadDailyStock(items as DailyLoading[]);
      alert('Van stock load කළා! ✅');
      window.location.href = '/van';
    }, 500);
  };

  const total = items.reduce((s, i) => s + (i.totalValue ?? 0), 0);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Van Stock Load</h2>
        <button onClick={() => window.history.back()} className="text-sm text-gray-500">← ආපසු</button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products Load කරන්න</CardTitle>
            <Button size="sm" onClick={addItem}><Plus size={14} className="mr-1" />Add Item</Button>
          </div>
        </CardHeader>
        <CardContent>
          {!items.length && (
            <div className="text-center py-8 text-gray-400">
              <Package size={40} className="mx-auto mb-2" />
              <p>Products add කරන්න</p>
            </div>
          )}
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                <select className="col-span-2 px-2 py-1.5 border border-gray-300 rounded text-sm bg-white"
                  value={item.inventoryId}
                  onChange={e => updateItem(item.id!, 'inventoryId', e.target.value)}>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="flex gap-1">
                  <input type="number" min="1" className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
                    value={item.loadedQuantity}
                    onChange={e => updateItem(item.id!, 'loadedQuantity', Number(e.target.value))} />
                  <button onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                    className="text-red-400 hover:text-red-600 px-1"><Trash2 size={14} /></button>
                </div>
                <div className="col-span-3 flex justify-between text-xs text-gray-500">
                  <span>Unit: Rs. {item.unitPrice?.toLocaleString()}</span>
                  <span className="font-medium text-gray-700">Total: Rs. {item.totalValue?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          {items.length > 0 && (
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="font-semibold text-gray-700">Total Load Value</span>
              <span className="text-xl font-bold text-gray-900">Rs. {total.toLocaleString()}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={handleSave} disabled={saving || !items.length}>
        {saving ? 'Loading...' : '✅ Van Load Confirm කරන්න'}
      </Button>
    </div>
  );
};

export default VanLoadEntry;
