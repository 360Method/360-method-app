import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import CheckpointQuestion, { PhotoComparison } from '../shared/CheckpointQuestion';
import AudioGuidance from './AudioGuidance';
import WalkthroughProgress from './WalkthroughProgress';
import { getCheckpointsForArea } from '../shared/inspectionCheckpoints';
import { getCheckpointAudio, getAreaIntro, getAreaComplete } from '../shared/audioGuidanceText';

/**
 * GuidedAreaStep - Single screen per area in wizard style
 * One question at a time with audio guidance and photo examples
 */
export default function GuidedAreaStep({
  area,
  areaIndex,
  totalAreas,
  completedAreas,
  existingResults,
  audioEnabled,
  onComplete,
  onBack,
  onSkipArea
}) {
  // Get checkpoints for this area
  const checkpoints = getCheckpointsForArea(area.id, 'full');

  // Current checkpoint index
  const [currentCheckpointIndex, setCurrentCheckpointIndex] = useState(0);

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

  // Show intro state
  const [showIntro, setShowIntro] = useState(true);

  const currentCheckpoint = checkpoints[currentCheckpointIndex];
  const currentAnswer = answers[currentCheckpoint?.id];

  // Audio text for current checkpoint
  const audioText = showIntro
    ? getAreaIntro(area.id)
    : getCheckpointAudio(area.id, currentCheckpoint?.id);

  const handleAnswer = (answer) => {
    setAnswers(prev => ({
      ...prev,
      [currentCheckpoint.id]: { ...prev[currentCheckpoint.id], answer }
    }));
  };

  const handleIssueDetails = (details) => {
    setAnswers(prev => ({
      ...prev,
      [currentCheckpoint.id]: { ...prev[currentCheckpoint.id], ...details }
    }));
  };

  const handleNext = () => {
    if (showIntro) {
      setShowIntro(false);
      return;
    }

    if (currentCheckpointIndex < checkpoints.length - 1) {
      setCurrentCheckpointIndex(currentCheckpointIndex + 1);
    } else {
      // Area complete - build results
      const checkpointResults = checkpoints.map(cp => ({
        id: cp.id,
        area_id: area.id,
        item_name: cp.question,
        answer: answers[cp.id]?.answer || null,
        note: answers[cp.id]?.note || '',
        photos: answers[cp.id]?.photos || [],
        photo_urls: answers[cp.id]?.photos || [],
        severity: answers[cp.id]?.answer === 'bad' ? cp.severity : null,
        is_issue: answers[cp.id]?.answer === 'bad',
        description: answers[cp.id]?.note || '',
        is_quick_fix: false
      }));

      const issues = checkpointResults.filter(cp => cp.is_issue);

      onComplete({
        checkpoints: checkpointResults,
        issues
      });
    }
  };

  const handlePrevious = () => {
    if (showIntro) {
      onBack();
      return;
    }

    if (currentCheckpointIndex > 0) {
      setCurrentCheckpointIndex(currentCheckpointIndex - 1);
    } else {
      setShowIntro(true);
    }
  };

  // Calculate if can proceed
  const canProceed = showIntro || currentAnswer?.answer;

  // Progress within this area
  const areaProgress = ((currentCheckpointIndex + (showIntro ? 0 : 1)) / checkpoints.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          {/* Overall progress */}
          <WalkthroughProgress
            currentAreaIndex={areaIndex}
            totalAreas={totalAreas}
            currentArea={area}
            completedAreas={completedAreas}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto pb-32">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {showIntro ? (
            // Area intro screen
            <div className="space-y-6">
              {/* Area header */}
              <div className="text-center">
                <div
                  className="w-24 h-24 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${area.color}20` }}
                >
                  <span className="text-5xl">{area.icon}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {area.name}
                </h1>
                <p className="text-gray-600">
                  {checkpoints.length} checks • ~{area.estimatedMinutes?.full || 5} min
                </p>
              </div>

              {/* Audio guidance */}
              {audioText && (
                <AudioGuidance
                  text={audioText}
                  enabled={audioEnabled}
                  autoPlay={audioEnabled}
                />
              )}

              {/* What to look for */}
              <div className="bg-white rounded-xl p-4 border">
                <h3 className="font-semibold text-gray-900 mb-2">
                  What we'll check
                </h3>
                <p className="text-sm text-gray-600">
                  {area.whatToCheck}
                </p>
              </div>
            </div>
          ) : (
            // Checkpoint screen
            <div className="space-y-6">
              {/* Checkpoint header */}
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${area.color}20` }}
                >
                  <span className="text-2xl">{area.icon}</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{area.name}</h2>
                  <p className="text-sm text-gray-500">
                    Check {currentCheckpointIndex + 1} of {checkpoints.length}
                  </p>
                </div>
              </div>

              {/* Area progress bar */}
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    width: `${areaProgress}%`,
                    backgroundColor: area.color
                  }}
                />
              </div>

              {/* Audio guidance for this checkpoint */}
              {audioText && (
                <AudioGuidance
                  text={audioText}
                  enabled={audioEnabled}
                  autoPlay={audioEnabled}
                  key={currentCheckpoint.id} // Re-mount on checkpoint change
                />
              )}

              {/* Photo comparison (if available) */}
              {currentCheckpoint.photoExample && (
                <PhotoComparison
                  checkpoint={currentCheckpoint}
                  onSelectGood={() => handleAnswer('good')}
                  onSelectBad={() => handleAnswer('bad')}
                  selected={currentAnswer?.answer}
                />
              )}

              {/* Question */}
              <CheckpointQuestion
                checkpoint={currentCheckpoint}
                answer={currentAnswer?.answer}
                onAnswer={handleAnswer}
                onIssueDetails={handleIssueDetails}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-lg">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3">
            {/* Back button */}
            <Button
              onClick={handlePrevious}
              variant="outline"
              className="flex-shrink-0"
              style={{ minHeight: '56px', minWidth: '56px' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Next button */}
            <Button
              onClick={handleNext}
              disabled={!canProceed}
              className="flex-1 gap-2"
              style={{
                backgroundColor: canProceed ? '#28A745' : undefined,
                minHeight: '56px',
                fontSize: '16px'
              }}
            >
              {showIntro ? (
                <>
                  Start Checking
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : currentCheckpointIndex < checkpoints.length - 1 ? (
                <>
                  Next Check
                  <ArrowRight className="w-5 h-5" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Complete {area.name}
                </>
              )}
            </Button>
          </div>

          {/* Skip option */}
          {!showIntro && (
            <button
              onClick={onSkipArea}
              className="w-full mt-2 text-sm text-gray-500 hover:text-gray-700 py-2"
            >
              Skip this area
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
