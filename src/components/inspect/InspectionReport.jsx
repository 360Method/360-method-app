import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Mail, Printer, CheckCircle, AlertTriangle, Edit } from "lucide-react";

export default function InspectionReport({ inspection, property, baselineSystems, onBack, onEdit }) {
  const allIssues = inspection.checklist_items || [];
  const urgentIssues = allIssues.filter(i => i.severity === 'Urgent');
  const flagIssues = allIssues.filter(i => i.severity === 'Flag');
  const monitorIssues = allIssues.filter(i => i.severity === 'Monitor');
  const completedQuickFixes = allIssues.filter(i => i.is_quick_fix && i.status === 'Completed');

  // Calculate costs
  const totalEstimatedCost = allIssues.reduce((sum, issue) => {
    const costMap = {
      'free': 0,
      '1-50': 25,
      '50-200': 125,
      '200-500': 350,
      '500-1500': 1000,
      '1500+': 3000,
      'unknown': 500
    };
    return sum + (costMap[issue.estimated_cost] || 0);
  }, 0);

  const overallCondition = urgentIssues.length > 0 ? 'Needs Attention' :
                           flagIssues.length > 2 ? 'Good' : 'Excellent';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white pb-8">
      <div className="mobile-container md:max-w-6xl md:mx-auto">
        {/* Header with Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            style={{ minHeight: '44px' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex gap-2">
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onEdit}
                style={{ minHeight: '44px' }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              className="hidden md:flex"
              style={{ minHeight: '44px' }}
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
          </div>
        </div>

        {/* Report Content */}
        <Card className="border-none shadow-sm mobile-card">
          <CardContent className="p-4 md:p-12 space-y-6 md:space-y-8">
            {/* Title */}
            <div className="text-center border-b pb-4 md:pb-6">
              <h1 className="font-bold mb-2" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
                INSPECTION REPORT
              </h1>
              <p className="font-semibold text-gray-700" style={{ fontSize: '20px' }}>
                {inspection.season} {inspection.year} Inspection
              </p>
            </div>

            {/* Property Info */}
            <div className="grid gap-4 md:grid-cols-2 md:gap-6">
              <div>
                <p className="text-sm text-gray-600">Property:</p>
                <p className="font-semibold" style={{ fontSize: '16px' }}>{property.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date:</p>
                <p className="font-semibold" style={{ fontSize: '16px' }}>
                  {new Date(inspection.inspection_date || inspection.created_date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Inspector:</p>
                <p className="font-semibold" style={{ fontSize: '16px' }}>{inspection.created_by || 'Property Owner'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration:</p>
                <p className="font-semibold" style={{ fontSize: '16px' }}>{inspection.duration_minutes || 0} minutes</p>
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* Executive Summary */}
            <div>
              <h2 className="font-bold mb-4 md:mb-6" style={{ color: '#1B365D', fontSize: '22px' }}>
                EXECUTIVE SUMMARY:
              </h2>
              
              <div className="grid gap-4 md:grid-cols-2 md:gap-6 mb-4 md:mb-6">
                <Card className={`border-2 ${
                  overallCondition === 'Excellent' ? 'border-green-300 bg-green-50' :
                  overallCondition === 'Good' ? 'border-blue-300 bg-blue-50' :
                  'border-orange-300 bg-orange-50'
                }`}>
                  <CardContent className="p-4 md:p-6">
                    <p className="text-sm text-gray-600 mb-1">Overall Property Condition:</p>
                    <p className="font-bold" style={{ color: '#1B365D', fontSize: '24px' }}>{overallCondition}</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {overallCondition === 'Excellent' ? 'Systems operating normally' :
                       overallCondition === 'Good' ? 'Systems operating normally with routine maintenance needed' :
                       'Systems require attention'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-300">
                  <CardContent className="p-4 md:p-6">
                    <p className="text-sm text-gray-600 mb-1">Issues Found:</p>
                    <p className="font-bold" style={{ color: '#1B365D', fontSize: '24px' }}>{allIssues.length}</p>
                    <div className="text-sm text-gray-700 mt-2 space-y-1">
                      {urgentIssues.length > 0 && <p>• {urgentIssues.length} Urgent (safety)</p>}
                      {flagIssues.length > 0 && <p>• {flagIssues.length} Flag (preventive)</p>}
                      {monitorIssues.length > 0 && <p>• {monitorIssues.length} Monitor (planning)</p>}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 md:gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Estimated Cost:</p>
                  <p className="font-bold text-gray-800" style={{ fontSize: '20px' }}>
                    ${totalEstimatedCost.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prevented Future Costs:</p>
                  <p className="font-bold text-green-700" style={{ fontSize: '20px' }}>
                    ${(totalEstimatedCost * 5).toLocaleString()}+
                  </p>
                  <p className="text-xs text-gray-600 mt-1">(if issues addressed promptly)</p>
                </div>
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* Findings by Area */}
            <div>
              <h2 className="font-bold mb-4 md:mb-6" style={{ color: '#1B365D', fontSize: '22px' }}>
                FINDINGS BY AREA:
              </h2>
              
              <div className="space-y-4 md:space-y-6">
                {/* Group issues by area */}
                {Array.from(new Set(allIssues.map(i => i.area))).map((areaName) => {
                  const areaIssues = allIssues.filter(i => i.area === areaName);
                  const hasIssues = areaIssues.length > 0;

                  return (
                    <div key={areaName}>
                      <h3 className="font-semibold mb-3" style={{ color: '#1B365D', fontSize: '18px' }}>
                        {areaName}:
                      </h3>
                      {hasIssues ? (
                        <ul className="space-y-2">
                          {areaIssues.map((issue, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              {issue.severity === 'Urgent' && <span className="text-red-600">🚨</span>}
                              {issue.severity === 'Flag' && <span className="text-orange-600">⚠️</span>}
                              {issue.severity === 'Monitor' && <span className="text-green-600">✅</span>}
                              <span className="text-gray-700">{issue.description}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          No issues found - area in good condition
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* Recommended Actions */}
            <div>
              <h2 className="font-bold mb-4 md:mb-6" style={{ color: '#1B365D', fontSize: '22px' }}>
                RECOMMENDED ACTIONS:
              </h2>
              
              {urgentIssues.length > 0 && (
                <div className="mb-4 md:mb-6">
                  <h3 className="font-semibold mb-3 text-red-700" style={{ fontSize: '18px' }}>
                    URGENT (This Week):
                  </h3>
                  <ol className="list-decimal ml-6 space-y-2">
                    {urgentIssues.map((issue, idx) => (
                      <li key={idx} className="text-gray-700">{issue.description}</li>
                    ))}
                  </ol>
                </div>
              )}

              {flagIssues.length > 0 && (
                <div className="mb-4 md:mb-6">
                  <h3 className="font-semibold mb-3 text-orange-700" style={{ fontSize: '18px' }}>
                    FLAG (Next 30-90 Days):
                  </h3>
                  <ol className="list-decimal ml-6 space-y-2" start={urgentIssues.length + 1}>
                    {flagIssues.map((issue, idx) => (
                      <li key={idx} className="text-gray-700">{issue.description}</li>
                    ))}
                  </ol>
                </div>
              )}

              {monitorIssues.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 text-green-700" style={{ fontSize: '18px' }}>
                    MONITOR (Next Inspection):
                  </h3>
                  <ol className="list-decimal ml-6 space-y-2" start={urgentIssues.length + flagIssues.length + 1}>
                    {monitorIssues.map((issue, idx) => (
                      <li key={idx} className="text-gray-700">{issue.description}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>

            {/* Maintenance Completed */}
            {completedQuickFixes.length > 0 && (
              <>
                <hr className="border-gray-300" />
                <div>
                  <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
                    MAINTENANCE COMPLETED DURING VISIT:
                  </h2>
                  <ul className="ml-6 space-y-1">
                    {completedQuickFixes.map((fix, idx) => (
                      <li key={idx} className="text-gray-700 flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        {fix.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            <hr className="border-gray-300" />

            {/* Next Inspection */}
            <div className="text-center py-4">
              <p className="font-semibold text-gray-700" style={{ fontSize: '16px' }}>
                Next Inspection Due: {
                  inspection.season === 'Spring' ? 'Summer' :
                  inspection.season === 'Summer' ? 'Fall' :
                  inspection.season === 'Fall' ? 'Winter' : 'Spring'
                } {inspection.season === 'Winter' ? inspection.year + 1 : inspection.year}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center pt-6">
          <Button
            onClick={onBack}
            className="w-full md:w-auto"
            style={{ backgroundColor: '#1B365D', minHeight: '56px' }}
          >
            Back to Inspection History
          </Button>
        </div>
      </div>
    </div>
  );
}