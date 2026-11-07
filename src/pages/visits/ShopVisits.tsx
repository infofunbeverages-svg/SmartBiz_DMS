import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { QrCode, Search, MapPin, CheckCircle2, XCircle, AlertCircle, Store, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/auth';
import { distanceMeters, getPosition } from '../../lib/geo';
import QrScanner from '../../components/QrScanner';

interface Shop {
  id: string; name: string; owner_name: string | null; address: string | null; area: string | null;
  agency_id: string | null; route_id: string | null; company_id: string | null;
  lat: number | null; lng: number | null; qr_code: string | null; outstanding: number | null; credit_limit: number | null;
}
interface Visit { id: string; shop_id: string; status: string; visit_time: string; distance_m: number | null }

const MAX_DISTANCE_M = 100; // visit counts as "at the shop" within this radius
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

const ShopVisits: React.FC = () => {
  const { user } = useAuthStore();
  const [shops, setShops] = useState<Shop[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [routeShopIds, setRouteShopIds] = useState<Set<string> | null>(null);
  const [requireQr, setRequireQr] = useState(false);
  const [filter, setFilter] = useState<'ROUTE' | 'ALL'>('ROUTE');
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [selected, setSelected] = useState<Shop | null>(null);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const [sh, vi, rt] = await Promise.all([
      supabase.from('shops').select('*').order('name'),
      supabase.from('sfa_visits').select('id, shop_id, status, visit_time, distance_m')
        .eq('sales_rep_id', user.id).eq('visit_date', today()).order('visit_time', { ascending: false }),
      supabase.from('routes').select('id').eq('sales_rep_id', user.id).ilike('day_of_week', DAYS[new Date().getDay()]),
    ]);
    if (sh.error) setMsg({ type: 'err', text: sh.error.message });
    setShops((sh.data as Shop[]) || []);
    setVisits((vi.data as Visit[]) || []);
    const routeIds = new Set((rt.data || []).map((r: any) => r.id));
    setRouteShopIds(routeIds.size ? new Set(((sh.data as Shop[]) || []).filter(s => s.route_id && routeIds.has(s.route_id)).map(s => s.id)) : null);

    if (user.agencyId) {
      const { data: ag } = await supabase.from('agencies').select('require_shop_qr').eq('id', user.agencyId).maybeSingle();
      setRequireQr(!!ag?.require_shop_qr);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const visitedIds = useMemo(() => new Set(visits.map(v => v.shop_id)), [visits]);
  const list = useMemo(() => {
    let l = shops;
    if (filter === 'ROUTE' && routeShopIds) l = l.filter(s => routeShopIds.has(s.id));
    const q = search.trim().toLowerCase();
    if (q) l = l.filter(s => [s.name, s.owner_name, s.area, s.address].some(x => x?.toLowerCase().includes(q)));
    return l;
  }, [shops, filter, routeShopIds, search]);

  const pickShop = async (s: Shop) => {
    setSelected(s); setMsg(null); setNotes(''); setPos(null);
    try { const p = await getPosition(); setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); }
    catch (e: any) { setMsg({ type: 'err', text: e.message }); }
  };

  const resolveCode = async (code: string) => {
    setScanning(false);
    const c = code.trim();
    if (!c) return;
    const found = shops.find(s => s.qr_code === c);
    if (found) { pickShop(found); return; }
    const { data } = await supabase.from('shops').select('*').eq('qr_code', c).maybeSingle();
    if (data) pickShop(data as Shop);
    else setMsg({ type: 'err', text: 'This QR code does not match any of your shops' });
  };

  const distance = selected && pos && selected.lat != null && selected.lng != null
    ? Math.round(distanceMeters(pos.lat, pos.lng, selected.lat, selected.lng)) : null;

  const setShopLocation = async () => {
    if (!selected || !pos) return;
    const { error } = await supabase.from('shops').update({ lat: pos.lat, lng: pos.lng }).eq('id', selected.id);
    if (error) return setMsg({ type: 'err', text: error.message });
    setSelected({ ...selected, lat: pos.lat, lng: pos.lng });
    setShops(shops.map(s => s.id === selected.id ? { ...s, lat: pos.lat, lng: pos.lng } : s));
    setMsg({ type: 'ok', text: 'Shop location saved' });
  };

  const saveVisit = async (status: 'PRODUCTIVE' | 'UNPRODUCTIVE') => {
    if (!user || !selected) return;
    if (!pos) return setMsg({ type: 'err', text: 'GPS location is required to record a visit' });
    if (status === 'UNPRODUCTIVE' && !notes.trim()) return setMsg({ type: 'err', text: 'Add a reason for the unproductive visit' });
    setBusy(true);
    const { error } = await supabase.from('sfa_visits').insert({
      company_id: selected.company_id || user.companyId, sales_rep_id: user.id,
      agency_id: selected.agency_id || user.agencyId || null, route_id: selected.route_id,
      shop_id: selected.id, visit_date: today(), visit_time: new Date().toISOString(),
      status, notes: notes.trim() || null, lat: pos.lat, lng: pos.lng, distance_m: distance,
    });
    setBusy(false);
    if (error) return setMsg({ type: 'err', text: error.message });
    setMsg({ type: 'ok', text: `Visit saved as ${status.toLowerCase()}` });
    setSelected(null);
    load();
  };

  const productive = visits.filter(v => v.status === 'PRODUCTIVE').length;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      <div className="rounded-3xl p-5 text-white bg-gradient-to-br from-[#162f55] to-[#0a1730] shadow-lg">
        <div className="text-sm opacity-80">Today's visits</div>
        <div className="mt-1 flex gap-6">
          <div><div className="text-3xl font-extrabold">{visits.length}</div><div className="text-xs opacity-80">Total</div></div>
          <div><div className="text-3xl font-extrabold text-emerald-300">{productive}</div><div className="text-xs opacity-80">Productive</div></div>
          <div><div className="text-3xl font-extrabold text-amber-300">{visits.length - productive}</div><div className="text-xs opacity-80">Unproductive</div></div>
        </div>
      </div>

      {msg && (
        <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {msg.text}
        </div>
      )}

      {selected ? (
        <div className="card p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xl font-bold text-slate-900">{selected.name}</div>
              <div className="text-sm text-slate-500">{[selected.owner_name, selected.address || selected.area].filter(Boolean).join(' · ')}</div>
            </div>
            <button onClick={() => setSelected(null)} className="text-sm text-slate-500 underline">Change</button>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3"><div className="text-slate-500">Outstanding</div><div className="font-bold">Rs. {Number(selected.outstanding || 0).toLocaleString()}</div></div>
            <div className="rounded-xl bg-slate-50 p-3"><div className="text-slate-500">Credit limit</div><div className="font-bold">Rs. {Number(selected.credit_limit || 0).toLocaleString()}</div></div>
          </div>

          <div className={`rounded-xl p-3 text-sm flex items-start gap-2 ${distance == null ? 'bg-slate-50 text-slate-600' : distance <= MAX_DISTANCE_M ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
            <MapPin size={18} className="mt-0.5" />
            <div className="flex-1">
              {!pos ? 'Getting your GPS location…'
                : selected.lat == null ? 'This shop has no saved location yet.'
                : distance! <= MAX_DISTANCE_M ? `You are at the shop (${distance} m away).`
                : `You are ${distance} m away from the shop's saved location.`}
              {pos && selected.lat == null && (
                <button onClick={setShopLocation} className="ml-2 font-semibold underline">Save my current location as the shop location</button>
              )}
            </div>
          </div>

          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Notes / reason (required if unproductive)"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />

          <div className="grid grid-cols-2 gap-3">
            <button disabled={busy} onClick={() => saveVisit('PRODUCTIVE')} className="h-12 rounded-xl bg-emerald-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"><CheckCircle2 size={18} /> Productive</button>
            <button disabled={busy} onClick={() => saveVisit('UNPRODUCTIVE')} className="h-12 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"><XCircle size={18} /> Unproductive</button>
          </div>
          <p className="text-xs text-slate-500">For a productive visit, place the booking from the Bookings page.</p>
        </div>
      ) : (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Select shop</h2>
            {requireQr && <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1"><Lock size={12} /> QR scan required</span>}
          </div>

          {scanning ? <QrScanner onResult={resolveCode} onClose={() => setScanning(false)} /> : (
            <button onClick={() => setScanning(true)} className="w-full h-12 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2"><QrCode size={18} /> Scan shop QR</button>
          )}

          {requireQr ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-500">Your agency requires scanning the shop's QR code. If the camera can't scan, type the code printed under the QR:</p>
              <div className="flex gap-2">
                <input value={manualCode} onChange={e => setManualCode(e.target.value)} placeholder="SB-XXXXXXXXXX"
                  className="flex-1 h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <button onClick={() => resolveCode(manualCode)} className="h-12 px-5 rounded-xl border border-slate-300 font-semibold">Go</button>
              </div>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shop, owner, area"
                  className="w-full h-12 rounded-xl border border-slate-200 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              {routeShopIds && (
                <div className="grid grid-cols-2 gap-2">
                  {(['ROUTE', 'ALL'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`h-10 rounded-xl text-sm font-semibold border ${filter === f ? 'bg-sky-50 border-sky-300 text-blue-700' : 'border-slate-200 text-slate-600'}`}>
                      {f === 'ROUTE' ? "Today's route" : 'All shops'}
                    </button>
                  ))}
                </div>
              )}
              <ul className="divide-y divide-slate-100">
                {list.length === 0 && <li className="py-6 text-center text-sm text-slate-500">No shops found</li>}
                {list.map(s => (
                  <li key={s.id}>
                    <button onClick={() => pickShop(s)} className="w-full text-left py-3 flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-sky-50 text-blue-700 flex items-center justify-center"><Store size={18} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 truncate">{s.name}</div>
                        <div className="text-xs text-slate-500 truncate">{[s.owner_name, s.area].filter(Boolean).join(' · ')}</div>
                      </div>
                      {visitedIds.has(s.id) && <span className="text-xs font-semibold text-emerald-600">Visited</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopVisits;
