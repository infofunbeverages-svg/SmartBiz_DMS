import React, { useState } from 'react';
import { 
  TrendingUp, 
  Building, 
  Users, 
  DollarSign,
  BarChart3,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useSalesStore } from '../../../stores/salesStore';
import { useAgencyStore } from '../../../stores/agencyStore';

const CompanySalesView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedAgency, setSelectedAgency] = useState('all');
  
  const { getFilteredSalesRecords, getAgencySalesData, salesStats } = useSalesStore();
  const allSalesRecords = getFilteredSalesRecords();

  // Calculate agency-wise performance
  const agencyPerformance = agencies.map(agency => {
    const agencySales = getAgencySalesData(agency.id);
    const totalSales = agencySales.reduce((sum, sale) => sum + sale.totalAmount, 0);
    const ordersCount = agencySales.length;
    const averageOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;
    
    return {
      ...agency,
      totalSales,
      ordersCount,
      averageOrderValue,
      growth: Math.random() * 30 - 5, // Mock growth percentage
      targetAchievement: (totalSales / 500000) * 100 // Mock target
    };
  }).sort((a, b) => b.totalSales - a.totalSales);

  const filteredRecords = selectedAgency === 'all' ? 
    allSalesRecords : 
    getAgencySalesData(selectedAgency);

  const totalCompanySales = agencyPerformance.reduce((sum, agency) => sum + agency.totalSales, 0);
  const totalOrders = agencyPerformance.reduce((sum, agency) => sum + agency.ordersCount, 0);
  const averageGrowth = agencyPerformance.reduce((sum, agency) => sum + agency.growth, 0) / agencyPerformance.length;

  return (
    <div className="space-y-6">
      {/* Company Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Company Sales</p>
                <h3 className="text-xl font-bold text-gray-900">
                  Rs. {totalCompanySales.toLocaleString()}
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
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <h3 className="text-xl font-bold text-gray-900">{totalOrders}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Growth</p>
                <h3 className={`text-xl font-bold ${averageGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {averageGrowth >= 0 ? '+' : ''}{averageGrowth.toFixed(1)}%
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
            <option value="all">All Agencies</option>
            {agencies.map(agency => (
              <option key={agency.id} value={agency.id}>{agency.name}</option>
            ))}
          </select>
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

      {/* Agency Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Agency Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    <p className="text-sm font-medium text-gray-500 mb-1">Avg Order Value</p>
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

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Target Progress</span>
                    <span className="text-sm text-gray-500">
                      Rs. {(agency.targetAchievement * 5000).toLocaleString()} / Rs. 500,000
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

      {/* Sales Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { month: 'January', sales: 2200000, target: 2000000 },
                { month: 'February', sales: 2450000, target: 2100000 },
                { month: 'March', sales: 2680000, target: 2200000 },
                { month: 'April', sales: 2890000, target: 2300000 },
                { month: 'May', sales: 3100000, target: 2400000 },
                { month: 'June', sales: 2950000, target: 2500000 }
              ].map((trend, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-20 text-sm font-medium text-gray-900">{trend.month}</div>
                  <div className="flex-1 mx-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">Sales</span>
                      <span className="text-xs font-medium">Rs. {trend.sales.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(trend.sales / trend.target) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Performing Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Premium Rice 5kg', sales: 850000, growth: 15.2 },
                { name: 'Coconut Oil 1L', sales: 620000, growth: 12.8 },
                { name: 'Tea Packets 100g', sales: 480000, growth: 8.5 },
                { name: 'Washing Powder 1kg', sales: 390000, growth: 6.2 },
                { name: 'Soap Bar 100g', sales: 280000, growth: 4.1 }
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-green-600">+{product.growth}% growth</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Rs. {product.sales.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanySalesView;
