import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  AlertTriangle,
  Plus,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAccountStore } from '../../stores/accountStore';
import { useAuthStore } from '../../lib/auth';
import { UserRole } from '../../types/user';
import CompanyAccountView from './components/CompanyAccountView';
import AccountantAccountView from './components/AccountantAccountView';
import DistributerAccountView from './components/DistributerAccountView';
import SalesRepAccountView from './components/SalesRepAccountView';

const AccountsDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const { user } = useAuthStore();
  const { 
    loading, 
    error, 
    fetchAccountData,
    getAccountSummary 
  } = useAccountStore();

  useEffect(() => {
    fetchAccountData();
  }, [fetchAccountData]);

  const accountSummary = getAccountSummary();

  // Navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { path: '/accounts', label: 'Overview', icon: TrendingUp }
    ];

    if (user?.role === UserRole.ACCOUNTANT) {
      baseItems.push(
        { path: '/accounts/manage', label: 'Manage Accounts', icon: CreditCard },
        { path: '/accounts/transactions', label: 'Transactions', icon: DollarSign },
        { path: '/accounts/reports', label: 'Reports', icon: TrendingUp }
      );
    } else if (user?.role === UserRole.AGENCY_OWNER) {
      baseItems.push(
        { path: '/accounts/agency', label: 'Agency Accounts', icon: CreditCard },
        { path: '/accounts/shops', label: 'Shop Accounts', icon: Users }
      );
    } else if (user?.role === UserRole.SALES_REP) {
      baseItems.push(
        { path: '/accounts/outstandings', label: 'Shop Outstandings', icon: AlertTriangle }
      );
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const isActive = (path: string) => {
    if (path === '/accounts') {
      return location.pathname === '/accounts';
    }
    return location.pathname.startsWith(path);
  };

  const getRoleBasedTitle = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return 'Company Accounts Overview';
      case UserRole.ACCOUNTANT:
        return 'Accounts Management';
      case UserRole.AGENCY_OWNER:
        return 'Agency Accounts';
      case UserRole.SALES_REP:
        return 'Shop Outstandings';
      default:
        return 'Accounts';
    }
  };

  const getRoleBasedDescription = () => {
    switch (user?.role) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        return 'View-only access to all company financial accounts';
      case UserRole.ACCOUNTANT:
        return 'Full control over all accounts and transactions';
      case UserRole.AGENCY_OWNER:
        return 'Manage your agency and shop accounts';
      case UserRole.SALES_REP:
        return 'Track outstanding payments from your assigned shops';
      default:
        return 'Account management system';
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
        <Button onClick={fetchAccountData} className="mt-4">
          Retry
        </Button>
      </div>
    );
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
          {user?.role === UserRole.ACCOUNTANT && (
            <>
              <Button variant="primary" icon={<Plus />}>
                New Account
              </Button>
              <Button variant="secondary" icon={<Download />}>
                Export Report
              </Button>
            </>
          )}
          {user?.role === UserRole.AGENCY_OWNER && (
            <Button variant="secondary" icon={<Download />}>
              Export Statement
            </Button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      {navItems.length > 1 && (
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
      )}

      {/* Summary Cards */}
      {accountSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Balance</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    Rs. {accountSummary.totalBalance.toLocaleString()}
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
                  <p className="text-sm font-medium text-gray-500">Receivables</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    Rs. {accountSummary.totalReceivables.toLocaleString()}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Payables</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    Rs. {accountSummary.totalPayables.toLocaleString()}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Overdue</p>
                  <h3 className="text-xl font-bold text-gray-900">
                    Rs. {accountSummary.overdueAmount.toLocaleString()}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Routes>
        {/* Role-based main views */}
        <Route path="/" element={
          <>
            {(user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.ADMIN) && <CompanyAccountView />}
            {user?.role === UserRole.ACCOUNTANT && <AccountantAccountView />}
            {user?.role === UserRole.AGENCY_OWNER && <DistributerAccountView />}
            {user?.role === UserRole.SALES_REP && <SalesRepAccountView />}
          </>
        } />

        {/* Accountant specific routes */}
        {user?.role === UserRole.ACCOUNTANT && (
          <>
            <Route path="/manage" element={<AccountantAccountView />} />
            <Route path="/transactions" element={<div>Transactions Management</div>} />
            <Route path="/reports" element={<div>Financial Reports</div>} />
          </>
        )}

        {/* Agency Owner specific routes */}
        {user?.role === UserRole.AGENCY_OWNER && (
          <>
            <Route path="/agency" element={<DistributerAccountView />} />
            <Route path="/shops" element={<div>Shop Accounts</div>} />
          </>
        )}

        {/* Sales Rep specific routes */}
        {user?.role === UserRole.SALES_REP && (
          <Route path="/outstandings" element={<SalesRepAccountView />} />
        )}
      </Routes>
    </div>
  );
};

export default AccountsDashboard;