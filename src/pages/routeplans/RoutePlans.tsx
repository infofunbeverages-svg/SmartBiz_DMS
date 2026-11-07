import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Lock, CalendarDays, Check, X, Send, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/auth';
import { UserRole } from '../../types/user';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const PLANNERS: string[] = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_MANAGER, UserRole.AREA_SALES_MANAGER, UserRole.REGIONAL_MANAGER, UserRole.AGENCY_OWNER];

interface Plan { id: string; sales_rep_id: string; period_start: string; period_end: string; route_id: string | null; day_of_week: string; status: string }
interface RouteRow { id: string; name: string; agency_id: string | null }
interface Rep { id: string; full_name: string | null; agency_id: string | null }
interface Req { id: string; route_plan_id: string; requested_by: string; reason: string; status: string; proposed_route_id: string | null; proposed_day_of_week: string | null; created_at: string }

const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const endFor = (start: string, kind: '15' | 'MONTH') => {
  const s = new Date(start + 'T00:00:00');
  if (kind === '15') { s.setDate(s.getDate() + 14); return fmt(s); }
  s.setMonth(s.getMonth() + 1); s.setDate(s.getDate() - 1); return fmt(s);
};
const sameDay = (a: string, b: string) => a.toUpperCase() === b.toUpperCase();

