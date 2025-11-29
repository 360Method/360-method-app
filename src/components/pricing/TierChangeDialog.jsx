import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X, ArrowRight, Brain, Sparkles, Zap, TrendingUp, Crown, Check, AlertTriangle, Compass, Flag, Star, Home } from "lucide-react";

export default function TierChangeDialog({ 
  open, 
  onClose, 
  onConfirm,
  currentTier,
  newTier,
  currentTierConfig,
  newTierConfig,
  newTierPricing,
  totalDoors,
  billingCycle = 'annual',
  isLoading = false
}) {
  // State for downgrade confirmation input
  const [downgradeConfirmText, setDowngradeConfirmText] = useState('');
  
  // Reset confirmation text when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setDowngradeConfirmText('');
    }
  }, [open]);

  if (!open) return null;

  const tierOrder = ['free', 'homeowner_plus', 'good', 'better', 'best'];
  const isUpgrade = tierOrder.indexOf(newTier) > tierOrder.indexOf(currentTier);
  const isDowngrade = !isUpgrade;

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'free': return Compass;
      case 'homeowner_plus': return Home;
      case 'good': return Flag;
      case 'better': return Star;
      case 'best': return Crown;
      default: return Compass;
    }
  };

  // Check if downgrade confirmation is valid
  const isDowngradeConfirmValid = downgradeConfirmText.toUpperCase() === 'DOWNGRADE';

  const CurrentIcon = getTierIcon(currentTier);
  const NewIcon = getTierIcon(newTier);

  // Feature changes - show only new features for each tier upgrade
  const getFeatureChanges = () => {
    const features = {
      free: ['Full 360° Method', 'Baseline documentation', 'Inspection checklists', 'Task tracking', '1 property'],
      homeowner_plus: ['AI-powered insights', 'AI risk analysis', 'AI cost forecasting', 'AI inspection summaries', 'PDF reports', '1 property'],
      good: ['Portfolio analytics', 'Multi-property AI insights', 'Priority support', 'Up to 25 doors'],
      better: ['Team collaboration', 'White-label reports', 'AI portfolio comparison', 'Up to 100 doors'],
      best: ['Custom AI reports', 'Multi-user accounts', 'Dedicated manager', 'Phone support', 'Unlimited doors']
    };

    const currentFeatures = features[currentTier] || [];
    const newFeatures = features[newTier] || [];

    if (isUpgrade) {
      return {
        gaining: newFeatures,
        keeping: currentFeatures
      };
    } else {
      // For downgrade, show what they're losing (features in current tier not in new tier)
      const losingFeatures = currentFeatures.filter(f => !newFeatures.includes(f));
      return {
        losing: losingFeatures,
        keeping: newFeatures
      };
    }
  };

  const changes = getFeatureChanges();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <Card 
        className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ zIndex: 101 }}
      >
        <CardContent className="p-0">
          {/* Header */}
          <div 
            className="p-6 border-b"
            style={{ 
              background: isUpgrade 
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {isUpgrade ? (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <ArrowRight className="w-6 h-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {isUpgrade ? 'Confirm Upgrade' : 'Confirm Downgrade'}
                  </h2>
                  <p className="text-white/90 text-sm mt-1">
                    {isUpgrade 
                      ? 'You\'re leveling up your homeownership game!' 
                      : 'Are you sure you want to downgrade?'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Tier Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <p className="text-white/70 text-xs mb-2">Current Plan</p>
                <div className="flex items-center gap-2 mb-2">
                  <CurrentIcon className="w-5 h-5 text-white" />
                  <span className="font-bold text-white text-lg">{currentTierConfig.displayName}</span>
                </div>
                <p className="text-white/90 text-sm">
                  {currentTier === 'free' ? '$0/month' : 'Current pricing'}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2" style={{ borderColor: newTierConfig.color }}>
                <p className="text-gray-600 text-xs mb-2">New Plan</p>
                <div className="flex items-center gap-2 mb-2">
                  <NewIcon className="w-5 h-5" style={{ color: newTierConfig.color }} />
                  <span className="font-bold text-lg" style={{ color: newTierConfig.color }}>
                    {newTierConfig.displayName}
                  </span>
                </div>
                {newTier !== 'free' && newTierPricing ? (
                  <div>
                    <p className="font-bold text-xl" style={{ color: newTierConfig.color }}>
                      ${newTierPricing.monthlyPrice}<span className="text-sm">/mo</span>
                    </p>
                    {billingCycle === 'annual' ? (
                      <p className="text-xs text-gray-600 mt-1">
                        Billed ${newTierPricing.annualPrice}/year
                      </p>
                    ) : (
                      <p className="text-xs text-gray-600 mt-1">
                        Billed monthly
                      </p>
                    )}
                    {newTierPricing.additionalDoors > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        ${newTierPricing.breakdown.base} + ${newTierPricing.breakdown.additionalCost} for {newTierPricing.additionalDoors} doors
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="font-bold text-xl text-gray-700">$0/mo</p>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Why This Change Matters */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3" style={{ color: '#1B365D' }}>
                {isUpgrade ? '🎯 What You\'re Gaining:' : '⚠️ What You\'re Losing:'}
              </h3>
              
              {isUpgrade ? (
                <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200 mb-4">
                  <p className="text-sm text-green-900 leading-relaxed">
                    <strong>Why this makes you a better homeowner:</strong> {newTierConfig.displayName} unlocks AI intelligence that transforms you from reactive to proactive - preventing disasters before they happen and saving thousands in emergency repairs.
                  </p>
                </div>
              ) : (
                <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200 mb-4">
                  <p className="text-sm text-orange-900 leading-relaxed">
                    <strong>Important:</strong> Downgrading removes AI features that help prevent costly disasters. You'll lose cascade risk alerts, spending forecasts, and smart prioritization that saves most users $8,400/year in prevented emergencies.
                  </p>
                </div>
              )}

              {/* Feature Lists */}
              <div className="space-y-3">
                {isUpgrade && changes.gaining.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      ✨ New Features (includes everything in {currentTierConfig.displayName}):
                    </p>
                    <div className="space-y-1">
                      {changes.gaining.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                          <Brain className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: newTierConfig.color }} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {isDowngrade && changes.losing.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-red-700 mb-2">❌ Features You'll Lose:</p>
                    <div className="space-y-1">
                      {changes.losing.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-red-600">
                          <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {changes.keeping.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">✓ You'll Keep:</p>
                    <div className="space-y-1">
                      {changes.keeping.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                          <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Data Safety */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 mb-6">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                💾 Your Data is Safe
              </p>
              <p className="text-xs text-blue-800 leading-relaxed">
                All your properties, baselines, inspections, and maintenance history stay intact. 
                {isDowngrade && ' If you exceed the new tier\'s limits, extra properties are archived (not deleted) and can be reactivated by upgrading again.'}
              </p>
            </div>

            {/* Pricing Breakdown (for paid tiers) */}
            {newTier !== 'free' && newTierPricing && totalDoors > 0 && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  📊 Your Pricing:
                </p>
                <div className="space-y-1 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Properties/Doors:</span>
                    <span className="font-semibold">{totalDoors} door{totalDoors !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly:</span>
                    <span className="font-semibold">${newTierPricing.monthlyPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{billingCycle === 'annual' ? 'Annual (billed upfront):' : 'Annual (if monthly):'}</span>
                    <span>${newTierPricing.annualPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Billing Cycle:</span>
                    <span className="font-semibold capitalize">{billingCycle}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Downgrade Confirmation Input */}
            {isDowngrade && (
              <div className="mb-6 bg-red-50 rounded-lg p-4 border-2 border-red-200">
                <p className="text-sm font-semibold text-red-900 mb-2">
                  🔒 Type "DOWNGRADE" to confirm
                </p>
                <p className="text-xs text-red-700 mb-3">
                  This helps prevent accidental downgrades. You can always upgrade again later.
                </p>
                <Input
                  type="text"
                  placeholder="Type DOWNGRADE to confirm"
                  value={downgradeConfirmText}
                  onChange={(e) => setDowngradeConfirmText(e.target.value)}
                  className={`font-mono text-center uppercase ${
                    downgradeConfirmText && !isDowngradeConfirmValid 
                      ? 'border-red-400 focus:ring-red-400' 
                      : isDowngradeConfirmValid 
                        ? 'border-green-400 focus:ring-green-400 bg-green-50' 
                        : ''
                  }`}
                />
                {downgradeConfirmText && !isDowngradeConfirmValid && (
                  <p className="text-xs text-red-600 mt-1">Please type "DOWNGRADE" exactly</p>
                )}
                {isDowngradeConfirmValid && (
                  <p className="text-xs text-green-600 mt-1">✓ Confirmed - you can now downgrade</p>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                disabled={isLoading}
                className="flex-1"
                style={{ minHeight: '56px' }}
              >
                Cancel
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading || (isDowngrade && !isDowngradeConfirmValid)}
                className="flex-1 font-bold text-lg"
                style={{ 
                  backgroundColor: isUpgrade ? '#10B981' : '#F59E0B',
                  minHeight: '56px',
                  opacity: (isDowngrade && !isDowngradeConfirmValid) ? 0.5 : 1
                }}
              >
                {isLoading ? (
                  'Switching...'
                ) : isUpgrade ? (
                  <>✓ Upgrade Now</>
                ) : (
                  <>Confirm Downgrade</>
                )}
              </Button>
            </div>

            {/* Instant Activation */}
            <p className="text-xs text-center text-gray-500 mt-4">
              ⚡ Changes take effect immediately • {isUpgrade ? 'Demo mode - no payment required' : 'Your data is preserved'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}