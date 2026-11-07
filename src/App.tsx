import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import HRDashboard from './pages/hr/Dashboard';
import TransportDashboard from './pages/transport/Dashboard';
import ExpenseDashboard from './pages/expense/Dashboard';
import InventoryDashboard from './pages/inventory/Dashboard';
import OrdersDashboard from './pages/orders/Dashboard';
import AgenciesDashboard from './pages/agencies/Dashboard';
import ShopsDashboard from './pages/shops/Dashboard';
import RoutesDashboard from './pages/routes/Dashboard';
import UsersDashboard from './pages/users/Dashboard';
import FinanceDashboard from './pages/finance/Dashboard';
import SalesDashboard from './pages/sales/Dashboard';
import AccountsDashboard from './pages/accounts/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AgencyManagement from './pages/admin/AgencyManagement';
import UserManagement from './pages/admin/UserManagement';
import InventoryMaster from './pages/admin/InventoryMaster';
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import Terms from './pages/legal/Terms';
import SettingsDashboard from './pages/settings/Dashboard';

// Phase 0-5 new pages
import BookingDashboard from './pages/bookings/Dashboard';
import VanDashboard from './pages/sales/VanDashboard';
import ApprovalDashboard from './pages/approvals/Dashboard';
import GPSDashboard from './pages/gps/Dashboard';
import ManagerMapView from './pages/gps/ManagerMapView';
import POSDashboard from './pages/pos/Dashboard';
import ReportsDashboard from './pages/reports/Dashboard';
import RouteOptimization from './pages/routes/RouteOptimization';

import { useAuthStore } from './lib/auth';
import { UserRole } from './types';

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
      <p className="mt-4 text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, checkSession } = useAuthStore();
  useEffect(() => { checkSession(); }, [checkSession]);
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, user, checkSession } = useAuthStore();
  useEffect(() => { checkSession(); }, [checkSession]);
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== UserRole.SUPER_ADMIN) return <Navigate to="/dashboard" />;
  return <>{children}</>;
};

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true, v7_fetcherPersist: true, v7_normalizeFormMethod: true, v7_partialHydration: true }}>
      <Routes>
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        {/* Auth */}
        <Route path="/" element={<AuthLayout />}>
          <Route index element={<Navigate to="/login" />} />
          <Route path="login" element={<Login />} />
        </Route>

        {/* Protected */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="sales/*"     element={<SalesDashboard />} />
          <Route path="van/*"       element={<VanDashboard />} />
          <Route path="inventory"   element={<InventoryDashboard />} />
          <Route path="orders/*"    element={<OrdersDashboard />} />
          <Route path="agencies/*"  element={<AgenciesDashboard />} />
          <Route path="shops/*"     element={<ShopsDashboard />} />
          <Route path="routes/*"    element={<RoutesDashboard />} />
          <Route path="transport"   element={<TransportDashboard />} />
          <Route path="hr/*"        element={<HRDashboard />} />
          <Route path="expense"     element={<ExpenseDashboard />} />
          <Route path="users/*"     element={<UsersDashboard />} />
          <Route path="finance/*"   element={<FinanceDashboard />} />
          <Route path="accounts/*"  element={<AccountsDashboard />} />

          {/* Phase 1 — Bookings + Lorry Loading Sheet */}
          <Route path="bookings/*"  element={<BookingDashboard />} />

          {/* Phase 3 — Approvals + GPS */}
          <Route path="approvals"        element={<ApprovalDashboard />} />
          <Route path="gps"              element={<GPSDashboard />} />
          <Route path="gps/manager"      element={<ManagerMapView />} />

          {/* Phase 4 — Reports */}
          <Route path="settings"      element={<SettingsDashboard />} />
          <Route path="reports/*"        element={<ReportsDashboard />} />

          {/* Phase 5 — POS + Route Optimization */}
          <Route path="pos"              element={<POSDashboard />} />
          <Route path="routes/optimize"  element={<RouteOptimization />} />

          {/* Admin — SUPER_ADMIN only */}
          <Route path="admin" element={<AdminRoute><MainLayout /></AdminRoute>}>
            <Route index             element={<AdminDashboard />} />
            <Route path="agencies"   element={<AgencyManagement />} />
            <Route path="users"      element={<UserManagement />} />
            <Route path="master-inventory" element={<InventoryMaster />} />
          </Route>
        </Route>

        <Route path="*" element={<div className="flex items-center justify-center h-screen text-gray-500">Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
