import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  ListTodo,
  PlusCircle,
  CalendarDays,
  Menu
} from "lucide-react";
import { Badge } from "../ui/badge";
import { useDemo } from "@/components/shared/DemoContext";

const navItems = [
  {
    id: "home",
    label: "Home",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard
  },
  {
    id: "tasks",
    label: "Tasks",
    url: createPageUrl("Prioritize"),
    icon: ListTodo,
    showBadge: true
  },
  {
    id: "add",
    label: "Add",
    icon: PlusCircle,
    action: true,
    primary: true
  },
  {
    id: "calendar",
    label: "Calendar",
    url: createPageUrl("Schedule"),
    icon: CalendarDays
  },
  {
    id: "more",
    label: "More",
    url: createPageUrl("Properties"),
    icon: Menu
  }
];

// Map regular pages to demo pages when in demo mode
const DEMO_PAGE_MAP = {
  'Schedule': 'DemoSchedule',
  'Execute': 'DemoExecute',
};

export default function BottomNav({ taskCount = 0, onQuickAdd, selectedProperty }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { demoMode } = useDemo();

  // Helper to get the correct page (demo or regular)
  const getPageUrl = (page) => {
    const targetPage = demoMode && DEMO_PAGE_MAP[page] ? DEMO_PAGE_MAP[page] : page;
    return createPageUrl(targetPage);
  };

  const handleItemClick = (item) => {
    // Handle Add button
    if (item.id === "add") {
      onQuickAdd?.();
      return;
    }

    // Smart routing for Tasks button
    if (item.id === "tasks") {
      const baselineComplete = selectedProperty?.baseline_completion >= 66;
      const targetRoute = baselineComplete ? getPageUrl("Prioritize") : getPageUrl("Baseline");
      navigate(targetRoute);
      return;
    }

    // Calendar routing - use demo page in demo mode
    if (item.id === "calendar") {
      navigate(getPageUrl("Schedule"));
      return;
    }

    // Regular navigation
    if (item.url) {
      navigate(item.url);
    }
  };

  const isActive = (item) => {
    if (item.id === "home") return location.pathname === createPageUrl("Dashboard");
    if (item.id === "tasks") {
      return [
        createPageUrl("Baseline"),
        createPageUrl("Prioritize"),
        createPageUrl("Execute"),
        createPageUrl("DemoExecute")
      ].some(path => location.pathname === path);
    }
    if (item.id === "calendar") {
      return [
        createPageUrl("Schedule"),
        createPageUrl("DemoSchedule")
      ].some(path => location.pathname === path);
    }
    if (item.id === "more") {
      return [
        createPageUrl("Properties"),
        createPageUrl("Settings"),
        createPageUrl("Services")
      ].some(path => location.pathname === path);
    }
    return location.pathname === item.url;
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-2xl z-[9999]" 
      style={{ 
        height: '64px',
        paddingBottom: 'env(safe-area-inset-bottom)'
      }}
    >
      <div className="flex items-center justify-around h-full px-1">
        {navItems.map((item) => {
          const isItemActive = isActive(item);
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg active:bg-gray-100 transition-colors relative ${
                item.primary ? 'transform scale-110' : ''
              }`}
              style={{ 
                minHeight: '56px', 
                minWidth: '56px',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <div className="relative">
                <Icon 
                  className={`w-6 h-6 flex-shrink-0 ${item.primary ? 'w-7 h-7' : ''}`}
                  style={{ 
                    color: isItemActive ? '#FF6B35' : (item.primary ? '#1B365D' : '#1B365D'),
                    strokeWidth: isItemActive ? 2.5 : 2
                  }} 
                />
                
                {/* Badge for task count */}
                {item.showBadge && taskCount > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 p-0 flex items-center justify-center"
                  >
                    {taskCount > 9 ? '9+' : taskCount}
                  </Badge>
                )}
              </div>
              
              <span 
                className={`font-semibold leading-tight text-center ${item.primary ? 'font-bold' : ''}`}
                style={{ 
                  color: isItemActive ? '#FF6B35' : '#1B365D',
                  fontSize: '11px',
                  lineHeight: '1.2'
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}