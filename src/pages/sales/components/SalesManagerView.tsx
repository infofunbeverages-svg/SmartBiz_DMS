import React, { useState } from 'react';
import { 
  Users, 
  Building, 
  TrendingUp, 
  Target,
  BarChart3,
  Filter,
  Download,
  Eye,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useSalesStore } from '../../../stores/salesStore';
import { useAgencyStore } from '../../../stores/agencyStore';

const SalesManagerView: React.FC = () => {
  const [selectedView, setSelectedView] = useState<'overview' | 'agency'>('overview');
  const [selectedAgency, setSelectedAgency] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  
  const { getFilteredSalesRecords, getAgencySalesData, getSalesPerformance } = useSalesStore();
  const allSalesRecords = getFilteredSalesRecords();
  const salesPerformance = getSalesPerformance();

  // Calculate overall metrics
  const totalSales = allSalesRecords.reduce((sum, record) => sum + record.totalAmount, 0);
  const totalOrders = allSalesRecords.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Agency-wise breakdown
  const agencyBreakdown = agencies.map(agency => {
    const agencySales = getAgencySalesData(agency.id);
    const agencyTotal = agencySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const agencyOrders = agencySales.length;
    
    return {
      ...agency,
      totalSales: agencyTotal,
      ordersCount: agencyOrders,
      averageOrderValue: agencyOrders > 0 ? agencyTotal / agencyOrders : 0,
      growth: Math.random() * 25 - 5,
      targetAchievement: (agencyTotal / 400000) * 100
    };
  });

  const filteredRecords = selectedAgency === 'all' ? 
    allSalesRecords : 
    getAgencySalesData(selectedAgency);

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Management Dashboard</h2>
          <p className="text-sm text-gray-500">Comprehensive sales overview and agency management</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedView === 'overview'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setSelectedView('overview')}
            >
              Overall View
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                selectedView === 'agency'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              onClick={() => setSelectedView('agency')}
            >
              Agency View
            </button>
          </div>
          <Button variant="primary" icon={<Plus />}>
            New Target
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Sales</p>
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
                <p className="text-sm font-medium text-gray-500">Active Agencies</p>
                <h3 className="text-xl font-bold text-gray-900">{agencies.length}</h3>
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
                <h3 className="text-xl font-bold text-gray-900">{salesPerformance.length}</h3>
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
          {selectedView === 'agency' && (
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
            >
              <option value="all">All Agencies</option>
              {agencies.map(agency => (
                <option key={agency.id} value={agency.id}>{agency.name}</option>
              ))}
            </select>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Filter />}>
            Advanced Filters
          </Button>
          <Button variant="secondary" icon={<Download />}>
            Export Report
          </Button>
        </div>
      </div>

      {selectedView === 'overview' ? (
        <>
          {/* Sales Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {salesPerformance.slice(0, 10).map((performer, index) => (
                  <div key={performer.salesRepId} className="p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-900">{performer.salesRepName}</h4>
                          <p className="text-xs text-gray-500">
                            Agency {performer.companyId} • {performer.ordersCount} orders
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Rs. {performer.totalSales.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {performer.achievementRate.toFixed(1)}% of target
                          </p>
                        </div>
                        <div className="w-24">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                performer.achievementRate >= 100 ? 'bg-green-600' :
                                performer.achievementRate >= 80 ? 'bg-blue-600' :
                                'bg-amber-600'
                              }`}
                              style={{ width: `${Math.min(100, performer.achievementRate)}%` }}
                            />
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" icon={<Eye />}>
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Agency Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Agency Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {agencyBreakdown.map((agency) => (
                  <div key={agency.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900">{agency.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        agency.targetAchievement >= 100 ? 'bg-green-100 text-green-800' :
                        agency.targetAchievement >= 80 ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {agency.targetAchievement.toFixed(1)}% Target
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Sales</p>
                        <p className="text-sm font-medium">Rs. {agency.totalSales.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Orders</p>
                        <p className="text-sm font-medium">{agency.ordersCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Order</p>
                        <p className="text-sm font-medium">Rs. {agency.averageOrderValue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Growth</p>
                        <p className={`text-sm font-medium ${agency.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {agency.growth >= 0 ? '+' : ''}{agency.growth.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Agency-Specific View */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedAgency === 'all' ? 'All Agencies' : agencies.find(a => a.id === selectedAgency)?.name} - Detailed View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Agency Sales Records */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Shop
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Sales Rep
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecords.slice(0, 10).map((record) => (
                        <tr key={record.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {record.invoiceNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.shopName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {record.salesRepName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(record.invoiceDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Rs. {record.totalAmount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.paymentStatus === 'PAID' ? 'bg-green-100 text-green-800' :
                              record.paymentStatus === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {record.paymentStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default SalesManagerView;
