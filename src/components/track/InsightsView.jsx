import React, { useMemo } from 'react';
import { format, subMonths } from 'date-fns';
import { TrendingUp, TrendingDown, AlertTriangle, Zap, BarChart3, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function InsightsView({ 
  tasks, 
  systems, 
  timelineItems,
  metrics, 
  aiInsights,
  generatingAI,
  onRegenerateAI,
  isLoading 
}) {

  // Calculate monthly spending (last 12 months)
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = subMonths(now, i);
      const monthKey = format(date, 'yyyy-MM');
      const monthLabel = format(date, 'MMM');
      
      const spending = timelineItems
        .filter(item => {
          const itemMonth = format(item.date, 'yyyy-MM');
          return itemMonth === monthKey && item.cost > 0;
        })
        .reduce((sum, item) => sum + item.cost, 0);
      
      months.push({
        month: monthLabel,
        amount: spending
      });
    }
    
    return months;
  }, [timelineItems]);

  // Calculate spending by system
  const systemSpending = useMemo(() => {
    if (!metrics || metrics.totalSpent === 0) return [];
    
    const spending = {};
    
    tasks.forEach(task => {
      const system = task.system_type || 'General';
      spending[system] = (spending[system] || 0) + (task.actual_cost || 0);
    });
    
    return Object.entries(spending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([system, cost]) => ({
        system,
        cost,
        percent: (cost / metrics.totalSpent) * 100
      }));
  }, [tasks, metrics]);

  // Calculate system health
  const systemHealth = useMemo(() => {
    const currentYear = new Date().getFullYear();
    
    return systems
      .filter(s => s.installation_year)
      .map(system => {
        const age = currentYear - system.installation_year;
        const lifespan = system.estimated_lifespan_years || 20;
        const lifespanPercent = (age / lifespan) * 100;
        
        let healthScore = 'good';
        let healthColor = 'green';
        
        if (lifespanPercent >= 80) {
          healthScore = 'replace soon';
          healthColor = 'red';
        } else if (lifespanPercent >= 60) {
          healthScore = 'aging';
          healthColor = 'yellow';
        }
        
        const systemTasks = tasks.filter(t => t.system_type === system.system_type);
        const systemCost = systemTasks.reduce((sum, t) => sum + (t.actual_cost || 0), 0);
        
        return {
          ...system,
          age,
          lifespan,
          lifespanPercent,
          healthScore,
          healthColor,
          taskCount: systemTasks.length,
          totalCost: systemCost
        };
      })
      .sort((a, b) => b.lifespanPercent - a.lifespanPercent);
  }, [systems, tasks]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading insights...</p>
      </div>
    );
  }

  const avgMonthly = metrics ? metrics.totalSpent / 12 : 0;

  return (
    <div className="space-y-4">
      
      {/* Monthly Spending Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Monthly Spending Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, 'Spent']}
                  labelStyle={{ color: '#000' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-gray-700">
              <strong>Average Monthly:</strong> ${avgMonthly.toFixed(0)}
            </p>
            <p className="text-sm text-gray-600 mt-2">
              💡 Budget ${Math.round(avgMonthly * 1.2)}/month for maintenance reserve
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Top Systems by Cost */}
      {systemSpending.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Top Systems by Cost
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemSpending.map(({ system, cost, percent }) => (
              <div key={system}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {system}
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    ${cost.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={percent} className="flex-1" />
                  <span className="text-xs text-gray-600 w-12 text-right">
                    {percent.toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* System Health Overview */}
      {systemHealth.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              System Health Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemHealth.map(system => (
              <div 
                key={system.id}
                className="p-4 border-2 rounded-lg"
                style={{
                  borderColor: 
                    system.healthColor === 'red' ? '#ef4444' :
                    system.healthColor === 'yellow' ? '#f59e0b' :
                    '#10b981'
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {system.system_type}
                    </h4>
                    {system.brand_model && (
                      <p className="text-xs text-gray-600">
                        {system.brand_model}
                      </p>
                    )}
                  </div>
                  <Badge 
                    className={
                      system.healthColor === 'red' ? 'bg-red-600 text-white' :
                      system.healthColor === 'yellow' ? 'bg-yellow-600 text-white' :
                      'bg-green-600 text-white'
                    }
                  >
                    {system.healthScore}
                  </Badge>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                    <span>Age: {system.age} years</span>
                    <span>{system.lifespan} year lifespan</span>
                  </div>
                  <Progress 
                    value={system.lifespanPercent} 
                    className="h-2"
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {system.taskCount} maintenance tasks
                  </span>
                  <span className="font-semibold text-gray-900">
                    ${system.totalCost.toLocaleString()} spent
                  </span>
                </div>

                {system.lifespanPercent >= 80 && (
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-700">
                      ⚠️ Consider replacement soon - system is at {system.lifespanPercent.toFixed(0)}% of expected lifespan
                    </p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* AI INSIGHTS */}
      {aiInsights && (
        <>
          {/* Spending Forecast */}
          {aiInsights.spending_forecast && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  💰 Spending Forecast (AI-Powered)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Next 12 Months</p>
                    <p className="text-2xl font-bold text-blue-700">
                      ${aiInsights.spending_forecast.next_12_months_estimate?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Monthly Avg</p>
                    <p className="text-2xl font-bold text-blue-700">
                      ${aiInsights.spending_forecast.monthly_average_forecast?.toLocaleString() || '0'}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-gray-700">
                  {aiInsights.spending_forecast.explanation}
                </p>

                {aiInsights.spending_forecast.major_expenses_upcoming?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Upcoming Major Expenses:</h4>
                    <div className="space-y-2">
                      {aiInsights.spending_forecast.major_expenses_upcoming.map((expense, idx) => (
                        <div key={idx} className="p-2 bg-white border border-blue-200 rounded">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{expense.item}</span>
                            <Badge variant="outline">${expense.estimated_cost?.toLocaleString()}</Badge>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{expense.timeframe}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Cost Optimization Tips */}
          {aiInsights.cost_optimization?.length > 0 && (
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-green-600" />
                  💡 Cost Optimization Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiInsights.cost_optimization.map((tip, idx) => (
                  <div key={idx} className="p-3 bg-white border border-green-200 rounded">
                    <p className="text-sm text-gray-700 mb-1">{tip.tip}</p>
                    <Badge className="bg-green-600 text-white">
                      Save: {tip.potential_savings}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Proactive Actions */}
          {aiInsights.proactive_actions?.length > 0 && (
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  ⚡ Recommended Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiInsights.proactive_actions.map((action, idx) => (
                  <div key={idx} className="p-3 bg-white border border-orange-200 rounded">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold flex-1">{action.action}</p>
                      <Badge variant="outline" className="flex-shrink-0">
                        {action.timeframe}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      <strong>Prevents:</strong> {action.prevents}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Pattern Insights */}
          {aiInsights.pattern_insights?.length > 0 && (
            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-lg">📊 Pattern Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {aiInsights.pattern_insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                      <span className="text-purple-600 font-bold mt-0.5">•</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Regenerate Button */}
          <Button
            onClick={onRegenerateAI}
            variant="outline"
            disabled={generatingAI}
            className="w-full"
            style={{ minHeight: '48px' }}
          >
            {generatingAI ? 'Analyzing...' : 'Regenerate AI Insights'}
          </Button>
        </>
      )}

      {/* Generate AI Button (if no insights yet) */}
      {!aiInsights && !generatingAI && tasks.length >= 3 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
          <CardContent className="py-8 text-center">
            <Zap className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Get AI-Powered Insights
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Analyze your maintenance history to identify risks, forecast spending, and optimize costs
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

    </div>
  );
}