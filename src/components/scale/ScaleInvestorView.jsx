import { TrendingUp, DollarSign, Target, AlertTriangle, Building2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function ScaleInvestorView({ data }) {
  const { 
    portfolioSummary, 
    tenYearProjection, 
    propertyComparison, 
    capExPlanning,
    acquisitionOpportunity 
  } = data;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SCALE: Your Portfolio CFO</h1>
        <p className="text-gray-600">
          10-year wealth projections, hold/sell recommendations, acquisition opportunities
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              ${(portfolioSummary.totalValue / 1000).toFixed(0)}K
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {portfolioSummary.ltv}% LTV
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Net Equity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${(portfolioSummary.totalEquity / 1000).toFixed(0)}K
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {portfolioSummary.totalProperties} properties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Cash Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              ${portfolioSummary.netCashFlow.toLocaleString()}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Portfolio ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {portfolioSummary.annualizedROI}%
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {portfolioSummary.cashOnCashReturn}% CoC
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 10-Year Projection */}
      <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            10-Year Wealth Projection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Current Equity</div>
              <div className="text-3xl font-bold text-gray-900">
                ${(tenYearProjection.currentEquity / 1000).toFixed(0)}K
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Projected Equity 2034</div>
              <div className="text-3xl font-bold text-green-600">
                ${(tenYearProjection.projectedEquity2034 / 1000).toFixed(0)}K
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Wealth Gain</div>
              <div className="text-3xl font-bold text-blue-600">
                +${(tenYearProjection.wealthGain / 1000).toFixed(0)}K
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-sm text-gray-700">
            <p>
              <strong>Cash Flow:</strong> ${tenYearProjection.totalCashFlowDecade.toLocaleString()} over 10 years
            </p>
            <p className="mt-2 text-xs text-gray-600">
              Assumes {tenYearProjection.assumedAppreciation}% annual appreciation, 
              {tenYearProjection.assumedRentGrowth}% rent growth
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Property Comparison */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Performance Analysis</h2>
        
        <div className="space-y-4">
          {propertyComparison.map((prop, idx) => (
            <Card key={idx} className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{prop.property}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">Health:</span>
                        <Badge variant={prop.healthScore >= 85 ? 'default' : 'secondary'}>
                          {prop.healthScore}
                        </Badge>
                      </div>
                      <div>Equity: <span className="font-semibold">${(prop.equity / 1000).toFixed(0)}K</span></div>
                      <div>Cash Flow: <span className="font-semibold">${prop.cashFlow}/mo</span></div>
                      <div>ROI: <span className="font-semibold">{prop.roi}%</span></div>
                    </div>
                  </div>
                  
                  <Badge 
                    variant={prop.recommendation.startsWith('Hold') ? 'default' : 'secondary'}
                    className="text-base px-4 py-2"
                  >
                    {prop.recommendation.split(' - ')[0]}
                  </Badge>
                </div>
                
                <p className="text-gray-700 mb-2">{prop.recommendation.split(' - ')[1]}</p>
                <p className="text-sm text-gray-600">
                  <strong>Next:</strong> {prop.nextMajorExpense}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CapEx Planning */}
      <Card className="bg-orange-50 border-2 border-orange-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-orange-600" />
            Capital Expenditure Planning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm text-gray-600">Next 12 Months</div>
              <div className="text-3xl font-bold text-orange-600">
                ${(capExPlanning.next12Months / 1000).toFixed(1)}K
              </div>
            </div>
            
            <div>
              <div className="text-sm text-gray-600">Next 5 Years</div>
              <div className="text-3xl font-bold text-gray-900">
                ${(capExPlanning.next5Years / 1000).toFixed(0)}K
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            {capExPlanning.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3 text-sm">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.item}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-gray-600">{item.year}</div>
                  <div className="font-bold text-orange-600 min-w-[100px] text-right">
                    ${item.cost.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acquisition Opportunity */}
      <Card className="bg-purple-50 border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Acquisition Opportunity Detected
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-purple-800 mb-4">{acquisitionOpportunity.message}</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div>
              <div className="text-sm text-purple-700">Target Purchase Price</div>
              <div className="text-2xl font-bold text-purple-900">
                ${acquisitionOpportunity.potentialPurchasePrice.toLocaleString()}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-purple-700">Down Payment (20%)</div>
              <div className="text-2xl font-bold text-purple-900">
                ${acquisitionOpportunity.downPayment.toLocaleString()}
              </div>
            </div>
            
            <div>
              <div className="text-sm text-purple-700">Projected Cash Flow</div>
              <div className="text-2xl font-bold text-green-600">
                +${acquisitionOpportunity.projectedCashFlow}/mo
              </div>
            </div>
            
            <div>
              <div className="text-sm text-purple-700">New Portfolio ROI</div>
              <div className="text-2xl font-bold text-purple-900">
                {acquisitionOpportunity.newPortfolioROI}%
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 text-sm text-gray-700">
            <strong>💡 Recommendation:</strong> {acquisitionOpportunity.recommendation}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}