import React from 'react';
import { useAuthStore } from '../../lib/auth';

const SettingsDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const u = user as any;

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

      <section className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold text-gray-800 mb-3">My Account</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{u?.full_name || u?.name || '—'}</dd></div>
          <div><dt className="text-gray-500">Email</dt><dd className="font-medium">{u?.email || '—'}</dd></div>
          <div><dt className="text-gray-500">Role</dt><dd className="font-medium">{u?.role || '—'}</dd></div>
          <div><dt className="text-gray-500">Company ID</dt><dd className="font-mono text-xs break-all">{u?.company_id || '—'}</dd></div>
        </dl>
      </section>

      <section className="bg-white rounded-xl shadow-sm border p-5">
        <h2 className="font-semibold text-gray-800 mb-1">Role Permissions</h2>
        <p className="text-sm text-gray-500">Menu/feature toggles per role are coming soon.</p>
      </section>
    </div>
  );
};

export default SettingsDashboard;
