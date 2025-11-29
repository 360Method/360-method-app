import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Brain, Lock, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAIUsage } from '@/hooks/useAIUsage';
import { getTierConfig, tierHasAI } from '@/components/shared/TierCalculator';

/**
 * AIUsageGate - Wraps AI features with tier-based access checking
 * 
 * Option C: AI is a paid feature only
 * - Free users: Shows upgrade prompt
 * - Paid users: Always shows children (full access)
 * 
 * Usage:
 * <AIUsageGate featureName="Cascade Risk Alerts">
 *   <AIAnalysisResults />
 * </AIUsageGate>
 */
export default function AIUsageGate({ 
  children,
  featureName = 'AI Analysis',
  fallback = null,
}) {
  const { canUseAI, tier, isLoading } = useAIUsage();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
      </div>
    );
  }

  // Paid users - full AI access
  if (canUseAI) {
    return (
      <>
        <div className="mb-2 text-xs text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-purple-500" />
          <span>AI-Powered • {getTierConfig(tier).displayName}</span>
        </div>
        {children}
      </>
    );
  }

  // Free user - show upgrade prompt
  return fallback || <AIUpgradePrompt featureName={featureName} />;
}

/**
 * Shows upgrade prompt for free users
 */
function AIUpgradePrompt({ featureName }) {
  const homeownerPlusConfig = getTierConfig('homeowner_plus');
  
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
      <CardContent className="p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-purple-600" />
        </div>
        
        <h3 className="font-bold text-lg text-slate-900 mb-2">
          Unlock AI-Powered {featureName}
        </h3>
        
        <p className="text-slate-600 text-sm mb-4">
          Upgrade to Homeowner+ for AI-powered insights that predict problems 
          before they become expensive disasters.
        </p>

        {/* What you get */}
        <div className="bg-white rounded-lg p-4 mb-4 border border-purple-100 text-left">
          <p className="text-xs font-semibold text-purple-700 mb-2">WITH HOMEOWNER+ YOU GET:</p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2 text-slate-700">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>AI cascade risk alerts</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>AI cost forecasting</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>AI inspection summaries</span>
            </li>
            <li className="flex items-center gap-2 text-slate-700">
              <Zap className="w-4 h-4 text-purple-500" />
              <span>PDF report exports</span>
            </li>
          </ul>
        </div>

        <Link to={createPageUrl('Pricing')}>
          <Button 
            className="w-full font-semibold text-white"
            style={{ backgroundColor: homeownerPlusConfig.color }}
          >
            Upgrade to Homeowner+ - $5/mo
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
        
        <p className="text-xs text-slate-500 mt-3">
          Your data is always safe, even on the free plan
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * AIStatusBadge - Small badge showing AI access status
 * Use in headers or navigation
 */
export function AIStatusBadge() {
  const { canUseAI, tier, isLoading } = useAIUsage();

  if (isLoading) return null;
  
  if (canUseAI) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
        <Sparkles className="w-3 h-3" />
        AI Active
      </span>
    );
  }

  return (
    <Link 
      to={createPageUrl('Pricing')}
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700 transition-colors"
    >
      <Lock className="w-3 h-3" />
      Unlock AI
    </Link>
  );
}

/**
 * AITeaser - Shows a teaser of what AI could provide
 * Use to encourage upgrades
 */
export function AITeaser({ 
  featureName = 'AI Analysis',
  previewContent,
}) {
  const { canUseAI } = useAIUsage();
  const homeownerPlusConfig = getTierConfig('homeowner_plus');

  if (canUseAI) {
    return null; // Paid users don't see teasers
  }

  return (
    <Card className="border border-purple-200 bg-purple-50/50 mt-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Brain className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 text-sm mb-1">
              AI {featureName} Available
            </h4>
            <p className="text-xs text-slate-600 mb-3">
              {previewContent || `Upgrade to unlock AI-powered ${featureName.toLowerCase()}.`}
            </p>
            
            <Link
              to={createPageUrl('Pricing')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
              style={{ backgroundColor: homeownerPlusConfig.color }}
            >
              Unlock AI Features
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * withAIGate - HOC to wrap components with AI access checking
 * 
 * Usage:
 * const ProtectedAIComponent = withAIGate(MyAIComponent, {
 *   featureName: 'Cost Forecasting'
 * });
 */
export function withAIGate(Component, options = {}) {
  return function AIGatedComponent(props) {
    return (
      <AIUsageGate {...options}>
        <Component {...props} />
      </AIUsageGate>
    );
  };
}
