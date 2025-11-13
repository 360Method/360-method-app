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
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-2xl" 
      style={{ 
        height: '64px',
        zIndex: 9999,
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex items-center justify-around h-full px-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.url || 
                          location.pathname.includes(item.label.toLowerCase());
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              to={item.url}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg active:bg-gray-100 transition-colors"
              style={{ 
                minHeight: '56px', 
                minWidth: '56px',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <Icon 
                className="w-6 h-6 flex-shrink-0" 
                style={{ 
                  color: isActive ? '#FF6B35' : '#1B365D',
                  strokeWidth: isActive ? 2.5 : 2
                }} 
              />
              <span 
                className="font-semibold leading-tight text-center"
                style={{ 
                  color: isActive ? '#FF6B35' : '#1B365D',
                  fontSize: '11px',
                  lineHeight: '1.2'
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