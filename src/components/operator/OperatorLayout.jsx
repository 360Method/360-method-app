import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Operator } from '@/api/supabaseClient';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  MessageSquare,
  Calendar,
  ClipboardList,
  FileText,
  DollarSign,
  Settings,
  ChevronRight,
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  Wrench,
  Target,
  BarChart3,
  HardHat,
  Star,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

const OPERATOR_NAVIGATION = [
  {
    section: 'Command Center',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, url: createPageUrl('OperatorDashboard'), subtitle: 'Overview & metrics' },
      { id: 'calendar', label: 'Calendar', icon: Calendar, url: createPageUrl('OperatorCalendar'), subtitle: 'Schedule & appointments' },
      { id: 'messages', label: 'Messages', icon: MessageSquare, url: createPageUrl('OperatorMessages'), subtitle: 'Client communication', badge: 3 },
    ]
  },
  {
    section: 'Client Management',
    items: [
      { id: 'clients', label: 'All Clients', icon: Users, url: createPageUrl('OperatorClients'), subtitle: 'Manage properties' },
      { id: 'leads', label: 'Leads Pipeline', icon: Target, url: createPageUrl('OperatorLeads'), subtitle: 'New opportunities' },
      { id: 'add-client', label: 'Add Client', icon: UserPlus, url: createPageUrl('OperatorAddClient'), subtitle: 'Onboard new client' },
    ]
  },
  {
    section: '360° Services',
    items: [
      { id: 'inspections', label: 'Inspections', icon: ClipboardList, url: createPageUrl('OperatorInspection'), subtitle: 'Property assessments' },
      { id: 'work-orders', label: 'Work Orders', icon: Wrench, url: createPageUrl('OperatorWorkOrders'), subtitle: 'Active jobs' },
      { id: 'reports', label: 'Reports', icon: FileText, url: createPageUrl('OperatorReportBuilder'), subtitle: 'Client deliverables' },
    ]
  },
  {
    section: 'Business',
    items: [
      { id: 'invoices', label: 'Invoices', icon: FileText, url: createPageUrl('OperatorInvoices'), subtitle: 'Billing & payments' },
      { id: 'earnings', label: 'Earnings', icon: DollarSign, url: createPageUrl('OperatorEarnings'), subtitle: 'Revenue tracking' },
      { id: 'contractors', label: 'Contractors', icon: HardHat, url: createPageUrl('OperatorContractors'), subtitle: 'Your network' },
    ]
  },
  {
    section: 'Settings',
    items: [
      { id: 'profile', label: 'Business Profile', icon: Building2, url: createPageUrl('OperatorMarketplaceProfile'), subtitle: 'Public listing' },
      { id: 'settings', label: 'Settings', icon: Settings, url: createPageUrl('OperatorSettings'), subtitle: 'Preferences' },
    ]
  }
];

export default function OperatorLayout({ children }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  // Fetch operator data
  const { data: operator } = useQuery({
    queryKey: ['myOperator', user?.email],
    queryFn: async () => {
      const operators = await Operator.filter({ created_by: user?.email });
      return operators[0] || null;
    },
    enabled: !!user?.email
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col bg-white border-r border-gray-200 fixed left-0 top-0 bottom-0 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm truncate max-w-[140px]">
                    {operator?.business_name || 'Operator Portal'}
                  </h2>
                  <p className="text-xs text-gray-500">360° Method CRM</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-gray-400 rotate-180" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="w-full p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Search - Only when expanded */}
        {!sidebarCollapsed && (
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-sm bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {OPERATOR_NAVIGATION.map((section) => (
            <div key={section.section} className="mb-4">
              {!sidebarCollapsed && (
                <h3 className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : ''}`} />
                      {!sidebarCollapsed && (
                        <>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{item.label}</span>
                              {item.badge && (
                                <Badge className="bg-red-500 text-white text-xs px-1.5 py-0">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-400 truncate">{item.subtitle}</p>
                          </div>
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-3 border-t border-gray-200">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-blue-700">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'O'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.full_name || 'Operator'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={logout}
              className="w-full p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-[60]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed top-0 left-0 bottom-0 w-80 bg-white z-[70] transform transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-sm">
                {operator?.business_name || 'Operator Portal'}
              </h2>
              <p className="text-xs text-gray-500">360° Method CRM</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Mobile Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search clients..."
              className="pl-9 h-10 bg-gray-50"
            />
          </div>
        </div>

        <nav className="overflow-y-auto p-3" style={{ height: 'calc(100vh - 180px)' }}>
          {OPERATOR_NAVIGATION.map((section) => (
            <div key={section.section} className="mb-4">
              <h3 className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
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
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{item.label}</span>
                          {item.badge && (
                            <Badge className="bg-red-500 text-white text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{item.subtitle}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {user?.full_name?.charAt(0) || 'O'}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{user?.full_name || 'Operator'}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Mobile Header */}
        <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-14">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
            <div className="flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <span className="font-bold text-gray-900">360° CRM</span>
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
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
