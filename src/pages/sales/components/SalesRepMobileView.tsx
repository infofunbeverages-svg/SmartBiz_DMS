import React, { useState, useEffect } from 'react';
import { Power, PowerOff, MapPin, Clock, Package, Users, DollarSign, ShoppingCart, Wifi, WifiOff, FolderSync as Sync, AlertTriangle, CheckCircle, Plus, List, BarChart3, Navigation, CreditCard, FileText, Camera, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useSFAStore } from '../../../stores/sfaStore';
import { useAuthStore } from '../../../lib/auth';

const SalesRepMobileView: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<string>('Getting location...');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'sales' | 'customers' | 'reports'>('dashboard');
  
  const { user } = useAuthStore();
  const {
    currentDutySession,
    isOnline,
    startDuty,
    endDuty,
    getCurrentLocation,
    getTodaysSales,
    getTodaysCollections,
    syncDataToServer,
    generateUnloadingReport,
    dailyLoading
  } = useSFAStore();

  const todaysSales = getTodaysSales();
  const todaysCollections = getTodaysCollections();
  const unloadingBalance = generateUnloadingReport();

  useEffect(() => {
    updateLocation();
  }, []);

  const updateLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      setCurrentLocation(location.address);
    } catch (error) {
      setCurrentLocation('Location unavailable');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleDutyOn = async () => {
    try {
      const location = await getCurrentLocation();
      await startDuty(location);
    } catch (error) {
      alert('Failed to start duty. Please check location permissions.');
    }
  };

  const handleDutyOff = async () => {
    try {
      const location = await getCurrentLocation();
      await endDuty(location);
    } catch (error) {
      alert('Failed to end duty. Please try again.');
    }
  };

  const handleSync = async () => {
    await syncDataToServer();
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">SFA Mobile</h1>
            <p className="text-sm opacity-90">{user?.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-300" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-300" />
            )}
            <button onClick={handleSync} className="p-2 rounded-full hover:bg-blue-700">
              <Sync className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Duty Status Card */}
      <div className="p-4">
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  currentDutySession?.status === 'ON_DUTY' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="font-medium">
                  {currentDutySession?.status === 'ON_DUTY' ? 'On Duty' : 'Off Duty'}
                </span>
              </div>
              <span className="text-sm text-gray-500">{getDutyDuration()}</span>
            </div>

            <div className="flex items-center mb-3">
              <MapPin className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600 flex-1">{currentLocation}</span>
              <button 
                onClick={updateLocation}
                disabled={isLoadingLocation}
                className="text-blue-600 text-sm"
              >
                {isLoadingLocation ? 'Updating...' : 'Update'}
              </button>
            </div>

            <div className="flex space-x-2">
              {currentDutySession?.status !== 'ON_DUTY' ? (
                <Button 
                  variant="primary" 
                  fullWidth 
                  icon={<Power className="h-4 w-4" />}
                  onClick={handleDutyOn}
                >
                  Start Duty
                </Button>
              ) : (
                <Button 
                  variant="danger" 
                  fullWidth 
                  icon={<PowerOff className="h-4 w-4" />}
                  onClick={handleDutyOff}
                >
                  End Duty
                </Button>
              )}
            </div>

            {currentDutySession?.syncStatus && (
              <div className="mt-3 flex items-center justify-center">
                {currentDutySession.syncStatus === 'SYNCED' && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Data Synced
                  </div>
                )}
                {currentDutySession.syncStatus === 'PENDING' && (
                  <div className="flex items-center text-amber-600 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    Sync Pending
                  </div>
                )}
                {currentDutySession.syncStatus === 'FAILED' && (
                  <div className="flex items-center text-red-600 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Sync Failed
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">Sales</p>
                  <p className="text-sm font-bold">LKR {totalSalesAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">Collections</p>
                  <p className="text-sm font-bold">LKR {totalCollectionAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">Orders</p>
                  <p className="text-sm font-bold">{todaysSales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-500">Visits</p>
                  <p className="text-sm font-bold">{new Set(todaysSales.map(s => s.customerId)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" size="sm" icon={<Plus />}>
                New Sale
              </Button>
              <Button variant="secondary" size="sm" icon={<CreditCard />}>
                Collect Payment
              </Button>
              <Button variant="secondary" size="sm" icon={<Package />}>
                Check Stock
              </Button>
              <Button variant="secondary" size="sm" icon={<Navigation />}>
                Route Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Unloading Balance Report */}
        {unloadingBalance.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm">Stock Balance</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                {unloadingBalance.slice(0, 5).map((item) => (
                  <div key={item.inventoryId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-gray-500">
                        Loaded: {item.loadedQuantity} | Sold: {item.soldQuantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blue-600">{item.balanceQuantity}</p>
                      <p className="text-xs text-gray-500">Balance</p>
                    </div>
                  </div>
                ))}
                {unloadingBalance.length > 5 && (
                  <Button variant="ghost" size="sm" fullWidth>
                    View All ({unloadingBalance.length} items)
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {todaysSales.slice(0, 3).map((sale) => (
                <div key={sale.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{sale.customerName}</p>
                    <p className="text-xs text-gray-500">{sale.invoiceNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">LKR {sale.totalAmount.toLocaleString()}</p>
                    <p className={`text-xs ${
                      sale.paymentStatus === 'PAID' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {sale.paymentStatus}
                    </p>
                  </div>
                </div>
              ))}
              {todaysSales.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">No sales today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center p-2 rounded ${
              activeTab === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`flex flex-col items-center p-2 rounded ${
              activeTab === 'sales' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="text-xs mt-1">Sales</span>
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`flex flex-col items-center p-2 rounded ${
              activeTab === 'customers' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Customers</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center p-2 rounded ${
              activeTab === 'reports' ? 'bg-blue-100 text-blue-600' : 'text-gray-600'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs mt-1">Reports</span>
          </button>
        </div>
      </div>

      {/* Add bottom padding to account for fixed navigation */}
      <div className="h-20"></div>
    </div>
  );
};

export default SalesRepMobileView;