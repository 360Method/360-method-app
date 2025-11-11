import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, Crown, Shield, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

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
    queryFn: () => base44.entities.Property.list(),
  });

  const upgradeMutation = useMutation({
    mutationFn: async (tier) => {
      // In production, this would integrate with Stripe/payment processor
      // For now, we'll simulate the upgrade
      const updates = {
        subscription_tier: tier,
        subscription_status: 'active',
        subscription_renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      if (tier === 'pro') {
        updates.property_limit = 3;
      } else if (tier.includes('homecare') || tier.includes('propertycare')) {
        updates.property_limit = 999;
      }

      return base44.auth.updateMe(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      navigate(createPageUrl('Dashboard'));
      // Show success message
      setTimeout(() => {
        alert('🎉 Upgrade successful! Welcome to your new plan.');
      }, 500);
    },
  });

  const plans = {
    pro: {
      name: 'Pro',
      price: 8,
      color: '#28A745',
      icon: Sparkles,
      features: [
        'Up to 3 properties',
        'Full baseline documentation',
        'Seasonal inspections',
        'Maintenance tracking',
        'Cascade risk alerts',
        'Portfolio analytics',
        'Priority email support',
        'Export reports'
      ],
      bestFor: 'Serious DIY homeowners and small landlords'
    },
    homecare_essential: {
      name: 'HomeCare Essential',
      price: 124,
      color: '#1B365D',
      icon: Crown,
      features: [
        '4 seasonal diagnostic visits',
        'Home Health Check™ ($499 value)',
        '6 hours included labor/year',
        '24/7 concierge system',
        'Dashboard + documentation',
        'Annual Home Health Report™',
        'HomeOwner Essentials Pack™',
        '5% contractor discount',
        '90-Day Safer Home Guarantee',
        'Full Pro software access'
      ],
      bestFor: 'Homeowners who want professional help',
      annual: 1490
    },
    homecare_premium: {
      name: 'HomeCare Premium',
      price: 183,
      color: '#FF6B35',
      icon: Crown,
      features: [
        'Everything in Essential, PLUS:',
        '12 hours included labor/year',
        'Priority 24/7 concierge',
        'Enhanced documentation',
        'Quarterly + Annual reports',
        '10% contractor discount',
        'Priority scheduling',
        'On-Time Promise'
      ],
      bestFor: 'Most homeowners - best value',
      annual: 2190,
      popular: true
    }
  };

  const currentPlan = plans[selectedPlan];

  if (!selectedPlan || !currentPlan) {
    return (
      <div className="min-h-screen bg-white">
        <div className="mobile-container md:max-w-4xl md:mx-auto pt-8">
          <Card className="border-2 border-orange-300 bg-orange-50">
            <CardContent className="p-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-orange-600" />
              <h3 className="text-xl font-semibold mb-4">No Plan Selected</h3>
              <p className="text-gray-700 mb-6">
                Please select a plan to continue with checkout.
              </p>
              <Button
                asChild
                style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
              >
                <Link to={createPageUrl('Upgrade')}>
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
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-4xl md:mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            asChild
            variant="ghost"
            className="mb-4"
          >
            <Link to={createPageUrl('Upgrade')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Link>
          </Button>
          <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px' }}>
            Complete Your Upgrade
          </h1>
          <p className="text-gray-600">
            You're one step away from unlocking premium features
          </p>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          {/* Order Summary - Left Column */}
          <div className="md:col-span-3 space-y-6">
            {/* Selected Plan */}
            <Card className="border-2" style={{ borderColor: currentPlan.color }}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Selected Plan</CardTitle>
                  {currentPlan.popular && (
                    <Badge style={{ backgroundColor: currentPlan.color }}>
                      POPULAR
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: currentPlan.color }}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold mb-1" style={{ fontSize: '22px', color: currentPlan.color }}>
                      {currentPlan.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold" style={{ color: currentPlan.color }}>
                        ${currentPlan.price}
                      </span>
                      <span className="text-gray-600">/month</span>
                    </div>
                    {currentPlan.annual && (
                      <p className="text-sm text-gray-500 mt-1">
                        Billed annually at ${currentPlan.annual}/year
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-1">PERFECT FOR:</p>
                  <p className="text-sm font-medium">{currentPlan.bestFor}</p>
                </div>

                <div className="space-y-2">
                  <p className="font-semibold mb-2">What's Included:</p>
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
                </div>
              </CardContent>
            </Card>

            {/* Payment Info Placeholder */}
            <Card className="border-2 border-blue-300 bg-blue-50">
              <CardContent className="p-6">
                <h3 className="font-bold mb-3" style={{ color: '#1B365D' }}>
                  💳 Payment Integration Coming Soon
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  In production, this would integrate with Stripe for secure payment processing.
                </p>
                <p className="text-sm text-gray-700">
                  For demo purposes, clicking "Complete Upgrade" below will simulate a successful payment 
                  and activate your new subscription.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar - Right Column */}
          <div className="md:col-span-2">
            <Card className="border-2 border-gray-200 sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{currentPlan.name}</span>
                    <span className="font-semibold">${currentPlan.price}/mo</span>
                  </div>
                  {currentPlan.annual && (
                    <>
                      <div className="border-t pt-3">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Annual billing:</span>
                          <span className="font-semibold">${currentPlan.annual}/yr</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-green-700">You save:</span>
                          <span className="text-sm font-semibold text-green-700">
                            ${(currentPlan.price * 12 - currentPlan.annual).toFixed(0)}/yr
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold">Total Today:</span>
                      <span className="text-2xl font-bold" style={{ color: currentPlan.color }}>
                        ${currentPlan.annual || currentPlan.price}
                      </span>
                    </div>
                    {currentPlan.annual && (
                      <p className="text-xs text-gray-500 text-right mt-1">
                        (billed annually)
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => upgradeMutation.mutate(selectedPlan)}
                  disabled={upgradeMutation.isPending}
                  className="w-full font-bold"
                  style={{ backgroundColor: currentPlan.color, minHeight: '56px' }}
                >
                  {upgradeMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Upgrade →
                    </>
                  )}
                </Button>

                <div className="mt-6 space-y-2 text-xs text-gray-600">
                  <p>✓ Cancel anytime, no long-term contract</p>
                  <p>✓ 30-day money-back guarantee</p>
                  <p>✓ Secure checkout powered by Stripe</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}