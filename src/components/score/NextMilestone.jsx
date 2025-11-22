import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Clock, DollarSign, TrendingUp } from 'lucide-react';

const CERTIFICATION_LEVELS = {
  platinum: { label: 'Platinum', minScore: 95, color: 'text-gray-400', bgColor: 'bg-gradient-to-r from-gray-300 to-gray-400' },
  gold: { label: 'Gold', minScore: 90, color: 'text-yellow-600', bgColor: 'bg-gradient-to-r from-yellow-400 to-yellow-600' },
  silver: { label: 'Silver', minScore: 85, color: 'text-gray-500', bgColor: 'bg-gradient-to-r from-gray-400 to-gray-500' },
  bronze: { label: 'Bronze', minScore: 75, color: 'text-amber-800', bgColor: 'bg-gradient-to-r from-amber-700 to-amber-900' },
  fair: { label: 'Fair', minScore: 0, color: 'text-gray-400', bgColor: 'bg-gray-200' }
};

function getNextLevel(currentScore, currentLevel) {
  if (currentScore >= 95) return null; // Already at top
  if (currentScore >= 90) return { ...CERTIFICATION_LEVELS.platinum, pointsNeeded: 95 - currentScore };
  if (currentScore >= 85) return { ...CERTIFICATION_LEVELS.gold, pointsNeeded: 90 - currentScore };
  if (currentScore >= 75) return { ...CERTIFICATION_LEVELS.silver, pointsNeeded: 85 - currentScore };
  return { ...CERTIFICATION_LEVELS.bronze, pointsNeeded: 75 - currentScore };
}

export default function NextMilestone({ currentScore, certificationLevel, quickWins = [] }) {
  const nextLevel = getNextLevel(currentScore, certificationLevel);
  
  // If no next level (already platinum), show congratulations
  if (!nextLevel) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-3">🏆</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">You're at the Top!</h3>
          <p className="text-gray-600">
            Platinum certification is the highest level. Keep maintaining your property to preserve this elite status.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  const progressPercent = ((currentScore - (nextLevel.minScore - nextLevel.pointsNeeded)) / nextLevel.pointsNeeded) * 100;
  const totalCost = quickWins.reduce((sum, win) => {
    const cost = win.cost === 'Free' || win.cost === '$0' ? 0 : parseInt(win.cost.replace(/[$,]/g, '')) || 0;
    return sum + cost;
  }, 0);
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          <CardTitle className="text-lg">🎯 Next Milestone: {nextLevel.label}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              You're <span className="text-blue-600">{nextLevel.pointsNeeded} points</span> away!
            </span>
            <Badge className={nextLevel.bgColor + ' text-white'}>
              {nextLevel.minScore}+ needed
            </Badge>
          </div>
          <Progress value={Math.min(progressPercent, 100)} className="h-3" />
          <p className="text-xs text-gray-500 mt-1">
            Current: {currentScore} → Target: {nextLevel.minScore}
          </p>
        </div>
        
        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Fastest Path:</h4>
            <div className="space-y-2">
              {quickWins.map((win, idx) => (
                <div 
                  key={idx}
                  className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{win.action}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        +{win.points} pts
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-blue-600" />
                        {win.cost}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Summary */}
        <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <p className="text-xs font-semibold">Timeline</p>
              </div>
              <p className="text-lg font-bold text-gray-900">2-4 months</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                <DollarSign className="w-4 h-4" />
                <p className="text-xs font-semibold">Investment</p>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {totalCost === 0 ? 'Free' : `$${totalCost.toLocaleString()}`}
              </p>
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-600 mb-1">Property Value Increase</p>
            <p className="text-xl font-bold text-green-600">
              +${(totalCost * 3).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">~3:1 ROI on improvements</p>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
}