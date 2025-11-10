import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  LayoutDashboard, 
  Home, 
  Eye, 
  Zap, 
  TrendingUp,
  Search,
  ClipboardCheck,
  Activity,
  ListOrdered,
  Calendar,
  CheckCircle2,
  Shield,
  Lightbulb,
  Building2,
  Settings,
  Menu,
  Wrench,
  X,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import BottomNav from "./components/navigation/BottomNav";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "AWARE",
    icon: Eye,
    color: "text-blue-600",
    subItems: [
      { title: "Baseline", url: createPageUrl("Baseline"), icon: Search },
      { title: "Inspect", url: createPageUrl("Inspect"), icon: ClipboardCheck },
      { title: "Track", url: createPageUrl("Track"), icon: Activity },
    ]
  },
  {
    title: "ACT",
    icon: Zap,
    color: "text-orange-600",
    subItems: [
      { title: "Prioritize", url: createPageUrl("Prioritize"), icon: ListOrdered },
      { title: "Schedule", url: createPageUrl("Schedule"), icon: Calendar },
      { title: "Execute", url: createPageUrl("Execute"), icon: CheckCircle2 },
    ]
  },
  {
    title: "ADVANCE",
    icon: TrendingUp,
    color: "text-green-600",
    subItems: [
      { title: "Preserve", url: createPageUrl("Preserve"), icon: Shield },
      { title: "Upgrade", url: createPageUrl("Upgrade"), icon: Lightbulb },
      { title: "Scale", url: createPageUrl("Scale"), icon: Building2 },
    ]
  },
  {
    title: "Properties",
    url: createPageUrl("Properties"),
    icon: Home,
  },
  {
    title: "Services",
    url: createPageUrl("Services"),
    icon: Wrench,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [openSections, setOpenSections] = React.useState({
    AWARE: true,
    ACT: true,
    ADVANCE: true
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <>
      <style>{`
        :root {
          --primary: #1B365D;
          --secondary: #FF6B35;
          --accent: #28A745;
          --alert: #DC3545;
          --background: #FAFAF9;
        }
        
        /* Mobile-first base styles */
        * {
          -webkit-tap-highlight-color: rgba(255, 107, 53, 0.2);
        }
        
        html {
          font-size: 16px;
          -webkit-text-size-adjust: 100%;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.5;
        }
        
        /* Typography mobile-first */
        h1 { font-size: 28px; font-weight: 700; line-height: 1.2; }
        h2 { font-size: 22px; font-weight: 600; line-height: 1.3; }
        h3 { font-size: 18px; font-weight: 600; line-height: 1.4; }
        p, div { font-size: 16px; line-height: 1.5; }
        small { font-size: 14px; line-height: 1.4; }
        
        /* Touch targets minimum 44px */
        button, a, [role="button"] {
          min-height: 44px;
          min-width: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Form elements minimum 48px */
        input, textarea, select {
          min-height: 48px;
          font-size: 16px;
        }
        
        /* Disable zoom on input focus iOS */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          select, textarea, input {
            font-size: 16px;
          }
        }
        
        /* CRITICAL: Solid background styling for all modals and popups */
        [data-radix-dialog-overlay] {
          background-color: rgba(0, 0, 0, 0.75) !important;
          backdrop-filter: none !important;
        }
        
        [data-radix-dialog-content] {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
          border-radius: 8px !important;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
          padding: 16px !important;
          width: calc(100vw - 32px) !important;
          max-height: 85vh !important;
          overflow-y: auto !important;
        }
        
        @media (min-width: 768px) {
          [data-radix-dialog-content] {
            padding: 24px !important;
            width: auto !important;
            max-width: 600px !important;
          }
        }
        
        [data-radix-dialog-title] {
          color: #1B365D !important;
          font-size: 22px !important;
          font-weight: 700 !important;
        }
        
        [data-radix-dialog-content] input,
        [data-radix-dialog-content] textarea,
        [data-radix-dialog-content] select {
          background-color: #FFFFFF !important;
          border: 1px solid #CCCCCC !important;
          color: #333333 !important;
          opacity: 1 !important;
          min-height: 48px !important;
        }
        
        [data-radix-dialog-content] input:focus,
        [data-radix-dialog-content] textarea:focus,
        [data-radix-dialog-content] select:focus {
          border-color: #FF6B35 !important;
          outline: none !important;
        }
        
        [data-radix-select-content],
        [data-radix-popover-content],
        [data-radix-dropdown-menu-content] {
          background-color: #FFFFFF !important;
          opacity: 1 !important;
          border-radius: 8px !important;
          box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.15) !important;
        }
        
        /* Mobile spacing */
        @media (max-width: 767px) {
          .mobile-container {
            padding: 16px;
          }
          
          .mobile-section {
            margin-bottom: 24px;
          }
          
          .mobile-card {
            padding: 16px;
            border-radius: 8px;
            margin-bottom: 16px;
          }
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Hide scrollbar but keep functionality */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      <div className="min-h-screen flex w-full" style={{ backgroundColor: 'var(--background)' }}>
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden md:flex md:w-64 border-r border-gray-200 bg-white flex-col">
          <div className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B365D 0%, #2A4A7F 100%)' }}>
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">360° Method</h2>
                <p className="text-xs text-gray-500">Home Maintenance</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            {navigationItems.map((item) => {
              if (item.subItems) {
                const isOpen = openSections[item.title];
                return (
                  <div key={item.title} className="mb-2">
                    <button
                      onClick={() => toggleSection(item.title)}
                      className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="font-semibold flex-1 text-left">{item.title}</span>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="ml-4 mt-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.title}
                            to={subItem.url}
                            className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors ${
                              location.pathname === subItem.url ? 'bg-gray-100 font-medium' : ''
                            }`}
                          >
                            <subItem.icon className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-3 py-2 mb-1 hover:bg-gray-100 rounded-lg transition-colors ${
                    location.pathname === item.url ? 'bg-gray-100 font-medium' : ''
                  }`}
                >
                  <item.icon className="w-4 h-4 text-gray-600" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-200 p-4">
            <div className="text-xs text-gray-500 text-center">
              <p className="font-medium text-gray-700 mb-1">Prevent Disasters</p>
              <p>Turn $50 problems into savings, not $15K emergencies</p>
            </div>
          </div>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/75 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Slide-out Menu */}
        <div 
          className={`md:hidden fixed top-0 left-0 bottom-0 w-80 bg-white z-50 transform transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B365D 0%, #2A4A7F 100%)' }}>
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-gray-900">360° Method</h2>
                <p className="text-xs text-gray-500">Home Maintenance</p>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <div className="overflow-y-auto p-4" style={{ height: 'calc(100vh - 80px)' }}>
            {navigationItems.map((item) => {
              if (item.subItems) {
                const isOpen = openSections[item.title];
                return (
                  <div key={item.title} className="mb-4">
                    <button
                      onClick={() => toggleSection(item.title)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors"
                      style={{ minHeight: '48px' }}
                    >
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <span className="font-semibold flex-1 text-left text-lg">{item.title}</span>
                      {isOpen ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="ml-2 mt-2 space-y-1">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.title}
                            to={subItem.url}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors ${
                              location.pathname === subItem.url ? 'bg-gray-100 font-medium' : ''
                            }`}
                            style={{ minHeight: '48px' }}
                          >
                            <subItem.icon className="w-5 h-5 text-gray-500" />
                            <span className="text-base">{subItem.title}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }
              
              return (
                <Link
                  key={item.title}
                  to={item.url}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 mb-2 hover:bg-gray-100 rounded-lg transition-colors ${
                    location.pathname === item.url ? 'bg-gray-100 font-medium' : ''
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  <item.icon className="w-5 h-5 text-gray-600" />
                  <span className="text-lg">{item.title}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col">
          {/* Mobile Top Header */}
          <header className="md:hidden sticky top-0 bg-white border-b border-gray-200 z-30" style={{ height: '56px' }}>
            <div className="flex items-center justify-between h-full px-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <Menu className="w-6 h-6 text-gray-900" />
              </button>
              <h1 className="text-lg font-semibold text-gray-900">360° Method</h1>
              <div style={{ width: '44px' }} /> {/* Spacer for centering */}
            </div>
          </header>

          {/* Content Area with mobile padding for bottom nav */}
          <div className="flex-1 overflow-auto pb-16 md:pb-0">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </>
  );
}