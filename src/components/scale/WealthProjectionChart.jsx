import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  RefreshCw, 
  Download, 
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DisclaimerBox from "./DisclaimerBox";

export default function WealthProjectionChart({ projections, equityData, properties }) {
  const [activeScenario, setActiveScenario] = useState('ai-optimal');
  const [showYearTable, setShowYearTable] = useState(false);
  const queryClient = useQueryClient();

  // Find or generate projections
  const aiOptimalProjection = projections.find(p => p.scenario_name === 'AI_OPTIMAL' || p.is_ai_recommended);
  const holdAllProjection = projections.find(p => p.scenario_name === 'HOLD_ALL');
  const sellUnderperformersProjection = projections.find(p => p.scenario_name === 'SELL_UNDERPERFORMERS');

  const activeProjection = 
    activeScenario === 'ai-optimal' ? aiOptimalProjection :
    activeScenario === 'hold-all' ? holdAllProjection :
    sellUnderperformersProjection;

  // Generate projection mutation
  const generateProjection = useMutation({
    mutationFn: async (scenarioType) => {
      // Simplified projection calculation (in production, would be more complex)
      const currentYear = new Date().getFullYear();
      const totalCurrentValue = equityData.reduce((sum, e) => sum + (e.current_market_value || 0), 0);
      const totalCurrentDebt = equityData.reduce((sum, e) => sum + (e.total_debt || 0), 0);
      const totalCurrentEquity = totalCurrentValue - totalCurrentDebt;

      const yearlyProjections = [];
      const appreciationRate = 0.04; // 4% annual

      for (let year = 0; year <= 10; year++) {
        const appreciatedValue = totalCurrentValue * Math.pow(1 + appreciationRate, year);
        const remainingDebt = Math.max(0, totalCurrentDebt * Math.pow(0.92, year)); // Simplified amortization
        
        yearlyProjections.push({
          year: currentYear + year,
          total_value: Math.round(appreciatedValue),
          total_debt: Math.round(remainingDebt),
          total_equity: Math.round(appreciatedValue - remainingDebt),
          annual_cashflow: 0
        });
      }

      const projection = await base44.entities.WealthProjection.create({
        scenario_name: scenarioType,
        scenario_description: scenarioType === 'HOLD_ALL' ? 'Hold all properties' : 
                             scenarioType === 'AI_OPTIMAL' ? 'AI optimal strategy' :
                             'Sell underperforming properties',
        avg_appreciation_rate: 4.0,
        avg_rent_increase_rate: 3.0,
        avg_expense_increase_rate: 2.5,
        inflation_rate: 2.5,
        yearly_projections: yearlyProjections,
        starting_equity: yearlyProjections[0].total_equity,
        ending_equity: yearlyProjections[10].total_equity,
        total_equity_gain: yearlyProjections[10].total_equity - yearlyProjections[0].total_equity,
        total_cashflow_10yr: 0,
        avg_annual_return: 0,
        property_actions: [],
        is_ai_recommended: scenarioType === 'AI_OPTIMAL'
      });

      return projection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['wealth-projections']);
    }
  });

  // Chart data
  const chartData = useMemo(() => {
    if (!activeProjection?.yearly_projections) return [];
    
    return activeProjection.yearly_projections.map(y => ({
      year: y.year,
      value: y.total_value,
      debt: y.total_debt,
      equity: y.total_equity
    }));
  }, [activeProjection]);

  // Empty state
  if (equityData.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Set Up Equity Data First</h3>
          <p className="text-gray-600">
            Add your property's financial position in the Equity Position tab to generate wealth projections.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!activeProjection) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-purple-200">
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Generate 10-Year Wealth Projection</h3>
            <p className="text-gray-600 mb-6">
              See how your portfolio equity could grow over the next decade with different strategies.
            </p>
            <Button
              onClick={() => generateProjection.mutate('AI_OPTIMAL')}
              disabled={generateProjection.isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Projections
            </Button>
          </CardContent>
        </Card>
        <DisclaimerBox />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Scenario Selector */}
      <Card className="border-2 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-600" />
            Wealth Trajectory - 10-Year Projections
          </CardTitle>
          <p className="text-sm text-gray-600">
            Current Net Worth: <strong className="text-green-700">${activeProjection.starting_equity?.toLocaleString()}</strong>
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeScenario} onValueChange={setActiveScenario}>
            <TabsList className="grid w-full grid-cols-3 h-auto">
              <TabsTrigger value="hold-all" style={{ minHeight: '48px' }}>
                Hold All
              </TabsTrigger>
              <TabsTrigger value="sell-underperformers" style={{ minHeight: '48px' }}>
                Optimize
              </TabsTrigger>
              <TabsTrigger value="ai-optimal" style={{ minHeight: '48px' }}>
                AI Optimal ⭐
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Projection Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {activeProjection.scenario_description}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                  labelFormatter={(year) => `Year ${year}`}
                />
                <Legend />
                <Area type="monotone" dataKey="value" stackId="1" stroke="#3b82f6" fill="#93c5fd" name="Total Value" />
                <Area type="monotone" dataKey="debt" stackId="2" stroke="#ef4444" fill="#fca5a5" name="Total Debt" />
                <Area type="monotone" dataKey="equity" stackId="3" stroke="#10b981" fill="#6ee7b7" name="Net Equity" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 10-Year Outcomes */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Starting Equity</p>
              <p className="text-xl font-bold text-gray-900">
                ${activeProjection.starting_equity?.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Ending Equity</p>
              <p className="text-xl font-bold text-green-700">
                ${activeProjection.ending_equity?.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Total Gain</p>
              <p className="text-xl font-bold text-green-700">
                +${activeProjection.total_equity_gain?.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600 mb-1">Annual Return</p>
              <p className="text-xl font-bold text-purple-700">
                {activeProjection.avg_annual_return?.toFixed(1) || 'N/A'}%
              </p>
            </div>
          </div>

          {/* Year-by-Year Table */}
          <div className="mt-6">
            <button
              onClick={() => setShowYearTable(!showYearTable)}
              className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              {showYearTable ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              View Year-by-Year Breakdown
            </button>

            {showYearTable && activeProjection.yearly_projections && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Year</th>
                      <th className="p-2 text-right">Value</th>
                      <th className="p-2 text-right">Debt</th>
                      <th className="p-2 text-right">Equity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeProjection.yearly_projections.map((year, idx) => (
                      <tr key={idx} className="border-b">
                        <td className="p-2">{year.year}</td>
                        <td className="p-2 text-right">${year.total_value?.toLocaleString()}</td>
                        <td className="p-2 text-right text-red-700">${year.total_debt?.toLocaleString()}</td>
                        <td className="p-2 text-right text-green-700 font-semibold">${year.total_equity?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => generateProjection.mutate(activeScenario)}
              disabled={generateProjection.isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

        </CardContent>
      </Card>

      <DisclaimerBox />
    </div>
  );
}