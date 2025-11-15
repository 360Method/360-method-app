import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';

const StepEducationCard = ({ 
  stepNumber,
  stepName,
  phase,
  phaseColor = 'blue',
  whyItMatters,
  keyActions,
  defaultExpanded = false,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  
  const phaseColors = {
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      text: 'text-blue-900',
      badge: 'bg-blue-600'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-300',
      text: 'text-orange-900',
      badge: 'bg-orange-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-300',
      text: 'text-green-900',
      badge: 'bg-green-600'
    }
  };
  
  const colors = phaseColors[phaseColor];
  
  return (
    <div className={`rounded-lg border-2 ${colors.border} ${colors.bg} ${className}`}>
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full ${colors.badge} text-white flex items-center justify-center text-sm font-bold`}>
            {stepNumber}
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-600 font-semibold">
              {phase} Phase
            </div>
            <div className={`text-lg font-bold ${colors.text}`}>
              Step {stepNumber}: {stepName}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-gray-400" />
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>
      
      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200">
          {/* Why It Matters */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Why This Step Matters:</h4>
            <p className="text-gray-700 leading-relaxed">
              {whyItMatters}
            </p>
          </div>
          
          {/* Key Actions */}
          {keyActions && keyActions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What You'll Do:</h4>
              <ul className="space-y-2">
                {keyActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span className="text-gray-700">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StepEducationCard;