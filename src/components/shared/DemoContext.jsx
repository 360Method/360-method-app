import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PROPERTY_HOMEOWNER } from './demoPropertyHomeowner';
import { DEMO_PORTFOLIO_INVESTOR } from './demoPropertyInvestor';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import DemoWizard from '../demo/DemoWizard';
import InvestorDemoWizard from '../demo/InvestorDemoWizard';

const DemoContext = createContext();

export function DemoProvider({ children }) {
  const [demoMode, setDemoMode] = useState(null); // null, 'homeowner', or 'investor'
  const [demoData, setDemoData] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();
  
  const enterDemoMode = (userType = 'homeowner') => {
    console.log(`🎬 Entering demo mode: ${userType}`);
    
    if (userType === 'investor') {
      setDemoMode('investor');
      setDemoData(DEMO_PORTFOLIO_INVESTOR);
      sessionStorage.setItem('demoMode', 'investor');
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
    
    console.log('Demo data loaded for:', userType);
  };
  
  const exitDemoMode = () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔴 DEMO CONTEXT: Exiting demo mode');
    console.log('🔴 DEMO CONTEXT: Setting demoMode to null');
    setDemoMode(null);
    setDemoData(null);
    setShowWizard(false);
    console.log('🔴 DEMO CONTEXT: Clearing sessionStorage');
    sessionStorage.removeItem('demoMode');
    sessionStorage.removeItem('demoWizardSeen');
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
    console.log('Checking stored demo mode:', stored);
    if (stored === 'homeowner') {
      console.log('Restoring homeowner demo mode');
      setDemoMode('homeowner');
      setDemoData(DEMO_PROPERTY_HOMEOWNER);
    } else if (stored === 'investor') {
      console.log('Restoring investor demo mode');
      setDemoMode('investor');
      setDemoData(DEMO_PORTFOLIO_INVESTOR);
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
      enterDemoMode,
      exitDemoMode,
      isHomeowner,
      isInvestor
    }}>
      {children}
      {showWizard && demoMode === 'homeowner' && (
        <DemoWizard 
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      )}
      {showWizard && demoMode === 'investor' && (
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