import React from 'react';
import { motion } from 'framer-motion';
import { useGamification, ACHIEVEMENTS, LEVEL_THRESHOLDS } from '@/lib/GamificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Trophy, Lock, CheckCircle2, Sparkles, Target,
  Home, Search, DollarSign, Flame, Award, Building2
} from 'lucide-react';

// Category icons and colors
const CATEGORY_CONFIG = {
  baseline: { icon: Home, color: 'blue', label: 'Baseline', description: 'Document your home systems' },
  inspect: { icon: Search, color: 'green', label: 'Inspection', description: 'Regular property check-ups' },
  financial: { icon: DollarSign, color: 'emerald', label: 'Financial', description: 'Prevent costly disasters' },
  streak: { icon: Flame, color: 'orange', label: 'Streaks', description: 'Stay consistent' },
  score: { icon: Award, color: 'purple', label: 'Certifications', description: 'Health score milestones' },
  investor: { icon: Building2, color: 'indigo', label: 'Investor', description: 'Grow your portfolio' }
};

export default function Achievements() {
  const {
    achievements,
    totalXp,
    currentLevelData,
    getProgressToNextLevel,
    isLoading
  } = useGamification();

  const { progress, xpToNext, nextLevel } = getProgressToNextLevel();

  // Group achievements by category
  const achievementsByCategory = ACHIEVEMENTS.reduce((acc, achievement) => {
    const category = achievement.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(achievement);
    return acc;
  }, {});

  // Calculate total XP from achievements
  const achievementXp = achievements.reduce((total, achId) => {
    const ach = ACHIEVEMENTS.find(a => a.id === achId);
    return total + (ach?.xpBonus || 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
              <p className="text-gray-600">Track your progress and unlock rewards</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Current Level */}
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4 text-center">
              <span className="text-4xl mb-1 block">{currentLevelData.badge}</span>
              <p className="font-bold text-purple-900">Level {currentLevelData.level}</p>
              <p className="text-xs text-purple-700">{currentLevelData.title}</p>
            </CardContent>
          </Card>

          {/* Total XP */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-1 text-blue-600" />
              <p className="font-bold text-blue-900">{totalXp.toLocaleString()}</p>
              <p className="text-xs text-blue-700">Total XP</p>
            </CardContent>
          </Card>

          {/* Achievements Unlocked */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-1 text-green-600" />
              <p className="font-bold text-green-900">{achievements.length}/{ACHIEVEMENTS.length}</p>
              <p className="text-xs text-green-700">Unlocked</p>
            </CardContent>
          </Card>

          {/* Achievement XP */}
          <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-1 text-amber-600" />
              <p className="font-bold text-amber-900">+{achievementXp.toLocaleString()}</p>
              <p className="text-xs text-amber-700">XP from Badges</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress to Next Level */}
        {nextLevel && (
          <Card className="mb-8 border-2 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{currentLevelData.badge}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-2xl">{nextLevel.badge}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {xpToNext.toLocaleString()} XP to {nextLevel.title}
                </span>
              </div>
              <Progress value={progress} className="h-3" />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {Math.round(progress)}% complete
              </p>
            </CardContent>
          </Card>
        )}

        {/* Achievement Categories */}
        <div className="space-y-8">
          {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => {
            const config = CATEGORY_CONFIG[category] || { icon: Target, color: 'gray', label: category };
            const Icon = config.icon;
            const unlockedCount = categoryAchievements.filter(a => achievements.includes(a.id)).length;

            return (
              <div key={category}>
                {/* Category Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 text-${config.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="font-bold text-gray-900">{config.label}</h2>
                      <Badge variant="outline" className="text-xs">
                        {unlockedCount}/{categoryAchievements.length}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{config.description}</p>
                  </div>
                </div>

                {/* Achievement Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoryAchievements.map((achievement, index) => {
                    const isUnlocked = achievements.includes(achievement.id);

                    return (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className={`relative overflow-hidden transition-all ${
                            isUnlocked
                              ? 'border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md'
                              : 'border border-gray-200 bg-gray-50 opacity-75'
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Icon */}
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                  isUnlocked
                                    ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                                    : 'bg-gray-200'
                                }`}
                              >
                                {isUnlocked ? (
                                  <span className="text-2xl">{achievement.icon}</span>
                                ) : (
                                  <Lock className="w-5 h-5 text-gray-400" />
                                )}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3
                                    className={`font-bold truncate ${
                                      isUnlocked ? 'text-gray-900' : 'text-gray-500'
                                    }`}
                                  >
                                    {achievement.title}
                                  </h3>
                                  {isUnlocked && (
                                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                  )}
                                </div>
                                <p
                                  className={`text-sm ${
                                    isUnlocked ? 'text-gray-600' : 'text-gray-400'
                                  }`}
                                >
                                  {achievement.description}
                                </p>

                                {/* XP Bonus */}
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge
                                    variant={isUnlocked ? 'default' : 'outline'}
                                    className={`text-xs ${
                                      isUnlocked
                                        ? 'bg-amber-500 hover:bg-amber-500'
                                        : 'text-gray-400 border-gray-300'
                                    }`}
                                  >
                                    +{achievement.xpBonus} XP
                                  </Badge>
                                  {!isUnlocked && (
                                    <span className="text-xs text-gray-400">Locked</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Unlocked shimmer effect */}
                            {isUnlocked && (
                              <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-bl-full" />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Level Roadmap */}
        <Card className="mt-8 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Level Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {LEVEL_THRESHOLDS.map((level) => {
                const isUnlocked = totalXp >= level.xp;
                const isCurrent = currentLevelData.level === level.level;

                return (
                  <div
                    key={level.level}
                    className={`relative p-3 rounded-lg text-center transition-all ${
                      isCurrent
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white ring-2 ring-purple-400 ring-offset-2'
                        : isUnlocked
                        ? 'bg-purple-100 text-purple-900'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{level.badge}</span>
                    <p className="text-xs font-bold">Lv.{level.level}</p>
                    <p className="text-[10px] truncate">{level.title}</p>
                    <p className={`text-[10px] ${isCurrent ? 'text-purple-200' : 'text-gray-400'}`}>
                      {level.xp.toLocaleString()} XP
                    </p>
                    {isCurrent && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
