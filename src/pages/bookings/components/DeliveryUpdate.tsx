import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, DollarSign, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuthStore } from '../../../lib/auth';
import { deliveryService, bookingService } from '../../../lib/supabaseServices';
import { useSFAStore } from '../../../stores/sfaStore';
import { Booking, DeliveryRecord } from '../../../types/sfa';

const DeliveryUpdate: React.FC = () => {
  const { sheetId } = useParams<{ sheetId: string }>();
  const { user } = useAuthStore();
  const { getCurrentLocation } = useSFAStore();

  const [bookings, setBookings]   = useState<Booking[]>([]);
  const [records, setRecords]     = useState<Record<string, Partial<DeliveryRecord>>>({});
  const [saving, setSaving]       = useState<string | null>(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!user?.agencyId || !sheetId) return;
    bookingService.getByAgency(user.agencyId)
      .then(data => {
        const out = data.filter(b => b.status === 'OUT_FOR_DELIVERY' || b.status === 'LOADED_TO_LORRY');
        setBookings(out);
        const init: Record<string, Partial<DeliveryRecord>> = {};
        out.forEach(b => { init[b.id] = { bookingId: b.id, sheetId: sheetId!, deliveryStatus: 'PENDING', paymentStatus: 'PENDING', cashAmount: 0, creditAmount: 0 }; });
        setRecords(init);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, sheetId]);

  const updateRecord = (bookingId: string, field: string, value: unknown) => {
    setRecords(prev => ({ ...prev, [bookingId]: { ...prev[bookingId], [field]: value } }));
  };

  const handleSave = async (bookingId: string) => {
    const rec = records[bookingId];
    if (!rec) return;
    setSaving(bookingId);
    try {
      const loc = await getCurrentLocation().catch(() => null);
      await deliveryService.upsert({
        ...rec,
        bookingId,
        sheetId:        sheetId!,
        collectorId:    user?.id,
        gpsLocation:    loc ?? undefined,
        deliveryStatus: rec.deliveryStatus ?? 'PENDING',
        paymentStatus:  rec.paymentStatus ?? 'PENDING',
        cashAmount:     rec.cashAmount ?? 0,
        creditAmount:   rec.creditAmount ?? 0,
        deliveredAt:    new Date().toISOString(),
      } as Omit<DeliveryRecord, 'id' | 'createdAt' | 'updatedAt'>);
      alert('✅ Saved!');
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Delivery Update</h2>
        <button onClick={() => window.history.back()} className="text-sm text-gray-500">← ආපසු</button>
      </div>
      <p className="text-sm text-gray-500">Bill එකෙකට delivery status, payment ටික mark කරන්න</p>

      {!bookings.length && <div className="text-center py-12 text-gray-400">Out for delivery bills නැහැ</div>}

      {bookings.map(b => {
        const rec = records[b.id] ?? {};
        return (
          <Card key={b.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{b.bookingNumber}</CardTitle>
                <span className="text-sm font-medium text-gray-700">Rs. {b.totalAmount.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} />{b.shopName}</p>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Delivery Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Delivery Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'DELIVERED', label: '✅ Delivered', color: 'border-green-500 bg-green-50 text-green-700' },
                    { val: 'PARTIALLY_DELIVERED', label: '⚠️ Partial', color: 'border-amber-500 bg-amber-50 text-amber-700' },
                    { val: 'NOT_DELIVERED', label: '❌ Not Delivered', color: 'border-red-500 bg-red-50 text-red-700' },
                    { val: 'CANCELLED', label: '🚫 Cancelled', color: 'border-gray-500 bg-gray-50 text-gray-700' },
                  ].map(opt => (
                    <button key={opt.val}
                      className={`px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all ${rec.deliveryStatus === opt.val ? opt.color : 'border-gray-200 text-gray-500'}`}
                      onClick={() => updateRecord(b.id, 'deliveryStatus', opt.val)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment — delivered නම් witharak */}
              {(rec.deliveryStatus === 'DELIVERED' || rec.deliveryStatus === 'PARTIALLY_DELIVERED') && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-2">Payment Method</label>
                    <div className="flex gap-2">
                      {['CASH', 'CHEQUE', 'CREDIT'].map(m => (
                        <button key={m}
                          className={`flex-1 py-2 rounded-lg border-2 text-xs font-medium ${rec.paymentMethod === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}
                          onClick={() => updateRecord(b.id, 'paymentMethod', m)}>
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cash Amount</label>
                      <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        value={rec.cashAmount ?? 0}
                        onChange={e => updateRecord(b.id, 'cashAmount', Number(e.target.value))} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Credit Amount</label>
                      <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        value={rec.creditAmount ?? 0}
                        onChange={e => updateRecord(b.id, 'creditAmount', Number(e.target.value))} />
                    </div>
                  </div>

                  {rec.paymentMethod === 'CHEQUE' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cheque Number</label>
                      <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        value={rec.chequeNumber ?? ''}
                        onChange={e => updateRecord(b.id, 'chequeNumber', e.target.value)}
                        placeholder="Cheque number" />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  value={rec.notes ?? ''}
                  onChange={e => updateRecord(b.id, 'notes', e.target.value)}
                  placeholder="Optional notes..." />
              </div>

              <Button className="w-full" onClick={() => handleSave(b.id)}
                disabled={saving === b.id || rec.deliveryStatus === 'PENDING'}>
                {saving === b.id ? 'Saving...' : 'Save Delivery Status'}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default DeliveryUpdate;
