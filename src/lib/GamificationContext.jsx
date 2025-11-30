import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseClient';

// ============================================
// LEVEL PROGRESSION SYSTEM
// 10 levels from Newcomer to Home Master
// ============================================
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Newcomer', badge: '🏠', description: 'Just getting started' },
  { level: 2, xp: 200, title: 'Aware Owner', badge: '👀', description: 'Learning to see your home' },
  { level: 3, xp: 500, title: 'System Tracker', badge: '📋', description: 'Documenting what matters' },
  { level: 4, xp: 1000, title: 'Proactive Keeper', badge: '🛡️', description: 'Staying ahead of problems' },
  { level: 5, xp: 2000, title: 'Home Guardian', badge: '⚔️', description: 'Protecting your investment' },
  { level: 6, xp: 3500, title: 'Maintenance Master', badge: '🎓', description: 'Expert-level home care' },
  { level: 7, xp: 5500, title: 'Property Pro', badge: '💎', description: 'Professional-grade management' },
  { level: 8, xp: 8000, title: 'Estate Expert', badge: '🏆', description: 'Managing like the top 5%' },
  { level: 9, xp: 12000, title: 'Wealth Builder', badge: '📈', description: 'Building lasting value' },
  { level: 10, xp: 20000, title: 'Home Master', badge: '👑', description: 'The pinnacle of home ownership' }
];

// ============================================
// XP AWARDS FOR ACTIONS
// ============================================
export const XP_AWARDS = {
  // Onboarding
  complete_survey: 50,
  add_property: 100,
  first_aha_moment: 50,
  complete_onboarding: 100,

  // Baseline (Phase 1)
  document_system: 100,
  document_system_with_photo: 150,
  complete_essential_systems: 500,
  complete_all_systems: 1000,

  // Inspect (Phase 2)
  start_inspection: 50,
  complete_room: 75,
  complete_inspection: 300,
  find_issue: 50,

  // Track (Phase 3)
  log_maintenance: 100,
  add_receipt: 50,

  // Prioritize (Phase 4)
  review_priority: 50,

  // Schedule (Phase 5)
  schedule_task: 100,

  // Execute (Phase 6)
  complete_task: 200,
  complete_task_early: 300,

  // Preserve (Phase 7)
  setup_prevention_schedule: 200,

  // Upgrade (Phase 8)
  plan_upgrade: 150,
  complete_upgrade: 500,

  // Scale (Phase 9)
  add_second_property: 300,
  add_fifth_property: 500,

  // Streaks
  seven_day_streak: 200,
  thirty_day_streak: 500,

  // Score milestones
  reach_bronze: 500,
  reach_silver: 750,
  reach_gold: 1000,
  reach_platinum: 2000
};

// ============================================
// ACHIEVEMENT DEFINITIONS
// ============================================
export const ACHIEVEMENTS = [
  // Early wins
  { id: 'first_system', icon: '🎯', title: 'First Step', description: 'Documented your first system', xpBonus: 100, category: 'baseline' },
  { id: 'baseline_starter', icon: '📋', title: 'Baseline Starter', description: 'Documented 4 essential systems', xpBonus: 300, category: 'baseline' },
  { id: 'baseline_complete', icon: '🏆', title: 'Baseline Boss', description: 'All 16 systems documented', xpBonus: 1000, category: 'baseline' },

  // Inspection
  { id: 'first_inspection', icon: '🔍', title: 'Inspector', description: 'Completed first inspection', xpBonus: 200, category: 'inspect' },
  { id: 'eagle_eye', icon: '🦅', title: 'Eagle Eye', description: 'Found 10 issues during inspections', xpBonus: 500, category: 'inspect' },
  { id: 'monthly_inspector', icon: '📅', title: 'Monthly Inspector', description: 'Completed inspections 3 months in a row', xpBonus: 300, category: 'inspect' },

  // Financial
  { id: 'first_save', icon: '💰', title: 'First Save', description: 'Prevented your first $100+ disaster', xpBonus: 200, category: 'financial' },
  { id: 'thousand_saver', icon: '💎', title: 'Thousand Saver', description: 'Prevented $1,000+ in disasters', xpBonus: 500, category: 'financial' },
  { id: 'five_k_saver', icon: '🏦', title: 'Money Master', description: 'Prevented $5,000+ in disasters', xpBonus: 1000, category: 'financial' },
  { id: 'ten_k_saver', icon: '💵', title: 'Disaster Defeater', description: 'Prevented $10,000+ in disasters', xpBonus: 2000, category: 'financial' },

  // Consistency / Streaks
  { id: 'week_streak', icon: '🔥', title: 'On Fire', description: '7-day activity streak', xpBonus: 200, category: 'streak' },
  { id: 'month_streak', icon: '⭐', title: 'Dedicated', description: '30-day activity streak', xpBonus: 500, category: 'streak' },
  { id: 'quarter_streak', icon: '🌟', title: 'Committed', description: '90-day activity streak', xpBonus: 1000, category: 'streak' },

  // Score certifications
  { id: 'bronze_certified', icon: '🥉', title: 'Bronze Certified', description: 'Reached 75+ health score', xpBonus: 300, category: 'score' },
  { id: 'silver_certified', icon: '🥈', title: 'Silver Certified', description: 'Reached 85+ health score', xpBonus: 500, category: 'score' },
  { id: 'gold_certified', icon: '🥇', title: 'Gold Certified', description: 'Reached 90+ health score', xpBonus: 750, category: 'score' },
  { id: 'platinum_certified', icon: '👑', title: 'Platinum Certified', description: 'Reached 96+ health score (Top 1%)', xpBonus: 1500, category: 'score' },

  // Investor achievements
  { id: 'portfolio_starter', icon: '📊', title: 'Portfolio Starter', description: 'Managing 2+ properties', xpBonus: 300, category: 'investor' },
  { id: 'portfolio_builder', icon: '🏗️', title: 'Portfolio Builder', description: 'Managing 5+ properties', xpBonus: 750, category: 'investor' },
  { id: 'wealth_architect', icon: '🏛️', title: 'Wealth Architect', description: 'Managing 10+ properties', xpBonus: 2000, category: 'investor' }
];

