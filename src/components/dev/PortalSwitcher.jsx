import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { useDemo } from '../shared/DemoContext';

const PORTALS = {
  property_owner: {
    name: 'PROPERTY OWNER',
    sections: {
      dashboards: {
        name: 'Dashboards',
        pages: [
          { name: 'Dashboard (current)', url: 'Dashboard' },
          { name: 'PortalDashboard (unified/mobile)', url: 'PortalDashboard' }
        ]
      },
      aware: {
        name: 'AWARE Phase',
        pages: [
          { name: 'Properties', url: 'Properties' },
          { name: 'Baseline', url: 'Baseline' },
          { name: 'Inspect', url: 'Inspect' },
          { name: 'Track', url: 'Track' },
          { name: 'Budget', url: 'PortalBudget' }
        ]
      },
      act: {
        name: 'ACT Phase',
        pages: [
          { name: 'Prioritize', url: 'Prioritize' },
          { name: 'Schedule', url: 'Schedule' },
          { name: 'Execute', url: 'Execute' }
        ]
      },
      advance: {
        name: 'ADVANCE Phase',
        pages: [
          { name: 'Preserve', url: 'Preserve' },
          { name: 'Upgrade', url: 'Upgrade' },
          { name: 'Scale', url: 'Scale' }
        ]
      },
      services: {
        name: 'Services & Marketplace',
        pages: [
          { name: 'Services', url: 'Services' },
          { name: 'HomeCare', url: 'HomeCare' },
          { name: 'PropertyCare', url: 'PropertyCare' },
          { name: 'FindOperator', url: 'FindOperator' },
          { name: 'ExploreTemplates', url: 'ExploreTemplates' },
          { name: 'TemplateDetail', url: 'TemplateDetail' },
          { name: 'CartReview', url: 'CartReview' },
          { name: 'UpgradeProjectDetail', url: 'UpgradeProjectDetail' },
          { name: 'Checkout', url: 'Checkout' }
        ]
      },
      resources: {
        name: 'Resources',
        pages: [
          { name: 'ResourceGuides', url: 'ResourceGuides' },
          { name: 'VideoTutorials', url: 'VideoTutorials' },
          { name: 'ROICalculators', url: 'ROICalculators' },
          { name: 'PropertyScore', url: 'PropertyScore' },
          { name: 'Score360', url: 'Score360' }
        ]
      },
      account: {
        name: 'Account',
        pages: [
          { name: 'Settings', url: 'Settings' },
          { name: 'SecuritySettings', url: 'SecuritySettings' },
          { name: 'NotificationSettings', url: 'NotificationSettings' },
          { name: 'PropertyAccessSettings', url: 'PropertyAccessSettings' },
          { name: 'PaymentMethods', url: 'PaymentMethods' },
          { name: 'OwnerInvoices', url: 'OwnerInvoices' },
          { name: 'Onboarding', url: 'Onboarding' },
          { name: 'Onboarding (Alternate)', url: 'PortalOnboarding' }
        ]
      }
    }
  },
  operator: {
    name: 'OPERATOR',
    pages: [
      { name: 'Dashboard', url: 'OperatorDashboard' },
      { name: 'Leads', url: 'OperatorLeads' },
      { name: 'Inspection', url: 'OperatorInspection' },
      { name: 'Work Orders', url: 'OperatorWorkOrders' },
      { name: 'Marketplace Profile', url: 'OperatorMarketplaceProfile' },
      { name: 'Clients', url: 'OperatorClients' },
      { name: 'Invoices', url: 'OperatorInvoices' },
      { name: 'Create Invoice', url: 'OperatorInvoiceCreate' },
      { name: 'Contractors', url: 'OperatorContractors' },
      { name: 'Report Builder', url: 'OperatorReportBuilder' },
      { name: 'Earnings', url: 'OperatorEarnings' }
    ]
  },
  contractor: {
    name: 'CONTRACTOR',
    pages: [
      { name: 'Dashboard', url: 'ContractorDashboard' },
      { name: 'Job Detail', url: 'ContractorJobDetail' },
      { name: 'Messages', url: 'ContractorMessages' },
      { name: 'Profile', url: 'ContractorProfile' },
      { name: 'Onboarding', url: 'ContractorOnboarding' }
    ]
  },
  admin: {
    name: 'ADMIN',
    pages: [
      { name: 'Job Queue', url: 'AdminJobQueue' },
      { name: 'Stripe', url: 'AdminStripe' },
      { name: 'Stripe Debug', url: 'AdminStripeDebug' },
      { name: 'Email Test', url: 'AdminEmailTest' }
    ]
  },
  demo: {
    name: 'DEMO',
    pages: [
      { name: 'Welcome', url: 'Welcome' },
      { name: 'Waitlist', url: 'Waitlist' },
      { name: 'DemoEntry', url: 'DemoEntry' },
      { name: 'DemoStruggling', url: 'DemoStruggling' },
      { name: 'DemoImproving', url: 'DemoImproving' },
      { name: 'DemoExcellent', url: 'DemoExcellent' },
      { name: 'DemoPortfolio', url: 'DemoPortfolio' },
      { name: 'WelcomeDemo', url: 'WelcomeDemo' },
      { name: 'GitHubDemo', url: 'GitHubDemo' }
    ]
  },
  other: {
    name: 'OTHER',
    pages: [
      { name: 'Accept Invitation', url: 'AcceptInvitation' },
      { name: 'Pricing', url: 'Pricing' },
      { name: 'Landing Page', url: 'LandingPage' },
      { name: 'Resources', url: 'Resources' }
    ]
  }
};

