import React, { useState } from "react";
import { SystemBaseline, MaintenanceTask, PreservationImpact, Inspection, Upgrade, PreservationRecommendation } from "@/api/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trophy, TrendingUp, AlertCircle, RefreshCw, Download, Sparkles, ClipboardCheck, Wrench, Shield, Home, Target, Calendar, FileSpreadsheet, File } from "lucide-react";
import DisclaimerBox from "./DisclaimerBox";
import { format } from 'date-fns';

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
  const [localBenchmark, setLocalBenchmark] = useState(null);
  const [generating, setGenerating] = useState(false);

  // STEP 1: BASELINE - System data
  const { data: systems = [] } = useQuery({
    queryKey: ['all-systems'],
    queryFn: () => SystemBaseline.list()
  });

  // STEP 2: INSPECT - Inspection history
  const { data: inspections = [] } = useQuery({
    queryKey: ['all-inspections'],
    queryFn: () => Inspection.list()
  });

  // STEP 3 & 6: TRACK & EXECUTE - All maintenance tasks
  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-tasks'],
    queryFn: () => MaintenanceTask.list()
  });

  // STEP 7: PRESERVE - Preservation recommendations
  const { data: preserveRecs = [] } = useQuery({
    queryKey: ['preserve-recommendations'],
    queryFn: () => PreservationRecommendation.list()
  });

  // STEP 7: PRESERVE - Preservation impacts
  const { data: preserveImpacts = [] } = useQuery({
    queryKey: ['all-preserve-impacts'],
    queryFn: () => PreservationImpact.list()
  });

  // STEP 8: UPGRADE - Upgrade projects
  const { data: upgrades = [] } = useQuery({
    queryKey: ['all-upgrades'],
    queryFn: () => Upgrade.list()
  });

  // Derived data calculations
  const completedTasks = allTasks.filter(t => t.status === 'Completed');
  const pendingTasks = allTasks.filter(t => t.status === 'pending' || t.status === 'Pending');
  const completedUpgrades = upgrades.filter(u => u.status === 'COMPLETED');
  const completedPreserve = preserveRecs.filter(r => r.status === 'COMPLETED');

  // Recent data (last 12 months)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const recentTasks = completedTasks.filter(t => t.completed_at && new Date(t.completed_at) >= oneYearAgo);
  const recentInspections = inspections.filter(i => i.created_at && new Date(i.created_at) >= oneYearAgo);

  // Use local benchmark first, fall back to props
  const latestBenchmark = localBenchmark || benchmarks?.[0];

  // Generate benchmark locally using ALL data from previous steps
  const handleGenerateBenchmark = () => {
    setGenerating(true);

    setTimeout(() => {
      const climateZone = properties[0]?.climate_zone || 'Zone 5: Four-Season/Mixed';
      const marketData = MARKET_BENCHMARKS[climateZone] || MARKET_BENCHMARKS['Zone 5: Four-Season/Mixed'];

      // ========================================
      // STEP 1: BASELINE - System Health Analysis
      // ========================================
      const systemsDocumented = systems.length;
      const systemsInGoodCondition = systems.filter(s =>
        s.condition === 'good' || s.condition === 'excellent' || s.condition === 'Good' || s.condition === 'Excellent'
      ).length;
      const systemsNeedingAttention = systems.filter(s =>
        s.condition === 'poor' || s.condition === 'critical' || s.condition === 'Poor' || s.condition === 'Critical'
      ).length;
      const avgSystemAge = systems.length > 0
        ? systems.reduce((sum, s) => sum + (s.age_years || 0), 0) / systems.length
        : 0;

      // ========================================
      // STEP 2: INSPECT - Inspection Frequency
      // ========================================
      const totalInspections = inspections.length;
      const recentInspectionCount = recentInspections.length;
      const lastInspectionDate = inspections.length > 0
        ? new Date(Math.max(...inspections.map(i => new Date(i.created_at || 0))))
        : null;
      const daysSinceLastInspection = lastInspectionDate
        ? Math.floor((new Date() - lastInspectionDate) / (1000 * 60 * 60 * 24))
        : 999;

      // ========================================
      // STEP 3 & 6: TRACK & EXECUTE - Maintenance Analysis
      // ========================================
      const totalTasksCompleted = completedTasks.length;
      const totalMaintenanceSpend = completedTasks.reduce((sum, t) => sum + (t.actual_cost || 0), 0);
      const avgTaskCost = totalTasksCompleted > 0 ? totalMaintenanceSpend / totalTasksCompleted : 0;

      const emergencyTasks = completedTasks.filter(t =>
        t.priority === 'High' || t.priority === 'Tier 1 - Safety/Emergency' || t.priority === 'critical'
      );
      const emergencyRatio = completedTasks.length > 0 ? emergencyTasks.length / completedTasks.length : 0.25;
      const emergencySpend = emergencyTasks.reduce((sum, t) => sum + (t.actual_cost || 0), 0);

      // DIY vs Professional ratio
      const diyTasks = completedTasks.filter(t => t.completed_by === 'diy' || t.completed_by === 'DIY');
      const diyRatio = completedTasks.length > 0 ? diyTasks.length / completedTasks.length : 0;

      // ========================================
      // STEP 7: PRESERVE - Preventive Maintenance
      // ========================================
      const totalPreserveRecs = preserveRecs.length;
      const completedPreserveCount = completedPreserve.length;
      const pendingPreserveCount = preserveRecs.filter(r => r.status === 'PENDING').length;
      const preserveCompletionRate = totalPreserveRecs > 0 ? completedPreserveCount / totalPreserveRecs : 0;
      const estimatedSavings = preserveImpacts.reduce((sum, i) => sum + (i.cost_avoided || 0), 0);

      // ========================================
      // STEP 8: UPGRADE - Value Improvements
      // ========================================
      const totalUpgrades = upgrades.length;
      const completedUpgradeCount = completedUpgrades.length;
      const upgradeInvestment = completedUpgrades.reduce((sum, u) => sum + (u.actual_cost || u.investment_required || 0), 0);
      const upgradeValueAdded = completedUpgrades.reduce((sum, u) => sum + (u.property_value_impact || 0), 0);
      const upgradeROI = upgradeInvestment > 0 ? ((upgradeValueAdded - upgradeInvestment) / upgradeInvestment) * 100 : 0;

      // ========================================
      // EQUITY DATA (from Scale tab)
      // ========================================
      const userAppreciation = equityData.length > 0
        ? equityData.reduce((sum, e) => sum + (e.annual_appreciation_rate || 3.5), 0) / equityData.length
        : 3.5;

      const rentals = equityData.filter(e => e.is_rental);
      const userCapRate = rentals.length > 0
        ? rentals.reduce((sum, e) => sum + (e.cap_rate || 0), 0) / rentals.length
        : 0;

      const totalValue = equityData.reduce((sum, e) => sum + (e.current_market_value || 0), 0);
      const maintenanceSpendPct = totalValue > 0 ? (totalMaintenanceSpend / totalValue) * 100 : 1.2;

      const userEquityPosition = equityData.length > 0
        ? equityData.reduce((sum, e) => sum + (e.equity_percentage || 40), 0) / equityData.length
        : 40;

      // ========================================
      // CALCULATE HEALTH SCORES
      // ========================================

      // System Health (from BASELINE)
      const systemHealthScore = Math.min(95, Math.round(
        (systemsDocumented > 0 ? 30 : 0) + // Have documented systems
        (systemsInGoodCondition / Math.max(systemsDocumented, 1)) * 40 + // Good condition ratio
        (systemsNeedingAttention === 0 ? 15 : 0) + // No critical systems
        (avgSystemAge < 10 ? 15 : avgSystemAge < 15 ? 10 : 5) // System age bonus
      ));

      // Financial Health (from equity + maintenance spending)
      const financialHealthScore = Math.min(95, Math.round(
        (userEquityPosition / 50 * 35) + // Equity contribution
        (emergencyRatio < 0.3 ? 20 : emergencyRatio < 0.5 ? 10 : 0) + // Low emergency spend
        (maintenanceSpendPct < 2 ? 15 : maintenanceSpendPct < 3 ? 10 : 5) + // Reasonable maintenance spend
        25 // Base score
      ));

      // Maintenance Score (from TRACK, EXECUTE, PRESERVE)
      const maintenanceScore = Math.min(95, Math.round(
        (100 - (emergencyRatio * 100)) * 0.4 + // Lower emergency ratio = better
        (preserveCompletionRate * 100) * 0.3 + // Preserve completion rate
        (recentInspectionCount > 0 ? 20 : daysSinceLastInspection < 90 ? 15 : 5) + // Recent inspections
        (diyRatio > 0.3 ? 10 : 5) // DIY engagement bonus
      ));

      // Growth Score (from UPGRADE + appreciation)
      const growthScore = Math.min(95, Math.round(
        Math.min(userAppreciation / 5 * 100, 40) + // Appreciation
        (completedUpgradeCount > 0 ? 25 : 0) + // Have done upgrades
        (upgradeROI > 0 ? Math.min(upgradeROI / 2, 20) : 0) + // Upgrade ROI
        15 // Base score
      ));

      const overallHealthScore = Math.round(
        systemHealthScore * 0.25 +
        financialHealthScore * 0.30 +
        maintenanceScore * 0.25 +
        growthScore * 0.20
      );

      // Compare metrics helper
      const compareMetric = (user, market, inverse = false) => {
        if (market === 0) return 'AVERAGE';
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

      // ========================================
      // GENERATE STRENGTHS (based on actual data)
      // ========================================
      const strengths = [];

      if (systemsDocumented >= properties.length * 5) {
        strengths.push({
          title: 'Comprehensive System Documentation',
          description: `${systemsDocumented} systems documented across ${properties.length} propert${properties.length > 1 ? 'ies' : 'y'}`,
          source: 'BASELINE'
        });
      }

      if (recentInspectionCount >= 2) {
        strengths.push({
          title: 'Regular Inspections',
          description: `${recentInspectionCount} inspections completed in the last 12 months`,
          source: 'INSPECT'
        });
      }

      if (emergencyRatio < marketData.emergency_repair_ratio) {
        strengths.push({
          title: 'Proactive Maintenance',
          description: `${(emergencyRatio * 100).toFixed(0)}% emergency repairs vs ${(marketData.emergency_repair_ratio * 100).toFixed(0)}% market average`,
          source: 'TRACK/EXECUTE'
        });
      }

      if (preserveCompletionRate > 0.5) {
        strengths.push({
          title: 'Strong Preventive Care',
          description: `${(preserveCompletionRate * 100).toFixed(0)}% of preservation recommendations completed`,
          source: 'PRESERVE'
        });
      }

      if (upgradeROI > 50) {
        strengths.push({
          title: 'Smart Upgrades',
          description: `${upgradeROI.toFixed(0)}% ROI on completed improvement projects`,
          source: 'UPGRADE'
        });
      }

      if (userEquityPosition > marketData.avg_equity_position) {
        strengths.push({
          title: 'Strong Equity Position',
          description: `${userEquityPosition.toFixed(1)}% equity vs ${marketData.avg_equity_position}% market average`,
          source: 'SCALE'
        });
      }

      if (strengths.length === 0) {
        strengths.push({
          title: 'Getting Started with 360° Method',
          description: 'Complete more steps to see your portfolio strengths',
          source: 'SYSTEM'
        });
      }

      // ========================================
      // GENERATE OPPORTUNITIES (based on actual data)
      // ========================================
      const opportunities = [];

      if (systemsDocumented < properties.length * 3) {
        opportunities.push({
          title: 'Document More Systems',
          description: `Only ${systemsDocumented} systems documented. Add more for better tracking.`,
          action: 'Go to BASELINE to add systems',
          source: 'BASELINE'
        });
      }

      if (daysSinceLastInspection > 90) {
        opportunities.push({
          title: 'Schedule an Inspection',
          description: `${daysSinceLastInspection > 365 ? 'Over a year' : `${daysSinceLastInspection} days`} since last inspection`,
          action: 'Go to INSPECT to start a walkthrough',
          source: 'INSPECT'
        });
      }

      if (emergencyRatio >= marketData.emergency_repair_ratio) {
        opportunities.push({
          title: 'Reduce Emergency Repairs',
          description: `${(emergencyRatio * 100).toFixed(0)}% of repairs are emergencies (market avg: ${(marketData.emergency_repair_ratio * 100).toFixed(0)}%)`,
          action: 'Review PRESERVE recommendations',
          source: 'PRESERVE'
        });
      }

      if (pendingPreserveCount > 3) {
        opportunities.push({
          title: 'Complete Pending Preservation',
          description: `${pendingPreserveCount} preservation recommendations waiting`,
          action: 'Review items in PRESERVE',
          source: 'PRESERVE'
        });
      }

      if (userEquityPosition < marketData.avg_equity_position) {
        opportunities.push({
          title: 'Build Equity Faster',
          description: `${userEquityPosition.toFixed(1)}% equity vs ${marketData.avg_equity_position}% market average`,
          action: 'Check UPGRADE for value-add projects',
          source: 'UPGRADE'
        });
      }

      if (opportunities.length === 0) {
        opportunities.push({
          title: 'Maintain Current Strategy',
          description: 'Your portfolio is performing well across all metrics',
          action: 'Continue with regular maintenance schedule',
          source: 'SYSTEM'
        });
      }

      // ========================================
      // BUILD RESULT WITH DATA SUMMARY
      // ========================================
      const result = {
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
        strengths: strengths,
        opportunities: opportunities,
        climate_zone: climateZone,
        benchmark_date: new Date().toISOString(),
        next_benchmark_due: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
        // Data summary from all steps
        data_summary: {
          baseline: {
            systems_documented: systemsDocumented,
            systems_good_condition: systemsInGoodCondition,
            systems_need_attention: systemsNeedingAttention,
            avg_system_age: avgSystemAge
          },
          inspect: {
            total_inspections: totalInspections,
            recent_inspections: recentInspectionCount,
            days_since_last: daysSinceLastInspection
          },
          track_execute: {
            tasks_completed: totalTasksCompleted,
            total_spend: totalMaintenanceSpend,
            emergency_ratio: emergencyRatio,
            diy_ratio: diyRatio
          },
          preserve: {
            total_recommendations: totalPreserveRecs,
            completed: completedPreserveCount,
            pending: pendingPreserveCount,
            estimated_savings: estimatedSavings
          },
          upgrade: {
            total_projects: totalUpgrades,
            completed: completedUpgradeCount,
            investment: upgradeInvestment,
            value_added: upgradeValueAdded,
            roi: upgradeROI
          }
        }
      };

      setLocalBenchmark(result);
      setGenerating(false);
    }, 800);
  };

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

  // Export CSV
  const exportCSV = () => {
    if (!latestBenchmark) {
      alert('No benchmark data to export');
      return;
    }

    const rows = [
      ['Portfolio Performance Benchmark Report'],
      [`Generated: ${format(new Date(), 'yyyy-MM-dd')}`],
      [''],
      ['OVERALL SCORES'],
      ['Overall Health Score', latestBenchmark.overall_health_score],
      ['System Health Score', latestBenchmark.system_health_score],
      ['Financial Health Score', latestBenchmark.financial_health_score],
      ['Maintenance Score', latestBenchmark.maintenance_score],
      ['Growth Score', latestBenchmark.growth_trajectory_score],
      [''],
      ['MARKET COMPARISON'],
      ['Metric', 'Your Value', 'Market Average'],
      ['Appreciation Rate', `${latestBenchmark.user_avg_appreciation_rate?.toFixed(1)}%`, `${latestBenchmark.market_avg_appreciation_rate?.toFixed(1)}%`],
      ['Cap Rate', `${latestBenchmark.user_avg_cap_rate?.toFixed(1)}%`, `${latestBenchmark.market_avg_cap_rate?.toFixed(1)}%`],
      ['Maintenance Spend', `${latestBenchmark.user_avg_maintenance_spend_pct?.toFixed(1)}%`, `${latestBenchmark.market_avg_maintenance_spend_pct?.toFixed(1)}%`],
      ['Emergency Repairs', `${(latestBenchmark.user_emergency_repair_ratio * 100)?.toFixed(0)}%`, `${(latestBenchmark.market_emergency_repair_ratio * 100)?.toFixed(0)}%`],
      ['Equity Position', `${latestBenchmark.user_avg_equity_position?.toFixed(1)}%`, `${latestBenchmark.market_avg_equity_position?.toFixed(1)}%`],
      [''],
      ['STRENGTHS'],
      ...(latestBenchmark.strengths?.map(s => [s.title, s.description]) || []),
      [''],
      ['OPPORTUNITIES'],
      ...(latestBenchmark.opportunities?.map(o => [o.title, o.description]) || [])
    ];

    if (latestBenchmark.data_summary) {
      rows.push(['']);
      rows.push(['DATA SOURCES']);
      rows.push(['Systems Documented', latestBenchmark.data_summary.baseline?.systems_documented]);
      rows.push(['Inspections Completed', latestBenchmark.data_summary.inspect?.total_inspections]);
      rows.push(['Tasks Completed', latestBenchmark.data_summary.track_execute?.tasks_completed]);
      rows.push(['Total Maintenance Spend', `$${latestBenchmark.data_summary.track_execute?.total_spend?.toLocaleString()}`]);
      rows.push(['Preservation Tasks Done', `${latestBenchmark.data_summary.preserve?.completed}/${latestBenchmark.data_summary.preserve?.total_recommendations}`]);
      rows.push(['Upgrades Completed', latestBenchmark.data_summary.upgrade?.completed]);
    }

    const csvContent = rows.map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-benchmark-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export PDF (printable HTML)
  const exportPDF = () => {
    if (!latestBenchmark) {
      alert('No benchmark data to export');
      return;
    }

    const printWindow = window.open('', '_blank');
    const propertyList = properties.map(p => p.address || 'Property').join(', ');

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Portfolio Performance Benchmark - ${propertyList}</title>
  <style>
    @media print {
      @page { margin: 0.5in; size: letter; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      max-width: 8.5in;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid #7c3aed;
    }
    .header h1 { color: #1B365D; font-size: 28px; margin: 0 0 10px 0; }
    .header .subtitle { font-size: 18px; color: #6b7280; margin: 5px 0; }
    .header .date { font-size: 14px; color: #9ca3af; }
    .score-circle {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
      border: 6px solid #10b981;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin: 20px auto;
    }
    .score-circle .number { font-size: 48px; font-weight: bold; color: #15803d; }
    .score-circle .label { font-size: 12px; color: #059669; }
    .score-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 15px;
      margin: 30px 0;
    }
    .score-card {
      text-align: center;
      padding: 15px;
      background: #f9fafb;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
    }
    .score-card .number { font-size: 28px; font-weight: bold; color: #1f2937; }
    .score-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
    .section { margin: 30px 0; }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1B365D;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .comparison-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f3f4f6;
    }
    .comparison-row .metric { font-weight: 500; }
    .comparison-row .values { display: flex; gap: 30px; }
    .comparison-row .you { font-weight: bold; color: #1f2937; }
    .comparison-row .market { color: #6b7280; }
    .badge-good { background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .strengths-list, .opportunities-list { margin: 0; padding: 0; list-style: none; }
    .strengths-list li, .opportunities-list li {
      padding: 12px;
      margin-bottom: 10px;
      border-radius: 6px;
    }
    .strengths-list li { background: #dcfce7; border-left: 4px solid #10b981; }
    .opportunities-list li { background: #fef3c7; border-left: 4px solid #f59e0b; }
    .data-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin: 20px 0;
    }
    .data-card {
      padding: 15px;
      border-radius: 8px;
      text-align: center;
    }
    .data-card.baseline { background: #eff6ff; border: 1px solid #bfdbfe; }
    .data-card.inspect { background: #dcfce7; border: 1px solid #86efac; }
    .data-card.track { background: #fff7ed; border: 1px solid #fed7aa; }
    .data-card.preserve { background: #faf5ff; border: 1px solid #e9d5ff; }
    .data-card.upgrade { background: #eef2ff; border: 1px solid #c7d2fe; }
    .data-card.spend { background: #f3f4f6; border: 1px solid #e5e7eb; }
    .data-card .number { font-size: 24px; font-weight: bold; margin: 5px 0; }
    .data-card .label { font-size: 11px; color: #6b7280; text-transform: uppercase; }
    .disclaimer {
      margin-top: 30px;
      padding: 15px;
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 8px;
      font-size: 11px;
      color: #92400e;
    }
    .print-button {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: #7c3aed;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <button class="print-button no-print" onclick="window.print()">Print / Save as PDF</button>

  <div class="header">
    <h1>Portfolio Performance Benchmark</h1>
    <div class="subtitle">${propertyList}</div>
    <div class="date">Generated on ${format(new Date(), 'MMMM d, yyyy')}</div>
  </div>

  <div class="score-circle">
    <div class="number">${latestBenchmark.overall_health_score}</div>
    <div class="label">HEALTH SCORE</div>
  </div>

  <div class="score-grid">
    <div class="score-card">
      <div class="label">System Health</div>
      <div class="number">${latestBenchmark.system_health_score}</div>
    </div>
    <div class="score-card">
      <div class="label">Financial Health</div>
      <div class="number">${latestBenchmark.financial_health_score}</div>
    </div>
    <div class="score-card">
      <div class="label">Maintenance</div>
      <div class="number">${latestBenchmark.maintenance_score}</div>
    </div>
    <div class="score-card">
      <div class="label">Growth</div>
      <div class="number">${latestBenchmark.growth_trajectory_score}</div>
    </div>
  </div>

  <div class="section">
    <h3 class="section-title">Market Comparison - ${latestBenchmark.climate_zone || 'Your Region'}</h3>
    <div class="comparison-row">
      <span class="metric">Appreciation Rate</span>
      <div class="values">
        <span class="you">${latestBenchmark.user_avg_appreciation_rate?.toFixed(1)}% (You)</span>
        <span class="market">${latestBenchmark.market_avg_appreciation_rate?.toFixed(1)}% (Market)</span>
      </div>
    </div>
    ${latestBenchmark.user_avg_cap_rate > 0 ? `
    <div class="comparison-row">
      <span class="metric">Cap Rate (Rentals)</span>
      <div class="values">
        <span class="you">${latestBenchmark.user_avg_cap_rate?.toFixed(1)}% (You)</span>
        <span class="market">${latestBenchmark.market_avg_cap_rate?.toFixed(1)}% (Market)</span>
      </div>
    </div>
    ` : ''}
    <div class="comparison-row">
      <span class="metric">Maintenance Spend</span>
      <div class="values">
        <span class="you">${latestBenchmark.user_avg_maintenance_spend_pct?.toFixed(1)}% (You)</span>
        <span class="market">${latestBenchmark.market_avg_maintenance_spend_pct?.toFixed(1)}% (Market)</span>
      </div>
    </div>
    <div class="comparison-row">
      <span class="metric">Emergency Repairs</span>
      <div class="values">
        <span class="you">${(latestBenchmark.user_emergency_repair_ratio * 100)?.toFixed(0)}% (You)</span>
        <span class="market">${(latestBenchmark.market_emergency_repair_ratio * 100)?.toFixed(0)}% (Market)</span>
      </div>
    </div>
    <div class="comparison-row">
      <span class="metric">Equity Position</span>
      <div class="values">
        <span class="you">${latestBenchmark.user_avg_equity_position?.toFixed(1)}% (You)</span>
        <span class="market">${latestBenchmark.market_avg_equity_position?.toFixed(1)}% (Market)</span>
      </div>
    </div>
  </div>

  ${latestBenchmark.data_summary ? `
  <div class="section page-break">
    <h3 class="section-title">Data Contributing to Your Score</h3>
    <div class="data-grid">
      <div class="data-card baseline">
        <div class="label">Baseline</div>
        <div class="number">${latestBenchmark.data_summary.baseline?.systems_documented || 0}</div>
        <div class="label">Systems Documented</div>
      </div>
      <div class="data-card inspect">
        <div class="label">Inspect</div>
        <div class="number">${latestBenchmark.data_summary.inspect?.total_inspections || 0}</div>
        <div class="label">Inspections</div>
      </div>
      <div class="data-card track">
        <div class="label">Track</div>
        <div class="number">${latestBenchmark.data_summary.track_execute?.tasks_completed || 0}</div>
        <div class="label">Tasks Completed</div>
      </div>
      <div class="data-card preserve">
        <div class="label">Preserve</div>
        <div class="number">${latestBenchmark.data_summary.preserve?.completed || 0}/${latestBenchmark.data_summary.preserve?.total_recommendations || 0}</div>
        <div class="label">Preventive Tasks</div>
      </div>
      <div class="data-card upgrade">
        <div class="label">Upgrade</div>
        <div class="number">${latestBenchmark.data_summary.upgrade?.completed || 0}</div>
        <div class="label">Upgrades Done</div>
      </div>
      <div class="data-card spend">
        <div class="label">Total Spend</div>
        <div class="number">$${(latestBenchmark.data_summary.track_execute?.total_spend || 0).toLocaleString()}</div>
        <div class="label">Maintenance</div>
      </div>
    </div>
  </div>
  ` : ''}

  ${latestBenchmark.strengths?.length > 0 ? `
  <div class="section">
    <h3 class="section-title">Your Strengths</h3>
    <ul class="strengths-list">
      ${latestBenchmark.strengths.map(s => `
        <li><strong>${s.title}</strong><br/><span style="font-size: 13px;">${s.description}</span></li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  ${latestBenchmark.opportunities?.length > 0 ? `
  <div class="section">
    <h3 class="section-title">Opportunities to Improve</h3>
    <ul class="opportunities-list">
      ${latestBenchmark.opportunities.map(o => `
        <li><strong>${o.title}</strong><br/><span style="font-size: 13px;">${o.description}</span>${o.action ? `<br/><em style="font-size: 12px; color: #92400e;">Action: ${o.action}</em>` : ''}</li>
      `).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="disclaimer">
    <strong>Disclaimer:</strong> This benchmark report is for informational purposes only. Scores are calculated based on
    available data from your 360° Method usage and may not reflect complete property conditions. Market comparisons are
    based on regional averages and may vary by specific location and property type. This is not financial advice.
  </div>

  <div class="footer">
    <p>Generated by 360° Method Property Management Platform</p>
    <p>Report Date: ${format(new Date(), 'MMMM d, yyyy • h:mm a')}</p>
  </div>
</body>
</html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 250);
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
              onClick={handleGenerateBenchmark}
              disabled={generating}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {generating ? (
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              {generating ? 'Generating...' : 'Generate Benchmark'}
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

      {/* Data Sources Summary */}
      {latestBenchmark.data_summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-6 h-6 text-blue-600" />
              Data Contributing to Your Score
            </CardTitle>
            <p className="text-sm text-gray-600">
              From all 360° Method steps
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {/* BASELINE */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-4 h-4 text-blue-600" />
                  <p className="text-xs font-semibold text-blue-800">BASELINE</p>
                </div>
                <p className="text-lg font-bold text-blue-900">
                  {latestBenchmark.data_summary.baseline.systems_documented}
                </p>
                <p className="text-xs text-blue-700">systems documented</p>
              </div>

              {/* INSPECT */}
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <p className="text-xs font-semibold text-green-800">INSPECT</p>
                </div>
                <p className="text-lg font-bold text-green-900">
                  {latestBenchmark.data_summary.inspect.total_inspections}
                </p>
                <p className="text-xs text-green-700">inspections completed</p>
              </div>

              {/* TRACK/EXECUTE */}
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <Wrench className="w-4 h-4 text-orange-600" />
                  <p className="text-xs font-semibold text-orange-800">TRACK</p>
                </div>
                <p className="text-lg font-bold text-orange-900">
                  {latestBenchmark.data_summary.track_execute.tasks_completed}
                </p>
                <p className="text-xs text-orange-700">tasks completed</p>
              </div>

              {/* PRESERVE */}
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-purple-600" />
                  <p className="text-xs font-semibold text-purple-800">PRESERVE</p>
                </div>
                <p className="text-lg font-bold text-purple-900">
                  {latestBenchmark.data_summary.preserve.completed}/{latestBenchmark.data_summary.preserve.total_recommendations}
                </p>
                <p className="text-xs text-purple-700">preventive tasks done</p>
              </div>

              {/* UPGRADE */}
              <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs font-semibold text-indigo-800">UPGRADE</p>
                </div>
                <p className="text-lg font-bold text-indigo-900">
                  {latestBenchmark.data_summary.upgrade.completed}
                </p>
                <p className="text-xs text-indigo-700">upgrades completed</p>
              </div>

              {/* MAINTENANCE SPEND */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <p className="text-xs font-semibold text-gray-800">SPEND</p>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  ${(latestBenchmark.data_summary.track_execute.total_spend || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-700">total maintenance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          onClick={handleGenerateBenchmark}
          disabled={generating}
          style={{ minHeight: '44px' }}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
          {generating ? 'Refreshing...' : 'Refresh Benchmark'}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" style={{ minHeight: '44px' }}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
              <FileSpreadsheet className="w-4 h-4" />
              Export as CSV
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={exportPDF} className="gap-2 cursor-pointer">
              <File className="w-4 h-4" />
              Export as PDF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DisclaimerBox />
    </div>
  );
}