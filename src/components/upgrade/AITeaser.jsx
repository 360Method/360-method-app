import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Brain, Sparkles, AlertTriangle, TrendingUp, DollarSign, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { getTierConfig, tierHasAI } from "@/components/shared/TierCalculator";

/**
 * AITeaser Component
 * Shows free users what AI insights they WOULD get if they upgraded
 * This creates a "fear of missing out" that drives conversions
 * 
 * Usage:
 * <AITeaser 
 *   currentTier="free"
 *   teaserType="cascade_risk"
 *   teaserData={{ systemName: "Gutters", riskScore: 8, potentialCost: 12000 }}
 * />
 */
export default function AITeaser({ 
  currentTier = 'free',
  teaserType = 'cascade_risk',
  teaserData = {},
  compact = false
}) {
  // If user already has AI access, don't show teaser
  if (tierHasAI(currentTier)) {
    return null;
  }

  const teaserConfigs = {
    cascade_risk: {
      icon: AlertTriangle,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      title: 'AI Cascade Risk Alert',
      preview: teaserData.systemName 
        ? `Your ${teaserData.systemName} issue could cascade into $${(teaserData.potentialCost || 12000).toLocaleString()} in damage`
        : 'AI detected a high-risk issue that could cascade into major damage',
      blurredInsight: 'This issue affects 3 connected systems. Recommended action: [UPGRADE TO SEE]',
      upgradeBenefit: 'See exactly which systems are at risk and how to prevent costly cascades'
    },
    cost_forecast: {
      icon: TrendingUp,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      title: 'AI Cost Forecast',
      preview: teaserData.systemName
        ? `Your ${teaserData.systemName} will need attention in the next 12 months`
        : 'AI has predicted your maintenance costs for the next 12 months',
      blurredInsight: 'Projected costs: $[UPGRADE TO SEE] | Optimal timing: [UPGRADE TO SEE]',
      upgradeBenefit: 'Plan your budget with AI-powered cost predictions'
    },
    spending_insight: {
      icon: DollarSign,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      title: 'AI Spending Insight',
      preview: 'AI found ways to optimize your maintenance spending',
      blurredInsight: 'You could save $[UPGRADE TO SEE]/year by [UPGRADE TO SEE]',
      upgradeBenefit: 'Get personalized recommendations to reduce maintenance costs'
    },
    priority_ranking: {
      icon: Shield,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      title: 'AI Priority Ranking',
      preview: 'AI has ranked your maintenance tasks by urgency and ROI',
      blurredInsight: 'Top priority: [UPGRADE TO SEE] | ROI: [UPGRADE TO SEE]',
      upgradeBenefit: 'Know exactly which tasks to tackle first for maximum protection'
    }
  };

  const config = teaserConfigs[teaserType] || teaserConfigs.cascade_risk;
  const Icon = config.icon;

  // Determine recommended tier based on property count
  const recommendedTier = 'homeowner_plus';
  const tierConfig = getTierConfig(recommendedTier);

  if (compact) {
    return (
      <div className={`rounded-lg p-3 ${config.bgColor} border ${config.borderColor}`}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
            <Lock className="w-4 h-4 text-gray-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-700">{config.title}</span>
              <Badge className="text-white text-xs" style={{ backgroundColor: tierConfig.color }}>
                {tierConfig.displayName}+
              </Badge>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-600 mb-2">{config.preview}</p>
        <Button
          asChild
          size="sm"
          className="w-full text-xs"
          style={{ backgroundColor: tierConfig.color }}
        >
          <Link to={createPageUrl("Pricing")}>
            <Sparkles className="w-3 h-3 mr-1" />
            Unlock AI Insights
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Card className={`border-2 ${config.borderColor} ${config.bgColor} relative overflow-hidden`}>
      {/* Decorative AI pattern */}
      <div className="absolute top-0 right-0 w-24 h-24 opacity-10">
        <Brain className="w-full h-full" />
      </div>
      
      <CardContent className="p-4 relative">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-bold text-sm text-gray-900">{config.title}</h3>
              <Badge className="text-white text-xs" style={{ backgroundColor: tierConfig.color }}>
                <Lock className="w-3 h-3 mr-1" />
                {tierConfig.displayName}+
              </Badge>
            </div>
            
            <p className="text-sm text-gray-700 mb-3">{config.preview}</p>
            
            {/* Blurred insight preview */}
            <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200 relative">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Upgrade to reveal</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 blur-sm select-none">
                {config.blurredInsight}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>{config.upgradeBenefit}</span>
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                asChild
                size="sm"
                className="gap-1 font-semibold text-xs"
                style={{ backgroundColor: tierConfig.color }}
              >
                <Link to={createPageUrl("Pricing")}>
                  <Sparkles className="w-3 h-3" />
                  Upgrade for $5/mo
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="text-xs"
              >
                <Link to={createPageUrl("Pricing")}>
                  Compare Plans
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * AITeaserInline - A smaller inline version for embedding in lists
 */
export function AITeaserInline({ currentTier = 'free', message = "AI insight available" }) {
  if (tierHasAI(currentTier)) {
    return null;
  }

  return (
    <Link 
      to={createPageUrl("Pricing")}
      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
    >
      <Lock className="w-3 h-3" />
      <span className="underline">{message}</span>
      <Sparkles className="w-3 h-3 text-yellow-500" />
    </Link>
  );
}

/**
 * AITeaserBanner - A full-width banner for dashboard headers
 * Shows upgrade prompt for free users who don't have AI access
 */
export function AITeaserBanner({ currentTier = 'free', propertyCount = 1 }) {
  // Paid users with AI access - don't show banner
  if (tierHasAI(currentTier)) {
    return null;
  }

  const recommendedTier = propertyCount === 1 ? 'homeowner_plus' : 'good';
  const tierConfig = getTierConfig(recommendedTier);
  const price = recommendedTier === 'homeowner_plus' ? '5' : '8';

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 text-white mb-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-sm">Unlock AI-Powered Protection</h3>
            <p className="text-xs text-white/80">
              AI predicts problems before they become expensive disasters
            </p>
          </div>
        </div>
        <Button
          asChild
          size="sm"
          className="bg-white text-blue-700 hover:bg-blue-50 font-semibold text-xs"
        >
          <Link to={createPageUrl("Pricing")}>
            <Sparkles className="w-3 h-3 mr-1" />
            Try {tierConfig.displayName} - ${price}/mo
          </Link>
        </Button>
      </div>
    </div>
  );
}

/**
 * AIStatusIndicator - Small indicator showing AI access status
 * Use in headers or sidebars
 */
export function AIStatusIndicator({ currentTier = 'free' }) {
  const hasAI = tierHasAI(currentTier);

  if (hasAI) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-purple-600">
        <Sparkles className="w-3 h-3" />
        <span className="font-medium">AI Active</span>
      </div>
    );
  }

  return (
    <Link 
      to={createPageUrl("Pricing")}
      className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
    >
      <Lock className="w-3 h-3" />
      <span className="font-medium">Unlock AI</span>
    </Link>
  );
}
