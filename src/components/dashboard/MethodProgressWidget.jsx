import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Info, Lock, CheckCircle2 } from 'lucide-react';
import NextStepIndicator from '../shared/NextStepIndicator';

function PhaseProgressBadge({ phase, steps, completedSteps, color, locked }) {
  const completedInPhase = steps.filter(s => completedSteps.includes(s)).length;
  const totalInPhase = steps.length;
  
  const colorClasses = {
    blue: { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-200' },
    orange: { bg: 'bg-orange-600', text: 'text-orange-600', border: 'border-orange-200' },
    green: { bg: 'bg-green-600', text: 'text-green-600', border: 'border-green-200' }
  };
  
  const colors = colorClasses[color];
  const isComplete = completedInPhase === totalInPhase;

  return (
    <div className={`p-3 rounded-lg border-2 ${locked ? 'bg-gray-50 opacity-60' : 'bg-white'} ${colors.border}`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`font-bold text-xs ${locked ? 'text-gray-400' : colors.text}`}>
          {phase}
        </span>
        {locked && <Lock className="w-3 h-3 text-gray-400" />}
        {isComplete && !locked && <CheckCircle2 className="w-4 h-4 text-green-600" />}
      </div>
      <div className="flex gap-1">
        {steps.map(step => (
          <div 
            key={step}
            className={`flex-1 h-1.5 rounded-full ${
              completedSteps.includes(step) 
                ? 'bg-green-500' 
                : locked
                ? 'bg-gray-300'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
      <div className={`text-xs mt-1 ${locked ? 'text-gray-400' : 'text-gray-600'}`}>
        {locked ? 'Locked' : `${completedInPhase}/${totalInPhase} steps`}
      </div>
    </div>
  );
}

export default function MethodProgressWidget({ 
  completedSteps = [],
  properties = [],
  selectedProperty,
  systems = [],
  tasks = [],
  inspections = []
}) {
  const totalCompleted = completedSteps.length;
  const progressPercent = Math.round((totalCompleted / 9) * 100);
  const propertyCount = properties.length;
  
  const awareComplete = completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3);
  const actComplete = completedSteps.includes(4) && completedSteps.includes(5) && completedSteps.includes(6);

  return (
    <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D' }}>
              <Info className="w-5 h-5 text-indigo-600" />
              Your 360° Method Progress
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              {totalCompleted}/9 steps complete • {propertyCount} {propertyCount === 1 ? 'property' : 'properties'}
            </p>
          </div>
          <div className="text-4xl font-bold text-indigo-600">
            {progressPercent}%
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Visual 9-step progress bar */}
        <div className="flex gap-1">
          {[1,2,3,4,5,6,7,8,9].map(step => (
            <div 
              key={step}
              className={`flex-1 h-3 rounded-full transition-all duration-300 ${
                completedSteps.includes(step) 
                  ? 'bg-green-500' 
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Phase Breakdown */}
        <div className="grid grid-cols-3 gap-3">
          <PhaseProgressBadge 
            phase="AWARE" 
            steps={[1,2,3]}
            completedSteps={completedSteps}
            color="blue"
            locked={false}
          />
          <PhaseProgressBadge 
            phase="ACT" 
            steps={[4,5,6]}
            completedSteps={completedSteps}
            color="orange"
            locked={!awareComplete && completedSteps.length < 1}
          />
          <PhaseProgressBadge 
            phase="ADVANCE" 
            steps={[7,8,9]}
            completedSteps={completedSteps}
            color="green"
            locked={!actComplete && completedSteps.length < 6}
          />
        </div>

        {/* Next Action */}
        <NextStepIndicator
          selectedProperty={selectedProperty}
          systems={systems}
          tasks={tasks}
          inspections={inspections}
        />
      </CardContent>
    </Card>
  );
}