// ============================================
// CONTEXT
// ============================================
const GamificationContext = createContext(null);

export function useGamification() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
}

// ============================================
// PROVIDER COMPONENT
// ============================================
export function GamificationProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [gamificationData, setGamificationData] = useState({
    totalXp: 0,
    currentLevel: 1,
    achievements: [],
    disastersPreventedTotal: 0,
    streakCurrent: 0,
    streakLongest: 0,
    onboardingIntent: null
  });

  const [pendingCelebration, setPendingCelebration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // ============================================
  // Load gamification data from database
  // ============================================
  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      return;
    }

    loadGamificationData(user.id);
  }, [isAuthenticated, user?.id]);

  const loadGamificationData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine for new users
        console.error('Error loading gamification:', error);
      }

      if (data) {
        setGamificationData({
          totalXp: data.total_xp || 0,
          currentLevel: data.current_level || 1,
          achievements: data.achievements || [],
          disastersPreventedTotal: data.disasters_prevented_total || 0,
          streakCurrent: data.streak_current || 0,
          streakLongest: data.streak_longest || 0,
          onboardingIntent: data.onboarding_intent || null
        });
      }
    } catch (err) {
      console.error('Error loading gamification data:', err);
    }
    setIsLoading(false);
  };

  // ============================================
  // Calculate level from XP
  // ============================================
  const calculateLevel = useCallback((xp) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i].xp) {
        return LEVEL_THRESHOLDS[i];
      }
    }
    return LEVEL_THRESHOLDS[0];
  }, []);

  // ============================================
  // Award XP
  // ============================================
  const awardXP = useCallback(async (actionType, metadata = {}) => {
    if (!user?.id) return null;

    const xpAmount = XP_AWARDS[actionType];
    if (!xpAmount) {
      console.warn(`Unknown XP action type: ${actionType}`);
      return null;
    }

    const oldLevel = calculateLevel(gamificationData.totalXp);
    const newTotalXp = gamificationData.totalXp + xpAmount;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel.level > oldLevel.level;

    // Update local state immediately for instant feedback
    setGamificationData(prev => ({
      ...prev,
      totalXp: newTotalXp,
      currentLevel: newLevel.level
    }));

    // Save to database
    try {
      // Use the database function for atomic XP award
      const { data, error } = await supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_xp_amount: xpAmount,
        p_action_type: actionType,
        p_related_entity_type: metadata.entityType || null,
        p_related_entity_id: metadata.entityId || null,
        p_metadata: metadata
      });

      if (error) {
        console.error('Error awarding XP:', error);
        // Revert local state on error
        setGamificationData(prev => ({
          ...prev,
          totalXp: gamificationData.totalXp,
          currentLevel: oldLevel.level
        }));
        return null;
      }
    } catch (err) {
      console.error('Error awarding XP:', err);
    }

    // Trigger celebration
    setPendingCelebration({
      type: leveledUp ? 'level_up' : 'xp',
      xpAwarded: xpAmount,
      action: actionType,
      newLevel: leveledUp ? newLevel : null,
      newAchievement: null
    });

    return { xpAwarded: xpAmount, leveledUp, newLevel: leveledUp ? newLevel : null };
  }, [user?.id, gamificationData.totalXp, calculateLevel]);

  // ============================================
  // Check and award achievement
  // ============================================
  const checkAchievement = useCallback(async (achievementId) => {
    if (!user?.id) return null;

    // Already has this achievement
    if (gamificationData.achievements.includes(achievementId)) {
      return null;
    }

    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) {
      console.warn(`Unknown achievement: ${achievementId}`);
      return null;
    }

    // Update local state
    const newAchievements = [...gamificationData.achievements, achievementId];
    const newTotalXp = gamificationData.totalXp + achievement.xpBonus;
    const newLevel = calculateLevel(newTotalXp);

    setGamificationData(prev => ({
      ...prev,
      achievements: newAchievements,
      totalXp: newTotalXp,
      currentLevel: newLevel.level
    }));

    // Save to database
    try {
      // Record achievement unlock
      await supabase.from('achievement_unlocks').insert({
        user_id: user.id,
        achievement_id: achievementId,
        xp_bonus: achievement.xpBonus
      });

      // Update gamification record
      await supabase
        .from('user_gamification')
        .upsert({
          user_id: user.id,
          achievements: newAchievements,
          total_xp: newTotalXp,
          current_level: newLevel.level,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (err) {
      console.error('Error saving achievement:', err);
    }

    // Trigger celebration
    setPendingCelebration(prev => ({
      ...prev,
      type: 'achievement',
      newAchievement: achievement,
      xpAwarded: (prev?.xpAwarded || 0) + achievement.xpBonus
    }));

    return achievement;
  }, [user?.id, gamificationData.achievements, gamificationData.totalXp, calculateLevel]);

  // ============================================
  // Add to disasters prevented total
  // ============================================
  const addDisasterPrevented = useCallback(async (amount) => {
    if (!user?.id || !amount) return;

    const newTotal = gamificationData.disastersPreventedTotal + amount;

    setGamificationData(prev => ({
      ...prev,
      disastersPreventedTotal: newTotal
    }));

    // Save to database
    try {
      await supabase.rpc('add_disaster_prevented', {
        p_user_id: user.id,
        p_amount: amount
      });
    } catch (err) {
      console.error('Error saving disaster prevented:', err);
    }

    // Check for financial achievements
    if (newTotal >= 100 && !gamificationData.achievements.includes('first_save')) {
      await checkAchievement('first_save');
    }
    if (newTotal >= 1000 && !gamificationData.achievements.includes('thousand_saver')) {
      await checkAchievement('thousand_saver');
    }
    if (newTotal >= 5000 && !gamificationData.achievements.includes('five_k_saver')) {
      await checkAchievement('five_k_saver');
    }
    if (newTotal >= 10000 && !gamificationData.achievements.includes('ten_k_saver')) {
      await checkAchievement('ten_k_saver');
    }
  }, [user?.id, gamificationData.disastersPreventedTotal, gamificationData.achievements, checkAchievement]);

  // ============================================
  // Save onboarding intent
  // ============================================
  const saveOnboardingIntent = useCallback(async (intent) => {
    if (!user?.id) return;

    setGamificationData(prev => ({
      ...prev,
      onboardingIntent: intent
    }));

    try {
      await supabase
        .from('user_gamification')
        .upsert({
          user_id: user.id,
          onboarding_intent: intent,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (err) {
      console.error('Error saving onboarding intent:', err);
    }
  }, [user?.id]);

  // ============================================
  // Clear celebration
  // ============================================
  const clearCelebration = useCallback(() => {
    setPendingCelebration(null);
  }, []);

  // ============================================
  // Get progress to next level
  // ============================================
  const getProgressToNextLevel = useCallback(() => {
    const current = calculateLevel(gamificationData.totalXp);
    const currentIdx = LEVEL_THRESHOLDS.findIndex(l => l.level === current.level);

    // Max level
    if (currentIdx >= LEVEL_THRESHOLDS.length - 1) {
      return { progress: 100, xpToNext: 0, nextLevel: null };
    }

    const next = LEVEL_THRESHOLDS[currentIdx + 1];
    const xpInLevel = gamificationData.totalXp - current.xp;
    const xpNeededForLevel = next.xp - current.xp;
    const progress = Math.min((xpInLevel / xpNeededForLevel) * 100, 100);

    return {
      progress,
      xpToNext: next.xp - gamificationData.totalXp,
      nextLevel: next
    };
  }, [gamificationData.totalXp, calculateLevel]);

  // ============================================
  // Check if user has achievement
  // ============================================
  const hasAchievement = useCallback((achievementId) => {
    return gamificationData.achievements.includes(achievementId);
  }, [gamificationData.achievements]);

  // ============================================
  // Get achievement by ID
  // ============================================
  const getAchievement = useCallback((achievementId) => {
    return ACHIEVEMENTS.find(a => a.id === achievementId);
  }, []);

  // ============================================
  // Context value
  // ============================================
  const value = {
    // Constants
    LEVEL_THRESHOLDS,
    XP_AWARDS,
    ACHIEVEMENTS,

    // State
    ...gamificationData,
    currentLevelData: calculateLevel(gamificationData.totalXp),
    pendingCelebration,
    isLoading,

    // Actions
    awardXP,
    checkAchievement,
    addDisasterPrevented,
    saveOnboardingIntent,
    clearCelebration,

    // Queries
    getProgressToNextLevel,
    hasAchievement,
    getAchievement,
    calculateLevel
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
}

export default GamificationContext;
