import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, AlertTriangle, CheckCircle2, TrendingUp, Zap } from "lucide-react";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

export default function DecisionCalculator({ systems, recommendations, property }) {
  const [selectedSystemId, setSelectedSystemId] = useState('');

  const selectedSystem = systems.find(s => s.id === selectedSystemId);
  const systemRecommendation = recommendations.find(r => r.system_id === selectedSystemId && r.status === 'PENDING');

  const currentYear = new Date().getFullYear();

  // Calculate system details
  const systemAge = selectedSystem?.installation_year 
    ? currentYear - selectedSystem.installation_year 
    : 0;
  
  const totalLifespan = selectedSystem?.estimated_lifespan_years 
    ? selectedSystem.estimated_lifespan_years + (selectedSystem.lifespan_extension_total_years || 0)
    : 0;
  
  const yearsRemaining = totalLifespan - systemAge;
  const agePercentage = totalLifespan > 0 ? (systemAge / totalLifespan) * 100 : 0;

  // Option 1: Life Extension (if recommendation exists)
  const option1 = systemRecommendation ? {
    title: "Life-Extension Intervention",
    upfrontCost: (systemRecommendation.estimated_cost_min + systemRecommendation.estimated_cost_max) / 2,
    yearsExtended: systemRecommendation.expected_lifespan_extension_years,
    totalCostOverTime: (systemRecommendation.estimated_cost_min + systemRecommendation.estimated_cost_max) / 2,
    outcome: `Extends life ${systemRecommendation.expected_lifespan_extension_years} years, then replace`,
    risk: systemRecommendation.risk_if_delayed || "Moderate - system may fail before intervention",
    pros: [
      `Saves ${systemRecommendation.expected_lifespan_extension_years} years of replacement cost`,
      `ROI: ${systemRecommendation.roi_multiple.toFixed(1)}x return`,
      "Planned on your schedule",
      "Lower immediate cost"
    ],
    cons: [
      "System will eventually need replacement",
      "Requires future planning",
      "May need additional repairs"
    ]
  } : null;

  // Option 2: Replace Now
  const option2 = selectedSystem ? {
    title: "Replace Now (Planned)",
    upfrontCost: selectedSystem.replacement_cost_estimate || 0,
    yearsExtended: selectedSystem.estimated_lifespan_years || 15,
    totalCostOverTime: selectedSystem.replacement_cost_estimate || 0,
    outcome: `Brand new system, ${selectedSystem.estimated_lifespan_years || 15} year lifespan`,
    risk: "Low - new system with warranty",
    pros: [
      "Fresh start with new warranty",
      "Modern efficiency features",
      "No repairs needed for years",
      "Can choose upgrade features"
    ],
    cons: [
      "Higher upfront cost",
      "Might be premature",
      "Wastes remaining system life",
      "Installation disruption"
    ]
  } : null;

  // Option 3: Replace with Upgrade
  const option3 = selectedSystem ? {
    title: "Replace with Upgrade",
    upfrontCost: (selectedSystem.replacement_cost_estimate || 0) * 1.3,
    yearsExtended: (selectedSystem.estimated_lifespan_years || 15) * 1.1,
    totalCostOverTime: (selectedSystem.replacement_cost_estimate || 0) * 1.3,
    outcome: `Premium system, ${Math.round((selectedSystem.estimated_lifespan_years || 15) * 1.1)} year lifespan + energy savings`,
    risk: "Low - premium features and extended warranty",
    pros: [
      "Best long-term value",
      "Energy efficiency savings",
      "Premium features & comfort",
      "Longer warranty period",
      "May add property value"
    ],
    cons: [
      "Highest upfront cost",
      "Extended payback period",
      "May be over-investment"
    ]
  } : null;

  // AI Recommendation Logic
  const getAIRecommendation = () => {
    if (!selectedSystem) return null;

    if (agePercentage > 95 || selectedSystem.condition === 'Urgent') {
      return {
        choice: "Option 2 or 3",
        reasoning: "System is at end of life. Life extension at this age provides minimal benefit. Replace now or upgrade.",
        icon: <AlertTriangle className="w-6 h-6 text-red-600" />
      };
    }

    if (agePercentage > 85 && systemRecommendation) {
      const interventionCost = option1.upfrontCost;
      const replacementCost = option2.upfrontCost;
      const roi = systemRecommendation.roi_multiple;

      if (roi > 2.5 && interventionCost < replacementCost * 0.3) {
        return {
          choice: "Option 1",
          reasoning: `Life extension offers ${roi.toFixed(1)}x ROI at only ${Math.round((interventionCost / replacementCost) * 100)}% of replacement cost. Extend life now, replace in ${systemRecommendation.expected_lifespan_extension_years} years.`,
          icon: <CheckCircle2 className="w-6 h-6 text-green-600" />
        };
      } else {
        return {
          choice: "Option 2 or 3",
          reasoning: "At this age, replacement provides better long-term value than intervention. Consider upgrade for maximum ROI.",
          icon: <TrendingUp className="w-6 h-6 text-blue-600" />
        };
      }
    }

    if (agePercentage > 75 && systemRecommendation) {
      return {
        choice: "Option 1",
        reasoning: `Strong candidate for life extension. System has enough remaining value that strategic intervention provides excellent ROI (${systemRecommendation.roi_multiple.toFixed(1)}x).`,
        icon: <Zap className="w-6 h-6 text-orange-600" />
      };
    }

    return {
      choice: "Monitor for Now",
      reasoning: "System is in early/mid life. Continue routine maintenance and revisit when age reaches 75%+.",
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />
    };
  };

  const aiRec = getAIRecommendation();

  return (
    <div className="space-y-6">
      
      {/* System Selector */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            Decision Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Select a System to Analyze:
            </label>
            <Select value={selectedSystemId} onValueChange={setSelectedSystemId}>
              <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                <SelectValue placeholder="Choose a system..." />
              </SelectTrigger>
              <SelectContent>
                {systems.map(system => (
                  <SelectItem key={system.id} value={system.id}>
                    {system.system_type} {system.nickname && `- ${system.nickname}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSystem && (
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Age</p>
                  <p className="font-bold">{systemAge} years</p>
                </div>
                <div>
                  <p className="text-gray-600">Remaining</p>
                  <p className="font-bold">{yearsRemaining} years</p>
                </div>
                <div>
                  <p className="text-gray-600">Life Used</p>
                  <p className="font-bold">{Math.round(agePercentage)}%</p>
                </div>
                <div>
                  <p className="text-gray-600">Condition</p>
                  <p className="font-bold">{selectedSystem.condition}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Option Comparison */}
      {selectedSystem && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Option 1: Life Extension */}
          {option1 && (
            <Card className="border-2 border-green-300">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-lg">{option1.title}</CardTitle>
                <Badge className="w-fit bg-green-600">
                  ROI: {systemRecommendation.roi_multiple.toFixed(1)}x
                </Badge>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Upfront Cost</p>
                  <p className="text-2xl font-bold text-green-700">
                    ${option1.upfrontCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Outcome</p>
                  <p className="text-sm font-medium">{option1.outcome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Assessment</p>
                  <p className="text-sm">{option1.risk}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800 mb-2">Pros:</p>
                  <ul className="text-xs space-y-1">
                    {option1.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-600">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-2">Cons:</p>
                  <ul className="text-xs space-y-1">
                    {option1.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-red-600">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Option 2: Replace Now */}
          {option2 && (
            <Card className="border-2 border-blue-300">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg">{option2.title}</CardTitle>
                <Badge className="w-fit bg-blue-600">
                  Fresh Start
                </Badge>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Upfront Cost</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ${option2.upfrontCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Outcome</p>
                  <p className="text-sm font-medium">{option2.outcome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Assessment</p>
                  <p className="text-sm">{option2.risk}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800 mb-2">Pros:</p>
                  <ul className="text-xs space-y-1">
                    {option2.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-600">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-2">Cons:</p>
                  <ul className="text-xs space-y-1">
                    {option2.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-red-600">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Option 3: Upgrade */}
          {option3 && (
            <Card className="border-2 border-purple-300">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg">{option3.title}</CardTitle>
                <Badge className="w-fit bg-purple-600">
                  Best Long-Term
                </Badge>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Upfront Cost</p>
                  <p className="text-2xl font-bold text-purple-700">
                    ${option3.upfrontCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Expected Outcome</p>
                  <p className="text-sm font-medium">{option3.outcome}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Assessment</p>
                  <p className="text-sm">{option3.risk}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-800 mb-2">Pros:</p>
                  <ul className="text-xs space-y-1">
                    {option3.pros.map((pro, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-green-600">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-red-800 mb-2">Cons:</p>
                  <ul className="text-xs space-y-1">
                    {option3.cons.map((con, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-red-600">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to={createPageUrl('Upgrade') + `?property=${property?.id || ''}`}>
                  <Button variant="outline" className="w-full gap-2" style={{ minHeight: '44px' }}>
                    <TrendingUp className="w-4 h-4" />
                    View Upgrade Templates
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

        </div>
      )}

      {/* AI Recommendation */}
      {aiRec && selectedSystem && (
        <Card className="border-2 border-indigo-300 bg-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {aiRec.icon}
              AI Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recommended Choice:</p>
                <p className="text-xl font-bold text-indigo-900">{aiRec.choice}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Reasoning:</p>
                <p className="text-sm text-gray-800">{aiRec.reasoning}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!selectedSystem && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Select a System to Compare</h3>
            <p className="text-gray-600">
              Choose a system above to see detailed cost comparisons and AI recommendations.
            </p>
          </CardContent>
        </Card>
      )}

    </div>
  );
}