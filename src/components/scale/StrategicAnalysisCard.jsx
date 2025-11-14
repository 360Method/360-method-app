import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Download,
  Sparkles
} from "lucide-react";
import DisclaimerBox from "./DisclaimerBox";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function StrategicAnalysisCard({ recommendations, equityData, properties, selectedProperty }) {
  const [expandedRec, setExpandedRec] = useState(null);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const isPortfolioView = selectedProperty === 'all';

  // For single property view
  const singleEquity = !isPortfolioView && equityData.length > 0 ? equityData[0] : null;
  const singleProperty = !isPortfolioView ? properties.find(p => p.id === selectedProperty) : null;
  const singleRecommendation = !isPortfolioView && recommendations.length > 0 ? recommendations[0] : null;

  // Fetch PRESERVE recommendations for context
  const { data: preserveRecs = [] } = useQuery({
    queryKey: ['preserve-recs-for-analysis', selectedProperty],
    queryFn: () => selectedProperty && selectedProperty !== 'all'
      ? base44.entities.PreservationRecommendation.filter({ 
          property_id: selectedProperty,
          status: 'PENDING'
        })
      : Promise.resolve([]),
    enabled: !!selectedProperty && selectedProperty !== 'all'
  });

  // Generate AI recommendation
  const generateRecommendation = useMutation({
    mutationFn: async (propertyId) => {
      const equity = equityData.find(e => e.property_id === propertyId);
      const property = properties.find(p => p.id === propertyId);
      const preserveData = await base44.entities.PreservationRecommendation.filter({ 
        property_id: propertyId,
        status: 'PENDING'
      });

      const upcomingCapex = preserveData.reduce((sum, r) => sum + (r.estimated_cost_min || 0), 0);
      const criticalSystems = preserveData.filter(r => r.priority === 'URGENT').length;

      // Build AI prompt
      const prompt = `You are a portfolio CFO analyzing a real estate investment. Provide strategic recommendation.

PROPERTY DETAILS:
- Address: ${property.address}
- Type: ${equity.is_rental ? 'Rental Property' : 'Primary Residence'}
- Climate Zone: ${property.climate_zone || 'Zone 4: Pacific NW'}

FINANCIAL POSITION:
- Current Market Value: $${equity.current_market_value?.toLocaleString()}
- Mortgage Balance: $${equity.mortgage_balance?.toLocaleString()}
- Interest Rate: ${equity.mortgage_interest_rate}%
- Net Equity: $${equity.equity_dollars?.toLocaleString()} (${equity.equity_percentage?.toFixed(1)}%)
${equity.mortgage_payoff_date ? `- Payoff Date: ${new Date(equity.mortgage_payoff_date).toLocaleDateString()}` : ''}

${equity.is_rental ? `
RENTAL PERFORMANCE:
- Monthly Rent: $${equity.monthly_rent_income || 0}
- Monthly Expenses: $${equity.monthly_operating_expenses || 0}
- Monthly NOI: $${equity.monthly_noi || 0}
- Cap Rate: ${equity.cap_rate?.toFixed(1)}%
- Cash-on-Cash Return: ${equity.cash_on_cash_return?.toFixed(1)}%
` : ''}

PRESERVE STATUS:
- Upcoming System Replacements: $${upcomingCapex.toLocaleString()}
- Critical Systems: ${criticalSystems}
${preserveData.length > 0 ? `- Systems at Risk: ${preserveData.map(r => r.title).join(', ')}` : ''}

MARKET CONTEXT:
- Current 30-Year Rates: ~7.0% (estimate)
- Rate Differential: ${equity.mortgage_interest_rate ? (7.0 - equity.mortgage_interest_rate).toFixed(2) : 'N/A'}% higher than your rate

Provide strategic recommendation. Output JSON with:
1. recommendation: "HOLD" | "SELL" | "REFINANCE" | "HOLD_AND_PRESERVE" | "HOLD_AND_UPGRADE"
2. confidence_score: 1-10
3. reasoning_summary: Brief 2-3 sentence summary
4. pros: Array of 3-5 positive factors
5. cons: Array of 2-4 concerns
6. key_factors: Array of 5-7 decision factors
7. action_items: Object with immediate[], short_term[], long_term[] arrays
8. timeline: "Within X months/years"
9. risk_factors: Array of risks
10. tax_implications: Paragraph about tax considerations
11. market_conditions: Paragraph about current market

Be direct, data-driven, and actionable.`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        response_json_schema: {
          type: "object",
          properties: {
            recommendation: { type: "string" },
            confidence_score: { type: "number" },
            reasoning_summary: { type: "string" },
            pros: { type: "array", items: { type: "string" } },
            cons: { type: "array", items: { type: "string" } },
            key_factors: { type: "array", items: { type: "string" } },
            action_items: {
              type: "object",
              properties: {
                immediate: { type: "array", items: { type: "string" } },
                short_term: { type: "array", items: { type: "string" } },
                long_term: { type: "array", items: { type: "string" } }
              }
            },
            timeline: { type: "string" },
            risk_factors: { type: "array", items: { type: "string" } },
            tax_implications: { type: "string" },
            market_conditions: { type: "string" }
          }
        }
      });

      // Calculate sell proceeds
      const closingCostPct = 0.06;
      const grossProceeds = equity.current_market_value;
      const payoffMortgage = equity.total_debt;
      const closingCosts = grossProceeds * closingCostPct;
      const netProceeds = grossProceeds - payoffMortgage - closingCosts;
      const capitalGainsTax = equity.is_rental ? (grossProceeds - (equity.purchase_price || grossProceeds)) * 0.15 : 0;

      // Create recommendation record
      const recommendation = await base44.entities.StrategicRecommendation.create({
        property_id: propertyId,
        portfolio_equity_id: equity.id,
        recommendation: analysis.recommendation,
        confidence_score: analysis.confidence_score,
        reasoning_summary: analysis.reasoning_summary,
        pros: analysis.pros,
        cons: analysis.cons,
        key_factors: analysis.key_factors,
        sell_net_proceeds: netProceeds,
        sell_capital_gains_tax: capitalGainsTax,
        action_items: analysis.action_items,
        timeline: analysis.timeline,
        risk_factors: analysis.risk_factors,
        tax_implications: analysis.tax_implications,
        market_conditions: analysis.market_conditions,
        preserve_impact: upcomingCapex > 0 ? `${criticalSystems} critical systems need attention, $${upcomingCapex.toLocaleString()} investment required` : 'No urgent preservation needs',
        generated_date: new Date().toISOString(),
        ai_model_version: 'claude-sonnet-4',
        status: 'PENDING_REVIEW'
      });

      return recommendation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['strategic-recommendations']);
      setGenerating(false);
    }
  });

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case 'HOLD': return <Badge className="bg-green-600 text-white">HOLD</Badge>;
      case 'SELL': return <Badge className="bg-red-600 text-white">SELL</Badge>;
      case 'REFINANCE': return <Badge className="bg-blue-600 text-white">REFINANCE</Badge>;
      case 'HOLD_AND_PRESERVE': return <Badge className="bg-purple-600 text-white">HOLD & PRESERVE</Badge>;
      case 'HOLD_AND_UPGRADE': return <Badge className="bg-orange-600 text-white">HOLD & UPGRADE</Badge>;
      default: return null;
    }
  };

  // Single property view
  if (!isPortfolioView && singleProperty) {
    
    // No recommendation yet
    if (!singleRecommendation && !generating) {
      return (
        <div className="space-y-6">
          <Card className="border-2 border-purple-200">
            <CardContent className="p-12 text-center">
              <Target className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Generate Strategic Analysis</h3>
              <p className="text-gray-600 mb-6">
                Get AI-powered recommendations for {singleProperty.address}. Should you hold, sell, refinance, or optimize?
              </p>
              <Button
                onClick={() => {
                  setGenerating(true);
                  generateRecommendation.mutate(selectedProperty);
                }}
                disabled={!singleEquity || generateRecommendation.isLoading}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Analysis
              </Button>
            </CardContent>
          </Card>
          <DisclaimerBox />
        </div>
      );
    }

    // Generating
    if (generating || generateRecommendation.isLoading) {
      return (
        <Card className="border-2 border-purple-200">
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Analyzing Property...</h3>
            <p className="text-gray-600">
              AI is analyzing market data, equity position, preservation needs, and strategic factors...
            </p>
          </CardContent>
        </Card>
      );
    }

    // Show recommendation
    if (singleRecommendation) {
      const isExpanded = expandedRec === singleRecommendation.id;

      return (
        <div className="space-y-6">
          <Card className="border-2 border-purple-300">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 mb-2">
                    <Target className="w-6 h-6 text-purple-600" />
                    AI Strategic Analysis
                  </CardTitle>
                  <p className="text-sm text-gray-600">{singleProperty.address}</p>
                </div>
                <button
                  onClick={() => setExpandedRec(isExpanded ? null : singleRecommendation.id)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Recommendation */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">RECOMMENDATION</p>
                    {getRecommendationBadge(singleRecommendation.recommendation)}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Confidence</p>
                    <p className="text-2xl font-bold text-purple-700">
                      {singleRecommendation.confidence_score}/10
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mt-3">{singleRecommendation.reasoning_summary}</p>
              </div>

              {/* Pros & Cons */}
              <div className="grid md:grid-cols-2 gap-4">
                {singleRecommendation.pros && singleRecommendation.pros.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {singleRecommendation.pros.map((pro, idx) => (
                        <li key={idx} className="text-sm text-green-800">✓ {pro}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {singleRecommendation.cons && singleRecommendation.cons.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-900 mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Considerations
                    </h4>
                    <ul className="space-y-1">
                      {singleRecommendation.cons.map((con, idx) => (
                        <li key={idx} className="text-sm text-orange-800">⚠️ {con}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="space-y-4 pt-4 border-t">
                  
                  {/* Action Plan */}
                  {singleRecommendation.action_items && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">📋 ACTION PLAN</h4>
                      
                      {singleRecommendation.action_items.immediate?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-red-700 mb-2">IMMEDIATE (0-3 months):</p>
                          <ul className="space-y-1 ml-4">
                            {singleRecommendation.action_items.immediate.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700">{idx + 1}. {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {singleRecommendation.action_items.short_term?.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-semibold text-orange-700 mb-2">SHORT-TERM (1-2 years):</p>
                          <ul className="space-y-1 ml-4">
                            {singleRecommendation.action_items.short_term.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700">{idx + 1}. {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {singleRecommendation.action_items.long_term?.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-blue-700 mb-2">LONG-TERM (2-5 years):</p>
                          <ul className="space-y-1 ml-4">
                            {singleRecommendation.action_items.long_term.map((item, idx) => (
                              <li key={idx} className="text-sm text-gray-700">{idx + 1}. {item}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {preserveRecs.length > 0 && (
                        <div className="mt-4">
                          <Link to={createPageUrl('Preserve') + `?property=${selectedProperty}`}>
                            <Button variant="outline" size="sm">
                              View {preserveRecs.length} PRESERVE Recommendation{preserveRecs.length !== 1 ? 's' : ''} →
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sell Scenario */}
                  {singleRecommendation.sell_net_proceeds && (
                    <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                      <h4 className="font-semibold text-blue-900 mb-2">🚩 SELL SCENARIO</h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-blue-800">
                          Gross proceeds: <strong>${singleEquity.current_market_value?.toLocaleString()}</strong>
                        </p>
                        <p className="text-blue-800">
                          Payoff mortgage: <strong>-${singleEquity.total_debt?.toLocaleString()}</strong>
                        </p>
                        <p className="text-blue-800">
                          Closing costs (6%): <strong>-${(singleEquity.current_market_value * 0.06).toLocaleString()}</strong>
                        </p>
                        {singleRecommendation.sell_capital_gains_tax > 0 && (
                          <p className="text-blue-800">
                            Capital gains tax: <strong>-${singleRecommendation.sell_capital_gains_tax.toLocaleString()}</strong>
                          </p>
                        )}
                        <p className="text-blue-900 font-bold pt-2 border-t border-blue-200">
                          Net proceeds: ${singleRecommendation.sell_net_proceeds.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tax Implications */}
                  {singleRecommendation.tax_implications && (
                    <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
                      <h4 className="font-semibold text-yellow-900 mb-2">💼 Tax Implications</h4>
                      <p className="text-sm text-yellow-800">{singleRecommendation.tax_implications}</p>
                    </div>
                  )}

                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setExpandedRec(isExpanded ? null : singleRecommendation.id)}
                >
                  {isExpanded ? 'Hide Details' : 'Show Full Analysis'}
                </Button>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </Button>
                <Button
                  variant="outline"
                  onClick={() => generateRecommendation.mutate(selectedProperty)}
                  disabled={generateRecommendation.isLoading}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Analysis
                </Button>
              </div>

            </CardContent>
          </Card>

          <DisclaimerBox />
        </div>
      );
    }
  }

  // Portfolio view (multiple properties)
  if (isPortfolioView && recommendations.length > 0) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900 text-sm mb-1">Portfolio-Level Strategy</p>
                <p className="text-sm text-purple-800">
                  Review each property's strategic recommendation below. AI analyzes each property independently based on its unique financial position and market conditions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {recommendations.map((rec) => {
          const property = properties.find(p => p.id === rec.property_id);
          const equity = equityData.find(e => e.property_id === rec.property_id);
          const isExpanded = expandedRec === rec.id;

          return (
            <Card key={rec.id} className="border-2 border-gray-200">
              <CardHeader>
                <button
                  onClick={() => setExpandedRec(isExpanded ? null : rec.id)}
                  className="w-full flex items-start justify-between gap-3 text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {getRecommendationBadge(rec.recommendation)}
                      <Badge variant="outline">
                        Confidence: {rec.confidence_score}/10
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{property?.address || 'Unknown Property'}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{rec.reasoning_summary}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
              </CardHeader>

              {isExpanded && (
                <CardContent>
                  {/* Expanded details same as single view */}
                  <div className="space-y-4">
                    {rec.pros?.length > 0 && (
                      <div className="p-3 bg-green-50 rounded border-l-4 border-green-600">
                        <p className="font-semibold text-green-900 text-sm mb-2">✓ Strengths:</p>
                        <ul className="space-y-1">
                          {rec.pros.map((pro, idx) => (
                            <li key={idx} className="text-sm text-green-800">• {pro}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {rec.cons?.length > 0 && (
                      <div className="p-3 bg-orange-50 rounded border-l-4 border-orange-600">
                        <p className="font-semibold text-orange-900 text-sm mb-2">⚠️ Considerations:</p>
                        <ul className="space-y-1">
                          {rec.cons.map((con, idx) => (
                            <li key={idx} className="text-sm text-orange-800">• {con}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}

        <DisclaimerBox />
      </div>
    );
  }

  // Empty state
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Strategic Analysis Yet</h3>
          <p className="text-gray-600 mb-6">
            Generate AI-powered recommendations to understand if you should hold, sell, or refinance your properties.
          </p>
          {selectedProperty && selectedProperty !== 'all' && (
            <Button
              onClick={() => {
                setGenerating(true);
                generateRecommendation.mutate(selectedProperty);
              }}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Analysis
            </Button>
          )}
        </CardContent>
      </Card>
      <DisclaimerBox />
    </div>
  );
}