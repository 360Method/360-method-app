import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Calculator, 
  TrendingUp, 
  Sparkles, 
  DollarSign,
  Shield,
  Home,
  CreditCard,
  PieChart,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import DisclaimerBox from "./DisclaimerBox";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function CapitalAllocationRanker({ capitalAllocations, properties }) {
  const [availableAmount, setAvailableAmount] = useState(25000);
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => base44.auth.me()
  });

  const { data: preserveRecs = [] } = useQuery({
    queryKey: ['preserve-recs-all'],
    queryFn: () => base44.entities.PreservationRecommendation.filter({ status: 'PENDING' })
  });

  const { data: upgrades = [] } = useQuery({
    queryKey: ['upgrades-planned'],
    queryFn: () => base44.entities.Upgrade.filter({ status: 'PLANNED' })
  });

  const { data: equities = [] } = useQuery({
    queryKey: ['all-equities'],
    queryFn: () => base44.entities.PortfolioEquity.list()
  });

  // Generate allocation
  const generateAllocation = useMutation({
    mutationFn: async (amount) => {
      const options = [];

      // Add PRESERVE options
      for (const rec of preserveRecs) {
        const property = properties.find(p => p.id === rec.property_id);
        const urgencyScore = rec.priority === 'URGENT' ? 10 : rec.priority === 'RECOMMENDED' ? 7 : 4;
        
        options.push({
          rank: null,
          type: 'PRESERVE',
          property_id: rec.property_id,
          title: `${rec.title} (${property?.address || 'Property'})`,
          amount: rec.estimated_cost_min,
          expected_return_pct: rec.roi_multiple * 100,
          return_type: 'Prevents Replacement',
          financial_benefit: rec.estimated_cost_max * rec.roi_multiple,
          strategic_value: `Extends system life by ${rec.expected_lifespan_extension_years} years`,
          risk: 'LOW',
          liquidity_impact: 'N/A',
          timeline: rec.recommended_deadline || 'Next 6 months',
          urgency_score: urgencyScore,
          roi_score: rec.roi_multiple,
          ai_strength: rec.priority === 'URGENT' ? 'CRITICAL' : 'RECOMMENDED',
          composite_score: 0
        });
      }

      // Add UPGRADE options
      for (const upgrade of upgrades) {
        const property = properties.find(p => p.id === upgrade.property_id);
        const roiMultiple = (upgrade.property_value_impact || 0) / (upgrade.investment_required || 1);
        
        options.push({
          rank: null,
          type: 'UPGRADE',
          property_id: upgrade.property_id,
          title: `${upgrade.title} (${property?.address || 'Property'})`,
          amount: upgrade.investment_required,
          expected_return_pct: (roiMultiple - 1) * 100,
          return_type: 'Value Add',
          financial_benefit: upgrade.property_value_impact,
          strategic_value: 'Improves resale appeal and functionality',
          risk: 'MEDIUM',
          liquidity_impact: 'N/A',
          timeline: 'Flexible (1-2 years)',
          urgency_score: 3,
          roi_score: roiMultiple,
          ai_strength: roiMultiple > 1.5 ? 'RECOMMENDED' : 'OPTIONAL',
          composite_score: 0
        });
      }

      // Add mortgage paydown options
      for (const equity of equities) {
        if (equity.mortgage_balance > 0) {
          const property = properties.find(p => p.id === equity.property_id);
          const paydownAmount = Math.min(amount, equity.mortgage_balance);
          
          options.push({
            rank: null,
            type: 'MORTGAGE_PAYDOWN',
            property_id: equity.property_id,
            title: `Extra Principal Payment (${property?.address || 'Property'})`,
            amount: paydownAmount,
            expected_return_pct: equity.mortgage_interest_rate,
            return_type: 'Guaranteed Interest Savings',
            financial_benefit: paydownAmount * (equity.mortgage_interest_rate / 100),
            strategic_value: 'Reduces debt, improves equity position',
            risk: 'NONE',
            liquidity_impact: 'LOW',
            timeline: 'Anytime',
            urgency_score: equity.mortgage_interest_rate > 6 ? 8 : 5,
            roi_score: equity.mortgage_interest_rate / 100,
            ai_strength: equity.mortgage_interest_rate > 6 ? 'STRONG' : 'MODERATE',
            composite_score: 0
          });
        }
      }

      // Add market investment
      options.push({
        rank: null,
        type: 'MARKET_INVESTMENT',
        title: 'S&P 500 Index Fund',
        amount: amount,
        expected_return_pct: 10.0,
        return_type: 'Capital Appreciation + Dividends',
        financial_benefit: amount * (Math.pow(1.10, 10) - 1),
        strategic_value: 'Diversification, high liquidity, passive management',
        risk: 'MEDIUM',
        liquidity_impact: 'HIGH',
        timeline: 'Long-term (10+ years)',
        urgency_score: 1,
        roi_score: 1.10,
        ai_strength: 'CONSIDER',
        composite_score: 0
      });

      // Calculate composite scores
      for (const option of options) {
        const strengthScore = option.ai_strength === 'CRITICAL' ? 1 : 
                             option.ai_strength === 'STRONG' ? 0.85 :
                             option.ai_strength === 'RECOMMENDED' ? 0.7 : 0.4;
        
        option.composite_score = 
          (option.urgency_score / 10 * 0.4) +
          (Math.min(option.roi_score / 10, 1) * 0.4) +
          (strengthScore * 0.2);
      }

      // Sort and rank
      options.sort((a, b) => b.composite_score - a.composite_score);
      options.forEach((opt, idx) => opt.rank = idx + 1);

      // Generate AI optimal allocation
      const allocation = [];
      let remaining = amount;

      // Priority 1: CRITICAL items
      for (const opt of options.filter(o => o.ai_strength === 'CRITICAL')) {
        if (remaining >= opt.amount) {
          allocation.push({
            option_rank: opt.rank,
            option_title: opt.title,
            amount: opt.amount,
            reason: 'Critical system protection',
            allocation_pct: (opt.amount / amount) * 100
          });
          remaining -= opt.amount;
        }
      }

      // Priority 2: High ROI
      for (const opt of options.filter(o => o.roi_score > 5 && o.ai_strength !== 'CRITICAL')) {
        if (remaining >= opt.amount && !allocation.find(a => a.option_rank === opt.rank)) {
          allocation.push({
            option_rank: opt.rank,
            option_title: opt.title,
            amount: opt.amount,
            reason: `High ROI (${opt.roi_score.toFixed(1)}x)`,
            allocation_pct: (opt.amount / amount) * 100
          });
          remaining -= opt.amount;
        }
      }

      // Priority 3: Liquidity
      if (remaining > 5000) {
        const marketOpt = options.find(o => o.type === 'MARKET_INVESTMENT');
        if (marketOpt) {
          allocation.push({
            option_rank: marketOpt.rank,
            option_title: marketOpt.title,
            amount: remaining,
            reason: 'Maintain liquidity and diversification',
            allocation_pct: (remaining / amount) * 100
          });
        }
      }

      return await base44.entities.CapitalAllocation.create({
        available_amount: amount,
        allocation_options: options,
        ai_optimal_allocation: {
          allocation: allocation,
          total_allocated: amount - remaining,
          unallocated: remaining,
          strategy_summary: `Balanced strategy across ${allocation.length} investments`
        },
        analysis_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['capital-allocations']);
      setGenerating(false);
    }
  });

  const latestAllocation = capitalAllocations[0];

  return (
    <div className="space-y-6">
      
      {/* Amount Input */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-purple-600" />
            Capital Allocation Optimizer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                💰 Available Capital
              </label>
              <div className="flex gap-3">
                <Input
                  type="number"
                  value={availableAmount}
                  onChange={(e) => setAvailableAmount(parseInt(e.target.value) || 0)}
                  className="text-2xl font-bold"
                  style={{ minHeight: '56px' }}
                />
                <Button
                  onClick={() => {
                    setGenerating(true);
                    generateAllocation.mutate(availableAmount);
                  }}
                  disabled={generating || generateAllocation.isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                  style={{ minHeight: '56px' }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Enter the amount you have available to invest, and AI will rank your best options by ROI, urgency, and strategic value.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Generating State */}
      {generating && (
        <Card>
          <CardContent className="p-12 text-center">
            <RefreshCw className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-spin" />
            <h3 className="text-xl font-semibold mb-2">Analyzing Investment Options...</h3>
            <p className="text-gray-600">
              Ranking opportunities from PRESERVE, UPGRADE, debt reduction, and market alternatives...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Show Results */}
      {!generating && latestAllocation && latestAllocation.allocation_options && (
        <>
          {/* AI Optimal Allocation */}
          {latestAllocation.ai_optimal_allocation && (
            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-green-600" />
                  AI Optimal Allocation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {latestAllocation.ai_optimal_allocation.allocation?.map((alloc, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-lg border flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{alloc.option_title}</p>
                        <p className="text-xs text-gray-600 mt-1">{alloc.reason}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700">${alloc.amount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">{alloc.allocation_pct?.toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}

                  <div className="p-4 bg-green-100 rounded-lg border-2 border-green-300 mt-4">
                    <p className="font-semibold text-green-900">
                      {latestAllocation.ai_optimal_allocation.strategy_summary}
                    </p>
                    <p className="text-sm text-green-800 mt-2">
                      Total Allocated: ${latestAllocation.ai_optimal_allocation.total_allocated?.toLocaleString()}
                      {latestAllocation.ai_optimal_allocation.unallocated > 0 && (
                        <span> | Remaining: ${latestAllocation.ai_optimal_allocation.unallocated?.toLocaleString()}</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ranked Options */}
          <Card>
            <CardHeader>
              <CardTitle>🤖 All Options Ranked by Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {latestAllocation.allocation_options.slice(0, 5).map((option) => {
                  const getTypeIcon = () => {
                    switch (option.type) {
                      case 'PRESERVE': return <Shield className="w-5 h-5 text-blue-600" />;
                      case 'UPGRADE': return <Home className="w-5 h-5 text-green-600" />;
                      case 'MORTGAGE_PAYDOWN': return <CreditCard className="w-5 h-5 text-orange-600" />;
                      case 'MARKET_INVESTMENT': return <TrendingUp className="w-5 h-5 text-purple-600" />;
                      default: return <DollarSign className="w-5 h-5 text-gray-600" />;
                    }
                  };

                  const getStrengthBadge = () => {
                    switch (option.ai_strength) {
                      case 'CRITICAL': return <Badge className="bg-red-600 text-white text-xs">🔥 CRITICAL</Badge>;
                      case 'STRONG': return <Badge className="bg-orange-600 text-white text-xs">⚡ STRONG</Badge>;
                      case 'RECOMMENDED': return <Badge className="bg-blue-600 text-white text-xs">✓ RECOMMENDED</Badge>;
                      default: return <Badge variant="outline" className="text-xs">Consider</Badge>;
                    }
                  };

                  return (
                    <Card key={option.rank} className="border-2 border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 font-bold text-purple-700">
                            {option.rank}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              {getTypeIcon()}
                              {getStrengthBadge()}
                              <Badge variant="outline" className="text-xs">
                                {option.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="font-semibold text-gray-900 mb-1">{option.title}</p>
                            
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <div>
                                <p className="text-xs text-gray-600">Investment</p>
                                <p className="font-bold text-blue-700">${option.amount?.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Return</p>
                                <p className="font-bold text-green-700">{option.expected_return_pct?.toFixed(0)}%</p>
                              </div>
                            </div>

                            <p className="text-xs text-gray-600 mt-2">{option.strategic_value}</p>

                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">Risk: {option.risk}</Badge>
                              <Badge variant="outline" className="text-xs">{option.timeline}</Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {latestAllocation.allocation_options.length > 5 && (
                  <p className="text-sm text-gray-600 text-center">
                    +{latestAllocation.allocation_options.length - 5} more options available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!generating && !latestAllocation && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Capital Allocation Tool</h3>
            <p className="text-gray-600 mb-6">
              Enter an amount above and click "Analyze" to see ranked investment options based on ROI, urgency, and strategic value.
            </p>
          </CardContent>
        </Card>
      )}

      <DisclaimerBox />
    </div>
  );
}