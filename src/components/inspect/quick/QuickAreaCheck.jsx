import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import CheckpointQuestion from '../shared/CheckpointQuestion';
import { getCheckpointsForArea } from '../shared/inspectionCheckpoints';

/**
 * QuickAreaCheck - Simplified yes/no check for a single area
 * Shows 3-4 quick questions, collects answers, moves on
 */
export default function QuickAreaCheck({
  area,
  areaIndex,
  totalAreas,
  existingResults,
  onComplete,
  onBack
}) {
  // Get checkpoints for this area
  const checkpoints = getCheckpointsForArea(area.id, 'quick');

  // Track answers: { checkpointId: { answer: 'good'|'bad', note?: string, photos?: [] } }
  const [answers, setAnswers] = useState(() => {
    if (existingResults?.checkpoints) {
      return existingResults.checkpoints.reduce((acc, cp) => {
        acc[cp.id] = { answer: cp.answer, note: cp.note, photos: cp.photos };
        return acc;
      }, {});
    }
    return {};
  });

  const handleAnswer = (checkpointId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [checkpointId]: { ...prev[checkpointId], answer }
    }));
  };

  const handleIssueDetails = (checkpointId, details) => {
    setAnswers(prev => ({
      ...prev,
      [checkpointId]: { ...prev[checkpointId], ...details }
    }));
  };

  const handleComplete = () => {
    // Build results
    const checkpointResults = checkpoints.map(cp => ({
      id: cp.id,
      area_id: area.id,
      question: cp.question,
      answer: answers[cp.id]?.answer || null,
      note: answers[cp.id]?.note || '',
      photos: answers[cp.id]?.photos || [],
      severity: cp.severity,
      is_issue: answers[cp.id]?.answer === 'bad'
    }));

    // Extract issues
    const issues = checkpointResults
      .filter(cp => cp.is_issue)
      .map(cp => ({
        checkpointId: cp.id,
        checkpointQuestion: cp.question,
        note: cp.note,
        photos: cp.photos,
        severity: cp.severity
      }));

    onComplete({
      checkpoints: checkpointResults,
      issues
    });
  };

  // Calculate progress
  const answeredCount = Object.values(answers).filter(a => a.answer).length;
  const progressPercent = (answeredCount / checkpoints.length) * 100;
  const allAnswered = answeredCount === checkpoints.length;

  // Count issues found
  const issuesFound = Object.values(answers).filter(a => a.answer === 'bad').length;

  return (
    <div className="min-h-screen bg-gray-50 pb-56">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Back and area indicator */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-900 min-h-[44px] -ml-2 px-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
            <span className="text-sm text-gray-500 font-medium">
              {areaIndex + 1} of {totalAreas}
            </span>
          </div>

          {/* Area title */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">{area.icon}</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{area.name}</h1>
              <p className="text-sm text-gray-500">
                {checkpoints.length} quick checks
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>{answeredCount} of {checkpoints.length} answered</span>
              {issuesFound > 0 && (
                <span className="text-orange-600 font-medium">
                  {issuesFound} issue{issuesFound > 1 ? 's' : ''} found
                </span>
              )}
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </div>

      {/* Checkpoints */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {checkpoints.map((checkpoint, index) => (
          <div key={checkpoint.id}>
            {/* Question number indicator */}
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                answers[checkpoint.id]?.answer
                  ? answers[checkpoint.id].answer === 'good'
                    ? 'bg-green-500 text-white'
                    : 'bg-orange-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              )}>
                {answers[checkpoint.id]?.answer ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                Check {index + 1}
              </span>
            </div>

            <CheckpointQuestion
              checkpoint={checkpoint}
              answer={answers[checkpoint.id]?.answer}
              onAnswer={(answer) => handleAnswer(checkpoint.id, answer)}
              onIssueDetails={(details) => handleIssueDetails(checkpoint.id, details)}
            />
          </div>
        ))}
      </div>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <div className="max-w-2xl mx-auto">
          {/* Summary */}
          <div className="flex items-center justify-between mb-3 text-sm">
            <span className="text-gray-600">
              {allAnswered
                ? 'All checks complete!'
                : `${checkpoints.length - answeredCount} checks remaining`}
            </span>
            {issuesFound > 0 && (
              <span className="text-orange-600 font-medium">
                {issuesFound} issue{issuesFound > 1 ? 's' : ''} to address
              </span>
            )}
          </div>

          {/* Action button */}
          <Button
            onClick={handleComplete}
            disabled={!allAnswered}
            className="w-full gap-2"
            style={{
              backgroundColor: allAnswered ? '#28A745' : undefined,
              minHeight: '56px',
              fontSize: '16px'
            }}
          >
            {areaIndex < totalAreas - 1 ? (
              <>
                Next Area
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Finish Quick Check
              </>
            )}
          </Button>

          {/* Skip option */}
          {!allAnswered && (
            <button
              onClick={handleComplete}
              className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              Skip remaining and continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
