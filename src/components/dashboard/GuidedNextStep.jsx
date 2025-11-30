import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ClipboardList,
  DollarSign,
  Home,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useAhaMoments, AHA_MOMENTS } from '@/components/onboarding/AhaMomentManager';
import { createPageUrl } from '@/utils';
import { getDemoUrl } from '@/components/shared/navigationConfig';
import { useDemo } from '@/components/shared/DemoContext';

/**
 * GuidedNextStep - Shows the user's next recommended action based on their progress
 *
 * This component adapts based on:
 * 1. Which aha moments they've completed
 * 2. Their current progress in the 360° Method
 * 3. What will provide the most value right now
 */

const GUIDED_STEPS = {
  DOCUMENT_SYSTEM: {
    id: 'document_system',
    title: 'Document Your First System',
    description: 'Start tracking your HVAC, water heater, or other critical systems',
    icon: Camera,
    iconBgColor: 'bg-orange-500',
    ctaLabel: 'Add a System',
    destination: 'Baseline',
    phase: 'AWARE',
    step: 1,
  },
  COMPLETE_BASELINE: {
    id: 'complete_baseline',
    title: 'Complete Your Baseline',
    description: 'Document more systems to get a complete picture of your home',
    icon: ClipboardList,
    iconBgColor: 'bg-blue-500',
    ctaLabel: 'Continue Baseline',
    destination: 'Baseline',
    phase: 'AWARE',
    step: 1,
  },
  RUN_INSPECTION: {
    id: 'run_inspection',
    title: 'Run Your First Inspection',
    description: 'Walk through your home and catch issues before they become problems',
    icon: Target,
    iconBgColor: 'bg-green-500',
    ctaLabel: 'Start Inspection',
    destination: 'Inspect',
    phase: 'AWARE',
    step: 2,
  },
  VIEW_PRIORITIES: {
    id: 'view_priorities',
    title: 'See What Needs Attention',
    description: 'AI has analyzed your home - see what to fix first and why',
    icon: Zap,
    iconBgColor: 'bg-amber-500',
    ctaLabel: 'View Priorities',
    destination: 'Prioritize',
    phase: 'ACT',
    step: 4,
  },
  COMPLETE_TASK: {
    id: 'complete_task',
    title: 'Complete a Maintenance Task',
    description: 'Take action on a recommended task and watch your score improve',
    icon: CheckCircle2,
    iconBgColor: 'bg-emerald-500',
    ctaLabel: 'View Tasks',
    destination: 'Execute',
    phase: 'ACT',
    step: 6,
  },
  VIEW_SCORE: {
    id: 'view_score',
    title: 'Check Your 360° Score',
    description: 'See how your home health stacks up and what affects it',
    icon: Shield,
    iconBgColor: 'bg-purple-500',
    ctaLabel: 'View Score',
    destination: 'Score360',
    phase: 'AWARE',
    step: 3,
  },
  PLAN_UPGRADES: {
    id: 'plan_upgrades',
    title: 'Plan Strategic Upgrades',
    description: 'See which improvements will add the most value to your home',
    icon: TrendingUp,
    iconBgColor: 'bg-indigo-500',
    ctaLabel: 'View Upgrades',
    destination: 'Upgrade',
    phase: 'ADVANCE',
    step: 8,
  },
};

export function GuidedNextStep({
  systemsCount = 0,
  tasksCount = 0,
  inspectionsCount = 0,
  className = '',
}) {
  const navigate = useNavigate();
  const { isMomentCompleted } = useAhaMoments();
  const { demoMode } = useDemo();

  // Determine the next step based on user's progress
  const getNextStep = () => {
    // No systems documented yet
    if (systemsCount === 0) {
      return GUIDED_STEPS.DOCUMENT_SYSTEM;
    }

    // Has some systems but not many
    if (systemsCount < 4) {
      return GUIDED_STEPS.COMPLETE_BASELINE;
    }

    // Has systems but no inspections
    if (inspectionsCount === 0) {
      return GUIDED_STEPS.RUN_INSPECTION;
    }

    // Has everything, show priorities
    return GUIDED_STEPS.VIEW_PRIORITIES;
  };

  const nextStep = getNextStep();

  const handleAction = () => {
    // Use demo-aware navigation when in demo mode
    const url = demoMode ? getDemoUrl(nextStep.destination, demoMode) : createPageUrl(nextStep.destination);
    navigate(url);
  };

  const Icon = nextStep.icon;

  return (
    <Card className={`border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-semibold text-orange-700">Recommended Next Step</span>
        </div>

        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl ${nextStep.iconBgColor} flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-lg mb-1">{nextStep.title}</h3>
            <p className="text-slate-600 text-sm mb-4">{nextStep.description}</p>

            <div className="flex items-center gap-3">
              <Button
                onClick={handleAction}
                className="gap-2 text-white"
                style={{ backgroundColor: '#f97316' }}
              >
                {nextStep.ctaLabel}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Badge variant="outline" className="text-xs">
                Phase {nextStep.phase === 'AWARE' ? 'I' : nextStep.phase === 'ACT' ? 'II' : 'III'}: {nextStep.phase}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MethodProgressCard({
  systemsCount = 0,
  tasksCompleted = 0,
  inspectionsCount = 0,
  score = null,
  className = '',
}) {
  const navigate = useNavigate();

  // Calculate phase progress
  const awareProgress = Math.min(100, (systemsCount / 10) * 50 + (inspectionsCount > 0 ? 50 : 0));
  const actProgress = Math.min(100, (tasksCompleted / 5) * 100);
  const advanceProgress = 0; // Future: upgrades planned, etc.

  const overallProgress = Math.round((awareProgress + actProgress + advanceProgress) / 3);

  return (
    <Card className={`border-2 border-slate-200 ${className}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-slate-600" />
            <h3 className="font-semibold text-slate-900">360° Method Progress</h3>
          </div>
          {score !== null && (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-orange-500">{score}</span>
              <span className="text-sm text-slate-500">/100</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Phase I: AWARE */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-blue-700">Phase I: AWARE</span>
              <span className="text-slate-500">{Math.round(awareProgress)}%</span>
            </div>
            <Progress value={awareProgress} className="h-2" />
            <p className="text-xs text-slate-500 mt-1">Baseline • Inspect • Assess</p>
          </div>

          {/* Phase II: ACT */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-green-700">Phase II: ACT</span>
              <span className="text-slate-500">{Math.round(actProgress)}%</span>
            </div>
            <Progress value={actProgress} className="h-2" />
            <p className="text-xs text-slate-500 mt-1">Prioritize • Execute • Track</p>
          </div>

          {/* Phase III: ADVANCE */}
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="font-medium text-purple-700">Phase III: ADVANCE</span>
              <span className="text-slate-500">{Math.round(advanceProgress)}%</span>
            </div>
            <Progress value={advanceProgress} className="h-2" />
            <p className="text-xs text-slate-500 mt-1">Preserve • Upgrade • Scale</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <Button
            onClick={() => navigate(createPageUrl('Dashboard'))}
            variant="outline"
            className="w-full gap-2"
          >
            View Full Progress
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default GuidedNextStep;
