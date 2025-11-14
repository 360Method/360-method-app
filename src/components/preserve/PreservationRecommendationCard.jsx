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
  AlertCircle
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

export default function PreservationRecommendationCard({ recommendation, systems, onApprove }) {
  const [expanded, setExpanded] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const system = systems.find(s => s.id === recommendation.system_id);

  const approveMutation = useMutation({
    mutationFn: async () => {
      // Update recommendation status
      await base44.entities.PreservationRecommendation.update(recommendation.id, {
        status: 'APPROVED',
        decision_date: new Date().toISOString(),
        decision_by_user_id: (await base44.auth.me()).id
      });

      // Create maintenance task
      const task = await base44.entities.MaintenanceTask.create({
        property_id: recommendation.property_id,
        title: recommendation.title,
        description: recommendation.description,
        system_type: system?.system_type || 'General',
        source: 'PRESERVATION_RECOMMENDATION',
        preservation_recommendation_id: recommendation.id,
        priority: recommendation.priority === 'URGENT' ? 'High' : 'Medium',
        current_fix_cost: recommendation.estimated_cost_min,
        contractor_cost: recommendation.estimated_cost_max,
        status: 'Identified'
      });

      return task;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['preservation-recommendations']);
      queryClient.invalidateQueries(['maintenance-tasks']);
      if (onApprove) onApprove();
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
      if (onApprove) onApprove();
    }
  });

  const dismissMutation = useMutation({
    mutationFn: () => base44.entities.PreservationRecommendation.update(recommendation.id, {
      status: 'DISMISSED',
      decision_date: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['preservation-recommendations']);
      if (onApprove) onApprove();
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

  return (
    <Card className={`border-2 ${getPriorityColor()}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {getPriorityBadge()}
              <Badge variant="outline" className="text-xs">
                {recommendation.intervention_type}
              </Badge>
            </div>
            <CardTitle className="text-lg">
              {system?.system_type || 'Unknown System'}
              {system?.nickname && ` - ${system.nickname}`}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">{recommendation.title}</p>
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
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-xs text-gray-600 mb-1">Cost Range</p>
            <p className="font-bold text-sm">
              ${recommendation.estimated_cost_min.toLocaleString()} - ${recommendation.estimated_cost_max.toLocaleString()}
            </p>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-xs text-gray-600 mb-1">Life Extended</p>
            <p className="font-bold text-sm text-green-700">
              +{recommendation.expected_lifespan_extension_years} years
            </p>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-xs text-gray-600 mb-1">ROI</p>
            <p className="font-bold text-sm text-purple-700">
              {recommendation.roi_multiple.toFixed(1)}x
            </p>
          </div>
          <div className="text-center p-2 bg-white rounded border">
            <p className="text-xs text-gray-600 mb-1">Deadline</p>
            <p className="font-bold text-sm text-orange-700">
              {recommendation.recommended_deadline 
                ? new Date(recommendation.recommended_deadline).toLocaleDateString() 
                : recommendation.optimal_timing || 'ASAP'}
            </p>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-4 pt-4 border-t">
            
            {/* Description */}
            <div>
              <h4 className="font-semibold text-sm mb-2">What This Involves:</h4>
              <p className="text-sm text-gray-700">{recommendation.description}</p>
            </div>

            {/* Risk if Delayed */}
            {recommendation.risk_if_delayed && (
              <div className="bg-red-50 border-l-4 border-red-600 p-3 rounded">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-red-900 mb-1">Risk if Delayed:</h4>
                    <p className="text-sm text-red-800">{recommendation.risk_if_delayed}</p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Reasoning */}
            {recommendation.reasoning && (
              <div className="bg-blue-50 border-l-4 border-blue-600 p-3 rounded">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-blue-900 mb-1">AI Analysis:</h4>
                    <p className="text-sm text-blue-800">{recommendation.reasoning}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payback Calculation */}
            {recommendation.payback_calculation && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Financial Breakdown:</h4>
                <p className="text-sm text-gray-700">{recommendation.payback_calculation}</p>
              </div>
            )}

            {/* Alternative Options */}
            {recommendation.alternative_options && recommendation.alternative_options.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm mb-2">Alternative Options:</h4>
                <div className="space-y-2">
                  {recommendation.alternative_options.map((alt, idx) => (
                    <div key={idx} className="p-2 bg-white border rounded">
                      <p className="font-semibold text-sm">{alt.option}</p>
                      <p className="text-xs text-gray-600">Cost: ${alt.cost?.toLocaleString() || 'TBD'}</p>
                      <p className="text-xs text-gray-700 mt-1">{alt.reasoning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
          <Button
            onClick={() => approveMutation.mutate()}
            disabled={approveMutation.isLoading}
            className="bg-green-600 hover:bg-green-700 gap-2"
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
            {expanded ? 'Hide' : 'Learn More'}
          </Button>
          <Button
            variant="outline"
            onClick={() => deferMutation.mutate()}
            disabled={deferMutation.isLoading}
            style={{ minHeight: '44px' }}
          >
            Defer
          </Button>
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
      </CardContent>
    </Card>
  );
}