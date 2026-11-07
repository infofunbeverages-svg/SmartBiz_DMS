import React, { useEffect, useMemo, useState } from 'react';
import { QrCode, Search, Store, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../lib/auth';
import QrScanner from './QrScanner';

export interface PickerShop {
  id: string; name: string; owner_name: string | null; address: string | null; area: string | null;
  agency_id: string | null; route_id: string | null; company_id: string | null;
  lat: number | null; lng: number | null; qr_code: string | null;
  outstanding: number | null; credit_limit: number | null;
}

interface Props { onSelect: (shop: PickerShop) => void }

/** Pick a shop from the list, or by scanning its QR. If the agency requires QR, the list is hidden. */
const ShopPicker: React.FC<Props> = ({ onSelect }) => {
  const { user } = useAuthStore();
  const [shops, setShops] = useState<PickerShop[]>([]);
  const [requireQr, setRequireQr] = useState(false);
  const [search, setSearch] = useState('');
  const [scanning, setScanning] = useState(false);
  const [manual, setManual] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('shops').select('*').order('name');
      if (error) setErr(error.message);
      setShops((data as PickerShop[]) || []);
      if (user?.agencyId) {
        const { data: ag } = await supabase.from('agencies').select('require_shop_qr').eq('id', user.agencyId).maybeSingle();
        setRequireQr(!!ag?.require_shop_qr);
      }
    })();
  }, [user?.agencyId]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? shops.filter(s => [s.name, s.owner_name, s.area, s.address].some(x => x?.toLowerCase().includes(q))) : shops;
  }, [shops, search]);

  const resolve = async (code: string) => {
    setScanning(false); setErr('');
    const c = code.trim();
    if (!c) return;
    const found = shops.find(s => s.qr_code === c);
    if (found) return onSelect(found);
    const { data } = await supabase.from('shops').select('*').eq('qr_code', c).maybeSingle();
    if (data) onSelect(data as PickerShop); else setErr('This QR code does not match any of your shops');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Select shop *</span>
        {requireQr && <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1"><Lock size={12} /> QR scan required</span>}
      </div>

      {scanning ? <QrScanner onResult={resolve} onClose={() => setScanning(false)} /> : (
        <button type="button" onClick={() => setScanning(true)} className="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2"><QrCode size={18} /> Scan shop QR</button>
      )}

      {err && <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2">{err}</div>}

      {requireQr ? (
        <div className="flex gap-2">
          <input value={manual} onChange={e => setManual(e.target.value)} placeholder="Type code under the QR (SB-XXXXXXXXXX)"
            className="flex-1 h-11 rounded-xl border border-slate-200 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          <button type="button" onClick={() => resolve(manual)} className="h-11 px-4 rounded-xl border border-slate-300 font-semibold">Go</button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shop, owner, area"
              className="w-full h-11 rounded-xl border border-slate-200 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
          <ul className="max-h-64 overflow-auto divide-y divide-slate-100 rounded-xl border border-slate-100">
            {list.length === 0 && <li className="py-6 text-center text-sm text-slate-500">No shops found</li>}
            {list.map(s => (
              <li key={s.id}>
                <button type="button" onClick={() => onSelect(s)} className="w-full text-left px-3 py-2.5 flex items-center gap-3 hover:bg-slate-50">
                  <div className="h-9 w-9 rounded-xl bg-sky-50 text-blue-700 flex items-center justify-center"><Store size={16} /></div>
                  <div className="min-w-0">
                    <div className="font-semibold text-slate-900 truncate">{s.name}</div>
                    <div className="text-xs text-slate-500 truncate">{[s.owner_name, s.area].filter(Boolean).join(' · ')}</div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default ShopPicker;
