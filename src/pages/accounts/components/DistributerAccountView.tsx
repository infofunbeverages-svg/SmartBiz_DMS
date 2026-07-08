import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAccountStore } from '../../../stores/accountStore';
import { 
  Building, 
  Store, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  DollarSign
} from 'lucide-react';
import Button from '../../../components/ui/Button';

const DistributerAccountView: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  
  const { 
    getFilteredAccounts, 
    getFilteredTransactions,
    getShopOutstandings 
  } = useAccountStore();
  
  const accounts = getFilteredAccounts();
  const transactions = getFilteredTransactions();
  const shopOutstandings = getShopOutstandings();

  const agencyAccount = accounts.find(acc => acc.accountType === 'AGENCY');
  const shopAccounts = accounts.filter(acc => acc.accountType === 'SHOP');

  const totalShopOutstanding = shopOutstandings.reduce((sum, shop) => sum + shop.totalOutstanding, 0);
  const totalOverdue = shopOutstandings.reduce((sum, shop) => sum + shop.overdueAmount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-amber-100 text-amber-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Agency Account Overview */}
      {agencyAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Agency Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account Balance</p>
                    <h3 className={`text-2xl font-bold ${agencyAccount.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      Rs. {agencyAccount.balance.toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Credit Limit</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      Rs. {agencyAccount.creditLimit?.toLocaleString() || '0'}
                    </h3>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-amber-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment Terms</p>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {agencyAccount.paymentTerms || 0} days
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shop Accounts Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Store className="h-5 w-5 mr-2" />
            Shop Accounts Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Store className="h-6 w-6 text-gray-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Shops</p>
                  <h3 className="text-xl font-bold text-gray-900">{shopAccounts.length}</h3>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Outstanding</p>
                  <h3 className="text-xl font-bold text-red-600">
                    Rs. {totalShopOutstanding.toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-amber-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Overdue Amount</p>
                  <h3 className="text-xl font-bold text-amber-600">
                    Rs. {totalOverdue.toLocaleString()}
                  </h3>
                </div>
              </div>
            </div>
          </div>

          {/* Shop Outstanding Details */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Outstanding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Overdue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit Limit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Payment
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shopOutstandings.map((shop) => (
                  <tr key={shop.customerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                          <Store className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{shop.shopName}</div>
                          <div className="text-sm text-gray-500">{shop.shopAddress}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-red-600">
                        Rs. {shop.totalOutstanding.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-amber-600">
                        Rs. {shop.overdueAmount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rs. {shop.creditLimit.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {shop.lastPaymentDate ? new Date(shop.lastPaymentDate).toLocaleDateString() : 'No payments'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="secondary" size="sm">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Recent Transactions
            </CardTitle>
            <select
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="current-month">Current Month</option>
              <option value="last-month">Last Month</option>
              <option value="current-quarter">Current Quarter</option>
            </select>
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
                    Type
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
                {transactions.slice(0, 10).map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                      {transaction.reference && (
                        <div className="text-sm text-gray-500">{transaction.reference}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-bold ${
                        transaction.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'CREDIT' ? '+' : '-'}Rs. {transaction.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DistributerAccountView;