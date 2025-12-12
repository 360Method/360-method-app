import React from 'react';
import { CheckCircle2, AlertTriangle, FileText, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getOrderedAreasForWalkthrough } from '../shared/inspectionAreas';
import { AUDIO_GUIDANCE } from '../shared/audioGuidanceText';

/**
 * WalkthroughComplete - Success screen after full walkthrough
 * Shows summary and links to full report
 */
export default function WalkthroughComplete({
  areasChecked,
  totalAreas,
  issuesFound,
  urgentCount,
  flagCount,
  results,
  inspectionId,
  onViewReport,
  onDone
}) {
  const orderedAreas = getOrderedAreasForWalkthrough();
  const monitorCount = issuesFound - urgentCount - flagCount;
  const hasUrgent = urgentCount > 0;
  const completionPercent = Math.round((areasChecked / totalAreas) * 100);

  // Get completion message from audio guidance
  const getCompletionMessage = () => {
    if (hasUrgent) {
      return AUDIO_GUIDANCE.completion.issuesFound;
    }
    if (issuesFound === 0) {
      return AUDIO_GUIDANCE.completion.noIssues;
    }
    return AUDIO_GUIDANCE.completion.allDone;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Success header */}
      <div className={cn(
        'pt-12 pb-16 px-4 text-center',
        hasUrgent
          ? 'bg-gradient-to-b from-orange-500 to-orange-600'
          : 'bg-gradient-to-b from-green-500 to-green-600'
      )}>
        <div className="max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            {hasUrgent ? (
              <AlertTriangle className="w-12 h-12 text-white" />
            ) : (
              <CheckCircle2 className="w-12 h-12 text-white" />
            )}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            {hasUrgent ? 'Walkthrough Complete!' : 'Excellent Work!'}
          </h1>

          <p className="text-white/90 mb-4">
            {getCompletionMessage()}
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-6 text-white">
            <div className="text-center">
              <p className="text-3xl font-bold">{areasChecked}</p>
              <p className="text-sm text-white/80">Areas Checked</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{issuesFound}</p>
              <p className="text-sm text-white/80">Issues Found</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold">{completionPercent}%</p>
              <p className="text-sm text-white/80">Complete</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8 space-y-4">
        {/* Stoplight summary card */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
            <h2 className="font-semibold text-gray-900 mb-4 text-center">
              Inspection Summary
            </h2>

            {/* Stoplight indicators */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Urgent */}
              <div className={cn(
                'text-center p-4 rounded-xl',
                urgentCount > 0 ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'
              )}>
                <div className={cn(
                  'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center',
                  urgentCount > 0 ? 'bg-red-500' : 'bg-gray-300'
                )}>
                  <span className="text-xl text-white font-bold">{urgentCount}</span>
                </div>
                <p className={cn(
                  'text-sm font-medium',
                  urgentCount > 0 ? 'text-red-700' : 'text-gray-500'
                )}>
                  Urgent
                </p>
                <p className="text-xs text-gray-500">Act within 72hrs</p>
              </div>

              {/* Flag */}
              <div className={cn(
                'text-center p-4 rounded-xl',
                flagCount > 0 ? 'bg-orange-50 border-2 border-orange-200' : 'bg-gray-50'
              )}>
                <div className={cn(
                  'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center',
                  flagCount > 0 ? 'bg-orange-500' : 'bg-gray-300'
                )}>
                  <span className="text-xl text-white font-bold">{flagCount}</span>
                </div>
                <p className={cn(
                  'text-sm font-medium',
                  flagCount > 0 ? 'text-orange-700' : 'text-gray-500'
                )}>
                  Attention
                </p>
                <p className="text-xs text-gray-500">Within 90 days</p>
              </div>

              {/* Good/Monitor */}
              <div className={cn(
                'text-center p-4 rounded-xl',
                monitorCount > 0 || issuesFound === 0 ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
              )}>
                <div className={cn(
                  'w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center',
                  'bg-green-500'
                )}>
                  <span className="text-xl text-white font-bold">
                    {issuesFound === 0 ? '✓' : monitorCount}
                  </span>
                </div>
                <p className="text-sm font-medium text-green-700">
                  {issuesFound === 0 ? 'All Good' : 'Monitor'}
                </p>
                <p className="text-xs text-gray-500">
                  {issuesFound === 0 ? 'No issues found' : 'Next inspection'}
                </p>
              </div>
            </div>

            {/* Tasks created */}
            {issuesFound > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">{issuesFound} task{issuesFound > 1 ? 's' : ''}</span>
                  {' '}automatically added to your Priority Queue
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Areas summary */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Areas Inspected</h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {orderedAreas.map(area => {
                const areaResults = results[area.id];
                const isChecked = !!areaResults;
                const hasIssues = (areaResults?.issues?.length || 0) > 0;

                return (
                  <div
                    key={area.id}
                    className={cn(
                      'flex flex-col items-center justify-center p-2 rounded-lg',
                      isChecked
                        ? hasIssues
                          ? 'bg-orange-50'
                          : 'bg-green-50'
                        : 'bg-gray-50'
                    )}
                  >
                    <span className="text-2xl">{area.icon}</span>
                    {isChecked && (
                      <div className={cn(
                        'w-4 h-4 rounded-full flex items-center justify-center mt-1',
                        hasIssues ? 'bg-orange-500' : 'bg-green-500'
                      )}>
                        {hasIssues ? (
                          <span className="text-[10px] text-white font-bold">
                            {areaResults.issues.length}
                          </span>
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Report available */}
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900">Full Report Ready</h3>
                <p className="text-sm text-blue-700">
                  View your detailed inspection report with the stoplight system
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next steps message */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            {AUDIO_GUIDANCE.completion.nextSteps}
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={onViewReport}
            className="w-full gap-2"
            style={{ backgroundColor: '#1B365D', minHeight: '56px', fontSize: '16px' }}
          >
            <FileText className="w-5 h-5" />
            View Full Report
          </Button>

          {issuesFound > 0 && (
            <Button
              onClick={onDone}
              variant="outline"
              className="w-full gap-2"
              style={{ minHeight: '56px' }}
            >
              View Priority Queue
              <ArrowRight className="w-5 h-5" />
            </Button>
          )}

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

        {/* Achievement hint */}
        {issuesFound >= 10 && (
          <div className="text-center py-4">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-full text-sm text-yellow-800">
              <span>🦅</span>
              <span>Eagle Eye achievement unlocked!</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
