import React, { useEffect, useRef, useState } from 'react';
import { Power, Camera, QrCode, Gauge, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../lib/auth';

type Method = 'SELFIE' | 'QR';
interface DutyLog {
  id: string; status: 'ON' | 'OFF'; duty_date: string; verification_type: string | null;
  gps_lat: number | null; gps_lng: number | null; odometer: number | null; recorded_at: string;
}

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getPosition = () =>
  new Promise<GeolocationPosition>((res, rej) => {
    if (!navigator.geolocation) return rej(new Error('GPS is not supported on this device'));
    navigator.geolocation.getCurrentPosition(res, () => rej(new Error('Please turn on GPS / allow location access')), {
      enableHighAccuracy: true, timeout: 15000,
    });
  });

const DutyOnOff: React.FC = () => {
  const { user } = useAuthStore();
  const [logs, setLogs] = useState<DutyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const [method, setMethod] = useState<Method>('SELFIE');
  const [odometer, setOdometer] = useState('');
  const [selfie, setSelfie] = useState<File | null>(null);
  const [qrText, setQrText] = useState('');
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const last = logs[0];
  const onDuty = last?.status === 'ON';
  const startLog = logs.find(l => l.status === 'ON');

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('duty_logs').select('*')
      .eq('sales_rep_id', user.id).eq('duty_date', todayStr())
      .order('recorded_at', { ascending: false });
    if (error) setMsg({ type: 'err', text: error.message });
    setLogs((data as DutyLog[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); return stopScan; /* eslint-disable-next-line */ }, [user?.id]);

  const stopScan = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const startScan = async () => {
    const Detector = (window as any).BarcodeDetector;
    if (!Detector) { setMsg({ type: 'err', text: 'QR scanning is not supported in this browser. Type the code instead.' }); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setScanning(true);
      setTimeout(async () => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new Detector({ formats: ['qr_code'] });
        const tick = async () => {
          if (!streamRef.current || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length) { setQrText(codes[0].rawValue); stopScan(); return; }
          } catch { /* keep scanning */ }
          requestAnimationFrame(tick);
        };
        tick();
      }, 50);
    } catch {
      setMsg({ type: 'err', text: 'Camera permission denied' });
    }
  };

  const submit = async () => {
    if (!user) return;
    setMsg(null);
    const odo = Number(odometer);
    if (!odometer || isNaN(odo) || odo < 0) return setMsg({ type: 'err', text: 'Enter the vehicle odometer reading' });
    if (onDuty && startLog?.odometer != null && odo < startLog.odometer)
      return setMsg({ type: 'err', text: `End odometer cannot be less than start (${startLog.odometer})` });
    if (method === 'SELFIE' && !selfie) return setMsg({ type: 'err', text: 'Take a selfie to verify' });
    if (method === 'QR' && !qrText.trim()) return setMsg({ type: 'err', text: 'Scan or enter the QR code' });

    setBusy(true);
    try {
      const pos = await getPosition();
      let verificationUrl = qrText.trim();
      if (method === 'SELFIE' && selfie) {
        const path = `${user.id}/${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage.from('duty-selfies').upload(path, selfie, { contentType: selfie.type || 'image/jpeg' });
        if (upErr) throw upErr;
        verificationUrl = path;
      }
      const { error } = await supabase.from('duty_logs').insert({
        sales_rep_id: user.id,
        duty_date: todayStr(),
        status: onDuty ? 'OFF' : 'ON',
        verification_type: method,
        verification_url: verificationUrl,
        gps_lat: pos.coords.latitude,
        gps_lng: pos.coords.longitude,
        odometer: odo,
      });
      if (error) throw error;
      setMsg({ type: 'ok', text: onDuty ? 'Duty ended. Good work today!' : 'Duty started. Have a great day!' });
      setOdometer(''); setSelfie(null); setQrText('');
      await load();
    } catch (e: any) {
      setMsg({ type: 'err', text: e?.message || 'Something went wrong' });
    } finally {
      setBusy(false);
    }
  };

  const distance = onDuty ? null : (logs.find(l => l.status === 'OFF')?.odometer != null && startLog?.odometer != null
    ? (logs.find(l => l.status === 'OFF')!.odometer! - startLog.odometer!) : null);

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-5">
      <div className={`rounded-3xl p-6 text-white shadow-lg ${onDuty ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gradient-to-br from-[#162f55] to-[#0a1730]'}`}>
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/15 flex items-center justify-center"><Power size={24} /></div>
          <div>
            <div className="text-sm opacity-80">Today · {todayStr()}</div>
            <div className="text-2xl font-extrabold">{loading ? 'Loading…' : onDuty ? 'You are ON duty' : 'You are OFF duty'}</div>
          </div>
        </div>
        {onDuty && last && <div className="mt-3 text-sm opacity-90">Started {new Date(startLog!.recorded_at).toLocaleTimeString()} · Start odometer {startLog?.odometer ?? '—'}</div>}
        {distance != null && distance >= 0 && <div className="mt-3 text-sm opacity-90">Distance today: {distance} km</div>}
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-bold text-slate-900">{onDuty ? 'End duty' : 'Start duty'}</h2>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-800 mb-1.5"><Gauge size={16} /> Vehicle odometer (km)</label>
          <input type="number" inputMode="numeric" value={odometer} onChange={e => setOdometer(e.target.value)}
            placeholder="e.g. 45210" className="w-full h-12 rounded-xl border border-slate-200 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(['SELFIE', 'QR'] as Method[]).map(m => (
            <button key={m} type="button" onClick={() => { setMethod(m); stopScan(); }}
              className={`h-12 rounded-xl border font-semibold flex items-center justify-center gap-2 ${method === m ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200'}`}>
              {m === 'SELFIE' ? <Camera size={18} /> : <QrCode size={18} />} {m === 'SELFIE' ? 'Selfie' : 'Scan QR'}
            </button>
          ))}
        </div>

        {method === 'SELFIE' ? (
          <div>
            <input type="file" accept="image/*" capture="user" onChange={e => setSelfie(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-xl file:border-0 file:bg-sky-50 file:px-4 file:py-2.5 file:font-semibold file:text-blue-700" />
            {selfie && <img src={URL.createObjectURL(selfie)} alt="selfie" className="mt-3 h-40 w-40 object-cover rounded-2xl border" />}
          </div>
        ) : (
          <div className="space-y-3">
            {scanning ? (
              <div>
                <video ref={videoRef} className="w-full rounded-2xl bg-black" playsInline muted />
                <button type="button" onClick={stopScan} className="mt-2 text-sm text-slate-600 underline">Cancel scan</button>
              </div>
            ) : (
              <button type="button" onClick={startScan} className="w-full h-12 rounded-xl border border-slate-200 font-semibold text-slate-700">Open camera to scan</button>
            )}
            <input value={qrText} onChange={e => setQrText(e.target.value)} placeholder="QR code value"
              className="w-full h-12 rounded-xl border border-slate-200 px-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500"><MapPin size={14} /> Your GPS location is recorded when you submit.</div>

        {msg && (
          <div className={`flex items-start gap-2 rounded-xl px-4 py-3 text-sm ${msg.type === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {msg.type === 'ok' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />} {msg.text}
          </div>
        )}

        <button onClick={submit} disabled={busy || loading}
          className={`w-full h-12 rounded-xl text-white font-semibold disabled:opacity-60 ${onDuty ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-900 hover:bg-slate-800'}`}>
          {busy ? 'Please wait…' : onDuty ? 'End Duty' : 'Start Duty'}
        </button>
      </div>

      {logs.length > 0 && (
        <div className="card p-5">
          <h3 className="font-bold text-slate-900 mb-3">Today's log</h3>
          <ul className="divide-y divide-slate-100 text-sm">
            {logs.map(l => (
              <li key={l.id} className="py-2 flex justify-between">
                <span className={`font-semibold ${l.status === 'ON' ? 'text-emerald-600' : 'text-red-600'}`}>{l.status}</span>
                <span className="text-slate-600">{new Date(l.recorded_at).toLocaleTimeString()} · {l.odometer ?? '—'} km · {l.verification_type}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DutyOnOff;
