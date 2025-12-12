import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Camera, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

/**
 * CheckpointQuestion - Simple yes/no question component
 * Designed for non-tech users with large tap targets
 *
 * When "Issue" is selected, expands to show optional note and photo capture
 */
export default function CheckpointQuestion({
  checkpoint,
  answer, // 'good' | 'bad' | null
  onAnswer,
  onIssueDetails, // callback with { note, photos }
  showPhotoExample = false,
  audioText = null,
  isPlaying = false,
  onPlayAudio = null
}) {
  const [expanded, setExpanded] = useState(false);
  const [issueNote, setIssueNote] = useState('');
  const [issuePhotos, setIssuePhotos] = useState([]);

  const handleAnswer = (value) => {
    onAnswer(value);
    if (value === 'bad') {
      setExpanded(true);
    } else {
      setExpanded(false);
      setIssueNote('');
      setIssuePhotos([]);
    }
  };

  const handlePhotoCapture = async () => {
    // Use native file input for photo capture
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // Use back camera

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhotos = [...issuePhotos, e.target.result];
          setIssuePhotos(newPhotos);
          onIssueDetails?.({ note: issueNote, photos: newPhotos });
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  const removePhoto = (index) => {
    const newPhotos = issuePhotos.filter((_, i) => i !== index);
    setIssuePhotos(newPhotos);
    onIssueDetails?.({ note: issueNote, photos: newPhotos });
  };

  const handleNoteChange = (e) => {
    setIssueNote(e.target.value);
    onIssueDetails?.({ note: e.target.value, photos: issuePhotos });
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      {/* Question */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Question text */}
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 leading-snug">
              {checkpoint.question}
            </h3>

            {/* Audio play button if available */}
            {audioText && onPlayAudio && (
              <button
                onClick={onPlayAudio}
                className="mt-2 flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              >
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center',
                  isPlaying ? 'bg-blue-100 animate-pulse' : 'bg-blue-50'
                )}>
                  {isPlaying ? '🔊' : '🔈'}
                </span>
                <span>{isPlaying ? 'Playing...' : 'Listen to instructions'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Answer buttons - large touch targets */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          {/* Good button */}
          <button
            onClick={() => handleAnswer('good')}
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
              'min-h-[88px]', // Large touch target
              'active:scale-95',
              answer === 'good'
                ? 'border-green-500 bg-green-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
            )}
          >
            <span className="text-3xl">✅</span>
            <span className={cn(
              'font-semibold text-sm',
              answer === 'good' ? 'text-green-700' : 'text-gray-700'
            )}>
              All Good
            </span>
          </button>

          {/* Bad/Issue button */}
          <button
            onClick={() => handleAnswer('bad')}
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
              'min-h-[88px]', // Large touch target
              'active:scale-95',
              answer === 'bad'
                ? 'border-orange-500 bg-orange-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-orange-300 hover:bg-orange-50/50'
            )}
          >
            <span className="text-3xl">⚠️</span>
            <span className={cn(
              'font-semibold text-sm',
              answer === 'bad' ? 'text-orange-700' : 'text-gray-700'
            )}>
              Issue Found
            </span>
          </button>
        </div>

        {/* Good/Bad descriptions */}
        {answer && (
          <div className={cn(
            'mt-3 p-3 rounded-lg text-sm',
            answer === 'good' ? 'bg-green-50 text-green-800' : 'bg-orange-50 text-orange-800'
          )}>
            {answer === 'good' ? checkpoint.goodDescription : checkpoint.badDescription}
          </div>
        )}
      </div>

      {/* Expanded issue details */}
      {answer === 'bad' && (
        <div className="border-t-2 border-gray-100 p-4 bg-gray-50">
          {/* Toggle for details */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="text-sm font-medium text-gray-700">
              Add details (optional)
            </span>
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {expanded && (
            <div className="mt-4 space-y-4">
              {/* Note input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe what you see
                </label>
                <Textarea
                  value={issueNote}
                  onChange={handleNoteChange}
                  placeholder="E.g., 'Small crack near the corner, about 2 inches long'"
                  className="min-h-[80px] text-base"
                />
              </div>

              {/* Photo capture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Take a photo
                </label>

                {/* Photo thumbnails */}
                {issuePhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {issuePhotos.map((photo, idx) => (
                      <div key={idx} className="relative">
                        <img
                          src={photo}
                          alt={`Issue photo ${idx + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                        />
                        <button
                          onClick={() => removePhoto(idx)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handlePhotoCapture}
                  variant="outline"
                  className="w-full min-h-[56px] gap-2"
                >
                  <Camera className="w-5 h-5" />
                  {issuePhotos.length > 0 ? 'Add Another Photo' : 'Take Photo'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * PhotoComparison - Side-by-side good vs bad photos
 * Used in full walkthrough to help users identify issues
 */
export function PhotoComparison({
  checkpoint,
  onSelectGood,
  onSelectBad,
  selected = null // 'good' | 'bad' | null
}) {
  // Placeholder images - in production, these would come from a CDN
  const goodImage = `/inspection-examples/${checkpoint.id}-good.jpg`;
  const badImage = `/inspection-examples/${checkpoint.id}-bad.jpg`;
  const hasImages = checkpoint.photoExample;

  if (!hasImages) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Good example */}
      <button
        onClick={onSelectGood}
        className={cn(
          'flex flex-col rounded-xl border-2 overflow-hidden transition-all',
          'active:scale-95',
          selected === 'good'
            ? 'border-green-500 shadow-lg'
            : 'border-gray-200 hover:border-green-300'
        )}
      >
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          {/* Placeholder - replace with actual image */}
          <div className="text-center p-4">
            <span className="text-4xl">✅</span>
            <p className="text-xs text-gray-500 mt-2">Good example</p>
          </div>
        </div>
        <div className={cn(
          'p-3 text-center font-semibold text-sm',
          selected === 'good' ? 'bg-green-500 text-white' : 'bg-green-50 text-green-700'
        )}>
          Looks Like This
        </div>
      </button>

      {/* Bad example */}
      <button
        onClick={onSelectBad}
        className={cn(
          'flex flex-col rounded-xl border-2 overflow-hidden transition-all',
          'active:scale-95',
          selected === 'bad'
            ? 'border-orange-500 shadow-lg'
            : 'border-gray-200 hover:border-orange-300'
        )}
      >
        <div className="aspect-square bg-gray-100 flex items-center justify-center">
          {/* Placeholder - replace with actual image */}
          <div className="text-center p-4">
            <span className="text-4xl">⚠️</span>
            <p className="text-xs text-gray-500 mt-2">Issue example</p>
          </div>
        </div>
        <div className={cn(
          'p-3 text-center font-semibold text-sm',
          selected === 'bad' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-700'
        )}>
          Needs Attention
        </div>
      </button>
    </div>
  );
}

/**
 * SimpleYesNo - Even simpler yes/no for quick checks
 * Just two big buttons, no expansion
 */
export function SimpleYesNo({
  question,
  answer, // 'yes' | 'no' | null
  onAnswer,
  yesLabel = 'Yes',
  noLabel = 'No',
  yesColor = 'green',
  noColor = 'red'
}) {
  const colorClasses = {
    green: {
      selected: 'border-green-500 bg-green-50',
      hover: 'hover:border-green-300 hover:bg-green-50/50',
      text: 'text-green-700'
    },
    red: {
      selected: 'border-red-500 bg-red-50',
      hover: 'hover:border-red-300 hover:bg-red-50/50',
      text: 'text-red-700'
    },
    orange: {
      selected: 'border-orange-500 bg-orange-50',
      hover: 'hover:border-orange-300 hover:bg-orange-50/50',
      text: 'text-orange-700'
    },
    blue: {
      selected: 'border-blue-500 bg-blue-50',
      hover: 'hover:border-blue-300 hover:bg-blue-50/50',
      text: 'text-blue-700'
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-base font-medium text-gray-900">{question}</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onAnswer('yes')}
          className={cn(
            'p-4 rounded-xl border-2 font-semibold text-base transition-all min-h-[64px]',
            'active:scale-95',
            answer === 'yes'
              ? `${colorClasses[yesColor].selected} ${colorClasses[yesColor].text}`
              : `border-gray-200 bg-white ${colorClasses[yesColor].hover} text-gray-700`
          )}
        >
          {yesLabel}
        </button>

        <button
          onClick={() => onAnswer('no')}
          className={cn(
            'p-4 rounded-xl border-2 font-semibold text-base transition-all min-h-[64px]',
            'active:scale-95',
            answer === 'no'
              ? `${colorClasses[noColor].selected} ${colorClasses[noColor].text}`
              : `border-gray-200 bg-white ${colorClasses[noColor].hover} text-gray-700`
          )}
        >
          {noLabel}
        </button>
      </div>
    </div>
  );
}
