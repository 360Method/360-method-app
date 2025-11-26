import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DemoEngagementPopup } from './DemoEngagementPopup';

const DemoEngagementContext = createContext();

// Session storage keys
const STORAGE_KEYS = {
  DISMISSED: 'demo_popups_dismissed',
  SHOWN_COUNT: 'demo_popups_shown',
  LAST_SHOWN: 'demo_popup_last_shown',
  TRIGGERS_FIRED: 'demo_triggers_fired',
  SESSION_START: 'demo_session_start',
  FEATURES_VIEWED: 'demo_features_viewed'
};

// Configuration
const CONFIG = {
  MAX_POPUPS_PER_SESSION: 2,
  MIN_TIME_BETWEEN_POPUPS: 2 * 60 * 1000, // 2 minutes
  MIN_TIME_BEFORE_FIRST: 60 * 1000, // 1 minute minimum engagement
  TIME_ENGAGED_TRIGGER: 3 * 60 * 1000, // 3 minutes
  FEATURES_VIEWED_TRIGGER: 5
};

export function DemoEngagementProvider({ children }) {
  const [currentPopup, setCurrentPopup] = useState(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [shownCount, setShownCount] = useState(0);
  const [lastShownTime, setLastShownTime] = useState(0);
  const [triggersFired, setTriggersFired] = useState(new Set());
  const [featuresViewed, setFeaturesViewed] = useState(new Set());
  const [sessionStart] = useState(Date.now());
  
  // Initialize from session storage
  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEYS.DISMISSED) === 'true';
    const shown = parseInt(sessionStorage.getItem(STORAGE_KEYS.SHOWN_COUNT) || '0');
    const lastShown = parseInt(sessionStorage.getItem(STORAGE_KEYS.LAST_SHOWN) || '0');
    const fired = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.TRIGGERS_FIRED) || '[]');
    const features = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.FEATURES_VIEWED) || '[]');
    
    setIsDismissed(dismissed);
    setShownCount(shown);
    setLastShownTime(lastShown);
    setTriggersFired(new Set(fired));
    setFeaturesViewed(new Set(features));
  }, []);
  
  // Check if we can show a popup
  const canShowPopup = useCallback(() => {
    if (isDismissed) return false;
    if (shownCount >= CONFIG.MAX_POPUPS_PER_SESSION) return false;
    if (Date.now() - lastShownTime < CONFIG.MIN_TIME_BETWEEN_POPUPS) return false;
    if (Date.now() - sessionStart < CONFIG.MIN_TIME_BEFORE_FIRST) return false;
    if (currentPopup) return false;
    return true;
  }, [isDismissed, shownCount, lastShownTime, sessionStart, currentPopup]);
  
  // Trigger a popup
  const triggerPopup = useCallback((trigger, context = {}) => {
    if (!canShowPopup()) return false;
    if (triggersFired.has(trigger)) return false;
    
    // Show the popup
    setCurrentPopup({ trigger, context });
    
    // Update state
    const newCount = shownCount + 1;
    const newTriggers = new Set([...triggersFired, trigger]);
    
    setShownCount(newCount);
    setLastShownTime(Date.now());
    setTriggersFired(newTriggers);
    
    // Persist to session storage
    sessionStorage.setItem(STORAGE_KEYS.SHOWN_COUNT, newCount.toString());
    sessionStorage.setItem(STORAGE_KEYS.LAST_SHOWN, Date.now().toString());
    sessionStorage.setItem(STORAGE_KEYS.TRIGGERS_FIRED, JSON.stringify([...newTriggers]));
    
    return true;
  }, [canShowPopup, shownCount, triggersFired]);
  
  // Track feature view (for features_explored trigger)
  const trackFeatureView = useCallback((featureId) => {
    const newFeatures = new Set([...featuresViewed, featureId]);
    setFeaturesViewed(newFeatures);
    sessionStorage.setItem(STORAGE_KEYS.FEATURES_VIEWED, JSON.stringify([...newFeatures]));
    
    // Check if we should trigger the features_explored popup
    if (newFeatures.size >= CONFIG.FEATURES_VIEWED_TRIGGER) {
      triggerPopup('features_explored', { count: newFeatures.size });
    }
  }, [featuresViewed, triggerPopup]);
  
  // Close current popup
  const closePopup = useCallback(() => {
    setCurrentPopup(null);
  }, []);
  
  // Dismiss all future popups
  const dismissPopups = useCallback(() => {
    setIsDismissed(true);
    setCurrentPopup(null);
    sessionStorage.setItem(STORAGE_KEYS.DISMISSED, 'true');
  }, []);
  
  // Time-based trigger check
  useEffect(() => {
    const checkTimeEngaged = () => {
      const timeEngaged = Date.now() - sessionStart;
      if (timeEngaged >= CONFIG.TIME_ENGAGED_TRIGGER) {
        triggerPopup('time_engaged', { minutes: Math.floor(timeEngaged / 60000) });
      }
    };
    
    const interval = setInterval(checkTimeEngaged, 30000);
    return () => clearInterval(interval);
  }, [sessionStart, triggerPopup]);
  
  const value = {
    triggerPopup,
    trackFeatureView,
    canShowPopup,
    isDismissed,
    shownCount
  };
  
  return (
    <DemoEngagementContext.Provider value={value}>
      {children}
      
      {/* Render current popup if any */}
      {currentPopup && (
        <DemoEngagementPopup
          trigger={currentPopup.trigger}
          context={currentPopup.context}
          onClose={closePopup}
          onDismiss={dismissPopups}
        />
      )}
    </DemoEngagementContext.Provider>
  );
}

// Hook to use engagement context
export function useDemoEngagement() {
  const context = useContext(DemoEngagementContext);
  if (!context) {
    return null;
  }
  return context;
}