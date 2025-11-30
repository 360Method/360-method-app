import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useDemo } from '../shared/DemoContext';
import {
  HelpCircle,
  Play,
  Sparkles,
  Rocket,
  Map,
  BookOpen,
  MessageCircle,
  ChevronRight,
  X,
  Home,
  AlertTriangle,
  TrendingUp,
  Award,
  Building2,
  Target,
  DollarSign,
  Shield
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

// Demo profile descriptions
const DEMO_PROFILES = {
  struggling: {
    title: 'Struggling Homeowner',
    score: 62,
    icon: AlertTriangle,
    color: 'red',
    description: 'Reactive mode - putting out fires',
    stats: [
      { label: 'Health Score', value: '62/100', trend: 'critical' },
      { label: 'Critical Issues', value: '2', trend: 'bad' },
      { label: 'Predicted Repairs', value: '$17,000', trend: 'bad' },
      { label: 'Potential Savings', value: '$14,000', trend: 'good' }
    ],
    cta: 'See how to reach 78+ in 6 months'
  },
  improving: {
    title: 'Improving Homeowner',
    score: 78,
    icon: TrendingUp,
    color: 'yellow',
    description: 'Bronze level - getting proactive',
    stats: [
      { label: 'Health Score', value: '78/100', trend: 'moderate' },
      { label: 'Active Tasks', value: '4', trend: 'neutral' },
      { label: 'Annual Savings', value: '$3,200', trend: 'good' },
      { label: 'Goal', value: '85 (Silver)', trend: 'neutral' }
    ],
    cta: 'See how to reach Silver in 3 months'
  },
  excellent: {
    title: 'Excellent Homeowner',
    score: 92,
    icon: Award,
    color: 'green',
    description: 'Gold level - top 5% of owners',
    stats: [
      { label: 'Health Score', value: '92/100', trend: 'good' },
      { label: 'Systems Tracked', value: '16', trend: 'good' },
      { label: 'Disasters Prevented', value: '$24,700', trend: 'good' },
      { label: 'Property Value', value: '$550K', trend: 'good' }
    ],
    cta: 'Maintain excellence & grow wealth'
  },
  investor: {
    title: 'Portfolio Investor',
    score: null,
    icon: Building2,
    color: 'blue',
    description: '3 properties, 7 doors, $1.2M assets',
    stats: [
      { label: 'Properties', value: '3', trend: 'neutral' },
      { label: 'Total Equity', value: '$547K', trend: 'good' },
      { label: 'Monthly Cash Flow', value: '$3,170', trend: 'good' },
      { label: '10-Year Projection', value: '$1.8M', trend: 'good' }
    ],
    cta: 'Scale your portfolio with confidence'
  }
};

// Step-specific tips
const STEP_TIPS = {
  'DemoOverwhelmed': { step: 'Welcome', tip: 'Start the tour to see how you can transform from reactive to proactive maintenance.' },
  'DemoImproving': { step: 'Welcome', tip: 'You\'re at Bronze level. Let\'s get you to Silver (85+)!' },
  'DemoExcellent': { step: 'Welcome', tip: 'Gold status achieved! Learn how to maintain excellence.' },
  'DemoPortfolio': { step: 'Portfolio', tip: 'Managing multiple properties? See how 360° Method scales.' },
  'Baseline': { step: '1. Baseline', tip: 'Document your 6 core systems to unlock the full method.' },
  'Inspect': { step: '2. Inspect', tip: 'Seasonal inspections catch 90% of problems before they\'re emergencies.' },
  'Track': { step: '3. Track', tip: 'Every maintenance event is logged automatically for history.' },
  'Prioritize': { step: '4. Prioritize', tip: 'AI ranks tasks by cascade risk - focus on HIGH items first.' },
  'Schedule': { step: '5. Schedule', tip: 'Plan maintenance strategically to save time and money.' },
  'Execute': { step: '6. Execute', tip: 'Complete tasks with DIY guides or find qualified contractors.' },
  'Preserve': { step: '7. Preserve', tip: 'Small investments now extend system life 3-6 years.' },
  'Upgrade': { step: '8. Upgrade', tip: 'Strategic upgrades with ROI calculations and payback periods.' },
  'Scale': { step: '9. Scale', tip: 'Track equity growth and plan your wealth-building journey.' }
};

export default function DemoHelpButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { demoMode, demoData } = useDemo();
  const [isOpen, setIsOpen] = useState(false);

  if (!demoMode) return null;

  // Determine which demo profile is active
  const currentPath = location.pathname;
  let profileKey = 'struggling'; // default
  if (currentPath.includes('DemoImproving')) profileKey = 'improving';
  else if (currentPath.includes('DemoExcellent')) profileKey = 'excellent';
  else if (currentPath.includes('DemoPortfolio') || currentPath.includes('Investor')) profileKey = 'investor';

  const profile = DEMO_PROFILES[profileKey];
  const ProfileIcon = profile.icon;

  // Get current step tip
  const pathKey = Object.keys(STEP_TIPS).find(key => currentPath.includes(key));
  const currentTip = pathKey ? STEP_TIPS[pathKey] : null;

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'good': return 'text-green-600';
      case 'bad': return 'text-red-600';
      case 'critical': return 'text-red-700 font-bold';
      case 'moderate': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'bg-blue-600';
    if (score >= 85) return 'bg-green-600';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-600';
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 left-4 z-[48] md:bottom-6 md:left-auto md:right-24 flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-600 transition-all group"
        style={{ minHeight: '48px' }}
      >
        <Rocket className="w-5 h-5" />
        <span className="font-bold text-sm">Start Free Today</span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-[9998] md:bottom-6 md:left-auto md:right-6 md:w-96">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-300 overflow-hidden">
        {/* Header */}
        <div className={`p-4 bg-gradient-to-r ${
          profileKey === 'struggling' ? 'from-red-500 to-orange-500' :
          profileKey === 'improving' ? 'from-yellow-500 to-orange-500' :
          profileKey === 'excellent' ? 'from-green-500 to-emerald-500' :
          'from-blue-500 to-purple-500'
        } text-white`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ProfileIcon className="w-5 h-5" />
              <span className="font-bold">{profile.title}</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-white/90">{profile.description}</p>
          {profile.score && (
            <div className="mt-2 flex items-center gap-2">
              <Badge className={`${getScoreColor(profile.score)} text-white`}>
                Score: {profile.score}
              </Badge>
            </div>
          )}
        </div>

        {/* Current Step Tip */}
        {currentTip && (
          <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-start gap-2">
              <Target className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-blue-900">{currentTip.step}</p>
                <p className="text-xs text-blue-700">{currentTip.tip}</p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="p-4 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-600 mb-2">Demo Property Stats:</p>
          <div className="grid grid-cols-2 gap-2">
            {profile.stats.map((stat, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-2">
                <p className="text-xs text-gray-500">{stat.label}</p>
                <p className={`text-sm font-bold ${getTrendColor(stat.trend)}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-600 mb-2">Quick Actions:</p>

          <button
            onClick={() => {
              setIsOpen(false);
              // Trigger the tour start (the GuidedDemoTour handles this via sessionStorage)
              sessionStorage.removeItem(`demoTour_${profileKey}`);
              window.location.reload();
            }}
            className="w-full flex items-center gap-3 p-3 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors text-left"
          >
            <Play className="w-5 h-5 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-orange-900">Start Guided Tour</p>
              <p className="text-xs text-orange-700">Walk through all 9 steps</p>
            </div>
            <ChevronRight className="w-4 h-4 text-orange-400" />
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              // The DemoAIChat will open when user clicks the AI button
              document.querySelector('[data-demo-ai-trigger]')?.click();
            }}
            className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors text-left"
          >
            <Sparkles className="w-5 h-5 text-purple-600" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-900">Ask AI Assistant</p>
              <p className="text-xs text-purple-700">Get answers about the 360° Method</p>
            </div>
            <ChevronRight className="w-4 h-4 text-purple-400" />
          </button>

          <button
            onClick={() => {
              setIsOpen(false);
              navigate('/Login');
            }}
            className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg border border-green-300 transition-colors text-left"
          >
            <Rocket className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-bold text-green-900">Start Free Today</p>
              <p className="text-xs text-green-700">Create your account - no credit card</p>
            </div>
            <ChevronRight className="w-4 h-4 text-green-400" />
          </button>
        </div>

        {/* Footer CTA */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-center text-gray-600">
            {profile.cta}
          </p>
        </div>
      </div>
    </div>
  );
}
