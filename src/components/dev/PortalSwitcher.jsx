import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronDown, ChevronRight, X } from 'lucide-react';

const PORTALS = {
  homeowner: {
    name: 'HOMEOWNER',
    pages: [
      { name: 'HomeownerDashboard', url: 'HomeownerDashboard' },
      { name: 'HomeownerProperties', url: 'HomeownerProperties' },
      { name: 'HomeownerBaseline', url: 'HomeownerBaseline' },
      { name: 'HomeownerInspect', url: 'HomeownerInspect' },
      { name: 'HomeownerTrack', url: 'HomeownerTrack' },
      { name: 'HomeownerPrioritize', url: 'HomeownerPrioritize' },
      { name: 'HomeownerSchedule', url: 'HomeownerSchedule' },
      { name: 'HomeownerExecute', url: 'HomeownerExecute' },
      { name: 'HomeownerPreserve', url: 'HomeownerPreserve' },
      { name: 'HomeownerUpgrade', url: 'HomeownerUpgrade' },
      { name: 'HomeownerPropertyScore', url: 'HomeownerPropertyScore' },
      { name: 'HomeownerScore360', url: 'HomeownerScore360' },
      { name: 'HomeownerExploreTemplates', url: 'HomeownerExploreTemplates' },
      { name: 'HomeownerTemplateDetail', url: 'HomeownerTemplateDetail' },
      { name: 'HomeownerResourceGuides', url: 'HomeownerResourceGuides' },
      { name: 'HomeownerVideoTutorials', url: 'HomeownerVideoTutorials' },
      { name: 'HomeownerROICalculators', url: 'HomeownerROICalculators' },
      { name: 'HomeownerCartReview', url: 'HomeownerCartReview' },
      { name: 'HomeownerUpgradeProjectDetail', url: 'HomeownerUpgradeProjectDetail' },
      { name: 'HomeownerServices', url: 'HomeownerServices' },
      { name: 'HomeownerHomeCare', url: 'HomeownerHomeCare' },
      { name: 'HomeownerPropertyCare', url: 'HomeownerPropertyCare' },
      { name: 'HomeownerCheckout', url: 'HomeownerCheckout' },
      { name: 'HomeownerPaymentMethods', url: 'HomeownerPaymentMethods' },
      { name: 'HomeownerInvoices', url: 'HomeownerInvoices' },
      { name: 'HomeownerSettings', url: 'HomeownerSettings' },
      { name: 'HomeownerSecuritySettings', url: 'HomeownerSecuritySettings' },
      { name: 'HomeownerNotificationSettings', url: 'HomeownerNotificationSettings' },
      { name: 'HomeownerPropertyAccessSettings', url: 'HomeownerPropertyAccessSettings' }
    ]
  },
  investor: {
    name: 'INVESTOR',
    pages: [
      { name: 'InvestorDashboard', url: 'InvestorDashboard' },
      { name: 'InvestorScale', url: 'InvestorScale' },
      { name: 'InvestorPortalDashboard', url: 'InvestorPortalDashboard' },
      { name: 'InvestorPortalMenu', url: 'InvestorPortalMenu' },
      { name: 'InvestorPortalMarketplace', url: 'InvestorPortalMarketplace' },
      { name: 'InvestorPortalOnboarding', url: 'InvestorPortalOnboarding' },
      { name: 'InvestorPortalBudget', url: 'InvestorPortalBudget' }
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
      { name: 'OperatorFindOperator', url: 'OperatorFindOperator' }
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
      { name: 'DemoWelcome', url: 'DemoWelcome' },
      { name: 'DemoWaitlist', url: 'DemoWaitlist' },
      { name: 'DemoEntry', url: 'DemoEntry' },
      { name: 'DemoStruggling', url: 'DemoStruggling' },
      { name: 'DemoImproving', url: 'DemoImproving' },
      { name: 'DemoExcellent', url: 'DemoExcellent' },
      { name: 'DemoPortfolio', url: 'DemoPortfolio' },
      { name: 'DemoWelcomeDemo', url: 'DemoWelcomeDemo' },
      { name: 'DemoGitHub', url: 'DemoGitHub' }
    ]
  },
  other: {
    name: 'OTHER',
    pages: [
      { name: 'Onboarding', url: 'Onboarding' },
      { name: 'AcceptInvitation', url: 'AcceptInvitation' },
      { name: 'Pricing', url: 'Pricing' },
      { name: 'Resources', url: 'Resources' },
      { name: 'LandingPage', url: 'LandingPage' }
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