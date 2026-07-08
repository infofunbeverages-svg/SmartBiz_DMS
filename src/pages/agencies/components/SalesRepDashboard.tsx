import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { useAuthStore } from '../../../lib/auth';
import { Building2, MapPin, ShoppingBag, TrendingUp } from 'lucide-react';
import Button from '../../../components/ui/Button';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const SalesRepDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;

  // Mock data for sales rep
  const salesData = {
    dailySales: 25000,
    monthlyTarget: 500000,
    completedVisits: 8,
    pendingVisits: 4,
    territory: {
      district: "Central",
      routes: ["Route A", "Route B", "Route C"]
    },
    todaySchedule: [
      { time: "09:00 AM", shop: "Shop A", status: "completed" },
      { time: "10:30 AM", shop: "Shop B", status: "completed" },
      { time: "02:00 PM", shop: "Shop C", status: "pending" },
      { time: "03:30 PM", shop: "Shop D", status: "pending" }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sales Representative Dashboard</h2>
          <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <div>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            className="px-4 py-2 border border-gray-300 rounded-md"
            placeholderText="Select date range"
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Today's Sales</p>
                <h3 className="text-xl font-bold text-gray-900">
                  Rs. {salesData.dailySales.toLocaleString()}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Building2 className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed Visits</p>
                <h3 className="text-xl font-bold text-gray-900">{salesData.completedVisits}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Visits</p>
                <h3 className="text-xl font-bold text-gray-900">{salesData.pendingVisits}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Territory</p>
                <h3 className="text-xl font-bold text-gray-900">{salesData.territory.district}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesData.todaySchedule.map((visit, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-gray-500" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{visit.shop}</p>
                    <p className="text-xs text-gray-500">{visit.time}</p>
                  </div>
                </div>
                <div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    visit.status === 'completed' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Territory Routes */}
      <Card>
        <CardHeader>
          <CardTitle>Assigned Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {salesData.territory.routes.map((route, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{route}</span>
                </div>
                <Button
                  variant="secondary"
                  className="mt-2 w-full"
                  onClick={() => {/* Handle route details */}}
                >
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesRepDashboard;