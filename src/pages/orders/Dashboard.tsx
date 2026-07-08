import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Calendar, 
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  PauseCircle,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import OrderList from './components/OrderList';
import OrderStats from './components/OrderStats';
import CreateOrderModal from './components/CreateOrderModal';
import { useOrderStore } from '../../stores/orderStore';
import DateRangePicker from './components/DateRangePicker';

const OrdersDashboard: React.FC = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const { orders, orderStats, isLoading, error, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCreateOrder = () => {
    setIsCreateModalOpen(true);
  };

  const handleExport = () => {
    // Implement export functionality
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage orders, track status, and handle agency requests
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button 
            variant="primary" 
            icon={<ShoppingCart className="h-4 w-4" />}
            onClick={handleCreateOrder}
          >
            Create Order
          </Button>
          <Button 
            variant="secondary" 
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => fetchOrders()}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button 
            variant="secondary" 
            icon={<Download className="h-4 w-4" />}
            onClick={handleExport}
          >
            Export
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-md">
          <p>Error: {error}</p>
        </div>
      )}

      {isLoading && orders.length === 0 && (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <h3 className="text-xl font-bold text-gray-900">{orderStats.total}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <h3 className="text-xl font-bold text-gray-900">{orderStats.completed}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <PauseCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">On Hold</p>
                <h3 className="text-xl font-bold text-gray-900">{orderStats.onHold}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Cancelled</p>
                <h3 className="text-xl font-bold text-gray-900">{orderStats.cancelled}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<ShoppingCart className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <DateRangePicker 
          startDate={dateRange.start}
          endDate={dateRange.end}
          onChange={setDateRange}
        />
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="onHold">On Hold</option>
          </select>
          <Button variant="secondary" icon={<Filter />}>
            More Filters
          </Button>
        </div>
      </div>

      {/* Order List and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderList 
            searchQuery={searchQuery}
            dateRange={dateRange}
            statusFilter={selectedStatus}
          />
        </div>
        <div>
          <OrderStats />
        </div>
      </div>

      {/* Create Order Modal */}
      <CreateOrderModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default OrdersDashboard;