import React, { useState } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  Download,
  Plus,
  Search,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const FinanceDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Mock financial data
  const financialStats = {
    totalRevenue: 2450000,
    totalExpenses: 1850000,
    netProfit: 600000,
    cashFlow: 450000,
    accountsReceivable: 320000,
    accountsPayable: 180000
  };

  const recentTransactions = [
    {
      id: '1',
      type: 'income',
      description: 'Payment from Agency A',
      amount: 125000,
      date: '2024-01-15',
      category: 'Sales Revenue'
    },
    {
      id: '2',
      type: 'expense',
      description: 'Office Rent Payment',
      amount: 45000,
      date: '2024-01-14',
      category: 'Operating Expenses'
    },
    {
      id: '3',
      type: 'income',
      description: 'Payment from Agency B',
      amount: 89000,
      date: '2024-01-14',
      category: 'Sales Revenue'
    },
    {
      id: '4',
      type: 'expense',
      description: 'Vehicle Maintenance',
      amount: 25000,
      date: '2024-01-13',
      category: 'Vehicle Expenses'
    },
    {
      id: '5',
      type: 'expense',
      description: 'Staff Salaries',
      amount: 180000,
      date: '2024-01-12',
      category: 'Payroll'
    }
  ];

  const accounts = [
    {
      name: 'Main Business Account',
      type: 'Checking',
      balance: 850000,
      currency: 'LKR'
    },
    {
      name: 'Savings Account',
      type: 'Savings',
      balance: 450000,
      currency: 'LKR'
    },
    {
      name: 'Petty Cash',
      type: 'Cash',
      balance: 25000,
      currency: 'LKR'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Financial overview and transaction management
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="primary" icon={<Plus />}>
            New Transaction
          </Button>
          <Button variant="secondary" icon={<Download />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  Rs. {financialStats.totalRevenue.toLocaleString()}
                </h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12.5% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  Rs. {financialStats.totalExpenses.toLocaleString()}
                </h3>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm text-red-600">+8.2% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Net Profit</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  Rs. {financialStats.netProfit.toLocaleString()}
                </h3>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+18.7% from last month</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow and Accounts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Cash Flow Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Cash Inflow</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    Rs. {(financialStats.totalRevenue * 0.8).toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">+15.2%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Cash Outflow</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    Rs. {(financialStats.totalExpenses * 0.9).toLocaleString()}
                  </p>
                  <p className="text-sm text-red-600">+8.1%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Net Cash Flow</p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    Rs. {financialStats.cashFlow.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-600">+22.3%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {accounts.map((account, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{account.name}</p>
                      <p className="text-xs text-gray-500">{account.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900">
                      Rs. {account.balance.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <div className="flex gap-2">
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search className="h-4 w-4 text-gray-400" />}
                className="w-64"
              />
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {transaction.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-sm font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}Rs. {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Financial Ratios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  metric: 'Profit Margin', 
                  value: `${((financialStats.netProfit / financialStats.totalRevenue) * 100).toFixed(1)}%`,
                  status: 'good'
                },
                { 
                  metric: 'Current Ratio', 
                  value: '2.4',
                  status: 'good'
                },
                { 
                  metric: 'Debt-to-Equity', 
                  value: '0.3',
                  status: 'excellent'
                },
                { 
                  metric: 'ROI', 
                  value: '18.5%',
                  status: 'good'
                }
              ].map((ratio, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{ratio.metric}</span>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${
                      ratio.status === 'excellent' ? 'bg-green-100 text-green-800' :
                      ratio.status === 'good' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {ratio.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Outstanding Balances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Accounts Receivable</p>
                  <p className="text-xs text-gray-500">Amount owed to us</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    Rs. {financialStats.accountsReceivable.toLocaleString()}
                  </p>
                  <p className="text-xs text-amber-600">15 pending invoices</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">Accounts Payable</p>
                  <p className="text-xs text-gray-500">Amount we owe</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    Rs. {financialStats.accountsPayable.toLocaleString()}
                  </p>
                  <p className="text-xs text-red-600">8 pending payments</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinanceDashboard;