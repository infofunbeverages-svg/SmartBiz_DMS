import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, LayoutDashboard, Package, ShoppingCart, Truck,
  Users, Receipt, LogOut, Store, Settings, CreditCard,
  FileText, Building, Map, ChevronDown, Bell, User,
  Search, TrendingUp, Wallet, ClipboardList, Eye,
} from 'lucide-react';
import { useAuthStore } from '../../lib/auth';
import { UserRole } from '../../types/user';
import { getRoleLabel, isViewOnly } from '../../lib/permissions';
import Button from '../ui/Button';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, active, onClick }) => (
  <li>
    <Link
      to={to}
      className={`flex items-center px-4 py-3 text-sm ${
        active ? 'bg-blue-700 text-white' : 'text-gray-300 hover:bg-blue-700/30 hover:text-white'
      } rounded-md transition-colors`}
      onClick={onClick}
    >
      <span className="mr-3">{icon}</span>
      <span>{label}</span>
    </Link>
  </li>
);

interface NavGroup {
  label: string;
  items: Array<{ to: string; icon: React.ReactNode; label: string; roles: UserRole[] }>;
}

const ALL_ROLES = Object.values(UserRole);

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
    const { user, logout, hasPermission, profileDebug } = useAuthStore();

  const navGroups: NavGroup[] = [
    {
      label: 'General',
      items: [
        { to: '/dashboard',  icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ALL_ROLES },
        { to: '/sales',      icon: <TrendingUp size={20} />,      label: 'Sales',     roles: ALL_ROLES },
        { to: '/inventory',  icon: <Package size={20} />,         label: 'Inventory',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENCY_OWNER, UserRole.AGENCY_CLERK, UserRole.SALES_MANAGER, UserRole.SALES_ADMIN] },
        { to: '/orders',     icon: <ShoppingCart size={20} />,    label: 'Orders',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENCY_OWNER, UserRole.AGENCY_CLERK, UserRole.SALES_MANAGER, UserRole.SALES_ADMIN, UserRole.AREA_SALES_MANAGER, UserRole.REGIONAL_MANAGER, UserRole.SALES_REP] },
      ],
    },
    {
      label: 'Distribution',
      items: [
        { to: '/bookings',   icon: <ClipboardList size={20} />,   label: 'Bookings (SFA)',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENCY_OWNER, UserRole.AGENCY_CLERK, UserRole.SALES_MANAGER, UserRole.AREA_SALES_MANAGER, UserRole.REGIONAL_MANAGER, UserRole.SALES_REP, UserRole.CASH_COLLECTOR] },
        { to: '/agencies',   icon: <Building size={20} />,        label: 'Agencies',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.SALES_ADMIN, UserRole.SALES_MANAGER, UserRole.AREA_SALES_MANAGER, UserRole.REGIONAL_MANAGER] },
        { to: '/shops',      icon: <Store size={20} />,           label: 'Shops',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENCY_OWNER, UserRole.AGENCY_CLERK, UserRole.SALES_MANAGER, UserRole.SALES_ADMIN, UserRole.AREA_SALES_MANAGER, UserRole.REGIONAL_MANAGER, UserRole.SALES_REP] },
        { to: '/routes',     icon: <Map size={20} />,             label: 'Routes',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENCY_OWNER, UserRole.SALES_MANAGER, UserRole.SALES_ADMIN, UserRole.AREA_SALES_MANAGER, UserRole.REGIONAL_MANAGER] },
        { to: '/transport',  icon: <Truck size={20} />,           label: 'Transport',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENCY_OWNER, UserRole.SALES_MANAGER, UserRole.SALES_ADMIN] },
      ],
    },
    {
      label: 'Financial',
      items: [
        { to: '/accounts',   icon: <Wallet size={20} />,    label: 'Accounts',  roles: ALL_ROLES },
        { to: '/finance',    icon: <CreditCard size={20} />, label: 'Finance',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ACCOUNTANT, UserRole.AGENCY_OWNER] },
        { to: '/expense',    icon: <Receipt size={20} />,   label: 'Expense',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENCY_OWNER, UserRole.ACCOUNTANT] },
      ],
    },
    {
      label: 'System Admin',
      items: [
        { to: '/admin/agencies',        icon: <Building size={20} />, label: 'Agencies',         roles: [UserRole.SUPER_ADMIN] },
        { to: '/admin/users',           icon: <User size={20} />,     label: 'User Management',  roles: [UserRole.SUPER_ADMIN] },
        { to: '/admin/master-inventory',icon: <Package size={20} />,  label: 'Master Inventory', roles: [UserRole.SUPER_ADMIN] },
      ],
    },
    {
      label: 'Administration',
      items: [
        { to: '/hr',       icon: <Users size={20} />,    label: 'Human Resources',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENCY_OWNER] },
        { to: '/users',    icon: <User size={20} />,     label: 'Users',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENCY_OWNER] },
        { to: '/reports',  icon: <FileText size={20} />, label: 'Reports',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.AGENCY_OWNER, UserRole.SALES_MANAGER, UserRole.SALES_ADMIN, UserRole.ACCOUNTANT] },
        { to: '/settings', icon: <Settings size={20} />, label: 'Settings',
          roles: [UserRole.SUPER_ADMIN, UserRole.ADMIN] },
      ],
    },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };

  if (!user) return <Outlet />;
    if (profileDebug) {
    return (
      <div style={{ padding: 20, background: '#fee', color: '#900', fontFamily: 'monospace', fontSize: 14 }}>
        PROFILE DEBUG: {profileDebug}
      </div>
    );
    }

  const viewOnly = isViewOnly(user);

  return (
    <div className="flex h-screen bg-gray-100">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 text-white transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-blue-700">
          <Link to="/dashboard" className="flex items-center">
            <Package className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-bold">Smartbiz DMS</span>
          </Link>
          <button className="p-1 rounded-md lg:hidden hover:bg-blue-700" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="py-4">
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] sidebar-scroll">
            <style>{`.sidebar-scroll { scrollbar-width: thin; scrollbar-color: #4b5563 rgba(30,64,175,0.1); } .sidebar-scroll::-webkit-scrollbar { width: 6px; } .sidebar-scroll::-webkit-scrollbar-track { background: rgba(30,64,175,0.1); } .sidebar-scroll::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 3px; }`}</style>
            <nav className="px-2 space-y-6">
              {navGroups.map((group, gi) => {
                const filtered = group.items.filter(item => hasPermission(item.roles));
                if (!filtered.length) return null;
                return (
                  <div key={gi}>
                    <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{group.label}</h3>
                    <ul className="space-y-1">
                      {filtered.map((item, ii) => (
                        <NavItem key={ii} to={item.to} icon={item.icon} label={item.label}
                          active={location.pathname.startsWith(item.to)} onClick={() => setSidebarOpen(false)} />
                      ))}
                    </ul>
                  </div>
                );
              })}
              <div>
                <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</h3>
                <ul className="space-y-1">
                  <NavItem to="#" icon={<LogOut size={20} />} label="Logout" active={false} onClick={handleLogout} />
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button className="p-2 rounded-md text-gray-500 lg:hidden" onClick={() => setSidebarOpen(true)}>
                  <Menu size={24} />
                </button>
                <div className="relative ml-4 lg:ml-0 hidden sm:block">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" placeholder="Search..." className="block w-full bg-gray-100 border border-transparent rounded-md py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:bg-white focus:border-blue-300" />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                  <Bell size={20} />
                </button>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700">
                    <User size={16} />
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                      {/* View Only badge — kalin Phase 0 design document eke specify kara thiyena amber badge */}
                      {viewOnly && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <Eye size={11} />
                          View Only
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                  </div>
                  <ChevronDown className="ml-1 h-4 w-4 text-gray-500" />
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-gray-100 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>

        <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>All rights reserved Smartbiz DMS 2026</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
