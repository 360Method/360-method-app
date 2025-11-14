import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, AlertCircle, RefreshCw, Download, Sparkles } from "lucide-react";
import DisclaimerBox from "./DisclaimerBox";

const MARKET_BENCHMARKS = {
  'Zone 1: Hot & Humid (Southeast)': {
    avg_appreciation_rate: 3.5,
    avg_cap_rate: 6.2,
    avg_maintenance_spend_pct: 1.6,
    emergency_repair_ratio: 0.38,
    avg_equity_position: 40.0
  },
  'Zone 2: Hot & Dry (Southwest)': {
    avg_appreciation_rate: 4.5,
    avg_cap_rate: 5.5,
    avg_maintenance_spend_pct: 1.4,
    emergency_repair_ratio: 0.32,
    avg_equity_position: 43.0
  },
  'Zone 4: Temperate/Coastal (Pacific NW)': {
    avg_appreciation_rate: 4.0,
    avg_cap_rate: 5.8,
    avg_maintenance_spend_pct: 1.5,
    emergency_repair_ratio: 0.35,
    avg_equity_position: 42.0
  },
  'Zone 5: Four-Season/Mixed': {
    avg_appreciation_rate: 3.8,
    avg_cap_rate: 6.0,
    avg_maintenance_spend_pct: 1.6,
    emergency_repair_ratio: 0.36,
    avg_equity_position: 41.0
  }
};

