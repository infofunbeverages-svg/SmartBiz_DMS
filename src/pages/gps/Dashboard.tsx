import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../lib/auth';
import { useSFAStore } from '../../stores/sfaStore';
import { canViewGPS } from '../../lib/permissions';
import { supabase } from '../../lib/supabase';

interface GPSLog {
  id: string;
  sales_rep_id: string;
  latitude: number;
  longitude: number;
  address: string;
  activity: string;
  recorded_at: string;
}

const GPSDashboard: React.FC = () => {
  const { user }  = useAuthStore();
  const { gpsLogs, addGPSLog, currentDutySession } = useSFAStore();
  const [historyLogs, setHistoryLogs] = useState<GPSLog[]>([]);
  const [tracking, setTracking]       = useState(false);
  const [watchId, setWatchId]         = useState<number | null>(null);
  const [currentPos, setCurrentPos]   = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading]         = useState(false);
  const canView = canViewGPS(user);

  useEffect(() => {
    if (canView) loadHistory();
    return () => { if (watchId !== null) navigator.geolocation.clearWatch(watchId); };
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('gps_tracking_logs')
        .select('*')
        .eq('sales_rep_id', user.id)
        .eq('duty_date', today)
        .order('recorded_at', { ascending: true });
      setHistoryLogs(data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) { alert('GPS supported නැහැ!'); return; }
    const id = navigator.geolocation.watchPosition(
      pos => {
        const { latitude, longitude } = pos.coords;
        setCurrentPos({ lat: latitude, lng: longitude });
        if (user) {
          addGPSLog({
            salesRepId: user.id,
            latitude, longitude,
            address: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
            activity: 'TRAVEL',
            timestamp: new Date().toISOString(),
            accuracy: pos.coords.accuracy,
          });
        }
      },
      err => { console.error('GPS error:', err); alert('GPS error: ' + err.message); },
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 10000 }
    );
    setWatchId(id);
    setTracking(true);
  };

  const stopTracking = () => {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setTracking(false);
  };

  const activityColor: Record<string, string> = {
    DUTY_ON:        'text-green-600 bg-green-100',
    DUTY_OFF:       'text-red-600 bg-red-100',
    CUSTOMER_VISIT: 'text-blue-600 bg-blue-100',
    SALE:           'text-purple-600 bg-purple-100',
    TRAVEL:         'text-gray-600 bg-gray-100',
    DELIVERY:       'text-amber-600 bg-amber-100',
  };

  const allLogs = [...historyLogs, ...gpsLogs.map(l => ({
    id: l.id, sales_rep_id: l.salesRepId,
    latitude: l.latitude, longitude: l.longitude,
    address: l.address, activity: l.activity,
    recorded_at: l.timestamp,
  }))].sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GPS Route Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Rep location tracking සහ route history</p>
        </div>
        <div className="flex gap-2">
          {!tracking
            ? <Button onClick={startTracking} className="bg-green-600 hover:bg-green-700"><Navigation size={16} className="mr-2" />Tracking Start</Button>
            : <Button onClick={stopTracking} className="bg-red-600 hover:bg-red-700"><Navigation size={16} className="mr-2" />Tracking Stop</Button>
          }
        </div>
      </div>

      {/* Current position */}
      {tracking && currentPos && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="animate-pulse"><Navigation size={20} className="text-green-600" /></div>
          <div>
            <p className="text-sm font-medium text-green-800">Live Tracking Active</p>
            <p className="text-xs text-green-600">
              Lat: {currentPos.lat.toFixed(5)}, Lng: {currentPos.lng.toFixed(5)}
            </p>
          </div>
        </div>
      )}

      {/* Map placeholder — Leaflet/Mapbox future phase */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={18} />Route Map</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-gray-100 rounded-lg h-64 flex flex-col items-center justify-center text-gray-400">
            <MapPin size={40} className="mb-2" />
            <p className="text-sm">Map View</p>
            <p className="text-xs mt-1">Phase 3 — Leaflet/Mapbox integration</p>
            {allLogs.length > 0 && (
              <p className="text-xs mt-2 text-blue-500">GPS points {allLogs.length}ක් recorded</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Clock size={18} />Today's Route Log ({allLogs.length})</CardTitle>
            <Button variant="outline" size="sm" onClick={loadHistory}>Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && <div className="flex justify-center py-6"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>}
          {!allLogs.length && !loading && <p className="text-center text-gray-400 py-6">GPS logs නැහැ</p>}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {allLogs.map((log, i) => (
              <div key={log.id || i} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${activityColor[log.activity] ?? 'text-gray-600 bg-gray-100'}`}>
                  {log.activity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 truncate">{log.address}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(log.recorded_at).toLocaleTimeString('si-LK')}
                    {' • '}{log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GPSDashboard;
