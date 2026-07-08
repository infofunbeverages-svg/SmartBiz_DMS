import React from 'react';
import { DollarSign, FileText, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';

const ExpenseDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Expense Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-blue-600" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs. 245,678</div>
            <div className="text-sm text-gray-500">This month</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-amber-600" />
              Pending Claims
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="text-sm text-gray-500">Awaiting approval</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <div className="text-sm text-gray-500">Of monthly budget used</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">Office Supplies</div>
                    <div className="text-sm text-gray-500">Submitted by John Doe</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Rs. 12,500</div>
                    <div className="px-3 py-1 text-sm text-amber-700 bg-amber-100 rounded-full">
                      Pending
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Fuel', amount: 85000, color: 'bg-blue-100 text-blue-800' },
                { category: 'Office Supplies', amount: 45000, color: 'bg-green-100 text-green-800' },
                { category: 'Travel', amount: 35000, color: 'bg-yellow-100 text-yellow-800' },
                { category: 'Maintenance', amount: 25000, color: 'bg-purple-100 text-purple-800' },
                { category: 'Others', amount: 15000, color: 'bg-pink-100 text-pink-800' },
              ].map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full ${cat.color} flex items-center justify-center mr-3`}>
                      {Math.round(cat.amount / 245678 * 100)}%
                    </div>
                    <span className="font-medium">{cat.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Rs. {cat.amount.toLocaleString()}</div>
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

export default ExpenseDashboard;