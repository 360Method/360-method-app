import React, { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Property, SystemBaseline, MaintenanceTask, Inspection, PortfolioEquity, WealthProjection } from '@/api/supabaseClient';
import {
  Home, Shield, TrendingUp, AlertTriangle, CheckCircle,
  Clock, DollarSign, Calendar, Zap, ArrowRight, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../components/shared/DemoContext';
import { getDemoUrl } from '@/components/shared/navigationConfig';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import DemoCTA from '../components/demo/DemoCTA';
import { useAhaMoments } from '../components/onboarding/AhaMomentManager';
import { AhaDocumentFirstSystemCard } from '../components/onboarding/AhaDocumentFirstSystem';
import { GuidedNextStep } from '../components/dashboard/GuidedNextStep';
import { calculateHealthScore, getCertification, getScoreColor, getScoreLabel } from '@/lib/calculateHealthScore';

export default function DashboardHomeowner() {
  const navigate = useNavigate();
  const { demoMode, demoData, markStepVisited } = useDemo();
  const { user } = useAuth();

  // Aha Moments system - only active when not in demo mode
  let ahaMoments = null;
  try {
    ahaMoments = useAhaMoments();
  } catch (e) {
    // AhaMomentProvider not available (e.g., in demo mode or tests)
  }

  useEffect(() => {
    window.scrollTo(0, 0);
    if (demoMode) markStepVisited(0);
  }, [demoMode, markStepVisited]);

  // Trigger Aha #2 prompt after dashboard loads (only for real users with properties)
  useEffect(() => {
    if (demoMode || !ahaMoments) return;

    // Delay to let the page render first
    const timer = setTimeout(() => {
      ahaMoments.triggerPrompt(ahaMoments.AHA_MOMENTS.CAN_TRACK);
    }, 1500);

    return () => clearTimeout(timer);
  }, [demoMode, ahaMoments]);

  // Fetch real data using Supabase
  const { data: realProperties = [] } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      // Filter by user_id for security (Clerk auth with permissive RLS)
      const allProps = await Property.list('-created_at', user?.id);
      return allProps.filter(p => !p.is_draft);
    },
    enabled: !demoMode && !!user?.id
  });

  const property = demoMode ? demoData?.property : realProperties[0];

  const { data: realSystems = [] } = useQuery({
    queryKey: ['systemBaselines', property?.id],
    queryFn: () => SystemBaseline.filter({ property_id: property?.id }),
    enabled: !demoMode && !!property?.id
  });

  const systems = demoMode ? (demoData?.systems || []) : realSystems;

  const { data: realTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', property?.id],
    queryFn: () => MaintenanceTask.filter({ property_id: property?.id }),
    enabled: !demoMode && !!property?.id
  });

  const allTasks = demoMode ? (demoData?.tasks || []) : realTasks;

  const { data: realCompletedTasks = [] } = useQuery({
    queryKey: ['completedTasks', property?.id],
    queryFn: () => MaintenanceTask.filter({
      property_id: property?.id,
      status: 'Completed'
    }),
    enabled: !demoMode && !!property?.id
  });

  const completedTasks = demoMode ? (demoData?.maintenanceHistory || []) : realCompletedTasks;

  // Fetch inspections for health score calculation
  const { data: realInspections = [] } = useQuery({
    queryKey: ['inspections', property?.id],
    queryFn: () => Inspection.filter({ property_id: property?.id }),
    enabled: !demoMode && !!property?.id
  });

  const inspections = demoMode ? (demoData?.inspections || []) : realInspections;

  // Fetch equity data for wealth projection
  const { data: realEquityData = [] } = useQuery({
    queryKey: ['portfolio-equity', property?.id],
    queryFn: () => property?.id ? PortfolioEquity.filter({ property_id: property.id }) : PortfolioEquity.list(),
    enabled: !demoMode && !!property?.id
  });

  const equityData = demoMode ? (demoData?.equityData || []) : realEquityData;

  // Fetch wealth projections
  const { data: realProjections = [] } = useQuery({
    queryKey: ['wealth-projections'],
    queryFn: () => WealthProjection.list(),
    enabled: !demoMode
  });

  const projections = demoMode ? (demoData?.projections || []) : realProjections;

  // Calculate wealth metrics
  const wealthMetrics = useMemo(() => {
    const currentYear = new Date().getFullYear();

    // Get current equity from equity data or estimate from property
    let currentEquity = 0;
    let currentValue = 0;
    let totalDebt = 0;

    if (equityData.length > 0) {
      currentValue = equityData.reduce((sum, e) => sum + (e.current_market_value || 0), 0);
      totalDebt = equityData.reduce((sum, e) => sum + (e.total_debt || 0), 0);
      currentEquity = currentValue - totalDebt;
    } else if (property) {
      // Estimate from property data if no equity records
      currentValue = property.estimated_value || property.purchase_price || 0;
      totalDebt = property.mortgage_balance || 0;
      currentEquity = currentValue - totalDebt;
    }

    // Get projection data if available
    const aiProjection = projections.find(p => p.scenario_name === 'AI_OPTIMAL' || p.is_ai_recommended);
    const projection = aiProjection || projections[0];

    let projectedGain = 0;
    let endingEquity = 0;

    if (projection?.yearly_projections && projection.yearly_projections.length > 0) {
      const lastYear = projection.yearly_projections[projection.yearly_projections.length - 1];
      endingEquity = lastYear.total_equity || 0;
      projectedGain = projection.total_equity_gain || (endingEquity - (projection.starting_equity || currentEquity));
    } else if (currentValue > 0) {
      // Generate simple projection if no saved data
      const appreciationRate = 0.04; // 4% annual appreciation
      const years = 10;
      const futureValue = currentValue * Math.pow(1 + appreciationRate, years);
      const futureDebt = Math.max(0, totalDebt * Math.pow(0.92, years)); // Simplified debt paydown
      endingEquity = futureValue - futureDebt;
      projectedGain = endingEquity - currentEquity;
    }

    return {
      currentEquity,
      currentValue,
      totalDebt,
      projectedGain,
      endingEquity,
      targetYear: currentYear + 10,
      hasProjection: projection != null || currentValue > 0
    };
  }, [equityData, projections, property]);

  // Calculate 360° Health Score dynamically
  const healthScoreData = useMemo(() => {
    if (demoMode) {
      // Use demo property score
      return {
        score: property?.health_score || 84,
        breakdown: null,
        recommendations: []
      };
    }

    return calculateHealthScore({
      property,
      systems,
      tasks: allTasks,
      inspections
    });
  }, [demoMode, property, systems, allTasks, inspections]);

  const healthScore = healthScoreData.score;
  const scoreBreakdown = healthScoreData.breakdown;
  const scoreRecommendations = healthScoreData.recommendations;
  const preventedCosts = demoMode ? 12400 : completedTasks.reduce((sum, t) => sum + (t.prevented_cost || 0), 0);
  const ytdMaintenanceSpent = demoMode ? 1850 : completedTasks.reduce((sum, t) => sum + (t.actual_cost || 0), 0);
  const tasksCompleted = completedTasks.length;
  
  const urgentTasks = allTasks
    .filter(t => (t.priority === 'High' || (t.cascade_risk_score || 0) >= 7) && t.status !== 'Completed')
    .slice(0, 3);

  const scheduledTasks = allTasks.filter(t => t.status === 'Scheduled');
  const tasksRemaining = urgentTasks.length + scheduledTasks.length;

  const upcomingInspection = {
    date: 'Dec 15, 2024',
    season: 'Winter',
    time: '10:00 AM - 12:00 PM',
    inspector: '360° Method Operator'
  };

  const criticalSystems = systems.filter(s => s.condition === 'Good' || s.condition === 'Excellent');
  const attentionNeeded = systems.filter(s => s.condition === 'Fair' || s.condition === 'Poor');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        {demoMode ? (
          <>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Dashboard
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-2">
              Your Command Center
            </p>
            <p className="text-sm text-gray-500">
              Here's what's happening with your home
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back! 👋
            </h1>
            <p className="text-base font-semibold mb-2 tracking-wide" style={{ color: '#6B5A3D' }}>
              Own with Confidence. Build with Purpose. Grow with Strategy.
            </p>
            <p className="text-gray-600">
              Here's what's happening with your home
            </p>
          </>
        )}
      </div>

      {/* Guided Next Step - Shows recommended action based on progress */}
      {!demoMode && (realProperties.length === 0 || systems.length === 0) && (
        <GuidedNextStep
          propertiesCount={realProperties.length}
          systemsCount={systems.length}
          tasksCount={allTasks.length}
          inspectionsCount={inspections.length}
          className="mb-8"
        />
      )}

      {/* SECTION 1: HERO METRICS (The Big 3) */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Health Score - Links to 360° Score */}
        <div
          data-tour="health-score"
          className={`bg-gradient-to-br ${realProperties.length === 0 ? 'from-gray-50 to-gray-100 border-gray-300' : 'from-green-50 to-emerald-100 border-green-300'} border-2 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all`}
          onClick={() => realProperties.length === 0 ? navigate(createPageUrl('Properties')) : navigate(demoMode ? getDemoUrl('Score360', demoMode) : createPageUrl('Score360') + (property?.id ? `?property_id=${property.id}` : ''))}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${realProperties.length === 0 ? 'bg-gray-200' : 'bg-green-200'} rounded-full flex items-center justify-center`}>
              <Shield className={`w-6 h-6 ${realProperties.length === 0 ? 'text-gray-500' : 'text-green-700'}`} />
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${realProperties.length === 0 ? 'text-gray-600 bg-gray-200' : healthScore >= 90 ? 'text-green-700 bg-green-200' : healthScore >= 75 ? 'text-green-700 bg-green-200' : healthScore >= 65 ? 'text-yellow-700 bg-yellow-200' : 'text-red-700 bg-red-200'}`}>
              {realProperties.length === 0 ? 'NO PROPERTY' : healthScore >= 90 ? 'EXCELLENT' : healthScore >= 75 ? 'GOOD' : healthScore >= 65 ? 'FAIR' : 'NEEDS ATTENTION'}
            </span>
          </div>

          <div className="mb-2">
            <div className={`text-sm ${realProperties.length === 0 ? 'text-gray-600' : 'text-green-800'} mb-1`}>360° Health Score</div>
            <div className={`text-5xl font-bold ${realProperties.length === 0 ? 'text-gray-400' : 'text-green-900'}`}>
              {realProperties.length === 0 ? '--' : healthScore}
            </div>
            <div className={`text-xs ${realProperties.length === 0 ? 'text-gray-500' : 'text-green-700'} mt-1`}>
              {realProperties.length === 0 ? 'Add a property to start' : 'out of 100'}
            </div>
          </div>

          <div className={`mt-4 pt-4 border-t ${realProperties.length === 0 ? 'border-gray-200' : 'border-green-300'}`}>
            <div className="flex items-center justify-between text-sm">
              <span className={realProperties.length === 0 ? 'text-gray-600' : 'text-green-800'}>
                {realProperties.length === 0 ? 'Add property →' : 'View full report →'}
              </span>
              <ArrowRight className={`w-4 h-4 ${realProperties.length === 0 ? 'text-gray-500' : 'text-green-700'}`} />
            </div>
          </div>

          {/* Mini health breakdown */}
          {realProperties.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-800">Critical Systems:</span>
                <span className="font-semibold text-green-900">{criticalSystems.length}/{systems.length} Healthy</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-green-800">Attention Needed:</span>
                <span className="font-semibold text-yellow-700">{attentionNeeded.length} items</span>
              </div>
            </div>
          )}
        </div>

        {/* Prevented Costs */}
        <div
          data-tour="prevented-costs"
          className={`bg-gradient-to-br ${realProperties.length === 0 ? 'from-gray-50 to-gray-100 border-gray-300' : 'from-blue-50 to-sky-100 border-blue-300'} border-2 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all`}
          onClick={() => realProperties.length === 0 ? navigate(createPageUrl('Properties')) : navigate(createPageUrl('Track'))}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${realProperties.length === 0 ? 'bg-gray-200' : 'bg-blue-200'} rounded-full flex items-center justify-center`}>
              <DollarSign className={`w-6 h-6 ${realProperties.length === 0 ? 'text-gray-500' : 'text-blue-700'}`} />
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${realProperties.length === 0 ? 'text-gray-600 bg-gray-200' : 'text-blue-700 bg-blue-200'}`}>
              {realProperties.length === 0 ? 'NO DATA' : 'YTD 2025'}
            </span>
          </div>

          <div className="mb-2">
            <div className={`text-sm ${realProperties.length === 0 ? 'text-gray-600' : 'text-blue-800'} mb-1`}>Disasters Prevented</div>
            <div className={`text-5xl font-bold ${realProperties.length === 0 ? 'text-gray-400' : 'text-blue-900'}`}>
              {realProperties.length === 0 ? '$0' : `$${(preventedCosts / 1000).toFixed(1)}K`}
            </div>
            <div className={`text-xs ${realProperties.length === 0 ? 'text-gray-500' : 'text-blue-700'} mt-1`}>
              {realProperties.length === 0 ? 'Track maintenance to see savings' : 'cascade failures stopped'}
            </div>
          </div>

          <div className={`mt-4 pt-4 border-t ${realProperties.length === 0 ? 'border-gray-200' : 'border-blue-300'}`}>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className={realProperties.length === 0 ? 'text-gray-600' : 'text-blue-800'}>Maintenance spent:</span>
              <span className={`font-semibold ${realProperties.length === 0 ? 'text-gray-500' : 'text-blue-900'}`}>
                {realProperties.length === 0 ? '$0' : `$${ytdMaintenanceSpent.toLocaleString()}`}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={realProperties.length === 0 ? 'text-gray-600' : 'text-blue-800'}>Net savings:</span>
              <span className={`font-bold ${realProperties.length === 0 ? 'text-gray-500' : 'text-green-600'}`}>
                {realProperties.length === 0 ? '$0' : `$${(preventedCosts - ytdMaintenanceSpent).toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        {/* Wealth Building */}
        <div
          className={`bg-gradient-to-br ${realProperties.length === 0 ? 'from-gray-50 to-gray-100 border-gray-300' : 'from-purple-50 to-violet-100 border-purple-300'} border-2 rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all`}
          onClick={() => realProperties.length === 0 ? navigate(createPageUrl('Properties')) : navigate(createPageUrl('Scale'))}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 ${realProperties.length === 0 ? 'bg-gray-200' : 'bg-purple-200'} rounded-full flex items-center justify-center`}>
              <TrendingUp className={`w-6 h-6 ${realProperties.length === 0 ? 'text-gray-500' : 'text-purple-700'}`} />
            </div>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full ${realProperties.length === 0 ? 'text-gray-600 bg-gray-200' : 'text-purple-700 bg-purple-200'}`}>
              {realProperties.length === 0 ? 'NO DATA' : '10-YR'}
            </span>
          </div>

          <div className="mb-2">
            <div className={`text-sm ${realProperties.length === 0 ? 'text-gray-600' : 'text-purple-800'} mb-1`}>Projected Wealth Gain</div>
            <div className={`text-5xl font-bold ${realProperties.length === 0 ? 'text-gray-400' : 'text-purple-900'}`}>
              {realProperties.length === 0 ? (
                '$0'
              ) : wealthMetrics.hasProjection ? (
                wealthMetrics.projectedGain >= 1000000
                  ? `$${(wealthMetrics.projectedGain / 1000000).toFixed(1)}M`
                  : `$${Math.round(wealthMetrics.projectedGain / 1000)}K`
              ) : (
                <span className="text-2xl text-purple-600">Set up equity</span>
              )}
            </div>
            <div className={`text-xs ${realProperties.length === 0 ? 'text-gray-500' : 'text-purple-700'} mt-1`}>
              {realProperties.length === 0
                ? 'Add a property to track wealth'
                : wealthMetrics.hasProjection
                  ? `equity growth by ${wealthMetrics.targetYear}`
                  : 'Add property value to see projections'}
            </div>
          </div>

          <div className={`mt-4 pt-4 border-t ${realProperties.length === 0 ? 'border-gray-200' : 'border-purple-300'}`}>
            <div className="flex items-center justify-between text-sm mb-3">
              <span className={realProperties.length === 0 ? 'text-gray-600' : 'text-purple-800'}>Current equity:</span>
              <span className={`font-semibold ${realProperties.length === 0 ? 'text-gray-500' : 'text-purple-900'}`}>
                {realProperties.length === 0 ? '--' : wealthMetrics.currentEquity > 0
                  ? `$${Math.round(wealthMetrics.currentEquity / 1000)}K`
                  : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className={realProperties.length === 0 ? 'text-gray-600' : 'text-purple-800'}>Property value:</span>
              <span className={`font-semibold ${realProperties.length === 0 ? 'text-gray-500' : 'text-purple-900'}`}>
                {realProperties.length === 0 ? '--' : wealthMetrics.currentValue > 0
                  ? `$${Math.round(wealthMetrics.currentValue / 1000)}K`
                  : '--'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: ACTION ZONE */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Urgent Tasks */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Urgent Tasks</h2>
                <p className="text-sm text-gray-600">Requires immediate attention</p>
              </div>
            </div>
            <button 
              onClick={() => navigate(createPageUrl('Prioritize'))}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All →
            </button>
          </div>

          {urgentTasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">No urgent tasks!</p>
              <p className="text-sm text-gray-500">You're all caught up</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentTasks.map(task => (
                <div 
                  key={task.id}
                  className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(createPageUrl('Execute'))}
                >
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{task.system_type}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.estimated_hours || task.diy_time_hours || 2}h
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        ${task.current_fix_cost || 150}
                      </span>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-red-200 text-red-800 text-xs font-bold rounded-full">
                    URGENT
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Inspection */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Next Inspection</h2>
                <p className="text-sm text-gray-600">Seasonal diagnostic visit</p>
              </div>
            </div>
            <button 
              onClick={() => navigate(createPageUrl('Inspect'))}
              className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
            >
              History →
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                <Calendar className="w-8 h-8 text-blue-700" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {upcomingInspection.date}
                </div>
                <div className="text-sm text-gray-600">
                  {upcomingInspection.season} Inspection
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Scheduled time:</span>
                <span className="font-semibold text-gray-900">
                  {upcomingInspection.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Inspector:</span>
                <span className="font-semibold text-gray-900">
                  {upcomingInspection.inspector}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Duration:</span>
                <span className="font-semibold text-gray-900">~2 hours</span>
              </div>
            </div>

            <button 
              onClick={() => navigate(createPageUrl('Schedule'))}
              className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
              style={{ minHeight: '48px' }}
            >
              View Inspection Checklist
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 3: PROGRESS & VALUE */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Task Progress */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Task Progress</h2>
              <p className="text-sm text-gray-600">This year's activity</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-end justify-between mb-2">
              <div>
                <div className="text-4xl font-bold text-gray-900">{tasksCompleted}</div>
                <div className="text-sm text-gray-600">tasks completed</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-600">{tasksRemaining}</div>
                <div className="text-xs text-gray-500">remaining</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all"
                style={{ 
                  width: `${(tasksCompleted / (tasksCompleted + tasksRemaining || 1)) * 100}%` 
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {((tasksCompleted / (tasksCompleted + tasksRemaining || 1)) * 100).toFixed(0)}% complete
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">Avg completion time</div>
              <div className="text-xl font-bold text-gray-900">2.3 days</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">On-time rate</div>
              <div className="text-xl font-bold text-green-600">94%</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
              <p className="text-sm text-gray-600">Common tasks</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => navigate(demoMode ? getDemoUrl('Score360', demoMode) : createPageUrl('Score360') + (property?.id ? `?property_id=${property.id}` : ''))}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl hover:shadow-md transition-all text-left"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-semibold text-gray-900">View 360° Score</div>
                  <div className="text-xs text-gray-600">Full property health report</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-600" />
            </button>

            <button
              onClick={() => navigate(createPageUrl('Baseline'))}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-sky-50 border border-blue-200 rounded-xl hover:shadow-md transition-all text-left"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center gap-3">
                <Home className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">View All Systems</div>
                  <div className="text-xs text-gray-600">{systems.length} major systems documented</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-blue-600" />
            </button>

            <button
              onClick={() => navigate(createPageUrl('Schedule'))}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition-all text-left"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-semibold text-gray-900">Maintenance Calendar</div>
                  <div className="text-xs text-gray-600">View scheduled tasks</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-green-600" />
            </button>

            <button
              onClick={() => navigate(createPageUrl('Preserve'))}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl hover:shadow-md transition-all text-left"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-semibold text-gray-900">Preserve Interventions</div>
                  <div className="text-xs text-gray-600">Extend system lifespan</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-purple-600" />
            </button>

            <button
              onClick={() => navigate(createPageUrl('Upgrade'))}
              className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl hover:shadow-md transition-all text-left"
              style={{ minHeight: '48px' }}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <div>
                  <div className="font-semibold text-gray-900">Browse Upgrades</div>
                  <div className="text-xs text-gray-600">Increase property value</div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </div>
      </div>

      <DemoCTA />
    </div>
  );
}