import React, { useState, FormEvent, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '../../lib/auth';

const inputCls =
  'w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-base text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [keep, setKeep] = useState(true);
  const { login, isAuthenticated, isLoading, error, checkSession } = useAuthStore();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  if (isAuthenticated) return <Navigate to="/dashboard" />;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and password below to log into your account
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-800 mb-1.5">Email</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-slate-800 mb-1.5">Password</label>
        <div className="relative">
          <input
            id="password"
            type={showPw ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputCls + ' pr-12'}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute inset-y-0 right-0 px-4 text-slate-500"
            aria-label={showPw ? 'Hide password' : 'Show password'}
          >
            {showPw ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>
      </div>

      <label className="flex items-center gap-3 text-sm text-slate-800 select-none">
        <input
          type="checkbox"
          checked={keep}
          onChange={(e) => setKeep(e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-slate-900 focus:ring-sky-500"
        />
        Keep me signed in
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full h-12 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.99] transition disabled:opacity-60"
      >
        <LogIn size={18} />
        {isLoading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
};

export default Login;
