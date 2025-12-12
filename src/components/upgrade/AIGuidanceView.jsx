import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { integrations, Upgrade } from '@/api/supabaseClient';
import { Lightbulb, AlertTriangle, Sparkles, RefreshCw, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function AIGuidanceView({ project, onUpdate }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const generateGuidanceMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);

      console.log('Calling InvokeLLM for AI guidance...');

      // Call AI to generate project-specific guidance
      const result = await integrations.InvokeLLM({
        prompt: `You are an expert home improvement advisor. Analyze this renovation project and provide guidance:

Project: ${project.title}
Category: ${project.category}
Description: ${project.description || 'No description'}
Budget: $${project.investment_required?.toLocaleString()}
Current Status: ${project.status}

Provide:
1. A comprehensive project plan (200 words)
2. 5 key recommendations for success
3. 3 risk alerts to watch out for

Format as JSON with keys: project_plan, recommendations (array), risk_alerts (array)`,
        response_json_schema: {
          type: "object",
          properties: {
            project_plan: { type: "string" },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            risk_alerts: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      console.log('InvokeLLM result:', result);
      return result;
    },
    onSuccess: (result) => {
      console.log('AI Guidance mutation success, result:', result);

      // Validate we got the expected structure
      if (!result || (!result.project_plan && !result.recommendations)) {
        console.error('Invalid AI response structure:', result);
        alert('AI returned an unexpected format. Please try again.');
        setIsGenerating(false);
        return;
      }

      // Update project with AI guidance - store in single ai_guidance JSONB column
      Upgrade.update(project.id, {
        ai_guidance: {
          project_plan: result.project_plan || '',
          recommendations: result.recommendations || [],
          risk_alerts: result.risk_alerts || [],
          generated_at: new Date().toISOString()
        }
      }).then(async () => {
        console.log('AI guidance saved successfully');
        // Invalidate and wait for refetch before updating UI
        await queryClient.invalidateQueries({ queryKey: ['upgrade', project.id] });
        await queryClient.refetchQueries({ queryKey: ['upgrade', project.id] });
        console.log('Query refetched');
        setIsGenerating(false);
        onUpdate?.();
      }).catch((err) => {
        console.error('Failed to save AI guidance:', err);
        alert('Failed to save AI guidance. Please try again.');
        setIsGenerating(false);
      });
    },
    onError: (error) => {
      console.error('AI Guidance mutation failed:', error);
      setIsGenerating(false);
      alert('Failed to generate AI guidance. Please try again.');
    }
  });

  // Extract guidance from ai_guidance JSONB column
  // Handle both string (from DB) and object formats
  let guidance = {};
  if (project.ai_guidance) {
    if (typeof project.ai_guidance === 'string') {
      try {
        guidance = JSON.parse(project.ai_guidance);
      } catch (e) {
        console.error('Failed to parse ai_guidance:', e);
      }
    } else {
      guidance = project.ai_guidance;
    }
  }

  const hasGuidance = guidance.project_plan ||
                     (guidance.recommendations && guidance.recommendations.length > 0) ||
                     (guidance.risk_alerts && guidance.risk_alerts.length > 0);

  if (!hasGuidance) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Sparkles className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            AI Project Guidance
          </h3>
          <p className="text-gray-600 mb-6">
            Get personalized AI recommendations, risk alerts, and a comprehensive project plan tailored to your specific upgrade.
          </p>
          <Button
            onClick={() => generateGuidanceMutation.mutate()}
            disabled={isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
            style={{ minHeight: '48px' }}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating AI Guidance...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate AI Guidance
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Regenerate Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => generateGuidanceMutation.mutate()}
          disabled={isGenerating}
          style={{ minHeight: '44px' }}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Regenerating...' : 'Regenerate Guidance'}
        </Button>
      </div>

      {/* Project Plan */}
      {guidance.project_plan && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              AI Project Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              {guidance.project_plan}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {guidance.recommendations && guidance.recommendations.length > 0 && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Key Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {guidance.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <p className="text-gray-800 leading-relaxed flex-1">{rec}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Risk Alerts */}
      {guidance.risk_alerts && guidance.risk_alerts.length > 0 && (
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Risk Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {guidance.risk_alerts.map((alert, index) => (
                <li key={index} className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-800 leading-relaxed flex-1">{alert}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Pro Tips */}
      <Card className="border-2 border-purple-300 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Pro Tips for Success
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-xl">📸</span>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Document Everything</p>
              <p className="text-sm text-gray-700">
                Take photos at each milestone. Before/during/after photos prove value added and help with insurance/resale.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <span className="text-xl">💰</span>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Track Every Dollar</p>
              <p className="text-sm text-gray-700">
                Keep all receipts and update actual costs as you go. This data feeds into your portfolio's ROI calculations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">🏆</span>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Complete Milestones in Order</p>
              <p className="text-sm text-gray-700">
                Following the milestone sequence ensures you don't miss critical steps and helps estimate completion timeline.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-xl">🔧</span>
            <div>
              <p className="font-semibold text-gray-900 mb-1">Update System Baselines</p>
              <p className="text-sm text-gray-700">
                When you replace major systems (HVAC, roof, etc.), update their baseline data to reset maintenance schedules.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}