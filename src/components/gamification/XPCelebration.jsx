import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/lib/GamificationContext';
import { ArrowUp, Trophy, Star, Sparkles, X } from 'lucide-react';
import confetti from 'canvas-confetti';

/**
 * XPCelebration - Full-screen celebration overlay
 *
 * Shows when user earns XP, levels up, or unlocks achievements.
 * Uses Framer Motion for smooth spring-based animations.
 * Auto-dismisses after a timeout or on tap.
 */
export default function XPCelebration() {
  const { pendingCelebration, clearCelebration, currentLevelData } = useGamification();

  // Auto-dismiss after delay
  useEffect(() => {
    if (!pendingCelebration) return;

    // Longer timeout for level ups and achievements
    const timeout = pendingCelebration.newLevel || pendingCelebration.newAchievement
      ? 4000
      : 2500;

    const timer = setTimeout(() => {
      clearCelebration();
    }, timeout);

    return () => clearTimeout(timer);
  }, [pendingCelebration, clearCelebration]);

  // Trigger confetti for level ups
  useEffect(() => {
    if (pendingCelebration?.newLevel) {
      // Confetti burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Side cannons
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 }
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 }
        });
      }, 200);
    }
  }, [pendingCelebration?.newLevel]);

  // Trigger confetti for achievements
  useEffect(() => {
    if (pendingCelebration?.newAchievement) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      });
    }
  }, [pendingCelebration?.newAchievement]);

  if (!pendingCelebration) return null;

  const { type, xpAwarded, newLevel, newAchievement } = pendingCelebration;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={clearCelebration}
      >
        {/* Close button */}
        <button
          onClick={clearCelebration}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="text-center p-8 max-w-md mx-4"
        >
          {/* XP Award (always shown) */}
          {xpAwarded > 0 && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut'
                }}
                className="flex items-center justify-center gap-2"
              >
                <ArrowUp className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
                <span className="text-5xl md:text-6xl font-bold text-green-400">
                  +{xpAwarded}
                </span>
                <span className="text-2xl md:text-3xl font-bold text-green-300">XP</span>
              </motion.div>

              {/* Action description */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-slate-400 text-sm mt-2"
              >
                {getActionDescription(pendingCelebration.action)}
              </motion.p>
            </motion.div>
          )}

          {/* Level Up Section */}
          {newLevel && (
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.4, type: 'spring', damping: 12 }}
              className="mt-6"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.5,
                  repeat: 2
                }}
                className="text-6xl md:text-7xl mb-4"
              >
                {newLevel.badge}
              </motion.div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                  <span className="text-3xl md:text-4xl font-bold text-white">LEVEL UP!</span>
                  <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="text-xl md:text-2xl text-orange-400 font-semibold">
                  Level {newLevel.level}: {newLevel.title}
                </div>
                <p className="text-slate-400 text-sm mt-2">
                  {newLevel.description}
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Achievement Unlock */}
          {newAchievement && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: newLevel ? 0.9 : 0.4, type: 'spring', damping: 15 }}
              className="mt-6"
            >
              <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 rounded-2xl p-6 border border-yellow-500/40">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ delay: newLevel ? 1.2 : 0.7, duration: 0.5 }}
                >
                  <Trophy className="w-10 h-10 text-yellow-400 mx-auto mb-2" />
                </motion.div>

                <div className="text-2xl mb-1">{newAchievement.icon}</div>
                <div className="text-xl font-bold text-white">{newAchievement.title}</div>
                <p className="text-sm text-slate-400 mt-1">{newAchievement.description}</p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: newLevel ? 1.4 : 0.9, type: 'spring' }}
                  className="mt-3 inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold"
                >
                  <Sparkles className="w-4 h-4" />
                  +{newAchievement.xpBonus} XP Bonus
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Progress bar to next level (for XP-only celebrations) */}
          {!newLevel && !newAchievement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <div className="text-sm text-slate-400 mb-2">
                Level {currentLevelData.level}: {currentLevelData.title}
              </div>
              <div className="text-2xl mb-2">{currentLevelData.badge}</div>
            </motion.div>
          )}

          {/* Tap to continue */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-slate-500 text-sm mt-8"
          >
            Tap anywhere to continue
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Get human-readable description for XP actions
 */
function getActionDescription(action) {
  const descriptions = {
    complete_survey: 'Personalization complete',
    add_property: 'Property added',
    first_aha_moment: 'First insight discovered',
    complete_onboarding: 'Onboarding complete',
    document_system: 'System documented',
    document_system_with_photo: 'System documented with photo',
    complete_essential_systems: 'Essential systems complete',
    complete_all_systems: 'All systems documented',
    start_inspection: 'Inspection started',
    complete_room: 'Room inspected',
    complete_inspection: 'Inspection complete',
    find_issue: 'Issue identified',
    log_maintenance: 'Maintenance logged',
    add_receipt: 'Receipt added',
    review_priority: 'Priorities reviewed',
    schedule_task: 'Task scheduled',
    complete_task: 'Task completed',
    complete_task_early: 'Task completed early',
    setup_prevention_schedule: 'Prevention schedule set',
    plan_upgrade: 'Upgrade planned',
    complete_upgrade: 'Upgrade complete',
    add_second_property: 'Portfolio growing',
    add_fifth_property: 'Portfolio expanding',
    seven_day_streak: '7-day streak',
    thirty_day_streak: '30-day streak',
    reach_bronze: 'Bronze certified',
    reach_silver: 'Silver certified',
    reach_gold: 'Gold certified',
    reach_platinum: 'Platinum certified'
  };

  return descriptions[action] || 'Progress made';
}
