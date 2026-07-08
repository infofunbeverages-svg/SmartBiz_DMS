import React, { useState } from 'react';
import { 
  Users, 
  Edit, 
  Trash2, 
  MoreVertical, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { Employee, Department } from '../../../types/hr';

interface EmployeeListProps {
  searchQuery: string;
  departmentFilter: string;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ searchQuery, departmentFilter }) => {
  // Mock employee data
  const employees: Employee[] = [
    {
      id: '1',
      userId: 'user1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      phone: '+94 71 234 5678',
      department: Department.SALES,
      position: 'Sales Manager',
      salary: 85000,
      joinDate: '2023-01-15',
      status: 'ACTIVE',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+94 71 234 5679',
        relationship: 'Spouse'
      },
      documents: [],
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z'
    },
    {
      id: '2',
      userId: 'user2',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      phone: '+94 71 345 6789',
      department: Department.HR,
      position: 'HR Specialist',
      salary: 75000,
      joinDate: '2023-02-20',
      status: 'ACTIVE',
      emergencyContact: {
        name: 'Mike Wilson',
        phone: '+94 71 345 6790',
        relationship: 'Husband'
      },
      documents: [],
      createdAt: '2023-02-20T00:00:00Z',
      updatedAt: '2023-02-20T00:00:00Z'
    },
    {
      id: '3',
      userId: 'user3',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      phone: '+94 71 456 7890',
      department: Department.FINANCE,
      position: 'Accountant',
      salary: 70000,
      joinDate: '2023-03-10',
      status: 'ACTIVE',
      emergencyContact: {
        name: 'Lisa Johnson',
        phone: '+94 71 456 7891',
        relationship: 'Sister'
      },
      documents: [],
      createdAt: '2023-03-10T00:00:00Z',
      updatedAt: '2023-03-10T00:00:00Z'
    },
    {
      id: '4',
      userId: 'user4',
      name: 'Emily Chen',
      email: 'emily.chen@company.com',
      phone: '+94 71 567 8901',
      department: Department.IT,
      position: 'Software Developer',
      salary: 90000,
      joinDate: '2023-04-05',
      status: 'ACTIVE',
      emergencyContact: {
        name: 'David Chen',
        phone: '+94 71 567 8902',
        relationship: 'Father'
      },
      documents: [],
      createdAt: '2023-04-05T00:00:00Z',
      updatedAt: '2023-04-05T00:00:00Z'
    },
    {
      id: '5',
      userId: 'user5',
      name: 'Robert Brown',
      email: 'robert.brown@company.com',
      phone: '+94 71 678 9012',
      department: Department.OPERATIONS,
      position: 'Operations Coordinator',
      salary: 65000,
      joinDate: '2023-05-12',
      status: 'ACTIVE',
      emergencyContact: {
        name: 'Mary Brown',
        phone: '+94 71 678 9013',
        relationship: 'Mother'
      },
      documents: [],
      createdAt: '2023-05-12T00:00:00Z',
      updatedAt: '2023-05-12T00:00:00Z'
    }
  ];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === 'all' || 
      employee.department.toLowerCase() === departmentFilter.toLowerCase();
    
    return matchesSearch && matchesDepartment;
  });

  const getDepartmentColor = (department: Department) => {
    switch (department) {
      case Department.SALES:
        return 'bg-blue-100 text-blue-800';
      case Department.HR:
        return 'bg-purple-100 text-purple-800';
      case Department.FINANCE:
        return 'bg-green-100 text-green-800';
      case Department.IT:
        return 'bg-indigo-100 text-indigo-800';
      case Department.OPERATIONS:
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {employee.email}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {employee.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getDepartmentColor(employee.department)}`}>
                      {employee.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(employee.joinDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeList;