import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { FileText, AlertTriangle, BarChart2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import LifecycleReport from './LifecycleReport';
import AgingReport from './AgingReport';

const ReportsDashboard: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Lifecycle Report', desc: 'Booking → Delivery → Payment full cycle', icon: <FileText size={24} className="text-blue-600" />, path: '/reports/lifecycle' },
              { title: 'Credit Aging',     desc: 'Shop-wise outstanding credit aging',      icon: <AlertTriangle size={24} className="text-amber-600" />, path: '/reports/aging' },
              { title: 'Sales Performance', desc: 'Rep/Agency sales performance',           icon: <BarChart2 size={24} className="text-green-600" />, path: '/sales' },
            ].map((r, i) => (
              <Card key={i} className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => window.location.href = r.path}>
                <CardContent className="p-6">
                  <div className="mb-3">{r.icon}</div>
                  <h3 className="font-semibold text-gray-900">{r.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{r.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      } />
      <Route path="/lifecycle" element={<LifecycleReport />} />
      <Route path="/aging"     element={<AgingReport />} />
    </Routes>
  );
};

export default ReportsDashboard;
