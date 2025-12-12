
import React from "react";
import { Property, functions } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, Loader2, Flag, Star, Crown, Brain, Compass, CreditCard, Shield, AlertCircle, Home } from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { calculateTotalDoors, getTierConfig, calculateHomeownerPlusPricing, calculateGoodPricing, calculateBetterPricing, calculateBestPricing } from "../components/shared/TierCalculator";
import { toast } from "sonner";

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = React.useState(null);
  const [billingCycle, setBillingCycle] = React.useState('annual');
  const [checkoutError, setCheckoutError] = React.useState(null);

  // Get plan from URL params
  React.useEffect(() => {
    const plan = searchParams.get('plan');
    const cycle = searchParams.get('billing') || 'annual';
    if (plan) {
      setSelectedPlan(plan);
    }
    if (cycle) {
      setBillingCycle(cycle);
    }
  }, [searchParams]);

  // Handle successful checkout return
  React.useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      // User returned from Stripe checkout
      toast.success('🎉 Subscription activated successfully!');
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      queryClient.invalidateQueries({ queryKey: ['subscription-status'] });
      // Clean up URL
      navigate(createPageUrl('Dashboard'), { replace: true });
    }
  }, [searchParams, navigate, queryClient]);

  // Get user from Clerk auth context
  const { user } = useAuth();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      // Filter by user_id for security (Clerk auth with permissive RLS)
      const allProps = await Property.list('-created_at', user?.id);
      return allProps.filter(p => !p.is_draft);
    },
    enabled: !!user?.id
  });

  const totalDoors = calculateTotalDoors(properties);

  // Mutation to create Stripe checkout session
  const checkoutMutation = useMutation({
    mutationFn: async (tier) => {
      setCheckoutError(null);

      if (!user) {
        throw new Error('Please log in to continue');
      }

      const successUrl = `${window.location.origin}${createPageUrl('Checkout')}?plan=${tier}&success=true`;
      const cancelUrl = `${window.location.origin}${createPageUrl('Checkout')}?plan=${tier}&canceled=true`;

      const { data, error } = await functions.invoke('createSubscriptionCheckout', {
        tier: tier,
        billing_cycle: billingCycle,
        success_url: successUrl,
        cancel_url: cancelUrl,
        // Pass user info since we use Clerk auth, not Supabase auth
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || user.name,
        // Pass door count for usage-based billing tiers
        total_doors: totalDoors
      });

      if (error) throw new Error(error.message || 'Failed to create checkout session');
      if (!data.success) throw new Error(data.error || 'Failed to create checkout session');

      return data;
    },
    onSuccess: (data) => {
      if (data.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = data.checkout_url;
      } else if (data.redirect_url) {
        // Free tier - redirect directly
        toast.success('Switched to free tier');
        navigate(data.redirect_url);
      }
    },
    onError: (error) => {
      console.error('Checkout error:', error);
      let errorMessage = error.message || 'Failed to start checkout';

      // Provide more helpful messages for common errors
      if (errorMessage.includes('non-2xx status code') || errorMessage.includes('Edge Function')) {
        errorMessage = 'Payment system is being configured. Please try again later or contact support.';
      } else if (errorMessage.includes('Stripe')) {
        errorMessage = 'Payment processing is temporarily unavailable. Please try again later.';
      }

      setCheckoutError(errorMessage);
      toast.error(errorMessage);
    }
  });

  // Legacy mutation for demo mode (fallback)
  const upgradeMutation = useMutation({
    mutationFn: async (tier) => {
      return auth.updateMe({ tier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      navigate(createPageUrl('Dashboard'));
      toast.success('🎉 Plan updated successfully!');
    },
  });

  const plans = {
    homeowner_plus: {
      name: 'Homeowner+',
      displayName: 'Homeowner+',
      tier: 'homeowner_plus',
      pricing: calculateHomeownerPlusPricing(billingCycle),
      color: '#0EA5E9',
      icon: Home,
      features: [
        'Everything in Scout, PLUS:',
        '🧠 AI cascade risk alerts',
        '🧠 AI cost forecasting',
        '🧠 AI spending insights',
        'Single property focus',
        'Personalized maintenance calendar',
        'Cost tracking & budgeting',
        'Email support (48hr response)',
        'Mobile-optimized interface'
      ],
      bestFor: 'Single-property homeowners who want AI-powered protection',
      why: 'Homeowner+ unlocks AI intelligence that catches the $50 problem before it becomes a $5,000 disaster.'
    },
    good: {
      name: 'Pioneer',
      displayName: 'Pioneer',
      tier: 'good',
      pricing: calculateGoodPricing(totalDoors, billingCycle),
      color: '#28A745',
      icon: Flag,
      features: [
        'Everything in Scout, PLUS:',
        '🧠 AI cascade risk alerts',
        '🧠 AI cost forecasting',
        '🧠 AI spending insights',
        'Up to 25 properties/doors',
        'Portfolio analytics dashboard',
        'Export reports (PDF)',
        'Priority email support (48hr)',
        'Mobile-optimized'
      ],
      bestFor: 'Homeowners ready to prevent disasters with AI intelligence',
      why: 'Pioneer gives you AI-powered vision that professionals use - seeing cascade risks before they cost thousands.'
    },
    better: {
      name: 'Commander',
      displayName: 'Commander',
      tier: 'better',
      pricing: calculateBetterPricing(totalDoors, billingCycle),
      color: '#8B5CF6',
      icon: Star,
      features: [
        'Everything in Pioneer, PLUS:',
        '🧠 AI portfolio comparison',
        '🧠 AI budget forecasting',
        'Up to 100 properties/doors',
        'Share access with team',
        'White-label PDF reports',
        'Priority support (24hr response)'
      ],
      bestFor: 'Growing portfolios and professional investors',
      why: 'Commander scales AI intelligence across your entire portfolio - like having an analyst on staff.'
    },
    best: {
      name: 'Elite',
      displayName: 'Elite',
      tier: 'best',
      pricing: calculateBestPricing(billingCycle),
      color: '#F59E0B',
      icon: Crown,
      features: [
        'Everything in Commander, PLUS:',
        '🧠 Custom AI reporting builder',
        'Unlimited properties/doors',
        'Multi-user accounts with roles',
        'Dedicated account manager',
        'Phone support (4hr response)',
        'API access (coming soon)'
      ],
      bestFor: 'Property management companies and large portfolios',
      why: 'Elite gives you enterprise-grade AI and support - manage 100+ doors like a Fortune 500 facility team.'
    }
  };

  const currentPlan = plans[selectedPlan];

  if (!selectedPlan || !currentPlan) {
    // Show plan selection when no plan is specified
    return (
      <div className="min-h-screen bg-slate-50 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Choose Your Plan</h1>
            <p className="text-slate-600">Select a plan to unlock AI-powered property intelligence</p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg p-1 shadow-sm border flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  billingCycle === 'monthly' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors relative ${
                  billingCycle === 'annual' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                  Save 17%
                </Badge>
              </button>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(plans).map(([key, plan]) => {
              const PlanIcon = plan.icon;
              const pricing = key === 'homeowner_plus'
                ? calculateHomeownerPlusPricing(billingCycle)
                : key === 'good'
                ? calculateGoodPricing(totalDoors, billingCycle)
                : key === 'better'
                ? calculateBetterPricing(totalDoors, billingCycle)
                : calculateBestPricing(billingCycle);

              return (
                <Card
                  key={key}
                  className={`border-2 hover:shadow-lg transition-shadow cursor-pointer ${
                    key === 'better' ? 'border-purple-400 relative' : 'border-slate-200'
                  }`}
                  onClick={() => setSelectedPlan(key)}
                >
                  {key === 'better' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-purple-600 text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${plan.color}15` }}
                      >
                        <PlanIcon className="w-5 h-5" style={{ color: plan.color }} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{plan.displayName}</h3>
                      </div>
                    </div>

                    <div className="mb-4">
                      <span className="text-3xl font-bold" style={{ color: plan.color }}>
                        ${pricing.monthlyPrice}
                      </span>
                      <span className="text-slate-500">/mo</span>
                      {billingCycle === 'annual' && (
                        <p className="text-xs text-slate-500 mt-1">
                          ${pricing.annualPrice}/year billed annually
                        </p>
                      )}
                    </div>

                    <p className="text-sm text-slate-600 mb-4">{plan.bestFor}</p>

                    <div className="space-y-2 mb-6">
                      {plan.features.slice(0, 5).map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-green-500" />
                          <span className="text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className="w-full text-white"
                      style={{ backgroundColor: plan.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlan(key);
                      }}
                    >
                      Select {plan.displayName}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="text-center mt-8">
            <Link
              to={createPageUrl('Pricing')}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              ← Back to current plan
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const Icon = currentPlan.icon;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mobile-container md:max-w-4xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            asChild
            variant="ghost"
            className="mb-4"
            style={{ minHeight: '44px' }}
          >
            <Link to={createPageUrl('Pricing')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Link>
          </Button>
          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
            Confirm Plan Change
          </h1>
          <p className="text-gray-600">
            You're upgrading to {currentPlan.displayName}
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Order Summary */}
          <div className="md:col-span-3 space-y-6">
            {/* Selected Plan */}
            <Card className="border-2 shadow-lg" style={{ borderColor: currentPlan.color }}>
              <CardHeader style={{ backgroundColor: `${currentPlan.color}10` }}>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="w-6 h-6" style={{ color: currentPlan.color }} />
                  {currentPlan.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="mb-6">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-bold" style={{ color: currentPlan.color }}>
                      ${currentPlan.pricing.monthlyPrice}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    ${currentPlan.pricing.annualPrice}/year
                  </p>
                  {currentPlan.pricing.additionalDoors > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs font-semibold text-gray-700 mb-1">
                        Your Pricing Breakdown:
                      </p>
                      <p className="text-xs text-gray-600">
                        ${currentPlan.pricing.breakdown.base} base + ${currentPlan.pricing.breakdown.additionalCost} for {currentPlan.pricing.additionalDoors} additional door{currentPlan.pricing.additionalDoors > 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on your {totalDoors} total door{totalDoors !== 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 rounded-lg p-4 mb-4 border-2 border-blue-200">
                  <p className="text-sm font-semibold text-blue-900 mb-2">
                    🎯 Why This Makes You Better:
                  </p>
                  <p className="text-xs text-gray-800 leading-relaxed">
                    {currentPlan.why}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">PERFECT FOR:</p>
                  <p className="text-sm font-medium text-gray-900">{currentPlan.bestFor}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold mb-3">What You're Getting:</p>
                  {currentPlan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: currentPlan.color }} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Your Info */}
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold">{user?.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold">{user?.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Properties:</span>
                    <span className="font-semibold">{properties.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Doors:</span>
                    <span className="font-semibold">{totalDoors}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="border-2 border-green-300 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: '#1B365D' }}>
                      Secure Payment via Stripe
                    </h3>
                    <p className="text-sm text-gray-700">
                      Your payment is processed securely by Stripe. We never store your card details.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    <span>All major cards accepted</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    <span>256-bit encryption</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Cycle Toggle */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-6">
                <h3 className="font-bold mb-4" style={{ color: '#1B365D' }}>
                  Billing Cycle
                </h3>
                <div className="flex gap-3">
                  <Button
                    variant={billingCycle === 'monthly' ? 'default' : 'outline'}
                    onClick={() => setBillingCycle('monthly')}
                    className="flex-1"
                    style={billingCycle === 'monthly' ? { backgroundColor: currentPlan.color } : {}}
                  >
                    Monthly
                  </Button>
                  <Button
                    variant={billingCycle === 'annual' ? 'default' : 'outline'}
                    onClick={() => setBillingCycle('annual')}
                    className="flex-1 relative"
                    style={billingCycle === 'annual' ? { backgroundColor: currentPlan.color } : {}}
                  >
                    Annual
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                      Save 17%
                    </Badge>
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  {billingCycle === 'annual' 
                    ? 'Billed annually - best value!' 
                    : 'Billed monthly - flexibility first'}
                </p>
              </CardContent>
            </Card>

            {/* Error Display */}
            {checkoutError && (
              <Card className="border-2 border-red-300 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-800">Checkout Error</p>
                      <p className="text-sm text-red-700">{checkoutError}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="md:col-span-2">
            <Card className="border-2 border-gray-200 sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{currentPlan.name}</span>
                    <span className="font-semibold">${currentPlan.pricing.monthlyPrice}/mo</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold">Monthly Total:</span>
                      <span className="text-2xl font-bold" style={{ color: currentPlan.color }}>
                        ${currentPlan.pricing.monthlyPrice}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 text-right mt-1">
                      Annual: ${currentPlan.pricing.annualPrice}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => checkoutMutation.mutate(currentPlan.tier)}
                  disabled={checkoutMutation.isPending}
                  className="w-full font-bold"
                  style={{ backgroundColor: currentPlan.color, minHeight: '56px' }}
                >
                  {checkoutMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Connecting to Stripe...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Continue to Payment
                    </>
                  )}
                </Button>

                <div className="mt-6 space-y-2 text-xs text-gray-600">
                  <p>✓ Cancel anytime, no penalties</p>
                  <p>✓ Instant activation</p>
                  <p>✓ All your data preserved</p>
                </div>
              </CardContent>
            </Card>

            {/* Why You're Making the Right Choice */}
            <Card className="border-2 border-green-300 bg-green-50 mt-6">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-6 h-6 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-900 mb-2">
                      🏆 You're Investing in Knowledge
                    </p>
                    <p className="text-xs text-gray-800 leading-relaxed">
                      Most homeowners spend $3,000-8,000/year on reactive repairs. You're choosing to spend ${currentPlan.pricing.monthlyPrice}/month on AI that <em>prevents</em> those disasters. 
                      After one prevented cascade failure, this pays for itself 10-50x over.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
