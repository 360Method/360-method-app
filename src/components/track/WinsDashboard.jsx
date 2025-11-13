import React from 'react';
import { format, parseISO } from 'date-fns';
import { Trophy, Shield, Zap, DollarSign, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function WinsDashboard({ tasks, metrics, aiInsights, generatingAI, onRegenerateAI }) {
  
  // Get top 5 wins (highest savings tasks)
  const topWins = React.useMemo(() => {
    return tasks
      .map(task => {
        let savings = 0;
        let reason = '';
        
        if (task.execution_method === 'DIY') {
          savings = (task.contractor_cost || 0) - (task.actual_cost || 0);
          reason = `Saved by DIYing vs hiring contractor`;
        }
        
        if (task.cascade_risk_score >= 7) {
          const preventionSavings = (task.delayed_fix_cost || 0) - (task.actual_cost || 0);
          if (preventionSavings > savings) {
            savings = preventionSavings;
            reason = `Prevented $${task.delayed_fix_cost?.toLocaleString()} disaster`;
          }
        }
        
        if (task.resolved_during_inspection) {
          savings += 75;
          reason = `Fixed during inspection (no service call)`;
        }
        
        return { ...task, savings, reason };
      })
      .filter(t => t.savings > 0)
      .sort((a, b) => b.savings - a.savings)
      .slice(0, 5);
  }, [tasks]);

  if (!metrics) return null;

  return (
    <div className="space-y-4">
      
      {/* HERO CARD - THE BIG NUMBER */}
      <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 shadow-lg">
        <CardContent className="text-center py-8 px-4">
          <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
          
          <div className="text-5xl md:text-6xl font-bold text-green-700 mb-2">
            ${metrics.totalSavings.toLocaleString()}
          </div>
          
          <div className="text-lg md:text-xl text-green-600 font-semibold mb-3">
            Total Saved This Year
          </div>
          
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">
              {metrics.roi > 0 ? `${metrics.roi}% ROI` : 'Building savings...'}
            </span>
          </div>
          
          {metrics.roi > 0 && (
            <p className="text-xs text-green-600 mt-3">
              That's a {metrics.roi}% return on your ${metrics.totalSpent.toLocaleString()} maintenance investment!
            </p>
          )}
        </CardContent>
      </Card>

      {/* KEY METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-red-700">
              {metrics.disastersPrevented}
            </div>
            <div className="text-xs font-semibold text-red-600 mb-1">
              Disasters Prevented
            </div>
            {metrics.wouldHaveCost > 0 && (
              <div className="text-xs text-red-500">
                Would've cost ${metrics.wouldHaveCost.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-4 text-center">
            <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">
              {metrics.tasksCompleted}
            </div>
            <div className="text-xs font-semibold text-blue-600 mb-1">
              Tasks Completed
            </div>
            {metrics.inspectionFixes > 0 && (
              <div className="text-xs text-blue-500">
                {metrics.inspectionFixes} fixed immediately
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">
              ${metrics.totalSpent.toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-purple-600 mb-1">
              Spent on Maintenance
            </div>
            {metrics.diyTasks > 0 && (
              <div className="text-xs text-purple-500">
                {metrics.diyTasks} DIY saved ${metrics.diySavings.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700">
              {metrics.totalHours.toFixed(1)}h
            </div>
            <div className="text-xs font-semibold text-orange-600 mb-1">
              Time Invested
            </div>
            {metrics.effectiveRate > 0 && (
              <div className="text-xs text-orange-500">
                ${metrics.effectiveRate}/hr effective rate
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* SAVINGS BREAKDOWN */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">💰 Where Your Savings Came From</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          
          {metrics.diySavings > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">
                  DIY vs Contractor
                </span>
                <Badge className="bg-green-600 text-white">
                  +${metrics.diySavings.toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={(metrics.diySavings / metrics.totalSavings) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                Saved by doing {metrics.diyTasks} tasks yourself
              </p>
            </div>
          )}

          {metrics.inspectionSavings > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">
                  Inspection Efficiency
                </span>
                <Badge className="bg-blue-600 text-white">
                  +${metrics.inspectionSavings.toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={(metrics.inspectionSavings / metrics.totalSavings) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                Saved {metrics.inspectionFixes} service calls by fixing during inspections
              </p>
            </div>
          )}

          {(metrics.totalSavings - metrics.diySavings - metrics.inspectionSavings) > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">
                  Disaster Prevention
                </span>
                <Badge className="bg-red-600 text-white">
                  +${(metrics.totalSavings - metrics.diySavings - metrics.inspectionSavings).toLocaleString()}
                </Badge>
              </div>
              <Progress 
                value={((metrics.totalSavings - metrics.diySavings - metrics.inspectionSavings) / metrics.totalSavings) * 100}
                className="h-2"
              />
              <p className="text-xs text-gray-600 mt-1">
                Prevented costly repairs by maintaining proactively
              </p>
            </div>
          )}

        </CardContent>
      </Card>

      {/* TOP 5 WINS */}
      {topWins.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Your Top {topWins.length} Wins This Year
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topWins.map((win, index) => (
              <div 
                key={win.id}
                className="flex items-start gap-3 p-3 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  #{index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-gray-900 mb-1">
                    {win.title}
                  </div>
                  <div className="text-xs text-gray-600">
                    {win.reason}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(parseISO(win.completion_date), 'MMM d, yyyy')}
                  </div>
                </div>
                
                <Badge className="flex-shrink-0 bg-green-600 text-white font-bold">
                  +${win.savings.toLocaleString()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI-POWERED TOP RISKS */}
      {aiInsights?.top_risks && aiInsights.top_risks.length > 0 && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              ⚠️ Top Risks (AI-Identified)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.top_risks.slice(0, 3).map((risk, idx) => (
              <div key={idx} className="p-3 bg-white border border-red-200 rounded">
                <div className="flex items-start gap-2 mb-2">
                  <Badge 
                    className={
                      risk.risk_level === 'HIGH' ? 'bg-red-600 text-white' :
                      risk.risk_level === 'MEDIUM' ? 'bg-yellow-600 text-white' :
                      'bg-blue-600 text-white'
                    }
                  >
                    {risk.risk_level}
                  </Badge>
                  <span className="font-semibold text-sm">{risk.system}</span>
                </div>
                <p className="text-xs text-gray-700 mb-2">{risk.reason}</p>
                <p className="text-xs text-gray-600">
                  <strong>Action:</strong> {risk.action}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Generate AI Button */}
      {!aiInsights && !generatingAI && tasks.length >= 3 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardContent className="py-6 text-center">
            <Zap className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get AI Risk Analysis
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Identify potential issues before they become expensive problems
            </p>
            <Button
              onClick={onRegenerateAI}
              className="bg-purple-600 hover:bg-purple-700"
              style={{ minHeight: '48px' }}
            >
              Generate AI Insights
            </Button>
          </CardContent>
        </Card>
      )}

      {generatingAI && (
        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardContent className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Analyzing your maintenance data...</p>
          </CardContent>
        </Card>
      )}

      {/* CELEBRATION MESSAGE */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Amazing Work!
          </h3>
          <p className="text-sm text-gray-700">
            You're maintaining your property proactively and it's paying off. 
            Keep up the great work!
          </p>
        </CardContent>
      </Card>

    </div>
  );
}