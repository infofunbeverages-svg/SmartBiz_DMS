import React, { useState } from 'react';
import { Map, Search, Filter, Plus, Download, MapPin, Truck, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const RoutesDashboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');

  // Mock data for demonstration
  const routeStats = {
    totalRoutes: 24,
    activeRoutes: 18,
    plannedRoutes: 6,
    completedToday: 12
  };

  const routes = [
    {
      id: 'R001',
      name: 'Colombo Central',
      area: 'Colombo',
      shops: 15,
      distance: '45 km',
      estimatedTime: '6 hours',
      status: 'Active',
      lastCompleted: '2 hours ago'
    },
    {
      id: 'R002',
      name: 'Kandy Hills',
      area: 'Kandy',
      shops: 12,
      distance: '38 km',
      estimatedTime: '5 hours',
      status: 'Active',
      lastCompleted: '4 hours ago'
    },
    {
      id: 'R003',
      name: 'Galle Coastal',
      area: 'Galle',
      shops: 20,
      distance: '52 km',
      estimatedTime: '7 hours',
      status: 'Planned',
      lastCompleted: '1 day ago'
    },
    {
      id: 'R004',
      name: 'Negombo Beach',
      area: 'Negombo',
      shops: 8,
      distance: '25 km',
      estimatedTime: '4 hours',
      status: 'Active',
      lastCompleted: '3 hours ago'
    },
    {
      id: 'R005',
      name: 'Matara South',
      area: 'Matara',
      shops: 18,
      distance: '48 km',
      estimatedTime: '6.5 hours',
      status: 'Planned',
      lastCompleted: '2 days ago'
    }
  ];

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesArea = selectedArea === 'all' || route.area.toLowerCase() === selectedArea.toLowerCase();
    return matchesSearch && matchesArea;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Routes Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage delivery routes and optimize distribution paths
          </p>
        </div>
        <div className="mt-4 md:mt-0 space-x-2">
          <Button variant="primary" icon={<Plus />}>
            Add Route
          </Button>
          <Button variant="secondary" icon={<Download />}>
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Map className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Routes</p>
                <h3 className="text-xl font-bold text-gray-900">{routeStats.totalRoutes}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Truck className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Routes</p>
                <h3 className="text-xl font-bold text-gray-900">{routeStats.activeRoutes}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Planned Routes</p>
                <h3 className="text-xl font-bold text-gray-900">{routeStats.plannedRoutes}</h3>
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
                <p className="text-sm font-medium text-gray-500">Completed Today</p>
                <h3 className="text-xl font-bold text-gray-900">{routeStats.completedToday}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-5 w-5 text-gray-400" />}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="all">All Areas</option>
            <option value="colombo">Colombo</option>
            <option value="kandy">Kandy</option>
            <option value="galle">Galle</option>
            <option value="negombo">Negombo</option>
            <option value="matara">Matara</option>
          </select>
          <Button variant="secondary" icon={<Filter />}>
            More Filters
          </Button>
        </div>
      </div>

      {/* Routes List */}
      <Card>
        <CardHeader>
          <CardTitle>Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Area
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shops
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Est. Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Completed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                          <Map className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{route.name}</div>
                          <div className="text-sm text-gray-500">{route.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">{route.area}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.shops} shops
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.distance}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {route.estimatedTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        route.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {route.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {route.lastCompleted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="secondary" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Route Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Route Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {routes.slice(0, 5).map((route, index) => (
                <div key={route.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                      <Map className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{route.name}</p>
                      <p className="text-xs text-gray-500">{route.shops} shops • {route.distance}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {Math.floor(Math.random() * 20) + 80}% Efficiency
                    </p>
                    <p className="text-xs text-gray-500">{route.estimatedTime}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Route Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                'Route R001 completed successfully',
                'Route R004 started delivery run',
                'Route R002 encountered traffic delay',
                'Route R005 scheduled for tomorrow',
                'Route R003 optimized for efficiency'
              ].map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Truck className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-900">{activity}</p>
                    <p className="text-xs text-gray-500">
                      {index + 1} hour{index !== 0 ? 's' : ''} ago
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

export default RoutesDashboard;