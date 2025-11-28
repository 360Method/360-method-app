import React, { useState, useEffect } from 'react';
import { useDemo } from '@/components/shared/DemoContext';
import { X, Play, ArrowRight, Home, AlertTriangle, TrendingUp, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DEMO_INTROS = {
  struggling: {
    emoji: "😰",
    label: "Overwhelmed",
    score: 62,
    scoreColor: "text-red-600",
    scoreBg: "bg-red-100",
    ringColor: "ring-red-200",
    futureScore: "78+",
    futureLabel: "Stable",
    tagline: "One hidden problem away from disaster",
    icon: AlertTriangle,
    iconColor: "text-red-500"
  },
  improving: {
    emoji: "💪",
    label: "On Track",
    score: 78,
    scoreColor: "text-amber-600",
    scoreBg: "bg-amber-100",
    ringColor: "ring-amber-200",
    futureScore: "85+",
    futureLabel: "Excellent",
    tagline: "Good start, room to optimize",
    icon: TrendingUp,
    iconColor: "text-amber-500"
  },
  excellent: {
    emoji: "🏆",
    label: "Elite",
    score: 92,
    scoreColor: "text-green-600",
    scoreBg: "bg-green-100",
    ringColor: "ring-green-200",
    futureScore: "95+",
    futureLabel: "Wealth Builder",
    tagline: "Top 5% of homeowners",
    icon: Shield,
    iconColor: "text-green-500"
  },
  investor: {
    emoji: "📊",
    label: "Portfolio",
    score: 79,
    scoreColor: "text-blue-600",
    scoreBg: "bg-blue-100",
    ringColor: "ring-blue-200",
    futureScore: "85+",
    futureLabel: "Optimized",
    tagline: "3 properties • $1.2M in assets",
    icon: Home,
    iconColor: "text-blue-500"
  }
};

export default function DemoIntroModal() {
  const { demoMode } = useDemo();
  const [isOpen, setIsOpen] = useState(false);

  const intro = DEMO_INTROS[demoMode];

  useEffect(() => {
    if (demoMode && intro) {
      const hasSeenIntro = sessionStorage.getItem(`demoIntro_${demoMode}`);
      if (!hasSeenIntro) {
        setIsOpen(true);
      }
    }
  }, [demoMode, intro]);

  const handleClose = () => {
    sessionStorage.setItem(`demoIntro_${demoMode}`, 'seen');
    setIsOpen(false);
  };

  if (!isOpen || !intro) return null;

  const Icon = intro.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal - compact and visual */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Hero section with big score */}
        <div className="pt-8 pb-6 px-6 text-center bg-gradient-to-b from-slate-50 to-white">
          {/* Emoji + Score combo */}
          <div className="relative inline-block mb-4">
            <div className={`w-24 h-24 rounded-full ${intro.scoreBg} ring-4 ${intro.ringColor} flex items-center justify-center mx-auto`}>
              <span className={`text-4xl font-bold ${intro.scoreColor}`}>{intro.score}</span>
            </div>
            <span className="absolute -top-1 -right-1 text-3xl">{intro.emoji}</span>
          </div>

          {/* Label */}
          <p className={`text-sm font-semibold ${intro.scoreColor} mb-1`}>
            {intro.label} Owner
          </p>

          {/* Tagline */}
          <p className="text-gray-600 text-sm">
            {intro.tagline}
          </p>
        </div>

        {/* Visual journey: Now → Future */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-3 py-4 px-4 bg-gradient-to-r from-gray-50 via-orange-50 to-green-50 rounded-xl">
            {/* Current */}
            <div className="text-center">
              <div className={`w-12 h-12 rounded-lg ${intro.scoreBg} flex items-center justify-center mx-auto mb-1`}>
                <span className={`text-lg font-bold ${intro.scoreColor}`}>{intro.score}</span>
              </div>
              <p className="text-xs text-gray-500">Now</p>
            </div>

            {/* Arrow with sparkle */}
            <div className="flex flex-col items-center px-2">
              <div className="flex items-center gap-1">
                <div className="h-0.5 w-6 bg-gradient-to-r from-gray-300 to-orange-400 rounded" />
                <Sparkles className="w-4 h-4 text-orange-500" />
                <div className="h-0.5 w-6 bg-gradient-to-r from-orange-400 to-green-400 rounded" />
              </div>
              <p className="text-[10px] text-orange-600 font-medium mt-1">Your path</p>
            </div>

            {/* Future */}
            <div className="text-center">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mx-auto mb-1">
                <span className="text-lg font-bold text-green-600">{intro.futureScore}</span>
              </div>
              <p className="text-xs text-gray-500">{intro.futureLabel}</p>
            </div>
          </div>
        </div>

        {/* Simple guide indicator */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 rounded-lg px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">👋</span>
            </div>
            <p>
              <span className="font-medium text-blue-900">We'll guide you</span>
              <span className="text-blue-700"> through each step</span>
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-4 pt-0">
          <Button
            onClick={handleClose}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2 h-12 text-base"
          >
            <Play className="w-5 h-5" />
            Let's Go
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
