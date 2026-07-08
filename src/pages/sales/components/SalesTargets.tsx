import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Plus,
  Edit,
  Trash2,
  Award,
  AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useSalesStore } from '../../../stores/salesStore';
import { useAuthStore } from '../../../lib/auth';

const SalesTargets: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const { getFilteredTargets } = useSalesStore();
  const { user } = useAuthStore();
  const targets = getFilteredTargets();

  const filteredTargets = targets.filter(target => 
    target.period === selectedPeriod && target.year === selectedYear
  );

  const getAchievementColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAchievementIcon = (percentage: number) => {
    if (percentage >= 100) return <Award className="h-5 w-5 text-green-600" />;
    if (percentage >= 80) return <TrendingUp className="h-5 w-5 text-blue-600" />;
    return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  };

  const totalTarget = filteredTargets.reduce((sum, target) => sum + target.targetAmount, 0);
  const totalAchieved = filteredTargets.reduce((sum, target) => sum + target.achievedAmount, 0);
  const overallAchievement = totalTarget > 0 ? (totalAchieved / totalTarget) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Target</p>
                <h3 className="text-xl font-bold text-gray-900">
                  Rs. {totalTarget.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-500">Achieved</p>
                <h3 className="text-xl font-bold text-gray-900">
                  Rs. {totalAchieved.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Achievement</p>
                <h3 className={`text-xl font-bold ${getAchievementColor(overallAchievement)}`}>
                  {overallAchievement.toFixed(1)}%
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Remaining</p>
                <h3 className="text-xl font-bold text-gray-900">
                  Rs. {Math.max(0, totalTarget - totalAchieved).toLocaleString()}
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
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
          </select>
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            {[2023, 2024, 2025].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <Button variant="primary" icon={<Plus />}>
          Set New Target
        </Button>
      </div>

      {/* Targets List */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Targets - {selectedPeriod} {selectedYear}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTargets.map((target) => (
              <div key={target.id} className="p-6 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getAchievementIcon(target.achievementPercentage)}
                    <div className="ml-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {target.period} Target
                        {target.month && ` - ${new Date(0, target.month - 1).toLocaleString('default', { month: 'long' })}`}
                        {target.quarter && ` - Q${target.quarter}`}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {target.salesRepId ? 'Individual Target' : 'Agency Target'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Target Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      Rs. {target.targetAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Achieved Amount</p>
                    <p className="text-xl font-bold text-gray-900">
                      Rs. {target.achievedAmount.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Achievement Rate</p>
                    <p className={`text-xl font-bold ${getAchievementColor(target.achievementPercentage)}`}>
                      {target.achievementPercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-500">
                      {target.achievementPercentage.toFixed(1)}% Complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        target.achievementPercentage >= 100 ? 'bg-green-600' :
                        target.achievementPercentage >= 80 ? 'bg-blue-600' :
                        target.achievementPercentage >= 60 ? 'bg-amber-600' :
                        'bg-red-600'
                      }`}
                      style={{ width: `${Math.min(100, target.achievementPercentage)}%` }}
                    />
                  </div>
                </div>

                {target.products && target.products.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Product Targets</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {target.products.map((product, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Product {product.inventoryId}</span>
                            <span className="text-sm text-gray-600">
                              {product.achievedQuantity}/{product.targetQuantity}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ 
                                width: `${Math.min(100, (product.achievedQuantity / product.targetQuantity) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesTargets;