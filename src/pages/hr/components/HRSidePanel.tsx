import React from 'react';
import { Users, Calendar, FileText, Award, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const HRSidePanel: React.FC = () => {
  const location = useLocation();
  
  const menuItems = [
    { icon: Users, label: 'Employees', path: '/hr/employees' },
    { icon: Calendar, label: 'Leave Management', path: '/hr/leave' },
    { icon: FileText, label: 'Documents', path: '/hr/documents' },
    { icon: Award, label: 'Performance', path: '/hr/performance' },
    { icon: Settings, label: 'Settings', path: '/hr/settings' }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <div className="space-y-4">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default HRSidePanel;