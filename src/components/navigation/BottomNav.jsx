import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Eye, 
  Zap, 
  TrendingUp,
  Home
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard
  },
  {
    label: "Aware",
    url: createPageUrl("Inspect"),
    icon: Eye
  },
  {
    label: "Act",
    url: createPageUrl("Prioritize"),
    icon: Zap
  },
  {
    label: "Advance",
    url: createPageUrl("Preserve"),
    icon: TrendingUp
  },
  {
    label: "Properties",
    url: createPageUrl("Properties"),
    icon: Home
  }
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50" style={{ height: '64px' }}>
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url || 
                          location.pathname.includes(item.label.toLowerCase());
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              to={item.url}
              className="flex flex-col items-center justify-center gap-1 flex-1"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <Icon 
                className="w-6 h-6" 
                style={{ 
                  color: isActive ? '#FF6B35' : '#1B365D',
                  strokeWidth: isActive ? 2.5 : 2
                }} 
              />
              <span 
                className="text-xs font-medium"
                style={{ 
                  color: isActive ? '#FF6B35' : '#1B365D',
                  fontSize: '12px'
                }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}