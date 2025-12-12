import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useGamification } from '@/lib/GamificationContext';
import { DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { createPageUrl } from '@/utils';

/**
 * UserLevelBadge - Compact badge for header display
 *
 * Shows current level badge with XP progress.
 * Clicking navigates to Achievements page.
 */
export default function UserLevelBadge({ variant = 'compact' }) {
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

  // Compact variant for header - links directly to Achievements
  if (variant === 'compact') {
    return (
      <Link to={createPageUrl('Achievements')}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 bg-gradient-to-r from-slate-100 to-slate-50 hover:from-slate-200 hover:to-slate-100 border border-slate-200 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
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
        </motion.div>
      </Link>
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
