import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users,
  ShoppingCart,
  MapPin,
  Calendar,
  Download,
  Plus,
  Search,
  Filter,
  Building,
  BarChart3,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useSalesStore } from '../../stores/salesStore';
import { useAuthStore } from '../../lib/auth';
import { UserRole } from '../../types/user';
import SalesRecords from './components/SalesRecords';
import SalesTargets from './components/SalesTargets';
import SalesPerformance from './components/SalesPerformance';
import SalesTerritories from './components/SalesTerritories';
import CompanySalesView from './components/CompanySalesView';
import SalesManagerView from './components/SalesManagerView';
import AreaSalesManagerView from './components/AreaSalesManagerView';
import SalesRepMobileView from './components/SalesRepMobileView';
import SalesRepDesktopView from './components/SalesRepDesktopView';

const SalesDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(false);
  const location = useLocation();
  const { user } = useAuthStore();
  const { 
    salesStats, 
    loading, 
    error, 
    fetchSalesData,
    getFilteredSalesRecords,
    getSalesPerformance 
  } = useSalesStore();

  useEffect(() => {
    fetchSalesData();
    
    // Detect mobile device
    const checkMobile = () => {
      const isMobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobileView(isMobile);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [fetchSalesData]);

  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { path: '/sales', label: 'Overview', icon: TrendingUp }
    ];

    // All roles can see sales records
    baseItems.push({ path: '/sales/records', label: 'Sales Records', icon: ShoppingCart });

    // Role-specific navigation
    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.SALES_MANAGER, UserRole.AREA_SALES_MANAGER].includes(user?.role!)) {
      baseItems.push(
        { path: '/sales/targets', label: 'Targets', icon: Target },
        { path: '/sales/performance', label: 'Performance', icon: Users }
      );
    }

    if ([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.SALES_MANAGER].includes(user?.role!)) {
      baseItems.push({ path: '/sales/territories', label: 'Territories', icon: MapPin });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    if (path === '/sales') {
      return location.pathname === '/sales';
    }
    return location.pathname.startsWith(path);
  };

  const getRoleBasedTitle = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return 'Company Sales Overview';
      case UserRole.SALES_ADMIN:
        return 'Sales Administration';
      case UserRole.SALES_MANAGER:
        return 'Sales Management';
      case UserRole.AREA_SALES_MANAGER:
        return 'Area Sales Management';
      case UserRole.AGENCY_OWNER:
        return 'Agency Sales';
      case UserRole.SALES_REP:
        return isMobileView ? 'SFA Mobile' : 'My Sales Performance';
      case UserRole.ACCOUNTANT:
        return 'Sales Financial Overview';
      default:
        return 'Sales Dashboard';
    }
  };

  const getRoleBasedDescription = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return 'Complete overview of all company sales across all agencies';
      case UserRole.SALES_ADMIN:
        return 'Administrative control over sales operations and data';
      case UserRole.SALES_MANAGER:
        return 'Comprehensive sales management across all agencies and territories';
      case UserRole.AREA_SALES_MANAGER:
        return 'Manage sales performance for your assigned agencies and territory';
      case UserRole.AGENCY_OWNER:
        return 'Track and manage your agency sales performance';
      case UserRole.SALES_REP:
        return isMobileView ? 'Mobile Sales Force Automation' : 'Your personal sales performance and targets';
      case UserRole.ACCOUNTANT:
        return 'Financial overview of sales transactions and revenue';
      default:
        return 'Sales performance tracking and management';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchSalesData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  // Special handling for Sales Rep mobile view
  if (user?.role === UserRole.SALES_REP && isMobileView) {
    return <SalesRepMobileView />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{getRoleBasedTitle()}</h1>
          <p className="mt-1 text-sm text-gray-500">{getRoleBasedDescription()}</p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          {user?.role === UserRole.SALES_REP && !isMobileView && (
            <Button 
              variant="secondary" 
              icon={<Smartphone />}
              onClick={() => setIsMobileView(true)}
            >
              Mobile View
            </Button>
          )}
          {[UserRole.SALES_ADMIN, UserRole.SALES_MANAGER, UserRole.AREA_SALES_MANAGER, UserRole.AGENCY_OWNER, UserRole.SALES_REP].includes(user?.role!) && (
            <Button variant="primary" icon={<Plus />}>
              New Sale
            </Button>
          )}
          <Button variant="secondary" icon={<Download />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  isActive(item.path)
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Routes>
        {/* Role-based Overview Routes */}
        <Route path="/" element={
          <>
            {/* Company View (Super Admin, Admin) */}
            {[UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(user?.role!) && <CompanySalesView />}
            
            {/* Sales Admin View - Similar to Sales Manager but with admin controls */}
            {user?.role === UserRole.SALES_ADMIN && <SalesManagerView />}
            
            {/* Sales Manager View */}
            {user?.role === UserRole.SALES_MANAGER && <SalesManagerView />}
            
            {/* Area Sales Manager View */}
            {user?.role === UserRole.AREA_SALES_MANAGER && <AreaSalesManagerView />}
            
            {/* Agency Owner View */}
            {user?.role === UserRole.AGENCY_OWNER && (
              <div className="space-y-6">
                {/* Agency-specific overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Agency Sales</p>
                          <h3 className="text-xl font-bold text-gray-900">
                            LKR {salesStats?.totalSales.toLocaleString() || '0'}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Monthly Growth</p>
                          <h3 className="text-xl font-bold text-gray-900">
                            {salesStats?.monthlyGrowth.toFixed(1) || '0'}%
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Target Achievement</p>
                          <h3 className="text-xl font-bold text-gray-900">
                            {salesStats?.targetAchievement.toFixed(1) || '0'}%
                          </h3>
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
                          <p className="text-sm font-medium text-gray-500">Sales Team</p>
                          <h3 className="text-xl font-bold text-gray-900">
                            {getSalesPerformance().length || '0'}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Agency Sales Performance */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Sales Team Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {getSalesPerformance().slice(0, 5).map((performer, index) => (
                        <div key={performer.salesRepId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                              {index + 1}
                            </div>
                            <div className="ml-4">
                              <p className="text-sm font-medium text-gray-900">{performer.salesRepName}</p>
                              <p className="text-xs text-gray-500">{performer.ordersCount} orders</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              LKR {performer.totalSales.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-600">
                              {performer.achievementRate.toFixed(1)}% of target
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* Sales Rep View */}
            {user?.role === UserRole.SALES_REP && <SalesRepDesktopView />}
            
            {/* Accountant View */}
            {user?.role === UserRole.ACCOUNTANT && (
              <div className="space-y-6">
                {/* Financial overview cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                          <h3 className="text-xl font-bold text-gray-900">
                            LKR {salesStats?.totalSales.toLocaleString() || '0'}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Revenue Growth</p>
                          <h3 className="text-xl font-bold text-gray-900">
                            {salesStats?.monthlyGrowth.toFixed(1) || '0'}%
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
                          <p className="text-sm font-medium text-gray-500">Total Transactions</p>
                          <h3 className="text-xl font-bold text-gray-900">
                            {salesStats?.totalOrders || '0'}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <BarChart3 className="h-6 w-6 text-amber-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-500">Avg Transaction</p>
                          <h3 className="text-xl font-bold text-gray-900">
                            LKR {salesStats?.averageOrderValue.toLocaleString() || '0'}
                          </h3>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Financial breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">Cash Sales</p>
                          <p className="text-2xl font-bold text-blue-600">
                            LKR {((salesStats?.totalSales || 0) * 0.6).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">60% of total sales</p>
                        </div>
                        <div className="p-4 bg-amber-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">Credit Sales</p>
                          <p className="text-2xl font-bold text-amber-600">
                            LKR {((salesStats?.totalSales || 0) * 0.4).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">40% of total sales</p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-900">Outstanding</p>
                          <p className="text-2xl font-bold text-green-600">
                            LKR {((salesStats?.totalSales || 0) * 0.15).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">15% pending collection</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        } />

        {/* Sales Records - Available to all roles */}
        <Route path="/records" element={<SalesRecords />} />

        {/* Sales Targets - Available to management roles */}
        {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.SALES_MANAGER, UserRole.AREA_SALES_MANAGER].includes(user?.role!) && (
          <Route path="/targets" element={<SalesTargets />} />
        )}

        {/* Sales Performance - Available to management roles */}
        {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.SALES_MANAGER, UserRole.AREA_SALES_MANAGER].includes(user?.role!) && (
          <Route path="/performance" element={<SalesPerformance />} />
        )}

        {/* Sales Territories - Available to top management only */}
        {[UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.SALES_MANAGER].includes(user?.role!) && (
          <Route path="/territories" element={<SalesTerritories />} />
        )}
      </Routes>
    </div>
  );
};

export default SalesDashboard;