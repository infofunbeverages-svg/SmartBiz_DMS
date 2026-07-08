import React from 'react';
import { Shield, Building, Users, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const AdminDashboard: React.FC = () => {
  const adminCards = [
    {
      title: 'Agency Management',
      description: 'Manage distributors and agencies',
      icon: <Building className="h-8 w-8 text-blue-600" />,
      to: '/admin/agencies',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      title: 'User Management',
      description: 'Create and manage users across all agencies',
      icon: <Users className="h-8 w-8 text-green-600" />,
      to: '/admin/users',
      color: 'bg-green-50 hover:bg-green-100'
    },
    {
      title: 'Inventory Master',
      description: 'Manage master product list',
      icon: <Package className="h-8 w-8 text-purple-600" />,
      to: '/admin/master-inventory',
      color: 'bg-purple-50 hover:bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
          <p className="mt-1 text-sm text-gray-500">
            Centralized management for system administration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Super Admin</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {adminCards.map((card, index) => (
          <Link key={index} to={card.to}>
            <Card className={`${card.color} transition-colors cursor-pointer`}>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {card.icon}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/agencies">
              <Button variant="primary" fullWidth>
                <Building className="h-4 w-4 mr-2" />
                Add New Agency
              </Button>
            </Link>
            <Link to="/admin/users">
              <Button variant="primary" fullWidth>
                <Users className="h-4 w-4 mr-2" />
                Create New User
              </Button>
            </Link>
            <Link to="/admin/master-inventory">
              <Button variant="primary" fullWidth>
                <Package className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
