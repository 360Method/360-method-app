import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PROPERTY_HOMEOWNER } from './demoPropertyHomeowner';
import { DEMO_PROPERTY_STRUGGLING } from './demoPropertyStruggling';
import { DEMO_PROPERTY_IMPROVING } from './demoPropertyImproving';
import { DEMO_PROPERTY_EXCELLENT } from './demoPropertyExcellent';
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
    
    if (userType === 'investor') {
      setDemoMode('investor');
      setDemoData(DEMO_PORTFOLIO_INVESTOR);
      sessionStorage.setItem('demoMode', 'investor');
    } else if (userType === 'struggling' || scoreLevel === 'struggling') {
      setDemoMode('struggling');
      setDemoData(DEMO_PROPERTY_STRUGGLING);
      sessionStorage.setItem('demoMode', 'struggling');
    } else if (scoreLevel === 'improving') {
      setDemoMode('improving');
      setDemoData(DEMO_PROPERTY_IMPROVING);
      sessionStorage.setItem('demoMode', 'improving');
    } else if (scoreLevel === 'excellent') {
      setDemoMode('excellent');
      setDemoData(DEMO_PROPERTY_EXCELLENT);
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
  };
  
  const exitDemoMode = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔴 DEMO CONTEXT: Exiting demo mode');
    console.log('🔴 DEMO CONTEXT: Setting demoMode to null');
    clearDemoMode();
    console.log('🔴 DEMO CONTEXT: Redirecting to Waitlist');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    // Force reload to clear all cached data
    window.location.href = createPageUrl('Waitlist');
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
      setDemoData(DEMO_PROPERTY_STRUGGLING);
    } else if (stored === 'improving') {
      console.log('Restoring improving demo mode');
      setDemoMode('improving');
      setDemoData(DEMO_PROPERTY_IMPROVING);
    } else if (stored === 'excellent') {
      console.log('Restoring excellent demo mode');
      setDemoMode('excellent');
      setDemoData(DEMO_PROPERTY_EXCELLENT);
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
  
  const isHomeowner = demoMode === 'homeowner';
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