import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { INSPECTION_AREAS } from '../shared/inspectionAreas';

/**
 * QuickCheckComplete - Lightweight completion screen for quick spot check
 * No formal report - just a summary and next steps
 */
export default function QuickCheckComplete({
  areasChecked,
  issuesFound,
  results,
  onDone,
  onCheckAnother
}) {
  // Collect all issues with area info
  const allIssues = Object.entries(results).flatMap(([areaId, data]) => {
    const area = INSPECTION_AREAS.find(a => a.id === areaId);
    return (data.issues || []).map(issue => ({
      ...issue,
      areaId,
      areaName: area?.name || 'Unknown',
      areaIcon: area?.icon || '📋'
    }));
  });

  // Group issues by severity
  const urgentIssues = allIssues.filter(i => i.severity === 'Urgent');
  const flagIssues = allIssues.filter(i => i.severity === 'Flag');
  const monitorIssues = allIssues.filter(i => i.severity === 'Monitor');

  const hasUrgent = urgentIssues.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Success header */}
      <div className={cn(
        'pt-12 pb-8 px-4 text-center',
        hasUrgent
          ? 'bg-gradient-to-b from-orange-100 to-gray-50'
          : 'bg-gradient-to-b from-green-100 to-gray-50'
      )}>
        <div className={cn(
          'w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center',
          hasUrgent ? 'bg-orange-500' : 'bg-green-500'
        )}>
          {hasUrgent ? (
            <AlertTriangle className="w-10 h-10 text-white" />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-white" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {hasUrgent ? 'Issues Found!' : 'Quick Check Complete!'}
        </h1>

        <p className="text-gray-600">
          {areasChecked} area{areasChecked > 1 ? 's' : ''} checked
          {issuesFound > 0 && ` • ${issuesFound} issue${issuesFound > 1 ? 's' : ''} found`}
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-4 space-y-4">
        {/* Results summary */}
        {issuesFound === 0 ? (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-6 text-center">
              <span className="text-4xl mb-3 block">🎉</span>
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                Everything Looks Good!
              </h2>
              <p className="text-sm text-green-700">
                No issues found in your quick check. Keep up the great maintenance!
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Urgent issues */}
            {urgentIssues.length > 0 && (
              <Card className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <h3 className="font-semibold text-red-800">
                      Urgent - Act Soon ({urgentIssues.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {urgentIssues.map((issue, idx) => (
                      <IssueItem key={idx} issue={issue} severity="urgent" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Flag issues */}
            {flagIssues.length > 0 && (
              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <h3 className="font-semibold text-orange-800">
                      Attention Needed ({flagIssues.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {flagIssues.map((issue, idx) => (
                      <IssueItem key={idx} issue={issue} severity="flag" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Monitor issues */}
            {monitorIssues.length > 0 && (
              <Card className="border-yellow-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <h3 className="font-semibold text-yellow-800">
                      Monitor ({monitorIssues.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {monitorIssues.map((issue, idx) => (
                      <IssueItem key={idx} issue={issue} severity="monitor" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tasks created notice */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-1">
                      {issuesFound} Task{issuesFound > 1 ? 's' : ''} Created
                    </h3>
                    <p className="text-sm text-blue-700">
                      All issues have been added to your Priority Queue for follow-up.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Areas checked summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Areas Checked</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(results).map(areaId => {
                const area = INSPECTION_AREAS.find(a => a.id === areaId);
                const areaResults = results[areaId];
                const hasIssues = (areaResults.issues?.length || 0) > 0;

                return (
                  <div
                    key={areaId}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg',
                      hasIssues ? 'bg-orange-50 border border-orange-200' : 'bg-green-50 border border-green-200'
                    )}
                  >
                    <span className="text-xl">{area?.icon}</span>
                    <span className="text-sm font-medium text-gray-700">
                      {area?.name}
                    </span>
                    {hasIssues ? (
                      <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">
                        {areaResults.issues.length}
                      </span>
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action buttons */}
        <div className="space-y-3 pt-4">
          {issuesFound > 0 && (
            <Button
              onClick={onDone}
              className="w-full gap-2"
              style={{ backgroundColor: '#1B365D', minHeight: '56px', fontSize: '16px' }}
            >
              View Priority Queue
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}

          <Button
            onClick={onCheckAnother}
            variant="outline"
            className="w-full gap-2"
            style={{ minHeight: '56px' }}
          >
            <RotateCcw className="w-5 h-5" />
            Check Other Areas
          </Button>

          <Button
            onClick={onDone}
            variant="ghost"
            className="w-full gap-2"
            style={{ minHeight: '48px' }}
          >
            <Home className="w-5 h-5" />
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

// Individual issue item
function IssueItem({ issue, severity }) {
  const severityColors = {
    urgent: 'bg-red-100 border-red-200',
    flag: 'bg-orange-100 border-orange-200',
    monitor: 'bg-yellow-100 border-yellow-200'
  };

  return (
    <div className={cn(
      'p-3 rounded-lg border',
      severityColors[severity]
    )}>
      <div className="flex items-start gap-3">
        <span className="text-xl">{issue.areaIcon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">
            {issue.checkpointQuestion}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {issue.areaName}
          </p>
          {issue.note && (
            <p className="text-sm text-gray-600 mt-2 italic">
              "{issue.note}"
            </p>
          )}
          {issue.photos?.length > 0 && (
            <div className="flex gap-2 mt-2">
              {issue.photos.map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`Issue ${idx + 1}`}
                  className="w-12 h-12 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
