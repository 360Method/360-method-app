import React from "react";
import { Property, auth, functions } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building2,
  Save,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  LogOut,
  Crown,
  CreditCard,
  TrendingUp,
  Zap,
  ArrowUpCircle,
  Compass,
  Flag,
  Star,
  Calendar,
  AlertCircle,
  Receipt,
  XCircle,
  ChevronDown,
  AlertTriangle
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { calculateTotalDoors, getTierConfig, calculateGoodPricing, calculateBetterPricing, calculateBestPricing } from "../components/shared/TierCalculator";
import TierChangeDialog from "../components/pricing/TierChangeDialog";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, clerkUser } = useAuth();
  const [formData, setFormData] = React.useState({
    full_name: "",
    email: "",
    phone_number: "",
    preferred_contact_method: "email",
    timezone: "America/Los_Angeles"
  });
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [isChangingTier, setIsChangingTier] = React.useState(false);
  const [showTierDialog, setShowTierDialog] = React.useState(false);
  const [selectedNewTier, setSelectedNewTier] = React.useState(null);

  // Handle successful Stripe checkout return
  React.useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      // User returned from successful Stripe checkout
      toast.success('🎉 Plan updated successfully!');

      // Invalidate queries to refresh subscription data from database
      // The webhook will have updated user_subscriptions table with the new tier
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });

      // Clean up URL
      searchParams.delete('status');
      searchParams.delete('tab');
      searchParams.delete('session_id');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, queryClient, setSearchParams]);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await Property.list();
      return allProps.filter(p => !p.is_draft);
    },
  });

  // Fetch subscription status
  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ['subscription-status', user?.id],
    queryFn: async () => {
      try {
        const { data } = await functions.invoke('getSubscriptionStatus', {
          user_id: user?.id
        });
        return data;
      } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
      }
    },
    enabled: !!user?.id,
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async (cancelImmediately = false) => {
      const { data, error } = await functions.invoke('cancelSubscription', {
        cancel_immediately: cancelImmediately
      });
      if (error) throw new Error(error.message || 'Failed to cancel subscription');
      if (!data.success) throw new Error(data.error || 'Failed to cancel subscription');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      toast.success(data.message || 'Subscription updated');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to cancel subscription');
    }
  });

  // Checkout mutation for one-click upgrades
  const checkoutMutation = useMutation({
    mutationFn: async ({ tier, billing_cycle }) => {
      const { data, error } = await functions.invoke('createSubscriptionCheckout', {
        tier,
        billing_cycle,
        user_id: user?.id,
        user_email: user?.email,
        user_name: user?.full_name,
        success_url: `${window.location.origin}${createPageUrl('Settings')}?tab=subscription&status=success`,
        cancel_url: `${window.location.origin}${createPageUrl('Settings')}`,
        total_doors: totalDoors
      });
      if (error) throw new Error(error.message || 'Checkout failed');
      if (!data?.success) throw new Error(data?.error || 'Checkout failed');
      return data;
    },
    onSuccess: (data) => {
      // For prorated upgrades, the subscription is updated immediately (no Stripe Checkout needed)
      if (data.prorated) {
        toast.success(`🎉 Upgraded to ${data.tier}!`, {
          description: 'Your subscription has been updated with prorated billing.'
        });
        setIsChangingTier(false);
        queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        // Redirect to success URL (same page with status=success)
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

  // Initialize form with user data
  React.useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        preferred_contact_method: user.preferred_contact_method || "email",
        timezone: user.timezone || "America/Los_Angeles"
      });
    }
  }, [user]);

  const updateUserMutation = useMutation({
    mutationFn: (data) => auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      setIsSaving(false);
      setSaveSuccess(true);
      setIsChangingTier(false);
      setShowTierDialog(false);
      setSelectedNewTier(null);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
    onError: (error) => {
      setIsSaving(false);
      setIsChangingTier(false);
      console.error("Failed to update user:", error);
      alert("Failed to update settings. Please try again.");
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    updateUserMutation.mutate(formData);
  };

  // Tier order for determining upgrades vs downgrades
  const tierOrder = ['free', 'homeowner_plus', 'good', 'better', 'best'];

  const handleChangeTier = async (newTier) => {
    const currentTierIndex = tierOrder.indexOf(currentTier);
    const newTierIndex = tierOrder.indexOf(newTier);
    const isUpgrade = newTierIndex > currentTierIndex;

    // For upgrades to paid tiers: Go directly to Stripe checkout (one-click!)
    // If user has existing subscription, they get prorated (handled by mutation onSuccess)
    // If new subscription, they get redirected to Stripe Checkout
    if (isUpgrade && newTier !== 'free') {
      setIsChangingTier(true);
      try {
        await checkoutMutation.mutateAsync({
          tier: newTier,
          billing_cycle: 'annual'
        });
        // Redirect is handled in onSuccess callback
      } catch (error) {
        // Error already handled in mutation
      }
      return;
    }

    // For downgrades: Show confirmation dialog (accessed via Danger Zone)
    setSelectedNewTier(newTier);
    setShowTierDialog(true);
  };

  const handleConfirmTierChange = () => {
    setIsChangingTier(true);
    updateUserMutation.mutate({ tier: selectedNewTier });
  };

  const handleRestartOnboarding = async () => {
    try {
      await updateUserMutation.mutateAsync({
        onboarding_completed: false,
        onboarding_skipped: false
      });
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate(createPageUrl("Onboarding"));
    } catch (error) {
      console.error("Failed to restart onboarding:", error);
    }
  };

  const handleLogout = () => {
    auth.logout();
  };

  // Tier calculations - use subscription data as source of truth (database), fallback to Clerk metadata
  const currentTier = subscriptionData?.tier || user?.tier || 'free';
  const totalDoors = calculateTotalDoors(properties);
  const tierConfig = getTierConfig(currentTier);

  // Get pricing for all tiers (using annual by default for display)
  const goodPricing = calculateGoodPricing(totalDoors, 'annual');
  const betterPricing = calculateBetterPricing(totalDoors, 'annual');
  const bestPricing = calculateBestPricing('annual');

  // Determine which tier pricing applies
  let currentPricing = null;
  if (currentTier === 'good') currentPricing = goodPricing;
  if (currentTier === 'better') currentPricing = betterPricing;
  if (currentTier === 'best') currentPricing = bestPricing;

  // Get pricing for selected new tier
  let selectedNewTierPricing = null;
  if (selectedNewTier === 'good') selectedNewTierPricing = calculateGoodPricing(totalDoors, 'annual');
  if (selectedNewTier === 'better') selectedNewTierPricing = calculateBetterPricing(totalDoors, 'annual');
  if (selectedNewTier === 'best') selectedNewTierPricing = calculateBestPricing('annual');

  const getTierIcon = (tier) => {
    switch(tier) {
      case 'free': return <Compass className="w-5 h-5 text-gray-600" />;
      case 'good': return <Flag className="w-5 h-5 text-green-600" />;
      case 'better': return <Star className="w-5 h-5 text-purple-600" />;
      case 'best': return <Crown className="w-5 h-5 text-orange-600" />;
      default: return <Compass className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
            Settings
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your account and subscription
          </p>
        </div>

        {/* Current Tier & Billing */}
        <Card className={`mb-6 border-2 shadow-lg ${
          currentTier === 'best' ? 'border-orange-400 bg-gradient-to-br from-orange-50 to-yellow-50' :
          currentTier === 'better' ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50' :
          currentTier === 'good' ? 'border-green-400 bg-gradient-to-br from-green-50 to-emerald-50' :
          'border-gray-300 bg-gray-50'
        }`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              {getTierIcon(currentTier)}
              <span style={{ color: '#1B365D' }}>Current Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold" style={{ color: tierConfig.color }}>
                    {tierConfig.displayName}
                  </h3>
                  <Badge 
                    className="text-white"
                    style={{ backgroundColor: tierConfig.color }}
                  >
                    {tierConfig.displayName.toUpperCase()}
                  </Badge>
                </div>
                
                {/* Pricing Display */}
                {currentPricing && currentTier !== 'free' && (
                  <div className="mb-3">
                    <p className="text-3xl font-bold" style={{ color: tierConfig.color }}>
                      ${currentPricing.monthlyPrice}<span className="text-lg">/month</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      ${currentPricing.annualPrice}/year (annual billing)
                    </p>
                    {currentPricing.additionalDoors > 0 && (
                      <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                        <p className="text-xs text-gray-700">
                          <strong>Breakdown:</strong> ${currentPricing.breakdown.base} base + ${currentPricing.breakdown.additionalCost} for {currentPricing.additionalDoors} extra door{currentPricing.additionalDoors > 1 ? 's' : ''}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {currentTier === 'free' && (
                  <p className="text-lg text-gray-700 mb-3">
                    <strong>$0/month</strong> • Learning the Method
                  </p>
                )}

                {/* Door Count */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Properties</p>
                    <p className="text-2xl font-bold" style={{ color: tierConfig.color }}>
                      {properties.length}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tierConfig.propertyLimit === Infinity ? 'Unlimited' : `of ${tierConfig.propertyLimit} max`}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Total Doors</p>
                    <p className="text-2xl font-bold" style={{ color: tierConfig.color }}>
                      {totalDoors}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {tierConfig.doorLimit === null ? 'Any size' : tierConfig.doorLimit === Infinity ? 'Unlimited' : `of ${tierConfig.doorLimit} max`}
                    </p>
                  </div>
                </div>
              </div>

              {currentTier !== 'best' && (
                <Button
                  asChild
                  className="gap-2"
                  style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Pricing")}>
                    <ArrowUpCircle className="w-4 h-4" />
                    Change Plan
                  </Link>
                </Button>
              )}
            </div>

            {/* Quick Upgrade Buttons - Only show tiers above current */}
            {currentTier !== 'best' && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-semibold text-gray-900 mb-3">Upgrade Your Plan:</p>
                <div className="flex flex-wrap gap-2">
                  {currentTier === 'free' && (
                    <>
                      <Button
                        onClick={() => handleChangeTier('homeowner_plus')}
                        size="sm"
                        disabled={isChangingTier || properties.length > 1}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        style={{ minHeight: '44px' }}
                      >
                        {isChangingTier ? 'Loading...' : 'Homeowner+ $7/mo'}
                      </Button>
                      <Button
                        onClick={() => handleChangeTier('good')}
                        size="sm"
                        disabled={isChangingTier}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        style={{ minHeight: '44px' }}
                      >
                        {isChangingTier ? 'Loading...' : 'Pioneer $12/mo'}
                      </Button>
                    </>
                  )}
                  {(currentTier === 'free' || currentTier === 'homeowner_plus' || currentTier === 'good') && (
                    <Button
                      onClick={() => handleChangeTier('better')}
                      size="sm"
                      disabled={isChangingTier}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      style={{ minHeight: '44px' }}
                    >
                      {isChangingTier ? 'Loading...' : 'Commander $60/mo'}
                    </Button>
                  )}
                  {currentTier !== 'best' && (
                    <Button
                      onClick={() => handleChangeTier('best')}
                      size="sm"
                      disabled={isChangingTier}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                      style={{ minHeight: '44px' }}
                    >
                      {isChangingTier ? 'Loading...' : 'Elite $350/mo'}
                    </Button>
                  )}
                </div>
                {isChangingTier && (
                  <p className="text-xs text-center text-gray-600 mt-2">Redirecting to checkout...</p>
                )}
              </div>
            )}

            {/* Upgrade Suggestions */}
            {currentTier === 'free' && totalDoors > 1 && (
              <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  💡 Suggested: Upgrade to Pioneer
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  With {totalDoors} doors, Pioneer costs <strong>${goodPricing.monthlyPrice}/month</strong> and unlocks AI that prevents disasters:
                </p>
                <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                  <li>AI cascade risk alerts (see chain reactions)</li>
                  <li>AI spending forecasts (budget accurately)</li>
                  <li>AI maintenance insights (become an expert)</li>
                </ul>
              </div>
            )}

            {currentTier === 'good' && totalDoors > 20 && totalDoors <= 25 && (
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  💡 Consider: Commander (Better Value Soon)
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  You're at {totalDoors} doors paying ${goodPricing.monthlyPrice}/month. At 26+ doors, Commander becomes better value at $50 base.
                </p>
              </div>
            )}

            {currentTier === 'good' && totalDoors > 25 && (
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  ⚠️ Door Limit Exceeded
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  You have {totalDoors} doors but Pioneer maxes at 25. Upgrade to Commander for up to 100 doors + advanced AI features.
                </p>
              </div>
            )}

            {currentTier === 'better' && totalDoors > 80 && (
              <div className="bg-white rounded-lg p-4 border-2 border-orange-300">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  💡 Suggested: Elite (Save Money!)
                </p>
                <p className="text-sm text-gray-700 mb-2">
                  At {totalDoors} doors, you're paying ${betterPricing.monthlyPrice}/month. Elite is $299 flat - saving you <strong>${(betterPricing.monthlyPrice - 299).toFixed(2)}/month</strong> plus you get:
                </p>
                <ul className="text-xs text-gray-700 space-y-1 ml-4 list-disc">
                  <li>Multi-user accounts (add team members)</li>
                  <li>Custom AI reporting</li>
                  <li>Dedicated account manager</li>
                  <li>Phone support (4hr response)</li>
                </ul>
              </div>
            )}

            {/* Feature List */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm font-semibold text-gray-900 mb-3">Included Features:</p>
              <ul className="space-y-2">
                {tierConfig.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: tierConfig.color }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Subscription & Billing Section */}
        {subscriptionData?.has_subscription && (
          <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                Subscription & Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Subscription Status */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900">Subscription Status</h4>
                      <Badge className={
                        subscriptionData.subscription.is_active ? 'bg-green-600' :
                        subscriptionData.subscription.is_past_due ? 'bg-red-600' :
                        'bg-gray-600'
                      }>
                        {subscriptionData.subscription.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Billing: {subscriptionData.subscription.billing_cycle === 'annual' ? 'Annual' : 'Monthly'}
                      </p>
                      
                      {subscriptionData.subscription.current_period_end && (
                        <p className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {subscriptionData.subscription.cancel_at_period_end 
                            ? `Access ends: ${new Date(subscriptionData.subscription.current_period_end).toLocaleDateString()}`
                            : `Next billing: ${new Date(subscriptionData.subscription.current_period_end).toLocaleDateString()}`
                          }
                        </p>
                      )}

                      {subscriptionData.subscription.days_remaining !== null && (
                        <p className="text-xs text-gray-500">
                          {subscriptionData.subscription.days_remaining} days remaining in current period
                        </p>
                      )}
                    </div>

                    {subscriptionData.subscription.cancel_at_period_end && (
                      <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-sm text-orange-800 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Your subscription will not renew after the current period
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-lg p-4 border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Payment Method</h4>
                    {subscriptionData.payment_method ? (
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-gray-600" />
                        <span className="text-sm text-gray-700 capitalize">
                          {subscriptionData.payment_method.brand} •••• {subscriptionData.payment_method.last4}
                        </span>
                        <span className="text-xs text-gray-500">
                          Expires {subscriptionData.payment_method.exp_month}/{subscriptionData.payment_method.exp_year}
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">No payment method on file</p>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(createPageUrl('PaymentMethods'))}
                  >
                    Manage
                  </Button>
                </div>
              </div>

              {/* Recent Transactions */}
              {subscriptionData.recent_transactions?.length > 0 && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Recent Transactions</h4>
                  <div className="space-y-2">
                    {subscriptionData.recent_transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            ${transaction.amount.toFixed(2)} {transaction.currency.toUpperCase()}
                          </p>
                          <Badge className={
                            transaction.status === 'succeeded' ? 'bg-green-100 text-green-700' :
                            transaction.status === 'failed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          } variant="outline">
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancel Subscription */}
              {subscriptionData.subscription.is_active && !subscriptionData.subscription.cancel_at_period_end && (
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Cancel Subscription</h4>
                      <p className="text-sm text-gray-600">
                        You'll keep access until the end of your current billing period.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => {
                        if (confirm('Are you sure you want to cancel your subscription? You will keep access until the end of your current billing period.')) {
                          cancelSubscriptionMutation.mutate(false);
                        }
                      }}
                      disabled={cancelSubscriptionMutation.isPending}
                    >
                      {cancelSubscriptionMutation.isPending ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Canceling...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* No Subscription - Prompt to Subscribe */}
        {!subscriptionData?.has_subscription && currentTier !== 'free' && (
          <Card className="mb-6 border-2 border-orange-200 bg-orange-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-orange-900">No Active Subscription</h3>
                  <p className="text-sm text-orange-700 mt-1">
                    Your tier is set to {getTierConfig(currentTier).displayName} but you don't have an active subscription.
                    Set up billing to unlock all features.
                  </p>
                  <Button
                    onClick={() => navigate(`${createPageUrl('Checkout')}?plan=${currentTier}`)}
                    className="mt-3"
                    style={{ backgroundColor: getTierConfig(currentTier).color }}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Set Up Billing
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Settings */}
        <Card className="mb-6 border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                style={{ minHeight: '48px' }}
              />
            </div>

            <div>
              <Label className="mb-2 block">Email Address</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <Input
                  value={formData.email}
                  disabled
                  className="flex-1 bg-gray-100"
                  style={{ minHeight: '48px' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Email cannot be changed. Contact support if needed.
              </p>
            </div>

            <div>
              <Label className="mb-2 block">Phone Number</Label>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <Input
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="flex-1"
                  style={{ minHeight: '48px' }}
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Preferred Contact Method</Label>
              <Select
                value={formData.preferred_contact_method}
                onValueChange={(value) => setFormData({ ...formData, preferred_contact_method: value })}
              >
                <SelectTrigger style={{ minHeight: '48px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </div>
                  </SelectItem>
                  <SelectItem value="phone">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </div>
                  </SelectItem>
                  <SelectItem value="sms">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      SMS
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-2 block">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger style={{ minHeight: '48px' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                className="flex-1 gap-2"
                style={{ 
                  backgroundColor: saveSuccess ? '#28A745' : '#1B365D',
                  minHeight: '48px'
                }}
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Profile Type */}
        {user?.user_profile_type && (
          <Card className="mb-6 border-2 border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-green-900">Account Type</p>
                  <p className="text-sm text-gray-700 capitalize">
                    {user.user_profile_type === 'homeowner' ? '🏠 Homeowner' : '🏢 Property Investor'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Onboarding Status */}
        <Card className="mb-6 border-2 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  {user?.onboarding_completed ? '✅ Onboarding Complete' : '⏳ Onboarding Pending'}
                </p>
                {user?.onboarding_completed && user?.onboarding_completed_date && (
                  <p className="text-sm text-gray-600">
                    Completed on {new Date(user.onboarding_completed_date).toLocaleDateString()}
                  </p>
                )}
                {user?.onboarding_skipped && (
                  <Badge className="bg-orange-600 text-white mt-2">
                    Previously Skipped
                  </Badge>
                )}
              </div>
              <Button
                onClick={handleRestartOnboarding}
                variant="outline"
                className="gap-2"
                style={{ minHeight: '48px' }}
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    {user?.onboarding_completed ? 'Restart Onboarding' : 'Complete Onboarding'}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone - Collapsed by default */}
        <Collapsible className="mb-6">
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors w-full justify-center py-2">
            <ChevronDown className="w-4 h-4" />
            Danger Zone
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="border-2 border-red-200 mt-2">
              <CardContent className="p-6 space-y-4">
                {/* Downgrade Plan */}
                {currentTier !== 'free' && (
                  <div className="border-b border-red-100 pb-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900">Downgrade Plan</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Switch to a lower tier plan. Your data will be preserved.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {currentTier !== 'free' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeTier('free')}
                              disabled={isChangingTier}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Downgrade to Scout (Free)
                            </Button>
                          )}
                          {(currentTier === 'better' || currentTier === 'best') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeTier('good')}
                              disabled={isChangingTier || totalDoors > 25}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Downgrade to Pioneer
                            </Button>
                          )}
                          {currentTier === 'best' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeTier('better')}
                              disabled={isChangingTier || totalDoors > 100}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Downgrade to Commander
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sign Out */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Sign Out</p>
                    <p className="text-sm text-gray-600">
                      Log out of your 360° Method account
                    </p>
                  </div>
                  <Button
                    onClick={handleLogout}
                    variant="outline"
                    className="gap-2 text-red-600 border-red-300 hover:bg-red-50"
                    style={{ minHeight: '48px' }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
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
          currentTierConfig={getTierConfig(currentTier)}
          newTierConfig={getTierConfig(selectedNewTier)}
          newTierPricing={selectedNewTierPricing}
          totalDoors={totalDoors}
          billingCycle="annual"
          isLoading={isChangingTier}
        />
      )}
    </div>
  );
}