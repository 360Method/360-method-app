import React, { useState } from 'react';
import { X, Brain, Sparkles, Home, Flag, Star, Crown, ArrowRight, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { getTierConfig, tierHasAI } from '@/components/shared/TierCalculator';

/**
 * UpgradeNudge - Non-invasive upgrade prompts for strategic placement
 * 
 * Types:
 * - ai_unlock: When user encounters AI-locked feature
 * - property_limit: When user tries to add more properties
 * - inspection_complete: After completing an inspection
 * - general: Generic upgrade prompt
 * 
 * Usage:
 * <UpgradeNudge 
 *   type="ai_unlock"
 *   currentTier="free"
 *   featureName="AI Cascade Alerts"
 *   dismissible={true}
 * />
 */
export default function UpgradeNudge({ 
  type = 'general',
  currentTier = 'free',
  featureName = '',
  propertyCount = 1,
  dismissible = true,
  onDismiss,
  compact = false
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user already has the feature
  if (type === 'ai_unlock' && tierHasAI(currentTier)) {
    return null;
  }

  if (isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  // Determine recommended tier based on context
  const getRecommendedTier = () => {
    if (type === 'property_limit') {
      if (propertyCount <= 25) return 'good';
      if (propertyCount <= 100) return 'better';
      return 'best';
    }
    if (propertyCount === 1) return 'homeowner_plus';
    if (propertyCount <= 25) return 'good';
    return 'better';
  };

  const recommendedTier = getRecommendedTier();
  const tierConfig = getTierConfig(recommendedTier);

  // Content based on type
  const content = {
    ai_unlock: {
      icon: Brain,
      title: featureName ? `Unlock ${featureName}` : 'Unlock AI Features',
      message: 'Get AI-powered insights to prevent costly disasters.',
      cta: `Try ${tierConfig.displayName}`,
      color: '#8B5CF6'
    },
    property_limit: {
      icon: Building2,
      title: 'Add More Properties',
      message: `Upgrade to ${tierConfig.displayName} to manage more properties.`,
      cta: 'Upgrade Now',
      color: tierConfig.color
    },
    inspection_complete: {
      icon: Sparkles,
      title: 'Want AI Analysis?',
      message: 'AI can identify hidden risks in your inspection results.',
      cta: 'Unlock AI Insights',
      color: '#8B5CF6'
    },
    general: {
      icon: Sparkles,
      title: 'Upgrade Your Plan',
      message: 'Get more features and better protection.',
      cta: 'View Plans',
      color: tierConfig.color
    }
  };

  const { icon: Icon, title, message, cta, color } = content[type] || content.general;

  // Compact version - inline link style
  if (compact) {
    return (
      <Link 
        to={createPageUrl('Pricing')}
        className="inline-flex items-center gap-1.5 text-sm hover:underline transition-colors"
        style={{ color }}
      >
        <Icon className="w-4 h-4" />
        <span>{cta}</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    );
  }

  // Full banner version
  return (
    <div 
      className="relative rounded-lg p-4 border"
      style={{ 
        backgroundColor: `${color}08`,
        borderColor: `${color}30`
      }}
    >
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-900 text-sm mb-1">{title}</h4>
          <p className="text-xs text-slate-600 mb-3">{message}</p>
          
          <div className="flex items-center gap-3">
            <Link
              to={createPageUrl('Pricing')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
              style={{ backgroundColor: color }}
            >
              {cta}
              <ArrowRight className="w-3 h-3" />
            </Link>
            <a
              href="/#pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              Learn more
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * UpgradeNudgeInline - Very subtle inline upgrade prompt
 * Use in lists, tables, or inline with other content
 */
export function UpgradeNudgeInline({ 
  currentTier = 'free',
  message = 'Upgrade for more',
  targetTier = 'homeowner_plus'
}) {
  if (tierHasAI(currentTier) && targetTier === 'homeowner_plus') {
    return null;
  }

  const tierConfig = getTierConfig(targetTier);

  return (
    <Link 
      to={createPageUrl('Pricing')}
      className="inline-flex items-center gap-1 text-xs hover:underline"
      style={{ color: tierConfig.color }}
    >
      <Sparkles className="w-3 h-3" />
      <span>{message}</span>
    </Link>
  );
}

/**
 * UpgradeNudgeBadge - Small badge-style upgrade prompt
 * Use next to locked features
 */
export function UpgradeNudgeBadge({ 
  tier = 'homeowner_plus',
  onClick 
}) {
  const tierConfig = getTierConfig(tier);

  return (
    <Link
      to={createPageUrl('Pricing')}
      onClick={onClick}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white transition-opacity hover:opacity-90"
      style={{ backgroundColor: tierConfig.color }}
    >
      <Sparkles className="w-3 h-3" />
      {tierConfig.displayName}
    </Link>
  );
}

/**
 * UpgradeNudgeCard - Larger card for dashboard placement
 * Shows tier comparison
 */
export function UpgradeNudgeCard({ 
  currentTier = 'free',
  targetTier = 'homeowner_plus',
  onDismiss
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const currentConfig = getTierConfig(currentTier);
  const targetConfig = getTierConfig(targetTier);

  const tierIcons = {
    free: Home,
    homeowner_plus: Home,
    good: Flag,
    better: Star,
    best: Crown
  };

  const TargetIcon = tierIcons[targetTier] || Sparkles;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-100 transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4 text-slate-400" />
      </button>

      <div className="flex items-center gap-2 mb-4">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${targetConfig.color}15` }}
        >
          <TargetIcon className="w-4 h-4" style={{ color: targetConfig.color }} />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Upgrade to {targetConfig.displayName}</h3>
          <p className="text-xs text-slate-500">Unlock more features</p>
        </div>
      </div>

      <ul className="space-y-2 mb-4">
        {targetConfig.features?.slice(1, 4).map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-slate-600">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: targetConfig.color }} />
            {feature}
          </li>
        ))}
      </ul>

      <Link
        to={createPageUrl('Pricing')}
        className="block w-full text-center py-2.5 rounded-lg font-semibold text-sm text-white transition-colors"
        style={{ backgroundColor: targetConfig.color }}
      >
        Upgrade Now
      </Link>
    </div>
  );
}

