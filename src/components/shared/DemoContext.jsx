import { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PROPERTY_HOMEOWNER } from './demoPropertyHomeowner';
import DemoWizard from '../demo/DemoWizard';

const DemoContext = createContext();

export function DemoProvider({ children }) {
  const [demoMode, setDemoMode] = useState(false);
  const [demoData, setDemoData] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  
  const enterDemoMode = () => {
    console.log('🎬 Entering demo mode');
    setDemoMode(true);
    setDemoData(DEMO_PROPERTY_HOMEOWNER);
    sessionStorage.setItem('demoMode', 'true');
    
    // Check if wizard has been seen this session
    const hasSeenWizard = sessionStorage.getItem('demoWizardSeen');
    if (!hasSeenWizard) {
      setShowWizard(true);
    }
    
    console.log('Demo data loaded:', DEMO_PROPERTY_HOMEOWNER);
  };
  
  const exitDemoMode = () => {
    console.log('🚪 Exiting demo mode');
    setDemoMode(false);
    setDemoData(null);
    setShowWizard(false);
    sessionStorage.removeItem('demoMode');
    sessionStorage.removeItem('demoWizardSeen');
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
    if (stored === 'true') {
      console.log('Restoring demo mode from sessionStorage');
      enterDemoMode();
    }
  }, []);
  
  // Debug logging
  useEffect(() => {
    console.log('=== DEMO CONTEXT STATE ===');
    console.log('Demo mode:', demoMode);
    console.log('Demo data exists:', !!demoData);
    console.log('Demo property:', demoData?.property);
    console.log('Demo systems count:', demoData?.systems?.length);
    console.log('Demo tasks count:', demoData?.tasks?.length);
  }, [demoMode, demoData]);
  
  return (
    <DemoContext.Provider value={{
      demoMode,
      demoData,
      enterDemoMode,
      exitDemoMode
    }}>
      {children}
      {showWizard && (
        <DemoWizard 
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