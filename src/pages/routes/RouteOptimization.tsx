import React, { useState, useEffect } from 'react';
import { Map, Plus, Trash2, ArrowUp, ArrowDown, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface Shop { id: string; name: string; address: string; route: string; }
interface RouteStop { shopId: string; shopName: string; order: number; estimatedTime?: string; notes?: string; }
interface RouteEntry { id?: string; name: string; repId: string; repName: string; date: string; stops: RouteStop[]; }

const RouteOptimization: React.FC = () => {
  const { user } = useAuthStore();
  const [shops, setShops]       = useState<Shop[]>([]);
  const [routes, setRoutes]     = useState<RouteEntry[]>([]);
  const [form, setForm]         = useState<RouteEntry>({ name: '', repId: '', repName: '', date: new Date().toISOString().split('T')[0], stops: [] });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [reps, setReps]         = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user?.agencyId) return;
    try {
      // Load shops
      const { data: shopData } = await supabase.from('shops').select('id, name, address, route').eq('agency_id', user.agencyId);
      setShops(shopData ?? []);

      // Load reps
      const { data: repData } = await supabase
        .from('agency_users')
        .select('user_id, profiles(full_name)')
        .eq('agency_id', user.agencyId)
        .eq('role', 'SALES_REP');
      setReps((repData ?? []).map((r: any) => ({ id: r.user_id, name: r.profiles?.full_name ?? 'Rep' })));

      // Load existing routes (localStorage fallback until routes table created)
      const saved = localStorage.getItem(`routes_${user.agencyId}`);
      if (saved) setRoutes(JSON.parse(saved));
    } catch (err) { console.error(err); }
  };

  const addStop = (shop: Shop) => {
    if (form.stops.find(s => s.shopId === shop.id)) return;
    setForm(prev => ({
      ...prev,
      stops: [...prev.stops, { shopId: shop.id, shopName: shop.name, order: prev.stops.length + 1 }],
    }));
  };

  const removeStop = (shopId: string) => {
    setForm(prev => ({
      ...prev,
      stops: prev.stops.filter(s => s.shopId !== shopId).map((s, i) => ({ ...s, order: i + 1 })),
    }));
  };

  const moveStop = (index: number, dir: -1 | 1) => {
    const newStops = [...form.stops];
    const swapIndex = index + dir;
    if (swapIndex < 0 || swapIndex >= newStops.length) return;
    [newStops[index], newStops[swapIndex]] = [newStops[swapIndex], newStops[index]];
    setForm(prev => ({ ...prev, stops: newStops.map((s, i) => ({ ...s, order: i + 1 })) }));
  };

  const handleSave = () => {
    if (!form.name || !form.stops.length) { alert('Route name + stops add කරන්න!'); return; }
    setSaving(true);
    const newRoute = { ...form, id: Date.now().toString() };
    const updated  = [...routes, newRoute];
    setRoutes(updated);
    if (user?.agencyId) localStorage.setItem(`routes_${user.agencyId}`, JSON.stringify(updated));
    setForm({ name: '', repId: '', repName: '', date: new Date().toISOString().split('T')[0], stops: [] });
    setShowForm(false);
    setSaving(false);
  };

  const deleteRoute = (id: string) => {
    const updated = routes.filter(r => r.id !== id);
    setRoutes(updated);
    if (user?.agencyId) localStorage.setItem(`routes_${user.agencyId}`, JSON.stringify(updated));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Map size={22} />Route Optimization
          </h2>
          <p className="text-sm text-gray-500">Rep ලාට route plan assign කරන්න — stops reorder කරලා optimize කරන්න</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}><Plus size={16} className="mr-2" />New Route</Button>
      </div>

      {/* New route form */}
      {showForm && (
        <Card className="border-blue-200">
          <CardHeader><CardTitle>New Route Plan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Route Name *</label>
                <input className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="eg: Kandy North Route" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Assign to Rep</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  value={form.repId} onChange={e => {
                    const rep = reps.find(r => r.id === e.target.value);
                    setForm(p => ({ ...p, repId: e.target.value, repName: rep?.name ?? '' }));
                  }}>
                  <option value="">-- Select Rep --</option>
                  {reps.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shop list */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Shops (click to add stop)</p>
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {!shops.length && <p className="text-center text-xs text-gray-400 py-4">Shops නැහැ</p>}
                  {shops.map(shop => (
                    <button key={shop.id}
                      className={`w-full text-left px-3 py-2 text-sm border-b border-gray-100 hover:bg-blue-50 transition-colors ${form.stops.find(s => s.shopId === shop.id) ? 'bg-blue-50 text-blue-700' : ''}`}
                      onClick={() => addStop(shop)}>
                      <span className="font-medium">{shop.name}</span>
                      <span className="text-xs text-gray-400 ml-2">{shop.route}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected stops */}
              <div>
                <p className="text-xs font-medium text-gray-600 mb-2">Route Stops ({form.stops.length}) — Drag to reorder</p>
                <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {!form.stops.length && <p className="text-center text-xs text-gray-400 py-4">Stops add කරන්න</p>}
                  {form.stops.map((stop, i) => (
                    <div key={stop.shopId} className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-white">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <span className="flex-1 text-sm truncate">{stop.shopName}</span>
                      <div className="flex gap-1">
                        <button onClick={() => moveStop(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowUp size={12} /></button>
                        <button onClick={() => moveStop(i, 1)} disabled={i === form.stops.length - 1} className="text-gray-400 hover:text-gray-600 disabled:opacity-30"><ArrowDown size={12} /></button>
                        <button onClick={() => removeStop(stop.shopId)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving}><Save size={14} className="mr-1" />{saving ? 'Saving...' : 'Route Save කරන්න'}</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing routes */}
      {!routes.length && !showForm && (
        <div className="text-center py-12 text-gray-400">
          <Map size={40} className="mx-auto mb-2" />
          <p>Routes නැහැ — new route add කරන්න</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {routes.map(route => (
          <Card key={route.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{route.name}</CardTitle>
                <button onClick={() => deleteRoute(route.id!)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>📅 {route.date}</span>
                {route.repName && <span>👤 {route.repName}</span>}
                <span>🏪 {route.stops.length} stops</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {route.stops.map((stop, i) => (
                  <div key={stop.shopId} className="flex items-center gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center flex-shrink-0">{i + 1}</span>
                    <span className="text-gray-700">{stop.shopName}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RouteOptimization;
