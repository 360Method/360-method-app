import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_PROPERTY_HOMEOWNER } from './demoPropertyHomeowner';

const DemoContext = createContext();

export function DemoProvider({ children }) {
  const [demoMode, setDemoMode] = useState(false);
  const [demoData, setDemoData] = useState(null);
  
  const enterDemoMode = () => {
    setDemoMode(true);
    setDemoData(DEMO_PROPERTY_HOMEOWNER);
    sessionStorage.setItem('demoMode', 'true');
  };
  
  const exitDemoMode = () => {
    setDemoMode(false);
    setDemoData(null);
    sessionStorage.removeItem('demoMode');
  };
  
  useEffect(() => {
    const stored = sessionStorage.getItem('demoMode');
    if (stored === 'true') {
      enterDemoMode();
    }
  }, []);
  
  return (
    <DemoContext.Provider value={{
      demoMode,
      demoData,
      enterDemoMode,
      exitDemoMode
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