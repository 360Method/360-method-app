import React from 'react';
import { Zap, DollarSign, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function QuickWinsDemo({ title = "Quick Wins to Level Up", wins, showTotal = true }) {
  const totalPoints = wins.reduce((sum, win) => sum + win.points, 0);
  const totalCost = wins.reduce((sum, win) => {
    const cost = win.cost.toLowerCase();
    if (cost === 'free') return sum;
    const num = parseInt(cost.replace(/[^0-9]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);
  
  const getDifficultyColor = (difficulty) => {
    if (difficulty === 'Easy') return 'bg-green-100 text-green-800';
    if (difficulty === 'Medium') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const getCategoryColor = (category) => {
    if (category === 'KNOW') return 'bg-blue-100 text-blue-800';
    if (category === 'KEEP') return 'bg-green-100 text-green-800';
    if (category === 'MAKE') return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-600" />
              {title}
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Complete these to boost your score quickly
            </p>
          </div>
          {showTotal && (
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">+{totalPoints}</div>
              <p className="text-sm text-gray-600">total points</p>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {wins.map((win, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{win.action}</h4>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{win.points} points
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {win.cost}
                    </Badge>
                    {win.time && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {win.time}
                      </Badge>
                    )}
                    {win.difficulty && (
                      <Badge className={`text-xs ${getDifficultyColor(win.difficulty)}`}>
                        {win.difficulty}
                      </Badge>
                    )}
                    {win.category && (
                      <Badge className={`text-xs ${getCategoryColor(win.category)}`}>
                        {win.category}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {showTotal && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Complete all quick wins</p>
                <p className="text-xs text-gray-500 mt-1">
                  Total investment: ${totalCost.toLocaleString()}
                </p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Start First Task
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}