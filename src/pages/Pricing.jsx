import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, X, Info, Zap, TrendingUp, Brain, Shield, Users, BarChart3, FileText, Share2, ArrowUp, Compass, Flag, Star, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { calculateTotalDoors, getTierConfig, calculateGoodPricing, calculateBetterPricing, calculateBestPricing, getRecommendedTier } from "../components/shared/TierCalculator";
import TierChangeDialog from "../components/pricing/TierChangeDialog";

export default function Pricing() {
  const queryClient = useQueryClient();
  const [isChangingTier, setIsChangingTier] = React.useState(false);
  const [showTierDialog, setShowTierDialog] = React.useState(false);
  const [selectedNewTier, setSelectedNewTier] = React.useState(null);
  const [billingCycle, setBillingCycle] = React.useState('annual');
  const pricingCardsRef = React.useRef(null);

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

  const changeTierMutation = useMutation({
    mutationFn: async (newTier) => {
      return await base44.auth.updateMe({ tier: newTier });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
      setIsChangingTier(false);
      setShowTierDialog(false);
      setSelectedNewTier(null);
    },
  });

  const handleChangeTier = (tier) => {
    setSelectedNewTier(tier);
    setShowTierDialog(true);
  };

  const handleConfirmTierChange = () => {
    setIsChangingTier(true);
    changeTierMutation.mutate(selectedNewTier);
  };

  const scrollToPricing = () => {
    pricingCardsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const currentTier = user?.tier || 'free';
  const totalDoors = calculateTotalDoors(properties);
  const recommendedTier = getRecommendedTier(totalDoors);

  const goodPricing = calculateGoodPricing(totalDoors, billingCycle);
  const betterPricing = calculateBetterPricing(totalDoors, billingCycle);
  const bestPricing = calculateBestPricing(billingCycle);

  const goodAnnualPricingObj = calculateGoodPricing(totalDoors, 'annual');
  const goodMonthlyPricingObj = calculateGoodPricing(totalDoors, 'monthly');
  const goodMonthlySavings = goodMonthlyPricingObj.monthlyPrice - goodAnnualPricingObj.monthlyPrice;
  
  const betterAnnualPricingObj = calculateBetterPricing(totalDoors, 'annual');
  const betterMonthlyPricingObj = calculateBetterPricing(totalDoors, 'monthly');
  const betterMonthlySavings = betterMonthlyPricingObj.monthlyPrice - betterAnnualPricingObj.monthlyPrice;
  
  const bestAnnualPricingObj = calculateBestPricing('annual');
  const bestMonthlyPricingObj = calculateBestPricing('monthly');
  const bestMonthlySavings = bestMonthlyPricingObj.monthlyPrice - bestAnnualPricingObj.monthlyPrice;

  let selectedNewTierPricing = null;
  if (selectedNewTier === 'good') selectedNewTierPricing = goodPricing;
  if (selectedNewTier === 'better') selectedNewTierPricing = betterPricing;
  if (selectedNewTier === 'best') selectedNewTierPricing = bestPricing;

  const comparisonFeatures = [
    { name: 'Properties', free: '1 property', good: 'Up to 25', better: 'Up to 100', best: 'Unlimited' },
    { name: 'Total Doors', free: 'Any size', good: 'Up to 25', better: 'Up to 100', best: 'Unlimited' },
    { name: 'Baseline Documentation', free: true, good: true, better: true, best: true },
    { name: 'Seasonal Inspections', free: true, good: true, better: true, best: true },
    { name: 'Task Tracking', free: true, good: true, better: true, best: true },
    { name: 'AI Cascade Risk Alerts', free: false, good: true, better: true, best: true },
    { name: 'AI Spending Forecasts', free: false, good: true, better: true, best: true },
    { name: 'AI Maintenance Insights', free: false, good: true, better: true, best: true },
    { name: 'Portfolio Analytics', free: false, good: true, better: true, best: true },
    { name: 'Export Reports (PDF)', free: false, good: true, better: true, best: true },
    { name: 'AI Portfolio Comparison', free: false, good: false, better: true, best: true },
    { name: 'AI Budget Forecasting', free: false, good: false, better: true, best: true },
    { name: 'Share Access', free: false, good: false, better: true, best: true },
    { name: 'White-label Reports', free: false, good: false, better: true, best: true },
    { name: 'Multi-user Accounts', free: false, good: false, better: false, best: true },
    { name: 'Custom AI Reporting', free: false, good: false, better: false, best: true },
    { name: 'Dedicated Manager', free: false, good: false, better: false, best: true },
    { name: 'Support Level', free: 'Community', good: 'Email (48hr)', better: 'Priority (24hr)', best: 'Phone (4hr)' }
  ];

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      <div className="w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center pt-4 md:pt-0 px-4">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <Badge 
              className="text-white text-xs"
              style={{ backgroundColor: getTierConfig(currentTier).color }}
            >
              Current: {getTierConfig(currentTier).displayName}
            </Badge>
            {properties.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {totalDoors} door{totalDoors !== 1 ? 's' : ''} total
              </Badge>
            )}
          </div>
          <h1 className="font-bold mb-2 text-2xl md:text-3xl break-words" style={{ color: '#1B365D' }}>
            Software Plans & Pricing
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-3xl mx-auto break-words">
            <strong>The 360° Method</strong> uses AI to transform you from reactive homeowner to proactive property manager
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="px-3 mb-6">
          <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-3 md:p-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-blue-900 mb-1 text-sm md:text-base break-words">
                      Choose Billing Cycle
                    </h3>
                    <p className="text-xs text-blue-800 break-words">
                      <strong>Annual</strong> = best rates. <strong>Monthly</strong> = flexibility.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => setBillingCycle('annual')}
                    className={`flex-1 px-3 py-2 rounded-md font-semibold text-xs transition-all ${
                      billingCycle === 'annual'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-blue-200'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    Annual
                    <span className="block text-xs font-normal">Save 20%</span>
                  </button>
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className={`flex-1 px-3 py-2 rounded-md font-semibold text-xs transition-all ${
                      billingCycle === 'monthly'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-blue-200'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    Monthly
                    <span className="block text-xs font-normal">Flexible</span>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Calculated Pricing */}
        {properties.length > 0 && currentTier === 'free' && (
          <div className="px-3 mb-6">
            <Card className="border-2 border-green-300 bg-green-50">
              <CardContent className="p-3 md:p-6">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-green-900 mb-1 text-sm md:text-base break-words">
                      Your Calculated Pricing
                    </h3>
                    <p className="text-xs text-green-800 break-words">
                      Based on {properties.length} propert{properties.length === 1 ? 'y' : 'ies'}, {totalDoors} door{totalDoors !== 1 ? 's' : ''}:
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {totalDoors <= 25 && (
                    <div className="bg-white rounded-lg p-3 border-2 border-green-400">
                      <p className="text-xs text-gray-600 mb-1">Pioneer (Recommended)</p>
                      <p className="text-xl font-bold text-green-700 break-words">
                        ${goodPricing.monthlyPrice}/mo
                      </p>
                    </div>
                  )}
                  {totalDoors <= 100 && (
                    <div className="bg-white rounded-lg p-3 border-2 border-purple-300">
                      <p className="text-xs text-gray-600 mb-1">Commander</p>
                      <p className="text-xl font-bold text-purple-700 break-words">
                        ${betterPricing.monthlyPrice}/mo
                      </p>
                    </div>
                  )}
                  <div className="bg-white rounded-lg p-3 border-2 border-orange-300">
                    <p className="text-xs text-gray-600 mb-1">Elite</p>
                    <p className="text-xl font-bold text-orange-700 break-words">
                      ${bestPricing.monthlyPrice}/mo
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Pricing Cards */}
        <div ref={pricingCardsRef} className="scroll-mt-20 px-3 mb-8">
          <div className="space-y-4 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 md:space-y-0">
            {/* Scout Tier */}
            <Card className={`border-2 ${currentTier === 'free' ? 'border-gray-400 shadow-lg' : 'border-gray-200'}`}>
              <CardContent className="p-4">
                {currentTier === 'free' && (
                  <Badge className="mb-3 bg-gray-600 text-xs">CURRENT</Badge>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <h3 className="font-bold text-gray-900 text-lg break-words">Scout</h3>
                </div>
                <p className="text-xs text-gray-500 mb-2">Learn the Method</p>
                <div className="mb-3">
                  <span className="text-3xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600 text-sm">/mo</span>
                </div>

                <div className="bg-blue-50 rounded-lg p-2 mb-3 border border-blue-200">
                  <p className="text-xs text-blue-900 leading-relaxed break-words">
                    Perfect for learning the method on your first property.
                  </p>
                </div>

                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">1 property (any size)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Basic baseline</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Inspection checklists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Task tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-gray-400">
                    <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="break-words">No AI alerts</span>
                  </li>
                </ul>

                {currentTier === 'free' ? (
                  <Button variant="outline" className="w-full text-xs" disabled style={{ minHeight: '44px' }}>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleChangeTier('free')}
                    variant="outline" 
                    className="w-full text-xs"
                    disabled={isChangingTier}
                    style={{ minHeight: '44px' }}
                  >
                    {isChangingTier ? 'Switching...' : 'Downgrade'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Pioneer Tier */}
            <Card className={`border-2 ${currentTier === 'good' ? 'border-green-600 shadow-lg' : recommendedTier === 'good' ? 'border-green-400 shadow-lg' : 'border-green-200'}`}>
              <CardContent className="p-4">
                {currentTier === 'good' ? (
                  <Badge className="mb-3 bg-green-600 text-xs">CURRENT</Badge>
                ) : recommendedTier === 'good' ? (
                  <Badge className="mb-3 bg-green-600 text-xs">RECOMMENDED</Badge>
                ) : (
                  <Badge className="mb-3 bg-green-600 text-xs">BEST VALUE</Badge>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <Flag className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <h3 className="font-bold text-green-700 text-lg break-words">Pioneer</h3>
                </div>
                <p className="text-xs text-gray-500 mb-2">AI-Powered Pro</p>
                <div className="mb-3">
                  <span className="text-3xl font-bold text-green-700">${goodPricing.monthlyPrice}</span>
                  <span className="text-gray-600 text-sm">/mo</span>
                  {billingCycle === 'annual' && (
                    <p className="text-xs text-gray-500 mt-1 break-words">
                      Billed ${goodPricing.annualPrice}/yr
                    </p>
                  )}
                </div>

                <div className="bg-green-50 rounded-lg p-2 mb-3 border border-green-200">
                  <p className="text-xs text-green-900 leading-relaxed break-words">
                    Unlock AI intelligence to prevent disasters before they start.
                  </p>
                </div>

                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold break-words">Everything in Scout, PLUS:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">AI cascade alerts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">AI cost forecasting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">AI spending insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Up to 25 doors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Export reports (PDF)</span>
                  </li>
                </ul>

                {currentTier === 'good' ? (
                  <Button variant="outline" className="w-full text-xs border-2 border-green-600" disabled style={{ minHeight: '44px' }}>
                    Current Plan
                  </Button>
                ) : totalDoors > 25 ? (
                  <Button variant="outline" className="w-full text-xs" disabled style={{ minHeight: '44px' }}>
                    {totalDoors} Doors Exceeds Limit
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleChangeTier('good')}
                    disabled={isChangingTier}
                    className="w-full font-bold text-xs"
                    style={{ backgroundColor: '#28A745', minHeight: '44px' }}
                  >
                    {isChangingTier ? 'Switching...' : currentTier === 'free' ? 'Upgrade to Pioneer' : 'Switch to Pioneer'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Commander Tier */}
            <Card className={`border-2 ${currentTier === 'better' ? 'border-purple-600 shadow-lg' : recommendedTier === 'better' ? 'border-purple-400 shadow-lg' : 'border-purple-200'}`}>
              <CardContent className="p-4">
                {currentTier === 'better' ? (
                  <Badge className="mb-3 bg-purple-600 text-xs">CURRENT</Badge>
                ) : recommendedTier === 'better' ? (
                  <Badge className="mb-3 bg-purple-600 text-xs">RECOMMENDED</Badge>
                ) : (
                  <Badge className="mb-3 bg-purple-600 text-xs">GROWING PORTFOLIO</Badge>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <h3 className="font-bold text-purple-700 text-lg break-words">Commander</h3>
                </div>
                <p className="text-xs text-gray-500 mb-2">Advanced AI + Team</p>
                <div className="mb-3">
                  <span className="text-3xl font-bold text-purple-700">${betterPricing.monthlyPrice}</span>
                  <span className="text-gray-600 text-sm">/mo</span>
                  {billingCycle === 'annual' && (
                    <p className="text-xs text-gray-500 mt-1 break-words">
                      Billed ${betterPricing.annualPrice}/yr
                    </p>
                  )}
                </div>

                <div className="bg-purple-50 rounded-lg p-2 mb-3 border border-purple-200">
                  <p className="text-xs text-purple-900 leading-relaxed break-words">
                    Scale your success with portfolio AI and team tools.
                  </p>
                </div>

                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold break-words">Everything in Pioneer, PLUS:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">AI portfolio comparison</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">AI budget forecasting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Share2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Share access with team</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Up to 100 doors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">White-label reports</span>
                  </li>
                </ul>

                {currentTier === 'better' ? (
                  <Button variant="outline" className="w-full text-xs border-2 border-purple-600" disabled style={{ minHeight: '44px' }}>
                    Current Plan
                  </Button>
                ) : totalDoors > 100 ? (
                  <Button variant="outline" className="w-full text-xs" disabled style={{ minHeight: '44px' }}>
                    Exceeds Limit
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleChangeTier('better')}
                    disabled={isChangingTier}
                    className="w-full font-bold text-xs"
                    style={{ backgroundColor: '#8B5CF6', minHeight: '44px' }}
                  >
                    {isChangingTier ? 'Switching...' : currentTier === 'free' ? 'Upgrade to Commander' : 'Switch'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Elite Tier */}
            <Card className={`border-2 ${currentTier === 'best' ? 'border-orange-600 shadow-lg' : recommendedTier === 'best' ? 'border-orange-400 shadow-lg' : 'border-orange-200'}`}>
              <CardContent className="p-4">
                {currentTier === 'best' ? (
                  <Badge className="mb-3 bg-orange-600 text-xs">CURRENT</Badge>
                ) : recommendedTier === 'best' ? (
                  <Badge className="mb-3 bg-orange-600 text-xs">RECOMMENDED</Badge>
                ) : (
                  <Badge className="mb-3 bg-orange-600 text-xs">UNLIMITED</Badge>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-orange-600 flex-shrink-0" />
                  <h3 className="font-bold text-orange-700 text-lg break-words">Elite</h3>
                </div>
                <p className="text-xs text-gray-500 mb-2">Enterprise Suite</p>
                <div className="mb-3">
                  <span className="text-3xl font-bold text-orange-700">${bestPricing.monthlyPrice}</span>
                  <span className="text-gray-600 text-sm">/mo</span>
                  {billingCycle === 'annual' && (
                    <p className="text-xs text-gray-500 mt-1 break-words">
                      Billed ${bestPricing.annualPrice}/yr
                    </p>
                  )}
                </div>

                <div className="bg-orange-50 rounded-lg p-2 mb-3 border border-orange-200">
                  <p className="text-xs text-orange-900 leading-relaxed break-words">
                    Built for professionals with unlimited doors.
                  </p>
                </div>

                <ul className="space-y-2 mb-4 text-xs">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold break-words">Everything in Commander, PLUS:</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Brain className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Custom AI reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Users className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Multi-user accounts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Dedicated manager</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Unlimited doors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="break-words">Phone support (4hr)</span>
                  </li>
                </ul>

                {currentTier === 'best' ? (
                  <Button variant="outline" className="w-full text-xs border-2 border-orange-600" disabled style={{ minHeight: '44px' }}>
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleChangeTier('best')}
                    disabled={isChangingTier}
                    className="w-full font-bold text-xs"
                    style={{ backgroundColor: '#F59E0B', minHeight: '44px' }}
                  >
                    {isChangingTier ? 'Switching...' : currentTier === 'free' ? 'Upgrade to Elite' : 'Switch to Elite'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Features Deep Dive */}
        <div className="px-3 mb-8">
          <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-purple-900 mb-1 text-base break-words">
                    Why AI Makes You Smarter
                  </h3>
                  <p className="text-gray-700 text-xs leading-relaxed break-words">
                    Our AI teaches you to think like a property pro.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Shield className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <h4 className="font-semibold text-purple-900 text-sm break-words">Cascade Risk Intelligence</h4>
                  </div>
                  <p className="text-xs text-gray-700 mb-1 break-words">
                    <strong>What it does:</strong> Shows how one problem triggers others (e.g., gutters → foundation → flooding).
                  </p>
                  <p className="text-xs text-gray-600 italic break-words">
                    <strong>Why you're better:</strong> Prevent $10K-50K disasters with $200 fixes.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-start gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <h4 className="font-semibold text-purple-900 text-sm break-words">Pattern Recognition</h4>
                  </div>
                  <p className="text-xs text-gray-700 mb-1 break-words">
                    <strong>What it does:</strong> Predicts future needs and costs from your history.
                  </p>
                  <p className="text-xs text-gray-600 italic break-words">
                    <strong>Why you're better:</strong> Budget accurately, plan ahead, no surprises.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Zap className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <h4 className="font-semibold text-purple-900 text-sm break-words">Smart Prioritization</h4>
                  </div>
                  <p className="text-xs text-gray-700 mb-1 break-words">
                    <strong>What it does:</strong> Ranks tasks by urgency, cost, and cascade risk.
                  </p>
                  <p className="text-xs text-gray-600 italic break-words">
                    <strong>Why you're better:</strong> Work on the right things first, maximize ROI.
                  </p>
                </div>

                <div className="bg-white rounded-lg p-3 border border-purple-200">
                  <div className="flex items-start gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <h4 className="font-semibold text-purple-900 text-sm break-words">Cost Optimization</h4>
                  </div>
                  <p className="text-xs text-gray-700 mb-1 break-words">
                    <strong>What it does:</strong> Finds ways to reduce spending without sacrificing quality.
                  </p>
                  <p className="text-xs text-gray-600 italic break-words">
                    <strong>Why you're better:</strong> Spend 30-40% less while maintaining higher health scores.
                  </p>
                </div>
              </div>

              <div className="mt-3 bg-purple-100 rounded-lg p-3 border border-purple-300">
                <p className="text-xs font-bold text-purple-900 mb-1 break-words">
                  🎓 The Real ROI: Knowledge That Compounds
                </p>
                <p className="text-xs text-gray-800 leading-relaxed break-words">
                  After 6 months, users predict issues before inspectors, negotiate better with contractors, and make confident repair decisions.
                </p>
              </div>

              {currentTier !== 'best' && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={scrollToPricing}
                    className="gap-2 font-bold text-xs w-full"
                    style={{ backgroundColor: '#8B5CF6', minHeight: '44px' }}
                  >
                    <ArrowUp className="w-4 h-4" />
                    Choose Your Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pricing Examples */}
        <div className="px-3 mb-8">
          <Card className="border-2 border-blue-300 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-bold mb-3 text-base break-words" style={{ color: '#1B365D' }}>
                💡 How Pricing Works
              </h3>
              
              <div className="space-y-3 text-xs break-words">
                <p className="text-gray-700 leading-relaxed">
                  <strong>Pioneer:</strong> ${goodMonthlyPricingObj.monthlyPrice}/mo covers first 3 doors. +$2/mo per door after, max 25.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Commander:</strong> ${betterMonthlyPricingObj.monthlyPrice}/mo covers first 15 doors. +$3/mo per door after, max 100.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  <strong>Elite:</strong> ${bestMonthlyPricingObj.monthlyPrice}/mo flat, unlimited doors.
                </p>

                <div className="bg-white rounded-lg p-3 mt-3 border border-blue-200">
                  <p className="font-semibold mb-2 text-sm break-words">Examples (monthly):</p>
                  <div className="space-y-2">
                    <div>
                      <strong>Pioneer:</strong>
                      <ul className="space-y-1 ml-3 mt-1">
                        <li className="break-words">• 1 house = ${calculateGoodPricing(1, 'monthly').monthlyPrice}/mo</li>
                        <li className="break-words">• 3 doors = ${calculateGoodPricing(3, 'monthly').monthlyPrice}/mo</li>
                        <li className="break-words">• 25 doors = ${calculateGoodPricing(25, 'monthly').monthlyPrice}/mo</li>
                      </ul>
                    </div>
                    <div>
                      <strong>Commander:</strong>
                      <ul className="space-y-1 ml-3 mt-1">
                        <li className="break-words">• 15 doors = ${calculateBetterPricing(15, 'monthly').monthlyPrice}/mo</li>
                        <li className="break-words">• 50 doors = ${calculateBetterPricing(50, 'monthly').monthlyPrice}/mo</li>
                        <li className="break-words">• 100 doors = ${calculateBetterPricing(100, 'monthly').monthlyPrice}/mo</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-600">
                  <p className="text-xs text-green-900 leading-relaxed break-words">
                    <strong>💡 Tip:</strong> Elite is better value at 80+ doors.
                  </p>
                </div>
              </div>

              {currentTier !== 'best' && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={scrollToPricing}
                    className="gap-2 font-bold text-xs w-full"
                    style={{ backgroundColor: '#FF6B35', minHeight: '44px' }}
                  >
                    <ArrowUp className="w-4 h-4" />
                    Compare Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison Table */}
        <div className="px-3 mb-8">
          <Card className="border-2 border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-bold mb-4 text-center text-base break-words" style={{ color: '#1B365D' }}>
                Feature Comparison
              </h3>
              
              <div className="overflow-x-auto -mx-4">
                <div className="min-w-[500px] px-4">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left p-2 font-semibold">Feature</th>
                        <th className="text-center p-2 font-semibold">Scout</th>
                        <th className="text-center p-2 font-semibold text-green-700">Pioneer</th>
                        <th className="text-center p-2 font-semibold text-purple-700">Commander</th>
                        <th className="text-center p-2 font-semibold text-orange-700">Elite</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((feature, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-2 font-medium">{feature.name}</td>
                          <td className="p-2 text-center">
                            {typeof feature.free === 'boolean' ? (
                              feature.free ? <Check className="w-4 h-4 text-gray-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                            ) : (
                              <span className="text-xs">{feature.free}</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {typeof feature.good === 'boolean' ? (
                              feature.good ? <Check className="w-4 h-4 text-green-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                            ) : (
                              <span className="text-xs font-semibold text-green-700">{feature.good}</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {typeof feature.better === 'boolean' ? (
                              feature.better ? <Check className="w-4 h-4 text-purple-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                            ) : (
                              <span className="text-xs font-semibold text-purple-700">{feature.better}</span>
                            )}
                          </td>
                          <td className="p-2 text-center">
                            {typeof feature.best === 'boolean' ? (
                              feature.best ? <Check className="w-4 h-4 text-orange-600 mx-auto" /> : <X className="w-4 h-4 text-gray-300 mx-auto" />
                            ) : (
                              <span className="text-xs font-semibold text-orange-700">{feature.best}</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {currentTier !== 'best' && (
                <div className="mt-4 text-center">
                  <Button
                    onClick={scrollToPricing}
                    className="gap-2 font-bold text-xs w-full"
                    style={{ backgroundColor: '#1B365D', minHeight: '44px' }}
                  >
                    <ArrowUp className="w-4 h-4" />
                    Back to Plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ */}
        <div className="px-3 mb-8">
          <Card className="border-2 border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-bold mb-4 text-center text-base break-words" style={{ color: '#1B365D' }}>
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2 text-sm break-words" style={{ color: '#1B365D' }}>
                    How does this save me money?
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed break-words">
                    By catching small issues before they cascade. A $150 gutter cleaning prevents a $12K foundation repair. Users prevent an average of $8,400 in disasters per year.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm break-words" style={{ color: '#1B365D' }}>
                    Can I change tiers anytime?
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed break-words">
                    Yes! Switch instantly with no penalties. All your data stays intact.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm break-words" style={{ color: '#1B365D' }}>
                    What's a "door"?
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed break-words">
                    A "door" is an independent unit with its own kitchen. Single-family home = 1 door. Duplex = 2 doors. 12-unit building = 12 doors.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm break-words" style={{ color: '#1B365D' }}>
                    What happens if I downgrade?
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed break-words">
                    Nothing! All your data is preserved forever. Extra properties get archived (not deleted) and reactivate if you upgrade again.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm break-words" style={{ color: '#1B365D' }}>
                    When choose Elite over Commander?
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed break-words">
                    Elite makes sense at 80+ doors (saves money) OR if you need multi-user teams and dedicated support. Great for property managers.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm break-words" style={{ color: '#1B365D' }}>
                    What about HomeCare/PropertyCare?
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed break-words">
                    Service memberships include Elite software FREE for one year. <Link to={createPageUrl("Services")} className="text-blue-600 underline">Learn more</Link>.
                  </p>
                </div>
              </div>

              {currentTier !== 'best' && (
                <div className="mt-6 text-center border-t pt-6">
                  <p className="text-sm text-gray-700 mb-3 break-words">Ready to upgrade?</p>
                  <Button
                    onClick={scrollToPricing}
                    className="gap-2 font-bold text-xs w-full"
                    style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                  >
                    <ArrowUp className="w-4 h-4" />
                    View Plans & Upgrade
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
          billingCycle={billingCycle}
          isLoading={isChangingTier}
        />
      )}
    </div>
  );
}