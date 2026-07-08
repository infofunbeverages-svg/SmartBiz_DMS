import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useOrderStore } from '../../../stores/orderStore';
import { BarChart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const OrderStats: React.FC = () => {
  const { orderStats } = useOrderStore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Order Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BarChart className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Monthly Orders</p>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">{orderStats.monthlyOrders}</p>
                <p className="flex items-center text-sm text-green-600">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12.5%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Monthly Revenue</p>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  Rs. {orderStats.monthlyRevenue.toLocaleString()}
                </p>
                <p className="flex items-center text-sm text-red-600">
                  <TrendingDown className="h-4 w-4 mr-1" />
                  -2.3%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-4">Top Agencies</h4>
            <div className="space-y-3">
              {orderStats.topAgencies.map((agency, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-900">
                    {index + 1}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{agency.name}</p>
                    <p className="text-xs text-gray-500">{agency.orderCount} orders</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Rs. {agency.totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orderStats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'created' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'completed' ? 'bg-green-100 text-green-600' :
                  activity.type === 'cancelled' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {activity.type === 'created' && <ShoppingCart className="h-4 w-4" />}
                  {activity.type === 'completed' && <CheckCircle2 className="h-4 w-4" />}
                  {activity.type === 'cancelled' && <XCircle className="h-4 w-4" />}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderStats;