import React, { useState } from 'react';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  Map
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { useSalesStore } from '../../../stores/salesStore';

const SalesTerritories: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState('all');
  
  const { getFilteredTerritories } = useSalesStore();
  const territories = getFilteredTerritories();

  const filteredTerritories = territories.filter(territory => {
    if (selectedStatus === 'all') return true;
    return selectedStatus === 'active' ? territory.isActive : !territory.isActive;
  });

  const activeTerritories = territories.filter(t => t.isActive).length;
  const totalSalesReps = territories.reduce((sum, t) => sum + t.salesRepIds.length, 0);
  const totalRoutes = territories.reduce((sum, t) => sum + t.routes.length, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Map className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Territories</p>
                <h3 className="text-xl font-bold text-gray-900">{territories.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Territories</p>
                <h3 className="text-xl font-bold text-gray-900">{activeTerritories}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Sales Reps</p>
                <h3 className="text-xl font-bold text-gray-900">{totalSalesReps}</h3>
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
                <p className="text-sm font-medium text-gray-500">Total Routes</p>
                <h3 className="text-xl font-bold text-gray-900">{totalRoutes}</h3>
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Territories</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <Button variant="primary" icon={<Plus />}>
          Add Territory
        </Button>
      </div>

      {/* Territories List */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Territories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTerritories.map((territory) => (
              <div key={territory.id} className="p-6 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded bg-blue-100 flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-lg font-medium text-gray-900">{territory.name}</h4>
                      <p className="text-sm text-gray-500">
                        {territory.districts.length} districts • {territory.routes.length} routes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      territory.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {territory.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Districts */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      Districts
                    </h5>
                    <div className="space-y-1">
                      {territory.districts.map((district, index) => (
                        <span key={index} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded mr-1 mb-1">
                          {district}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Routes */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Map className="h-4 w-4 mr-2" />
                      Routes
                    </h5>
                    <div className="space-y-1">
                      {territory.routes.map((route, index) => (
                        <span key={index} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded mr-1 mb-1">
                          {route}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Sales Reps */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      Sales Representatives ({territory.salesRepIds.length})
                    </h5>
                    <div className="space-y-2">
                      {territory.salesRepIds.map((repId, index) => (
                        <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                          <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                          <span className="ml-2 text-sm text-gray-700">Sales Rep {repId}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Territory Performance</h5>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-lg font-bold text-gray-900">Rs. {(Math.random() * 500000 + 200000).toLocaleString()}</p>
                      <p className="text-xs text-gray-500">Monthly Sales</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-lg font-bold text-gray-900">{Math.floor(Math.random() * 50 + 20)}</p>
                      <p className="text-xs text-gray-500">Active Customers</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-lg font-bold text-gray-900">{Math.floor(Math.random() * 30 + 70)}%</p>
                      <p className="text-xs text-gray-500">Target Achievement</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-lg font-bold text-gray-900">{Math.floor(Math.random() * 100 + 50)}</p>
                      <p className="text-xs text-gray-500">Orders This Month</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesTerritories;