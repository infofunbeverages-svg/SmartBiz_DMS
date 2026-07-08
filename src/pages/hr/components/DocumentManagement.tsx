import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2,
  Calendar,
  User,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface Document {
  id: string;
  employeeId: string;
  employeeName: string;
  type: string;
  name: string;
  size: string;
  uploadedAt: string;
  expiryDate?: string;
  status: 'ACTIVE' | 'EXPIRED' | 'EXPIRING_SOON';
  url: string;
}

const DocumentManagement: React.FC = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock documents data
  const documents: Document[] = [
    {
      id: '1',
      employeeId: '1',
      employeeName: 'John Doe',
      type: 'Contract',
      name: 'Employment_Contract_John_Doe.pdf',
      size: '2.4 MB',
      uploadedAt: '2023-01-15T00:00:00Z',
      expiryDate: '2025-01-15',
      status: 'ACTIVE',
      url: '#'
    },
    {
      id: '2',
      employeeId: '1',
      employeeName: 'John Doe',
      type: 'ID Copy',
      name: 'National_ID_John_Doe.pdf',
      size: '1.2 MB',
      uploadedAt: '2023-01-15T00:00:00Z',
      status: 'ACTIVE',
      url: '#'
    },
    {
      id: '3',
      employeeId: '2',
      employeeName: 'Sarah Wilson',
      type: 'Medical Certificate',
      name: 'Medical_Certificate_Sarah_Wilson.pdf',
      size: '0.8 MB',
      uploadedAt: '2023-02-20T00:00:00Z',
      expiryDate: '2024-02-20',
      status: 'EXPIRING_SOON',
      url: '#'
    },
    {
      id: '4',
      employeeId: '3',
      employeeName: 'Mike Johnson',
      type: 'Qualification Certificate',
      name: 'Degree_Certificate_Mike_Johnson.pdf',
      size: '3.1 MB',
      uploadedAt: '2023-03-10T00:00:00Z',
      status: 'ACTIVE',
      url: '#'
    },
    {
      id: '5',
      employeeId: '4',
      employeeName: 'Emily Chen',
      type: 'Visa',
      name: 'Work_Visa_Emily_Chen.pdf',
      size: '1.8 MB',
      uploadedAt: '2023-04-05T00:00:00Z',
      expiryDate: '2023-12-31',
      status: 'EXPIRED',
      url: '#'
    },
    {
      id: '6',
      employeeId: '5',
      employeeName: 'Robert Brown',
      type: 'Training Certificate',
      name: 'Safety_Training_Robert_Brown.pdf',
      size: '1.5 MB',
      uploadedAt: '2023-05-12T00:00:00Z',
      expiryDate: '2024-05-12',
      status: 'ACTIVE',
      url: '#'
    }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesType = selectedType === 'all' || doc.type.toLowerCase().includes(selectedType.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || doc.status.toLowerCase() === selectedStatus.toLowerCase();
    return matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'EXPIRED':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'EXPIRING_SOON':
        return <Clock className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRING_SOON':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const documentStats = {
    total: documents.length,
    active: documents.filter(d => d.status === 'ACTIVE').length,
    expired: documents.filter(d => d.status === 'EXPIRED').length,
    expiringSoon: documents.filter(d => d.status === 'EXPIRING_SOON').length
  };

  const documentTypes = ['Contract', 'ID Copy', 'Medical Certificate', 'Qualification Certificate', 'Visa', 'Training Certificate'];

  return (
    <div className="space-y-6">
      {/* Document Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Documents</p>
                <h3 className="text-xl font-bold text-gray-900">{documentStats.total}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active</p>
                <h3 className="text-xl font-bold text-gray-900">{documentStats.active}</h3>
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
                <p className="text-sm font-medium text-gray-500">Expiring Soon</p>
                <h3 className="text-xl font-bold text-gray-900">{documentStats.expiringSoon}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expired</p>
                <h3 className="text-xl font-bold text-gray-900">{documentStats.expired}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Employee Documents</CardTitle>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                {documentTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
              <Button variant="primary" icon={<Upload />}>
                Upload Document
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
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
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{document.name}</div>
                          <div className="text-sm text-gray-500">{document.size}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{document.employeeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {document.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(document.uploadedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {document.expiryDate ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(document.expiryDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-gray-400">No expiry</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(document.status)}`}>
                        <span className="flex items-center">
                          {getStatusIcon(document.status)}
                          <span className="ml-1">{document.status.replace('_', ' ')}</span>
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900">
                          <Download className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
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

      {/* Document Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-amber-600" />
              Expiring Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.filter(d => d.status === 'EXPIRING_SOON' || d.status === 'EXPIRED').map((document) => (
                <div key={document.id} className="p-4 bg-amber-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{document.name}</p>
                      <p className="text-sm text-gray-600">{document.employeeName} • {document.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-amber-800">
                        {document.expiryDate ? new Date(document.expiryDate).toLocaleDateString() : 'No expiry'}
                      </p>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(document.status)}`}>
                        {document.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Types Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documentTypes.map((type) => {
                const count = documents.filter(d => d.type === type).length;
                const percentage = (count / documents.length) * 100;
                
                return (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{type}</span>
                    <div className="flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentManagement;