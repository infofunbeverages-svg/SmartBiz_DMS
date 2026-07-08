import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, DollarSign, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useAuthStore } from '../../../lib/auth';
import { bookingService } from '../../../lib/supabaseServices';
import { useSFAStore } from '../../../stores/sfaStore';
import { Booking } from '../../../types/sfa';

const DayEndLog: React.FC = () => {
  const { user } = useAuthStore();
  const { generateUnloadingReport, getTodaysCollections, syncDataToServer } = useSFAStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [closing, setClosing]   = useState(false);
  const [closed, setClosed]     = useState(false);
  const [loading, setLoading]   = useState(true);

  const unloading     = generateUnloadingReport();
  const collections   = getTodaysCollections();
  const totalCash     = collections.filter(c => c.paymentMethod === 'CASH').reduce((s, c) => s + c.amount, 0);
  const totalCheque   = collections.filter(c => c.paymentMethod === 'CHEQUE').reduce((s, c) => s + c.amount, 0);
  const totalCredit   = collections.filter(c => c.paymentMethod === 'BANK_TRANSFER').reduce((s, c) => s + c.amount, 0);

  useEffect(() => {
    if (!user?.agencyId) return;
    bookingService.getByAgency(user.agencyId)
      .then(data => setBookings(data.filter(b => new Date(b.bookingDate).toDateString() === new Date().toDateString())))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const pending    = bookings.filter(b => b.status === 'PENDING' || b.status === 'LOADED_TO_LORRY' || b.status === 'OUT_FOR_DELIVERY').length;
  const delivered  = bookings.filter(b => b.status === 'DELIVERED').length;
  const partial    = bookings.filter(b => b.status === 'PARTIALLY_DELIVERED').length;
  const cancelled  = bookings.filter(b => b.status === 'CANCELLED').length;

  const handleClose = async () => {
    if (pending > 0) {
      const ok = window.confirm(`තවම pending bills ${pending}ක් තියෙනවා. ඒවා close නොකර log close කරන්නද?`);
      if (!ok) return;
    }
    setClosing(true);
    try {
      await syncDataToServer();
      setClosed(true);
    } catch (err) {
      alert('Error: ' + (err as Error).message);
    } finally {
      setClosing(false);
    }
  };

  if (closed) return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <CheckCircle size={64} className="text-green-500" />
      <h2 className="text-xl font-bold text-gray-900">Day Log Closed! ✅</h2>
      <p className="text-gray-500 text-center">දවසේ සියලුම data sync වුණා.</p>
      <Button onClick={() => window.location.href = '/bookings'}>Bookings Dashboard</Button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Day-End Log Close</h2>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('si-LK')} — Agency: {user?.agencyId}</p>
        </div>
        <button onClick={() => window.history.back()} className="text-sm text-gray-500">← ආපසු</button>
      </div>

      {pending > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertTriangle size={20} className="text-amber-600" />
          <div>
            <p className="text-sm font-medium text-amber-800">Pending bills {pending}ක් තවම ඉතිරියි!</p>
            <p className="text-xs text-amber-600">ඒවා delivery update කරලා close කිරීම recommended.</p>
          </div>
        </div>
      )}

      {/* Today's Delivery Summary */}
      <Card>
        <CardHeader><CardTitle>දවසේ Delivery Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Delivered',  value: delivered, color: 'text-green-600 bg-green-50' },
              { label: 'Partial',    value: partial,   color: 'text-orange-600 bg-orange-50' },
              { label: 'Cancelled',  value: cancelled, color: 'text-red-600 bg-red-50' },
              { label: 'Pending',    value: pending,   color: 'text-amber-600 bg-amber-50' },
            ].map((s, i) => (
              <div key={i} className={`p-3 rounded-lg ${s.color}`}>
                <p className="text-xs">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Collections Summary */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign size={18} />Collections Summary</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Cash',   value: totalCash,   color: 'text-green-700' },
              { label: 'Cheque', value: totalCheque, color: 'text-blue-700' },
              { label: 'Credit', value: totalCredit, color: 'text-purple-700' },
            ].map((c, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">{c.label}</span>
                <span className={`font-semibold ${c.color}`}>Rs. {c.value.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">Rs. {(totalCash + totalCheque + totalCredit).toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Van Stock Balance */}
      {unloading.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Package size={18} />Van Stock Balance</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-500">Product</th>
                  <th className="text-right py-2 text-gray-500">Loaded</th>
                  <th className="text-right py-2 text-gray-500">Sold</th>
                  <th className="text-right py-2 text-gray-500">Balance</th>
                </tr>
              </thead>
              <tbody>
                {unloading.map((u, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-2">{u.productName}</td>
                    <td className="py-2 text-right">{u.loadedQuantity}</td>
                    <td className="py-2 text-right text-green-600">{u.soldQuantity}</td>
                    <td className="py-2 text-right font-medium">{u.balanceQuantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Button className="w-full" size="lg" onClick={handleClose} disabled={closing}>
        {closing ? 'Closing...' : '✅ Day Log Close කරන්න'}
      </Button>
    </div>
  );
};

export default DayEndLog;
