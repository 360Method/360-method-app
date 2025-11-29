import React from "react";
import { Property, functions } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Brain, Compass, Flag, Star, Home, CreditCard, Calendar, AlertCircle, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { calculateTotalDoors, getTierConfig, calculateHomeownerPlusPricing, calculateGoodPricing, calculateBetterPricing, calculateBestPricing } from "../components/shared/TierCalculator";
import TierChangeDialog from "../components/pricing/TierChangeDialog";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";

export default function Pricing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isChangingTier, setIsChangingTier] = React.useState(false);
  const [showTierDialog, setShowTierDialog] = React.useState(false);
  const [selectedNewTier, setSelectedNewTier] = React.useState(null);
  const [showAllPlans, setShowAllPlans] = React.useState(false);

  // Get user from Clerk auth context
  const { user, updateUserMetadata } = useAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await Property.list();
      return allProps.filter(p => !p.is_draft);
    },
  });

  const { data: subscriptionData } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      try {
        const { data } = await functions.invoke('getSubscriptionStatus');
        return data;
      } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  // Mutation to create Stripe checkout session for upgrades
  const checkoutMutation = useMutation({
    mutationFn: async ({ tier, billing_cycle }) => {
      const { data, error } = await functions.invoke('createSubscriptionCheckout', {
        tier,
        billing_cycle,
        user_id: user?.id,
        user_email: user?.email,
        user_name: user?.name,
        success_url: `${window.location.origin}${createPageUrl('Settings')}?tab=subscription&status=success`,
        cancel_url: `${window.location.origin}${createPageUrl('Pricing')}`,
        total_doors: totalDoors
      });
      if (error) throw new Error(error.message || 'Checkout failed');
      if (!data?.success) throw new Error(data?.error || 'Checkout failed');
      return data;
    },
    onSuccess: (data) => {
      // For prorated upgrades, the subscription is updated immediately (no Stripe Checkout needed)
      if (data.prorated) {
        toast.success(`Upgraded to ${data.tier}!`, {
          description: 'Your subscription has been updated with prorated billing.'
        });
        setIsChangingTier(false);
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
        queryClient.invalidateQueries({ queryKey: ['current-user'] });
        // Redirect to success URL
        if (data.redirect_url) {
          window.location.href = data.redirect_url;
        }
        return;
      }
      // For new subscriptions, redirect to Stripe Checkout
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (error) => {
      setIsChangingTier(false);
      toast.error('Failed to start checkout', {
        description: error.message || 'Please try again.'
      });
    }
  });

  // Mutation to change tier via Clerk metadata (for downgrades)
  const changeTierMutation = useMutation({
    mutationFn: async (newTier) => {
      // Update tier in Clerk user metadata
      await updateUserMetadata({ tier: newTier });
      return newTier;
    },
    onSuccess: (newTier) => {
      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });

      setIsChangingTier(false);
      setShowTierDialog(false);

      const tierConfig = getTierConfig(newTier);

      toast.success(`Plan changed to ${tierConfig.displayName}`, {
        description: 'Your data has been preserved.'
      });

      setSelectedNewTier(null);
    },
    onError: (error) => {
      setIsChangingTier(false);
      toast.error('Failed to change plan', {
        description: error.message || 'Please try again.'
      });
    }
  });

  // Define tier hierarchy for upgrade suggestions
  const tierOrder = ['free', 'homeowner_plus', 'good', 'better', 'best'];
  const currentTier = user?.tier || 'free';
  const currentTierIndex = tierOrder.indexOf(currentTier);

  const handleChangeTier = async (tier) => {
    const isUpgrade = tierOrder.indexOf(tier) > currentTierIndex;

    // For upgrades to paid tiers: Go directly to Stripe checkout (one-click!)
    // If user has existing subscription, they get prorated (handled by mutation onSuccess)
    // If new subscription, they get redirected to Stripe Checkout
    if (isUpgrade && tier !== 'free') {
      setIsChangingTier(true);
      try {
        await checkoutMutation.mutateAsync({
          tier,
          billing_cycle: 'annual'
        });
        // Redirect is handled in onSuccess callback
      } catch (error) {
        // Error already handled in mutation
      }
      return;
    }

    // For downgrades: Show confirmation dialog (accessed via hidden "View all plans")
    setSelectedNewTier(tier);
    setShowTierDialog(true);
  };

  const handleConfirmTierChange = () => {
    setIsChangingTier(true);
    changeTierMutation.mutate(selectedNewTier);
  };

  const totalDoors = calculateTotalDoors(properties);
  const currentTierConfig = getTierConfig(currentTier);

  const hasActiveSubscription = subscriptionData?.has_subscription && subscriptionData?.subscription?.is_active;
  const subscriptionInfo = subscriptionData?.subscription;
  const billingCycle = subscriptionInfo?.billing_cycle || 'annual';

  // Check if tier has AI features
  const tierHasAI = currentTierConfig.aiFeatures;

  // Get current pricing
  const getCurrentPrice = () => {
    switch(currentTier) {
      case 'homeowner_plus': return calculateHomeownerPlusPricing(billingCycle).monthlyPrice;
      case 'good': return calculateGoodPricing(totalDoors, billingCycle).monthlyPrice;
      case 'better': return calculateBetterPricing(totalDoors, billingCycle).monthlyPrice;
      case 'best': return calculateBestPricing(billingCycle).monthlyPrice;
      default: return 0;
    }
  };

  // Get next upgrade tier
  const getNextUpgrade = () => {
    if (currentTierIndex >= tierOrder.length - 1) return null;
    
    // Skip homeowner_plus if user has multiple properties
    let nextIndex = currentTierIndex + 1;
    if (tierOrder[nextIndex] === 'homeowner_plus' && properties.length > 1) {
      nextIndex++;
    }
    
    if (nextIndex >= tierOrder.length) return null;
    return tierOrder[nextIndex];
  };

  const nextUpgrade = getNextUpgrade();
  const nextUpgradeConfig = nextUpgrade ? getTierConfig(nextUpgrade) : null;

  // Get upgrade price
  const getUpgradePrice = (tier) => {
    switch(tier) {
      case 'homeowner_plus': return calculateHomeownerPlusPricing('annual').monthlyPrice;
      case 'good': return calculateGoodPricing(totalDoors, 'annual').monthlyPrice;
      case 'better': return calculateBetterPricing(totalDoors, 'annual').monthlyPrice;
      case 'best': return calculateBestPricing('annual').monthlyPrice;
      default: return 0;
    }
  };

  // Icons for tiers
  const tierIcons = {
    free: Compass,
    homeowner_plus: Home,
    good: Flag,
    better: Star,
    best: Crown
  };

  const CurrentIcon = tierIcons[currentTier] || Compass;
  const UpgradeIcon = nextUpgrade ? tierIcons[nextUpgrade] : null;

  let selectedNewTierPricing = null;
  if (selectedNewTier) {
    switch(selectedNewTier) {
      case 'homeowner_plus': selectedNewTierPricing = calculateHomeownerPlusPricing(billingCycle); break;
      case 'good': selectedNewTierPricing = calculateGoodPricing(totalDoors, billingCycle); break;
      case 'better': selectedNewTierPricing = calculateBetterPricing(totalDoors, billingCycle); break;
      case 'best': selectedNewTierPricing = calculateBestPricing(billingCycle); break;
      default: selectedNewTierPricing = { monthlyPrice: 0 };
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Your Plan</h1>
          <p className="text-slate-600 text-sm">Manage your subscription</p>
        </div>

        {/* Past Due Warning */}
        {subscriptionInfo?.is_past_due && (
          <Card className="border-red-300 bg-red-50 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="font-semibold text-red-900 text-sm">Payment Failed</p>
                  <p className="text-xs text-red-700">Update your payment method to continue.</p>
                </div>
                <Button size="sm" className="bg-red-600" onClick={() => navigate(createPageUrl('PaymentMethods'))}>
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Plan Card */}
        <Card className="border-2 mb-6" style={{ borderColor: currentTierConfig.color }}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${currentTierConfig.color}15` }}
                >
                  <CurrentIcon className="w-6 h-6" style={{ color: currentTierConfig.color }} />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-slate-900">{currentTierConfig.displayName}</h2>
                  <Badge className="text-white mt-1" style={{ backgroundColor: currentTierConfig.color }}>
                    Current Plan
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: currentTierConfig.color }}>
                  ${getCurrentPrice()}<span className="text-sm font-normal text-slate-500">/mo</span>
                </p>
                {hasActiveSubscription && (
                  <p className="text-xs text-slate-500 mt-1">
                    {billingCycle === 'annual' ? 'Billed annually' : 'Billed monthly'}
                  </p>
                )}
              </div>
            </div>

            {/* Subscription Info */}
            {hasActiveSubscription && subscriptionInfo?.current_period_end && (
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4 bg-slate-100 rounded-lg p-3">
                <Calendar className="w-4 h-4" />
                <span>
                  {subscriptionInfo.cancel_at_period_end ? 'Cancels' : 'Renews'} on {new Date(subscriptionInfo.current_period_end).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* AI Status */}
            {tierHasAI ? (
              <div className="flex items-center gap-2 text-sm mb-4 bg-purple-50 rounded-lg p-3 border border-purple-200">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span className="text-purple-800 font-medium">AI-powered insights included</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm mb-4 bg-slate-100 rounded-lg p-3 border border-slate-200">
                <Brain className="w-4 h-4 text-slate-500" />
                <span className="text-slate-600">
                  Upgrade to unlock AI-powered insights
                </span>
              </div>
            )}

            {/* Features */}
            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold text-slate-500 uppercase mb-3">What's Included</p>
              <div className="grid grid-cols-2 gap-2">
                {currentTierConfig.features?.slice(0, 6).map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="truncate">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Manage Button */}
            {hasActiveSubscription && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(createPageUrl('Settings'))}
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Subscription
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Option */}
        {nextUpgrade && (
          <Card className="border-2 border-dashed border-slate-300 bg-white mb-6 hover:border-solid hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${nextUpgradeConfig.color}15` }}
                  >
                    <UpgradeIcon className="w-5 h-5" style={{ color: nextUpgradeConfig.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">Upgrade to</p>
                    <h3 className="font-bold text-lg text-slate-900">{nextUpgradeConfig.displayName}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold" style={{ color: nextUpgradeConfig.color }}>
                    ${getUpgradePrice(nextUpgrade)}<span className="text-sm font-normal text-slate-500">/mo</span>
                  </p>
                </div>
              </div>

              {/* Key Benefit */}
              <div className="mt-4 bg-slate-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-sm">
                  {nextUpgradeConfig.aiFeatures && <Brain className="w-4 h-4 text-purple-600" />}
                  <span className="text-slate-700">
                    {nextUpgrade === 'homeowner_plus' && 'Unlock AI-powered insights, risk analysis & PDF reports'}
                    {nextUpgrade === 'good' && 'Add up to 25 properties with portfolio analytics'}
                    {nextUpgrade === 'better' && 'Share with team members & white-label reports'}
                    {nextUpgrade === 'best' && 'Unlimited properties, multi-user accounts & dedicated support'}
                  </span>
                </div>
              </div>

              <Button
                className="w-full mt-4 font-semibold text-white"
                style={{ backgroundColor: nextUpgradeConfig.color }}
                onClick={() => handleChangeTier(nextUpgrade)}
                disabled={isChangingTier}
              >
                {isChangingTier ? 'Redirecting to checkout...' : `Upgrade to ${nextUpgradeConfig.displayName}`}
                {!isChangingTier && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* View All Plans Section */}
        <div className="mb-6">
          <button
            onClick={() => setShowAllPlans(!showAllPlans)}
            className="w-full flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors py-2"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showAllPlans ? 'rotate-180' : ''}`} />
            {showAllPlans ? 'Hide all plans' : 'View all plans & features'}
          </button>

          {showAllPlans && (
            <div className="mt-4 space-y-3">
              {tierOrder
                .filter(tier => tier !== currentTier) // Don't show current tier
                .filter(tier => tierOrder.indexOf(tier) > currentTierIndex) // Only show upgrades
                .map(tier => {
                  const config = getTierConfig(tier);
                  const Icon = tierIcons[tier];
                  const price = tier === 'free' ? 0 : getUpgradePrice(tier);
                  const isDisabled = tier === 'homeowner_plus' && properties.length > 1;

                  return (
                    <Card
                      key={tier}
                      className={`border transition-all ${
                        isDisabled ? 'opacity-50' : 'hover:shadow-md hover:border-slate-300'
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: `${config.color}15` }}
                            >
                              <Icon className="w-5 h-5" style={{ color: config.color }} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900">{config.displayName}</h3>
                                {config.aiFeatures && (
                                  <Badge className="bg-purple-100 text-purple-700 text-xs">AI</Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-500">
                                {tier === 'free' && '1 property • Full 360° Method'}
                                {tier === 'homeowner_plus' && '1 property • AI-powered insights'}
                                {tier === 'good' && 'Up to 25 doors • Portfolio analytics'}
                                {tier === 'better' && 'Up to 100 doors • Team sharing'}
                                {tier === 'best' && 'Unlimited • Dedicated support'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="font-bold" style={{ color: config.color }}>
                                {tier === 'free' ? 'Free' : `$${price}/mo`}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              disabled={isDisabled || isChangingTier}
                              onClick={() => handleChangeTier(tier)}
                              className="text-xs font-semibold text-white"
                              style={{ backgroundColor: config.color }}
                            >
                              {isDisabled ? 'Too many properties' : isChangingTier ? 'Loading...' : 'Upgrade'}
                            </Button>
                          </div>
                        </div>

                        {/* Features preview */}
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <div className="flex flex-wrap gap-2">
                            {config.features?.slice(0, 4).map((feature, idx) => (
                              <span key={idx} className="text-xs text-slate-600 flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-500" />
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>

        {/* Data preservation note */}
        <p className="text-xs text-slate-500 text-center">
          Your data is always preserved when changing plans.
        </p>

      </div>

      {/* Tier Change Dialog */}
      {selectedNewTier && (
        <TierChangeDialog
          open={showTierDialog}
          onClose={() => {
            setShowTierDialog(false);
            setSelectedNewTier(null);
          }}
          onConfirm={handleConfirmTierChange}
          currentTier={currentTier}
          newTier={selectedNewTier}
          currentTierConfig={currentTierConfig}
          newTierConfig={getTierConfig(selectedNewTier)}
          newTierPricing={selectedNewTierPricing}
          totalDoors={totalDoors}
          billingCycle={billingCycle}
          isLoading={isChangingTier}
        />
      )}
    </div>
  );
}
