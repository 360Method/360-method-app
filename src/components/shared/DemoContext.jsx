import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PROPERTY_HOMEOWNER } from './demoPropertyHomeowner';
import { getDemoPropertyStruggling } from './demoPropertyStruggling';
import { getDemoPropertyImproving } from './demoPropertyImproving';
import { getDemoPropertyExcellent } from './demoPropertyExcellent';
import { DEMO_PORTFOLIO_INVESTOR } from './demoPropertyInvestor';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import DemoWizard from '../demo/DemoWizard';
import InvestorDemoWizard from '../demo/InvestorDemoWizard';

const DemoContext = createContext();

export function DemoProvider({ children }) {
  const [demoMode, setDemoMode] = useState(null); // null, 'homeowner', 'struggling', 'improving', or 'investor'
  const [demoData, setDemoData] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [visitedSteps, setVisitedSteps] = useState([]);
  const navigate = useNavigate();
  
  const enterDemoMode = (userType = 'homeowner', scoreLevel = null) => {
    console.log(`🎬 Entering demo mode: ${userType}${scoreLevel ? ` (${scoreLevel})` : ''}`);
    console.log('🎬 sessionStorage BEFORE:', sessionStorage.getItem('demoMode'));

    if (userType === 'investor') {
      setDemoMode('investor');
      setDemoData(DEMO_PORTFOLIO_INVESTOR);
      sessionStorage.setItem('demoMode', 'investor');
      console.log('🎬 Set demoMode to investor');
    } else if (userType === 'struggling' || scoreLevel === 'struggling') {
      setDemoMode('struggling');
      setDemoData(getDemoPropertyStruggling()); // Call function to get fresh data with today's dates
      sessionStorage.setItem('demoMode', 'struggling');
      console.log('🎬 Set demoMode to struggling');
    } else if (scoreLevel === 'improving') {
      setDemoMode('improving');
      setDemoData(getDemoPropertyImproving()); // Call function to get fresh data with today's dates
      sessionStorage.setItem('demoMode', 'improving');
    } else if (scoreLevel === 'excellent') {
      setDemoMode('excellent');
      setDemoData(getDemoPropertyExcellent()); // Call function to get fresh data with today's dates
      sessionStorage.setItem('demoMode', 'excellent');
    } else {
      setDemoMode('homeowner');
      setDemoData(DEMO_PROPERTY_HOMEOWNER);
      sessionStorage.setItem('demoMode', 'homeowner');
    }
    
    // Check if wizard has been seen this session
    const hasSeenWizard = sessionStorage.getItem('demoWizardSeen');
    if (!hasSeenWizard) {
      setShowWizard(true);
    }

    console.log('Demo data loaded for:', userType, scoreLevel);
    console.log('🎬 sessionStorage AFTER:', sessionStorage.getItem('demoMode'));
  };
  
  const markStepVisited = (stepNumber) => {
    if (!visitedSteps.includes(stepNumber)) {
      const updated = [...visitedSteps, stepNumber];
      setVisitedSteps(updated);
      sessionStorage.setItem('demoVisitedSteps', JSON.stringify(updated));
    }
  };
  
  const clearDemoMode = () => {
    // Clear demo mode WITHOUT redirecting (for portal switcher)
    console.log('🔄 Clearing demo mode (no redirect)');
    setDemoMode(null);
    setDemoData(null);
    setShowWizard(false);
    setVisitedSteps([]);
    sessionStorage.removeItem('demoMode');
    sessionStorage.removeItem('demoWizardSeen');
    sessionStorage.removeItem('demoVisitedSteps');
    // Clear intro and tour session flags so they show again on re-entry
    sessionStorage.removeItem('demoIntro_struggling');
    sessionStorage.removeItem('demoIntro_improving');
    sessionStorage.removeItem('demoIntro_excellent');
    sessionStorage.removeItem('demoIntro_investor');
    sessionStorage.removeItem('demoIntro_homeowner');
    sessionStorage.removeItem('demoTour_struggling');
    sessionStorage.removeItem('demoTour_improving');
    sessionStorage.removeItem('demoTour_excellent');
    sessionStorage.removeItem('demoTour_investor');
    sessionStorage.removeItem('demoTour_homeowner');
  };
  
  const exitDemoMode = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔴 DEMO CONTEXT: Exiting demo mode');
    console.log('🔴 DEMO CONTEXT: Setting demoMode to null');
    clearDemoMode();
    console.log('🔴 DEMO CONTEXT: Redirecting to Welcome');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // Force reload to clear all cached data
    window.location.href = createPageUrl('Welcome');
  };
  
  const handleWizardComplete = () => {
    sessionStorage.setItem('demoWizardSeen', 'true');
    setShowWizard(false);
  };
  
  const handleWizardSkip = () => {
    sessionStorage.setItem('demoWizardSeen', 'true');
    setShowWizard(false);
  };
  
  // Restore from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('demoMode');
    const storedSteps = sessionStorage.getItem('demoVisitedSteps');
    console.log('Checking stored demo mode:', stored);
    if (stored === 'homeowner') {
      console.log('Restoring homeowner demo mode');
      setDemoMode('homeowner');
      setDemoData(DEMO_PROPERTY_HOMEOWNER);
    } else if (stored === 'struggling') {
      console.log('Restoring struggling demo mode');
      setDemoMode('struggling');
      setDemoData(getDemoPropertyStruggling()); // Fresh data with today's dates
    } else if (stored === 'improving') {
      console.log('Restoring improving demo mode');
      setDemoMode('improving');
      setDemoData(getDemoPropertyImproving()); // Fresh data with today's dates
    } else if (stored === 'excellent') {
      console.log('Restoring excellent demo mode');
      setDemoMode('excellent');
      setDemoData(getDemoPropertyExcellent()); // Fresh data with today's dates
    } else if (stored === 'investor') {
      console.log('Restoring investor demo mode');
      setDemoMode('investor');
      setDemoData(DEMO_PORTFOLIO_INVESTOR);
    }
    if (storedSteps) {
      setVisitedSteps(JSON.parse(storedSteps));
    }
  }, []);
  
  // Debug logging
  useEffect(() => {
    console.log('=== DEMO CONTEXT STATE ===');
    console.log('Demo mode:', demoMode);
    console.log('Demo data exists:', !!demoData);
    if (demoMode === 'investor') {
      console.log('Investor portfolio properties:', demoData?.properties?.length);
      console.log('Portfolio stats:', demoData?.portfolioStats);
    } else if (demoMode === 'homeowner') {
      console.log('Homeowner property:', demoData?.property);
      console.log('Systems count:', demoData?.systems?.length);
    }
  }, [demoMode, demoData]);
  
  // All homeowner-type demos (homeowner, struggling, improving, excellent) are considered "homeowner"
  const isHomeowner = demoMode === 'homeowner' || demoMode === 'struggling' || demoMode === 'improving' || demoMode === 'excellent';
  const isInvestor = demoMode === 'investor';
  
  return (
    <DemoContext.Provider value={{
      demoMode,
      demoData,
      visitedSteps,
      enterDemoMode,
      exitDemoMode,
      clearDemoMode,
      markStepVisited,
      isHomeowner,
      isInvestor
    }}>
      {children}

      {/* Demo Wizards - render when showWizard is true */}
      {showWizard && isHomeowner && (
        <DemoWizard
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      )}
      {showWizard && isInvestor && (
        <InvestorDemoWizard
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      )}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within DemoProvider');
  }
  return context;
}