import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, DollarSign, Calendar, Download, Filter, Plus, TrendingUp, AlertTriangle, CheckCircle2, Target, Award, BarChart3, PieChart, Sparkles, Brain, TrendingDown, Zap } from "lucide-react";
import TimelineItem from "../components/track/TimelineItem";
import CostSummary from "../components/track/CostSummary";
import ManualTaskForm from "../components/tasks/ManualTaskForm";
import { Progress } from "@/components/ui/progress";

export default function Track() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [filterType, setFilterType] = React.useState('all');
  const [filterDate, setFilterDate] = React.useState('all');
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('timeline'); // 'timeline', 'analytics', 'systems'
  const [aiInsights, setAiInsights] = React.useState(null);
  const [generatingAI, setGeneratingAI] = React.useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.MaintenanceTask.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: systems = [] } = useQuery({
    queryKey: ['systemBaselines', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.SystemBaseline.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: inspections = [] } = useQuery({
    queryKey: ['inspections', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.Inspection.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  const { data: upgrades = [] } = useQuery({
    queryKey: ['upgrades', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.Upgrade.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Build timeline items
  const timelineItems = [];

  tasks.filter(t => t.status === 'Completed' && t.completion_date).forEach(task => {
    timelineItems.push({
      type: 'task',
      date: new Date(task.completion_date),
      title: task.title,
      category: task.system_type,
      cost: task.actual_cost,
      data: task
    });
  });

  systems.forEach(system => {
    if (system.installation_year) {
      timelineItems.push({
        type: 'system',
        date: new Date(system.installation_year, 0, 1),
        title: `${system.system_type} Installed`,
        category: system.system_type,
        data: system
      });
    }
  });

  inspections.filter(i => i.status === 'Completed').forEach(inspection => {
    timelineItems.push({
      type: 'inspection',
      date: new Date(inspection.inspection_date),
      title: `${inspection.season} Inspection`,
      category: 'General',
      data: inspection
    });
  });

  upgrades.filter(u => u.status === 'Completed' && u.completion_date).forEach(upgrade => {
    timelineItems.push({
      type: 'upgrade',
      date: new Date(upgrade.completion_date),
      title: upgrade.title,
      category: upgrade.category,
      cost: upgrade.actual_cost,
      data: upgrade
    });
  });

  timelineItems.sort((a, b) => b.date - a.date);

  // Analytics calculations
  const totalCost = timelineItems
    .filter(item => item.cost)
    .reduce((sum, item) => sum + item.cost, 0);

  const costsBySystem = {};
  timelineItems.filter(item => item.cost && item.category).forEach(item => {
    if (!costsBySystem[item.category]) {
      costsBySystem[item.category] = 0;
    }
    costsBySystem[item.category] += item.cost;
  });

  const topCostSystems = Object.entries(costsBySystem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // System health tracking
  const systemHealthData = systems.map(system => {
    const age = system.installation_year ? new Date().getFullYear() - system.installation_year : null;
    const lifespan = system.estimated_lifespan_years;
    const lifespanPercent = age && lifespan ? Math.min((age / lifespan) * 100, 100) : 0;
    
    const systemTasks = tasks.filter(t => 
      t.title.toLowerCase().includes(system.system_type.toLowerCase()) ||
      t.system_type === system.system_type
    );
    
    const completedTasks = systemTasks.filter(t => t.status === 'Completed').length;
    const totalTaskCost = systemTasks
      .filter(t => t.actual_cost)
      .reduce((sum, t) => sum + t.actual_cost, 0);

    return {
      system,
      age,
      lifespan,
      lifespanPercent,
      completedTasks,
      totalTaskCost,
      healthScore: lifespanPercent < 50 ? 'good' : lifespanPercent < 80 ? 'fair' : 'poor'
    };
  });

  // Monthly spending trend (last 12 months)
  const monthlySpending = {};
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlySpending[key] = 0;
  }

  timelineItems.filter(item => item.cost && item.date >= new Date(now.getFullYear(), now.getMonth() - 11, 1)).forEach(item => {
    const key = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlySpending[key] !== undefined) {
      monthlySpending[key] += item.cost;
    }
  });

  const averageMonthlySpend = Object.values(monthlySpending).reduce((sum, val) => sum + val, 0) / 12;

  // Generate AI Insights
  const generateAIInsights = async () => {
    if (systems.length === 0 && tasks.length === 0) {
      alert("Please document some systems and maintenance tasks first to generate AI insights.");
      return;
    }

    setGeneratingAI(true);
    try {
      const prompt = `You are an expert home maintenance analyst. Analyze this property's maintenance data and provide actionable insights.

PROPERTY DATA:
- Total systems documented: ${systems.length}
- Total maintenance tasks completed: ${tasks.filter(t => t.status === 'Completed').length}
- Total inspections completed: ${inspections.filter(i => i.status === 'Completed').length}
- Total spent on maintenance: $${totalCost.toLocaleString()}
- Average monthly spend (last 12 months): $${Math.round(averageMonthlySpend).toLocaleString()}

SYSTEMS WITH AGE DATA:
${systemHealthData.filter(s => s.age).map(s => 
  `- ${s.system.system_type}: ${s.age} years old (${s.lifespanPercent.toFixed(0)}% of ${s.lifespan}-year lifespan), spent $${s.totalTaskCost.toLocaleString()}, condition: ${s.system.condition || 'Good'}`
).join('\n')}

SPENDING BY SYSTEM:
${topCostSystems.map(([system, cost]) => `- ${system}: $${cost.toLocaleString()}`).join('\n')}

MONTHLY SPENDING (Last 12 months):
${Object.entries(monthlySpending).map(([month, amount]) => `${month}: $${amount.toLocaleString()}`).join('\n')}

Provide comprehensive analysis in the following structure:
1. Overall Assessment (2-3 sentences on property maintenance health)
2. Top 3 Risks (systems/areas that need attention, with specific reasons)
3. Spending Forecast (predict next 12 months spending based on patterns, system ages, and upcoming needs)
4. Cost Optimization Tips (3-4 specific ways to reduce spending without compromising quality)
5. Proactive Actions (3-4 specific preventive tasks to do in next 3-6 months based on system ages and patterns)
6. Pattern Insights (notable patterns in spending, timing, or maintenance habits)

Be specific, practical, and data-driven. Reference actual numbers and system names.`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_assessment: { type: "string" },
            top_risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  system: { type: "string" },
                  risk_level: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
                  reason: { type: "string" },
                  action: { type: "string" }
                }
              }
            },
            spending_forecast: {
              type: "object",
              properties: {
                next_12_months_estimate: { type: "number" },
                monthly_average_forecast: { type: "number" },
                explanation: { type: "string" },
                major_expenses_upcoming: { 
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      item: { type: "string" },
                      timeframe: { type: "string" },
                      estimated_cost: { type: "number" }
                    }
                  }
                }
              }
            },
            cost_optimization: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  tip: { type: "string" },
                  potential_savings: { type: "string" }
                }
              }
            },
            proactive_actions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  timeframe: { type: "string" },
                  prevents: { type: "string" }
                }
              }
            },
            pattern_insights: { type: "array", items: { type: "string" } }
          },
          required: ["overall_assessment", "top_risks", "spending_forecast", "cost_optimization", "proactive_actions", "pattern_insights"]
        }
      });

      setAiInsights(analysis);
    } catch (error) {
      console.error('AI analysis failed:', error);
      alert('Failed to generate AI insights. Please try again.');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Apply filters
  let filteredItems = timelineItems;
  
  if (filterType !== 'all') {
    filteredItems = filteredItems.filter(item => item.type === filterType);
  }

  if (filterDate !== 'all') {
    const cutoffDate = new Date();
    
    if (filterDate === '30days') {
      cutoffDate.setDate(now.getDate() - 30);
    } else if (filterDate === '6months') {
      cutoffDate.setMonth(now.getMonth() - 6);
    } else if (filterDate === '1year') {
      cutoffDate.setFullYear(now.getFullYear() - 1);
    }
    
    filteredItems = filteredItems.filter(item => item.date >= cutoffDate);
  }

  const currentProperty = properties.find(p => p.id === selectedProperty);

  const exportReport = () => {
    const reportData = filteredItems.map(item => ({
      Date: item.date.toLocaleDateString(),
      Type: item.type,
      Title: item.title,
      Category: item.category,
      Cost: item.cost ? `$${item.cost.toFixed(2)}` : '-'
    }));

    const headers = Object.keys(reportData[0] || {});
    if (headers.length === 0) return;

    const csvContent = [
      headers.join(','),
      ...reportData.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentProperty?.address || 'property'}-history.csv`;
    link.click();
  };

  if (showTaskForm) {
    return (
      <ManualTaskForm
        propertyId={selectedProperty}
        onComplete={() => setShowTaskForm(false)}
        onCancel={() => setShowTaskForm(false)}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#1B365D' }}>AWARE → Track</h1>
            <p className="text-gray-600 mt-1">Complete history & analytics of your property</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => setShowTaskForm(true)}
              className="gap-2"
              style={{ backgroundColor: '#28A745', minHeight: '48px' }}
            >
              <Plus className="w-5 h-5" />
              Log Maintenance
            </Button>
            <Button onClick={exportReport} variant="outline" className="gap-2" style={{ minHeight: '48px' }}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full md:w-96">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights Button */}
        {selectedProperty && (systems.length > 0 || tasks.length > 0) && !aiInsights && (
          <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Brain className="w-8 h-8 text-purple-600 flex-shrink-0" />
                  <div>
                    <h3 className="font-bold text-purple-900 text-lg">AI-Powered Insights Available</h3>
                    <p className="text-purple-800 text-sm mt-1">
                      Get personalized analysis of your maintenance patterns, spending forecast, risk assessment, and optimization tips
                    </p>
                  </div>
                </div>
                <Button
                  onClick={generateAIInsights}
                  disabled={generatingAI}
                  className="gap-2 whitespace-nowrap"
                  style={{ backgroundColor: '#8B5CF6', minHeight: '48px' }}
                >
                  {generatingAI ? (
                    <>
                      <span className="animate-spin">⚙️</span>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate AI Insights
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Insights Display */}
        {aiInsights && (
          <Card className="border-2 border-purple-400 bg-gradient-to-r from-purple-50 to-blue-50 shadow-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Brain className="w-6 h-6" />
                  AI-Powered Insights
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAiInsights(null)}
                  className="text-purple-600"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Assessment */}
              <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                <h4 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Overall Assessment
                </h4>
                <p className="text-gray-800">{aiInsights.overall_assessment}</p>
              </div>

              {/* Top Risks */}
              {aiInsights.top_risks?.length > 0 && (
                <div className="bg-white rounded-lg p-4 border-2 border-red-200">
                  <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Top Risks to Address
                  </h4>
                  <div className="space-y-3">
                    {aiInsights.top_risks.map((risk, idx) => (
                      <div key={idx} className={`p-3 rounded border-l-4 ${
                        risk.risk_level === 'HIGH' ? 'bg-red-50 border-red-500' :
                        risk.risk_level === 'MEDIUM' ? 'bg-orange-50 border-orange-500' :
                        'bg-yellow-50 border-yellow-500'
                      }`}>
                        <div className="flex items-start justify-between mb-1">
                          <span className="font-semibold text-gray-900">{risk.system}</span>
                          <Badge className={
                            risk.risk_level === 'HIGH' ? 'bg-red-600 text-white' :
                            risk.risk_level === 'MEDIUM' ? 'bg-orange-600 text-white' :
                            'bg-yellow-600 text-white'
                          }>
                            {risk.risk_level} RISK
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{risk.reason}</p>
                        <p className="text-sm font-medium text-gray-900">
                          ✓ Action: {risk.action}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Spending Forecast */}
              {aiInsights.spending_forecast && (
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Spending Forecast (Next 12 Months)
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-sm text-blue-800 mb-1">Total Estimated</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ${aiInsights.spending_forecast.next_12_months_estimate?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <p className="text-sm text-blue-800 mb-1">Monthly Average</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ${aiInsights.spending_forecast.monthly_average_forecast?.toLocaleString() || 'N/A'}/mo
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 mb-3">{aiInsights.spending_forecast.explanation}</p>
                  
                  {aiInsights.spending_forecast.major_expenses_upcoming?.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <p className="font-semibold text-gray-900 mb-2">Major Expenses to Plan For:</p>
                      <div className="space-y-2">
                        {aiInsights.spending_forecast.major_expenses_upcoming.map((expense, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-yellow-50 rounded border border-yellow-200">
                            <div>
                              <p className="font-medium text-gray-900">{expense.item}</p>
                              <p className="text-xs text-gray-600">{expense.timeframe}</p>
                            </div>
                            <p className="font-bold text-gray-900">${expense.estimated_cost?.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cost Optimization */}
              {aiInsights.cost_optimization?.length > 0 && (
                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Cost Optimization Opportunities
                  </h4>
                  <div className="space-y-3">
                    {aiInsights.cost_optimization.map((opt, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded border border-green-200">
                        <DollarSign className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-800">{opt.tip}</p>
                          <p className="text-xs font-semibold text-green-800 mt-1">
                            💰 Potential savings: {opt.potential_savings}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Proactive Actions */}
              {aiInsights.proactive_actions?.length > 0 && (
                <div className="bg-white rounded-lg p-4 border-2 border-orange-200">
                  <h4 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Proactive Actions (Next 3-6 Months)
                  </h4>
                  <div className="space-y-3">
                    {aiInsights.proactive_actions.map((action, idx) => (
                      <div key={idx} className="p-3 bg-orange-50 rounded border border-orange-200">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium text-gray-900">{action.action}</p>
                          <Badge variant="outline" className="text-xs bg-white">
                            {action.timeframe}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">
                          🛡️ Prevents: {action.prevents}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pattern Insights */}
              {aiInsights.pattern_insights?.length > 0 && (
                <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Pattern Insights
                  </h4>
                  <ul className="space-y-2">
                    {aiInsights.pattern_insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                        <span className="text-purple-600 font-bold mt-0.5">📊</span>
                        <span>{insight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={generateAIInsights}
                disabled={generatingAI}
                variant="outline"
                className="w-full gap-2"
                style={{ minHeight: '48px' }}
              >
                {generatingAI ? 'Regenerating...' : 'Regenerate Insights'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* View Mode Toggle */}
        <Card className="border-none shadow-lg">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={viewMode === 'timeline' ? 'default' : 'outline'}
                onClick={() => setViewMode('timeline')}
                className="gap-2"
                style={viewMode === 'timeline' ? { backgroundColor: '#1B365D' } : {}}
              >
                <Activity className="w-4 h-4" />
                Timeline
              </Button>
              <Button
                variant={viewMode === 'analytics' ? 'default' : 'outline'}
                onClick={() => setViewMode('analytics')}
                className="gap-2"
                style={viewMode === 'analytics' ? { backgroundColor: '#1B365D' } : {}}
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              <Button
                variant={viewMode === 'systems' ? 'default' : 'outline'}
                onClick={() => setViewMode('systems')}
                className="gap-2"
                style={viewMode === 'systems' ? { backgroundColor: '#1B365D' } : {}}
              >
                <Target className="w-4 h-4" />
                By System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <CostSummary
            title="Total Invested"
            amount={totalCost}
            icon={DollarSign}
            color="blue"
          />
          <CostSummary
            title="Timeline Events"
            amount={timelineItems.length}
            icon={Activity}
            color="purple"
            isCount
          />
          <CostSummary
            title="Avg Monthly Spend"
            amount={Math.round(averageMonthlySpend)}
            icon={TrendingUp}
            color="orange"
          />
          <CostSummary
            title="Disasters Prevented"
            amount={currentProperty?.estimated_disasters_prevented || 0}
            icon={Award}
            color="green"
          />
        </div>

        {/* Analytics View */}
        {viewMode === 'analytics' && (
          <>
            {/* Monthly Spending Trend */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Monthly Spending Trend (Last 12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(monthlySpending).map(([month, amount]) => {
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    const maxSpend = Math.max(...Object.values(monthlySpending), 1);
                    const percent = (amount / maxSpend) * 100;

                    return (
                      <div key={month} className="flex items-center gap-4">
                        <div className="w-24 text-sm text-gray-600">{monthName}</div>
                        <div className="flex-1">
                          <div className="relative">
                            <Progress value={percent} className="h-8" />
                            <div className="absolute inset-0 flex items-center px-3">
                              <span className="text-xs font-semibold text-gray-900">
                                ${amount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm font-semibold text-blue-900">
                    💡 12-Month Average: ${Math.round(averageMonthlySpend).toLocaleString()}/month
                  </p>
                  <p className="text-xs text-blue-800 mt-1">
                    Budget approximately ${Math.round(averageMonthlySpend * 1.2).toLocaleString()}/month for maintenance reserve
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Cost by System */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Top Spending by System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCostSystems.map(([system, cost], idx) => {
                    const percent = (cost / totalCost) * 100;
                    return (
                      <div key={system} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-900">{system}</span>
                          <div className="text-right">
                            <span className="font-bold text-gray-900">${cost.toLocaleString()}</span>
                            <span className="text-sm text-gray-600 ml-2">({percent.toFixed(1)}%)</span>
                          </div>
                        </div>
                        <Progress value={percent} className="h-3" />
                      </div>
                    );
                  })}
                </div>
                {topCostSystems.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No cost data available yet</p>
                )}
              </CardContent>
            </Card>

            {/* Maintenance Insights */}
            <Card className="border-2 border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Award className="w-5 h-5" />
                  Your Maintenance Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Completed Tasks</p>
                      <p className="text-3xl font-bold text-green-700">
                        {tasks.filter(t => t.status === 'Completed').length}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Inspections Done</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {inspections.filter(i => i.status === 'Completed').length}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Systems Documented</p>
                      <p className="text-3xl font-bold text-purple-700">
                        {systems.length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                    <div className="flex items-center gap-3 mb-3">
                      <Trophy className="w-6 h-6 text-green-700" />
                      <p className="font-bold text-green-900">You're doing great!</p>
                    </div>
                    <ul className="text-sm text-gray-800 space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Tracking ${totalCost.toLocaleString()} in maintenance investments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Documented {systems.length} major systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Proactive approach prevents major failures</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* System Health View */}
        {viewMode === 'systems' && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                System Health & Maintenance History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemHealthData.length > 0 ? (
                  systemHealthData.map((data, idx) => (
                    <Card key={idx} className={`border-2 ${
                      data.healthScore === 'good' ? 'border-green-200' :
                      data.healthScore === 'fair' ? 'border-yellow-200' :
                      'border-red-200'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {data.system.nickname || data.system.system_type}
                            </h4>
                            {data.system.brand_model && (
                              <p className="text-sm text-gray-600">{data.system.brand_model}</p>
                            )}
                          </div>
                          <Badge className={
                            data.healthScore === 'good' ? 'bg-green-600 text-white' :
                            data.healthScore === 'fair' ? 'bg-yellow-600 text-white' :
                            'bg-red-600 text-white'
                          }>
                            {data.healthScore === 'good' ? 'Good Health' :
                             data.healthScore === 'fair' ? 'Fair Health' :
                             'Aging/Risk'}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-600">Age / Lifespan</p>
                            <p className="font-semibold text-gray-900">
                              {data.age ? `${data.age} / ${data.lifespan} years` : 'Unknown'}
                            </p>
                            {data.lifespanPercent > 0 && (
                              <Progress value={data.lifespanPercent} className="h-2 mt-1" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Maintenance Tasks</p>
                            <p className="font-semibold text-gray-900">{data.completedTasks} completed</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600">Total Spent</p>
                            <p className="font-semibold text-gray-900">${data.totalTaskCost.toLocaleString()}</p>
                          </div>
                        </div>

                        {data.system.condition && data.system.condition !== 'Good' && (
                          <div className="mt-3 pt-3 border-t flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-orange-600" />
                            <p className="text-sm text-orange-900">
                              Current condition: <span className="font-semibold">{data.system.condition}</span>
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No Systems Documented Yet</h3>
                    <p>Complete your baseline to see system health tracking</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline View */}
        {viewMode === 'timeline' && (
          <Card className="border-none shadow-lg">
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Timeline Filter
                </CardTitle>
                <div className="flex gap-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="task">Tasks</SelectItem>
                      <SelectItem value="inspection">Inspections</SelectItem>
                      <SelectItem value="upgrade">Upgrades</SelectItem>
                      <SelectItem value="system">Systems</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDate} onValueChange={setFilterDate}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="30days">Last 30 Days</SelectItem>
                      <SelectItem value="6months">Last 6 Months</SelectItem>
                      <SelectItem value="1year">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => (
                    <TimelineItem key={index} item={item} />
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">No Timeline Events Found</h3>
                    <p className="mb-4">Start documenting your maintenance to build your property history</p>
                    <Button
                      onClick={() => setShowTaskForm(true)}
                      style={{ backgroundColor: '#28A745', minHeight: '48px' }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Log First Maintenance Event
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}