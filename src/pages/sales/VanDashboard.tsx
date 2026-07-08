import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Truck, Plus, Package, DollarSign, BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuthStore } from '../../lib/auth';
import { useSFAStore } from '../../stores/sfaStore';
import VanLoadEntry from './components/VanLoadEntry';
import VanSaleEntry from './components/VanSaleEntry';
import VanEODReport from './components/VanEODReport';

const VanDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { currentDutySession, dailyLoading, getTodaysSales, generateUnloadingReport } = useSFAStore();

  const todaySales    = getTodaysSales();
  const unloading     = generateUnloadingReport();
  const totalSales    = todaySales.reduce((s, t) => s + t.totalAmount, 0);
  const totalLoaded   = dailyLoading.reduce((s, l) => s + l.totalValue, 0);
  const loadedItems   = dailyLoading.length;

  return (
    <Routes>
      <Route path="/" element={
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Van Sales</h1>
              <p className="text-sm text-gray-500 mt-1">Mode 2: On-spot sell, real-time stock deduction</p>
            </div>
            <div className="flex gap-2">
              {!dailyLoading.length && (
                <Button variant="outline" onClick={() => window.location.href = '/van/load'}>
                  <Package size={16} className="mr-2" />Van Load කරන්න
                </Button>
              )}
              {dailyLoading.length > 0 && (
                <Button onClick={() => window.location.href = '/van/sale'}>
                  <Plus size={16} className="mr-2" />New Sale
                </Button>
              )}
            </div>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Van Stock Items', value: loadedItems, icon: <Package size={20} />, color: 'text-blue-600 bg-blue-50' },
              { label: 'Today Sales', value: todaySales.length, icon: <Truck size={20} />, color: 'text-green-600 bg-green-50' },
              { label: 'Sales Value', value: `Rs.${(totalSales/1000).toFixed(1)}k`, icon: <DollarSign size={20} />, color: 'text-purple-600 bg-purple-50' },
              { label: 'Loaded Value', value: `Rs.${(totalLoaded/1000).toFixed(1)}k`, icon: <BarChart2 size={20} />, color: 'text-amber-600 bg-amber-50' },
            ].map((s, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{s.label}</p>
                      <p className="text-xl font-bold text-gray-900">{s.value}</p>
                    </div>
                    <div className={`p-2 rounded-full ${s.color}`}>{s.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {!dailyLoading.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 mb-4">Van load කරලා නැහැ — ඉස්සෙල්ල stock load කරන්න</p>
                <Button onClick={() => window.location.href = '/van/load'}>Van Load කරන්න</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Current van stock */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Van Stock Balance</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/van/eod'}>
                      <BarChart2 size={14} className="mr-1" />EOD Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-xs text-gray-500">
                        <th className="text-left py-2">Product</th>
                        <th className="text-right py-2">Loaded</th>
                        <th className="text-right py-2">Sold</th>
                        <th className="text-right py-2">Returns</th>
                        <th className="text-right py-2 font-bold">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unloading.map((u, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 font-medium">{u.productName}</td>
                          <td className="py-2 text-right text-gray-500">{u.loadedQuantity}</td>
                          <td className="py-2 text-right text-green-600">{u.soldQuantity}</td>
                          <td className="py-2 text-right text-amber-600">{u.returnQuantity}</td>
                          <td className={`py-2 text-right font-bold ${u.balanceQuantity < 0 ? 'text-red-600' : 'text-gray-900'}`}>{u.balanceQuantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Today's sales */}
              {todaySales.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>Today's Sales ({todaySales.length})</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {todaySales.map((sale, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium">{sale.customerName}</p>
                            <p className="text-xs text-gray-500">{sale.invoiceNumber} • {sale.items.length} items</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold">Rs. {sale.totalAmount.toLocaleString()}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${sale.paymentMethod === 'CASH' ? 'bg-green-100 text-green-700' : sale.paymentMethod === 'CREDIT' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                              {sale.paymentMethod}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      } />
      <Route path="/load"  element={<VanLoadEntry />} />
      <Route path="/sale"  element={<VanSaleEntry />} />
      <Route path="/eod"   element={<VanEODReport />} />
    </Routes>
  );
};

export default VanDashboard;
