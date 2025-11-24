import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Wrench, MessageCircle, User } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'jobs', label: 'Jobs', icon: Wrench, path: createPageUrl('ContractorDashboard') },
  { id: 'messages', label: 'Messages', icon: MessageCircle, path: createPageUrl('ContractorMessages') },
  { id: 'profile', label: 'Profile', icon: User, path: createPageUrl('ContractorProfile') }
];

export default function ContractorBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-2 py-3">
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
              style={{ minHeight: '56px', minWidth: '56px' }}
            >
              <Icon className="w-7 h-7 mb-1" strokeWidth={2.5} />
              <span className="text-xs font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}