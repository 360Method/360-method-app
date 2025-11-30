import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGamification } from '@/lib/GamificationContext';
import { ChevronUp, Sparkles, Trophy, TrendingUp, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

/**
 * UserLevelBadge - Compact badge for header display
 *
 * Shows current level badge with XP progress.
 * Expands on click to show full gamification stats.
 */
export default function UserLevelBadge({ variant = 'compact' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    totalXp,
    currentLevelData,
    disastersPreventedTotal,
    streakCurrent,
    achievements,
    getProgressToNextLevel,
    isLoading,
    ACHIEVEMENTS
  } = useGamification();

  const { progress, xpToNext, nextLevel } = getProgressToNextLevel();

  if (isLoading) {
    return (
      <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
    );
  }

  // Compact variant for header
  if (variant === 'compact') {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 border border-slate-200 rounded-full px-3 py-1.5 transition-colors"
        >
          {/* Level badge emoji */}
          <span className="text-lg">{currentLevelData.badge}</span>

          {/* Level number and XP */}
          <div className="flex flex-col items-start leading-none">
            <span className="text-xs font-bold text-slate-800">
              Lv.{currentLevelData.level}
            </span>
            <span className="text-[10px] text-slate-500">
              {totalXp.toLocaleString()} XP
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="w-8 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.button>

        {/* Expanded panel */}
        <AnimatePresence>
          {isExpanded && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsExpanded(false)}
              />

              {/* Panel */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{currentLevelData.badge}</span>
                    <div>
                      <div className="font-bold text-lg">{currentLevelData.title}</div>
                      <div className="text-sm text-slate-300">
                        Level {currentLevelData.level}
                      </div>
                    </div>
                  </div>

                  {/* XP Progress */}
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{totalXp.toLocaleString()} XP</span>
                      {nextLevel && (
                        <span className="text-slate-400">
                          {xpToNext.toLocaleString()} to Level {nextLevel.level}
                        </span>
                      )}
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4 space-y-3">
                  {/* Disasters Prevented */}
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Disasters Prevented
                      </span>
                    </div>
                    <span className="font-bold text-green-600">
                      ${disastersPreventedTotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Streak */}
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Current Streak
                      </span>
                    </div>
                    <span className="font-bold text-orange-600">
                      {streakCurrent} days
                    </span>
                  </div>

                  {/* Achievements */}
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Achievements
                      </span>
                    </div>
                    <span className="font-bold text-purple-600">
                      {achievements.length}/{ACHIEVEMENTS.length}
                    </span>
                  </div>
                </div>

                {/* Recent Achievements */}
                {achievements.length > 0 && (
                  <div className="px-4 pb-4">
                    <div className="text-xs text-slate-500 uppercase tracking-wide mb-2">
                      Recent Achievements
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {achievements.slice(-5).map((achId) => {
                        const ach = ACHIEVEMENTS.find(a => a.id === achId);
                        if (!ach) return null;
                        return (
                          <div
                            key={achId}
                            className="flex items-center gap-1 bg-slate-100 rounded-full px-2 py-1 text-xs"
                            title={ach.title}
                          >
                            <span>{ach.icon}</span>
                            <span className="font-medium text-slate-700">{ach.title}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Next Level Preview */}
                {nextLevel && (
                  <div className="border-t border-slate-100 p-4 bg-slate-50">
                    <div className="flex items-center gap-2 text-sm">
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-500">Next:</span>
                      <span className="text-lg">{nextLevel.badge}</span>
                      <span className="font-medium text-slate-700">{nextLevel.title}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Full variant for dashboard cards
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      {/* Level display */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{currentLevelData.badge}</div>
        <div>
          <div className="text-sm text-slate-500 uppercase tracking-wide">Your Level</div>
          <div className="text-2xl font-bold text-slate-900">
            {currentLevelData.title}
          </div>
          <div className="text-sm text-slate-600">
            Level {currentLevelData.level} • {totalXp.toLocaleString()} XP
          </div>
        </div>
      </div>

      {/* Progress to next level */}
      {nextLevel && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 mb-1">
            <span>Progress to {nextLevel.title}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-slate-500 mt-1">
            {xpToNext.toLocaleString()} XP to go
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            ${(disastersPreventedTotal / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-slate-500">Prevented</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {streakCurrent}
          </div>
          <div className="text-xs text-slate-500">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {achievements.length}
          </div>
          <div className="text-xs text-slate-500">Badges</div>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact inline version for tight spaces
 */
export function UserLevelBadgeInline() {
  const { currentLevelData, totalXp, isLoading } = useGamification();

  if (isLoading) {
    return <span className="w-6 h-6 rounded-full bg-slate-200 animate-pulse inline-block" />;
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span>{currentLevelData.badge}</span>
      <span className="text-xs font-medium text-slate-600">Lv.{currentLevelData.level}</span>
    </span>
  );
}

/**
 * Disasters Prevented Counter for dashboard
 */
export function DisastersPreventedCounter({ className = '' }) {
  const { disastersPreventedTotal, isLoading } = useGamification();

  if (isLoading) {
    return <div className={`h-10 bg-slate-200 animate-pulse rounded ${className}`} />;
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-4 py-2 ${className}`}
    >
      <DollarSign className="w-5 h-5 text-green-600" />
      <div>
        <div className="text-xs text-green-600 font-medium">Disasters Prevented</div>
        <div className="text-xl font-bold text-green-700">
          ${disastersPreventedTotal.toLocaleString()}
        </div>
      </div>
    </motion.div>
  );
}
