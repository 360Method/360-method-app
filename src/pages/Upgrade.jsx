import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, X, Home, Building2, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import TierBadge from "../components/upgrade/TierBadge";
import { calculateProPricing } from "../components/shared/ServiceAreaChecker";

export default function Upgrade() {
  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list(),
  });

  const currentTier = user?.subscription_tier || 'free';
  const proPricing = calculateProPricing(properties);

  const proFeatures = [
    'Up to 3 properties (any size)',
    'Full baseline documentation',
    'Seasonal inspections with checklists',
    'Maintenance task tracking',
    'Cascade risk alerts',
    'Portfolio analytics dashboard',
    'Priority email support',
    'Export reports (PDF)',
    'Mobile-optimized interface',
    'Unlimited inspections'
  ];

  const comparisonFeatures = [
    { 
      name: 'Properties',
      free: '1 property',
      pro: '3 properties',
      service: 'Unlimited'
    },
    { 
      name: 'Additional Doors',
      free: 'N/A',
      pro: '+$2/door/month',
      service: 'Included'
    },
    {
      name: 'Baseline Documentation',
      free: true,
      pro: true,
      service: true
    },
    {
      name: 'Seasonal Inspections',
      free: true,
      pro: true,
      service: true
    },
    {
      name: 'Cascade Risk Alerts',
      free: false,
      pro: true,
      service: true
    },
    {
      name: 'Portfolio Analytics',
      free: false,
      pro: true,
      service: true
    },
    {
      name: 'Export Reports',
      free: false,
      pro: true,
      service: true
    },
    {
      name: 'Professional Visits',
      free: false,
      pro: false,
      service: '4 per year'
    },
    {
      name: 'Included Labor Hours',
      free: false,
      pro: false,
      service: '6-16 hrs/year'
    },
    {
      name: '24/7 Concierge',
      free: false,
      pro: false,
      service: true
    },
    {
      name: 'Contractor Discounts',
      free: false,
      pro: false,
      service: '5-15%'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TierBadge tier={currentTier} />
            {currentTier !== 'free' && (
              <Badge variant="outline" className="text-green-700 border-green-700">
                ✓ Current Plan
              </Badge>
            )}
          </div>
          <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '32px' }}>
            Choose Your Plan
          </h1>
          <p className="text-gray-600 text-lg">
            From DIY software to full professional service
          </p>
        </div>

        {/* Main Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Free Tier */}
          <Card className={`border-2 mobile-card ${currentTier === 'free' ? 'border-gray-400' : 'border-gray-200'}`}>
            <CardContent className="p-6">
              {currentTier === 'free' && (
                <Badge className="mb-4 bg-gray-600">CURRENT PLAN</Badge>
              )}
              <h3 className="font-bold mb-2 text-gray-900" style={{ fontSize: '24px' }}>
                Free
              </h3>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>1 property (any size)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Basic baseline documentation</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Seasonal inspection checklists</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Task tracking</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>No cascade alerts</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>No portfolio analytics</span>
                </li>
              </ul>

              {currentTier === 'free' ? (
                <Button variant="outline" className="w-full" disabled style={{ minHeight: '48px' }}>
                  Current Plan
                </Button>
              ) : (
                <Button variant="outline" className="w-full" disabled style={{ minHeight: '48px' }}>
                  Not Available
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Pro Tier */}
          <Card className={`border-2 mobile-card shadow-lg ${currentTier === 'pro' ? 'border-green-600' : 'border-green-400'}`}>
            <CardContent className="p-6">
              <Badge className="mb-4" style={{ backgroundColor: '#28A745' }}>
                {currentTier === 'pro' ? 'CURRENT PLAN' : 'BEST VALUE'}
              </Badge>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-green-600" />
                <h3 className="font-bold" style={{ fontSize: '24px', color: '#28A745' }}>
                  Pro
                </h3>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: '#28A745' }}>$8</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Up to 3 properties • ${(8 * 12).toFixed(0)}/year
                </p>
              </div>

              {/* Pro Pricing Calculator */}
              {properties.length > 0 && currentTier === 'free' && (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3 mb-4">
                  <div className="flex items-start gap-2 mb-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-blue-900 mb-1">Your Price:</p>
                      <p className="text-blue-800">
                        {proPricing.totalDoors} door{proPricing.totalDoors > 1 ? 's' : ''} total
                      </p>
                      {proPricing.additionalDoors > 0 && (
                        <p className="text-blue-800">
                          ${proPricing.breakdown.base} base + ${proPricing.breakdown.additionalCost} for {proPricing.additionalDoors} additional door{proPricing.additionalDoors > 1 ? 's' : ''}
                        </p>
                      )}
                      <p className="font-bold text-blue-900 mt-1">
                        = ${proPricing.monthlyPrice}/month
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <ul className="space-y-3 mb-6">
                {proFeatures.slice(0, 6).map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
                <li className="text-xs text-gray-500 italic">
                  + $2/door/month beyond first 3 doors
                </li>
              </ul>

              {currentTier === 'pro' ? (
                <Button 
                  variant="outline" 
                  className="w-full border-2 border-green-600" 
                  disabled 
                  style={{ minHeight: '48px' }}
                >
                  Current Plan
                </Button>
              ) : currentTier !== 'free' ? (
                <Button 
                  variant="outline" 
                  className="w-full" 
                  disabled 
                  style={{ minHeight: '48px' }}
                >
                  Downgrade Not Available
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full font-bold"
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Checkout") + "?plan=pro"}>
                    Upgrade to Pro
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* HomeCare Tier */}
          <Card className={`border-2 mobile-card ${currentTier.includes('homecare') ? 'border-blue-600' : 'border-blue-300'}`}>
            <CardContent className="p-6">
              {currentTier.includes('homecare') && (
                <Badge className="mb-4" style={{ backgroundColor: '#1B365D' }}>CURRENT PLAN</Badge>
              )}
              {!currentTier.includes('homecare') && (
                <Badge className="mb-4" style={{ backgroundColor: '#1B365D' }}>PROFESSIONAL</Badge>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6" style={{ color: '#1B365D' }} />
                <h3 className="font-bold" style={{ fontSize: '24px', color: '#1B365D' }}>
                  HomeCare
                </h3>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold" style={{ color: '#1B365D' }}>$124</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Starting price • Annual billing</p>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1B365D' }} />
                  <span>Everything in Pro, PLUS:</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1B365D' }} />
                  <span>4 professional visits/year</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1B365D' }} />
                  <span>6-16 hrs included labor</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1B365D' }} />
                  <span>24/7 concierge system</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1B365D' }} />
                  <span>Local vetted operator</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#1B365D' }} />
                  <span>90-Day Safer Home Guarantee</span>
                </li>
              </ul>

              {currentTier.includes('homecare') ? (
                <Button 
                  variant="outline" 
                  className="w-full border-2" 
                  style={{ borderColor: '#1B365D' }}
                  disabled 
                >
                  Current Plan
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full font-bold"
                  style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("HomeCare")}>
                    <Home className="w-4 h-4 mr-2" />
                    Learn More
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pro Pricing Explanation */}
        <Card className="border-2 border-blue-300 bg-blue-50 mb-12">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              💡 How Pro Pricing Works
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="font-semibold mb-2">Base: $8/month</p>
                <p className="text-sm text-gray-700">
                  Covers up to 3 properties of any size. A duplex = 1 property. A fourplex = 1 property. An apartment building = 1 property.
                </p>
              </div>

              <div>
                <p className="font-semibold mb-2">Additional Doors: +$2/door/month</p>
                <p className="text-sm text-gray-700">
                  Only charged for doors beyond the first 3. This prevents non-certified operators from using the platform to run competing services at scale.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <p className="font-semibold mb-3">Examples:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 3 single-family homes (3 doors) = <strong>$8/month</strong></li>
                  <li>• 2 SFH + 1 duplex (4 doors) = <strong>$10/month</strong> ($8 + $2)</li>
                  <li>• 1 SFH + 1 fourplex (5 doors) = <strong>$12/month</strong> ($8 + $4)</li>
                  <li>• Portfolio with 10 doors = <strong>$22/month</strong> ($8 + $14)</li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 italic">
                Managing many properties? Consider PropertyCare service with volume discounts.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PropertyCare Banner */}
        <Card className="border-2 border-orange-300 bg-orange-50 mb-12">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#FF6B35' }}>
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold mb-2" style={{ color: '#FF6B35', fontSize: '22px' }}>
                  PropertyCare for Rental Portfolios
                </h3>
                <p className="text-gray-700 mb-4">
                  Managing rental properties? PropertyCare offers per-door pricing with volume discounts (10-20% off). 
                  Perfect for landlords and investors with 2+ doors.
                </p>
                <Button
                  asChild
                  style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("PropertyCare")}>
                    Calculate PropertyCare Pricing
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Comparison Table */}
        <Card className="border-2 border-gray-200 mb-12">
          <CardContent className="p-6">
            <h3 className="font-bold mb-6 text-center" style={{ color: '#1B365D', fontSize: '24px' }}>
              Feature Comparison
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2">
                    <th className="text-left p-3 font-semibold">Feature</th>
                    <th className="text-center p-3 font-semibold">Free</th>
                    <th className="text-center p-3 font-semibold text-green-700">Pro</th>
                    <th className="text-center p-3 font-semibold" style={{ color: '#1B365D' }}>Service</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3 font-medium">{feature.name}</td>
                      <td className="p-3 text-center">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm">{feature.free}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {typeof feature.pro === 'boolean' ? (
                          feature.pro ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-semibold text-green-700">{feature.pro}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {typeof feature.service === 'boolean' ? (
                          feature.service ? (
                            <Check className="w-5 h-5 mx-auto" style={{ color: '#1B365D' }} />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-sm font-semibold" style={{ color: '#1B365D' }}>{feature.service}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="border-2 border-gray-200">
          <CardContent className="p-6">
            <h3 className="font-bold mb-6 text-center" style={{ color: '#1B365D', fontSize: '24px' }}>
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Can I cancel anytime?
                </h4>
                <p className="text-sm text-gray-700">
                  Yes! Both Pro and Service subscriptions can be cancelled at any time. No long-term contracts or cancellation fees.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  How does the per-door pricing work for Pro?
                </h4>
                <p className="text-sm text-gray-700">
                  Pro costs $8/month for up to 3 properties (regardless of size). If your properties have more than 3 total doors, 
                  you pay an additional $2/month per door beyond the first 3. Example: 10 doors = $8 base + (7 × $2) = $22/month.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  What happens to my data if I downgrade?
                </h4>
                <p className="text-sm text-gray-700">
                  All your data is preserved. If you downgrade from Pro to Free, you'll keep your first property active and others will be archived (but not deleted).
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  Can I upgrade from Pro to HomeCare later?
                </h4>
                <p className="text-sm text-gray-700">
                  Absolutely! Many users start with Pro to learn the system, then upgrade to HomeCare when they want professional help. Your existing data carries over seamlessly.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}