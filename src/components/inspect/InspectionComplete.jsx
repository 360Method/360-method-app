import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle, AlertTriangle, ArrowRight, Lightbulb, Shield, DollarSign } from "lucide-react";
import { SystemBaseline } from "@/api/supabaseClient";
import { generatePreservationRecommendations } from "../shared/PreservationAnalyzer";
import { useQuery } from "@tanstack/react-query";

export default function InspectionComplete({ inspection, property, onViewPriorityQueue, onViewReport, onDone }) {
  const [aiSummary, setAiSummary] = React.useState(null);
  const [preservationOpportunities, setPreservationOpportunities] = React.useState(null);
  const [generatingSummary, setGeneratingSummary] = React.useState(false);

  const allIssues = inspection?.checklist_items || [];
  const urgentCount = inspection?.urgent_count || 0;
  const flagCount = inspection?.flag_count || 0;
  const monitorCount = inspection?.monitor_count || 0;
  const quickFixesCompleted = allIssues.filter(i => i.is_quick_fix && i.status === 'Completed').length;
  const durationMinutes = inspection?.duration_minutes || 0;

  const tasksCreated = urgentCount + flagCount;

  // Fetch baseline systems for preservation analysis - only if property exists
  const { data: systems = [] } = useQuery({
    queryKey: ['systemBaselines', property?.id],
    queryFn: () => {
      if (!property?.id) return Promise.resolve([]);
      return SystemBaseline.filter({ property_id: property.id });
    },
    enabled: !!property?.id,
  });

  // Generate AI summary and preservation opportunities
  React.useEffect(() => {
    const generateAnalysis = async () => {
      if (allIssues.length === 0 || !property || !inspection) return;
      
      setGeneratingSummary(true);
      try {
        const issuesText = allIssues.map(issue => 
          `${issue.severity}: ${issue.description} (${issue.area})`
        ).join('\n');

        const prompt = `Summarize this ${inspection.season} home inspection and provide homeowner guidance:

Property: ${property.address}
Issues found:
${issuesText}

Provide:
1. Overall assessment (1-2 sentences)
2. Top 3 priorities homeowner should address first
3. Estimated total cost range for all urgent and flagged items
4. Long-term maintenance advice based on findings

Be clear, actionable, and help the homeowner understand what matters most.`;

        const summary = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              overall_assessment: { type: "string" },
              top_priorities: { type: "array", items: { type: "string" } },
              estimated_cost_range: { type: "string" },
              long_term_advice: { type: "string" }
            }
          }
        });

        setAiSummary(summary);

        // Generate preservation opportunities
        if (systems.length > 0) {
          const preservation = await generatePreservationRecommendations(systems);
          if (preservation) {
            setPreservationOpportunities(preservation);
          }
        }
      } catch (error) {
        console.error('Failed to generate AI analysis:', error);
      } finally {
        setGeneratingSummary(false);
      }
    };

    if (allIssues.length > 0 && !aiSummary && property && inspection) {
      generateAnalysis();
    }
  }, [allIssues, inspection, property, systems, aiSummary]);

  if (!inspection) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="border-none shadow-lg max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Inspection Data</h1>
            <p className="text-gray-600">Unable to load inspection results.</p>
            <Button onClick={onDone} className="mt-6">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="border-none shadow-lg max-w-4xl w-full">
        <CardContent className="p-12 text-center space-y-8">
          {/* Success Header */}
          <div>
            <div className="text-6xl mb-4">🎉 ✓ 🎉</div>
            <h1 className="text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Inspection Complete!
            </h1>
            <p className="text-xl text-gray-600">
              {inspection.season} {inspection.year} Inspection
              {property && ` - ${property.address}`}
            </p>
            <p className="text-gray-600">Duration: {durationMinutes} minutes</p>
          </div>

          <hr className="border-gray-200" />

          {/* AI Summary */}
          {generatingSummary ? (
            <Card className="border-2" style={{ borderColor: '#8B5CF6', backgroundColor: '#F5F3FF' }}>
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <div className="animate-spin text-3xl">⚙️</div>
                  <span className="text-lg font-medium text-purple-900">AI analyzing your inspection...</span>
                </div>
                <p className="text-sm text-gray-600">Generating insights and recommendations</p>
              </CardContent>
            </Card>
          ) : aiSummary && (
            <Card className="border-2" style={{ borderColor: '#8B5CF6', backgroundColor: '#F5F3FF' }}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2" style={{ color: '#1B365D' }}>
                  <Lightbulb className="w-6 h-6 text-purple-600" />
                  AI Inspection Summary
                </h2>
                
                <div className="text-left space-y-4">
                  {/* Overall Assessment */}
                  <div>
                    <h3 className="font-bold mb-2 text-purple-900">Overall Assessment:</h3>
                    <p className="text-gray-800">{aiSummary.overall_assessment}</p>
                  </div>

                  {/* Top Priorities */}
                  {aiSummary.top_priorities?.length > 0 && (
                    <div>
                      <h3 className="font-bold mb-2 text-red-900">🎯 Top 3 Priorities:</h3>
                      <ol className="list-decimal ml-6 space-y-1">
                        {aiSummary.top_priorities.map((priority, idx) => (
                          <li key={idx} className="text-gray-800">{priority}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Cost Estimate */}
                  {aiSummary.estimated_cost_range && (
                    <div>
                      <h3 className="font-bold mb-2 text-gray-900">💰 Estimated Cost Range:</h3>
                      <p className="text-gray-800">{aiSummary.estimated_cost_range}</p>
                    </div>
                  )}

                  {/* Long-term Advice */}
                  {aiSummary.long_term_advice && (
                    <div>
                      <h3 className="font-bold mb-2 text-green-900">📋 Long-Term Maintenance:</h3>
                      <p className="text-gray-800">{aiSummary.long_term_advice}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preservation Opportunities */}
          {preservationOpportunities && preservationOpportunities.opportunities.length > 0 && (
            <Card className="border-2" style={{ borderColor: '#28A745', backgroundColor: '#F0FFF4' }}>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center justify-center gap-2 text-green-900">
                  <Shield className="w-6 h-6 text-green-700" />
                  🛡️ PRESERVATION OPPORTUNITIES
                </h2>
                
                <p className="text-center text-gray-800 mb-6">
                  You have <strong>{preservationOpportunities.opportunities.length} aging system{preservationOpportunities.opportunities.length > 1 ? 's' : ''}</strong> where 
                  preservation can save thousands:
                </p>

                <div className="space-y-4">
                  {preservationOpportunities.opportunities.slice(0, 3).map((opp, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border-2 border-green-200 text-left">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {opp.system.nickname || opp.system.system_type}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {opp.age} years old ({opp.percentLifespan}% of {opp.lifespan}-year lifespan)
                          </p>
                        </div>
                        <Badge className={
                          opp.priority === 'HIGH' ? 'bg-red-600' :
                          opp.priority === 'MEDIUM' ? 'bg-orange-600' :
                          'bg-blue-600'
                        }>
                          {opp.priority}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-600">Preservation Cost</p>
                          <p className="font-bold text-green-700">${opp.investment}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Extends Life</p>
                          <p className="font-bold text-green-700">{opp.extensionYears} years</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Replacement Avoided</p>
                          <p className="font-bold text-green-700">${opp.replacementCost.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Annual Savings</p>
                          <p className="font-bold text-green-700">${Math.round(opp.annualSavings).toLocaleString()}/yr</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                  <p className="font-bold text-blue-900 mb-2 flex items-center justify-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    TOTAL PRESERVATION OPPORTUNITY
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-700">Invest</p>
                      <p className="text-2xl font-bold text-blue-900">${preservationOpportunities.totalInvestment.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700">Avoid</p>
                      <p className="text-2xl font-bold text-blue-900">${preservationOpportunities.totalSavings.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700">ROI</p>
                      <p className="text-2xl font-bold text-blue-900">{preservationOpportunities.totalROI.toFixed(1)}:1</p>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-600 mt-3">
                    Avoid ${preservationOpportunities.totalSavings.toLocaleString()} in replacements (next 2-4 years) with ${preservationOpportunities.totalInvestment.toLocaleString()} preservation
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Issues Found Summary */}
          <div>
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#1B365D' }}>ISSUES FOUND:</h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              {urgentCount > 0 && (
                <Card className="border-2" style={{ borderColor: '#DC3545', backgroundColor: '#FFF5F5' }}>
                  <CardContent className="p-6">
                    <div className="text-4xl mb-2">🚨</div>
                    <p className="text-3xl font-bold text-red-700">{urgentCount}</p>
                    <p className="text-sm font-medium text-gray-700">URGENT</p>
                  </CardContent>
                </Card>
              )}
              
              {flagCount > 0 && (
                <Card className="border-2" style={{ borderColor: '#FF6B35', backgroundColor: '#FFF5F2' }}>
                  <CardContent className="p-6">
                    <div className="text-4xl mb-2">⚠️</div>
                    <p className="text-3xl font-bold text-orange-700">{flagCount}</p>
                    <p className="text-sm font-medium text-gray-700">FLAG</p>
                  </CardContent>
                </Card>
              )}
              
              {monitorCount > 0 && (
                <Card className="border-2" style={{ borderColor: '#28A745', backgroundColor: '#F0FFF4' }}>
                  <CardContent className="p-6">
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-3xl font-bold text-green-700">{monitorCount}</p>
                    <p className="text-sm font-medium text-gray-700">MONITOR</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Issue Details */}
            {allIssues.length > 0 && (
              <div className="space-y-3 text-left">
                {urgentCount > 0 && (
                  <div>
                    <h3 className="font-bold text-red-700 mb-2">🚨 URGENT ({urgentCount}):</h3>
                    <ul className="ml-6 space-y-1">
                      {allIssues
                        .filter(i => i.severity === 'Urgent')
                        .map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-700">- {issue.description?.substring(0, 80) || 'No description'}...</li>
                        ))}
                    </ul>
                  </div>
                )}
                
                {flagCount > 0 && (
                  <div>
                    <h3 className="font-bold text-orange-700 mb-2">⚠️ FLAG ({flagCount}):</h3>
                    <ul className="ml-6 space-y-1">
                      {allIssues
                        .filter(i => i.severity === 'Flag')
                        .map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-700">- {issue.description?.substring(0, 80) || 'No description'}...</li>
                        ))}
                    </ul>
                  </div>
                )}
                
                {monitorCount > 0 && (
                  <div>
                    <h3 className="font-bold text-green-700 mb-2">✅ MONITOR ({monitorCount}):</h3>
                    <ul className="ml-6 space-y-1">
                      {allIssues
                        .filter(i => i.severity === 'Monitor')
                        .map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-700">- {issue.description?.substring(0, 80) || 'No description'}...</li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          <hr className="border-gray-200" />

          {/* Quick Fixes Completed */}
          {quickFixesCompleted > 0 && (
            <Card className="border-2" style={{ borderColor: '#28A745', backgroundColor: '#F0FFF4' }}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1B365D' }}>
                  ⚡ QUICK FIXES COMPLETED: {quickFixesCompleted}
                </h3>
                <ul className="text-left ml-6 space-y-1">
                  {allIssues
                    .filter(i => i.is_quick_fix && i.status === 'Completed')
                    .map((issue, idx) => (
                      <li key={idx} className="text-sm text-gray-700">- {issue.description?.substring(0, 80) || 'No description'}</li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Points Earned */}
          <div className="py-6">
            <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full" style={{ backgroundColor: '#FFF5F2' }}>
              <Trophy className="w-8 h-8" style={{ color: '#FF6B35' }} />
              <span className="text-3xl font-bold" style={{ color: '#FF6B35' }}>
                You earned 150 PP!
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">You completed a thorough seasonal inspection!</p>
          </div>

          <hr className="border-gray-200" />

          {/* Next Steps */}
          <div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1B365D' }}>NEXT STEPS:</h2>
            {tasksCreated > 0 ? (
              <Card className="border-2" style={{ borderColor: '#FF6B35', backgroundColor: '#FFF5F2' }}>
                <CardContent className="p-6">
                  <p className="text-lg font-medium text-gray-800">
                    All <strong>{tasksCreated} FLAG and URGENT items</strong> have been added to your Priority Queue in ACT → Prioritize.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <p className="text-gray-600">Great news! No urgent items found. Your property is in good condition.</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            {tasksCreated > 0 && (
              <Button
                onClick={onViewPriorityQueue}
                className="w-full h-14 text-lg font-bold"
                style={{ backgroundColor: '#FF6B35' }}
              >
                View Priority Queue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
            
            <Button
              onClick={onViewReport}
              variant="outline"
              className="w-full h-12"
            >
              View Inspection Report
            </Button>
            
            <Button
              onClick={onDone}
              variant="ghost"
              className="w-full"
            >
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}