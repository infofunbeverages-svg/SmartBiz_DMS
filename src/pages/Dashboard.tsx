import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  ShoppingCart,
  Calendar,
  DollarSign,
  Truck,
  Clock,
  RefreshCw,
  Building
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../lib/auth';
import { dashboardService } from '../lib/dashboardService';
import { UserRole } from '../types/user';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';

interface RecentActivity {
  id: string;
  type: 'order' | 'delivery' | 'payment';
  message: string;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    todaySales: 0,
    monthlySales: 0,
    pendingOrders: 0,
    topProducts: [] as Array<{ id: string; name: string; sales: number }>,
  });
  const [globalStats, setGlobalStats] = useState({
    totalAgencies: 0,
    totalUsers: 0,
    totalGlobalSales: 0,
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = user?.role === UserRole.SUPER_ADMIN;

  useEffect(() => {
    loadDashboardStats();
    loadRecentActivities();
  }, []);

  const loadRecentActivities = async () => {
    try {
      const [bk, inv, pay] = await Promise.all([
        supabase.from('bookings').select('id, booking_number, created_at, agency_id').order('created_at', { ascending: false }).limit(5),
        supabase.from('invoices').select('id, invoice_no, created_at, payment_status').order('created_at', { ascending: false }).limit(5),
        supabase.from('agency_payments').select('id, amount, created_at, agency_id').order('created_at', { ascending: false }).limit(5),
      ]);

      const agencyIds = [...new Set([...(bk.data || []), ...(pay.data || [])].map((r: any) => r.agency_id).filter(Boolean))];
      const names: Record<string, string> = {};
      if (agencyIds.length) {
        const { data: ags } = await supabase.from('agencies').select('id, name').in('id', agencyIds);
        (ags || []).forEach((a: any) => { names[a.id] = a.name; });
      }

      const activities: RecentActivity[] = [
        ...(bk.data || []).map((r: any) => ({
          id: `booking-${r.id}`, type: 'order' as const,
          message: `Booking ${r.booking_number || ''} from ${names[r.agency_id] || 'an agency'}`,
          timestamp: r.created_at,
        })),
        ...(inv.data || []).map((r: any) => ({
          id: `invoice-${r.id}`, type: 'delivery' as const,
          message: `Invoice ${r.invoice_no || ''} ${r.payment_status ? '(' + r.payment_status + ')' : ''}`,
          timestamp: r.created_at,
        })),
        ...(pay.data || []).map((r: any) => ({
          id: `payment-${r.id}`, type: 'payment' as const,
          message: `Payment Rs. ${Number(r.amount || 0).toLocaleString()} from ${names[r.agency_id] || 'an agency'}`,
          timestamp: r.created_at,
        })),
      ];
      activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setRecentActivities(activities.slice(0, 6));
    } catch (err) {
      console.error('Error loading recent activities:', err);
      setRecentActivities([]);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (isSuperAdmin) {
        // Load global stats for SUPER_ADMIN
        try {
          const globalStatsData = await dashboardService.getGlobalStats();
          setGlobalStats(globalStatsData);
        } catch (err: any) {
          console.warn('Error loading global stats:', err);
          setError('Some statistics may not be available');
        }
      } else {
        // Load regular stats for other users
        try {
          const dashboardStats = await dashboardService.getStats();
          setStats(dashboardStats);
        } catch (err: any) {
          console.warn('Error loading dashboard stats:', err);
          setError('Some statistics may not be available');
        }
      }
    } catch (err: any) {
      console.error('Error loading dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Quick stats cards - different for SUPER_ADMIN vs regular users
  const statsCards = isSuperAdmin
    ? [
        {
          title: "Total Agencies",
          value: globalStats.totalAgencies.toString(),
          icon: <Building className="h-8 w-8 text-blue-600" />,
          change: "",
          changeType: "increase" as const
        },
        {
          title: "Total Users",
          value: globalStats.totalUsers.toString(),
          icon: <Users className="h-8 w-8 text-green-600" />,
          change: "",
          changeType: "increase" as const
        },
        {
          title: "Total Global Sales",
          value: `Rs. ${globalStats.totalGlobalSales.toLocaleString()}`,
          icon: <DollarSign className="h-8 w-8 text-amber-600" />,
          change: "",
          changeType: "increase" as const
        },
        {
          title: "System Status",
          value: "Active",
          icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
          change: "",
          changeType: "increase" as const
        }
      ]
    : [
        {
          title: "Today's Sales",
          value: `Rs. ${stats.todaySales.toLocaleString()}`,
          icon: <DollarSign className="h-8 w-8 text-blue-600" />,
          change: "+12%",
          changeType: "increase" as const
        },
        {
          title: "This Month",
          value: `Rs. ${stats.monthlySales.toLocaleString()}`,
          icon: <Calendar className="h-8 w-8 text-green-600" />,
          change: "+24%",
          changeType: "increase" as const
        },
        {
          title: "Pending Orders",
          value: stats.pendingOrders.toString(),
          icon: <ShoppingCart className="h-8 w-8 text-amber-600" />,
          change: "-3%",
          changeType: "decrease" as const
        },
        {
          title: "Deliveries Today",
          value: "0",
          icon: <Truck className="h-8 w-8 text-purple-600" />,
          change: "+0",
          changeType: "increase" as const
        }
      ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back, {user?.name}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-2">
          <Button
            variant="secondary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => {
              loadDashboardStats();
              loadRecentActivities();
            }}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-4 w-4" />
            Last updated: {new Date().toLocaleString()}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-md">
          <p>Warning: {error}. Some data may not be available.</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</h3>
                </div>
                <div>
                  {stat.icon}
                </div>
              </div>
              {stat.change && (
                <div className="mt-4">
                  <div className={`inline-flex items-center text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="mr-1 h-4 w-4" />
                    ) : (
                      <TrendingDown className="mr-1 h-4 w-4" />
                    )}
                    {stat.change} from last period
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts and Tables - Only show for non-SUPER_ADMIN users */}
      {!isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No product sales data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.topProducts.map((product, index) => (
                    <div key={product.id || index} className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {product.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Rs. {product.sales.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {stats.monthlySales > 0 
                            ? Math.round((product.sales / stats.monthlySales) * 100) 
                            : 0}% of sales
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Sales Reps */}
          <Card>
            <CardHeader>
              <CardTitle>Top Sales Representatives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Sales rep data coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>No recent activity</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex">
                  <div className="mr-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {activity.type === 'order' ? (
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      ) : activity.type === 'delivery' ? (
                        <Truck className="h-4 w-4 text-green-600" />
                      ) : (
                        <DollarSign className="h-4 w-4 text-amber-600" />
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;