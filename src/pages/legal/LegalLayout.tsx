import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail } from 'lucide-react';

export interface LegalSection { title: string; paras?: string[]; bullets?: string[] }

interface Props {
  badge: string;
  title: string;
  subtitle: string;
  effective: string;
  updated: string;
  sections: LegalSection[];
}

const LegalLayout: React.FC<Props> = ({ badge, title, subtitle, effective, updated, sections }) => (
  <div className="min-h-screen bg-slate-50">
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/login" className="flex items-center gap-2 font-extrabold text-slate-900">
          <span className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 inline-block" />
          SmartBiz <span className="text-xs text-sky-600 tracking-widest">DMS</span>
        </Link>
        <span className="flex items-center gap-2 text-sm text-slate-500"><Mail size={16} /> support@smartbiz.lk</span>
      </div>
    </header>

    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div>
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5">
          <ShieldCheck size={14} /> {badge}
        </span>
        <h1 className="mt-4 text-4xl font-extrabold text-slate-900">{title}</h1>
        <p className="mt-2 text-slate-500">{subtitle}</p>
        <div className="mt-4 flex gap-8 text-sm">
          <div><div className="text-slate-500">Effective date</div><div className="font-semibold">{effective}</div></div>
          <div><div className="text-slate-500">Last updated</div><div className="font-semibold">{updated}</div></div>
        </div>
      </div>

      <nav className="card p-5">
        <div className="font-semibold mb-2">On this page</div>
        <ol className="space-y-1 text-sm text-slate-600">
          {sections.map((s, i) => (
            <li key={i}><a href={`#s${i + 1}`} className="hover:text-blue-700">{i + 1}. {s.title}</a></li>
          ))}
        </ol>
      </nav>

      <div className="card p-6 space-y-8">
        {sections.map((s, i) => (
          <section key={i} id={`s${i + 1}`} className="scroll-mt-20">
            <h2 className="text-xl font-bold text-slate-900 mb-3">{i + 1}. {s.title}</h2>
            {s.paras?.map((p, j) => <p key={j} className="text-slate-600 leading-relaxed mb-3">{p}</p>)}
            {s.bullets && (
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
          </section>
        ))}
      </div>

      <footer className="text-sm text-slate-500 border-t border-slate-200 pt-4 flex justify-between">
        <span>SmartBiz DMS</span>
        <a href="#top" className="hover:text-blue-700">Back to top ↑</a>
      </footer>
    </main>
  </div>
);

export default LegalLayout;
