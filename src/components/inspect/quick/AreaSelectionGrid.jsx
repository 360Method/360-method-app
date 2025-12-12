import React from 'react';
import { cn } from '@/lib/utils';
import { INSPECTION_AREAS } from '../shared/inspectionAreas';
import { Check } from 'lucide-react';

/**
 * AreaSelectionGrid - Visual grid of tappable area cards
 * User selects 1-5 areas to inspect
 * Mobile-first with large touch targets
 */
export default function AreaSelectionGrid({
  selectedAreas = [],
  onSelectionChange,
  maxSelections = 5,
  disabledAreas = []
}) {
  const toggleArea = (areaId) => {
    if (disabledAreas.includes(areaId)) return;

    if (selectedAreas.includes(areaId)) {
      // Remove from selection
      onSelectionChange(selectedAreas.filter(id => id !== areaId));
    } else {
      // Add to selection if under limit
      if (selectedAreas.length < maxSelections) {
        onSelectionChange([...selectedAreas, areaId]);
      }
    }
  };

  const isAtLimit = selectedAreas.length >= maxSelections;

  return (
    <div className="space-y-4">
      {/* Selection counter */}
      <div className="flex items-center justify-between px-1">
        <span className="text-sm font-medium text-gray-600">
          {selectedAreas.length === 0
            ? 'Tap to select areas'
            : `${selectedAreas.length} of ${maxSelections} selected`}
        </span>
        {selectedAreas.length > 0 && (
          <button
            onClick={() => onSelectionChange([])}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Grid of area cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {INSPECTION_AREAS.map((area) => {
          const isSelected = selectedAreas.includes(area.id);
          const isDisabled = disabledAreas.includes(area.id) ||
            (isAtLimit && !isSelected);

          return (
            <button
              key={area.id}
              onClick={() => toggleArea(area.id)}
              disabled={isDisabled}
              className={cn(
                'relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all',
                'min-h-[100px]', // Large touch target
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                'active:scale-95',
                isSelected && 'border-blue-500 bg-blue-50 shadow-md',
                !isSelected && !isDisabled && 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
                isDisabled && !isSelected && 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              )}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              )}

              {/* Icon */}
              <span className="text-4xl leading-none">{area.icon}</span>

              {/* Label */}
              <span className={cn(
                'text-sm font-semibold text-center leading-tight',
                isSelected ? 'text-blue-700' : 'text-gray-700'
              )}>
                {area.name}
              </span>

              {/* Time estimate */}
              <span className="text-xs text-gray-500">
                ~{area.estimatedMinutes.quick} min
              </span>
            </button>
          );
        })}
      </div>

      {/* Helpful tip */}
      {selectedAreas.length === 0 && (
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Tip:</span> Start with areas you're most concerned about
          </p>
        </div>
      )}

      {isAtLimit && (
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-sm text-orange-800">
            <span className="font-semibold">Maximum reached.</span> Deselect an area to choose a different one.
          </p>
        </div>
      )}
    </div>
  );
}

/**
 * QuickAreaSuggestions - AI-powered area suggestions
 * Based on season, recent issues, or system age
 */
export function QuickAreaSuggestions({
  suggestions = [],
  onSelectSuggestion
}) {
  if (suggestions.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        Suggested Areas
      </h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(suggestion => {
          const area = INSPECTION_AREAS.find(a => a.id === suggestion.areaId);
          if (!area) return null;

          return (
            <button
              key={suggestion.areaId}
              onClick={() => onSelectSuggestion(suggestion.areaId)}
              className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <span className="text-xl">{area.icon}</span>
              <div className="text-left">
                <span className="text-sm font-medium text-gray-900 block">
                  {area.name}
                </span>
                {suggestion.reason && (
                  <span className="text-xs text-gray-500">
                    {suggestion.reason}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