export default function PortalSwitcher() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { enterDemoMode, exitDemoMode } = useDemo();

  // Toggle visibility with Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-20 right-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg shadow-xl text-sm font-semibold z-[9999] flex items-center gap-2 transition-all border-2 border-purple-400"
        title="Open Portal Switcher"
      >
        🚀 Portals
      </button>
    );
  }

  const togglePortal = (portalKey) => {
    setExpanded(prev => ({ ...prev, [portalKey]: !prev[portalKey] }));
  };

  const navigateToPage = (pageUrl) => {
    const path = createPageUrl(pageUrl);
    
    // Check if destination is a demo page
    const isDemoPage = 
      pageUrl === 'Welcome' ||
      pageUrl === 'Waitlist' ||
      pageUrl === 'DemoEntry' ||
      pageUrl === 'DemoStruggling' ||
      pageUrl === 'DemoImproving' ||
      pageUrl === 'DemoExcellent' ||
      pageUrl === 'DemoPortfolio' ||
      pageUrl === 'WelcomeDemo' ||
      pageUrl === 'GitHubDemo' ||
      pageUrl.startsWith('Demo');
    
    // Toggle demo mode based on destination
    if (isDemoPage) {
      // Determine which demo mode based on page name
      if (pageUrl === 'DemoStruggling') {
        enterDemoMode('homeowner', 'struggling');
      } else if (pageUrl === 'DemoImproving') {
        enterDemoMode('homeowner', 'improving');
      } else if (pageUrl === 'DemoExcellent') {
        enterDemoMode('homeowner', 'excellent');
      } else if (pageUrl === 'DemoPortfolio') {
        enterDemoMode('investor');
      } else {
        enterDemoMode('homeowner');
      }
    } else {
      // Clear demo mode without redirecting - just clear session storage
      sessionStorage.removeItem('demoMode');
      sessionStorage.removeItem('demoWizardSeen');
      sessionStorage.removeItem('demoVisitedSteps');
    }
    
    navigate(path);
    setVisible(false);
  };

  const isCurrentPage = (pageUrl) => {
    return location.pathname === createPageUrl(pageUrl);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl w-80 max-h-[600px] overflow-y-auto z-[200]">
      {/* Header */}
      <div className="sticky top-0 bg-gray-950 text-white px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold">DEV PORTAL</span>
          <span className="text-[10px] text-gray-400">(Ctrl+Shift+D)</span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="hover:bg-gray-800 p-1 rounded"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Portal List */}
      <div className="p-2">
        {Object.entries(PORTALS).map(([key, portal]) => {
          // Calculate total page count
          const totalPages = portal.sections 
            ? Object.values(portal.sections).reduce((sum, section) => sum + section.pages.length, 0)
            : portal.pages.length;

          return (
            <div key={key} className="mb-1">
              <button
                onClick={() => togglePortal(key)}
                className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-gray-800 rounded text-left text-xs font-semibold text-gray-300"
              >
                {expanded[key] ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
                {portal.name}
                <span className="ml-auto text-[10px] text-gray-500">
                  {totalPages}
                </span>
              </button>

              {expanded[key] && (
                <div className="ml-3 mt-0.5 space-y-0.5">
                  {/* Handle portals with sections (property_owner) */}
                  {portal.sections ? (
                    Object.entries(portal.sections).map(([sectionKey, section]) => (
                      <div key={sectionKey} className="mb-2">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1 font-semibold">
                          {section.name}
                        </div>
                        <div className="space-y-0.5">
                          {section.pages.map((page) => (
                            <button
                              key={page.url}
                              onClick={() => navigateToPage(page.url)}
                              className={`block w-full text-left px-2 py-1 text-xs rounded transition-colors ml-2 ${
                                isCurrentPage(page.url)
                                  ? 'bg-blue-600 text-white font-medium'
                                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              }`}
                            >
                              → {page.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    /* Handle portals without sections (operator, contractor, etc) */
                    portal.pages.map((page) => (
                      <button
                        key={page.url}
                        onClick={() => navigateToPage(page.url)}
                        className={`block w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                          isCurrentPage(page.url)
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        }`}
                      >
                        → {page.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}