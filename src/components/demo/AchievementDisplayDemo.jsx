import React from 'react';
import { Award, Lock, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AchievementDisplayDemo({ earned, nextUp }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Earned Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            Achievements Earned
          </CardTitle>
          <p className="text-sm text-gray-600">
            Your accomplishments so far
          </p>
        </CardHeader>
        <CardContent>
          {earned && earned.length > 0 ? (
            <div className="space-y-3">
              {earned.map((achievement, idx) => (
                <div 
                  key={idx} 
                  className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-4 border border-yellow-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{achievement.name}</h4>
                      <p className="text-xs text-gray-600">
                        Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                      </p>
                    </div>
                    <Star className="w-5 h-5 text-yellow-600" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Start earning achievements by completing tasks!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Next Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-gray-600" />
            Next Up
          </CardTitle>
          <p className="text-sm text-gray-600">
            Achievements you can unlock
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nextUp.map((achievement, idx) => (
              <div 
                key={idx} 
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-3xl opacity-50">🏅</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{achievement.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {achievement.requirement}
                    </p>
                  </div>
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}