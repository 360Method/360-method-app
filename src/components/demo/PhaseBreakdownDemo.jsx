import React from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function PhaseBreakdownDemo({ phases, interactive = true }) {
  const [expandedPhase, setExpandedPhase] = React.useState(null);
  
  const getPhaseColor = (name) => {
    if (name === 'KNOW') return 'blue';
    if (name === 'KEEP') return 'green';
    if (name === 'MAKE') return 'purple';
    return 'gray';
  };
  
  const getStatusColor = (percentage) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getStatusIcon = (percentage) => {
    if (percentage >= 90) return <CheckCircle className="w-5 h-5 text-green-600" />;
    return <AlertCircle className="w-5 h-5 text-yellow-600" />;
  };
  
  return (
    <div className="space-y-4">
      {phases.map((phase, idx) => {
        const percentage = (phase.score / phase.max) * 100;
        const color = getPhaseColor(phase.name);
        const isExpanded = expandedPhase === idx;
        
        return (
          <Card key={idx} className="overflow-hidden">
            <CardHeader 
              className={`cursor-pointer hover:bg-${color}-50 transition-colors`}
              onClick={() => interactive && setExpandedPhase(isExpanded ? null : idx)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(percentage)}
                  <div>
                    <CardTitle className="text-xl">
                      Phase {idx + 1}: {phase.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                  </div>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      {phase.score}
                      <span className="text-lg text-gray-500">/{phase.max}</span>
                    </div>
                    <p className={`text-sm font-semibold ${getStatusColor(percentage)}`}>
                      {percentage >= 90 ? 'Excellent' : percentage >= 70 ? 'Good' : 'Needs Work'}
                    </p>
                  </div>
                  {interactive && (
                    isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 pb-4">
              <Progress value={percentage} className={`h-3 mb-4 bg-${color}-100`} />
              
              {isExpanded && phase.details && (
                <div className="mt-4 space-y-4 bg-gray-50 rounded-lg p-4">
                  {phase.details.issues && phase.details.issues.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Why this score?</h4>
                      <ul className="space-y-1">
                        {phase.details.issues.map((issue, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-red-500 mt-1">⚠️</span>
                            <span>{issue}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {phase.details.quickWins && phase.details.quickWins.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Quick wins to improve:</h4>
                      <ul className="space-y-1">
                        {phase.details.quickWins.map((win, i) => (
                          <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                            <span className="text-green-500 mt-1">✓</span>
                            <span>{win.action} → <span className="font-semibold">+{win.points} pts</span> {win.cost && `(${win.cost})`}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}