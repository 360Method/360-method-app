import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

const PORTALS = {
  homeowner: {
    name: 'HOMEOWNER',
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
      { name: 'PropertyScore', url: 'PropertyScore' },
      { name: 'Score360', url: 'Score360' },
      { name: 'ExploreTemplates', url: 'ExploreTemplates' },
      { name: 'TemplateDetail', url: 'TemplateDetail' },
      { name: 'ResourceGuides', url: 'ResourceGuides' },
      { name: 'VideoTutorials', url: 'VideoTutorials' },
      { name: 'ROICalculators', url: 'ROICalculators' },
      { name: 'CartReview', url: 'CartReview' },
      { name: 'UpgradeProjectDetail', url: 'UpgradeProjectDetail' },
      { name: 'Services', url: 'Services' },
      { name: 'HomeCare', url: 'HomeCare' },
      { name: 'PropertyCare', url: 'PropertyCare' },
      { name: 'Checkout', url: 'Checkout' },
      { name: 'PaymentMethods', url: 'PaymentMethods' },
      { name: 'OwnerInvoices', url: 'OwnerInvoices' },
      { name: 'Settings', url: 'Settings' },
      { name: 'SecuritySettings', url: 'SecuritySettings' },
      { name: 'NotificationSettings', url: 'NotificationSettings' },
      { name: 'PropertyAccessSettings', url: 'PropertyAccessSettings' }
    ]
  },
  investor: {
    name: 'INVESTOR',
    pages: [
      { name: 'DashboardInvestor', url: 'DashboardInvestor' },
      { name: 'Scale', url: 'Scale' },
      { name: 'PortalDashboard', url: 'PortalDashboard' },
      { name: 'PortalMenu', url: 'PortalMenu' },
      { name: 'PortalMarketplace', url: 'PortalMarketplace' },
      { name: 'PortalOnboarding', url: 'PortalOnboarding' },
      { name: 'PortalBudget', url: 'PortalBudget' }
    ]
  },
  operator: {
    name: 'OPERATOR',
    pages: [
      { name: 'OperatorDashboard', url: 'OperatorDashboard' },
      { name: 'OperatorLeads', url: 'OperatorLeads' },
      { name: 'OperatorInspection', url: 'OperatorInspection' },
      { name: 'OperatorWorkOrders', url: 'OperatorWorkOrders' },
      { name: 'OperatorMarketplaceProfile', url: 'OperatorMarketplaceProfile' },
      { name: 'OperatorClients', url: 'OperatorClients' },
      { name: 'OperatorInvoices', url: 'OperatorInvoices' },
      { name: 'OperatorInvoiceCreate', url: 'OperatorInvoiceCreate' },
      { name: 'OperatorContractors', url: 'OperatorContractors' },
      { name: 'OperatorReportBuilder', url: 'OperatorReportBuilder' },
      { name: 'OperatorEarnings', url: 'OperatorEarnings' },
      { name: 'FindOperator', url: 'FindOperator' }
    ]
  },
  contractor: {
    name: 'CONTRACTOR',
    pages: [
      { name: 'ContractorDashboard', url: 'ContractorDashboard' },
      { name: 'ContractorJobDetail', url: 'ContractorJobDetail' },
      { name: 'ContractorMessages', url: 'ContractorMessages' },
      { name: 'ContractorProfile', url: 'ContractorProfile' },
      { name: 'ContractorOnboarding', url: 'ContractorOnboarding' }
    ]
  },
  admin: {
    name: 'ADMIN',
    pages: [
      { name: 'AdminJobQueue', url: 'AdminJobQueue' },
      { name: 'AdminStripe', url: 'AdminStripe' },
      { name: 'AdminStripeDebug', url: 'AdminStripeDebug' },
      { name: 'AdminEmailTest', url: 'AdminEmailTest' }
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
      { name: 'Onboarding', url: 'Onboarding' },
      { name: 'AcceptInvitation', url: 'AcceptInvitation' },
      { name: 'Pricing', url: 'Pricing' },
      { name: 'Resources', url: 'Resources' }
    ]
  }
};

export default function PortalSwitcher() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

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
        className="fixed bottom-4 right-4 bg-gray-900/90 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-800 text-xs font-mono z-[200] backdrop-blur-sm"
        title="Press Ctrl+Shift+D to toggle"
      >
        🔧 DEV
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
        {Object.entries(PORTALS).map(([key, portal]) => (
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
                {portal.pages.length}
              </span>
            </button>

            {expanded[key] && (
              <div className="ml-5 mt-0.5 space-y-0.5">
                {portal.pages.map((page) => (
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
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}