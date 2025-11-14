import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, AlertTriangle, Download } from "lucide-react";

export default function InvestmentMatrix({ recommendations, systems }) {
  
  // Categorize recommendations into quadrants
  const quadrants = useMemo(() => {
    const result = {
      highROI_urgent: [],
      highROI_notUrgent: [],
      mediumROI_urgent: [],
      lowROI: []
    };

    recommendations.forEach(rec => {
      const system = systems.find(s => s.id === rec.system_id);
      const enriched = { ...rec, system };

      const isHighROI = rec.roi_multiple >= 3;
      const isMediumROI = rec.roi_multiple >= 1.5 && rec.roi_multiple < 3;
      const isUrgent = rec.priority === 'URGENT';

      if (isHighROI && isUrgent) {
        result.highROI_urgent.push(enriched);
      } else if (isHighROI && !isUrgent) {
        result.highROI_notUrgent.push(enriched);
      } else if (isMediumROI && isUrgent) {
        result.mediumROI_urgent.push(enriched);
      } else {
        result.lowROI.push(enriched);
      }
    });

    // Sort each quadrant by ROI descending
    Object.keys(result).forEach(key => {
      result[key].sort((a, b) => b.roi_multiple - a.roi_multiple);
    });

    return result;
  }, [recommendations, systems]);

  const totalEstimatedCost = recommendations.reduce((sum, r) => 
    sum + ((r.estimated_cost_min + r.estimated_cost_max) / 2), 0
  );

  const totalValue = recommendations.reduce((sum, r) => {
    const avgCost = (r.estimated_cost_min + r.estimated_cost_max) / 2;
    return sum + (avgCost * r.roi_multiple);
  }, 0);

  const projectedSavings5Year = totalValue - totalEstimatedCost;

  const renderRecommendationItem = (rec) => (
    <div key={rec.id} className="p-3 bg-white border rounded-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-semibold text-sm">
            {rec.system?.system_type || 'Unknown System'}
            {rec.system?.nickname && ` - ${rec.system.nickname}`}
          </p>
          <p className="text-xs text-gray-600 mt-1">{rec.title}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="bg-purple-600 text-white text-xs">
              {rec.roi_multiple.toFixed(1)}x ROI
            </Badge>
            <span className="text-xs text-gray-600">
              ${((rec.estimated_cost_min + rec.estimated_cost_max) / 2).toLocaleString()}
            </span>
          </div>
        </div>
        <Badge className={
          rec.priority === 'URGENT' ? 'bg-red-600 text-white' :
          rec.priority === 'RECOMMENDED' ? 'bg-orange-600 text-white' :
          'bg-blue-600 text-white'
        }>
          {rec.priority}
        </Badge>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* Summary Card */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Investment Priority Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Opportunities</p>
              <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Est. Annual Budget</p>
              <p className="text-2xl font-bold text-blue-700">
                ${totalEstimatedCost.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Projected 5-Year Savings</p>
              <p className="text-2xl font-bold text-green-700">
                ${projectedSavings5Year.toLocaleString()}
              </p>
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Priority List
          </Button>
        </CardContent>
      </Card>

      {/* Four Quadrants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Q1: High ROI + Urgent (DO FIRST) */}
        <Card className="border-2 border-red-300 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <CardTitle className="text-lg">High ROI + Urgent</CardTitle>
                <p className="text-sm text-red-700 font-semibold">✅ DO FIRST</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quadrants.highROI_urgent.length > 0 ? (
                quadrants.highROI_urgent.map(renderRecommendationItem)
              ) : (
                <p className="text-sm text-gray-600 italic">No items in this category</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Q2: High ROI + Not Urgent (PLAN AHEAD) */}
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <CardTitle className="text-lg">High ROI + Not Urgent</CardTitle>
                <p className="text-sm text-green-700 font-semibold">📅 PLAN AHEAD</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quadrants.highROI_notUrgent.length > 0 ? (
                quadrants.highROI_notUrgent.map(renderRecommendationItem)
              ) : (
                <p className="text-sm text-gray-600 italic">No items in this category</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Q3: Medium ROI + Urgent (CASE BY CASE) */}
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <div>
                <CardTitle className="text-lg">Medium ROI + Urgent</CardTitle>
                <p className="text-sm text-orange-700 font-semibold">⚖️ CASE BY CASE</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quadrants.mediumROI_urgent.length > 0 ? (
                quadrants.mediumROI_urgent.map(renderRecommendationItem)
              ) : (
                <p className="text-sm text-gray-600 italic">No items in this category</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Q4: Low ROI (CONSIDER DEFERRING) */}
        <Card className="border-2 border-gray-300 bg-gray-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-gray-600" />
              <div>
                <CardTitle className="text-lg">Low ROI</CardTitle>
                <p className="text-sm text-gray-700 font-semibold">⏸️ CONSIDER DEFERRING</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quadrants.lowROI.length > 0 ? (
                quadrants.lowROI.map(renderRecommendationItem)
              ) : (
                <p className="text-sm text-gray-600 italic">No items in this category</p>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Strategy Guide */}
      <Card className="border-2 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Investment Strategy Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-semibold text-blue-900 mb-1">🎯 Prioritization Logic:</p>
              <ul className="space-y-1 ml-4">
                <li>• <strong>High ROI + Urgent:</strong> Do immediately - best bang for buck, prevents disasters</li>
                <li>• <strong>High ROI + Not Urgent:</strong> Schedule within 6-12 months - excellent value, no rush</li>
                <li>• <strong>Medium ROI + Urgent:</strong> Evaluate case-by-case based on budget and risk tolerance</li>
                <li>• <strong>Low ROI:</strong> Consider deferring or exploring alternatives</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded border-l-4 border-blue-600">
              <p className="font-semibold text-blue-900 mb-1">💡 Pro Tip:</p>
              <p className="text-gray-800">
                If budget is tight, focus exclusively on the "High ROI + Urgent" quadrant. These interventions prevent expensive failures while delivering strong returns.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}