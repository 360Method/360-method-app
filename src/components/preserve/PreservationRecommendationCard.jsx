import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  ChevronDown, 
  ChevronRight, 
  TrendingUp, 
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Shield
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function PreservationRecommendationCard({ recommendation, systems, property }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const system = systems.find(s => s.id === recommendation.system_id);

  const approveMutation = useMutation({
    mutationFn: async () => {
      const currentUser = await base44.auth.me();
      
      // Update recommendation status
      await base44.entities.PreservationRecommendation.update(recommendation.id, {
        status: 'APPROVED',
        decision_date: new Date().toISOString(),
        decision_by_user_id: currentUser.id
      });

      // Create maintenance task
      const avgCost = (recommendation.estimated_cost_min + recommendation.estimated_cost_max) / 2;
      const systemName = system?.system_type || 'Unknown System';
      
      const task = await base44.entities.MaintenanceTask.create({
        property_id: recommendation.property_id,
        title: recommendation.title,
        description: `${recommendation.description}\n\n🛡️ PRESERVATION INVESTMENT:\nExtend ${systemName} life by ${recommendation.expected_lifespan_extension_years} years\nAvoid replacement cost: $${system?.replacement_cost_estimate?.toLocaleString() || 'TBD'}\nExpected ROI: ${recommendation.roi_multiple.toFixed(1)}x\n\nThis strategic intervention protects your capital investment.`,
        system_type: systemName.split(' - ')[0] || 'General',
        source: 'PRESERVATION_RECOMMENDATION',
        preservation_recommendation_id: recommendation.id,
        priority: recommendation.priority === 'URGENT' ? 'High' : 'Medium',
        current_fix_cost: avgCost,
        contractor_cost: recommendation.estimated_cost_max,
        status: 'Identified'
      });

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['preservation-recommendations']);
      queryClient.invalidateQueries(['maintenance-tasks']);
      // Navigate to ACT module
      navigate(createPageUrl('Prioritize'));
    }
  });

  const deferMutation = useMutation({
    mutationFn: () => base44.entities.PreservationRecommendation.update(recommendation.id, {
      status: 'DEFERRED',
      decision_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['preservation-recommendations']);
    }
  });

  const dismissMutation = useMutation({
    mutationFn: () => base44.entities.PreservationRecommendation.update(recommendation.id, {
      status: 'DISMISSED',
      decision_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['preservation-recommendations']);
    }
  });

  const getPriorityColor = () => {
    switch (recommendation.priority) {
      case 'URGENT': return 'border-red-300 bg-red-50';
      case 'RECOMMENDED': return 'border-orange-300 bg-orange-50';
      case 'OPTIONAL': return 'border-blue-300 bg-blue-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityBadge = () => {
    switch (recommendation.priority) {
      case 'URGENT': return <Badge className="bg-red-600 text-white">🔥 URGENT</Badge>;
      case 'RECOMMENDED': return <Badge className="bg-orange-600 text-white">⚡ RECOMMENDED</Badge>;
      case 'OPTIONAL': return <Badge className="bg-blue-600 text-white">💰 OPTIONAL</Badge>;
      default: return null;
    }
  };

  const avgCost = (recommendation.estimated_cost_min + recommendation.estimated_cost_max) / 2;
  const replacementCost = system?.replacement_cost_estimate || 0;
  const netSavings = replacementCost - avgCost;

  // Calculate system age details
  const currentYear = new Date().getFullYear();
  const systemAge = system?.installation_year ? currentYear - system.installation_year : 0;
  const totalLifespan = (system?.estimated_lifespan_years || 0) + (system?.lifespan_extension_total_years || 0);

  return (
    <Card className={`border-2 ${getPriorityColor()}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {getPriorityBadge()}
              <Badge variant="outline" className="text-xs">
                {recommendation.intervention_type}
              </Badge>
              {system && (
                <Badge variant="outline" className="text-xs">
                  Age {systemAge} of {totalLifespan} years
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">
              {system?.system_type || 'Unknown System'}
              {system?.nickname && ` - ${system.nickname}`}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1 font-medium">{recommendation.title}</p>
            {system?.condition && (
              <p className="text-xs text-gray-500 mt-1">Current condition: {system.condition}</p>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 hover:bg-white/50 rounded transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {/* ROI-Focused Summary */}
        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-green-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">💰 Investment</p>
              <p className="font-bold text-lg text-blue-700">
                ${recommendation.estimated_cost_min.toLocaleString()} - ${recommendation.estimated_cost_max.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">🛡️ Replacement Avoided</p>
              <p className="font-bold text-lg text-green-700">
                ${replacementCost.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-xs text-gray-600">Life Extended</p>
              <p className="font-bold text-green-700">+{recommendation.expected_lifespan_extension_years} yrs</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">ROI Multiple</p>
              <p className="font-bold text-purple-700">{recommendation.roi_multiple.toFixed(1)}x</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">Net Savings</p>
              <p className="font-bold text-green-700">${netSavings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Timing & Deadline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {recommendation.recommended_deadline && (
            <div className="p-3 bg-white rounded border">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-orange-600" />
                <p className="text-xs text-gray-600 font-semibold">Decision Deadline</p>
              </div>
              <p className="text-sm font-medium">
                {new Date(recommendation.recommended_deadline).toLocaleDateString()}
              </p>
            </div>
          )}
          {recommendation.optimal_timing && (
            <div className="p-3 bg-white rounded border">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-blue-600" />
                <p className="text-xs text-gray-600 font-semibold">Optimal Timing</p>
              </div>
              <p className="text-sm">{recommendation.optimal_timing}</p>
            </div>
          )}
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t">
            
            {/* What's Included */}
            <div>
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                What This Involves:
              </h4>
              <p className="text-sm text-gray-700 bg-white p-3 rounded border">{recommendation.description}</p>
            </div>

            {/* Risk if Delayed */}
            {recommendation.risk_if_delayed && (
              <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-red-900 mb-1">⚠️ Risk if Delayed:</h4>
                    <p className="text-sm text-red-800">{recommendation.risk_if_delayed}</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            {recommendation.reasoning && (
              <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900 mb-1">🤖 AI Analysis:</h4>
                    <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payback Calculation */}
            {recommendation.payback_calculation && (
              <div className="bg-green-50 border-l-4 border-green-600 p-3 rounded">
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-green-900 mb-1">💡 Financial Breakdown:</h4>
                    <p className="text-sm text-green-800">{recommendation.payback_calculation}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Alternative Options */}
            {recommendation.alternative_options && recommendation.alternative_options.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Alternative Options:</h4>
                <div className="space-y-2">
                  {recommendation.alternative_options.map((alt, idx) => (
                    <div key={idx} className="p-3 bg-white border rounded">
                      <p className="font-semibold text-sm">{alt.option}</p>
                      {alt.cost && (
                        <p className="text-xs text-gray-600 mt-1">Cost: ${alt.cost?.toLocaleString()}</p>
                      )}
                      <p className="text-xs text-gray-700 mt-1">{alt.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Climate Consideration */}
            {property?.climate_zone && recommendation.optimal_timing && (
              <div className="p-3 bg-blue-50 rounded border border-blue-200">
                <p className="text-xs font-semibold text-blue-900 mb-1">
                  🌤️ Climate Consideration ({property.climate_zone}):
                </p>
                <p className="text-xs text-blue-800">
                  Timing optimized for your region's weather patterns and seasonal conditions.
                </p>
              </div>
            )}

          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <Button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isLoading}
            className="bg-green-600 hover:bg-green-700 gap-2 flex-1 md:flex-none"
            style={{ minHeight: '44px' }}
          >
            <CheckCircle2 className="w-4 h-4" />
            Get Operator Quote
          </Button>
          <Button
            variant="outline"
            onClick={() => setExpanded(!expanded)}
            style={{ minHeight: '44px' }}
          >
            {expanded ? 'Hide Details' : 'Learn More'}
          </Button>
          {recommendation.priority !== 'URGENT' && (
            <Button
              variant="outline"
              onClick={() => deferMutation.mutate()}
              disabled={deferMutation.isLoading}
              style={{ minHeight: '44px' }}
            >
              Defer
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => dismissMutation.mutate()}
            disabled={dismissMutation.isLoading}
            className="text-red-600 hover:text-red-700"
            style={{ minHeight: '44px' }}
          >
            <XCircle className="w-4 h-4 mr-2" />
            Dismiss
          </Button>
        </div>

        {/* ROI Emphasis Footer */}
        <div className="mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded border-2 border-green-200">
          <p className="text-sm text-center font-semibold text-gray-900">
            💰 Invest ${avgCost.toLocaleString()} today, avoid ${replacementCost.toLocaleString()} replacement = ${netSavings.toLocaleString()} net savings
          </p>
        </div>
      </CardContent>
    </Card>
  );
}