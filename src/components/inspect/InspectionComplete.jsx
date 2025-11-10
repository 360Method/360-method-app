import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

export default function InspectionComplete({ inspection, property, onViewPriorityQueue, onViewReport, onDone }) {
  const allIssues = inspection.checklist_items || [];
  const urgentCount = inspection.urgent_count || 0;
  const flagCount = inspection.flag_count || 0;
  const monitorCount = inspection.monitor_count || 0;
  const quickFixesCompleted = allIssues.filter(i => i.is_quick_fix && i.status === 'Completed').length;
  const durationMinutes = inspection.duration_minutes || 0;

  const tasksCreated = urgentCount + flagCount;

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
              {inspection.season} {inspection.year} Inspection - {property.address}
            </p>
            <p className="text-gray-600">Duration: {durationMinutes} minutes</p>
          </div>

          <hr className="border-gray-200" />

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
            <div className="space-y-3 text-left">
              {urgentCount > 0 && (
                <div>
                  <h3 className="font-bold text-red-700 mb-2">🚨 URGENT ({urgentCount}):</h3>
                  <ul className="ml-6 space-y-1">
                    {allIssues
                      .filter(i => i.severity === 'Urgent')
                      .map((issue, idx) => (
                        <li key={idx} className="text-sm text-gray-700">- {issue.description.substring(0, 80)}...</li>
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
                        <li key={idx} className="text-sm text-gray-700">- {issue.description.substring(0, 80)}...</li>
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
                        <li key={idx} className="text-sm text-gray-700">- {issue.description.substring(0, 80)}...</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
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
                      <li key={idx} className="text-sm text-gray-700">- {issue.description.substring(0, 80)}</li>
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