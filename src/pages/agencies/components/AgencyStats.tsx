import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Building2, TrendingUp, Users } from 'lucide-react';
import { useAgencyStore } from '../../../stores/agencyStore';
import { supabase } from '../../../lib/supabase';

const AgencyStats: React.FC = () => {
  const { agencyStats } = useAgencyStore();
  const [agencies, setAgencies] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAgencies();
  }, []);

  const loadAgencies = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agencies:', error);
        setAgencies([]);
      } else {
        setAgencies(data || []);
        // Generate recent activities from real data
        if (data && data.length > 0) {
          const activities = data.slice(0, 5).map((agency, index) => 
            `New agency "${agency.name}" added to the system`
          );
          setRecentActivities(activities);
        } else {
          setRecentActivities([]);
        }
      }
    } catch (err) {
      console.error('Error loading agencies:', err);
      setAgencies([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Monthly Sales</p>
                  <p className="text-xs text-gray-500">vs last month</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  Rs. {agencyStats?.totalSales.toLocaleString() ?? 0}
                </p>
                <p className="text-sm text-green-600">+12.5%</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Active Sales Reps</p>
                  <p className="text-xs text-gray-500">total representatives</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">24</p>
                <p className="text-sm text-green-600">+2 this month</p>
              </div>
            </div>
          </div>

          {agencies.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Active Agencies</h4>
              <div className="space-y-3">
                {agencies.slice(0, 5).map((agency, index) => (
                  <div key={agency.id} className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-900">
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">{agency.name}</p>
                      <p className="text-xs text-gray-500">{agency.address || agency.location || 'No location'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-gray-500">Loading activities...</div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No recent activities</div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-blue-600" />
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgencyStats;