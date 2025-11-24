import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, ClipboardCheck, CheckSquare, Camera, Menu } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, path: createPageUrl('PortalDashboard') },
  { id: 'inspections', label: 'Inspections', icon: ClipboardCheck, path: createPageUrl('Inspect') },
  { id: 'actions', label: 'Actions', icon: CheckSquare, path: createPageUrl('Prioritize') },
  { id: 'photos', label: 'Photos', icon: Camera, path: createPageUrl('Track') },
  { id: 'menu', label: 'Menu', icon: Menu, path: createPageUrl('PortalMenu') }
];

export default function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}