import React from 'react';
import { TrendingUp, DollarSign, Home, Lock, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from '@/utils';

// Demo data for each persona - different maintenance scenarios
const DEMO_MAINTENANCE_DATA = {
  struggling: {
    ytdMaintenance: 450,
    preventedCosts: 0,
    projection: {
      withoutMethod: 17000,
      withMethod: 2650,
      description: 'catching up on deferred maintenance'
    }
  },
  improving: {
    ytdMaintenance: 1200,
    preventedCosts: 4800,
    projection: {
      withoutMethod: 28000,
      withMethod: 8500,
      description: 'in planned maintenance'
    }
  },
  excellent: {
    ytdMaintenance: 2825,
    preventedCosts: 28600,
    projection: {
      withoutMethod: 62000,
      withMethod: 14000,
      description: 'in planned maintenance'
    }
  }
};

export default function ScaleSingleProperty({ property, systems = [], demoMode = false }) {
  const navigate = useNavigate();

  // Calculate projections
  const currentYear = new Date().getFullYear();
  const projectionYear = currentYear + 10;
  const annualAppreciation = 0.035; // 3.5%

  const currentValue = property.current_value || 340000;
  const mortgageBalance = property.mortgage_balance || 198000;
  const equity = currentValue - mortgageBalance;
  const monthlyMortgage = property.monthly_mortgage_payment || 1450;

  const projectedValue = Math.round(currentValue * Math.pow(1 + annualAppreciation, 10));
  const principalPaydown = monthlyMortgage * 0.25 * 120; // ~25% of payment is principal
  const projectedMortgage = Math.max(0, mortgageBalance - principalPaydown);
  const projectedEquity = projectedValue - projectedMortgage;
  const wealthGain = projectedEquity - equity;

  // Maintenance ROI (demo data varies by persona, or calculated for real users)
  const demoKey = typeof demoMode === 'string' ? demoMode : 'excellent';
  const demoMaintenanceData = DEMO_MAINTENANCE_DATA[demoKey] || DEMO_MAINTENANCE_DATA.excellent;

  const ytdMaintenance = demoMode ? demoMaintenanceData.ytdMaintenance : (property.total_maintenance_spent || 0);
  const preventedCosts = demoMode ? demoMaintenanceData.preventedCosts : (property.estimated_disasters_prevented || 0);
  const projectionData = demoMode ? demoMaintenanceData.projection : null;
  const netSavings = preventedCosts - ytdMaintenance;

  // Property health impact
  const healthScore = property.health_score || 84;
  const valuePremium = currentValue * 0.065; // 6.5% average premium for well-maintained homes
  const deferredMaintenanceSaved = currentValue * 0.125; // 12.5% average penalty avoided

  // HELOC/refinance opportunities
  const helocAvailable = equity * 0.7; // 70% of equity
  const cashOutRefi = equity * 0.5; // Conservative 50%

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Your Wealth Builder
        </h1>
        <p className="text-gray-600 text-lg">
          See how your home builds wealth over the next 10 years
        </p>
      </div>

      {/* Section 1: 10-Year Wealth Projection */}
      <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
            10-Year Wealth Projection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">Current Equity</div>
              <div className="text-3xl font-bold text-gray-900">
                ${Math.round(equity / 1000)}K
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {((equity / currentValue) * 100).toFixed(1)}% of home value
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">Projected Equity {projectionYear}</div>
              <div className="text-3xl font-bold text-green-600">
                ${Math.round(projectedEquity / 1000)}K
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {((projectedEquity / projectedValue) * 100).toFixed(1)}% of projected value
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-sm text-gray-600 mb-2">Wealth Gained</div>
              <div className="text-3xl font-bold text-blue-600">
                +${Math.round(wealthGain / 1000)}K
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Over {projectionYear - currentYear} years
              </div>
            </div>
          </div>

          {/* Breakdown */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Wealth Building Breakdown</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current home value:</span>
                <span className="font-semibold">${currentValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Projected value ({projectionYear}):</span>
                <span className="font-semibold text-green-600">
                  ${projectedValue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Appreciation gain:</span>
                <span className="font-semibold">
                  +${(projectedValue - currentValue).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="text-gray-600">Current mortgage:</span>
                <span className="font-semibold">${mortgageBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Projected mortgage ({projectionYear}):</span>
                <span className="font-semibold text-blue-600">
                  ${Math.round(projectedMortgage).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Principal pay-down:</span>
                <span className="font-semibold">
                  +${Math.round(principalPaydown).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-600">
            * Assumes {(annualAppreciation * 100).toFixed(1)}% annual appreciation (historical average for your area)
          </p>
        </CardContent>
      </Card>

      {/* Section 2: Maintenance ROI */}
      {(ytdMaintenance > 0 || preventedCosts > 0) && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-blue-600" />
              Maintenance ROI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">YTD Maintenance Spent</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${ytdMaintenance.toLocaleString()}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Disasters Prevented</div>
                <div className="text-2xl font-bold text-green-600">
                  ${preventedCosts.toLocaleString()}
                </div>
              </div>

              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Net Value Protected</div>
                <div className="text-2xl font-bold text-blue-600">
                  ${netSavings.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-blue-900 mb-3">5-Year Projection</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-blue-700 mb-1">Without 360° Method:</div>
                  <div className="text-2xl font-bold text-red-600">
                    ${(projectionData?.withoutMethod || 62000).toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600">in emergency repairs</div>
                </div>
                <div>
                  <div className="text-blue-700 mb-1">With 360° Method:</div>
                  <div className="text-2xl font-bold text-green-600">
                    ${(projectionData?.withMethod || 9250).toLocaleString()}
                  </div>
                  <div className="text-xs text-blue-600">
                    {projectionData?.description || 'in planned maintenance'}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-900">Your Advantage:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${((projectionData?.withoutMethod || 62000) - (projectionData?.withMethod || 9250)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section 3: Property Health Impact */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Home className="w-8 h-8 text-purple-600" />
            Property Health Impact on Value
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-700">Your Property Health Score:</span>
              <span className="text-4xl font-bold text-purple-600">{healthScore}/100</span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">✅ Well-maintained premium (80+ score):</span>
                <span className="font-semibold text-green-600">
                  +${Math.round(valuePremium / 1000)}K
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">⚠️ Deferred maintenance avoided:</span>
                <span className="font-semibold text-blue-600">
                  +${Math.round(deferredMaintenanceSaved / 1000)}K
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-900">Total Value Protection:</span>
                <span className="text-2xl font-bold text-purple-600">
                  ${Math.round((valuePremium + deferredMaintenanceSaved) / 1000)}K
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 text-sm text-gray-700">
            <strong>What this means:</strong> By maintaining a health score above 80, your home 
            will command a premium when you sell, while avoiding the massive penalties that come 
            with deferred maintenance. This ${Math.round((valuePremium + deferredMaintenanceSaved) / 1000)}K 
            advantage is locked in through systematic care.
          </div>
        </CardContent>
      </Card>

      {/* Section 4: Equity Access Opportunities */}
      <Card className="border-2 border-gray-300">
        <CardHeader>
          <CardTitle>Equity Access Opportunities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">Your Current Equity:</span>
                <span className="text-2xl font-bold text-green-600">${Math.round(equity / 1000)}K</span>
              </div>
              <p className="text-xs text-gray-600">
                {((equity / currentValue) * 100).toFixed(1)}% of home value
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💰 HELOC Access</h4>
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  ${Math.round(helocAvailable / 1000)}K
                </div>
                <p className="text-xs text-blue-700 mb-2">
                  Use for: Home improvements, debt consolidation, investments
                </p>
                <p className="text-xs text-blue-600">Current rates: 7.5-9.5%</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">🏠 Cash-Out Refinance</h4>
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  ${Math.round(cashOutRefi / 1000)}K
                </div>
                <p className="text-xs text-purple-700 mb-2">
                  Cash available while refinancing
                </p>
                <p className="text-xs text-purple-600">Current rates: ~6.75%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Portfolio Opportunity (Unlock Message) */}
      <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50">
        <CardContent className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Lock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready for Multiple Properties?</h2>
              <p className="text-gray-600">Unlock full Portfolio CFO features</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              💡 Portfolio Opportunity Detected
            </h3>
            <p className="text-gray-700 mb-4">
              Based on your equity position (${Math.round(equity / 1000)}K), 
              you have enough to acquire an investment property.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Your Available Equity:</div>
                <div className="text-2xl font-bold text-gray-900">
                  ${Math.round(equity / 1000)}K
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Down Payment Needed (20%):</div>
                <div className="text-2xl font-bold text-gray-900">$60K</div>
                <div className="text-xs text-gray-500 mt-1">For $300K investment property</div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-3">Add 2nd Property → Unlock:</h4>
              <ul className="space-y-1.5 text-sm text-blue-800">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Multi-property wealth projections
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Property comparison & performance analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  CapEx planning across portfolio
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Hold/sell/refinance recommendations
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Acquisition opportunity analysis
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-2">
                Example: Add $300K Investment Property
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                <div>
                  <div className="text-green-700">Monthly Rent:</div>
                  <div className="font-bold text-green-900">$2,100</div>
                </div>
                <div>
                  <div className="text-green-700">Cash Flow:</div>
                  <div className="font-bold text-green-900">+$450/mo</div>
                </div>
              </div>
              <div className="pt-3 border-t border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-green-800 font-semibold">10-Year Portfolio Value:</span>
                  <span className="text-2xl font-bold text-green-600">$895K</span>
                </div>
              </div>
            </div>
          </div>

          <Button
            onClick={() => navigate('/Signup?source=scale-upgrade')}
            className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white py-6 text-lg font-bold"
          >
            <Plus className="w-6 h-6 mr-2" />
            Upgrade for Portfolio Features
          </Button>

          {demoMode && (
            <div className="mt-4 text-center">
              <button
                onClick={() => {
                  window.location.href = '/?demo=investor';
                }}
                className="text-orange-700 hover:text-orange-800 text-sm font-semibold underline flex items-center justify-center gap-1 mx-auto"
              >
                Or explore the Investor Demo (3-property portfolio)
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}