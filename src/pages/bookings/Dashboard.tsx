import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ClipboardList, Plus, Search, Filter, Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../lib/auth';
import { UserRole } from '../../types/user';
import { bookingService, loadingSheetService } from '../../lib/supabaseServices';
import { Booking } from '../../types/sfa';
import { canEdit, canManageLoadingSheet } from '../../lib/permissions';
import BookingEntry from './components/BookingEntry';
import BookingList from './components/BookingList';
import LoadingSheetView from './components/LoadingSheetView';
import DeliveryUpdate from './components/DeliveryUpdate';
import DayEndLog from './components/DayEndLog';

const BookingDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    loadBookings();
  }, [user]);

  const loadBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let data: Booking[] = [];
      if (user.role === UserRole.SALES_REP) {
        data = await bookingService.getByRep(user.id);
      } else if (user.agencyId) {
        data = await bookingService.getByAgency(user.agencyId);
      }
      setBookings(data);
    } catch (err) {
      console.error('Bookings load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    pending:   bookings.filter(b => b.status === 'PENDING').length,
    loaded:    bookings.filter(b => b.status === 'LOADED_TO_LORRY' || b.status === 'OUT_FOR_DELIVERY').length,
    delivered: bookings.filter(b => b.status === 'DELIVERED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  };

  const filtered = bookings.filter(b => {
    const matchSearch = b.shopName.toLowerCase().includes(search.toLowerCase()) || b.bookingNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Bookings — SFA</h1>
              <p className="text-sm text-gray-500 mt-1">Mode 1: Bike rep pre-sell bookings සහ lorry delivery management</p>
            </div>
            <div className="flex gap-2">
              {canManageLoadingSheet(user) && (
                <Button variant="outline" onClick={() => window.location.href = '/bookings/loading-sheet'}>
                  <Truck size={16} className="mr-2" /> Loading Sheet
                </Button>
              )}
              {user?.role === UserRole.SALES_REP && (
                <Button onClick={() => window.location.href = '/bookings/new'}>
                  <Plus size={16} className="mr-2" /> New Booking
                </Button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Pending', value: stats.pending, icon: <Clock size={20} />, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: 'In Transit', value: stats.loaded, icon: <Truck size={20} />, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Delivered', value: stats.delivered, icon: <CheckCircle size={20} />, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Cancelled', value: stats.cancelled, icon: <XCircle size={20} />, color: 'text-red-600', bg: 'bg-red-50' },
            ].map((s, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{s.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                    </div>
                    <div className={`p-3 rounded-full ${s.bg} ${s.color}`}>{s.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Booking number / shop name search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">සියලු Status</option>
              <option value="PENDING">Pending</option>
              <option value="LOADED_TO_LORRY">Lorry ට Load කළා</option>
              <option value="OUT_FOR_DELIVERY">Delivery යනවා</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PARTIALLY_DELIVERED">Partial</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Booking List */}
          <BookingList bookings={filtered} loading={loading} onRefresh={loadBookings} />

          {/* Day-end log close button — Clerk / Owner only */}
          {canManageLoadingSheet(user) && (
            <div className="flex justify-end">
              <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={() => window.location.href = '/bookings/day-end'}>
                දවස් Log Close කරන්න
              </Button>
            </div>
          )}
        </div>
      } />
      <Route path="/new"           element={<BookingEntry onSaved={() => { window.location.href = '/bookings'; }} />} />
      <Route path="/loading-sheet" element={<LoadingSheetView />} />
      <Route path="/delivery/:sheetId" element={<DeliveryUpdate />} />
      <Route path="/day-end"       element={<DayEndLog />} />
    </Routes>
  );
};

export default BookingDashboard;
