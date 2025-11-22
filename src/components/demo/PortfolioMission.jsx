import React from 'react';
import { Target, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function PortfolioMission({ 
  title, 
  description, 
  targetScore, 
  pointsNeeded, 
  properties, 
  totalInvestment,
  timeline,
  newPortfolioScore 
}) {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-8 h-8 text-green-600" />
          <div>
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Overall Mission Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-white rounded-lg">
          <div className="text-center">
            <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">{totalInvestment}</div>
            <div className="text-xs text-gray-600">Total Investment</div>
          </div>
          <div className="text-center">
            <Clock className="w-6 h-6 text-blue-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">{timeline}</div>
            <div className="text-xs text-gray-600">Timeline</div>
          </div>
          <div className="text-center">
            <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-1" />
            <div className="text-2xl font-bold text-gray-900">{newPortfolioScore}</div>
            <div className="text-xs text-gray-600">New Portfolio Score</div>
          </div>
        </div>

        {/* Property-by-Property Plan */}
        <div className="space-y-4">
          {properties.map((property, idx) => (
            <Card key={idx} className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{property.name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline">{property.currentScore} → {property.targetScore}</Badge>
                      <span className="text-sm text-green-600 font-semibold">
                        +{property.targetScore - property.currentScore} points
                      </span>
                    </div>
                  </div>
                  <Badge className="bg-green-600">{property.totalCost}</Badge>
                </div>

                <Progress value={(property.currentScore / property.targetScore) * 100} className="h-2 mb-3" />

                <div className="space-y-2">
                  {property.tasks.map((task, taskIdx) => (
                    <div key={taskIdx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span className="text-sm text-gray-700">{task.action}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-green-600">+{task.points}pts</span>
                        <span className="text-xs text-gray-600">{task.cost}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mission Result */}
        <div className="mt-6 p-4 bg-green-600 text-white rounded-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            <div>
              <p className="font-bold text-lg">Mission Result:</p>
              <p className="text-sm opacity-90">
                Portfolio jumps from Bronze (84) to Silver (88) - Better than 85% of investor portfolios
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}