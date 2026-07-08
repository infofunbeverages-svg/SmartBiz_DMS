import React from 'react';
import { Booking, BookingStatus } from '../../../types/sfa';
import { Truck, Eye, MapPin, Package } from 'lucide-react';
import Button from '../../../components/ui/Button';

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string }> = {
  PENDING:              { label: 'Pending',         color: 'bg-amber-100 text-amber-700' },
  LOADED_TO_LORRY:      { label: 'Lorry ට Load',   color: 'bg-blue-100 text-blue-700' },
  OUT_FOR_DELIVERY:     { label: 'Delivery යනවා',  color: 'bg-indigo-100 text-indigo-700' },
  DELIVERED:            { label: 'Delivered',        color: 'bg-green-100 text-green-700' },
  PARTIALLY_DELIVERED:  { label: 'Partial',          color: 'bg-orange-100 text-orange-700' },
  CANCELLED:            { label: 'Cancelled',        color: 'bg-red-100 text-red-700' },
};

interface Props {
  bookings: Booking[];
  loading: boolean;
  onRefresh: () => void;
}

const BookingList: React.FC<Props> = ({ bookings, loading, onRefresh }) => {
  if (loading) return (
    <div className="flex items-center justify-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  );

  if (!bookings.length) return (
    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
      <Package size={48} className="mx-auto text-gray-300 mb-3" />
      <p className="text-gray-500">Bookings නැහැ</p>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {['Booking #', 'Shop', 'Date', 'Items', 'Total', 'Status', ''].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {bookings.map(b => {
            const cfg = STATUS_CONFIG[b.status];
            return (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-blue-600">{b.bookingNumber}</td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="flex items-center gap-1">
                    <MapPin size={12} className="text-gray-400" />
                    {b.shopName}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{b.bookingDate}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{b.items.length} items</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Rs. {b.totalAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="sm">
                    <Eye size={14} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BookingList;
