import React, { useState, useEffect } from 'react';
import { Plus, Trash2, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { useAuthStore } from '../../../lib/auth';
import { useSFAStore } from '../../../stores/sfaStore';
import { bookingService, productService } from '../../../lib/supabaseServices';
import { Product } from '../../../types/inventory';
import { BookingItem } from '../../../types/sfa';

interface Props { onSaved: () => void; }

const BookingEntry: React.FC<Props> = ({ onSaved }) => {
  const { user } = useAuthStore();
  const { getCurrentLocation } = useSFAStore();

  const [products, setProducts]     = useState<Product[]>([]);
  const [shopId, setShopId]         = useState('');
  const [shopName, setShopName]     = useState('');
  const [expectedDate, setExpected] = useState('');
  const [items, setItems]           = useState<BookingItem[]>([]);
  const [gpsLocked, setGpsLocked]   = useState(false);
  const [gpsData, setGpsData]       = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [gpsError, setGpsError]     = useState('');
  const [saving, setSaving]         = useState(false);
  const [notes, setNotes]           = useState('');

  useEffect(() => {
    productService.getAll().then(setProducts).catch(console.error);
    lockGPS();
  }, []);

  // GPS mandatory — duty eke GPS ona
  const lockGPS = async () => {
    try {
      const loc = await getCurrentLocation();
      setGpsData(loc);
      setGpsLocked(true);
      setGpsError('');
    } catch {
      setGpsError('GPS enable කරන්න! Booking ගන්න GPS අනිවාර්යයි.');
    }
  };

  const addItem = () => {
    if (!products.length) return;
    const p = products[0];
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      inventoryId: p.id, productName: p.name, productCode: p.sku,
      quantity: 1, unitPrice: p.price, discount: 0,
      totalAmount: p.price, isFree: false,
    }]);
  };

  const addFreeItem = () => {
    if (!products.length) return;
    const p = products[0];
    setItems(prev => [...prev, {
      id: Date.now().toString(),
      inventoryId: p.id, productName: p.name, productCode: p.sku,
      quantity: 1, unitPrice: 0, discount: 0,
      totalAmount: 0, isFree: true, freeReason: 'FREE_ISSUE',
    }]);
  };

  const updateItem = (id: string, field: keyof BookingItem, value: unknown) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'inventoryId') {
        const p = products.find(p => p.id === value);
        if (p) { updated.productName = p.name; updated.productCode = p.sku; if (!updated.isFree) updated.unitPrice = p.price; }
      }
      if (!updated.isFree) {
        updated.totalAmount = (updated.quantity * updated.unitPrice) - updated.discount;
      }
      return updated;
    }));
  };

  const removeItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const subtotal = items.filter(i => !i.isFree).reduce((s, i) => s + i.totalAmount, 0);

  const handleSave = async () => {
    if (!gpsLocked) { setGpsError('GPS enable කරන්නේ නැතුව booking save කරන්න බෑ!'); return; }
    if (!shopId || !shopName) { alert('Shop select කරන්න!'); return; }
    if (!items.length) { alert('අවම වශයෙන් item 1ක් add කරන්න!'); return; }
    if (!user?.agencyId) { alert('Agency scope නැහැ — admin ට කියන්න!'); return; }

    setSaving(true);
    try {
      await bookingService.create({
        agencyId:    user.agencyId,
        salesRepId:  user.id,
        shopId,
        shopName,
        bookingDate: new Date().toISOString().split('T')[0],
        expectedDelivery: expectedDate || undefined,
        gpsLocation: gpsData ?? undefined,
        items,
        subtotal,
        discount: 0,
        totalAmount: subtotal,
        notes: notes || undefined,
        status: 'PENDING',
      });
      alert('Booking save කළා! ✅');
      onSaved();
    } catch (err) {
      alert('Save error: ' + (err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">අලුත් Booking</h2>
        <button onClick={() => window.history.back()} className="text-sm text-gray-500 hover:text-gray-700">← ආපසු</button>
      </div>

      {/* GPS Status */}
      <div className={`flex items-center gap-3 p-3 rounded-lg ${gpsLocked ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
        {gpsLocked
          ? <><CheckCircle size={18} className="text-green-600" /><span className="text-sm text-green-700">GPS Locked — {gpsData?.address}</span></>
          : <><AlertCircle size={18} className="text-red-600" /><span className="text-sm text-red-700">{gpsError || 'GPS lock කරනවා...'}</span>
              <Button size="sm" variant="outline" onClick={lockGPS}>Retry GPS</Button></>
        }
      </div>

      {/* Shop Info */}
      <Card>
        <CardHeader><CardTitle>Shop Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
            <Input value={shopName} onChange={e => setShopName(e.target.value)} placeholder="Shop name ලියන්න" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop ID *</label>
            <Input value={shopId} onChange={e => setShopId(e.target.value)} placeholder="Shop ID" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Delivery Date</label>
            <Input type="date" value={expectedDate} onChange={e => setExpected(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Products / Free Issues / Samples</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={addFreeItem}>+ Free Issue</Button>
              <Button size="sm" onClick={addItem}><Plus size={14} className="mr-1" />Product</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!items.length && (
            <p className="text-center text-gray-400 py-6">Products add කරන්නේ නැහැ — ඉහළ button use කරන්න</p>
          )}
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className={`p-3 rounded-lg border ${item.isFree ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                {item.isFree && <span className="text-xs font-medium text-green-700 mb-2 block">FREE ISSUE / SAMPLE</span>}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <select
                    className="col-span-2 px-2 py-1.5 border border-gray-300 rounded text-sm"
                    value={item.inventoryId}
                    onChange={e => updateItem(item.id, 'inventoryId', e.target.value)}
                  >
                    {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                  </select>
                  <Input type="number" placeholder="Qty" min="1"
                    value={item.quantity}
                    onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                  {!item.isFree && (
                    <Input type="number" placeholder="Unit Price"
                      value={item.unitPrice}
                      onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} />
                  )}
                  {item.isFree && (
                    <select className="px-2 py-1.5 border border-gray-300 rounded text-sm"
                      value={item.freeReason || 'FREE_ISSUE'}
                      onChange={e => updateItem(item.id, 'freeReason', e.target.value)}>
                      <option value="FREE_ISSUE">Free Issue</option>
                      <option value="SAMPLE">Sample</option>
                      <option value="PROMOTION">Promotion</option>
                    </select>
                  )}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-700">
                    {item.isFree ? 'Free' : `Rs. ${item.totalAmount.toLocaleString()}`}
                  </span>
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {items.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">Rs. {subtotal.toLocaleString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" rows={3}
            value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={() => window.history.back()}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !gpsLocked}>
          {saving ? 'Saving...' : 'Booking Save කරන්න'}
        </Button>
      </div>
    </div>
  );
};

export default BookingEntry;
