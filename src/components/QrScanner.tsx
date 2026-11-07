import React, { useEffect, useRef, useState } from 'react';

interface Props { onResult: (text: string) => void; onClose: () => void }

/** Camera QR scanner using the browser's BarcodeDetector (Chrome on Android supports it). */
const QrScanner: React.FC<Props> = ({ onResult, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let stopped = false;
    (async () => {
      const Detector = (window as any).BarcodeDetector;
      if (!Detector) { setErr('QR scanning is not supported in this browser. Use Chrome on Android, or type the code.'); return; }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new Detector({ formats: ['qr_code'] });
        const tick = async () => {
          if (stopped || !videoRef.current) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length) { stopped = true; onResult(codes[0].rawValue); return; }
          } catch { /* keep scanning */ }
          requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setErr('Camera permission denied');
      }
    })();
    return () => { stopped = true; stream?.getTracks().forEach(t => t.stop()); };
  }, [onResult]);

  return (
    <div className="space-y-2">
      {err ? <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">{err}</div>
        : <video ref={videoRef} className="w-full rounded-2xl bg-black" playsInline muted />}
      <button type="button" onClick={onClose} className="text-sm text-slate-600 underline">Close scanner</button>
    </div>
  );
};

export default QrScanner;
