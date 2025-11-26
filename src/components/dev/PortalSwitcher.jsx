import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

const PORTALS = {
  homeowner: {
    name: '🏠 Homeowner Portal',
    pages: [
      { name: 'Dashboard', url: 'DashboardHomeowner' },
      { name: 'Properties', url: 'Properties' },
      { name: 'Baseline', url: 'Baseline' },
      { name: 'Inspect', url: 'Inspect' },
      { name: 'Track', url: 'Track' },
      { name: 'Prioritize', url: 'Prioritize' },
      { name: 'Schedule', url: 'Schedule' },
      { name: 'Execute', url: 'Execute' },
      { name: 'Preserve', url: 'Preserve' },
      { name: 'Upgrade', url: 'Upgrade' },
      { name: 'Property Score', url: 'PropertyScore' },
      { name: 'Score 360', url: 'Score360' },
      { name: 'Services', url: 'Services' },
      { name: 'HomeCare', url: 'HomeCare' },
      { name: 'PropertyCare', url: 'PropertyCare' },
      { name: 'Cart Review', url: 'CartReview' },
      { name: 'Payment Methods', url: 'PaymentMethods' },
      { name: 'Invoices', url: 'OwnerInvoices' },
      { name: 'Settings', url: 'Settings' }
    ]
  },
  investor: {
    name: '🏢 Investor Portal',
    pages: [
      { name: 'Dashboard', url: 'DashboardInvestor' },
      { name: 'Scale', url: 'Scale' },
      { name: 'Portal Dashboard', url: 'PortalDashboard' },
      { name: 'Portal Menu', url: 'PortalMenu' },
      { name: 'Portal Marketplace', url: 'PortalMarketplace' },
      { name: 'Portal Budget', url: 'PortalBudget' }
    ]
  },
  operator: {
    name: '🔧 Operator Portal',
    pages: [
      { name: 'Dashboard', url: 'OperatorDashboard' },
      { name: 'Leads', url: 'OperatorLeads' },
      { name: 'Work Orders', url: 'OperatorWorkOrders' },
      { name: 'Inspections', url: 'OperatorInspection' },
      { name: 'Clients', url: 'OperatorClients' },
      { name: 'Invoices', url: 'OperatorInvoices' },
      { name: 'Create Invoice', url: 'OperatorInvoiceCreate' },
      { name: 'Contractors', url: 'OperatorContractors' },
      { name: 'Reports', url: 'OperatorReportBuilder' },
      { name: 'Earnings', url: 'OperatorEarnings' },
      { name: 'Profile', url: 'OperatorMarketplaceProfile' }
    ]
  },
  contractor: {
    name: '👷 Contractor Portal',
    pages: [
      { name: 'Dashboard', url: 'ContractorDashboard' },
      { name: 'Job Detail', url: 'ContractorJobDetail' },
      { name: 'Messages', url: 'ContractorMessages' },
      { name: 'Profile', url: 'ContractorProfile' },
      { name: 'Onboarding', url: 'ContractorOnboarding' }
    ]
  },
  admin: {
    name: '⚙️ Admin Portal',
    pages: [
      { name: 'Job Queue', url: 'AdminJobQueue' },
      { name: 'Stripe', url: 'AdminStripe' },
      { name: 'Stripe Debug', url: 'AdminStripeDebug' },
      { name: 'Email Test', url: 'AdminEmailTest' }
    ]
  },
  demo: {
    name: '🎭 Demo Pages',
    pages: [
      { name: 'Demo Entry', url: 'DemoEntry' },
      { name: 'Struggling', url: 'DemoStruggling' },
      { name: 'Improving', url: 'DemoImproving' },
      { name: 'Excellent', url: 'DemoExcellent' },
      { name: 'Portfolio', url: 'DemoPortfolio' },
      { name: 'Welcome', url: 'Welcome' },
      { name: 'Landing', url: 'LandingPage' },
      { name: 'Waitlist', url: 'Waitlist' }
    ]
  }
};

export default function PortalSwitcher() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

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

  // Hide in production
  if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('base44.app')) {
    return null;
  }

  if (!visible) {
    return (
      <button
        onClick={() => setVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-purple-700 text-xs font-mono z-[200]"
        title="Press Ctrl+Shift+D to toggle"
      >
        DEV 🚀
      </button>
    );
  }

  const togglePortal = (portalKey) => {
    setExpanded(prev => ({ ...prev, [portalKey]: !prev[portalKey] }));
  };

  const navigateToPage = (pageUrl) => {
    navigate(createPageUrl(pageUrl));
    setVisible(false);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 border-purple-600 rounded-lg shadow-2xl w-80 max-h-[600px] overflow-y-auto z-[200]">
      {/* Header */}
      <div className="sticky top-0 bg-purple-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">PORTAL SWITCHER</span>
          <span className="text-xs opacity-75">(Ctrl+Shift+D)</span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="hover:bg-purple-700 p-1 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Portal List */}
      <div className="p-2">
        {Object.entries(PORTALS).map(([key, portal]) => (
          <div key={key} className="mb-2">
            <button
              onClick={() => togglePortal(key)}
              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-left text-sm font-semibold"
            >
              {expanded[key] ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {portal.name}
              <span className="ml-auto text-xs text-gray-500">
                {portal.pages.length}
              </span>
            </button>

            {expanded[key] && (
              <div className="ml-6 mt-1 space-y-1">
                {portal.pages.map((page) => (
                  <button
                    key={page.url}
                    onClick={() => navigateToPage(page.url)}
                    className="block w-full text-left px-3 py-1.5 text-sm hover:bg-purple-50 rounded"
                  >
                    {page.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}