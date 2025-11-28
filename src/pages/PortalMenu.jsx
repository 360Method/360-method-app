import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { auth } from '@/api/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import {
  Settings,
  DollarSign,
  Calendar,
  Wrench,
  HelpCircle,
  LogOut,
  ChevronRight,
  User,
  Home
} from 'lucide-react';

const MENU_SECTIONS = [
  {
    title: 'Property Management',
    items: [
      { id: 'properties', label: 'My Properties', icon: Home, path: createPageUrl('Properties') },
      { id: 'budget', label: 'Budget & Spending', icon: DollarSign, path: createPageUrl('PortalBudget') },
      { id: 'calendar', label: 'Maintenance Calendar', icon: Calendar, path: createPageUrl('Schedule') }
    ]
  },
  {
    title: 'Services',
    items: [
      { id: 'operators', label: 'Find Help', icon: Wrench, path: createPageUrl('PortalMarketplace') },
      { id: 'support', label: 'Help & Support', icon: HelpCircle, path: createPageUrl('Resources') }
    ]
  },
  {
    title: 'Account',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings, path: createPageUrl('Settings') },
      { id: 'profile', label: 'My Profile', icon: User, path: createPageUrl('Settings') }
    ]
  }
];

export default function PortalMenu() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => auth.me()
  });

  const handleLogout = () => {
    auth.logout();
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-2xl mx-auto p-4 md:p-6">
        {/* User Profile Card */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-900 text-lg">
                {user?.full_name || 'User'}
              </div>
              <div className="text-sm text-gray-600">{user?.email}</div>
            </div>
          </div>
        </Card>

        {/* Menu Sections */}
        {MENU_SECTIONS.map(section => (
          <div key={section.title} className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              {section.title}
            </h2>
            <Card className="divide-y divide-gray-100">
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => window.location.href = item.path}
                    className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                    style={{ minHeight: '56px' }}
                  >
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="flex-1 text-left font-medium text-gray-900">
                      {item.label}
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                );
              })}
            </Card>
          </div>
        ))}

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
          size="lg"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}