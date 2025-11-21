import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Mail, Printer, CheckCircle, AlertTriangle, Edit, Camera, DollarSign } from "lucide-react";

export default function InspectionReport({ inspection, property, baselineSystems, onBack, onEdit }) {
  // Scroll to top when component mounts
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Handle null inspection or property at the earliest point
  if (!inspection) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="border-none shadow-lg max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Inspection Data</h1>
            <p className="text-gray-600 mb-6">Unable to load inspection report. Please go back and try again.</p>
            <Button onClick={onBack} style={{ backgroundColor: '#1B365D' }}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="border-none shadow-lg max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">No Property Data</h1>
            <p className="text-gray-600 mb-6">Unable to load property information for this inspection. Please go back and try again.</p>
            <Button onClick={onBack} style={{ backgroundColor: '#1B365D' }}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Support both formats: checklist_items (real) and findings (demo)
  const allIssues = Array.isArray(inspection?.findings) ? inspection.findings : 
                    Array.isArray(inspection?.checklist_items) ? inspection.checklist_items : [];
  const urgentIssues = allIssues.filter(i => i.severity === 'Critical' || i.severity === 'Urgent' || i.severity === 'Moderate');
  const flagIssues = allIssues.filter(i => i.severity === 'Flag' || i.severity === 'Minor');
  const monitorIssues = allIssues.filter(i => i.severity === 'Monitor' || i.severity === 'Pass' || i.severity === 'Documentation');
  const completedQuickFixes = allIssues.filter(i => i.is_quick_fix && i.status === 'Completed');
  const issuesWithPhotos = allIssues.filter(i => (i.photo_urls && i.photo_urls.length > 0) || (i.photos && i.photos.length > 0));

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
                      {completedQuickFixes.length > 0 && <p className="text-green-700">• {completedQuickFixes.length} Fixed during visit</p>}
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
                  <p className="text-xs text-gray-600 mt-1">To address all identified issues</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Prevented Future Costs:</p>
                  <p className="font-bold text-green-700" style={{ fontSize: '20px' }}>
                    ${(totalEstimatedCost * 5).toLocaleString()}+
                  </p>
                  <p className="text-xs text-gray-600 mt-1">(if issues addressed promptly)</p>
                </div>
              </div>

              {issuesWithPhotos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    {issuesWithPhotos.length} issue{issuesWithPhotos.length > 1 ? 's' : ''} documented with photos
                  </p>
                </div>
              )}
            </div>

            <hr className="border-gray-300" />

            {/* Detailed Findings */}
            <div>
              <h2 className="font-bold mb-4 md:mb-6" style={{ color: '#1B365D', fontSize: '22px' }}>
                DETAILED FINDINGS:
              </h2>
              
              <div className="space-y-6">
                {/* Urgent Issues */}
                {urgentIssues.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4 text-red-700 flex items-center gap-2" style={{ fontSize: '20px' }}>
                      <span className="text-2xl">🚨</span>
                      URGENT ISSUES ({urgentIssues.length})
                    </h3>
                    <div className="space-y-4">
                     {urgentIssues.map((issue, idx) => (
                       <FindingCard key={idx} finding={issue} number={idx + 1} />
                     ))}
                    </div>
                  </div>
                )}

                {/* Flag Issues */}
                {flagIssues.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4 text-orange-700 flex items-center gap-2" style={{ fontSize: '20px' }}>
                      <span className="text-2xl">⚠️</span>
                      FLAG ISSUES ({flagIssues.length})
                    </h3>
                    <div className="space-y-4">
                     {flagIssues.map((issue, idx) => (
                       <FindingCard key={idx} finding={issue} number={urgentIssues.length + idx + 1} />
                     ))}
                    </div>
                  </div>
                )}

                {/* Monitor Issues */}
                {monitorIssues.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4 text-green-700 flex items-center gap-2" style={{ fontSize: '20px' }}>
                      <span className="text-2xl">✅</span>
                      MONITOR ITEMS ({monitorIssues.length})
                    </h3>
                    <div className="space-y-4">
                     {monitorIssues.map((issue, idx) => (
                       <FindingCard 
                         key={idx} 
                         finding={issue} 
                         number={urgentIssues.length + flagIssues.length + idx + 1} 
                       />
                     ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Maintenance Completed */}
            {completedQuickFixes.length > 0 && (
              <>
                <hr className="border-gray-300" />
                <div>
                  <h2 className="font-bold mb-4" style={{ color: '#1B365D', fontSize: '22px' }}>
                    ✓ MAINTENANCE COMPLETED DURING VISIT:
                  </h2>
                  <div className="space-y-3">
                    {completedQuickFixes.map((fix, idx) => (
                      <Card key={idx} className="border-2 border-green-300 bg-green-50">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{fix.area}</p>
                              <p className="text-sm text-gray-700 mt-1">{fix.description}</p>
                              {fix.photo_urls && fix.photo_urls.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                  {fix.photo_urls.map((url, photoIdx) => (
                                    <img
                                      key={photoIdx}
                                      src={url}
                                      alt={`Fixed issue ${photoIdx + 1}`}
                                      className="w-20 h-20 object-cover rounded border"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}

            <hr className="border-gray-300" />

            {/* Recommended Actions Summary */}
            <div>
              <h2 className="font-bold mb-4 md:mb-6" style={{ color: '#1B365D', fontSize: '22px' }}>
                RECOMMENDED ACTIONS TIMELINE:
              </h2>
              
              <div className="space-y-4">
                {urgentIssues.length > 0 && (
                  <Card className="border-2 border-red-300 bg-red-50">
                    <CardContent className="p-4">
                      <p className="font-bold text-red-800 mb-2">THIS WEEK:</p>
                      <ol className="list-decimal ml-5 space-y-1">
                        {urgentIssues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-800">
                            {issue.area}: {issue.description?.substring(0, 100) || 'No description'}
                            {issue.description && issue.description.length > 100 ? '...' : ''}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}

                {flagIssues.length > 0 && (
                  <Card className="border-2 border-orange-300 bg-orange-50">
                    <CardContent className="p-4">
                      <p className="font-bold text-orange-800 mb-2">NEXT 30-90 DAYS:</p>
                      <ol className="list-decimal ml-5 space-y-1" start={urgentIssues.length + 1}>
                        {flagIssues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-800">
                            {issue.area}: {issue.description?.substring(0, 100) || 'No description'}
                            {issue.description && issue.description.length > 100 ? '...' : ''}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}

                {monitorIssues.length > 0 && (
                  <Card className="border-2 border-green-300 bg-green-50">
                    <CardContent className="p-4">
                      <p className="font-bold text-green-800 mb-2">MONITOR AT NEXT INSPECTION:</p>
                      <ol className="list-decimal ml-5 space-y-1" start={urgentIssues.length + flagIssues.length + 1}>
                        {monitorIssues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-800">
                            {issue.area}: {issue.description?.substring(0, 100) || 'No description'}
                            {issue.description && issue.description.length > 100 ? '...' : ''}
                          </li>
                        ))}
                      </ol>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <hr className="border-gray-300" />

            {/* Operator CTA */}
            <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200 text-center">
              <p className="text-gray-800 mb-2">
                <strong>Don't want to DIY?</strong>
              </p>
              <p className="text-sm text-gray-700 mb-3">
                A 360° Operator can handle all maintenance for you
              </p>
              <Button
                onClick={() => window.location.href = '/waitlist?source=inspection_report'}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                style={{ minHeight: '48px' }}
              >
                Learn About Full-Service Care →
              </Button>
            </div>

            <hr className="border-gray-300" />

            {/* Next Inspection */}
            <div className="text-center py-4">
              <p className="font-semibold text-gray-700 mb-2" style={{ fontSize: '16px' }}>
                Next Inspection Due:
              </p>
              <p className="font-bold" style={{ color: '#1B365D', fontSize: '20px' }}>
                {
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

function IssueDetailCard({ issue, number }) {
  const costMap = {
    'free': 'Free (DIY)',
    '1-50': '$1-50',
    '50-200': '$50-200',
    '200-500': '$200-500',
    '500-1500': '$500-1,500',
    '1500+': '$1,500+',
    'unknown': 'Unknown'
  };

  const severityColors = {
    'Urgent': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800' },
    'Flag': { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800' },
    'Monitor': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800' }
  };

  const colors = severityColors[issue.severity] || severityColors['Monitor'];

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${colors.text} bg-white border-2 ${colors.border}`}>
                Issue #{number}
              </Badge>
              <Badge variant="outline">
                {issue.area}
              </Badge>
            </div>
            <p className="font-semibold text-gray-900 mb-1">
              {issue.system_name || issue.area}
            </p>
          </div>
        </div>

        <p className="text-gray-800 mb-3">{issue.description || 'No description provided.'}</p>

        {/* Cost and Action */}
        <div className="flex flex-wrap gap-3 mb-3">
          {issue.estimated_cost && (
            <div className="flex items-center gap-1 text-sm">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <span className="font-semibold">Est. Cost:</span>
              <span>{costMap[issue.estimated_cost]}</span>
            </div>
          )}
          {issue.who_will_fix && issue.who_will_fix !== 'not_sure' && (
            <Badge variant="outline" className="text-xs">
              {issue.who_will_fix === 'diy' ? '🔧 DIY' : '👷 Professional'}
            </Badge>
          )}
        </div>

        {/* Photos */}
        {issue.photo_urls && issue.photo_urls.length > 0 && (
          <div>
            <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Documentation Photos:
            </p>
            <div className="flex gap-2 flex-wrap">
              {issue.photo_urls.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Issue ${number} photo ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded border-2 border-gray-200"
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// New component for demo data findings
function FindingCard({ finding, number }) {
  const severityColors = {
    'Critical': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800' },
    'Urgent': { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800' },
    'Moderate': { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800' },
    'Minor': { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800' },
    'Flag': { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800' },
    'Pass': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800' },
    'Monitor': { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800' },
    'Documentation': { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800' }
  };

  const colors = severityColors[finding.severity] || severityColors['Monitor'];

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={`${colors.text} bg-white border-2 ${colors.border}`}>
                Finding #{number}
              </Badge>
              <Badge variant="outline">
                {finding.location}
              </Badge>
              <Badge className={`${colors.text}`}>
                {finding.severity}
              </Badge>
            </div>
            <p className="font-semibold text-gray-900 text-lg mb-1">
              {finding.issue}
            </p>
          </div>
        </div>

        <p className="text-gray-800 mb-2">{finding.description}</p>

        {/* Recommendation */}
        {finding.recommendation && (
          <div className="bg-white rounded p-3 mb-3 border border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-1">Recommendation:</p>
            <p className="text-sm text-gray-800">{finding.recommendation}</p>
          </div>
        )}

        {/* Cost and Risk */}
        <div className="flex flex-wrap gap-3 mb-3 text-sm">
          {finding.estimated_cost > 0 && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <span className="font-semibold">Est. Cost:</span>
              <span className="text-gray-800">${finding.estimated_cost}</span>
            </div>
          )}
          {finding.cascade_risk && finding.cascade_risk !== 'None' && (
            <div className="flex items-center gap-1 text-orange-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-semibold">Risk:</span>
              <span>{finding.cascade_risk}</span>
            </div>
          )}
        </div>

        {/* Photos */}
        {finding.photos && finding.photos.length > 0 && (
          <div>
            <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Documentation Photos:
            </p>
            <div className="flex gap-2 flex-wrap">
              {finding.photos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Finding ${number} photo ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded border-2 border-gray-200"
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}