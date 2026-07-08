import React, { useState, useEffect } from 'react';
import { Truck, Plus, Wrench, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { canEdit } from '../../lib/permissions';

interface Vehicle {
  id: string; plate: string; type: string; driver: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
  lastService: string; nextService: string; mileage: number; notes: string;
}

const STATUS_CONFIG = {
  ACTIVE:         { label: 'Active',          color: 'bg-green-100 text-green-700',  icon: <CheckCircle size={14} /> },
  MAINTENANCE:    { label: 'Maintenance',     color: 'bg-amber-100 text-amber-700',  icon: <Wrench size={14} /> },
  OUT_OF_SERVICE: { label: 'Out of Service',  color: 'bg-red-100 text-red-700',      icon: <XCircle size={14} /> },
};

const EMPTY: Partial<Vehicle> = { plate: '', type: 'LORRY', driver: '', status: 'ACTIVE', lastService: '', nextService: '', mileage: 0, notes: '' };

const TransportDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState<Partial<Vehicle>>(EMPTY);
  const [saving, setSaving]     = useState(false);
  const editable = canEdit(user);

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
      if (error) { setVehicles([]); } else {
        setVehicles((data ?? []).map((v: any) => ({
          id: v.id, plate: v.plate_number, type: v.vehicle_type,
          driver: v.assigned_driver ?? '-', status: v.status,
          lastService: v.last_service_date ?? '-', nextService: v.next_service_date ?? '-',
          mileage: v.mileage ?? 0, notes: v.notes ?? '',
        })));
      }
    } catch { setVehicles([]); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!form.plate) { alert('Plate number ලියන්න!'); return; }
    setSaving(true);
    try {
      await supabase.from('vehicles').insert({
        plate_number: form.plate, vehicle_type: form.type ?? 'LORRY',
        assigned_driver: form.driver ?? null, status: form.status ?? 'ACTIVE',
        last_service_date: form.lastService || null, next_service_date: form.nextService || null,
        mileage: form.mileage ?? 0, notes: form.notes ?? null,
      });
      setShowForm(false); setForm(EMPTY); loadVehicles();
    } catch (err) { alert('Error: ' + (err as Error).message); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id: string, status: Vehicle['status']) => {
    await supabase.from('vehicles').update({ status }).eq('id', id);
    loadVehicles();
  };

  const stats = {
    active:       vehicles.filter(v => v.status === 'ACTIVE').length,
    maintenance:  vehicles.filter(v => v.status === 'MAINTENANCE').length,
    outOfService: vehicles.filter(v => v.status === 'OUT_OF_SERVICE').length,
  };
  const overdue = vehicles.filter(v => v.nextService && v.nextService !== '-' && new Date(v.nextService) < new Date());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transport & Fleet</h1>
          <p className="text-sm text-gray-500 mt-1">Vehicle master + maintenance tracking</p>
        </div>
        {editable && <Button onClick={() => setShowForm(true)}><Plus size={16} className="mr-2" />Vehicle Add</Button>}
      </div>

      {overdue.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle size={20} className="text-red-600" />
          <p className="text-sm text-red-700"><strong>{overdue.length}</strong> vehicle(s) service overdue: {overdue.map(v => v.plate).join(', ')}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active',         value: stats.active,       color: 'text-green-600 bg-green-50' },
          { label: 'Maintenance',    value: stats.maintenance,  color: 'text-amber-600 bg-amber-50' },
          { label: 'Out of Service', value: stats.outOfService, color: 'text-red-600 bg-red-50' },
        ].map((s, i) => (
          <Card key={i}><CardContent className="p-4 flex items-center justify-between">
            <div><p className="text-xs text-gray-500">{s.label}</p><p className="text-2xl font-bold">{s.value}</p></div>
            <div className={`p-3 rounded-full ${s.color}`}><Truck size={20} /></div>
          </CardContent></Card>
        ))}
      </div>

      {showForm && (
        <Card className="border-blue-200">
          <CardHeader><CardTitle>New Vehicle</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Plate *', field: 'plate', type: 'text' },
                { label: 'Driver',  field: 'driver', type: 'text' },
                { label: 'Last Service', field: 'lastService', type: 'date' },
                { label: 'Next Service', field: 'nextService', type: 'date' },
                { label: 'Mileage (km)', field: 'mileage', type: 'number' },
              ].map(f => (
                <div key={f.field}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                    value={(form as any)[f.field] ?? ''}
                    onChange={e => setForm(p => ({ ...p, [f.field]: f.type === 'number' ? Number(e.target.value) : e.target.value }))} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  {['LORRY','VAN','PICKUP','MOTORBIKE','THREE_WHEEL'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setForm(EMPTY); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
          ) : !vehicles.length ? (
            <div className="text-center py-12 text-gray-400"><Truck size={40} className="mx-auto mb-2" /><p>Vehicles නැහැ</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>{['Plate','Type','Driver','Status','Next Service','Mileage', editable ? 'Action' : ''].filter(Boolean).map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {vehicles.map(v => {
                    const cfg = STATUS_CONFIG[v.status];
                    const isOverdue = v.nextService && v.nextService !== '-' && new Date(v.nextService) < new Date();
                    return (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">{v.plate}</td>
                        <td className="px-4 py-3 text-gray-500">{v.type}</td>
                        <td className="px-4 py-3">{v.driver}</td>
                        <td className="px-4 py-3"><span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.icon}{cfg.label}</span></td>
                        <td className={`px-4 py-3 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>{v.nextService} {isOverdue && '⚠️'}</td>
                        <td className="px-4 py-3 text-gray-500">{v.mileage.toLocaleString()} km</td>
                        {editable && (
                          <td className="px-4 py-3">
                            <select className="text-xs border border-gray-300 rounded px-2 py-1"
                              value={v.status} onChange={e => updateStatus(v.id, e.target.value as Vehicle['status'])}>
                              <option value="ACTIVE">Active</option>
                              <option value="MAINTENANCE">Maintenance</option>
                              <option value="OUT_OF_SERVICE">Out of Service</option>
                            </select>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TransportDashboard;
