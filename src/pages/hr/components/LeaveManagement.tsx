import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  User,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import { LeaveRequest, LeaveStatus } from '../../../types/hr';

const LeaveManagement: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Mock leave requests data
  const leaveRequests: LeaveRequest[] = [
    {
      id: '1',
      employeeId: '1',
      employeeName: 'John Doe',
      type: 'Annual Leave',
      startDate: '2024-02-15',
      endDate: '2024-02-20',
      days: 6,
      reason: 'Family vacation',
      status: LeaveStatus.PENDING,
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-20T00:00:00Z'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Sarah Wilson',
      type: 'Sick Leave',
      startDate: '2024-01-25',
      endDate: '2024-01-26',
      days: 2,
      reason: 'Medical appointment',
      status: LeaveStatus.APPROVED,
      approvedBy: 'HR Manager',
      approvedAt: '2024-01-22T00:00:00Z',
      createdAt: '2024-01-21T00:00:00Z',
      updatedAt: '2024-01-22T00:00:00Z'
    },
    {
      id: '3',
      employeeId: '3',
      employeeName: 'Mike Johnson',
      type: 'Personal Leave',
      startDate: '2024-02-01',
      endDate: '2024-02-01',
      days: 1,
      reason: 'Personal matters',
      status: LeaveStatus.REJECTED,
      approvedBy: 'HR Manager',
      approvedAt: '2024-01-28T00:00:00Z',
      createdAt: '2024-01-27T00:00:00Z',
      updatedAt: '2024-01-28T00:00:00Z'
    },
    {
      id: '4',
      employeeId: '4',
      employeeName: 'Emily Chen',
      type: 'Annual Leave',
      startDate: '2024-03-10',
      endDate: '2024-03-15',
      days: 6,
      reason: 'Wedding ceremony',
      status: LeaveStatus.PENDING,
      createdAt: '2024-01-30T00:00:00Z',
      updatedAt: '2024-01-30T00:00:00Z'
    },
    {
      id: '5',
      employeeId: '5',
      employeeName: 'Robert Brown',
      type: 'Sick Leave',
      startDate: '2024-01-22',
      endDate: '2024-01-24',
      days: 3,
      reason: 'Flu symptoms',
      status: LeaveStatus.APPROVED,
      approvedBy: 'HR Manager',
      approvedAt: '2024-01-21T00:00:00Z',
      createdAt: '2024-01-20T00:00:00Z',
      updatedAt: '2024-01-21T00:00:00Z'
    }
  ];

  const filteredRequests = leaveRequests.filter(request => {
    if (selectedStatus === 'all') return true;
    return request.status.toLowerCase() === selectedStatus.toLowerCase();
  });

  const getStatusIcon = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case LeaveStatus.REJECTED:
        return <XCircle className="h-4 w-4 text-red-500" />;
      case LeaveStatus.CANCELLED:
        return <XCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusColor = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case LeaveStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case LeaveStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-amber-100 text-amber-800';
    }
  };

  const handleApprove = (requestId: string) => {
    // Handle approval logic
    console.log('Approving request:', requestId);
  };

  const handleReject = (requestId: string) => {
    // Handle rejection logic
    console.log('Rejecting request:', requestId);
  };

  const leaveStats = {
    pending: leaveRequests.filter(r => r.status === LeaveStatus.PENDING).length,
    approved: leaveRequests.filter(r => r.status === LeaveStatus.APPROVED).length,
    rejected: leaveRequests.filter(r => r.status === LeaveStatus.REJECTED).length,
    total: leaveRequests.length
  };

  return (
    <div className="space-y-6">
      {/* Leave Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                <h3 className="text-xl font-bold text-gray-900">{leaveStats.pending}</h3>
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
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <h3 className="text-xl font-bold text-gray-900">{leaveStats.approved}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <h3 className="text-xl font-bold text-gray-900">{leaveStats.rejected}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Requests</p>
                <h3 className="text-xl font-bold text-gray-900">{leaveStats.total}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leave Requests</CardTitle>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div key={request.id} className="p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{request.employeeName}</h4>
                      <p className="text-sm text-gray-500">{request.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">{request.days} day{request.days > 1 ? 's' : ''}</p>
                    </div>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      <span className="flex items-center">
                        {getStatusIcon(request.status)}
                        <span className="ml-1">{request.status}</span>
                      </span>
                    </span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="h-4 w-4 mr-1" />
                    <span>Reason: {request.reason}</span>
                  </div>
                </div>

                {request.status === LeaveStatus.PENDING && (
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="success"
                      size="sm"
                      icon={<CheckCircle className="h-4 w-4" />}
                      onClick={() => handleApprove(request.id)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<XCircle className="h-4 w-4" />}
                      onClick={() => handleReject(request.id)}
                    >
                      Reject
                    </Button>
                  </div>
                )}

                {(request.status === LeaveStatus.APPROVED || request.status === LeaveStatus.REJECTED) && request.approvedBy && (
                  <div className="mt-3 text-xs text-gray-500">
                    {request.status === LeaveStatus.APPROVED ? 'Approved' : 'Rejected'} by {request.approvedBy} on {new Date(request.approvedAt!).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveManagement;