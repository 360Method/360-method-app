import React from 'react';
import { TrendingUp, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PerformanceTimelineDemo({ startScore, currentScore, timeframe, milestones }) {
  const scoreGain = currentScore - startScore;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Long-Term Performance
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Your {timeframe} journey to excellence
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">+{scoreGain}</div>
            <p className="text-sm text-gray-600">points gained</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-green-300 to-yellow-300"></div>
          
          {/* Milestones */}
          <div className="space-y-6">
            {milestones.map((milestone, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === milestones.length - 1;
              
              return (
                <div key={idx} className="relative flex items-start gap-4">
                  {/* Marker */}
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                    isLast ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                    idx >= milestones.length - 2 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                    idx >= 1 ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
                    'bg-gradient-to-br from-blue-400 to-blue-600'
                  }`}>
                    {milestone.score}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-600">
                            {new Date(milestone.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        {milestone.badge && (
                          <Badge className={milestone.badgeColor || 'bg-blue-600'}>
                            {milestone.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900">{milestone.event}</p>
                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Consistent Excellence</p>
              <p className="text-sm text-green-700">
                You've improved {scoreGain} points over {timeframe} through systematic maintenance
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}