import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const NEXT_STEPS = {
  no_property: {
    name: 'Add Your First Property',
    quickAction: 'Start by documenting your property address and basic details',
    cta: 'Add Property',
    path: 'Properties',
    color: 'blue'
  },
  baseline_incomplete: {
    name: 'Complete Baseline',
    quickAction: 'Document 4+ major systems to unlock the ACT phase',
    cta: 'Continue Baseline',
    path: 'Baseline',
    color: 'blue'
  },
  run_inspection: {
    name: 'Run First Inspection',
    quickAction: 'Seasonal walkthrough to catch problems early',
    cta: 'Start Inspection',
    path: 'Inspect',
    color: 'blue'
  },
  prioritize_tasks: {
    name: 'Prioritize Tasks',
    quickAction: 'Review AI risk analysis and decide what matters most',
    cta: 'View Task Queue',
    path: 'Prioritize',
    color: 'orange'
  },
  schedule_work: {
    name: 'Schedule Work',
    quickAction: 'Assign dates to prioritized tasks for strategic planning',
    cta: 'Open Schedule',
    path: 'Schedule',
    color: 'orange'
  },
  execute_today: {
    name: 'Execute Today',
    quickAction: 'Complete scheduled tasks with AI guides',
    cta: 'View Today\'s Tasks',
    path: 'Execute',
    color: 'orange'
  },
  explore_preserve: {
    name: 'Strategic Preservation',
    quickAction: 'Extend system lifespans with high-ROI interventions',
    cta: 'View Opportunities',
    path: 'Preserve',
    color: 'green'
  },
  plan_upgrades: {
    name: 'Plan Strategic Upgrades',
    quickAction: 'Browse high-ROI improvements that pay for themselves',
    cta: 'Explore Upgrades',
    path: 'Upgrade',
    color: 'green'
  },
  fully_optimized: {
    name: 'You\'re Fully Optimized!',
    quickAction: 'Keep up the great work with seasonal inspections and proactive maintenance',
    cta: 'View Dashboard',
    path: 'Dashboard',
    color: 'green'
  }
};

export function determineNextStep(selectedProperty, systems, tasks, inspections) {
  if (!selectedProperty) return NEXT_STEPS.no_property;
  
  const systemCount = systems?.length || 0;
  const baselineComplete = systemCount >= 4;
  const hasInspections = inspections?.length > 0;
  const hasIdentifiedTasks = tasks?.some(t => t.status === 'Identified');
  const hasScheduledTasks = tasks?.some(t => t.status === 'Scheduled');
  const hasTodayTasks = tasks?.some(t => {
    if (t.status !== 'Scheduled') return false;
    if (!t.scheduled_date) return false;
    const today = new Date().toISOString().split('T')[0];
    return t.scheduled_date === today;
  });

  // Priority order
  if (systemCount < 4) return NEXT_STEPS.baseline_incomplete;
  if (!hasInspections) return NEXT_STEPS.run_inspection;
  if (hasIdentifiedTasks) return NEXT_STEPS.prioritize_tasks;
  if (hasScheduledTasks && !hasTodayTasks) return NEXT_STEPS.schedule_work;
  if (hasTodayTasks) return NEXT_STEPS.execute_today;
  if (baselineComplete && hasInspections) return NEXT_STEPS.explore_preserve;
  
  return NEXT_STEPS.fully_optimized;
}

export default function NextStepIndicator({ 
  selectedProperty, 
  systems = [], 
  tasks = [], 
  inspections = [],
  className = '' 
}) {
  const nextStep = determineNextStep(selectedProperty, systems, tasks, inspections);
  
  const colorClasses = {
    blue: 'bg-blue-100 border-blue-200 text-blue-900',
    orange: 'bg-orange-100 border-orange-200 text-orange-900',
    green: 'bg-green-100 border-green-200 text-green-900'
  };

  return (
    <div className={`bg-white rounded-lg p-4 border-2 ${colorClasses[nextStep.color]} ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${nextStep.color === 'blue' ? 'bg-blue-600' : nextStep.color === 'orange' ? 'bg-orange-600' : 'bg-green-600'} flex items-center justify-center flex-shrink-0`}>
          {nextStep.name === 'You\'re Fully Optimized!' ? (
            <CheckCircle2 className="w-5 h-5 text-white" />
          ) : (
            <ArrowRight className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900 mb-1">
            Next Step: {nextStep.name}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            {nextStep.quickAction}
          </p>
          <Button
            asChild
            size="sm"
            className={nextStep.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : nextStep.color === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-green-600 hover:bg-green-700'}
          >
            <Link to={createPageUrl(nextStep.path)}>
              {nextStep.cta}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}