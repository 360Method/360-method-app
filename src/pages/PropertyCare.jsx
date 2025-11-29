import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Building2, TrendingUp, Calculator, CreditCard, Shield, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { functions, auth } from "@/api/supabaseClient";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function PropertyCare() {
  const navigate = useNavigate();
  const [doorCount, setDoorCount] = React.useState(1);
  const [selectedTier, setSelectedTier] = React.useState("premium");

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => auth.me(),
  });

  // Mutation for creating checkout session
  const checkoutMutation = useMutation({
    mutationFn: async ({ tier, doors }) => {
      const successUrl = `${window.location.origin}${createPageUrl('Dashboard')}?subscription=success`;
      const cancelUrl = `${window.location.origin}${createPageUrl('PropertyCare')}?canceled=true`;

      const { data, error } = await functions.invoke('createSubscriptionCheckout', {
        tier: tier,
        billing_cycle: 'monthly',
        success_url: successUrl,
        cancel_url: cancelUrl
      });

      if (error) throw new Error(error.message || 'Failed to create checkout');
      if (!data.success) throw new Error(data.error || 'Failed to create checkout');
      return data;
    },
    onSuccess: (data) => {
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start checkout');
    }
  });

  const tierPricing = {
    essential: 124,
    premium: 183,
    elite: 233
  };

  const calculateDiscount = (doors) => {
    if (doors >= 20) return 0.20; // Custom pricing, use 20% as placeholder
    if (doors >= 10) return 0.15;
    if (doors >= 5) return 0.10;
    return 0;
  };

  const calculateTotal = () => {
    const basePrice = tierPricing[selectedTier];
    const subtotal = basePrice * doorCount;
    const discount = calculateDiscount(doorCount);
    const discountAmount = subtotal * discount;
    const total = subtotal - discountAmount;
    const perDoor = total / doorCount;
    
    return {
      subtotal,
      discount: discount * 100,
      discountAmount,
      total,
      perDoor,
      annual: total * 12
    };
  };

  const calculation = calculateTotal();

  const tiers = [
    {
      name: "Essential",
      value: "essential",
      price: 124,
      color: "#28A745",
      features: [
        "4 seasonal diagnostics per door",
        "6 hours included labor per door/year",
        "Property Health Check™ per property",
        "Tenant coordination (24-48hr notice)",
        "24/7 tenant issue concierge",
        "Portfolio dashboard access",
        "5% discount on bulk repairs"
      ]
    },
    {
      name: "Premium",
      value: "premium",
      price: 183,
      color: "#FF6B35",
      popular: true,
      features: [
        "Everything in Essential, PLUS:",
        "12 hours included labor per door/year",
        "Quarterly portfolio reports",
        "Priority scheduling",
        "Turnover coordination",
        "10% discount on bulk repairs",
        "Capital planning assistance"
      ]
    },
    {
      name: "Elite",
      value: "elite",
      price: 233,
      color: "#1B365D",
      features: [
        "Everything in Premium, PLUS:",
        "16 hours included labor per door/year",
        "Dedicated portfolio manager",
        "Annual strategic portfolio review",
        "15% discount on bulk repairs",
        "VIP tenant concierge",
        "Quarterly business reviews"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Hero */}
        <div className="mb-8 text-center">
          <Badge className="mb-4" style={{ backgroundColor: '#FF6B35' }}>
            FOR INVESTORS & LANDLORDS
          </Badge>
          <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '32px' }}>
            PropertyCare Service
          </h1>
          <p className="text-gray-600 text-lg mb-2">
            Professional management for rental properties
          </p>
          <p className="text-sm text-gray-500">
            Priced per door • Volume discounts • Annual billing
          </p>
        </div>

        {/* Calculator */}
        <Card className="border-2 mb-8" style={{ borderColor: '#FF6B35' }}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Calculator className="w-6 h-6" style={{ color: '#FF6B35' }} />
              <h3 className="font-bold" style={{ color: '#1B365D', fontSize: '24px' }}>
                Calculate Your Investment
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label className="font-semibold mb-2 block">Service Tier</Label>
                <Select value={selectedTier} onValueChange={setSelectedTier}>
                  <SelectTrigger style={{ minHeight: '48px' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="essential">Essential - $124/door</SelectItem>
                    <SelectItem value="premium">Premium - $183/door ⭐</SelectItem>
                    <SelectItem value="elite">Elite - $233/door</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="font-semibold mb-2 block">Number of Doors/Units</Label>
                <Input
                  type="number"
                  min="1"
                  value={doorCount}
                  onChange={(e) => setDoorCount(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ minHeight: '48px' }}
                />
              </div>
            </div>

            {/* Calculation Results */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Base Price:</span>
                <span className="font-semibold">
                  {doorCount} doors × ${tierPricing[selectedTier]} = ${calculation.subtotal.toLocaleString()}/month
                </span>
              </div>

              {calculation.discount > 0 && (
                <>
                  <div className="flex justify-between items-center text-green-700">
                    <span>Volume Discount ({calculation.discount}%):</span>
                    <span className="font-semibold">-${calculation.discountAmount.toLocaleString()}/month</span>
                  </div>
                  <div className="border-t border-gray-300 pt-3" />
                </>
              )}

              <div className="flex justify-between items-center text-xl font-bold" style={{ color: '#1B365D' }}>
                <span>Monthly Total:</span>
                <span>${calculation.total.toLocaleString()}/month</span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Per Door Effective:</span>
                <span className="font-semibold">${Math.round(calculation.perDoor)}/door/month</span>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Annual Investment:</span>
                <span className="font-semibold">${calculation.annual.toLocaleString()}/year</span>
              </div>
            </div>

            {calculation.discount > 0 && (
              <div className="mt-4 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                <p className="text-sm font-semibold text-green-900">
                  🎉 You qualify for {calculation.discount}% volume discount!
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Saving ${(calculation.discountAmount * 12).toLocaleString()}/year with {doorCount} doors
                </p>
              </div>
            )}

            <div className="mt-6 space-y-3">
              <Button
                asChild
                className="w-full font-bold"
                style={{ backgroundColor: '#FF6B35', minHeight: '56px' }}
              >
                <Link to={createPageUrl("FindOperator") + `?tier=${selectedTier}&doors=${doorCount}`}>
                  Find Operator for This Portfolio →
                </Link>
              </Button>

              {/* Direct Subscription Option */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or subscribe directly</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (!user) {
                    toast.error('Please sign in to subscribe');
                    navigate(createPageUrl('Login'));
                    return;
                  }
                  checkoutMutation.mutate({ tier: selectedTier, doors: doorCount });
                }}
                disabled={checkoutMutation.isPending}
                variant="outline"
                className="w-full font-semibold border-2"
                style={{ borderColor: '#1B365D', color: '#1B365D', minHeight: '48px' }}
              >
                {checkoutMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting to Stripe...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Subscribe Now - ${calculation.total.toLocaleString()}/mo
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-500 flex items-center justify-center gap-1">
                <Shield className="w-3 h-3" />
                Secure payment via Stripe
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Volume Discount Breakdown */}
        <Card className="border-2 border-blue-300 bg-blue-50 mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              💰 Volume Discount Structure
            </h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                <p className="text-2xl font-bold mb-1" style={{ color: '#1B365D' }}>1-4</p>
                <p className="text-sm text-gray-600 mb-2">doors</p>
                <p className="font-semibold">Standard Rate</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                <p className="text-2xl font-bold mb-1 text-green-700">5-9</p>
                <p className="text-sm text-gray-600 mb-2">doors</p>
                <p className="font-semibold text-green-700">10% OFF</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-green-400">
                <p className="text-2xl font-bold mb-1 text-green-700">10-19</p>
                <p className="text-sm text-gray-600 mb-2">doors</p>
                <p className="font-semibold text-green-700">15% OFF</p>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300">
                <p className="text-2xl font-bold mb-1 text-purple-700">20+</p>
                <p className="text-sm text-gray-600 mb-2">doors</p>
                <p className="font-semibold text-purple-700">Custom</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Tiers */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {tiers.map((tier) => (
            <Card
              key={tier.value}
              className={`border-2 mobile-card ${tier.popular ? 'shadow-xl' : ''}`}
              style={{ borderColor: tier.color }}
            >
              <CardContent className="p-6">
                {tier.popular && (
                  <Badge className="mb-4" style={{ backgroundColor: tier.color }}>
                    ⭐ MOST POPULAR
                  </Badge>
                )}
                
                <h3 className="font-bold mb-2" style={{ color: tier.color, fontSize: '24px' }}>
                  {tier.name}
                </h3>
                
                <div className="mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold" style={{ color: tier.color }}>
                      ${tier.price}
                    </span>
                    <span className="text-gray-600">/door/month</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {tier.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: tier.color }} />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* What's Included */}
        <Card className="border-2 border-gray-300 mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold mb-6" style={{ color: '#1B365D', fontSize: '24px' }}>
              What Every PropertyCare Plan Includes
            </h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#1B365D' }}>
                  <Building2 className="w-5 h-5" />
                  Property Management
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 4 seasonal diagnostics per door per year</li>
                  <li>• Complete Property Health Check™ per property</li>
                  <li>• Tenant coordination (24-48hr notice)</li>
                  <li>• Turnover coordination & inspection</li>
                  <li>• Full portfolio dashboard access</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#1B365D' }}>
                  <TrendingUp className="w-5 h-5" />
                  Financial Intelligence
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Cost tracking per property & portfolio</li>
                  <li>• ROI analytics & reporting</li>
                  <li>• Capital expenditure planning</li>
                  <li>• Tax documentation exports</li>
                  <li>• Volume pricing on bulk repairs</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Why PropertyCare */}
        <Card className="border-2 mb-8" style={{ borderColor: '#1B365D', backgroundColor: '#1B365D10' }}>
          <CardContent className="p-8">
            <h3 className="font-bold mb-6 text-center" style={{ color: '#1B365D', fontSize: '28px' }}>
              Why Investors Choose PropertyCare
            </h3>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: '#28A745' }}>
                  32%
                </div>
                <p className="text-sm text-gray-700">
                  Lower maintenance costs vs reactive landlords
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: '#FF6B35' }}>
                  45%
                </div>
                <p className="text-sm text-gray-700">
                  Longer tenant retention (fewer turnovers)
                </p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
                  $4.2K
                </div>
                <p className="text-sm text-gray-700">
                  Average disasters prevented per door/year
                </p>
              </div>
            </div>

            <p className="text-center text-gray-700 mb-6">
              PropertyCare members sleep better knowing their investments are protected
            </p>

            <div className="flex justify-center">
              <Button
                asChild
                className="font-bold"
                style={{ backgroundColor: '#1B365D', minHeight: '56px' }}
              >
                <Link to={createPageUrl("FindOperator")}>
                  Find Operator Near You →
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Also managing your own primary residence?
          </p>
          <Button
            asChild
            variant="outline"
            style={{ minHeight: '48px' }}
          >
            <Link to={createPageUrl("HomeCare")}>
              Check Out HomeCare Service →
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}