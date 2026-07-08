import React, { useState } from 'react';
import { 
  Award, 
  TrendingUp, 
  Target, 
  Star,
  Calendar,
  User,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  reviewPeriod: string;
  overallRating: number;
  goals: {
    achieved: number;
    total: number;
  };
  competencies: {
    technical: number;
    communication: number;
    leadership: number;
    teamwork: number;
  };
  status: 'DRAFT' | 'COMPLETED' | 'PENDING_APPROVAL';
  reviewDate: string;
  nextReviewDate: string;
}

const PerformanceTracking: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Mock performance data
  const performanceReviews: PerformanceReview[] = [
    {
      id: '1',
      employeeId: '1',
      employeeName: 'John Doe',
      department: 'Sales',
      reviewPeriod: 'Q4 2023',
      overallRating: 4.2,
      goals: { achieved: 8, total: 10 },
      competencies: {
        technical: 4.0,
        communication: 4.5,
        leadership: 4.0,
        teamwork: 4.3
      },
      status: 'COMPLETED',
      reviewDate: '2024-01-15',
      nextReviewDate: '2024-04-15'
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Sarah Wilson',
      department: 'HR',
      reviewPeriod: 'Q4 2023',
      overallRating: 4.6,
      goals: { achieved: 9, total: 10 },
      competencies: {
        technical: 4.5,
        communication: 5.0,
        leadership: 4.5,
        teamwork: 4.8
      },
      status: 'COMPLETED',
      reviewDate: '2024-01-12',
      nextReviewDate: '2024-04-12'
    },
    {
      id: '3',
      employeeId: '3',
      employeeName: 'Mike Johnson',
      department: 'Finance',
      reviewPeriod: 'Q4 2023',
      overallRating: 3.8,
      goals: { achieved: 7, total: 10 },
      competencies: {
        technical: 4.2,
        communication: 3.5,
        leadership: 3.5,
        teamwork: 4.0
      },
      status: 'PENDING_APPROVAL',
      reviewDate: '2024-01-18',
      nextReviewDate: '2024-04-18'
    },
    {
      id: '4',
      employeeId: '4',
      employeeName: 'Emily Chen',
      department: 'IT',
      reviewPeriod: 'Q4 2023',
      overallRating: 4.8,
      goals: { achieved: 10, total: 10 },
      competencies: {
        technical: 5.0,
        communication: 4.5,
        leadership: 4.8,
        teamwork: 4.9
      },
      status: 'COMPLETED',
      reviewDate: '2024-01-10',
      nextReviewDate: '2024-04-10'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING_APPROVAL':
        return 'bg-amber-100 text-amber-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-amber-600';
    return 'text-red-600';
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="h-4 w-4 fill-current text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" className="h-4 w-4 fill-current text-yellow-200" />);
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />);
    }

    return stars;
  };

  const performanceStats = {
    averageRating: (performanceReviews.reduce((sum, review) => sum + review.overallRating, 0) / performanceReviews.length).toFixed(1),
    completedReviews: performanceReviews.filter(r => r.status === 'COMPLETED').length,
    pendingReviews: performanceReviews.filter(r => r.status === 'PENDING_APPROVAL').length,
    topPerformers: performanceReviews.filter(r => r.overallRating >= 4.5).length
  };

  return (
    <div className="space-y-6">
      {/* Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Average Rating</p>
                <h3 className="text-xl font-bold text-gray-900">{performanceStats.averageRating}/5.0</h3>
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
                <p className="text-sm font-medium text-gray-500">Completed Reviews</p>
                <h3 className="text-xl font-bold text-gray-900">{performanceStats.completedReviews}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Reviews</p>
                <h3 className="text-xl font-bold text-gray-900">{performanceStats.pendingReviews}</h3>
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
                <p className="text-sm font-medium text-gray-500">Top Performers</p>
                <h3 className="text-xl font-bold text-gray-900">{performanceStats.topPerformers}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Reviews */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Performance Reviews</CardTitle>
            <div className="flex gap-2">
              <select
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="current">Current Quarter</option>
                <option value="previous">Previous Quarter</option>
                <option value="annual">Annual Reviews</option>
              </select>
              <Button variant="primary">
                New Review
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performanceReviews.map((review) => (
              <div key={review.id} className="p-6 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{review.employeeName}</h4>
                      <p className="text-sm text-gray-500">{review.department} • {review.reviewPeriod}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="flex items-center">
                        {renderStars(review.overallRating)}
                        <span className={`ml-2 text-lg font-bold ${getRatingColor(review.overallRating)}`}>
                          {review.overallRating}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">Overall Rating</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(review.status)}`}>
                      {review.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Goals Achievement */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Target className="h-4 w-4 mr-2" />
                      Goals Achievement
                    </h5>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-2 bg-green-600 rounded-full"
                            style={{ width: `${(review.goals.achieved / review.goals.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {review.goals.achieved}/{review.goals.total}
                      </span>
                    </div>
                  </div>

                  {/* Competencies */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      <Award className="h-4 w-4 mr-2" />
                      Key Competencies
                    </h5>
                    <div className="space-y-2">
                      {Object.entries(review.competencies).map(([competency, rating]) => (
                        <div key={competency} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 capitalize">{competency}</span>
                          <div className="flex items-center">
                            {renderStars(rating)}
                            <span className="ml-2 text-sm font-medium text-gray-900">{rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>Review Date: {new Date(review.reviewDate).toLocaleDateString()}</span>
                  <span>Next Review: {new Date(review.nextReviewDate).toLocaleDateString()}</span>
                </div>

                {review.status === 'PENDING_APPROVAL' && (
                  <div className="mt-4 flex space-x-2">
                    <Button variant="primary" size="sm">
                      Approve Review
                    </Button>
                    <Button variant="secondary" size="sm">
                      Request Changes
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { department: 'IT', rating: 4.8, employees: 12 },
                { department: 'HR', rating: 4.6, employees: 8 },
                { department: 'Sales', rating: 4.2, employees: 25 },
                { department: 'Finance', rating: 4.1, employees: 15 },
                { department: 'Operations', rating: 3.9, employees: 20 }
              ].map((dept, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{dept.department}</p>
                    <p className="text-xs text-gray-500">{dept.employees} employees</p>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center mr-3">
                      {renderStars(dept.rating)}
                    </div>
                    <span className={`text-sm font-medium ${getRatingColor(dept.rating)}`}>
                      {dept.rating}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceReviews.slice(0, 5).map((review) => (
                <div key={review.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{review.employeeName}</p>
                      <p className="text-xs text-gray-500">{review.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(review.nextReviewDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">Next review</p>
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

export default PerformanceTracking;