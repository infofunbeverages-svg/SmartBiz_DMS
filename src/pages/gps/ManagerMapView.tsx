import React, { useState, useEffect } from 'react';
import { Navigation, User, Clock, MapPin, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface RepLocation {
  sales_rep_id: string;
  rep_name: string;
  latitude: number;
  longitude: number;
  activity: string;
  recorded_at: string;
  address: string;
}

const ManagerMapView: React.FC = () => {
  const { user } = useAuthStore();
  const [repLocations, setRepLocations] = useState<RepLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRep, setSelectedRep] = useState<string | null>(null);

  useEffect(() => {
    loadRepLocations();

    const channel = supabase
      .channel('manager-gps-view')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'gps_tracking_logs',
      }, () => { loadRepLocations(); })
      .subscribe();

    const interval = setInterval(loadRepLocations, 30000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const loadRepLocations = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('gps_tracking_logs')
        .select('sales_rep_id, latitude, longitude, activity, recorded_at, address, profiles(full_name)')
        .eq('duty_date', today)
        .order('recorded_at', { ascending: false });

      if (error) throw error;

      const latestByRep = new Map<string, RepLocation>();
      (data ?? []).forEach((log: any) => {
        if (!latestByRep.has(log.sales_rep_id)) {
          latestByRep.set(log.sales_rep_id, {
            sales_rep_id: log.sales_rep_id,
            rep_name:     log.profiles?.full_name ?? 'Unknown Rep',
            latitude:     log.latitude,
            longitude:    log.longitude,
            activity:     log.activity,
            recorded_at:  log.recorded_at,
            address:      log.address,
          });
        }
      });
      setRepLocations([...latestByRep.values()]);
    } catch (err) {
      console.error('Manager GPS load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const activityColor: Record<string, string> = {
    DUTY_ON:        'bg-green-100 text-green-700',
    DUTY_OFF:       'bg-red-100 text-red-700',
    CUSTOMER_VISIT: 'bg-blue-100 text-blue-700',
    SALE:           'bg-purple-100 text-purple-700',
    TRAVEL:         'bg-gray-100 text-gray-700',
    DELIVERY:       'bg-amber-100 text-amber-700',
  };

  const minutesAgo = (ts: string) => {
    const mins = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
    if (mins < 1) return 'දැන්';
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Navigation size={22} className="text-blue-600" />
            Live Rep Locations
          </h2>
          <p className="text-sm text-gray-500 mt-1">Today — Field reps ලාගේ live GPS locations</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadRepLocations}>
          <Activity size={14} className="mr-1" />Refresh
        </Button>
      </div>

      {/* Map placeholder */}
      <Card>
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-72 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="absolute border-gray-400 border-dashed"
                  style={{ left: `${i * 14}%`, top: 0, bottom: 0, borderLeftWidth: 1 }} />
              ))}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute border-gray-400 border-dashed"
                  style={{ top: `${i * 16}%`, left: 0, right: 0, borderTopWidth: 1 }} />
              ))}
            </div>

            {repLocations.map((rep, i) => (
              <button key={rep.sales_rep_id}
                onClick={() => setSelectedRep(rep.sales_rep_id === selectedRep ? null : rep.sales_rep_id)}
                className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-transform hover:scale-110 ${selectedRep === rep.sales_rep_id ? 'ring-4 ring-blue-400 scale-110' : ''}`}
                style={{
                  left: `${20 + (i * 15) % 60}%`,
                  top:  `${25 + (i * 20) % 50}%`,
                  backgroundColor: ['#3B82F6','#10B981','#8B5CF6','#F59E0B','#EF4444'][i % 5],
                }}
                title={rep.rep_name}>
                {rep.rep_name.charAt(0).toUpperCase()}
              </button>
            ))}

            {repLocations.length === 0 && (
              <div className="text-center z-10">
                <MapPin size={36} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Reps duty ේ නැහැ</p>
              </div>
            )}

            <div className="absolute bottom-2 right-3 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded">
              Leaflet/Mapbox — Phase 3 integration
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rep list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {loading && (
          <div className="col-span-2 flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          </div>
        )}
        {!loading && !repLocations.length && (
          <div className="col-span-2 text-center py-8 text-gray-400">
            <User size={40} className="mx-auto mb-2" />
            <p>Field reps GPS data නැහැ</p>
          </div>
        )}
        {repLocations.map(rep => (
          <Card key={rep.sales_rep_id}
            className={`cursor-pointer transition-all ${selectedRep === rep.sales_rep_id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setSelectedRep(rep.sales_rep_id === selectedRep ? null : rep.sales_rep_id)}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {rep.rep_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">{rep.rep_name}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${activityColor[rep.activity] ?? 'bg-gray-100 text-gray-600'}`}>
                      {rep.activity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    <MapPin size={10} className="inline mr-1" />{rep.address}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    <Clock size={10} className="inline mr-1" />{minutesAgo(rep.recorded_at)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManagerMapView;
