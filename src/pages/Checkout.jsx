
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ArrowLeft, Loader2, Flag, Star, Crown, Brain, Compass } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { calculateTotalDoors, getTierConfig, calculateGoodPricing, calculateBetterPricing, calculateBestPricing } from "../components/shared/TierCalculator";

export default function Checkout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedPlan, setSelectedPlan] = React.useState(null);

  // Get plan from URL params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const plan = params.get('plan');
    if (plan) {
      setSelectedPlan(plan);
    }
  }, []);

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list();
      return allProps.filter(p => !p.is_draft);
    },
  });

  const totalDoors = calculateTotalDoors(properties);

  const upgradeMutation = useMutation({
    mutationFn: async (tier) => {
      // Simulate upgrade (in production, would integrate with Stripe)
      return base44.auth.updateMe({ tier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      navigate(createPageUrl('Dashboard'));
      setTimeout(() => {
        alert('🎉 Plan updated successfully!');
      }, 500);
    },
  });

  const plans = {
    good: {
      name: 'Pioneer',
      displayName: 'Pioneer',
      tier: 'good',
      pricing: calculateGoodPricing(totalDoors),
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
      pricing: calculateBetterPricing(totalDoors),
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
      pricing: calculateBestPricing(),
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
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
          <Card className="border-2 border-orange-300 bg-orange-50">
            <CardContent className="p-8 text-center">
              <Compass className="w-16 h-16 mx-auto mb-4 text-orange-600" />
              <h3 className="text-xl font-semibold mb-4">No Plan Selected</h3>
              <p className="text-gray-700 mb-6">
                Please select a plan to continue.
              </p>
              <Button
                asChild
                style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
              >
                <Link to={createPageUrl('Pricing')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  View Plans
                </Link>
              </Button>
            </CardContent>
          </Card>
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

            {/* Payment Placeholder */}
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-6">
                <h3 className="font-bold mb-3" style={{ color: '#1B365D' }}>
                  💳 Payment Integration (Demo Mode)
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  In production, this integrates with Stripe for secure payment processing.
                </p>
                <p className="text-sm text-gray-700">
                  For now, clicking "Confirm Upgrade" will activate your new tier immediately (no payment required).
                </p>
              </CardContent>
            </Card>
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
                  onClick={() => upgradeMutation.mutate(currentPlan.tier)}
                  disabled={upgradeMutation.isPending}
                  className="w-full font-bold"
                  style={{ backgroundColor: currentPlan.color, minHeight: '56px' }}
                >
                  {upgradeMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Switching Plan...
                    </>
                  ) : (
                    <>
                      ✓ Confirm Upgrade
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
