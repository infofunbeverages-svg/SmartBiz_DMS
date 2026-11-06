import React, { useState } from 'react';
import { 
  MapPin, 
  Building, 
  Users, 
  TrendingUp,
  Target,
  BarChart3,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useSalesStore } from '../../../stores/salesStore';
import { useAuthStore } from '../../../lib/auth';
import { useAgencyStore } from '../../../stores/agencyStore';

const AreaSalesManagerView: React.FC = () => {
  const { agencies, fetchAgencies } = useAgencyStore();

React.useEffect(() => {
  fetchAgencies();
}, []);
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  
  const { user } = useAuthStore();
  const { getFilteredSalesRecords, getAgencySalesData, getSalesPerformance } = useSalesStore();
  
  // Get agencies managed by this area sales manager
  const managedAgencies = agencies.filter(agency => 
    user?.managedAgencies?.includes(agency.id)
  );
  
  const allManagedSales = getFilteredSalesRecords();
  const salesPerformance = getSalesPerformance();

  // Calculate metrics for managed agencies
  const totalSales = allManagedSales.reduce((sum, record) => sum + record.totalAmount, 0);
  const totalOrders = allManagedSales.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Agency performance breakdown
  const agencyPerformance = managedAgencies.map(agency => {
    const agencySales = getAgencySalesData(agency.id);
    const agencyTotal = agencySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const agencyOrders = agencySales.length;
    const agencyReps = salesPerformance.filter(rep => rep.companyId === agency.id);
    
    return {
      ...agency,
      totalSales: agencyTotal,
      ordersCount: agencyOrders,
      averageOrderValue: agencyOrders > 0 ? agencyTotal / agencyOrders : 0,
      salesRepsCount: agencyReps.length,
      topPerformer: agencyReps.sort((a, b) => b.totalSales - a.totalSales)[0],
      growth: Math.random() * 20 - 5,
      targetAchievement: (agencyTotal / 350000) * 100
    };
  });

  const filteredRecords = selectedAgency === 'all' ? 
    allManagedSales : 
    getAgencySalesData(selectedAgency);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Area Sales Management</h2>
          <p className="text-sm text-gray-500">
            Managing {managedAgencies.length} agencies in your territory
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button variant="secondary" icon={<Download />}>
            Territory Report
          </Button>
        </div>
      </div>

      {/* Territory Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Territory Sales</p>
                <h3 className="text-xl font-bold text-gray-900">
                  Rs. {totalSales.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Managed Agencies</p>
                <h3 className="text-xl font-bold text-gray-900">{managedAgencies.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sales Team</p>
                <h3 className="text-xl font-bold text-gray-900">
                  {agencyPerformance.reduce((sum, agency) => sum + agency.salesRepsCount, 0)}
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
                <p className="text-sm font-medium text-gray-500">Avg Order Value</p>
                <h3 className="text-xl font-bold text-gray-900">
                  Rs. {averageOrderValue.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-4">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="current-month">Current Month</option>
            <option value="last-month">Last Month</option>
            <option value="current-quarter">Current Quarter</option>
            <option value="current-year">Current Year</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedAgency}
            onChange={(e) => setSelectedAgency(e.target.value)}
          >
            <option value="all">All My Agencies</option>
            {managedAgencies.map(agency => (
              <option key={agency.id} value={agency.id}>{agency.name}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Filter />}>
            Advanced Filters
          </Button>
          <Button variant="secondary" icon={<Download />}>
            Export Data
          </Button>
        </div>
      </div>

      {/* Agency Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Agency Performance in My Territory
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {agencyPerformance.map((agency, index) => (
              <div key={agency.id} className="p-6 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{agency.name}</h4>
                      <p className="text-sm text-gray-500">{agency.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      agency.targetAchievement >= 100 ? 'bg-green-100 text-green-800' :
                      agency.targetAchievement >= 80 ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {agency.targetAchievement.toFixed(1)}% Target
                    </span>
                    <Button variant="secondary" size="sm" icon={<Eye />}>
                      View Details
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Sales</p>
                    <p className="text-xl font-bold text-gray-900">
                      Rs. {agency.totalSales.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Orders</p>
                    <p className="text-xl font-bold text-gray-900">{agency.ordersCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Sales Reps</p>
                    <p className="text-xl font-bold text-gray-900">{agency.salesRepsCount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Avg Order</p>
                    <p className="text-xl font-bold text-gray-900">
                      Rs. {agency.averageOrderValue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Growth</p>
                    <p className={`text-xl font-bold ${agency.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {agency.growth >= 0 ? '+' : ''}{agency.growth.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Top Performer */}
                {agency.topPerformer && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Top Performer</p>
                        <p className="text-lg font-bold text-blue-600">{agency.topPerformer.salesRepName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Sales</p>
                        <p className="text-lg font-bold text-gray-900">
                          Rs. {agency.topPerformer.totalSales.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Target Progress</span>
                    <span className="text-sm text-gray-500">
                      Rs. {(agency.targetAchievement * 3500).toLocaleString()} / Rs. 350,000
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        agency.targetAchievement >= 100 ? 'bg-green-600' :
                        agency.targetAchievement >= 80 ? 'bg-blue-600' :
                        'bg-amber-600'
                      }`}
                      style={{ width: `${Math.min(100, agency.targetAchievement)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Territory Sales Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sales Team Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesPerformance.slice(0, 8).map((performer, index) => (
                <div key={performer.salesRepId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{performer.salesRepName}</p>
                      <p className="text-xs text-gray-500">
                        {agencies.find(a => a.id === performer.companyId)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Rs. {performer.totalSales.toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600">
                      {performer.achievementRate.toFixed(1)}% target
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Territory Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Best Performing Agency</p>
                    <p className="text-lg font-bold text-green-600">
                      {agencyPerformance.sort((a, b) => b.totalSales - a.totalSales)[0]?.name}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Territory Growth</p>
                    <p className="text-lg font-bold text-blue-600">
                      +{(agencyPerformance.reduce((sum, a) => sum + a.growth, 0) / agencyPerformance.length).toFixed(1)}%
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Agencies Above Target</p>
                    <p className="text-lg font-bold text-amber-600">
                      {agencyPerformance.filter(a => a.targetAchievement >= 100).length} / {agencyPerformance.length}
                    </p>
                  </div>
                  <Building className="h-8 w-8 text-amber-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AreaSalesManagerView;
