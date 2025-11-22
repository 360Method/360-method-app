import React from 'react';
import { Trophy, Target, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function LevelUpPlanDemo({ 
  currentScore, 
  targetScore, 
  targetLevel,
  levels 
}) {
  const [completedLevels, setCompletedLevels] = React.useState([]);
  
  const cumulativeScore = levels.reduce((acc, level, idx) => {
    const prevScore = idx === 0 ? currentScore : acc[idx - 1];
    acc.push(prevScore + level.points);
    return acc;
  }, []);
  
  const isLevelCompleted = (idx) => completedLevels.includes(idx);
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Your Path to {targetLevel}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Step-by-step plan to reach {targetScore} points
            </p>
          </div>
          <Trophy className="w-12 h-12 text-yellow-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
            <span className="text-sm font-semibold text-blue-600">
              {currentScore} → {targetScore}
            </span>
          </div>
          <Progress 
            value={(currentScore / targetScore) * 100} 
            className="h-3"
          />
        </div>
        
        <div className="space-y-4">
          {levels.map((level, idx) => {
            const isCompleted = isLevelCompleted(idx);
            const newScore = cumulativeScore[idx];
            const isGoalReached = newScore >= targetScore;
            
            return (
              <div 
                key={idx} 
                className={`bg-white rounded-lg p-4 border-2 ${
                  isCompleted ? 'border-green-500' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {isCompleted ? <CheckCircle className="w-6 h-6" /> : idx + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{level.name}</h4>
                      <p className="text-sm text-gray-600">+{level.points} points</p>
                    </div>
                  </div>
                  <Badge className={`${
                    isGoalReached ? 'bg-yellow-500' : 'bg-blue-600'
                  }`}>
                    Score: {newScore}
                    {isGoalReached && ' ⭐'}
                  </Badge>
                </div>
                
                <div className="ml-13 space-y-2">
                  {level.tasks.map((task, taskIdx) => (
                    <div key={taskIdx} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <div className="flex-1">
                        <span className="text-gray-900">{task.name}</span>
                        <span className="text-gray-500 ml-2">
                          (+{task.points} pts • {task.cost})
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                      <span className="font-semibold">Cost:</span> {level.cost} • 
                      <span className="font-semibold ml-2">Time:</span> {level.time}
                    </div>
                    <div className={`text-sm font-bold ${
                      isGoalReached ? 'text-yellow-600' : 'text-blue-600'
                    }`}>
                      New Score: {newScore}
                    </div>
                  </div>
                </div>
                
                {isGoalReached && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-bold text-yellow-800 flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      Achievement Unlocked: {targetLevel} Certification!
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-white rounded-lg border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-900">Total Investment</p>
              <p className="text-2xl font-bold text-blue-600">
                ${levels.reduce((sum, l) => {
                  const cost = l.cost.toLowerCase();
                  if (cost === 'free') return sum;
                  return sum + parseInt(cost.replace(/[^0-9]/g, ''));
                }, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">Timeline</p>
              <p className="text-2xl font-bold text-purple-600">
                {levels[levels.length - 1]?.time || '3 months'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}