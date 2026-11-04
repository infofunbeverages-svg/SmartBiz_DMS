import { StrictMode, Component, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { supabaseConfigError } from './lib/supabase';
import './index.css';

const box: React.CSSProperties = {
  fontFamily: 'monospace', padding: 24, margin: 24, background: '#fef2f2',
  border: '1px solid #fca5a5', color: '#991b1b', borderRadius: 8, whiteSpace: 'pre-wrap',
};

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) return <div style={box}>App crashed:{'\n'}{this.state.error.message}</div>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {supabaseConfigError ? (
      <div style={box}>
        CONFIG ERROR{'\n\n'}{supabaseConfigError}{'\n\n'}
        Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your host's env vars, then REDEPLOY (Vite bakes them in at build time).
      </div>
    ) : (
      <ErrorBoundary><App /></ErrorBoundary>
    )}
  </StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
