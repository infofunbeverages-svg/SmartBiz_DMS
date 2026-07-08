import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Target,
  Calendar,
  MapPin,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useSalesStore } from '../../../stores/salesStore';
import { useAuthStore } from '../../../lib/auth';

const SalesPerformance: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  
  const { getSalesPerformance, getFilteredTerritories } = useSalesStore();
  const { user } = useAuthStore();
  const performance = getSalesPerformance();
  const territories = getFilteredTerritories();

  const filteredPerformance = performance.filter(perf => {
    if (selectedTerritory === 'all') return true;
    // Filter by territory if needed
    return true;
  });

  const totalSales = filteredPerformance.reduce((sum, perf) => sum + perf.totalSales, 0);
  const totalTarget = filteredPerformance.reduce((sum, perf) => sum + perf.targetAmount, 0);
  const averageAchievement = filteredPerformance.length > 0 
    ? filteredPerformance.reduce((sum, perf) => sum + perf.achievementRate, 0) / filteredPerformance.length 
    : 0;

  const getPerformanceColor = (rate: number) => {
    if (rate >= 100) return 'text-green-600';
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (rate: number) => {
    if (rate >= 120) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (rate >= 100) return { label: 'Target Met', color: 'bg-blue-100 text-blue-800' };
    if (rate >= 80) return { label: 'Good', color: 'bg-amber-100 text-amber-800' };
    if (rate >= 60) return { label: 'Fair', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Needs Improvement', color: 'bg-red-100 text-red-800' };
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Team Members</p>
                <h3 className="text-xl font-bold text-gray-900">{filteredPerformance.length}</h3>
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
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Achievement</p>
                <h3 className={`text-xl font-bold ${getPerformanceColor(averageAchievement)}`}>
                  {averageAchievement.toFixed(1)}%
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Top Performers</p>
                <h3 className="text-xl font-bold text-gray-900">
                  {filteredPerformance.filter(p => p.achievementRate >= 100).length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
        >
          <option value="current-month">Current Month</option>
          <option value="last-month">Last Month</option>
          <option value="current-quarter">Current Quarter</option>
          <option value="last-quarter">Last Quarter</option>
          <option value="current-year">Current Year</option>
        </select>
        <select
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedTerritory}
          onChange={(e) => setSelectedTerritory(e.target.value)}
        >
          <option value="all">All Territories</option>
          {territories.map(territory => (
            <option key={territory.id} value={territory.id}>{territory.name}</option>
          ))}
        </select>
      </div>

      {/* Performance List */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPerformance
              .sort((a, b) => b.achievementRate - a.achievementRate)
              .map((performer, index) => {
                const badge = getPerformanceBadge(performer.achievementRate);
                return (
                  <div key={performer.salesRepId} className="p-6 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900">{performer.salesRepName}</h4>
                          <p className="text-sm text-gray-500">{performer.period}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Sales Amount</p>
                        <p className="text-xl font-bold text-gray-900">
                          Rs. {performer.totalSales.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Target</p>
                        <p className="text-xl font-bold text-gray-900">
                          Rs. {performer.targetAmount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Achievement</p>
                        <p className={`text-xl font-bold ${getPerformanceColor(performer.achievementRate)}`}>
                          {performer.achievementRate.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Orders</p>
                        <p className="text-xl font-bold text-gray-900">{performer.ordersCount}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Target Progress</span>
                        <span className="text-sm text-gray-500">
                          {performer.achievementRate.toFixed(1)}% Complete
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-300 ${
                            performer.achievementRate >= 100 ? 'bg-green-600' :
                            performer.achievementRate >= 80 ? 'bg-blue-600' :
                            performer.achievementRate >= 60 ? 'bg-amber-600' :
                            'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(100, performer.achievementRate)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {performer.customersVisited} customers visited
                        </span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          {performer.newCustomers} new customers
                        </span>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          Rs. {performer.averageOrderValue.toLocaleString()} avg order
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { range: '120%+', count: filteredPerformance.filter(p => p.achievementRate >= 120).length, color: 'bg-green-500' },
                { range: '100-119%', count: filteredPerformance.filter(p => p.achievementRate >= 100 && p.achievementRate < 120).length, color: 'bg-blue-500' },
                { range: '80-99%', count: filteredPerformance.filter(p => p.achievementRate >= 80 && p.achievementRate < 100).length, color: 'bg-amber-500' },
                { range: '60-79%', count: filteredPerformance.filter(p => p.achievementRate >= 60 && p.achievementRate < 80).length, color: 'bg-orange-500' },
                { range: '<60%', count: filteredPerformance.filter(p => p.achievementRate < 60).length, color: 'bg-red-500' }
              ].map((item, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-4 h-4 rounded ${item.color} mr-3`} />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-900">{item.range}</span>
                      <span className="text-sm text-gray-600">{item.count} members</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${(item.count / filteredPerformance.length) * 100}%` }}
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
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Highest Achievement</span>
                <span className="text-sm font-bold text-green-600">
                  {Math.max(...filteredPerformance.map(p => p.achievementRate)).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Lowest Achievement</span>
                <span className="text-sm font-bold text-red-600">
                  {Math.min(...filteredPerformance.map(p => p.achievementRate)).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Total Orders</span>
                <span className="text-sm font-bold text-gray-900">
                  {filteredPerformance.reduce((sum, p) => sum + p.ordersCount, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-900">Customers Visited</span>
                <span className="text-sm font-bold text-gray-900">
                  {filteredPerformance.reduce((sum, p) => sum + p.customersVisited, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesPerformance;