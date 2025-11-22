import React from 'react';
import { Target, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function NextLevelPreviewDemo({ 
  currentScore, 
  nextLevel, 
  nextThreshold, 
  pointsNeeded,
  benefits 
}) {
  const progressToNext = (currentScore / nextThreshold) * 100;
  
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Next Goal: {nextLevel} Certification
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              You're only {pointsNeeded} points away!
            </p>
          </div>
          <Badge className="bg-blue-600 text-lg px-4 py-2">
            {nextThreshold} pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">Your Progress</span>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-sm font-semibold text-blue-600">
              {currentScore} / {nextThreshold}
            </span>
          </div>
          <Progress value={progressToNext} className="h-4" />
          <div className="flex justify-between mt-2">
            <span className="text-xs text-gray-600">You are here ({currentScore})</span>
            <span className="text-xs text-blue-700 font-semibold">{nextLevel} → ({nextThreshold})</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-3">What {nextLevel} Gets You:</h4>
          <div className="space-y-2">
            {benefits.map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 text-center">
            💡 Complete {pointsNeeded} quick wins to unlock {nextLevel}!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}