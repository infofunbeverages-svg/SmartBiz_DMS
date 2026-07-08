import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAccountStore } from '../../../stores/accountStore';
import { 
  Store, 
  AlertTriangle, 
  Calendar, 
  Phone,
  MapPin,
  DollarSign,
  Clock,
  TrendingUp
} from 'lucide-react';
import Button from '../../../components/ui/Button';

const SalesRepAccountView: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  const { getShopOutstandings } = useAccountStore();
  const shopOutstandings = getShopOutstandings();

  const filteredOutstandings = shopOutstandings.filter(shop => {
    switch (selectedFilter) {
      case 'overdue':
        return shop.overdueAmount > 0;
      case 'high-outstanding':
        return shop.totalOutstanding > 50000;
      case 'credit-exceeded':
        return shop.totalOutstanding > shop.creditLimit;
      default:
        return true;
    }
  });

  const totalOutstanding = shopOutstandings.reduce((sum, shop) => sum + shop.totalOutstanding, 0);
  const totalOverdue = shopOutstandings.reduce((sum, shop) => sum + shop.overdueAmount, 0);
  const shopsWithOverdue = shopOutstandings.filter(shop => shop.overdueAmount > 0).length;

  const getOutstandingStatus = (shop: any) => {
    if (shop.totalOutstanding > shop.creditLimit) {
      return { label: 'Credit Exceeded', color: 'bg-red-100 text-red-800' };
    }
    if (shop.overdueAmount > 0) {
      return { label: 'Overdue', color: 'bg-amber-100 text-amber-800' };
    }
    if (shop.totalOutstanding > 0) {
      return { label: 'Outstanding', color: 'bg-blue-100 text-blue-800' };
    }
    return { label: 'Current', color: 'bg-green-100 text-green-800' };
  };

  const getDaysOverdue = (lastPaymentDate: string, paymentTerms: number) => {
    if (!lastPaymentDate) return 0;
    const daysSincePayment = Math.floor((Date.now() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysSincePayment - paymentTerms);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Store className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Shops</p>
                <h3 className="text-xl font-bold text-gray-900">{shopOutstandings.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
                <h3 className="text-xl font-bold text-red-600">
                  Rs. {totalOutstanding.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
                <h3 className="text-xl font-bold text-amber-600">
                  Rs. {totalOverdue.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Overdue Shops</p>
                <h3 className="text-xl font-bold text-purple-600">{shopsWithOverdue}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="all">All Shops</option>
            <option value="overdue">Overdue Only</option>
            <option value="high-outstanding">High Outstanding ({'>'} 50k)</option>
            <option value="credit-exceeded">Credit Limit Exceeded</option>
          </select>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredOutstandings.length} of {shopOutstandings.length} shops
        </div>
      </div>

      {/* Shop Outstanding Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2" />
            Shop Outstanding Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOutstandings.map((shop) => {
              const status = getOutstandingStatus(shop);
              const daysOverdue = getDaysOverdue(shop.lastPaymentDate || '', shop.paymentTerms);
              
              return (
                <div key={shop.customerId} className="p-6 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded bg-gray-100 flex items-center justify-center">
                        <Store className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900">{shop.shopName}</h4>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {shop.shopAddress}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Total Outstanding</p>
                      <p className="text-xl font-bold text-red-600">
                        Rs. {shop.totalOutstanding.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Overdue Amount</p>
                      <p className="text-xl font-bold text-amber-600">
                        Rs. {shop.overdueAmount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Credit Limit</p>
                      <p className="text-xl font-bold text-gray-900">
                        Rs. {shop.creditLimit.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Credit Utilization</p>
                      <p className="text-xl font-bold text-blue-600">
                        {((shop.totalOutstanding / shop.creditLimit) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Last Payment</p>
                        <p className="text-sm font-medium text-gray-900">
                          {shop.lastPaymentDate ? new Date(shop.lastPaymentDate).toLocaleDateString() : 'No payments'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Payment Terms</p>
                        <p className="text-sm font-medium text-gray-900">{shop.paymentTerms} days</p>
                      </div>
                    </div>
                    {daysOverdue > 0 && (
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 text-red-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Days Overdue</p>
                          <p className="text-sm font-medium text-red-600">{daysOverdue} days</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button variant="primary" size="sm" icon={<Phone className="h-4 w-4" />}>
                        Call Shop
                      </Button>
                      <Button variant="secondary" size="sm" icon={<MapPin className="h-4 w-4" />}>
                        Visit Shop
                      </Button>
                    </div>
                    <Button variant="secondary" size="sm">
                      View Statement
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Collection Priority */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Collection Priority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shopOutstandings
              .filter(shop => shop.overdueAmount > 0)
              .sort((a, b) => b.overdueAmount - a.overdueAmount)
              .slice(0, 5)
              .map((shop, index) => (
                <div key={shop.customerId} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-sm font-medium text-red-600">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{shop.shopName}</p>
                      <p className="text-xs text-gray-500">
                        {getDaysOverdue(shop.lastPaymentDate || '', shop.paymentTerms)} days overdue
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">
                      Rs. {shop.overdueAmount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">overdue amount</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesRepAccountView;