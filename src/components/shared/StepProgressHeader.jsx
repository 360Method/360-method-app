import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const PHASE_INFO = {
  1: { phase: 'AWARE', name: 'Baseline', color: 'blue' },
  2: { phase: 'AWARE', name: 'Inspect', color: 'blue' },
  3: { phase: 'AWARE', name: 'Track', color: 'blue' },
  4: { phase: 'ACT', name: 'Prioritize', color: 'orange' },
  5: { phase: 'ACT', name: 'Schedule', color: 'orange' },
  6: { phase: 'ACT', name: 'Execute', color: 'orange' },
  7: { phase: 'ADVANCE', name: 'Preserve', color: 'green' },
  8: { phase: 'ADVANCE', name: 'Upgrade', color: 'green' },
  9: { phase: 'ADVANCE', name: 'SCALE', color: 'green' }
};

const COLOR_CLASSES = {
  blue: { text: 'text-blue-600', bg: 'bg-blue-500' },
  orange: { text: 'text-orange-600', bg: 'bg-orange-500' },
  green: { text: 'text-green-600', bg: 'bg-green-500' }
};

export default function StepProgressHeader({ currentStep, totalSteps = 9, className = '' }) {
  const stepInfo = PHASE_INFO[currentStep];
  const colors = COLOR_CLASSES[stepInfo?.color || 'blue'];
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className={`mb-6 ${className}`}>
      {/* Breadcrumb Context */}
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
        <span className={`font-medium ${colors.text}`}>
          {stepInfo?.phase} Phase
        </span>
        <ChevronRight className="w-4 h-4" />
        <span>Step {currentStep} of {totalSteps}</span>
        <ChevronRight className="w-4 h-4" />
        <span className="font-medium">{stepInfo?.name}</span>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${colors.bg} transition-all duration-500`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
          {currentStep}/{totalSteps}
        </span>
      </div>
    </div>
  );
}