const RoutePlans: React.FC = () => {
  const { user } = useAuthStore();
  const isPlanner = !!user && PLANNERS.includes(user.role);
  const [tab, setTab] = useState<'plans' | 'builder' | 'requests' | 'mine'>(isPlanner ? 'plans' : 'mine');
  const [plans, setPlans] = useState<Plan[]>([]);
  const [routes, setRoutes] = useState<RouteRow[]>([]);
  const [reps, setReps] = useState<Rep[]>([]);
  const [reqs, setReqs] = useState<Req[]>([]);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // builder
  const [repId, setRepId] = useState('');
  const [kind, setKind] = useState<'15' | 'MONTH'>('15');
  const [start, setStart] = useState(fmt(new Date()));
  const [dayRoute, setDayRoute] = useState<Record<string, string>>({});

  // change request modal
  const [reqPlan, setReqPlan] = useState<Plan | null>(null);
  const [reqReason, setReqReason] = useState('');
  const [reqRoute, setReqRoute] = useState('');
  const [reqDay, setReqDay] = useState('');

  const flash = (type: 'ok' | 'err', text: string) => setMsg({ type, text });

  const load = useCallback(async () => {
    const [p, r, pr, q] = await Promise.all([
      supabase.from('route_plans').select('*').order('period_start', { ascending: false }),
      supabase.from('routes').select('id, name, agency_id').order('name'),
      supabase.from('profiles').select('id, full_name, agency_id, role'),
      supabase.from('route_change_requests').select('*').order('created_at', { ascending: false }),
    ]);
    const firstErr = p.error || r.error || q.error;
    if (firstErr) flash('err', firstErr.message);
    setPlans((p.data as Plan[]) || []);
    setRoutes((r.data as RouteRow[]) || []);
    setReps(((pr.data as any[]) || []).filter(x => x.role === 'SALES_REP') as Rep[]);
    setReqs((q.data as Req[]) || []);
    // names for anyone referenced (managers, etc.)
  }, []);

  useEffect(() => { load(); }, [load]);

  const routeName = (id: string | null) => routes.find(r => r.id === id)?.name || '—';
  const repName = (id: string) => reps.find(r => r.id === id)?.full_name || id.slice(0, 8);
  const planById = (id: string) => plans.find(p => p.id === id);

  const repRoutes = useMemo(() => {
    const rep = reps.find(r => r.id === repId);
    return routes.filter(r => !rep?.agency_id || !r.agency_id || r.agency_id === rep.agency_id);
  }, [routes, reps, repId]);

  // group plan rows by rep + period
  const groups = useMemo(() => {
    const m = new Map<string, Plan[]>();
    plans.forEach(p => { const k = `${p.sales_rep_id}|${p.period_start}|${p.period_end}`; m.set(k, [...(m.get(k) || []), p]); });
    return [...m.entries()].map(([k, rows]) => ({ key: k, rows, rep: rows[0].sales_rep_id, start: rows[0].period_start, end: rows[0].period_end,
      locked: rows.every(r => r.status === 'LOCKED') }));
  }, [plans]);

  const myPlans = plans.filter(p => p.sales_rep_id === user?.id && p.period_end >= fmt(new Date()));
  const pendingReqs = reqs.filter(r => r.status === 'PENDING');

  const savePlan = async (lock: boolean) => {
    if (!repId) return flash('err', 'Select a sales rep');
    const end = endFor(start, kind);
    const rows = DAYS.filter(d => dayRoute[d]).map(d => ({
      sales_rep_id: repId, period_start: start, period_end: end, route_id: dayRoute[d], day_of_week: d,
      status: lock ? 'LOCKED' : 'DRAFT', ...(lock ? { locked_at: new Date().toISOString(), locked_by: user?.id } : {}),
    }));
    if (!rows.length) return flash('err', 'Assign a route to at least one day');
    if (plans.some(p => p.sales_rep_id === repId && p.period_start <= end && p.period_end >= start))
      return flash('err', 'This rep already has a plan overlapping these dates');
    setBusy(true);
    const { error } = await supabase.from('route_plans').insert(rows);
    setBusy(false);
    if (error) return flash('err', error.message);
    flash('ok', lock ? 'Plan saved and locked' : 'Plan saved as draft');
    setDayRoute({}); setTab('plans'); load();
  };

  const lockGroup = async (g: { rep: string; start: string; end: string }) => {
    const { error } = await supabase.from('route_plans')
      .update({ status: 'LOCKED', locked_at: new Date().toISOString(), locked_by: user?.id })
      .eq('sales_rep_id', g.rep).eq('period_start', g.start).eq('period_end', g.end).eq('status', 'DRAFT');
    if (error) return flash('err', error.message);
    flash('ok', 'Plan locked'); load();
  };

  const deleteGroup = async (g: { rep: string; start: string; end: string }) => {
    if (!window.confirm('Delete this draft plan?')) return;
    const { error } = await supabase.from('route_plans').delete()
      .eq('sales_rep_id', g.rep).eq('period_start', g.start).eq('period_end', g.end).eq('status', 'DRAFT');
    if (error) return flash('err', error.message);
    load();
  };

  const submitRequest = async () => {
    if (!reqPlan || !user) return;
    if (!reqReason.trim()) return flash('err', 'Reason is required');
    if (!reqRoute && !reqDay) return flash('err', 'Choose a new route or a new day');
    setBusy(true);
    const { error } = await supabase.from('route_change_requests').insert({
      route_plan_id: reqPlan.id, requested_by: user.id, reason: reqReason.trim(), status: 'PENDING',
      proposed_route_id: reqRoute || null, proposed_day_of_week: reqDay || null,
    });
    setBusy(false);
    if (error) return flash('err', error.message);
    flash('ok', 'Change request sent for approval');
    setReqPlan(null); setReqReason(''); setReqRoute(''); setReqDay(''); load();
  };

  const decide = async (id: string, approve: boolean) => {
    const { error } = await supabase.rpc(approve ? 'approve_route_change' : 'reject_route_change', { p_request_id: id });
    if (error) return flash('err', error.message);
    flash('ok', approve ? 'Approved — route plan updated' : 'Request rejected'); load();
  };

  const tabs = isPlanner
    ? [['plans', 'Plans'], ['builder', 'New plan'], ['requests', `Requests${pendingReqs.length ? ` (${pendingReqs.length})` : ''}`]]
    : [['mine', 'My plan'], ['requests', 'My requests']];

  const inputCls = 'h-11 rounded-xl border border-slate-200 px-3 bg-white w-full focus:outline-none focus:ring-2 focus:ring-sky-500';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Route Plans</h1>
        <p className="text-sm text-slate-500">Plan routes for 15 days or a month, lock them, and handle change requests.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {tabs.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k as any)} className={`h-10 px-4 rounded-xl text-sm font-semibold whitespace-nowrap border ${tab === k ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{l}</button>
        ))}
      </div>

      {msg && (
        <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {msg.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {msg.text}
        </div>
      )}

      {/* PLANS (planner) */}
      {tab === 'plans' && (
        <div className="space-y-3">
          {groups.length === 0 && <div className="card p-8 text-center text-slate-500">No route plans yet. Create one in "New plan".</div>}
          {groups.map(g => (
            <div key={g.key} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-bold text-slate-900">{repName(g.rep)}</div>
                  <div className="text-sm text-slate-500 flex items-center gap-1"><CalendarDays size={14} /> {g.start} → {g.end}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold rounded-full px-3 py-1 flex items-center gap-1 ${g.locked ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                    {g.locked && <Lock size={12} />} {g.locked ? 'LOCKED' : 'DRAFT'}
                  </span>
                  {!g.locked && <button onClick={() => lockGroup(g)} className="h-9 px-3 rounded-xl bg-slate-900 text-white text-sm font-semibold">Lock</button>}
                  {!g.locked && <button onClick={() => deleteGroup(g)} className="h-9 w-9 rounded-xl border border-slate-200 flex items-center justify-center text-red-600"><Trash2 size={16} /></button>}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                {DAYS.map(d => { const row = g.rows.find(r => sameDay(r.day_of_week, d)); return row ? (
                  <div key={d} className="rounded-xl bg-slate-50 px-3 py-2"><div className="text-[11px] text-slate-500">{d.slice(0, 3)}</div><div className="font-semibold truncate">{routeName(row.route_id)}</div></div>) : null; })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BUILDER (planner) */}
      {tab === 'builder' && (
        <div className="card p-5 space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div><label className="text-sm font-medium">Sales rep</label>
              <select value={repId} onChange={e => { setRepId(e.target.value); setDayRoute({}); }} className={inputCls}>
                <option value="">Select…</option>{reps.map(r => <option key={r.id} value={r.id}>{r.full_name || r.id.slice(0, 8)}</option>)}
              </select></div>
            <div><label className="text-sm font-medium">Period</label>
              <select value={kind} onChange={e => setKind(e.target.value as any)} className={inputCls}>
                <option value="15">15 days</option><option value="MONTH">Monthly</option>
              </select></div>
            <div><label className="text-sm font-medium">Start date</label>
              <input type="date" value={start} onChange={e => setStart(e.target.value)} className={inputCls} /></div>
          </div>
          <div className="text-sm text-slate-500">Period: <b>{start}</b> → <b>{endFor(start, kind)}</b></div>

          <div className="space-y-2">
            {DAYS.map(d => (
              <div key={d} className="flex items-center gap-3">
                <div className="w-24 text-sm font-semibold text-slate-700">{d.slice(0, 1) + d.slice(1).toLowerCase()}</div>
                <select value={dayRoute[d] || ''} onChange={e => setDayRoute({ ...dayRoute, [d]: e.target.value })} className={inputCls}>
                  <option value="">Off / no route</option>{repRoutes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button disabled={busy} onClick={() => savePlan(false)} className="h-12 rounded-xl border border-slate-300 font-semibold disabled:opacity-60">Save draft</button>
            <button disabled={busy} onClick={() => savePlan(true)} className="h-12 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"><Lock size={16} /> Save & lock</button>
          </div>
        </div>
      )}

      {/* MY PLAN (rep) */}
      {tab === 'mine' && (
        <div className="space-y-3">
          {myPlans.length === 0 && <div className="card p-8 text-center text-slate-500">No active route plan assigned to you.</div>}
          {myPlans.length > 0 && <div className="text-sm text-slate-500">{myPlans[0].period_start} → {myPlans[0].period_end}</div>}
          {DAYS.map(d => myPlans.filter(p => sameDay(p.day_of_week, d)).map(p => (
            <div key={p.id} className="card p-4 flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">{d.slice(0, 1) + d.slice(1).toLowerCase()}</div>
                <div className="font-bold text-slate-900">{routeName(p.route_id)}</div>
              </div>
              <div className="flex items-center gap-2">
                {p.status === 'LOCKED' && <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full px-3 py-1 flex items-center gap-1"><Lock size={12} /> Locked</span>}
                <button onClick={() => { setReqPlan(p); setMsg(null); }} className="h-9 px-3 rounded-xl border border-slate-300 text-sm font-semibold">Request change</button>
              </div>
            </div>
          )))}
        </div>
      )}

      {/* REQUESTS */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {reqs.length === 0 && <div className="card p-8 text-center text-slate-500">No change requests.</div>}
          {reqs.map(r => {
            const p = planById(r.route_plan_id);
            return (
              <div key={r.id} className="card p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold text-slate-900">{p ? repName(p.sales_rep_id) : 'Unknown rep'}</div>
                  <span className={`text-xs font-semibold rounded-full px-3 py-1 ${r.status === 'PENDING' ? 'bg-amber-50 text-amber-700' : r.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{r.status}</span>
                </div>
                {p && <div className="text-sm text-slate-600">
                  {p.day_of_week.toLowerCase()} · {routeName(p.route_id)}
                  {(r.proposed_route_id || r.proposed_day_of_week) && <> → <b>{r.proposed_day_of_week ? r.proposed_day_of_week.toLowerCase() : p.day_of_week.toLowerCase()} · {r.proposed_route_id ? routeName(r.proposed_route_id) : routeName(p.route_id)}</b></>}
                </div>}
                <div className="text-sm text-slate-500">“{r.reason}”</div>
                {isPlanner && r.status === 'PENDING' && (
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => decide(r.id, true)} className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold flex items-center gap-1"><Check size={16} /> Approve</button>
                    <button onClick={() => decide(r.id, false)} className="h-10 px-4 rounded-xl border border-slate-300 text-sm font-semibold flex items-center gap-1"><X size={16} /> Reject</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* change request modal */}
      {reqPlan && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 w-full max-w-md space-y-3">
            <h3 className="font-bold text-lg">Request route change</h3>
            <div className="text-sm text-slate-500">Now: {reqPlan.day_of_week.toLowerCase()} · {routeName(reqPlan.route_id)}</div>
            <select value={reqRoute} onChange={e => setReqRoute(e.target.value)} className={inputCls}>
              <option value="">Keep same route</option>{routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <select value={reqDay} onChange={e => setReqDay(e.target.value)} className={inputCls}>
              <option value="">Keep same day</option>{DAYS.map(d => <option key={d} value={d}>{d.slice(0, 1) + d.slice(1).toLowerCase()}</option>)}
            </select>
            <textarea value={reqReason} onChange={e => setReqReason(e.target.value)} rows={3} placeholder="Reason (required)"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setReqPlan(null)} className="h-11 rounded-xl border border-slate-300 font-semibold">Cancel</button>
              <button disabled={busy} onClick={submitRequest} className="h-11 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"><Send size={16} /> Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutePlans;
