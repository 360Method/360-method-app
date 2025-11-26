import { useEffect, useRef } from 'react';
import { useDemoEngagement } from './DemoEngagementManager';
import { useDemo } from '../shared/DemoContext';

/**
 * Hook to trigger demo engagement popup after viewing a feature
 * 
 * @param {string} featureId - Unique identifier for this feature
 * @param {string} triggerType - Which popup to trigger
 * @param {object} context - Context to pass to popup
 * @param {number} delay - Delay before showing popup (ms)
 */
export function useDemoTrigger(featureId, triggerType, context = {}, delay = 2000) {
  const { demoMode } = useDemo();
  const engagement = useDemoEngagement();
  const hasTriggered = useRef(false);
  
  useEffect(() => {
    if (!demoMode || !engagement || hasTriggered.current) return;
    
    // Track feature view
    engagement.trackFeatureView(featureId);
    
    // Set up delayed trigger
    const timer = setTimeout(() => {
      if (!hasTriggered.current) {
        engagement.triggerPopup(triggerType, context);
        hasTriggered.current = true;
      }
    }, delay);
    
    return () => clearTimeout(timer);
  }, [demoMode, engagement, featureId, triggerType, delay]);
}