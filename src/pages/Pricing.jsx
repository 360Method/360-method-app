import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, X, Info, Zap, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { calculateTotalDoors, getTierConfig, calculateGoodPricing, calculateBetterPricing, calculateBestPricing, getRecommendedTier } from "../components/shared/TierCalculator";

export default function Pricing() {
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

  const currentTier = user?.tier || 'free';
  const totalDoors = calculateTotalDoors(properties);
  const recommendedTier = getRecommendedTier(totalDoors);

  const goodPricing = calculateGoodPricing(totalDoors);
  const betterPricing = calculateBetterPricing(totalDoors);
  const bestPricing = calculateBestPricing();

  const comparisonFeatures = [
    { 
      name: 'Properties',
      free: '1 property',
      good: 'Up to 25',
      better: 'Up to 100',
      best: 'Unlimited'
    },
    { 
      name: 'Total Doors',
      free: 'Any size',
      good: 'Up to 25',
      better: 'Up to 100',
      best: 'Unlimited'
    },
    {
      name: 'Baseline Documentation',
      free: true,
      good: true,
      better: true,
      best: true
    },
    {
      name: 'Seasonal Inspections',
      free: true,
      good: true,
      better: true,
      best: true
    },
    {
      name: 'Task Tracking',
      free: true,
      good: true,
      better: true,
      best: true
    },
    {
      name: 'Cascade Risk Alerts',
      free: false,
      good: true,
      better: true,
      best: true
    },
    {
      name: 'Portfolio Analytics',
      free: false,
      good: true,
      better: true,
      best: true
    },
    {
      name: 'Export Reports (PDF)',
      free: false,
      good: true,
      better: true,
      best: true
    },
    {
      name: 'Portfolio Comparison',
      free: false,
      good: false,
      better: true,
      best: true
    },
    {
      name: 'Budget Forecasting',
      free: false,
      good: false,
      better: true,
      best: true
    },
    {
      name: 'Share Access',
      free: false,
      good: false,
      better: true,
      best: true
    },
    {
      name: 'White-label Reports',
      free: false,
      good: false,
      better: true,
      best: true
    },
    {
      name: 'Multi-user Accounts',
      free: false,
      good: false,
      better: false,
      best: true
    },
    {
      name: 'Custom Reporting',
      free: false,
      good: false,
      better: false,
      best: true
    },
    {
      name: 'Dedicated Manager',
      free: false,
      good: false,
      better: false,
      best: true
    },
    {
      name: 'Support Level',
      free: 'Community',
      good: 'Email (48hr)',
      better: 'Priority (24hr)',
      best: 'Phone (4hr)'
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="mobile-container md:max-w-7xl md:mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Badge 
              className="text-white"
              style={{ backgroundColor: getTierConfig(currentTier).color }}
            >
              Current: {getTierConfig(currentTier).displayName}
            </Badge>
            {properties.length > 0 && (
              <Badge variant="outline">
                {totalDoors} door{totalDoors !== 1 ? 's' : ''} total
              </Badge>
            )}
          </div>
          <h1 className="font-bold mb-3" style={{ color: '#1B365D', fontSize: '32px' }}>
            Software Plans & Pricing
          </h1>
          <p className="text-gray-600 text-lg">
            Choose the plan that fits your portfolio size
          </p>
        </div>

        {/* Your Calculated Pricing (if has properties) */}
        {properties.length > 0 && currentTier === 'free' && (
          <Card className="border-2 border-blue-300 bg-blue-50 mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2">Your Calculated Pricing</h3>
                  <p className="text-sm text-blue-800 mb-3">
                    Based on your {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} with {totalDoors} total door{totalDoors !== 1 ? 's' : ''}:
                  </p>
                  <div className="grid md:grid-cols-3 gap-3">
                    {totalDoors <= 25 && (
                      <div className="bg-white rounded-lg p-3 border-2 border-green-300">
                        <p className="text-xs text-gray-600 mb-1">Pro (Recommended)</p>
                        <p className="text-2xl font-bold text-green-700">
                          ${goodPricing.monthlyPrice}<span className="text-sm">/mo</span>
                        </p>
                        {goodPricing.additionalDoors > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            ${goodPricing.breakdown.base} + ${goodPricing.breakdown.additionalCost} for {goodPricing.additionalDoors} extra door{goodPricing.additionalDoors > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                    {totalDoors <= 100 && (
                      <div className="bg-white rounded-lg p-3 border-2 border-purple-300">
                        <p className="text-xs text-gray-600 mb-1">Premium</p>
                        <p className="text-2xl font-bold text-purple-700">
                          ${betterPricing.monthlyPrice}<span className="text-sm">/mo</span>
                        </p>
                        {betterPricing.additionalDoors > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            ${betterPricing.breakdown.base} + ${betterPricing.breakdown.additionalCost} for {betterPricing.additionalDoors} extra door{betterPricing.additionalDoors > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-3 border-2 border-orange-300">
                      <p className="text-xs text-gray-600 mb-1">Enterprise</p>
                      <p className="text-2xl font-bold text-orange-700">
                        ${bestPricing.monthlyPrice}<span className="text-sm">/mo</span>
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Flat rate, unlimited doors
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Pricing Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          {/* Free Tier */}
          <Card className={`border-2 mobile-card ${currentTier === 'free' ? 'border-gray-400 shadow-lg' : 'border-gray-200'}`}>
            <CardContent className="p-6">
              {currentTier === 'free' && (
                <Badge className="mb-4 bg-gray-600">CURRENT</Badge>
              )}
              <h3 className="font-bold mb-2 text-gray-900" style={{ fontSize: '24px' }}>
                Free
              </h3>
              <p className="text-xs text-gray-500 mb-3">Starter</p>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/month</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 min-h-[200px]">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>1 property (any size)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>Basic baseline</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>Inspection checklists</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span>Task tracking</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>No cascade alerts</span>
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

          {/* Good Tier (Pro) */}
          <Card className={`border-2 mobile-card ${currentTier === 'good' ? 'border-green-600 shadow-lg' : recommendedTier === 'good' ? 'border-green-400 shadow-lg' : 'border-green-200'}`}>
            <CardContent className="p-6">
              {currentTier === 'good' ? (
                <Badge className="mb-4 bg-green-600">CURRENT</Badge>
              ) : recommendedTier === 'good' ? (
                <Badge className="mb-4 bg-green-600">RECOMMENDED</Badge>
              ) : (
                <Badge className="mb-4 bg-green-600">BEST VALUE</Badge>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-green-700" style={{ fontSize: '24px' }}>
                  Good
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Pro</p>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-green-700">$8</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Up to 3 doors • +$2/door after
                </p>
              </div>

              <ul className="space-y-2 mb-6 min-h-[200px]">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Up to 25 doors</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Cascade risk alerts</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Portfolio analytics</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Export reports (PDF)</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Email support</span>
                </li>
              </ul>

              {currentTier === 'good' ? (
                <Button variant="outline" className="w-full border-2 border-green-600" disabled style={{ minHeight: '48px' }}>
                  Current Plan
                </Button>
              ) : totalDoors > 25 ? (
                <Button variant="outline" className="w-full" disabled style={{ minHeight: '48px' }}>
                  {totalDoors} Doors Exceeds Limit
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full font-bold"
                  style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Checkout") + "?plan=good"}>
                    Upgrade to Pro
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Better Tier (Premium) */}
          <Card className={`border-2 mobile-card ${currentTier === 'better' ? 'border-purple-600 shadow-lg' : recommendedTier === 'better' ? 'border-purple-400 shadow-lg' : 'border-purple-200'}`}>
            <CardContent className="p-6">
              {currentTier === 'better' ? (
                <Badge className="mb-4 bg-purple-600">CURRENT</Badge>
              ) : recommendedTier === 'better' ? (
                <Badge className="mb-4 bg-purple-600">RECOMMENDED</Badge>
              ) : (
                <Badge className="mb-4 bg-purple-600">GROWING PORTFOLIO</Badge>
              )}
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h3 className="font-bold text-purple-700" style={{ fontSize: '24px' }}>
                  Better
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Premium</p>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-purple-700">$50</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Up to 15 doors • +$3/door after
                </p>
              </div>

              <ul className="space-y-2 mb-6 min-h-[200px]">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Up to 100 doors</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Portfolio comparison</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Budget forecasting</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Share access</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span>Priority support (24hr)</span>
                </li>
              </ul>

              {currentTier === 'better' ? (
                <Button variant="outline" className="w-full border-2 border-purple-600" disabled style={{ minHeight: '48px' }}>
                  Current Plan
                </Button>
              ) : totalDoors > 100 ? (
                <Button variant="outline" className="w-full" disabled style={{ minHeight: '48px' }}>
                  {totalDoors} Doors Exceeds Limit
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full font-bold"
                  style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Checkout") + "?plan=better"}>
                    Upgrade to Premium
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Best Tier (Enterprise) */}
          <Card className={`border-2 mobile-card ${currentTier === 'best' ? 'border-orange-600 shadow-lg' : recommendedTier === 'best' ? 'border-orange-400 shadow-lg' : 'border-orange-200'}`}>
            <CardContent className="p-6">
              {currentTier === 'best' ? (
                <Badge className="mb-4 bg-orange-600">CURRENT</Badge>
              ) : recommendedTier === 'best' ? (
                <Badge className="mb-4 bg-orange-600">RECOMMENDED</Badge>
              ) : (
                <Badge className="mb-4 bg-orange-600">UNLIMITED</Badge>
              )}
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-orange-600" />
                <h3 className="font-bold text-orange-700" style={{ fontSize: '24px' }}>
                  Best
                </h3>
              </div>
              <p className="text-xs text-gray-500 mb-3">Enterprise</p>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-orange-700">$299</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Unlimited doors • Flat rate
                </p>
              </div>

              <ul className="space-y-2 mb-6 min-h-[200px]">
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Unlimited doors</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Everything in Premium</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Multi-user accounts</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Custom reporting</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Dedicated manager</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Phone support (4hr)</span>
                </li>
              </ul>

              {currentTier === 'best' ? (
                <Button variant="outline" className="w-full border-2 border-orange-600" disabled style={{ minHeight: '48px' }}>
                  Current Plan
                </Button>
              ) : (
                <Button
                  asChild
                  className="w-full font-bold"
                  style={{ backgroundColor: '#F59E0B', minHeight: '48px' }}
                >
                  <Link to={createPageUrl("Checkout") + "?plan=best"}>
                    Upgrade to Enterprise
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pricing Examples */}
        <Card className="border-2 border-blue-300 bg-blue-50 mb-12">
          <CardContent className="p-6">
            <h3 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '20px' }}>
              💡 How Per-Door Pricing Works
            </h3>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-700">
                <strong>Pro (Good):</strong> $8/month covers your first 3 doors. Add $2/month for each door beyond that, up to 25 doors maximum.
              </p>
              <p className="text-sm text-gray-700">
                <strong>Premium (Better):</strong> $50/month covers your first 15 doors. Add $3/month for each door beyond that, up to 100 doors maximum.
              </p>
              <p className="text-sm text-gray-700">
                <strong>Enterprise (Best):</strong> $299/month flat rate, unlimited doors. Best value for 80+ doors.
              </p>

              <div className="bg-white rounded-lg p-4 mt-4">
                <p className="font-semibold mb-3">Examples:</p>
                <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <strong>Pro Tier:</strong>
                    <ul className="space-y-1 ml-4 mt-2">
                      <li>• 3 doors = <strong>$8/mo</strong></li>
                      <li>• 5 doors = <strong>$12/mo</strong> ($8 + $4)</li>
                      <li>• 10 doors = <strong>$22/mo</strong> ($8 + $14)</li>
                      <li>• 25 doors = <strong>$52/mo</strong> ($8 + $44)</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Premium Tier:</strong>
                    <ul className="space-y-1 ml-4 mt-2">
                      <li>• 15 doors = <strong>$50/mo</strong></li>
                      <li>• 30 doors = <strong>$95/mo</strong> ($50 + $45)</li>
                      <li>• 50 doors = <strong>$155/mo</strong> ($50 + $105)</li>
                      <li>• 100 doors = <strong>$305/mo</strong> ($50 + $255)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 italic mt-4">
                💡 <strong>Pro tip:</strong> Enterprise becomes the better value at around 80 doors ($299 flat vs. variable pricing).
              </p>
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
                    <th className="text-left p-3 font-semibold text-sm">Feature</th>
                    <th className="text-center p-3 font-semibold text-sm">Free</th>
                    <th className="text-center p-3 font-semibold text-sm text-green-700">Good</th>
                    <th className="text-center p-3 font-semibold text-sm text-purple-700">Better</th>
                    <th className="text-center p-3 font-semibold text-sm text-orange-700">Best</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonFeatures.map((feature, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-3 font-medium text-sm">{feature.name}</td>
                      <td className="p-3 text-center">
                        {typeof feature.free === 'boolean' ? (
                          feature.free ? (
                            <Check className="w-5 h-5 text-gray-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs">{feature.free}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {typeof feature.good === 'boolean' ? (
                          feature.good ? (
                            <Check className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs font-semibold text-green-700">{feature.good}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {typeof feature.better === 'boolean' ? (
                          feature.better ? (
                            <Check className="w-5 h-5 text-purple-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs font-semibold text-purple-700">{feature.better}</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        {typeof feature.best === 'boolean' ? (
                          feature.best ? (
                            <Check className="w-5 h-5 text-orange-600 mx-auto" />
                          ) : (
                            <X className="w-5 h-5 text-gray-300 mx-auto" />
                          )
                        ) : (
                          <span className="text-xs font-semibold text-orange-700">{feature.best}</span>
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
                  Yes! All paid subscriptions can be cancelled at any time. No long-term contracts or cancellation fees.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  What's a "door"?
                </h4>
                <p className="text-sm text-gray-700">
                  A "door" is an independent living unit with its own kitchen. A duplex = 2 doors. A fourplex = 4 doors. 
                  A single-family home = 1 door. This prevents the software from being used at scale without proper service agreements.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  What happens to my data if I downgrade?
                </h4>
                <p className="text-sm text-gray-700">
                  All your data is preserved. Properties exceeding your new tier's door limit will be archived (but not deleted). 
                  You can re-activate them by upgrading again.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  What about professional services (HomeCare/PropertyCare)?
                </h4>
                <p className="text-sm text-gray-700">
                  Professional service memberships include the "Best" software tier for free for one year. The software and physical 
                  labor services are separate offerings. <Link to={createPageUrl("Services")} className="text-blue-600 underline">Learn more about services</Link>.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2" style={{ color: '#1B365D' }}>
                  When should I choose Enterprise over Premium?
                </h4>
                <p className="text-sm text-gray-700">
                  Enterprise becomes cost-effective around 80 doors, plus you get dedicated support, multi-user accounts, 
                  and custom reporting. Great for property management companies or large portfolios.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}