export default function BenchmarkComparison({ benchmarks, equityData, properties }) {
  const queryClient = useQueryClient();

  const { data: systems = [] } = useQuery({
    queryKey: ['all-systems'],
    queryFn: () => base44.entities.SystemBaseline.list()
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['completed-tasks'],
    queryFn: () => base44.entities.MaintenanceTask.filter({ 
      status: 'Completed',
      completion_date: { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString() }
    })
  });

  const { data: preserveImpacts = [] } = useQuery({
    queryKey: ['all-preserve-impacts'],
    queryFn: () => base44.entities.PreservationImpact.list()
  });

  const latestBenchmark = benchmarks[0];

  // Generate benchmark
  const generateBenchmark = useMutation({
    mutationFn: async () => {
      const climateZone = properties[0]?.climate_zone || 'Zone 4: Temperate/Coastal (Pacific NW)';
      const marketData = MARKET_BENCHMARKS[climateZone] || MARKET_BENCHMARKS['Zone 4: Temperate/Coastal (Pacific NW)'];

      // Calculate user metrics
      const userAppreciation = equityData.reduce((sum, e) => sum + (e.annual_appreciation_rate || 0), 0) / Math.max(equityData.length, 1);
      const rentals = equityData.filter(e => e.is_rental);
      const userCapRate = rentals.length > 0 
        ? rentals.reduce((sum, e) => sum + (e.cap_rate || 0), 0) / rentals.length
        : 0;
      
      const totalValue = equityData.reduce((sum, e) => sum + (e.current_market_value || 0), 0);
      const totalMaintenance = tasks.reduce((sum, t) => sum + (t.actual_cost || 0), 0);
      const maintenanceSpendPct = totalValue > 0 ? (totalMaintenance / totalValue) * 100 : 0;
      
      const emergencyTasks = tasks.filter(t => t.priority === 'High' || t.priority === 'Tier 1 - Safety/Emergency');
      const emergencyRatio = tasks.length > 0 ? emergencyTasks.length / tasks.length : 0;
      
      const userEquityPosition = equityData.reduce((sum, e) => sum + (e.equity_percentage || 0), 0) / Math.max(equityData.length, 1);

      // Calculate health scores (simplified)
      const systemHealthScore = 85; // Would calculate from systems
      const financialHealthScore = 78; // Would calculate from equity positions
      const maintenanceScore = Math.round(100 - (emergencyRatio * 100)); // Lower emergency ratio = higher score
      const growthScore = Math.round(Math.min(userAppreciation / 5 * 100, 100)); // Cap at 5% appreciation

      const overallHealthScore = Math.round(
        systemHealthScore * 0.25 +
        financialHealthScore * 0.30 +
        maintenanceScore * 0.25 +
        growthScore * 0.20
      );

      // Compare metrics
      const compareMetric = (user, market, inverse = false) => {
        const ratio = user / market;
        if (inverse) {
          if (ratio < 0.85) return 'MUCH_BETTER';
          if (ratio < 0.95) return 'ABOVE_AVERAGE';
          if (ratio <= 1.05) return 'AVERAGE';
          return 'BELOW_AVERAGE';
        } else {
          if (ratio > 1.15) return 'MUCH_BETTER';
          if (ratio > 1.05) return 'ABOVE_AVERAGE';
          if (ratio >= 0.95) return 'AVERAGE';
          return 'BELOW_AVERAGE';
        }
      };

      return await base44.entities.PortfolioBenchmark.create({
        overall_health_score: overallHealthScore,
        system_health_score: systemHealthScore,
        financial_health_score: financialHealthScore,
        maintenance_score: maintenanceScore,
        growth_trajectory_score: growthScore,
        user_avg_appreciation_rate: userAppreciation,
        user_avg_cap_rate: userCapRate,
        user_avg_maintenance_spend_pct: maintenanceSpendPct,
        user_emergency_repair_ratio: emergencyRatio,
        user_avg_equity_position: userEquityPosition,
        market_avg_appreciation_rate: marketData.avg_appreciation_rate,
        market_avg_cap_rate: marketData.avg_cap_rate,
        market_avg_maintenance_spend_pct: marketData.avg_maintenance_spend_pct,
        market_emergency_repair_ratio: marketData.emergency_repair_ratio,
        market_avg_equity_position: marketData.avg_equity_position,
        appreciation_vs_market: compareMetric(userAppreciation, marketData.avg_appreciation_rate),
        cap_rate_vs_market: compareMetric(userCapRate, marketData.avg_cap_rate),
        maintenance_vs_market: compareMetric(maintenanceSpendPct, marketData.avg_maintenance_spend_pct, true),
        emergency_ratio_vs_market: compareMetric(emergencyRatio, marketData.emergency_repair_ratio, true),
        equity_vs_market: compareMetric(userEquityPosition, marketData.avg_equity_position),
        strengths: [
          { title: 'Proactive Maintenance', description: `${(emergencyRatio * 100).toFixed(0)}% emergency ratio vs ${(marketData.emergency_repair_ratio * 100).toFixed(0)}% market` }
        ],
        opportunities: [
          { title: 'Continue proactive approach', description: 'Maintain current strategy', action: 'Keep using 360° Method' }
        ],
        climate_zone: climateZone,
        benchmark_date: new Date().toISOString(),
        next_benchmark_due: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['portfolio-benchmarks']);
    }
  });

  // Render comparison bar
  const ComparisonBar = ({ label, userValue, marketValue, inverse = false, unit = '%' }) => {
    const userPct = (userValue / marketValue) * 100;
    const isGood = inverse ? userPct < 100 : userPct > 100;
    
    return (
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-gray-700">{label}</p>
          {isGood ? (
            <Badge className="bg-green-600 text-white text-xs">✓ ABOVE AVERAGE</Badge>
          ) : (
            <Badge variant="outline" className="text-xs">Average</Badge>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-600">You</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full ${isGood ? 'bg-green-600' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(userPct, 100)}%` }}
                />
              </div>
              <p className="text-sm font-bold">{userValue?.toFixed(1)}{unit}</p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-600">Market</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-3">
                <div className="bg-gray-400 h-3 rounded-full" style={{ width: '100%' }} />
              </div>
              <p className="text-sm font-bold text-gray-600">{marketValue?.toFixed(1)}{unit}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!latestBenchmark) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-purple-200">
          <CardContent className="p-12 text-center">
            <Trophy className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Generate Portfolio Benchmark</h3>
            <p className="text-gray-600 mb-6">
              See how your portfolio performance compares to market averages in your region.
            </p>
            <Button
              onClick={() => generateBenchmark.mutate()}
              disabled={generateBenchmark.isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Benchmark
            </Button>
          </CardContent>
        </Card>
        <DisclaimerBox />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Overall Health Score */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-600" />
            Portfolio Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">OVERALL HEALTH SCORE</p>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#10b981"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(latestBenchmark.overall_health_score / 100) * 352} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">{latestBenchmark.overall_health_score}</p>
                  <p className="text-xs text-gray-600">/100</p>
                </div>
              </div>
            </div>
            <Badge className="bg-green-600 text-white">
              {latestBenchmark.overall_health_score >= 80 ? 'EXCELLENT' :
               latestBenchmark.overall_health_score >= 60 ? 'GOOD' :
               latestBenchmark.overall_health_score >= 40 ? 'FAIR' : 'NEEDS IMPROVEMENT'}
            </Badge>
          </div>

          {/* Health Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-xs text-gray-600 mb-1">System Health</p>
              <p className="text-2xl font-bold text-gray-900">{latestBenchmark.system_health_score}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-xs text-gray-600 mb-1">Financial Health</p>
              <p className="text-2xl font-bold text-gray-900">{latestBenchmark.financial_health_score}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-xs text-gray-600 mb-1">Maintenance</p>
              <p className="text-2xl font-bold text-gray-900">{latestBenchmark.maintenance_score}</p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg border">
              <p className="text-xs text-gray-600 mb-1">Growth</p>
              <p className="text-2xl font-bold text-gray-900">{latestBenchmark.growth_trajectory_score}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            Market Comparison
          </CardTitle>
          <p className="text-sm text-gray-600">
            {latestBenchmark.climate_zone || 'Your Region'}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          
          <ComparisonBar
            label="Appreciation Rate"
            userValue={latestBenchmark.user_avg_appreciation_rate}
            marketValue={latestBenchmark.market_avg_appreciation_rate}
          />

          {latestBenchmark.user_avg_cap_rate > 0 && (
            <ComparisonBar
              label="Cap Rate (Rentals)"
              userValue={latestBenchmark.user_avg_cap_rate}
              marketValue={latestBenchmark.market_avg_cap_rate}
            />
          )}

          <ComparisonBar
            label="Maintenance Spend"
            userValue={latestBenchmark.user_avg_maintenance_spend_pct}
            marketValue={latestBenchmark.market_avg_maintenance_spend_pct}
            inverse={true}
          />

          <ComparisonBar
            label="Emergency Repairs"
            userValue={latestBenchmark.user_emergency_repair_ratio * 100}
            marketValue={latestBenchmark.market_emergency_repair_ratio * 100}
            inverse={true}
          />

          <ComparisonBar
            label="Equity Position"
            userValue={latestBenchmark.user_avg_equity_position}
            marketValue={latestBenchmark.market_avg_equity_position}
          />

        </CardContent>
      </Card>

      {/* Strengths & Opportunities */}
      {latestBenchmark.strengths?.length > 0 && (
        <Card className="border-2 border-green-300 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg">💡 Your Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestBenchmark.strengths.map((strength, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border-l-4 border-green-600">
                  <p className="font-semibold text-green-900 text-sm mb-1">✓ {strength.title}</p>
                  <p className="text-sm text-green-800">{strength.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {latestBenchmark.opportunities?.length > 0 && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-lg">⚠️ Opportunities to Improve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {latestBenchmark.opportunities.map((opp, idx) => (
                <div key={idx} className="p-3 bg-white rounded-lg border-l-4 border-orange-600">
                  <p className="font-semibold text-orange-900 text-sm mb-1">{opp.title}</p>
                  <p className="text-sm text-orange-800">{opp.description}</p>
                  {opp.action && (
                    <p className="text-xs text-orange-700 mt-2">→ {opp.action}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => generateBenchmark.mutate()}
          disabled={generateBenchmark.isLoading}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Benchmark
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <DisclaimerBox />
    </div>
  );
}