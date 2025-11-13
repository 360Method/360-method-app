
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
  const [billingCycle, setBillingCycle] = React.useState('annual'); // 'annual' or 'monthly'
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

  // Get pricing objects for both annual and monthly to calculate savings
  const goodAnnualPricingObj = calculateGoodPricing(totalDoors, 'annual');
  const goodMonthlyPricingObj = calculateGoodPricing(totalDoors, 'monthly');
  const goodMonthlySavings = goodMonthlyPricingObj.monthlyPrice - goodAnnualPricingObj.monthlyPrice;
  
  const betterAnnualPricingObj = calculateBetterPricing(totalDoors, 'annual');
  const betterMonthlyPricingObj = calculateBetterPricing(totalDoors, 'monthly');
  const betterMonthlySavings = betterMonthlyPricingObj.monthlyPrice - betterAnnualPricingObj.monthlyPrice;
  
  const bestAnnualPricingObj = calculateBestPricing('annual');
  const bestMonthlyPricingObj = calculateBestPricing('monthly');
  const bestMonthlySavings = bestMonthlyPricingObj.monthlyPrice - bestAnnualPricingObj.monthlyPrice;

  // Get pricing for selected new tier
  let selectedNewTierPricing = null;
  if (selectedNewTier === 'good') selectedNewTierPricing = goodPricing;
  if (selectedNewTier === 'better') selectedNewTierPricing = betterPricing;
  if (selectedNewTier === 'best') selectedNewTierPricing = bestPricing;

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
      name: 'AI Cascade Risk Alerts',
      free: false,
      good: true,
      better: true,
      best: true
    },
    {
      name: 'AI Spending Forecasts',
      free: false,
      good: true,
      better: true,
      best: true
    },
    {
      name: 'AI Maintenance Insights',
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
      name: 'AI Portfolio Comparison',
      free: false,
      good: false,
      better: true,
      best: true
    },
    {
      name: 'AI Budget Forecasting',
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
      name: 'Custom AI Reporting',
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
      <div className="w-full px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8 text-center pt-4 md:pt-0">
          <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Badge 
              className="text-white text-xs md:text-sm"
              style={{ backgroundColor: getTierConfig(currentTier).color }}
            >
              Current: {getTierConfig(currentTier).displayName}
            </Badge>
            {properties.length > 0 && (
              <Badge variant="outline" className="text-xs md:text-sm">
                {totalDoors} door{totalDoors !== 1 ? 's' : ''} total
              </Badge>
            )}
          </div>
          <h1 className="font-bold mb-2 md:mb-3 text-2xl md:text-3xl lg:text-4xl" style={{ color: '#1B365D' }}>
            Software Plans & Pricing
          </h1>
          <p className="text-gray-600 text-sm md:text-base lg:text-lg max-w-3xl mx-auto px-2">
            <strong>The 360° Method</strong> uses AI to transform you from reactive homeowner to proactive property manager - preventing disasters before they happen
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 mb-6 md:mb-8 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-blue-900 mb-1 text-base md:text-lg">
                    💰 Choose Your Billing Cycle
                  </h3>
                  <p className="text-xs md:text-sm text-blue-800 leading-relaxed">
                    <strong>Annual billing</strong> locks in the best rates. <strong>Monthly billing</strong> offers more flexibility with a small premium.
                  </p>
                </div>
              </div>

              {/* Toggle Buttons */}
              <div className="flex bg-white rounded-lg p-1 border-2 border-blue-200 shadow-sm">
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 md:px-6 py-2 rounded-md font-semibold text-sm md:text-base transition-all ${
                    billingCycle === 'annual'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  Annual
                  <span className="block text-xs font-normal">Save up to 20%</span>
                </button>
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 md:px-6 py-2 rounded-md font-semibold text-sm md:text-base transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  Monthly
                  <span className="block text-xs font-normal">Flexible</span>
                </button>
              </div>
            </div>

            {/* Explanation */}
            <div className="mt-4 bg-white rounded-lg p-3 md:p-4 border border-blue-200">
              <div className="grid md:grid-cols-2 gap-3 text-xs md:text-sm">
                <div>
                  <p className="font-semibold text-blue-900 mb-1">✓ Annual Billing (Best Value)</p>
                  <ul className="text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Pioneer: Starts at <strong>${goodAnnualPricingObj.monthlyPrice}/month</strong> (billed ${goodAnnualPricingObj.annualPrice}/year)</li>
                    <li>Commander: Starts at <strong>${betterAnnualPricingObj.monthlyPrice}/month</strong> (billed ${betterAnnualPricingObj.annualPrice}/year)</li>
                    <li>Elite: <strong>${bestAnnualPricingObj.monthlyPrice}/month</strong> (billed ${bestAnnualPricingObj.annualPrice}/year)</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-blue-900 mb-1">◎ Monthly Billing (More Flexibility)</p>
                  <ul className="text-gray-700 space-y-1 ml-4 list-disc">
                    <li>Pioneer: Starts at <strong>${goodMonthlyPricingObj.monthlyPrice}/month</strong></li>
                    <li>Commander: Starts at <strong>${betterMonthlyPricingObj.monthlyPrice}/month</strong></li>
                    <li>Elite: <strong>${bestMonthlyPricingObj.monthlyPrice}/month</strong></li>
                  </ul>
                </div>
              </div>
              <p className="text-xs text-gray-600 mt-3 italic">
                *Additional door pricing remains the same for both billing cycles: +$2/door after 3 for Pioneer; +$3/door after 15 for Commander.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Your Calculated Pricing */}
        {properties.length > 0 && currentTier === 'free' && (
          <Card className="border-2 border-green-300 bg-green-50 mb-6 md:mb-8 shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col md:flex-row items-start gap-3">
                <Info className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1 w-full">
                  <h3 className="font-bold text-green-900 mb-2 text-base md:text-lg">Your Calculated Pricing</h3>
                  <p className="text-xs md:text-sm text-green-800 mb-3">
                    Based on your {properties.length} propert{properties.length === 1 ? 'y' : 'ies'} with {totalDoors} total door{totalDoors !== 1 ? 's' : ''}:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {totalDoors <= 25 && (
                      <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-green-400">
                        <p className="text-xs text-gray-600 mb-1">Pioneer (Recommended)</p>
                        <p className="text-2xl md:text-3xl font-bold text-green-700">
                          ${goodPricing.monthlyPrice}<span className="text-sm">/mo</span>
                        </p>
                        {billingCycle === 'annual' && (
                          <p className="text-xs text-green-700 font-semibold mt-1">
                            Billed ${goodPricing.annualPrice}/year
                          </p>
                        )}
                        {goodPricing.additionalDoors > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            ${goodPricing.breakdown.base} + ${goodPricing.breakdown.additionalCost} for {goodPricing.additionalDoors} extra door{goodPricing.additionalDoors > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                    {totalDoors <= 100 && (
                      <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-purple-300">
                        <p className="text-xs text-gray-600 mb-1">Commander</p>
                        <p className="text-2xl md:text-3xl font-bold text-purple-700">
                          ${betterPricing.monthlyPrice}<span className="text-sm">/mo</span>
                        </p>
                        {billingCycle === 'annual' && (
                          <p className="text-xs text-purple-700 font-semibold mt-1">
                            Billed ${betterPricing.annualPrice}/year
                          </p>
                        )}
                        {betterPricing.additionalDoors > 0 && (
                          <p className="text-xs text-gray-600 mt-1">
                            ${betterPricing.breakdown.base} + ${betterPricing.breakdown.additionalCost} for {betterPricing.additionalDoors} extra door{betterPricing.additionalDoors > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-orange-300">
                      <p className="text-xs text-gray-600 mb-1">Elite</p>
                      <p className="text-2xl md:text-3xl font-bold text-orange-700">
                        ${bestPricing.monthlyPrice}<span className="text-sm">/mo</span>
                      </p>
                      {billingCycle === 'annual' && (
                        <p className="text-xs text-orange-700 font-semibold mt-1">
                          Billed ${bestPricing.annualPrice}/year
                        </p>
                      )}
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
        <div ref={pricingCardsRef} className="scroll-mt-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
            {/* Scout Tier (Free) */}
            <Card className={`border-2 ${currentTier === 'free' ? 'border-gray-400 shadow-lg' : 'border-gray-200'}`}>
              <CardContent className="p-4 md:p-6">
                {currentTier === 'free' && (
                  <Badge className="mb-3 md:mb-4 bg-gray-600 text-xs">CURRENT</Badge>
                )}
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <Compass className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />
                  <h3 className="font-bold text-gray-900 text-xl md:text-2xl">
                    Scout
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-2 md:mb-3">Learn the Method</p>
                <div className="mb-3 md:mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900">$0</span>
                    <span className="text-gray-600 text-sm">/month</span>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-2 md:p-3 mb-3 md:mb-4 border border-blue-200">
                  <p className="text-xs text-blue-900 leading-relaxed">
                    <strong>Perfect for learning the 360° Method.</strong> See how AWARE → ACT → ADVANCE prevents disasters on your first property.
                  </p>
                </div>

                <ul className="space-y-2 mb-4 md:mb-6 min-h-[180px] md:min-h-[200px]">
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span>1 property (any size)</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span>Basic baseline</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span>Inspection checklists</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span>Task tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm text-gray-400">
                    <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>No AI cascade alerts</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm text-gray-400">
                    <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>No AI insights</span>
                  </li>
                </ul>

                {currentTier === 'free' ? (
                  <Button variant="outline" className="w-full" disabled style={{ minHeight: '48px' }}>
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleChangeTier('free')}
                    variant="outline" 
                    className="w-full"
                    disabled={isChangingTier}
                    style={{ minHeight: '48px' }}
                  >
                    {isChangingTier ? 'Switching...' : 'Downgrade'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Pioneer Tier (Good/Pro) */}
            <Card className={`border-2 ${currentTier === 'good' ? 'border-green-600 shadow-lg' : recommendedTier === 'good' ? 'border-green-400 shadow-lg' : 'border-green-200'}`}>
              <CardContent className="p-4 md:p-6">
                {currentTier === 'good' ? (
                  <Badge className="mb-3 md:mb-4 bg-green-600 text-xs">CURRENT</Badge>
                ) : recommendedTier === 'good' ? (
                  <Badge className="mb-3 md:mb-4 bg-green-600 text-xs">RECOMMENDED</Badge>
                ) : (
                  <Badge className="mb-3 md:mb-4 bg-green-600 text-xs">BEST VALUE</Badge>
                )}
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <Flag className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                  <h3 className="font-bold text-green-700 text-xl md:text-2xl">
                    Pioneer
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-2 md:mb-3">AI-Powered Pro</p>
                <div className="mb-3 md:mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-bold text-green-700">${goodPricing.monthlyPrice}</span>
                    <span className="text-gray-600 text-sm">/month</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Billed ${goodPricing.annualPrice}/year
                    </p>
                  )}
                  {billingCycle === 'monthly' && goodMonthlySavings > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Save ${goodMonthlySavings}/mo with annual billing
                    </p>
                  )}
                </div>

                <div className="bg-green-50 rounded-lg p-2 md:p-3 mb-3 md:mb-4 border border-green-200">
                  <p className="text-xs text-green-900 leading-relaxed">
                    <strong>🧠 Unlock AI intelligence.</strong> Get cascade risk scoring, cost forecasts, and smart prioritization that prevents disasters before they start.
                  </p>
                </div>

                <ul className="space-y-2 mb-4 md:mb-6 min-h-[180px] md:min-h-[200px]">
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">Everything in Scout, PLUS:</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Brain className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>AI cascade alerts</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Brain className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>AI cost forecasting</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Brain className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span><strong>AI spending insights</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Up to 25 doors</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Export reports (PDF)</span>
                  </li>
                </ul>

                {currentTier === 'good' ? (
                  <Button variant="outline" className="w-full border-2 border-green-600" disabled style={{ minHeight: '48px' }}>
                    Current Plan
                  </Button>
                ) : totalDoors > 25 ? (
                  <Button variant="outline" className="w-full text-xs md:text-sm" disabled style={{ minHeight: '48px' }}>
                    {totalDoors} Doors Exceeds Limit
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleChangeTier('good')}
                    disabled={isChangingTier}
                    className="w-full font-bold text-sm md:text-base"
                    style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                  >
                    {isChangingTier ? 'Switching...' : currentTier === 'free' ? 'Upgrade to Pioneer' : 'Switch to Pioneer'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Commander Tier (Better/Premium) */}
            <Card className={`border-2 ${currentTier === 'better' ? 'border-purple-600 shadow-lg' : recommendedTier === 'better' ? 'border-purple-400 shadow-lg' : 'border-purple-200'}`}>
              <CardContent className="p-4 md:p-6">
                {currentTier === 'better' ? (
                  <Badge className="mb-3 md:mb-4 bg-purple-600 text-xs">CURRENT</Badge>
                ) : recommendedTier === 'better' ? (
                  <Badge className="mb-3 md:mb-4 bg-purple-600 text-xs">RECOMMENDED</Badge>
                ) : (
                  <Badge className="mb-3 md:mb-4 bg-purple-600 text-xs">GROWING PORTFOLIO</Badge>
                )}
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <Star className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                  <h3 className="font-bold text-purple-700 text-xl md:text-2xl">
                    Commander
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-2 md:mb-3">Advanced AI + Collaboration</p>
                <div className="mb-3 md:mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-bold text-purple-700">${betterPricing.monthlyPrice}</span>
                    <span className="text-gray-600 text-sm">/month</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Billed ${betterPricing.annualPrice}/year
                    </p>
                  )}
                  {billingCycle === 'monthly' && betterMonthlySavings > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Save ${betterMonthlySavings}/mo with annual billing
                    </p>
                  )}
                </div>

                <div className="bg-purple-50 rounded-lg p-2 md:p-3 mb-3 md:mb-4 border border-purple-200">
                  <p className="text-xs text-purple-900 leading-relaxed">
                    <strong>🚀 Scale your success.</strong> AI compares properties, forecasts budgets, and enables team collaboration - perfect for growing portfolios.
                  </p>
                </div>

                <ul className="space-y-2 mb-4 md:mb-6 min-h-[180px] md:min-h-[200px]">
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">Everything in Pioneer, PLUS:</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Brain className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>AI portfolio comparison</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Brain className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span><strong>AI budget forecasting</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Share2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Share access with team</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>Up to 100 doors</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                    <span>White-label reports</span>
                  </li>
                </ul>

                {currentTier === 'better' ? (
                  <Button variant="outline" className="w-full border-2 border-purple-600" disabled style={{ minHeight: '48px' }}>
                    Current Plan
                  </Button>
                ) : totalDoors > 100 ? (
                  <Button variant="outline" className="w-full text-xs md:text-sm" disabled style={{ minHeight: '48px' }}>
                    {totalDoors} Doors Exceeds Limit
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleChangeTier('better')}
                    disabled={isChangingTier}
                    className="w-full font-bold text-sm md:text-base"
                    style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                  >
                    {isChangingTier ? 'Switching...' : currentTier === 'free' ? 'Upgrade to Commander' : 'Switch to Commander'}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Elite Tier (Best/Enterprise) */}
            <Card className={`border-2 ${currentTier === 'best' ? 'border-orange-600 shadow-lg' : recommendedTier === 'best' ? 'border-orange-400 shadow-lg' : 'border-orange-200'}`}>
              <CardContent className="p-4 md:p-6">
                {currentTier === 'best' ? (
                  <Badge className="mb-3 md:mb-4 bg-orange-600 text-xs">CURRENT</Badge>
                ) : recommendedTier === 'best' ? (
                  <Badge className="mb-3 md:mb-4 bg-orange-600 text-xs">RECOMMENDED</Badge>
                ) : (
                  <Badge className="mb-3 md:mb-4 bg-orange-600 text-xs">UNLIMITED</Badge>
                )}
                <div className="flex items-center gap-2 mb-1 md:mb-2">
                  <Crown className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
                  <h3 className="font-bold text-orange-700 text-xl md:text-2xl">
                    Elite
                  </h3>
                </div>
                <p className="text-xs text-gray-500 mb-2 md:mb-3">Full Enterprise Suite</p>
                <div className="mb-3 md:mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-bold text-orange-700">${bestPricing.monthlyPrice}</span>
                    <span className="text-gray-600 text-sm">/month</span>
                  </div>
                  {billingCycle === 'annual' && (
                    <p className="text-xs text-gray-500 mt-1">
                      Billed ${bestPricing.annualPrice}/year
                    </p>
                  )}
                  {billingCycle === 'monthly' && bestMonthlySavings > 0 && (
                    <p className="text-xs text-orange-600 mt-1">
                      Save ${bestMonthlySavings}/mo with annual billing
                    </p>
                  )}
                </div>

                <div className="bg-orange-50 rounded-lg p-2 md:p-3 mb-3 md:mb-4 border border-orange-200">
                  <p className="text-xs text-orange-900 leading-relaxed">
                    <strong>🏢 Built for professionals.</strong> Custom AI reports, multi-user teams, and dedicated support for property management companies.
                  </p>
                </div>

                <ul className="space-y-2 mb-4 md:mb-6 min-h-[180px] md:min-h-[200px]">
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span className="font-semibold">Everything in Commander, PLUS:</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Brain className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Custom AI reporting</strong></span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Users className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Multi-user accounts</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Shield className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Dedicated manager</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>Unlimited doors</span>
                  </li>
                  <li className="flex items-start gap-2 text-xs md:text-sm">
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
                    onClick={() => handleChangeTier('best')}
                    disabled={isChangingTier}
                    className="w-full font-bold text-sm md:text-base"
                    style={{ backgroundColor: '#F59E0B', minHeight: '48px' }}
                  >
                    {isChangingTier ? 'Switching...' : currentTier === 'free' ? 'Upgrade to Elite' : 'Switch to Elite'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Features Deep Dive */}
        <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 mb-8 md:mb-12 shadow-lg">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                <Brain className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-purple-900 mb-1 md:mb-2 text-lg md:text-xl">
                  Why AI Makes You a Smarter Homeowner
                </h3>
                <p className="text-gray-700 text-xs md:text-sm leading-relaxed">
                  The 360° Method's AI doesn't just track data - it teaches you to <em>think</em> like a property professional. Here's what our AI does that makes you better at homeownership:
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900 text-sm md:text-base">Cascade Risk Intelligence</h4>
                </div>
                <p className="text-xs md:text-sm text-gray-700 mb-2 leading-relaxed">
                  <strong>What it does:</strong> Analyzes how one failing system triggers others (e.g., clogged gutters → foundation damage → basement flooding).
                </p>
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  <strong>Why you're better:</strong> You'll spot chain reactions before they start, like a professional inspector - preventing $10K-50K disasters with $200 fixes.
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900 text-sm md:text-base">Pattern Recognition</h4>
                </div>
                <p className="text-xs md:text-sm text-gray-700 mb-2 leading-relaxed">
                  <strong>What it does:</strong> Learns from your maintenance history to predict future needs, costs, and optimal timing.
                </p>
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  <strong>Why you're better:</strong> You'll budget accurately and plan ahead, eliminating financial surprises that drain bank accounts and stress marriages.
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900 text-sm md:text-base">Smart Prioritization</h4>
                </div>
                <p className="text-xs md:text-sm text-gray-700 mb-2 leading-relaxed">
                  <strong>What it does:</strong> Ranks 47 potential tasks by urgency, cost impact, and cascade risk - not just gut feel.
                </p>
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  <strong>Why you're better:</strong> You'll work on the <em>right</em> things first, maximizing ROI on your time and money like a professional property manager.
                </p>
              </div>

              <div className="bg-white rounded-lg p-3 md:p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                  <h4 className="font-semibold text-purple-900 text-sm md:text-base">Cost Optimization</h4>
                </div>
                <p className="text-xs md:text-sm text-gray-700 mb-2 leading-relaxed">
                  <strong>What it does:</strong> Identifies ways to reduce spending without sacrificing quality (bulk timing, DIY vs. hire decisions).
                </p>
                <p className="text-xs text-gray-600 italic leading-relaxed">
                  <strong>Why you're better:</strong> You'll spend 30-40% less than reactive neighbors while maintaining <em>higher</em> property health scores.
                </p>
              </div>
            </div>

            <div className="mt-3 md:mt-4 bg-purple-100 rounded-lg p-3 md:p-4 border-2 border-purple-300">
              <p className="text-xs md:text-sm font-bold text-purple-900 mb-1 md:mb-2">
                🎓 The Real ROI: Knowledge That Compounds
              </p>
              <p className="text-xs text-gray-800 leading-relaxed">
                After 6 months using AI-powered features, most users report they can predict issues before inspectors find them, negotiate better with contractors (because they know the numbers), and make confident decisions about repairs vs. replacements. <strong>You're not just maintaining a home - you're becoming a property expert.</strong>
              </p>
            </div>

            {/* Back to Pricing Button */}
            {currentTier !== 'best' && (
              <div className="mt-4 md:mt-6 text-center">
                <Button
                  onClick={scrollToPricing}
                  className="gap-2 font-bold"
                  style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                >
                  <ArrowUp className="w-4 h-4" />
                  Choose Your Plan
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pricing Examples */}
        <Card className="border-2 border-blue-300 bg-blue-50 mb-8 md:mb-12">
          <CardContent className="p-4 md:p-6">
            <h3 className="font-bold mb-3 md:mb-4 text-base md:text-xl" style={{ color: '#1B365D' }}>
              💡 How Per-Door Pricing Works
            </h3>
            
            <div className="space-y-3 md:space-y-4">
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                <strong>Pioneer (Good):</strong> ${goodMonthlyPricingObj.monthlyPrice}/month covers your first 3 doors. Add $2/month for each door beyond that, up to 25 doors maximum.
              </p>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                <strong>Commander (Better):</strong> ${betterMonthlyPricingObj.monthlyPrice}/month covers your first 15 doors. Add $3/month for each door beyond that, up to 100 doors maximum.
              </p>
              <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                <strong>Elite (Best):</strong> ${bestMonthlyPricingObj.monthlyPrice}/month flat rate, unlimited doors. Best value for 80+ doors.
              </p>

              <div className="bg-white rounded-lg p-3 md:p-4 mt-3 md:mt-4">
                <p className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Real-World Examples (based on monthly billing):</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm text-gray-700">
                  <div>
                    <strong>Pioneer Tier:</strong>
                    <ul className="space-y-1 ml-4 mt-2">
                      <li>• 1 house = <strong>${calculateGoodPricing(1, 'monthly').monthlyPrice}/mo</strong></li>
                      <li>• 1 house + 1 duplex (3 doors) = <strong>${calculateGoodPricing(3, 'monthly').monthlyPrice}/mo</strong></li>
                      <li>• 2 houses + 1 fourplex (6 doors) = <strong>${calculateGoodPricing(6, 'monthly').monthlyPrice}/mo</strong></li>
                      <li>• Portfolio with 25 doors = <strong>${calculateGoodPricing(25, 'monthly').monthlyPrice}/mo</strong></li>
                    </ul>
                  </div>
                  <div>
                    <strong>Commander Tier:</strong>
                    <ul className="space-y-1 ml-4 mt-2">
                      <li>• 15 doors = <strong>${calculateBetterPricing(15, 'monthly').monthlyPrice}/mo</strong></li>
                      <li>• 30 doors = <strong>${calculateBetterPricing(30, 'monthly').monthlyPrice}/mo</strong></li>
                      <li>• 50 doors = <strong>${calculateBetterPricing(50, 'monthly').monthlyPrice}/mo</strong></li>
                      <li>• 100 doors = <strong>${calculateBetterPricing(100, 'monthly').monthlyPrice}/mo</strong></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 border-l-4 border-green-600">
                <p className="text-xs md:text-sm text-green-900 leading-relaxed">
                  <strong>💡 Smart Tip:</strong> Elite becomes better value around 80 doors (${bestMonthlyPricingObj.monthlyPrice} flat vs. ${calculateBetterPricing(80, 'monthly').monthlyPrice}+ variable). Plus you get multi-user accounts and dedicated support.
                </p>
              </div>
            </div>

            {/* Back to Pricing Button */}
            {currentTier !== 'best' && (
              <div className="mt-4 md:mt-6 text-center">
                <Button
                  onClick={scrollToPricing}
                  className="gap-2 font-bold"
                  style={{ backgroundColor: '#FF6B35', minHeight: '48px' }}
                >
                  <ArrowUp className="w-4 h-4" />
                  Compare Plans Above
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Feature Comparison Table */}
        <Card className="border-2 border-gray-200 mb-8 md:mb-12">
          <CardContent className="p-4 md:p-6">
            <h3 className="font-bold mb-4 md:mb-6 text-center text-lg md:text-2xl" style={{ color: '#1B365D' }}>
              Feature Comparison
            </h3>
            
            <div className="overflow-x-auto -mx-4 md:mx-0">
              <div className="min-w-[600px] px-4 md:px-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left p-2 md:p-3 font-semibold text-xs md:text-sm">Feature</th>
                      <th className="text-center p-2 md:p-3 font-semibold text-xs md:text-sm">Scout</th>
                      <th className="text-center p-2 md:p-3 font-semibold text-xs md:text-sm text-green-700">Pioneer</th>
                      <th className="text-center p-2 md:p-3 font-semibold text-xs md:text-sm text-purple-700">Commander</th>
                      <th className="text-center p-2 md:p-3 font-semibold text-xs md:text-sm text-orange-700">Elite</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map((feature, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2 md:p-3 font-medium text-xs md:text-sm">{feature.name}</td>
                        <td className="p-2 md:p-3 text-center">
                          {typeof feature.free === 'boolean' ? (
                            feature.free ? (
                              <Check className="w-4 h-4 md:w-5 md:h-5 text-gray-600 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 md:w-5 md:h-5 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-xs">{feature.free}</span>
                          )}
                        </td>
                        <td className="p-2 md:p-3 text-center">
                          {typeof feature.good === 'boolean' ? (
                            feature.good ? (
                              <Check className="w-4 h-4 md:w-5 md:h-5 text-green-600 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 md:w-5 md:h-5 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-xs font-semibold text-green-700">{feature.good}</span>
                          )}
                        </td>
                        <td className="p-2 md:p-3 text-center">
                          {typeof feature.better === 'boolean' ? (
                            feature.better ? (
                              <Check className="w-4 h-4 md:w-5 md:h-5 text-purple-600 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 md:w-5 md:h-5 text-gray-300 mx-auto" />
                            )
                          ) : (
                            <span className="text-xs font-semibold text-purple-700">{feature.better}</span>
                          )}
                        </td>
                        <td className="p-2 md:p-3 text-center">
                          {typeof feature.best === 'boolean' ? (
                            feature.best ? (
                              <Check className="w-4 h-4 md:w-5 md:h-5 text-orange-600 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 md:w-5 md:h-5 text-gray-300 mx-auto" />
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
            </div>

            {/* Back to Pricing Button */}
            {currentTier !== 'best' && (
              <div className="mt-4 md:mt-6 text-center">
                <Button
                  onClick={scrollToPricing}
                  className="gap-2 font-bold"
                  style={{ backgroundColor: '#1B365D', minHeight: '48px' }}
                >
                  <ArrowUp className="w-4 h-4" />
                  Back to Plans
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="border-2 border-gray-200">
          <CardContent className="p-4 md:p-6">
            <h3 className="font-bold mb-4 md:mb-6 text-center text-lg md:text-2xl" style={{ color: '#1B365D' }}>
              Frequently Asked Questions
            </h3>
            
            <div className="space-y-4 md:space-y-6">
              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base" style={{ color: '#1B365D' }}>
                  How does the 360° Method save me money?
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  By catching small issues before they cascade into disasters. A $150 gutter cleaning prevents a $12,000 foundation repair. 
                  AI identifies these connections automatically - most homeowners miss them until it's too late. <strong>Users prevent an average of $8,400 in disasters per year.</strong>
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base" style={{ color: '#1B365D' }}>
                  Can I cancel or change tiers anytime?
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Yes! Switch between tiers instantly with no penalties. All your data stays intact. Try Commander features, downgrade if needed - you're always in control.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base" style={{ color: '#1B365D' }}>
                  What's a "door"?
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  A "door" is an independent living unit with its own kitchen. Your single-family home = 1 door. A duplex = 2 doors. 
                  A 12-unit apartment building = 12 doors. This scales pricing fairly for investors while keeping it simple for homeowners.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base" style={{ color: '#1B365D' }}>
                  What happens to my data if I downgrade?
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Nothing! All your baseline systems, inspections, and history are preserved forever. If you exceed your new tier's limits, 
                  extra properties are archived (not deleted). Upgrade again to reactivate them instantly.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base" style={{ color: '#1B365D' }}>
                  When should I choose Elite over Commander?
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Elite makes sense at 80+ doors (saves money vs. Commander's variable pricing) OR if you need multi-user teams, 
                  custom reporting, and dedicated support. Great for property management companies managing client portfolios.
                </p>
              </div>

              <div>
                <h4 className="font-semibold mb-2 text-sm md:text-base" style={{ color: '#1B365D' }}>
                  What about professional services (HomeCare/PropertyCare)?
                </h4>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Professional service memberships include the Elite software tier FREE for one year. 
                  The software and physical labor are separate offerings. <Link to={createPageUrl("Services")} className="text-blue-600 underline">Learn more about professional services</Link>.
                </p>
              </div>
            </div>

            {/* Final Back to Pricing Button */}
            {currentTier !== 'best' && (
              <div className="mt-6 md:mt-8 text-center border-t pt-6">
                <p className="text-sm text-gray-700 mb-4">Ready to upgrade?</p>
                <Button
                  onClick={scrollToPricing}
                  className="gap-2 font-bold"
                  size="lg"
                  style={{ backgroundColor: '#28A745', minHeight: '56px' }}
                >
                  <ArrowUp className="w-5 h-5" />
                  View Plans & Start Upgrade
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
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
          billingCycle={billingCycle}
          isLoading={isChangingTier}
        />
      )}
    </div>
  );
}
