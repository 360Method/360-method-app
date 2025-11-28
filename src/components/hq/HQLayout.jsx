import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Wrench,
  HardHat,
  DollarSign,
  TicketCheck,
  Settings,
  Shield,
  ChevronRight,
  LogOut,
  Bell,
  Activity,
  FileText,
  AlertTriangle,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HQ_NAVIGATION = [
  {
    section: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, url: createPageUrl('HQDashboard'), subtitle: 'Platform overview' },
      { id: 'activity', label: 'Activity Feed', icon: Activity, url: createPageUrl('HQActivity'), subtitle: 'Real-time events' },
    ]
  },
  {
    section: 'User Management',
    items: [
      { id: 'users', label: 'All Users', icon: Users, url: createPageUrl('HQUsers'), subtitle: 'Manage accounts' },
      { id: 'operators', label: 'Operators', icon: Wrench, url: createPageUrl('HQOperators'), subtitle: 'Service providers' },
      { id: 'contractors', label: 'Contractors', icon: HardHat, url: createPageUrl('HQContractors'), subtitle: 'Tradespeople' },
    ]
  },
  {
    section: 'Platform',
    items: [
      { id: 'properties', label: 'Properties', icon: Building2, url: createPageUrl('HQProperties'), subtitle: 'All properties' },
      { id: 'revenue', label: 'Revenue', icon: DollarSign, url: createPageUrl('HQRevenue'), subtitle: 'Financials & analytics' },
      { id: 'reports', label: 'Reports', icon: FileText, url: createPageUrl('HQReports'), subtitle: 'Generate reports' },
    ]
  },
  {
    section: 'Support',
    items: [
      { id: 'support', label: 'Support Tickets', icon: TicketCheck, url: createPageUrl('HQSupport'), subtitle: 'Customer issues' },
      { id: 'alerts', label: 'System Alerts', icon: AlertTriangle, url: createPageUrl('HQAlerts'), subtitle: 'Platform health' },
    ]
  },
  {
    section: 'System',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, url: createPageUrl('HQSettings'), subtitle: 'Platform config' },
      { id: 'jobs', label: 'Job Queue', icon: Activity, url: createPageUrl('AdminJobQueue'), subtitle: 'Background jobs' },
      { id: 'stripe', label: 'Stripe Admin', icon: DollarSign, url: createPageUrl('AdminStripe'), subtitle: 'Payment config' },
    ]
  }
];

export default function HQLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  // Check for admin role
  // In development, allow access if DEV_ADMIN_ACCESS is true
  const isDev = import.meta.env.DEV;
  const isAdmin = isDev || user?.role === 'admin' || user?.user_metadata?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access the HQ Admin Portal.</p>
          <Button onClick={() => window.location.href = createPageUrl('Dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-slate-900 text-white fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-white text-sm">360° HQ</h2>
                  <p className="text-xs text-slate-400">Admin Portal</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-400 rotate-180" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full p-2 hover:bg-slate-800 rounded-lg flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {HQ_NAVIGATION.map((section) => (
            <div key={section.section} className="mb-4">
              {!sidebarCollapsed && (
                <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {section.section}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      to={item.url}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium">{item.label}</span>
                          <p className="text-xs text-slate-400 truncate">{item.subtitle}</p>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.full_name || 'Admin'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full p-2 hover:bg-slate-800 rounded-lg flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-slate-400" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/75 z-[60]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 w-80 bg-slate-900 z-[70] transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">360° HQ</h2>
              <p className="text-xs text-slate-400">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-slate-800 rounded-lg"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <nav className="overflow-y-auto p-4" style={{ height: 'calc(100vh - 140px)' }}>
          {HQ_NAVIGATION.map((section) => (
            <div key={section.section} className="mb-4">
              <h3 className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {section.section}
              </h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.url;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.id}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-orange-500 text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <div>
                        <span className="text-sm font-medium">{item.label}</span>
                        <p className="text-xs text-slate-400">{item.subtitle}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.full_name?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.full_name || 'Admin'}</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full gap-2 border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 z-50 h-14">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-800 rounded-lg"
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              <span className="font-bold text-white">360° HQ</span>
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-lg">
              <Bell className="w-5 h-5 text-white" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="pt-14 md:pt-0 min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
