import React, { useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Download, Printer, CheckCircle, AlertTriangle, Edit, Camera, DollarSign,
  Circle, Clock, Shield, TrendingUp, Home, Calendar, FileText, Share2, Save
} from "lucide-react";
import { useDemo } from "../shared/DemoContext";

// Stoplight colors configuration
const STOPLIGHT = {
  red: {
    bg: 'bg-red-50',
    border: 'border-red-400',
    headerBg: 'bg-red-600',
    text: 'text-red-800',
    icon: '🔴',
    label: 'CRITICAL / URGENT',
    timeline: 'Act within 24-72 hours',
    description: 'Safety hazard or imminent failure risk'
  },
  yellow: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    headerBg: 'bg-amber-500',
    text: 'text-amber-800',
    icon: '🟡',
    label: 'FLAG / ATTENTION',
    timeline: 'Address within 30-90 days',
    description: 'Needs attention to prevent escalation'
  },
  green: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-400',
    headerBg: 'bg-emerald-600',
    text: 'text-emerald-800',
    icon: '🟢',
    label: 'MONITOR / GOOD',
    timeline: 'Review at next inspection',
    description: 'Acceptable condition, track for changes'
  }
};

export default function InspectionReport({ inspection, property, baselineSystems, onBack, onEdit }) {
  const reportRef = useRef(null);
  const { demoMode } = useDemo();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
            <p className="text-gray-600 mb-6">Unable to load property information for this inspection.</p>
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

  const activeIssues = allIssues.filter(i => i.is_quick_fix !== true);

  // Categorize by stoplight color
  const redIssues = activeIssues.filter(i =>
    i.severity === 'Critical' || i.severity === 'Urgent' || i.stoplight === 'red'
  );
  const yellowIssues = activeIssues.filter(i =>
    i.severity === 'Flag' || i.severity === 'Moderate' || i.severity === 'Minor' || i.stoplight === 'yellow'
  );
  const greenIssues = activeIssues.filter(i =>
    i.severity === 'Monitor' || i.severity === 'Pass' || i.severity === 'Good' || i.stoplight === 'green'
  );
  const completedQuickFixes = allIssues.filter(i => i.is_quick_fix === true);

  // Calculate costs
  const totalEstimatedCost = activeIssues.reduce((sum, issue) => {
    if (issue.current_fix_cost) return sum + issue.current_fix_cost;
    const costMap = {
      'free': 0, '1-50': 25, '50-200': 125, '200-500': 350, '500-1500': 1000, '1500+': 3000, 'unknown': 500
    };
    return sum + (costMap[issue.estimated_cost] || 0);
  }, 0);

  const delayedCost = activeIssues.reduce((sum, issue) => {
    return sum + (issue.delayed_fix_cost || issue.current_fix_cost * 5 || 0);
  }, 0);

  // Overall grade
  const getOverallGrade = () => {
    if (redIssues.length >= 3) return { grade: 'D', label: 'Needs Immediate Attention', color: 'text-red-600' };
    if (redIssues.length >= 1) return { grade: 'C', label: 'Requires Attention', color: 'text-orange-600' };
    if (yellowIssues.length >= 3) return { grade: 'B', label: 'Good with Minor Issues', color: 'text-yellow-600' };
    if (yellowIssues.length >= 1) return { grade: 'B+', label: 'Good Condition', color: 'text-blue-600' };
    return { grade: 'A', label: 'Excellent Condition', color: 'text-green-600' };
  };

  const gradeInfo = getOverallGrade();

  const handlePrint = () => {
    window.print();
  };

  const handleSaveToTrack = () => {
    // In demo mode, show a message
    if (demoMode) {
      alert('In the full app, this report would be saved to your Track history for permanent record-keeping.');
      return;
    }
    // Real implementation would save to Track
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Inspection Report - ${property.address}`,
        text: `${inspection.season} ${inspection.year} inspection report`,
      });
    } else {
      // Fallback
      alert('Share functionality - copy link to clipboard');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-8 print:bg-white print:pb-0">
      {/* Action Bar - Hidden on Print */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} style={{ minHeight: '44px' }}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex gap-2">
            {onEdit && !demoMode && (
              <Button variant="outline" size="sm" onClick={onEdit} style={{ minHeight: '44px' }}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleSaveToTrack} style={{ minHeight: '44px' }}>
              <Save className="w-4 h-4 mr-1" />
              Save to Track
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} style={{ minHeight: '44px' }}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare} className="hidden md:flex" style={{ minHeight: '44px' }}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Main Report Content */}
      <div ref={reportRef} className="max-w-4xl mx-auto px-4 py-6 print:px-8 print:py-4">
        {/* Report Header */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 print:shadow-none print:border-2 print:border-gray-300">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-[#1B365D] to-[#2A4A7F] text-white p-6 print:p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-8 h-8" />
                  <span className="text-2xl font-bold">360° METHOD</span>
                </div>
                <h1 className="text-3xl font-bold mb-1 print:text-2xl">INSPECTION REPORT</h1>
                <p className="text-blue-200">{inspection.season} {inspection.year} Seasonal Assessment</p>
              </div>
              <div className="text-right">
                <div className={`text-6xl font-black ${gradeInfo.color} bg-white rounded-xl px-4 py-2 print:text-4xl`}>
                  {gradeInfo.grade}
                </div>
                <p className="text-sm text-blue-200 mt-2">{gradeInfo.label}</p>
              </div>
            </div>
          </div>

          {/* Property & Date Info */}
          <div className="p-6 bg-gray-50 border-b print:p-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Home className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Property</p>
                  <p className="font-bold text-gray-900 text-lg">{property.address}</p>
                  <p className="text-sm text-gray-600">{property.city}, {property.state} {property.zip_code}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500 font-medium">Inspection Date</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {formatDate(inspection.inspection_date || inspection.created_date)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Duration: {inspection.duration_minutes || 30} minutes
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Stoplight Summary Dashboard */}
          <div className="p-6 print:p-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              STOPLIGHT SUMMARY
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Red */}
              <div className={`rounded-xl p-4 ${STOPLIGHT.red.bg} border-2 ${STOPLIGHT.red.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{STOPLIGHT.red.icon}</span>
                  <span className="font-bold text-red-800">CRITICAL</span>
                </div>
                <p className="text-4xl font-black text-red-700">{redIssues.length}</p>
                <p className="text-xs text-red-700 mt-1">{STOPLIGHT.red.timeline}</p>
              </div>

              {/* Yellow */}
              <div className={`rounded-xl p-4 ${STOPLIGHT.yellow.bg} border-2 ${STOPLIGHT.yellow.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{STOPLIGHT.yellow.icon}</span>
                  <span className="font-bold text-amber-800">FLAG</span>
                </div>
                <p className="text-4xl font-black text-amber-700">{yellowIssues.length}</p>
                <p className="text-xs text-amber-700 mt-1">{STOPLIGHT.yellow.timeline}</p>
              </div>

              {/* Green */}
              <div className={`rounded-xl p-4 ${STOPLIGHT.green.bg} border-2 ${STOPLIGHT.green.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{STOPLIGHT.green.icon}</span>
                  <span className="font-bold text-emerald-800">MONITOR</span>
                </div>
                <p className="text-4xl font-black text-emerald-700">{greenIssues.length}</p>
                <p className="text-xs text-emerald-700 mt-1">{STOPLIGHT.green.timeline}</p>
              </div>
            </div>

            {/* Cost Analysis */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Cost to Address Now</span>
                </div>
                <p className="text-3xl font-black text-blue-700">${totalEstimatedCost.toLocaleString()}</p>
                <p className="text-xs text-blue-600 mt-1">Proactive maintenance investment</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-900">Cost if Delayed</span>
                </div>
                <p className="text-3xl font-black text-red-700">${delayedCost.toLocaleString()}</p>
                <p className="text-xs text-red-600 mt-1">Emergency repair costs if ignored</p>
              </div>
            </div>

            {delayedCost > totalEstimatedCost && (
              <div className="mt-4 bg-green-50 rounded-lg p-4 border-2 border-green-300 text-center">
                <div className="flex items-center justify-center gap-2 text-green-800">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold">Potential Savings by Acting Now:</span>
                  <span className="text-2xl font-black">${(delayedCost - totalEstimatedCost).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DETAILED FINDINGS - RED */}
        {redIssues.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 print:shadow-none print:border-2 print:border-red-300 print:break-inside-avoid">
            <div className={`${STOPLIGHT.red.headerBg} text-white px-6 py-4`}>
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="text-2xl">{STOPLIGHT.red.icon}</span>
                CRITICAL / URGENT ITEMS ({redIssues.length})
              </h2>
              <p className="text-red-100 text-sm mt-1">{STOPLIGHT.red.description} - {STOPLIGHT.red.timeline}</p>
            </div>
            <div className="p-6 space-y-4 print:p-4">
              {redIssues.map((issue, idx) => (
                <StoplightFindingCard key={idx} finding={issue} number={idx + 1} color="red" />
              ))}
            </div>
          </div>
        )}

        {/* DETAILED FINDINGS - YELLOW */}
        {yellowIssues.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 print:shadow-none print:border-2 print:border-amber-300 print:break-inside-avoid">
            <div className={`${STOPLIGHT.yellow.headerBg} text-white px-6 py-4`}>
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="text-2xl">{STOPLIGHT.yellow.icon}</span>
                FLAG / ATTENTION ITEMS ({yellowIssues.length})
              </h2>
              <p className="text-amber-100 text-sm mt-1">{STOPLIGHT.yellow.description} - {STOPLIGHT.yellow.timeline}</p>
            </div>
            <div className="p-6 space-y-4 print:p-4">
              {yellowIssues.map((issue, idx) => (
                <StoplightFindingCard key={idx} finding={issue} number={redIssues.length + idx + 1} color="yellow" />
              ))}
            </div>
          </div>
        )}

        {/* DETAILED FINDINGS - GREEN */}
        {greenIssues.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 print:shadow-none print:border-2 print:border-emerald-300 print:break-inside-avoid">
            <div className={`${STOPLIGHT.green.headerBg} text-white px-6 py-4`}>
              <h2 className="text-xl font-bold flex items-center gap-3">
                <span className="text-2xl">{STOPLIGHT.green.icon}</span>
                MONITOR ITEMS ({greenIssues.length})
              </h2>
              <p className="text-emerald-100 text-sm mt-1">{STOPLIGHT.green.description} - {STOPLIGHT.green.timeline}</p>
            </div>
            <div className="p-6 space-y-4 print:p-4">
              {greenIssues.map((issue, idx) => (
                <StoplightFindingCard key={idx} finding={issue} number={redIssues.length + yellowIssues.length + idx + 1} color="green" />
              ))}
            </div>
          </div>
        )}

        {/* QUICK FIXES COMPLETED */}
        {completedQuickFixes.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 print:shadow-none print:border-2 print:border-green-300 print:break-inside-avoid">
            <div className="bg-green-600 text-white px-6 py-4">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <CheckCircle className="w-6 h-6" />
                COMPLETED DURING INSPECTION ({completedQuickFixes.length})
              </h2>
              <p className="text-green-100 text-sm mt-1">Issues resolved on-site during the walkthrough</p>
            </div>
            <div className="p-6 space-y-3 print:p-4">
              {completedQuickFixes.map((fix, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-green-50 rounded-lg p-4 border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{fix.area_name || fix.area}</p>
                    <p className="text-sm text-gray-700">{fix.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACTION PLAN TIMELINE */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 print:shadow-none print:border-2 print:border-gray-300 print:break-inside-avoid">
          <div className="bg-[#1B365D] text-white px-6 py-4">
            <h2 className="text-xl font-bold flex items-center gap-3">
              <Clock className="w-6 h-6" />
              RECOMMENDED ACTION TIMELINE
            </h2>
            <p className="text-blue-200 text-sm mt-1">Prioritized maintenance schedule based on findings</p>
          </div>
          <div className="p-6 space-y-4 print:p-4">
            {redIssues.length > 0 && (
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <h3 className="font-bold text-red-700 mb-2">THIS WEEK (Urgent)</h3>
                <ol className="list-decimal ml-4 space-y-1">
                  {redIssues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-gray-800">
                      <strong>{issue.area_name || issue.location}</strong>: {issue.item_name || issue.description?.substring(0, 80)}
                      {issue.current_fix_cost && <span className="text-gray-500"> (${issue.current_fix_cost})</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {yellowIssues.length > 0 && (
              <div className="border-l-4 border-amber-500 pl-4 py-2">
                <h3 className="font-bold text-amber-700 mb-2">NEXT 30-90 DAYS</h3>
                <ol className="list-decimal ml-4 space-y-1" start={redIssues.length + 1}>
                  {yellowIssues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-gray-800">
                      <strong>{issue.area_name || issue.location}</strong>: {issue.item_name || issue.description?.substring(0, 80)}
                      {issue.current_fix_cost && <span className="text-gray-500"> (${issue.current_fix_cost})</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {greenIssues.length > 0 && (
              <div className="border-l-4 border-emerald-500 pl-4 py-2">
                <h3 className="font-bold text-emerald-700 mb-2">MONITOR AT NEXT INSPECTION</h3>
                <ol className="list-decimal ml-4 space-y-1" start={redIssues.length + yellowIssues.length + 1}>
                  {greenIssues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-gray-800">
                      <strong>{issue.area_name || issue.location}</strong>: {issue.item_name || issue.description?.substring(0, 80)}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </div>

        {/* Next Inspection */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 print:shadow-none print:border-2 print:border-gray-300">
          <div className="p-6 text-center print:p-4">
            <p className="text-gray-600 mb-2">Next Recommended Inspection:</p>
            <p className="text-2xl font-bold text-[#1B365D]">
              {inspection.season === 'Spring' ? 'Summer' :
               inspection.season === 'Summer' ? 'Fall' :
               inspection.season === 'Fall' ? 'Winter' : 'Spring'} {inspection.season === 'Winter' ? inspection.year + 1 : inspection.year}
            </p>
            <p className="text-sm text-gray-500 mt-2">Quarterly inspections catch 90% of problems before they become emergencies</p>
          </div>
        </div>

        {/* CTA for Demo */}
        {demoMode && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg overflow-hidden mb-6 print:hidden">
            <div className="p-6 text-center text-white">
              <h3 className="text-xl font-bold mb-2">Ready to Create Your Own Inspection Reports?</h3>
              <p className="text-green-100 mb-4">
                Start your free account and protect your property with professional documentation.
              </p>
              <Button
                onClick={() => window.location.href = '/Login'}
                className="bg-white text-green-700 hover:bg-gray-100 font-bold"
                style={{ minHeight: '48px' }}
              >
                Start Free Today
              </Button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm py-4 print:py-2">
          <p>Generated by 360° Method | {formatDate(new Date().toISOString())}</p>
          <p className="text-xs mt-1">Professional Property Maintenance Documentation</p>
        </div>

        {/* Back Button - Not on Print */}
        <div className="flex justify-center pt-4 print:hidden">
          <Button
            onClick={onBack}
            className="w-full md:w-auto"
            style={{ backgroundColor: '#1B365D', minHeight: '56px' }}
          >
            Back to Inspection History
          </Button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}

// Stoplight Finding Card Component
function StoplightFindingCard({ finding, number, color }) {
  const config = STOPLIGHT[color];

  const areaName = finding.area_name || finding.location || finding.area_id || 'Unknown Area';
  const issueTitle = finding.item_name || finding.issue || finding.description?.substring(0, 60) || 'Issue';
  const issueDescription = finding.description || finding.notes || 'No description provided';
  const photos = finding.photo_urls || finding.photos || [];
  const estimatedCost = finding.current_fix_cost || finding.estimated_cost || 0;
  const delayedCost = finding.delayed_fix_cost || null;

  return (
    <div className={`rounded-lg border-2 ${config.border} ${config.bg} overflow-hidden print:break-inside-avoid`}>
      {/* Finding Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-xl">{config.icon}</span>
          <span className="font-bold text-gray-500">#{number}</span>
          <Badge variant="outline" className="text-xs">{areaName}</Badge>
        </div>
        {estimatedCost > 0 && (
          <Badge className="bg-gray-100 text-gray-800 font-semibold">
            Est. ${typeof estimatedCost === 'number' ? estimatedCost.toLocaleString() : estimatedCost}
          </Badge>
        )}
      </div>

      {/* Finding Content */}
      <div className="p-4">
        <h4 className={`font-bold text-lg mb-2 ${config.text}`}>{issueTitle}</h4>
        <p className="text-gray-700 mb-3">{issueDescription}</p>

        {/* Recommendation */}
        {finding.recommendation && (
          <div className="bg-white rounded-lg p-3 mb-3 border border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-1 uppercase">Recommended Action</p>
            <p className="text-sm text-gray-800">{finding.recommendation}</p>
          </div>
        )}

        {/* Cost Comparison */}
        {delayedCost && delayedCost > estimatedCost && (
          <div className="flex items-center gap-4 text-sm mb-3">
            <div className="flex items-center gap-1 text-green-700">
              <DollarSign className="w-4 h-4" />
              <span>Fix now: ${estimatedCost.toLocaleString()}</span>
            </div>
            <span className="text-gray-400">vs</span>
            <div className="flex items-center gap-1 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span>If delayed: ${delayedCost.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Cascade Risk */}
        {finding.cascade_risk && finding.cascade_risk !== 'None' && (
          <div className="flex items-center gap-2 text-sm text-orange-700 mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-semibold">Cascade Risk:</span>
            <span>{finding.cascade_risk}</span>
          </div>
        )}

        {/* Photos */}
        {photos && photos.length > 0 && (
          <div className="mt-3">
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
              <Camera className="w-3 h-3" />
              Photo Documentation:
            </p>
            <div className="flex gap-2 flex-wrap">
              {photos.map((url, idx) => (
                <img
                  key={idx}
                  src={url}
                  alt={`Finding ${number} photo ${idx + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
