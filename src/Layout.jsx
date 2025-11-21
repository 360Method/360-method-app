import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import {
  Home,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  UserCircle,
  LogOut,
  Settings,
  Wrench,
  Sparkles,
  Lock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "./components/navigation/BottomNav";
import CartDrawer from "./components/cart/CartDrawer";
import HelpSystem from "./components/shared/HelpSystem";
import ProgressiveEducation from "./components/shared/ProgressiveEducation";
import { NAVIGATION_STRUCTURE, isNavItemLocked } from "./components/shared/navigationConfig";
import { DemoProvider, useDemo } from "./components/shared/DemoContext";
import { DemoBanner } from "./components/demo/DemoBanner";
import FloatingWaitlistCTA from "./components/demo/FloatingWaitlistCTA";
import ExitIntentPopup from "./components/demo/ExitIntentPopup";

function LayoutContent({ children }) {
  const location = useLocation();
  const { demoMode } = useDemo();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [openSections, setOpenSections] = React.useState({
    "Phase I: AWARE": true,
    "Phase II: ACT": true,
    "Phase III: ADVANCE": true
  });
  const [showQuickAddMenu, setShowQuickAddMenu] = React.useState(false);

  // Scroll to top on route change
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Determine if we should show the app UI (sidebar, header, etc.)
  const isLandingPage = location.pathname === '/' || location.pathname === '/welcome' || location.pathname === createPageUrl('Welcome');
  const isWaitlistPage = location.pathname === createPageUrl('Waitlist');
  const showAppUI = !isLandingPage && !isWaitlistPage;

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft);
    },
    retry: false,
  });

  const selectedProperty = properties[0];

  const { data: systems = [] } = useQuery({
    queryKey: ['systemBaselines', selectedProperty?.id],
    queryFn: () => base44.entities.SystemBaseline.filter({
      property_id: selectedProperty?.id
    }),
    enabled: !!selectedProperty?.id
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty?.id],
    queryFn: () => base44.entities.MaintenanceTask.filter({
      property_id: selectedProperty?.id
    }),
    enabled: !!selectedProperty?.id
  });

  const urgentTasks = tasks.filter(t =>
    (t.priority === 'High' || t.cascade_risk_score >= 7) &&
    t.status !== 'Completed'
  );

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const getCurrentPhase = () => {
    if (!selectedProperty) return null;
    const baseline = selectedProperty.baseline_completion || 0;
    if (baseline < 66) return "AWARE";
    if (baseline < 100) return "ACT";
    return "ADVANCE";
  };

  const getNextStep = () => {
    if (!selectedProperty) return "Add Property";
    const baseline = selectedProperty.baseline_completion || 0;
    if (baseline === 0) return "Start Baseline";
    if (baseline < 66) return "Continue Baseline";
    if (baseline < 100) return "Prioritize Tasks";
    return "Schedule Maintenance";
  };

  const AccountDropdown = ({ isMobile = false }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={isMobile ? "icon" : "sm"}
          className={isMobile ? "flex-shrink-0" : "gap-2"}
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <UserCircle className="w-6 h-6" />
          {!isMobile && user && (
            <span className="text-sm font-medium">{user.full_name || user.email}</span>
          )}
          {!isMobile && <ChevronDown className="w-4 h-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56" style={{ backgroundColor: '#FFFFFF' }}>
        {user && (
          <>
            <div className="px-3 py-2 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-900">{user.full_name || 'User'}</p>
              <p className="text-xs text-gray-600">{user.email}</p>
              {user.role && (
                <p className="text-xs text-blue-600 mt-1 capitalize">{user.role}</p>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={() => window.location.href = createPageUrl("Settings")}>
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.location.href = createPageUrl("Services")}>
          <Wrench className="w-4 h-4 mr-2" />
          Professional Services
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.location.href = createPageUrl("Pricing")}>
          <Sparkles className="w-4 h-4 mr-2" />
          Plans & Pricing
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      <Toaster position="top-center" richColors closeButton />
      <DemoBanner onAddProperty={() => setShowQuickAddMenu(true)} />

      <div className="min-h-screen flex w-full overflow-x-hidden" style={{ backgroundColor: showAppUI ? 'var(--background)' : '#FFFFFF' }}>
        {showAppUI && (
          <ProgressiveEducation
            user={user}
            properties={properties}
            selectedProperty={selectedProperty}
            systems={systems}
            tasks={tasks}
          />
        )}

        {/* Desktop Sidebar - Only show if not landing/waitlist */}
        {showAppUI && (
          <aside className="hidden md:flex md:w-64 border-r border-gray-200 bg-white flex-col">
            <div className="border-b border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1B365D 0%, #2A4A7F 100%)' }}>
                  <Home className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">360° Method</h2>
                  <p className="text-xs text-gray-500">Asset Command Center</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {NAVIGATION_STRUCTURE.map((section) => (
                <div key={section.section} className="mb-4">
                  {section.section !== "Core" && (
                    <button
                      onClick={() => toggleSection(section.section)}
                      className="w-full flex items-center justify-between px-3 py-2 mb-1"
                    >
                      <div className="text-left">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {section.section}
                        </h3>
                        {section.sectionSubtitle && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {section.sectionSubtitle}
                          </p>
                        )}
                      </div>
                      {openSections[section.section] ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  )}

                  {(section.section === "Core" || openSections[section.section]) && (
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isLocked = isNavItemLocked(item, selectedProperty);
                        const isActive = location.pathname === item.url;
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.id}
                            to={isLocked ? '#' : item.url}
                            data-tour={`sidebar-${item.id.toLowerCase()}`}
                            onClick={(e) => {
                              if (isLocked) {
                                e.preventDefault();
                                toast.info(item.unlockHint || "Complete previous steps to unlock");
                              }
                            }}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                              isActive ? 'bg-blue-50 text-blue-700' :
                              isLocked ? 'text-gray-400 cursor-not-allowed opacity-60' :
                              'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <Icon className="w-4 h-4 flex-shrink-0" />

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">
                                  {item.label}
                                </span>
                                {item.step && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs flex-shrink-0"
                                  >
                                    {item.step}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 truncate">
                                {item.subtitle}
                              </p>
                            </div>

                            {isLocked && (
                              <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-2 space-y-2">
              <HelpSystem
                currentPhase={getCurrentPhase()}
                nextStep={getNextStep()}
                selectedProperty={selectedProperty}
                systems={systems}
                tasks={tasks}
              />
              <div className="px-1">
                <AccountDropdown isMobile={false} />
              </div>
            </div>
          </aside>
        )}

        {/* Mobile Menu - Only show if not landing/waitlist */}
        {showAppUI && (
          <>
            {mobileMenuOpen && (
              <div
                className="md:hidden fixed inset-0 bg-black/75 z-[60]"
                onClick={() => setMobileMenuOpen(false)}
              />
            )}

            <div
              className={`md:hidden fixed top-0 left-0 bottom-0 w-80 bg-white z-[70] transform transition-transform duration-300 ${
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
                    <p className="text-xs text-gray-500">Asset Command Center</p>
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

              <div className="overflow-y-auto p-4" style={{ height: 'calc(100vh - 160px)' }}>
                {NAVIGATION_STRUCTURE.map((section) => (
                  <div key={section.section} className="mb-4">
                    {section.section !== "Core" && (
                      <button
                        onClick={() => toggleSection(section.section)}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg transition-colors"
                        style={{ minHeight: '48px' }}
                      >
                        <div className="text-left">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {section.section}
                          </h3>
                          {section.sectionSubtitle && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {section.sectionSubtitle}
                            </p>
                          )}
                        </div>
                        {openSections[section.section] ? (
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-gray-500" />
                        )}
                      </button>
                    )}

                    {(section.section === "Core" || openSections[section.section]) && (
                      <div className="space-y-1 mt-2">
                        {section.items.map((item) => {
                          const isLocked = isNavItemLocked(item, selectedProperty);
                          const isActive = location.pathname === item.url;
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.id}
                              to={isLocked ? '#' : item.url}
                              data-tour={`sidebar-${item.id.toLowerCase()}`}
                              onClick={(e) => {
                                if (isLocked) {
                                  e.preventDefault();
                                  toast.info(item.unlockHint || "Complete previous steps to unlock");
                                } else {
                                  setMobileMenuOpen(false);
                                }
                              }}
                              className={`flex items-center gap-3 p-3 hover:bg-gray-100 rounded-lg transition-colors ${
                                isActive ? 'bg-gray-100 font-medium' : ''
                              } ${isLocked ? 'opacity-60' : ''}`}
                              style={{ minHeight: '48px' }}
                            >
                              <Icon className="w-5 h-5 text-gray-500" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-base">{item.label}</span>
                                  {item.step && (
                                    <Badge variant="outline" className="text-xs">
                                      {item.step}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {item.subtitle}
                                </p>
                              </div>
                              {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 p-4">
                {user && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-900">{user.full_name || 'User'}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 gap-2"
                      style={{ minHeight: '44px' }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <main className={`flex-1 flex flex-col overflow-x-hidden ${showAppUI ? '' : 'w-full'}`}>
          {/* Mobile Header - Only show if not landing/waitlist */}
          {showAppUI && (
            <header className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-[50]" style={{ height: '56px' }}>
              <div className="flex items-center justify-between h-full px-4">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  data-tour="menu-button"
                  className="p-3 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                  style={{ minHeight: '48px', minWidth: '48px' }}
                >
                  <Menu className="w-7 h-7 text-gray-900" />
                </button>
                <div className="text-center">
                  <h1 className="text-sm font-semibold text-gray-900">360° Method</h1>
                  <p className="text-xs text-gray-500">Asset Command Center</p>
                </div>
                <div className="flex items-center gap-1">
                  <HelpSystem
                    currentPhase={getCurrentPhase()}
                    nextStep={getNextStep()}
                    selectedProperty={selectedProperty}
                    systems={systems}
                    tasks={tasks}
                  />
                  <AccountDropdown isMobile={true} />
                </div>
              </div>
            </header>
          )}

          <div className={`flex-1 overflow-auto overflow-x-hidden ${showAppUI ? (demoMode ? 'pt-[56px] md:pt-0' : 'pt-[56px] pb-[80px] md:pt-0 md:pb-0') : ''}`}>
            {children}
          </div>
        </main>

        {/* Bottom Nav - Only show if not landing/waitlist and not in demo mode */}
        {showAppUI && !demoMode && (
          <BottomNav
            taskCount={urgentTasks?.length || 0}
            onQuickAdd={() => setShowQuickAddMenu(true)}
            selectedProperty={selectedProperty}
          />
        )}

        {showAppUI && <CartDrawer />}
        <FloatingWaitlistCTA />
        <ExitIntentPopup />
        </div>

      <style>{`
        /* Interactive Tour Animations - Enhanced */

        /* Pulsing ring around highlighted element */
        @keyframes pulse-ring {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.03);
            opacity: 0.9;
          }
        }

        .animate-pulse-ring {
          animation: pulse-ring 2s ease-in-out infinite;
        }

        /* Ripple effect expanding outward */
        @keyframes ripple {
          0% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.15);
            opacity: 0.3;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        .animate-ripple {
          animation: ripple 2s ease-out infinite;
        }

        /* Hand tap bounce */
        @keyframes tap-bounce {
          0%, 100% { 
            transform: scale(1) translateY(0); 
          }
          25% { 
            transform: scale(0.95) translateY(8px); 
          }
          50% { 
            transform: scale(1.05) translateY(-4px); 
          }
          75% { 
            transform: scale(0.98) translateY(2px); 
          }
        }

        .animate-tap-bounce {
          animation: tap-bounce 1.8s ease-in-out infinite;
        }

        /* Wiggle animation for hand icon */
        @keyframes wiggle {
          0%, 100% { 
            transform: rotate(-5deg); 
          }
          50% { 
            transform: rotate(5deg); 
          }
        }

        .animate-wiggle {
          animation: wiggle 0.8s ease-in-out infinite;
        }

        /* Slow bounce for arrows */
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        :root {
          --primary: #1B365D;
          --secondary: #FF6B35;
          --accent: #28A745;
          --alert: #DC3545;
          --background: #FAFAF9;
        }

        * {
          -webkit-tap-highlight-color: rgba(255, 107, 53, 0.2);
        }

        html {
          font-size: 16px;
          -webkit-text-size-adjust: 100%;
          scroll-behavior: smooth;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          line-height: 1.5;
        }

        h1 { font-size: 28px; font-weight: 700; line-height: 1.2; }
        h2 { font-size: 22px; font-weight: 600; line-height: 1.3; }
        h3 { font-size: 18px; font-weight: 600; line-height: 1.4; }
        p, div { font-size: 16px; line-height: 1.5; }
        small { font-size: 14px; line-height: 1.4; }

        button, a, [role="button"] {
          min-height: 44px;
          min-width: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        input, textarea, select {
          min-height: 48px;
          font-size: 16px;
        }

        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          select, textarea, input {
            font-size: 16px;
          }
        }

        [data-radix-dialog-overlay] {
          background-color: rgba(0, 0, 0, 0.75) !important;
          backdrop-filter: none !important;
          z-index: 100 !important;
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
          z-index: 101 !important;
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
          z-index: 102 !important;
        }

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

          body {
            padding-bottom: env(safe-area-inset-bottom);
            overflow-x: hidden;
          }

          * {
            max-width: 100vw;
          }

          img, video, iframe {
            max-width: 100%;
            height: auto;
          }
        }

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}

export default function Layout({ children }) {
  return (
    <DemoProvider>
      <LayoutContent>{children}</LayoutContent>
    </DemoProvider>
  );
}