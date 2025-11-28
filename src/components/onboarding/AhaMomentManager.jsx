import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';

/**
 * Progressive Aha Moments System
 *
 * Tracks and triggers "aha moments" - progressive revelations that help users
 * understand the value of the 360° Method, each achievable in 3 clicks or less.
 *
 * Aha Moments:
 * 1. "My home has hidden risks" - Address → Home age → Systems at risk (onboarding)
 * 2. "I can track this" - Document first system
 * 3. "Small fix now = big savings later" - Cascade risk visualization
 * 4. "I have a system, not just tasks" - 360° Method progress view
 * 5. "My home has a score" - 360° Score introduction
 * 6. "I'm in control" - Complete task → Score improves → Empowerment
 */

const AHA_MOMENTS = {
  HIDDEN_RISKS: 'aha_hidden_risks',        // Aha #1 - Completed during onboarding
  CAN_TRACK: 'aha_can_track',              // Aha #2 - Document first system
  SMALL_FIX_BIG_SAVINGS: 'aha_cascade',    // Aha #3 - Cascade risk
  HAVE_A_SYSTEM: 'aha_system',             // Aha #4 - 360° Method progress
  HOME_HAS_SCORE: 'aha_score',             // Aha #5 - 360° Score
  IN_CONTROL: 'aha_control',               // Aha #6 - Empowerment
};

const STORAGE_KEY = '360_aha_moments';

const AhaMomentContext = createContext(null);

export function useAhaMoments() {
  const context = useContext(AhaMomentContext);
  if (!context) {
    throw new Error('useAhaMoments must be used within an AhaMomentProvider');
  }
  return context;
}

export function AhaMomentProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [completedMoments, setCompletedMoments] = useState({});
  const [activePrompt, setActivePrompt] = useState(null);
  const [dismissedPrompts, setDismissedPrompts] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from localStorage on mount
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      return;
    }

    const loadProgress = () => {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        if (stored) {
          const data = JSON.parse(stored);
          setCompletedMoments(data.completed || {});
          setDismissedPrompts(data.dismissed || {});
        }
      } catch (err) {
        console.error('Error loading aha moment progress:', err);
      }
      setIsLoading(false);
    };

    loadProgress();
  }, [isAuthenticated, user?.id]);

  // Save progress to localStorage
  const saveProgress = useCallback((completed, dismissed) => {
    if (!user?.id) return;

    try {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify({
        completed,
        dismissed,
        lastUpdated: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Error saving aha moment progress:', err);
    }
  }, [user?.id]);

  // Mark an aha moment as completed
  const completeMoment = useCallback((momentKey) => {
    setCompletedMoments(prev => {
      const updated = { ...prev, [momentKey]: new Date().toISOString() };
      saveProgress(updated, dismissedPrompts);
      return updated;
    });

    // Clear active prompt if it was for this moment
    if (activePrompt === momentKey) {
      setActivePrompt(null);
    }
  }, [activePrompt, dismissedPrompts, saveProgress]);

  // Dismiss a prompt (user clicked "Maybe Later")
  const dismissPrompt = useCallback((momentKey) => {
    setDismissedPrompts(prev => {
      const updated = { ...prev, [momentKey]: new Date().toISOString() };
      saveProgress(completedMoments, updated);
      return updated;
    });
    setActivePrompt(null);
  }, [completedMoments, saveProgress]);

  // Check if a moment is completed
  const isMomentCompleted = useCallback((momentKey) => {
    return !!completedMoments[momentKey];
  }, [completedMoments]);

  // Check if a prompt was dismissed (within last 24 hours)
  const isPromptDismissed = useCallback((momentKey) => {
    const dismissedAt = dismissedPrompts[momentKey];
    if (!dismissedAt) return false;

    // Allow re-prompting after 24 hours
    const dismissedTime = new Date(dismissedAt).getTime();
    const now = Date.now();
    const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);

    return hoursSinceDismissed < 24;
  }, [dismissedPrompts]);

  // Trigger a prompt to show
  const triggerPrompt = useCallback((momentKey) => {
    // Don't show if already completed or recently dismissed
    if (isMomentCompleted(momentKey) || isPromptDismissed(momentKey)) {
      return false;
    }

    setActivePrompt(momentKey);
    return true;
  }, [isMomentCompleted, isPromptDismissed]);

  // Clear active prompt
  const clearPrompt = useCallback(() => {
    setActivePrompt(null);
  }, []);

  // Get the next recommended aha moment based on user's progress
  const getNextMoment = useCallback(() => {
    const order = [
      AHA_MOMENTS.HIDDEN_RISKS,
      AHA_MOMENTS.CAN_TRACK,
      AHA_MOMENTS.SMALL_FIX_BIG_SAVINGS,
      AHA_MOMENTS.HAVE_A_SYSTEM,
      AHA_MOMENTS.HOME_HAS_SCORE,
      AHA_MOMENTS.IN_CONTROL,
    ];

    for (const moment of order) {
      if (!isMomentCompleted(moment)) {
        return moment;
      }
    }

    return null; // All moments completed
  }, [isMomentCompleted]);

  // Get progress stats
  const getProgress = useCallback(() => {
    const total = Object.keys(AHA_MOMENTS).length;
    const completed = Object.keys(completedMoments).length;
    return {
      total,
      completed,
      percentage: Math.round((completed / total) * 100),
      remaining: total - completed,
    };
  }, [completedMoments]);

  // Reset all progress (for testing)
  const resetProgress = useCallback(() => {
    setCompletedMoments({});
    setDismissedPrompts({});
    setActivePrompt(null);
    if (user?.id) {
      localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
    }
  }, [user?.id]);

  const value = {
    // Constants
    AHA_MOMENTS,

    // State
    completedMoments,
    activePrompt,
    isLoading,

    // Actions
    completeMoment,
    dismissPrompt,
    triggerPrompt,
    clearPrompt,

    // Queries
    isMomentCompleted,
    isPromptDismissed,
    getNextMoment,
    getProgress,

    // Dev/Testing
    resetProgress,
  };

  return (
    <AhaMomentContext.Provider value={value}>
      {children}
    </AhaMomentContext.Provider>
  );
}

export { AHA_MOMENTS };
export default AhaMomentProvider;
