import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Upgrade, integrations } from '@/api/supabaseClient';
import { DollarSign, TrendingUp, AlertTriangle, Edit, Save, X, Sparkles, RefreshCw, Lightbulb, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AICostDisclaimer from '../shared/AICostDisclaimer';

export default function BudgetTrackingView({ project, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [budgetData, setBudgetData] = useState({
    materials: project.actual_costs?.materials || 0,
    labor: project.actual_costs?.labor || 0,
    permits: project.actual_costs?.permits || 0,
    other: project.actual_costs?.other || 0
  });

  const queryClient = useQueryClient();

  // Parse budget_analysis from project's ai_guidance field
  let budgetAnalysis = null;
  if (project.ai_guidance) {
    let guidance = project.ai_guidance;
    if (typeof guidance === 'string') {
      try {
        guidance = JSON.parse(guidance);
      } catch (e) {
        console.error('Failed to parse ai_guidance:', e);
      }
    }
    if (guidance?.budget_analysis) {
      budgetAnalysis = guidance.budget_analysis;
    }
  }

  // AI Budget Analysis mutation
  const analyzebudgetMutation = useMutation({
    mutationFn: async () => {
      setIsAnalyzing(true);

      const estimatedTotal = project.investment_required || 0;
      const actualTotal = Object.values(budgetData).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      const variance = actualTotal - estimatedTotal;
      const variancePercent = estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0;

      const result = await integrations.InvokeLLM({
        prompt: `You are an expert home renovation budget analyst. Analyze this project's budget and provide insights:

Project: ${project.title}
Category: ${project.category}
Description: ${project.description || 'No description'}

BUDGET DATA:
- Estimated Total: $${estimatedTotal.toLocaleString()}
- Actual Spent: $${actualTotal.toLocaleString()}
- Variance: ${variance > 0 ? '+' : ''}$${variance.toLocaleString()} (${variancePercent.toFixed(1)}%)

BREAKDOWN:
- Materials: Estimated $${(project.budget_breakdown?.materials || estimatedTotal * 0.6).toLocaleString()}, Actual $${budgetData.materials}
- Labor: Estimated $${(project.budget_breakdown?.labor || estimatedTotal * 0.3).toLocaleString()}, Actual $${budgetData.labor}
- Permits: Estimated $${(project.budget_breakdown?.permits || estimatedTotal * 0.05).toLocaleString()}, Actual $${budgetData.permits}
- Other: Estimated $${(project.budget_breakdown?.contingency || estimatedTotal * 0.05).toLocaleString()}, Actual $${budgetData.other}

Provide:
1. A projected final cost based on current spending patterns
2. 3 specific insights about the budget (why over/under, what's driving costs)
3. 3 actionable recommendations to optimize spending
4. A budget health score from 1-10

Format as JSON with keys: projected_final_cost (number), insights (array of strings), recommendations (array of strings), health_score (number 1-10), health_summary (string)`,
        response_json_schema: {
          type: "object",
          properties: {
            projected_final_cost: { type: "number" },
            insights: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            health_score: { type: "number" },
            health_summary: { type: "string" }
          }
        }
      });

      return result;
    },
    onSuccess: async (result) => {
      if (!result || !result.insights) {
        alert('AI returned an unexpected format. Please try again.');
        setIsAnalyzing(false);
        return;
      }

      // Parse existing ai_guidance to preserve other data
      let existingGuidance = {};
      if (project.ai_guidance) {
        if (typeof project.ai_guidance === 'string') {
          try {
            existingGuidance = JSON.parse(project.ai_guidance);
          } catch (e) {
            existingGuidance = {};
          }
        } else {
          existingGuidance = project.ai_guidance;
        }
      }

      // Save budget_analysis inside ai_guidance field
      await Upgrade.update(project.id, {
        ai_guidance: {
          ...existingGuidance,
          budget_analysis: {
            ...result,
            analyzed_at: new Date().toISOString()
          }
        }
      });

      await queryClient.invalidateQueries({ queryKey: ['upgrade', project.id] });
      await queryClient.refetchQueries({ queryKey: ['upgrade', project.id] });
      setIsAnalyzing(false);
      onUpdate?.();
    },
    onError: (error) => {
      console.error('Budget analysis failed:', error);
      setIsAnalyzing(false);
      alert('Failed to analyze budget. Please try again.');
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data) => Upgrade.update(project.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upgrade', project.id] });
      setIsEditing(false);
      onUpdate?.();
    },
  });

  const estimatedTotal = project.investment_required || 0;
  const actualTotal = Object.values(budgetData).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const variance = actualTotal - estimatedTotal;
  const variancePercent = estimatedTotal > 0 ? (variance / estimatedTotal) * 100 : 0;

  const estimatedBreakdown = project.budget_breakdown || {
    materials: estimatedTotal * 0.6,
    labor: estimatedTotal * 0.3,
    permits: estimatedTotal * 0.05,
    contingency: estimatedTotal * 0.05
  };

  const handleSave = () => {
    updateMutation.mutate({
      actual_costs: budgetData,
      actual_cost: actualTotal
    });
  };

  const handleCancel = () => {
    setBudgetData({
      materials: project.actual_costs?.materials || 0,
      labor: project.actual_costs?.labor || 0,
      permits: project.actual_costs?.permits || 0,
      other: project.actual_costs?.other || 0
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      
      {/* AI Disclaimer */}
      <AICostDisclaimer variant="default" />

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-2 border-blue-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-700 font-semibold">Estimated Budget</p>
            </div>
            <p className="text-3xl font-bold text-blue-900">
              ${estimatedTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-2 border-purple-300">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-purple-700 font-semibold">Actual Spent</p>
            </div>
            <p className="text-3xl font-bold text-purple-900">
              ${actualTotal.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card className={`border-2 ${
          variance > 0 
            ? 'bg-red-50 border-red-300' 
            : variance < 0
            ? 'bg-green-50 border-green-300'
            : 'bg-gray-50 border-gray-300'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className={`w-5 h-5 ${variance > 0 ? 'text-red-600' : 'text-green-600'}`} />
              <p className="text-sm font-semibold">
                {variance > 0 ? 'Over Budget' : variance < 0 ? 'Under Budget' : 'On Budget'}
              </p>
            </div>
            <p className={`text-3xl font-bold ${
              variance > 0 ? 'text-red-900' : variance < 0 ? 'text-green-900' : 'text-gray-900'
            }`}>
              {variance > 0 ? '+' : ''}${Math.abs(variance).toLocaleString()}
            </p>
            <p className="text-sm mt-1 text-gray-600">
              ({variancePercent > 0 ? '+' : ''}{variancePercent.toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cost Breakdown</CardTitle>
            {!isEditing ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                style={{ minHeight: '40px' }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Update Costs
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  style={{ minHeight: '40px' }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={updateMutation.isPending}
                  style={{ minHeight: '40px' }}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Estimated</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Actual</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-700">Variance</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { key: 'materials', label: '🛠️ Materials' },
                  { key: 'labor', label: '👷 Labor' },
                  { key: 'permits', label: '📋 Permits & Fees' },
                  { key: 'other', label: '📦 Other' }
                ].map(({ key, label }) => {
                  const est = estimatedBreakdown[key] || 0;
                  const act = parseFloat(budgetData[key]) || 0;
                  const diff = act - est;
                  
                  return (
                    <tr key={key} className="border-b border-gray-100">
                      <td className="py-3 font-medium">{label}</td>
                      <td className="text-right text-gray-600">${est.toLocaleString()}</td>
                      <td className="text-right">
                        {isEditing ? (
                          <Input
                            type="number"
                            value={budgetData[key]}
                            onChange={(e) => setBudgetData({ ...budgetData, [key]: e.target.value })}
                            className="w-32 text-right ml-auto"
                            min="0"
                            step="100"
                          />
                        ) : (
                          <span className="font-semibold">${act.toLocaleString()}</span>
                        )}
                      </td>
                      <td className={`text-right font-semibold ${
                        diff > 0 ? 'text-red-600' : diff < 0 ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {diff > 0 ? '+' : ''}${diff.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
                
                {/* Total Row */}
                <tr className="border-t-2 border-gray-300 font-bold">
                  <td className="py-3">TOTAL</td>
                  <td className="text-right">${estimatedTotal.toLocaleString()}</td>
                  <td className="text-right">${actualTotal.toLocaleString()}</td>
                  <td className={`text-right ${
                    variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-900'
                  }`}>
                    {variance > 0 ? '+' : ''}${variance.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Budget Health Indicator */}
          <div className={`mt-6 p-4 rounded-lg border-2 ${
            Math.abs(variancePercent) < 5
              ? 'bg-green-50 border-green-300'
              : Math.abs(variancePercent) < 15
              ? 'bg-yellow-50 border-yellow-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <p className="text-sm font-semibold mb-1">
              {Math.abs(variancePercent) < 5
                ? '✅ On Track: Budget variance within acceptable range'
                : Math.abs(variancePercent) < 15
                ? '⚠️ Watch: Budget variance increasing'
                : '🚨 Alert: Significant budget variance'}
            </p>
            <p className="text-xs text-gray-700">
              Industry standard allows for 10-15% variance on renovation projects.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* AI Budget Intelligence */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              AI Budget Intelligence
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => analyzebudgetMutation.mutate()}
              disabled={isAnalyzing}
              style={{ minHeight: '40px' }}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {budgetAnalysis ? 'Re-Analyze' : 'Analyze Budget'}
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!budgetAnalysis ? (
            <div className="text-center py-6">
              <Target className="w-12 h-12 text-blue-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Get AI-powered insights on your budget</p>
              <p className="text-sm text-gray-500">
                Analyze spending patterns, predict final costs, and get recommendations
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Health Score */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${
                  budgetAnalysis.health_score >= 8 ? 'bg-green-500' :
                  budgetAnalysis.health_score >= 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  {budgetAnalysis.health_score}/10
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Budget Health Score</p>
                  <p className="text-sm text-gray-600">{budgetAnalysis.health_summary}</p>
                </div>
              </div>

              {/* Projected Final Cost */}
              {budgetAnalysis.projected_final_cost && (
                <div className="p-4 bg-purple-100 rounded-lg border border-purple-300">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-purple-600" />
                    <p className="text-sm font-semibold text-purple-700">Projected Final Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-900">
                    ${budgetAnalysis.projected_final_cost.toLocaleString()}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    Based on current spending patterns
                  </p>
                </div>
              )}

              {/* Insights */}
              {budgetAnalysis.insights && budgetAnalysis.insights.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <p className="font-semibold text-gray-900">Key Insights</p>
                  </div>
                  <ul className="space-y-2">
                    {budgetAnalysis.insights.map((insight, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                        <span className="text-amber-500 font-bold">{index + 1}.</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {budgetAnalysis.recommendations && budgetAnalysis.recommendations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <p className="font-semibold text-gray-900">Recommendations</p>
                  </div>
                  <ul className="space-y-2">
                    {budgetAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                        <span className="text-green-500">✓</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Analysis timestamp */}
              {budgetAnalysis.analyzed_at && (
                <p className="text-xs text-gray-400 text-right">
                  Last analyzed: {new Date(budgetAnalysis.analyzed_at).toLocaleString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}