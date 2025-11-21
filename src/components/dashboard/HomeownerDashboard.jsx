import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Home,
  Eye,
  ClipboardCheck,
  Activity,
  Target,
  Calendar,
  CheckCircle2,
  Shield,
  TrendingUp,
  Building2,
  ChevronRight,
  Flame,
  Clock,
  AlertTriangle,
  Sparkles,
  DollarSign,
  Award
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO, startOfDay } from "date-fns";

const StepCard = ({ step, completed, current, onClick }) => {
  const phaseColors = {
    AWARE: { bg: 'from-blue-50 to-blue-100', border: 'border-blue-300', text: 'text-blue-900', badge: 'bg-blue-600' },
    ACT: { bg: 'from-orange-50 to-orange-100', border: 'border-orange-300', text: 'text-orange-900', badge: 'bg-orange-600' },
    ADVANCE: { bg: 'from-green-50 to-green-100', border: 'border-green-300', text: 'text-green-900', badge: 'bg-green-600' }
  };
  
  const colors = phaseColors[step.phase];
  
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
        current ? `${colors.border} bg-gradient-to-br ${colors.bg} shadow-lg` : 
        completed ? 'border-green-300 bg-green-50' :
        'border-gray-200 bg-white hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            completed ? 'bg-green-600' : current ? colors.badge : 'bg-gray-300'
          }`}>
            {completed ? (
              <CheckCircle2 className="w-5 h-5 text-white" />
            ) : (
              <step.icon className="w-4 h-4 text-white" />
            )}
          </div>
          <div>
            <p className={`font-bold text-sm ${colors.text}`}>{step.name}</p>
            <p className="text-xs text-gray-600">{step.phase}</p>
          </div>
        </div>
        {step.count !== undefined && (
          <Badge className={current ? colors.badge : completed ? 'bg-green-600' : 'bg-gray-500'}>
            {step.count}
          </Badge>
        )}
      </div>
      {current && (
        <p className="text-xs text-gray-700 mt-2 leading-relaxed">{step.description}</p>
      )}
    </button>
  );
};

const MiniCalendar = ({ tasks }) => {
  const today = new Date();
  const daysToShow = 7;
  const days = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date;
  });

  const getTasksForDate = (date) => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    return tasks.filter(t => {
      if (!t.scheduled_date) return false;
      try {
        const taskDateStr = format(startOfDay(parseISO(t.scheduled_date)), 'yyyy-MM-dd');
        return taskDateStr === dateStr;
      } catch {
        return false;
      }
    });
  };

  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((date, idx) => {
        const dateTasks = getTasksForDate(date);
        const isToday = idx === 0;
        
        return (
          <div
            key={idx}
            className={`p-2 rounded-lg text-center ${
              isToday ? 'bg-blue-600 text-white' : 'bg-gray-50'
            }`}
          >
            <p className={`text-xs font-semibold mb-1 ${isToday ? 'text-white' : 'text-gray-600'}`}>
              {format(date, 'EEE')}
            </p>
            <p className={`text-lg font-bold mb-1 ${isToday ? 'text-white' : 'text-gray-900'}`}>
              {format(date, 'd')}
            </p>
            {dateTasks.length > 0 && (
              <div className={`w-2 h-2 rounded-full mx-auto ${
                isToday ? 'bg-white' : 'bg-blue-600'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function HomeownerDashboard({ property, systems = [], tasks = [], inspections = [] }) {
  const [showMobileTip, setShowMobileTip] = React.useState(true);

  const scheduledTasks = tasks.filter(t => t.status === 'Scheduled' && t.scheduled_date);
  const identifiedTasks = tasks.filter(t => t.status === 'Identified' || t.status === 'Deferred');
  const completedTasks = tasks.filter(t => t.status === 'Completed');
  const highPriorityTasks = identifiedTasks.filter(t => t.priority === 'High' || (t.cascade_risk_score || 0) >= 7);
  
  const baselineComplete = (property?.baseline_completion || 0) >= 66;
  const hasInspections = inspections.length > 0;
  const hasTasks = completedTasks.length > 0;
  const hasScheduled = scheduledTasks.length > 0;
  const hasCompleted = completedTasks.length > 0;
  
  const steps = [
    { 
      id: 1, 
      name: 'Baseline', 
      phase: 'AWARE', 
      icon: Home, 
      count: systems.length,
      description: 'Document your property\'s major systems',
      link: createPageUrl('Baseline'),
      completed: baselineComplete
    },
    { 
      id: 2, 
      name: 'Inspect', 
      phase: 'AWARE', 
      icon: Eye, 
      count: inspections.length,
      description: 'Regular condition check-ins',
      link: createPageUrl('Inspect'),
      completed: hasInspections
    },
    { 
      id: 3, 
      name: 'Track', 
      phase: 'AWARE', 
      icon: Activity, 
      count: completedTasks.length,
      description: 'Your maintenance history',
      link: createPageUrl('Track'),
      completed: hasCompleted
    },
    { 
      id: 4, 
      name: 'Prioritize', 
      phase: 'ACT', 
      icon: Target, 
      count: identifiedTasks.length,
      description: 'AI-ranked maintenance queue',
      link: createPageUrl('Prioritize'),
      completed: hasTasks
    },
    { 
      id: 5, 
      name: 'Schedule', 
      phase: 'ACT', 
      icon: Calendar, 
      count: scheduledTasks.length,
      description: 'Plan your maintenance timeline',
      link: createPageUrl('Schedule'),
      completed: hasScheduled
    },
    { 
      id: 6, 
      name: 'Execute', 
      phase: 'ACT', 
      icon: CheckCircle2,
      count: scheduledTasks.length,
      description: 'Complete scheduled work',
      link: createPageUrl('Execute'),
      completed: hasCompleted
    },
    { 
      id: 7, 
      name: 'Preserve', 
      phase: 'ADVANCE', 
      icon: Shield,
      description: 'Extend system lifespan strategically',
      link: createPageUrl('Preserve'),
      completed: false
    },
    { 
      id: 8, 
      name: 'Upgrade', 
      phase: 'ADVANCE', 
      icon: TrendingUp,
      description: 'Value-adding improvements',
      link: createPageUrl('Upgrade'),
      completed: false
    },
    { 
      id: 9, 
      name: 'Scale', 
      phase: 'ADVANCE', 
      icon: Building2,
      description: 'Portfolio intelligence (2+ properties)',
      link: createPageUrl('Scale'),
      completed: false
    }
  ];
  
  const currentStep = steps.find(s => !s.completed) || steps[steps.length - 1];
  const completedStepCount = steps.filter(s => s.completed).length;
  const progressPercent = (completedStepCount / steps.length) * 100;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Mobile Navigation Tip - Demo Only */}
      {showMobileTip && (
        <div className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-xl shadow-lg relative animate-pulse">
          <button
            onClick={() => setShowMobileTip(false)}
            className="absolute top-2 right-2 text-white/80 hover:text-white"
            style={{ minHeight: '32px', minWidth: '32px' }}
          >
            ✕
          </button>
          <div className="pr-6">
            <p className="font-bold text-lg mb-2">👋 Welcome to the Dashboard!</p>
            <p className="text-sm mb-3">
              This is your command center. Tap the <strong>☰ menu button</strong> in the top-left to explore all 9 steps of the 360° Method.
            </p>
            <p className="text-xs opacity-90">
              💡 Tip: All cards and buttons are clickable. Start exploring!
            </p>
          </div>
        </div>
      )}

      {/* Progress Overview */}
      <Card className="border-2 border-indigo-300 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-lg">
        <CardHeader className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="text-xl md:text-2xl" style={{ color: '#1B365D' }}>
                Your 360° Method Progress
              </CardTitle>
              <p className="text-xs md:text-sm text-gray-600 mt-1">
                {completedStepCount} of 9 steps completed
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-3xl md:text-4xl font-bold text-indigo-600">{Math.round(progressPercent)}%</p>
            </div>
          </div>
          <Progress value={progressPercent} className="mt-3 h-2 md:h-3" />
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <Home className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-blue-700">{systems.length}</p>
            <p className="text-xs text-gray-600 leading-tight">Systems Tracked</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <Flame className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
              {highPriorityTasks.length > 0 && (
                <Badge className="bg-red-600 text-white text-xs animate-pulse">!</Badge>
              )}
            </div>
            <p className="text-xl md:text-2xl font-bold text-red-700">{highPriorityTasks.length}</p>
            <p className="text-xs text-gray-600 leading-tight">High Priority</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-yellow-600" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-yellow-700">{scheduledTasks.length}</p>
            <p className="text-xs text-gray-600 leading-tight">On Calendar</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <Award className="w-4 h-4 md:w-5 md:h-5 text-green-600" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-green-700">{property?.health_score || 0}</p>
            <p className="text-xs text-gray-600 leading-tight">Health Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Step Focus */}
      <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
        <CardHeader className="p-4 md:p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
            <CardTitle className="text-base md:text-lg" style={{ color: '#1B365D' }}>
              Current Focus: {currentStep.name}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6 pt-0">
          <p className="text-sm text-gray-700 mb-4 leading-relaxed">{currentStep.description}</p>
          <Button
            asChild
            className="w-full bg-purple-600 hover:bg-purple-700 text-sm md:text-base"
            style={{ minHeight: '48px' }}
          >
            <Link to={currentStep.link}>
              Continue to {currentStep.name}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-3 md:gap-4">
        {/* 9 Steps Progress */}
        <Card className="border-2 border-gray-300 bg-white shadow-md">
          <CardHeader className="p-4">
            <CardTitle className="text-sm md:text-base" style={{ color: '#1B365D' }}>
              All 9 Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {steps.map((step) => (
              <StepCard
                key={step.id}
                step={step}
                completed={step.completed}
                current={step.id === currentStep.id}
                onClick={() => window.location.href = step.link}
              />
            ))}
          </CardContent>
        </Card>

        {/* Calendar + Alerts */}
        <div className="space-y-3 md:space-y-4">
          {/* Mini Calendar */}
          <Card className="border-2 border-blue-300 bg-white shadow-md">
            <CardHeader className="p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm md:text-base flex items-center gap-2" style={{ color: '#1B365D' }}>
                  <Calendar className="w-4 h-4" />
                  This Week
                </CardTitle>
                <Button asChild variant="ghost" size="sm">
                  <Link to={createPageUrl('Schedule')}>
                    <span className="text-xs">View All</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <MiniCalendar tasks={scheduledTasks} />
              {scheduledTasks.length > 0 && (
                <div className="mt-4 space-y-2">
                  {scheduledTasks.slice(0, 3).map(task => {
                    const daysUntil = task.scheduled_date 
                      ? Math.ceil((new Date(task.scheduled_date) - new Date()) / (1000 * 60 * 60 * 24))
                      : null;
                    
                    return (
                      <div key={task.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 truncate">{task.title}</p>
                          <p className="text-xs text-gray-500">
                            {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Urgent Alerts */}
          {highPriorityTasks.length > 0 && (
            <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50 shadow-md">
              <CardHeader className="p-4">
                <CardTitle className="text-sm md:text-base flex items-center gap-2 text-red-900">
                  <AlertTriangle className="w-4 h-4 md:w-5 md:h-5" />
                  Urgent Attention Needed
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {highPriorityTasks.slice(0, 3).map(task => (
                  <div key={task.id} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-red-200">
                    <Flame className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{task.title}</p>
                      {task.cascade_risk_score >= 7 && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Cascade Risk: {task.cascade_risk_score}/10
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                <Button
                  asChild
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-50"
                  style={{ minHeight: '44px' }}
                >
                  <Link to={createPageUrl('Prioritize')}>
                    View All Urgent Tasks
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Savings Impact */}
          <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-md">
            <CardHeader className="p-4">
              <CardTitle className="text-sm md:text-base flex items-center gap-2 text-green-900">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5" />
                Your Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Maintenance Invested</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${(property?.total_maintenance_spent || 0).toLocaleString()}
                  </p>
                </div>
                <div className="pt-3 border-t border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Disasters Prevented</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${(property?.estimated_disasters_prevented || 0).toLocaleString()}
                  </p>
                </div>
                <div className="pt-3 border-t border-green-200">
                  <p className="text-xs text-gray-600 mb-1">Net Savings</p>
                  <p className="text-3xl font-bold text-green-600">
                    +${((property?.estimated_disasters_prevented || 0) - (property?.total_maintenance_spent || 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-2 border-blue-300 bg-white shadow-md">
        <CardHeader className="p-4">
          <CardTitle className="text-sm md:text-base" style={{ color: '#1B365D' }}>
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-2 md:gap-3">
            <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1">
              <Link to={createPageUrl('Baseline')}>
                <Home className="w-5 h-5 mb-1" />
                <span className="text-xs">View Systems</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1">
              <Link to={createPageUrl('Inspect')}>
                <Eye className="w-5 h-5 mb-1" />
                <span className="text-xs">New Inspection</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1">
              <Link to={createPageUrl('Prioritize')}>
                <Target className="w-5 h-5 mb-1" />
                <span className="text-xs">View Queue</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-3 flex-col gap-1">
              <Link to={createPageUrl('Schedule')}>
                <Calendar className="w-5 h-5 mb-1" />
                <span className="text-xs">Open Calendar</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}