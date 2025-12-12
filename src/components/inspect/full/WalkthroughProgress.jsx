import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';
import { INSPECTION_ZONES, getAreasInZone } from '../shared/inspectionAreas';

/**
 * WalkthroughProgress - Progress indicator for full walkthrough
 * Shows current position in the inspection journey
 */
export default function WalkthroughProgress({
  currentAreaIndex,
  totalAreas,
  currentArea,
  completedAreas = [],
  className
}) {
  const progressPercent = (completedAreas.length / totalAreas) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Text progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 font-medium">
          Step {currentAreaIndex + 1} of {totalAreas}
        </span>
        <span className="text-gray-500">
          {Math.round(progressPercent)}% complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Current zone indicator */}
      {currentArea?.zoneName && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{currentArea.zoneEmoji}</span>
          <span>{currentArea.zoneName}</span>
        </div>
      )}
    </div>
  );
}

/**
 * ZoneProgress - Visual progress through inspection zones
 * Shows which zones are complete
 */
export function ZoneProgress({
  completedAreas = [],
  currentAreaId,
  className
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {INSPECTION_ZONES.map((zone, zoneIdx) => {
        const areasInZone = getAreasInZone(zone.id);
        const completedInZone = areasInZone.filter(a =>
          completedAreas.includes(a.id)
        ).length;
        const isCurrentZone = areasInZone.some(a => a.id === currentAreaId);
        const isComplete = completedInZone === areasInZone.length;

        return (
          <div
            key={zone.id}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              isComplete && 'bg-green-50',
              isCurrentZone && !isComplete && 'bg-blue-50'
            )}
          >
            {/* Zone icon */}
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
              isComplete ? 'bg-green-500' : isCurrentZone ? 'bg-blue-500' : 'bg-gray-200'
            )}>
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-white" />
              ) : (
                <span className="text-sm">{zone.emoji}</span>
              )}
            </div>

            {/* Zone info */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                'text-sm font-medium',
                isComplete ? 'text-green-700' : isCurrentZone ? 'text-blue-700' : 'text-gray-600'
              )}>
                {zone.name}
              </p>
              <p className="text-xs text-gray-500">
                {completedInZone} of {areasInZone.length} areas
              </p>
            </div>

            {/* Progress dots */}
            <div className="flex gap-1">
              {areasInZone.map(area => (
                <div
                  key={area.id}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    completedAreas.includes(area.id)
                      ? 'bg-green-500'
                      : area.id === currentAreaId
                        ? 'bg-blue-500'
                        : 'bg-gray-300'
                  )}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * MiniProgress - Compact progress for header
 */
export function MiniProgress({
  currentAreaIndex,
  totalAreas,
  className
}) {
  const dots = Array.from({ length: totalAreas }, (_, i) => i);

  // Show limited dots on mobile
  const visibleDots = totalAreas <= 7 ? dots : [
    ...dots.slice(0, 3),
    -1, // ellipsis marker
    ...dots.slice(-3)
  ];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {visibleDots.map((dotIndex, i) => (
        dotIndex === -1 ? (
          <span key={`ellipsis-${i}`} className="text-gray-400 text-xs px-1">...</span>
        ) : (
          <div
            key={dotIndex}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              dotIndex < currentAreaIndex
                ? 'bg-green-500'
                : dotIndex === currentAreaIndex
                  ? 'bg-blue-500'
                  : 'bg-gray-300'
            )}
          />
        )
      ))}
    </div>
  );
}
