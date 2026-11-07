import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AuthLayout: React.FC = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 75% 25%, #1f6f9f 0%, rgba(31,111,159,0) 55%), linear-gradient(180deg, #162f55 0%, #0c1b36 60%, #0a1730 100%)',
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl px-7 py-9 sm:px-10">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 flex items-center justify-center shadow-md">
              <svg viewBox="0 0 24 24" className="h-7 w-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 8l-9-5-9 5v8l9 5 9-5V8z" />
                <path d="M3 8l9 5 9-5M12 13v8" />
              </svg>
            </div>
            <div className="leading-tight">
              <div className="text-2xl font-extrabold text-slate-900 tracking-tight">SmartBiz</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-600">DMS</div>
            </div>
          </div>
        </div>
        <Outlet />
      </div>
      <div className="relative mt-8 text-sm text-sky-100/70">
        <Link to="/terms" className="hover:text-white">Terms &amp; conditions</Link>
        <span className="mx-3 text-sky-100/30">|</span>
        <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
      </div>
    </div>
  );
};

export default AuthLayout;
