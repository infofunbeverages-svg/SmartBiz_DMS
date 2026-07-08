import React, { useState } from 'react';
import { Power, PowerOff, MapPin, Clock, Package, Users, DollarSign, ShoppingCart, Wifi, WifiOff, FolderSync as Sync, AlertTriangle, CheckCircle, Plus, Download, Eye, Navigation, CreditCard, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useSFAStore } from '../../../stores/sfaStore';
import { useAuthStore } from '../../../lib/auth';

const SalesRepDesktopView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  
  const { user } = useAuthStore();
  const {
    currentDutySession,
    isOnline,
    getTodaysSales,
    getTodaysCollections,
    generateUnloadingReport,
    dailyLoading
  } = useSFAStore();

  const todaysSales = getTodaysSales();
  const todaysCollections = getTodaysCollections();
  const unloadingBalance = generateUnloadingReport();

  const getDutyDuration = () => {
    if (!currentDutySession?.dutyOnTime) return '0h 0m';
    
    const start = new Date(currentDutySession.dutyOnTime);
    const end = currentDutySession.dutyOffTime ? new Date(currentDutySession.dutyOffTime) : new Date();
    const diff = end.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const totalSalesAmount = todaysSales.reduce((sum, sale) => sum + sale.totalAmount, 0);
  const totalCollectionAmount = todaysCollections.reduce((sum, collection) => sum + collection.amount, 0);
  const uniqueCustomers = new Set(todaysSales.map(s => s.customerId)).size;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Representative Dashboard</h2>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <div className="flex items-center">
            {isOnline ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-5 w-5 mr-2" />
                <span className="text-sm">Online</span>
              </div>
            ) : (
              <div className="flex items-center text-red-600">
                <WifiOff className="h-5 w-5 mr-2" />
                <span className="text-sm">Offline</span>
              </div>
            )}
          </div>
          <Button variant="secondary" icon={<Download />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Duty Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Duty Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className={`w-4 h-4 rounded-full mr-3 ${
                currentDutySession?.status === 'ON_DUTY' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <div>
                <p className="text-sm font-medium">
                  {currentDutySession?.status === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}
                </p>
                <p className="text-xs text-gray-500">Duration: {getDutyDuration()}</p>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium">Current Location</p>
                <p className="text-xs text-gray-500">
                  {currentDutySession?.location.address || 'Location not available'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              {currentDutySession?.syncStatus === 'SYNCED' && (
                <div className="flex items-center text-green-600">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Data Synced</span>
                </div>
              )}
              {currentDutySession?.syncStatus === 'PENDING' && (
                <div className="flex items-center text-amber-600">
                  <Clock className="h-4 w-4 mr-2" />
                  <span className="text-sm">Sync Pending</span>
                </div>
              )}
              {currentDutySession?.syncStatus === 'FAILED' && (
                <div className="flex items-center text-red-600">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Sync Failed</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Sales</p>
                <h3 className="text-xl font-bold text-gray-900">
                  LKR {totalSalesAmount.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Collections</p>
                <h3 className="text-xl font-bold text-gray-900">
                  LKR {totalCollectionAmount.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Orders</p>
                <h3 className="text-xl font-bold text-gray-900">{todaysSales.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Customers Visited</p>
                <h3 className="text-xl font-bold text-gray-900">{uniqueCustomers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Balance Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2" />
            Stock Balance Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loaded
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sold
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Returns
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Next Day Stock
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unloadingBalance.map((item) => (
                  <tr key={item.inventoryId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.loadedQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.soldQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.returnQuantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        item.balanceQuantity > 0 ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {item.balanceQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.nextDayStock}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Sales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Recent Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todaysSales.slice(0, 5).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{sale.customerName}</p>
                    <p className="text-xs text-gray-500">{sale.invoiceNumber} • {new Date(sale.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    LKR {sale.totalAmount.toLocaleString()}
                  </p>
                  <p className={`text-xs ${
                    sale.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'
                  }`}>
                    {sale.paymentStatus}
                  </p>
                </div>
              </div>
            ))}
            {todaysSales.length === 0 && (
              <p className="text-center text-gray-500 py-8">No sales recorded today</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesRepDesktopView;