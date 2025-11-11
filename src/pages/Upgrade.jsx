import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function Upgrade() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const currentTier = user?.subscription_tier || 'free';
  const isFreeTier = currentTier === 'free';
  const isProTier = currentTier === 'pro';

  const proFeatures = [
    "Up to 3 properties (vs 1 on Free)",
    "Portfolio dashboard & cross-property analytics",
    "Climate-specific diagnostic checklists",
    "Cascade risk alerts & cost projections",
    "Priority recommendations (ROI-ranked)",
    "Complete cost tracking & ROI analytics",
    "Budget forecasting & tax documentation",
    "System lifecycle cost projections",
    "Contractor marketplace access",
    "Request & compare contractor quotes",
    "Track contractor work & payments",
    "Export reports (PDF)",
    "Share with contractors/buyers/insurers",
    "Capital expenditure planning",
    "Priority email support",
    "No ads"
  ];

  const homeCareComparison = [
    { feature: "Properties", free: "1", pro: "3", homecare: "Unlimited" },
    { feature: "Diagnostics", free: "You do it", pro: "You do it", homecare: "We do it (4x/year)" },
    { feature: "Labor", free: "You hire", pro: "You hire", homecare: "Included (6-16hrs)" },
    { feature: "Support", free: "Community", pro: "Email", homecare: "24/7 Concierge" },
    { feature: "Contractor coordination", free: "You do it", pro: "You do it", homecare: "We handle it" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <Badge className="mb-4" style={{ backgroundColor: '#FF6B35' }}>
            UPGRADE
          </Badge>
          <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '32px' }}>
            Choose Your Path
          </h1>
          <p className="text-gray-600 text-lg">
            Whether you DIY or want professional help, we've got you covered
          </p>
        </div>

        {/* Current Status */}
        {user && (
          <Card className="border-2 border-blue-300 bg-blue-50 mb-8">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-900">
                    Current Plan: {currentTier === 'free' ? 'Free' : currentTier === 'pro' ? 'Pro' : 'HomeCare/PropertyCare'}
                  </p>
                  {isFreeTier && (
                    <p className="text-sm text-blue-700">
                      Upgrade to unlock advanced features
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pro Tier Card */}
        <Card className="border-2 mobile-card mb-8" style={{ borderColor: '#28A745' }}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#28A745' }}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '24px' }}>
                  360° Command Center PRO
                </h2>
                <p className="text-gray-700 mb-3">
                  The complete home maintenance toolkit
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-4xl font-bold" style={{ color: '#28A745' }}>$8</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Billed annually at $96/year (save $24 vs monthly billing)
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-semibold mb-3" style={{ color: '#1B365D' }}>
                Everything in Free, PLUS:
              </p>
              <div className="grid md:grid-cols-2 gap-2">
                {proFeatures.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#28A745' }} />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {isFreeTier && (
              <div className="flex flex-col md:flex-row gap-3">
                <Button
                  className="flex-1 font-bold"
                  style={{ backgroundColor: '#28A745', minHeight: '56px' }}
                  onClick={() => alert('Coming soon: Stripe integration for Pro upgrade')}
                >
                  Start 14-Day Free Trial
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  style={{ minHeight: '56px' }}
                >
                  Learn More
                </Button>
              </div>
            )}

            {isProTier && (
              <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4">
                <p className="font-semibold text-green-900 flex items-center gap-2">
                  <Check className="w-5 h-5" />
                  You're already on Pro! 🎉
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* HomeCare Teaser */}
        <Card className="border-2 mobile-card mb-8" style={{ borderColor: '#1B365D' }}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1B365D' }}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '24px' }}>
                  Want Professional Help?
                </h2>
                <p className="text-gray-700 mb-3">
                  HomeCare members get everything done for them
                </p>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-xl text-gray-600">FROM</span>
                  <span className="text-4xl font-bold" style={{ color: '#1B365D' }}>$124</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Billed annually • Includes Pro features
                </p>
              </div>
            </div>

            <div className="mb-6">
              <p className="font-semibold mb-3" style={{ color: '#1B365D' }}>
                What's Included:
              </p>
              <div className="space-y-2">
                {[
                  "4 seasonal diagnostic visits by local operator",
                  "6-16 hours of included labor per year",
                  "24/7 concierge support system",
                  "We coordinate all contractors",
                  "Full Command Center Pro access included",
                  "Annual Home Health Report™",
                  "90-Day Safer Home Guarantee"
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#1B365D' }} />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <Button
                asChild
                className="flex-1 font-bold"
                style={{ backgroundColor: '#1B365D', minHeight: '56px' }}
              >
                <Link to={createPageUrl("HomeCare")}>
                  Explore HomeCare Service →
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1"
                style={{ minHeight: '56px' }}
              >
                <Link to={createPageUrl("FindOperator")}>
                  Find Operator Near You
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Comparison Table */}
        <Card className="border-2 border-gray-300 mb-8">
          <CardContent className="p-6">
            <h3 className="font-bold mb-6 text-center" style={{ color: '#1B365D', fontSize: '24px' }}>
              Compare Options
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left p-3 font-semibold" style={{ color: '#1B365D' }}>Feature</th>
                    <th className="text-center p-3 font-semibold" style={{ color: '#1B365D' }}>Free</th>
                    <th className="text-center p-3 font-semibold" style={{ color: '#28A745' }}>Pro</th>
                    <th className="text-center p-3 font-semibold" style={{ color: '#1B365D' }}>HomeCare</th>
                  </tr>
                </thead>
                <tbody>
                  {homeCareComparison.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="p-3 font-medium">{row.feature}</td>
                      <td className="p-3 text-center text-sm">{row.free}</td>
                      <td className="p-3 text-center text-sm font-semibold" style={{ color: '#28A745' }}>{row.pro}</td>
                      <td className="p-3 text-center text-sm font-semibold" style={{ color: '#1B365D' }}>{row.homecare}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ / Help */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              Questions?
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-gray-900">Can I try Pro before buying?</p>
                <p className="text-gray-700">Yes! 14-day free trial, no credit card required.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Can I cancel anytime?</p>
                <p className="text-gray-700">Yes, but annual plans are billed upfront. No refunds on remaining months.</p>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Is HomeCare available in my area?</p>
                <p className="text-gray-700">Check availability by entering your ZIP code on the Find Operator page.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}