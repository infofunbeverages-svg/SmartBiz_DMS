import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  FileText, 
  Award, 
  TrendingUp,
  Search,
  Plus,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmployeeList from './components/EmployeeList';
import LeaveManagement from './components/LeaveManagement';
import PerformanceTracking from './components/PerformanceTracking';
import DocumentManagement from './components/DocumentManagement';

const HRDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const location = useLocation();

  // Navigation items
  const navItems = [
    { path: '/hr', label: 'Overview', icon: TrendingUp },
    { path: '/hr/employees', label: 'Employees', icon: Users },
    { path: '/hr/leave', label: 'Leave Management', icon: Calendar },
    { path: '/hr/performance', label: 'Performance', icon: Award },
    { path: '/hr/documents', label: 'Documents', icon: FileText }
  ];

  const isActive = (path: string) => {
    if (path === '/hr') {
      return location.pathname === '/hr';
    }
    return location.pathname.startsWith(path);
  };

  // HR Statistics
  const hrStats = {
    totalEmployees: 156,
    onLeaveToday: 8,
    pendingLeaveRequests: 12,
    performanceReviewsDue: 24,
    documentsExpiring: 5
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Human Resources</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage employees, leave requests, performance, and documents
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="primary" icon={<Plus />}>
            Add Employee
          </Button>
          <Button variant="secondary" icon={<Download />}>
            Export Report
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
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

      <Routes>
        {/* HR Overview */}
        <Route path="/" element={
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Employees</p>
                      <h3 className="text-xl font-bold text-gray-900">{hrStats.totalEmployees}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Calendar className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">On Leave Today</p>
                      <h3 className="text-xl font-bold text-gray-900">{hrStats.onLeaveToday}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <FileText className="h-6 w-6 text-amber-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Leave Requests</p>
                      <h3 className="text-xl font-bold text-gray-900">{hrStats.pendingLeaveRequests}</h3>
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
                      <p className="text-sm font-medium text-gray-500">Reviews Due</p>
                      <h3 className="text-xl font-bold text-gray-900">{hrStats.performanceReviewsDue}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <FileText className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Docs Expiring</p>
                      <h3 className="text-xl font-bold text-gray-900">{hrStats.documentsExpiring}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Department Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Department Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Sales', count: 45, target: 50, performance: 92 },
                    { name: 'Operations', count: 32, target: 35, performance: 88 },
                    { name: 'Finance', count: 18, target: 20, performance: 95 },
                    { name: 'IT', count: 12, target: 15, performance: 85 },
                    { name: 'HR', count: 8, target: 10, performance: 90 }
                  ].map((dept, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-32">
                        <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                      </div>
                      <div className="flex-1 mx-4">
                        <div className="flex items-center">
                          <div className="flex-1">
                            <div className="h-2 bg-gray-200 rounded-full">
                              <div
                                className="h-2 bg-blue-600 rounded-full"
                                style={{ width: `${(dept.count / dept.target) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="ml-4 text-sm text-gray-500">
                            {dept.count}/{dept.target}
                          </span>
                        </div>
                      </div>
                      <div className="w-24 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          dept.performance >= 90 ? 'bg-green-100 text-green-800' :
                          dept.performance >= 80 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {dept.performance}% Performance
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Leave Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...Array(5)].map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Users className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <p className="text-sm font-medium text-gray-900">Employee {index + 1}</p>
                            <p className="text-xs text-gray-500">Annual Leave • 3 days</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="secondary" size="sm">Reject</Button>
                          <Button variant="primary" size="sm">Approve</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { metric: 'Employee Satisfaction', value: 85, trend: 'up' },
                      { metric: 'Attendance Rate', value: 92, trend: 'up' },
                      { metric: 'Training Completion', value: 78, trend: 'down' },
                      { metric: 'Retention Rate', value: 95, trend: 'up' }
                    ].map((metric, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{metric.metric}</p>
                        </div>
                        <div className="flex items-center">
                          <span className={`px-2 py-1 rounded text-sm font-medium ${
                            metric.value >= 90 ? 'bg-green-100 text-green-800' :
                            metric.value >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {metric.value}%
                          </span>
                          <TrendingUp className={`h-4 w-4 ml-2 ${
                            metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                          }`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        } />

        {/* Employees */}
        <Route path="/employees" element={
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search employees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  icon={<Search className="h-5 w-5 text-gray-400" />}
                />
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  <option value="sales">Sales</option>
                  <option value="hr">HR</option>
                  <option value="finance">Finance</option>
                  <option value="it">IT</option>
                  <option value="operations">Operations</option>
                </select>
              </div>
            </div>

            <EmployeeList searchQuery={searchQuery} departmentFilter={departmentFilter} />
          </div>
        } />

        {/* Leave Management */}
        <Route path="/leave" element={<LeaveManagement />} />

        {/* Performance Tracking */}
        <Route path="/performance" element={<PerformanceTracking />} />

        {/* Document Management */}
        <Route path="/documents" element={<DocumentManagement />} />
      </Routes>
    </div>
  );
};

export default HRDashboard;