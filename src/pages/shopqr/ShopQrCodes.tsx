import React, { useEffect, useMemo, useState } from 'react';
import { Printer, Search, Lock } from 'lucide-react';
import qrcode from '../../lib/vendor/qrcode';
import { supabase } from '../../lib/supabase';

interface Shop { id: string; name: string; area: string | null; agency_id: string | null; qr_code: string | null }
interface Agency { id: string; name: string; require_shop_qr: boolean | null }

const qrSvg = (text: string) => {
  const qr = qrcode(0, 'M');
  qr.addData(text);
  qr.make();
  return qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
};

const ShopQrCodes: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyId, setAgencyId] = useState('');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [s, a] = await Promise.all([
        supabase.from('shops').select('id, name, area, agency_id, qr_code').order('name'),
        supabase.from('agencies').select('id, name, require_shop_qr').order('name'),
      ]);
      if (s.error) setMsg(s.error.message);
      setShops((s.data as Shop[]) || []);
      const ags = (a.data as Agency[]) || [];
      setAgencies(ags);
      if (ags.length) setAgencyId(ags[0].id);
    })();
  }, []);

  const agency = agencies.find(a => a.id === agencyId);

  const toggleLock = async () => {
    if (!agency) return;
    const next = !agency.require_shop_qr;
    const { error } = await supabase.from('agencies').update({ require_shop_qr: next }).eq('id', agency.id);
    if (error) return setMsg(error.message);
    setAgencies(agencies.map(a => a.id === agency.id ? { ...a, require_shop_qr: next } : a));
    setMsg(null);
  };

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return shops.filter(s => (!agencyId || s.agency_id === agencyId) &&
      (!q || s.name.toLowerCase().includes(q) || s.qr_code?.toLowerCase().includes(q)));
  }, [shops, agencyId, search]);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-5">
      <div className="no-print flex flex-wrap items-end gap-3 justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Shop QR Codes</h1>
          <p className="text-sm text-slate-500">Print and stick a QR on each shop. Reps can scan it to select the shop.</p>
        </div>
        <button onClick={() => window.print()} className="h-11 px-5 rounded-xl bg-slate-900 text-white font-semibold flex items-center gap-2"><Printer size={18} /> Print</button>
      </div>

      {msg && <div className="no-print rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{msg}</div>}

      <div className="no-print card p-4 grid gap-3 md:grid-cols-3 items-center">
        <select value={agencyId} onChange={e => setAgencyId(e.target.value)} className="h-11 rounded-xl border border-slate-200 px-3 bg-white">
          {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search shop or code" className="w-full h-11 rounded-xl border border-slate-200 pl-9 pr-3" />
        </div>
        <button onClick={toggleLock} disabled={!agency}
          className={`h-11 rounded-xl font-semibold flex items-center justify-center gap-2 border ${agency?.require_shop_qr ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-200 text-slate-700'}`}>
          <Lock size={16} /> {agency?.require_shop_qr ? 'QR required (tap to unlock)' : 'Require QR scan (tap to lock)'}
        </button>
      </div>

      <div className="print-area grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {list.map(s => s.qr_code && (
          <div key={s.id} className="card p-3 text-center break-inside-avoid">
            <div className="mx-auto w-full max-w-[160px]" dangerouslySetInnerHTML={{ __html: qrSvg(s.qr_code) }} />
            <div className="mt-2 font-semibold text-slate-900 text-sm leading-tight">{s.name}</div>
            <div className="text-[11px] font-mono text-slate-500">{s.qr_code}</div>
          </div>
        ))}
        {list.length === 0 && <div className="col-span-full text-center text-slate-500 py-10">No shops found (run step3 SQL if QR codes are missing)</div>}
      </div>
    </div>
  );
};

export default ShopQrCodes;
