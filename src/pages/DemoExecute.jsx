import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2, Calendar, AlertTriangle,
  PlayCircle, Wrench, HardHat, Star, Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { startOfDay, parseISO, isBefore, isSameDay } from "date-fns";
import ExecuteTaskCard from "../components/execute/ExecuteTaskCard";
import StepNavigation from "../components/navigation/StepNavigation";
import { useDemo } from "../components/shared/DemoContext";
import StepEducationCard from "../components/shared/StepEducationCard";
import { STEP_EDUCATION } from "../components/shared/stepEducationContent";
import DemoInfoTooltip from '../components/demo/DemoInfoTooltip';
import DontWantDIYBanner from '../components/demo/DontWantDIYBanner';
import RegionalAdaptationBox from '../components/shared/RegionalAdaptationBox';
import DemoCTA from '../components/demo/DemoCTA';

export default function DemoExecute() {
  const { demoMode, demoData, enterDemoMode, markStepVisited } = useDemo();

  // Ensure demo mode is active
  useEffect(() => {
    if (!demoMode) {
      enterDemoMode('struggling');
    }
    markStepVisited(6);
  }, []);

  // Get demo data directly - no server calls
  const property = demoData?.property || null;
  const properties = property ? [property] : [];
  const allTasks = demoData?.tasks || [];

  const today = startOfDay(new Date());

  // Show tasks that are Scheduled and have a date
  // In demo mode, show all scheduled tasks regardless of date
  const tasksForDisplay = allTasks.filter(task => {
    if (task.status !== 'Scheduled' && task.status !== 'In Progress') return false;
    if (!task.scheduled_date) return false;
    return true; // Demo mode - show all
  });

  const overdueCount = tasksForDisplay.filter(task => {
    try {
      const taskDate = startOfDay(parseISO(task.scheduled_date));
      return isBefore(taskDate, today);
    } catch {
      return false;
    }
  }).length;

  // Sort tasks
  const sortedTasks = [...tasksForDisplay].sort((a, b) => {
    const priorityOrder = { 'Critical': 0, 'Urgent': 1, 'High': 2, 'Medium': 3, 'Low': 4, 'Routine': 5 };
    const priorityDiff = (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
    if (priorityDiff !== 0) return priorityDiff;
    const aHours = a.estimated_hours || a.diy_time_hours || 999;
    const bHours = b.estimated_hours || b.diy_time_hours || 999;
    return aHours - bHours;
  });

  // Group by execution method
  const operatorTasks = sortedTasks.filter(t => t.execution_method === '360_Operator');
  const diyTasks = sortedTasks.filter(t => t.execution_method === 'DIY');
  const contractorTasks = sortedTasks.filter(t => t.execution_method === 'Contractor');

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">

        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={6} propertyId={property?.id} />
        </div>

        {/* Demo Mode Alert */}
        <Alert className="mb-6 border-yellow-400 bg-yellow-50">
          <Info className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            <strong>Demo Mode:</strong> Task execution with AI guides and completion tracking. Read-only example.
          </AlertDescription>
        </Alert>

        {/* Phase & Step Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-orange-600 text-white text-sm px-3 py-1">
              Phase II - ACT
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Step 6 of 9
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Execute
            </h1>
            <DemoInfoTooltip
              title="Step 6: Execute"
              content="Get AI-powered how-to guides, track DIY work, or route to contractors. Everything logs to Track automatically when marked complete."
            />
          </div>
          <p className="text-gray-600 text-lg">
            Complete tasks with AI guidance
          </p>
        </div>

        {/* Don't Want DIY Banner */}
        <DontWantDIYBanner />

        {/* Step Education Card */}
        <StepEducationCard
          {...STEP_EDUCATION.execute}
          defaultExpanded={false}
          className="mb-6"
        />

        <RegionalAdaptationBox
          step="task execution guides"
          regionalAdaptations={{
            description: "How-to guides include climate-specific techniques. Roof repair in wet climates includes moisture barriers; desert climates focus on UV protection.",
            howItWorks: "Instructions, materials, and techniques adapt to your climate. Phoenix guides recommend reflective coatings; Seattle guides emphasize waterproofing",
            examples: {
              'pacific-northwest': [
                'Roof: Moss prevention techniques included',
                'Deck: Water-resistant stains recommended',
                'Crawlspace: Vapor barrier installation guides',
                'Paint: Mildew-resistant formulas specified'
              ],
              'southwest': [
                'Roof: Cool roof coatings recommended',
                'Exterior: UV-resistant materials specified',
                'AC: Desert-specific maintenance tips',
                'Irrigation: Drought-tolerant system guides'
              ],
              'midwest-northeast': [
                'Winterization: Freeze protection detailed',
                'Roof: Ice dam barrier installation',
                'Foundation: Freeze/thaw repair techniques',
                'Insulation: Cold climate R-values specified'
              ],
              'southeast': [
                'Hurricane: Wind-resistant fasteners specified',
                'Termite: Bait vs. barrier system guides',
                'Mold: High-humidity prevention tactics',
                'Roof: Hurricane strap installation'
              ]
            }
          }}
        />

        {/* Simple Inline Count */}
        {sortedTasks.length > 0 && (
          <div className="flex items-baseline gap-2 mb-4 mt-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {sortedTasks.length} task{sortedTasks.length !== 1 ? 's' : ''} to complete
            </h2>
            {overdueCount > 0 && (
              <span className="text-sm text-red-600 font-semibold animate-pulse">
                ({overdueCount} overdue)
              </span>
            )}
          </div>
        )}

        {/* OVERDUE ALERT */}
        {overdueCount > 0 && (
          <Card className="mb-4 border-2 border-red-400 bg-gradient-to-br from-red-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h3 className="font-bold text-red-900 mb-1 text-lg">
                    {overdueCount} Overdue Task{overdueCount !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm text-red-800">
                    These tasks were scheduled before today and need attention!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TASK LIST - Grouped by Execution Method */}
        {sortedTasks.length > 0 ? (
          <div className="space-y-6">

            {/* Operator Tasks Section */}
            {operatorTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-gray-900">360° Operator Services</h3>
                  <Badge variant="outline" className="ml-auto border-blue-600 text-blue-600">
                    {operatorTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {operatorTasks.map(task => {
                    const isOverdue = (() => {
                      try {
                        const taskDate = startOfDay(parseISO(task.scheduled_date));
                        return isBefore(taskDate, today);
                      } catch {
                        return false;
                      }
                    })();

                    return (
                      <ExecuteTaskCard
                        key={task.id}
                        task={task}
                        urgency={isOverdue ? 'overdue' : 'today'}
                        properties={properties}
                        canEdit={false}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* DIY Tasks Section */}
            {diyTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-gray-900">DIY Tasks</h3>
                  <Badge variant="outline" className="ml-auto border-green-600 text-green-600">
                    {diyTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {diyTasks.map(task => {
                    const isOverdue = (() => {
                      try {
                        const taskDate = startOfDay(parseISO(task.scheduled_date));
                        return isBefore(taskDate, today);
                      } catch {
                        return false;
                      }
                    })();

                    return (
                      <ExecuteTaskCard
                        key={task.id}
                        task={task}
                        urgency={isOverdue ? 'overdue' : 'today'}
                        properties={properties}
                        canEdit={false}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contractor Tasks Section */}
            {contractorTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <HardHat className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-900">Contractor Services</h3>
                  <Badge variant="outline" className="ml-auto border-gray-600 text-gray-600">
                    {contractorTasks.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {contractorTasks.map(task => {
                    const isOverdue = (() => {
                      try {
                        const taskDate = startOfDay(parseISO(task.scheduled_date));
                        return isBefore(taskDate, today);
                      } catch {
                        return false;
                      }
                    })();

                    return (
                      <ExecuteTaskCard
                        key={task.id}
                        task={task}
                        urgency={isOverdue ? 'overdue' : 'today'}
                        properties={properties}
                        canEdit={false}
                      />
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        ) : (
          <Card className="border-2 border-green-200 bg-white mt-6">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="text-6xl md:text-7xl mb-4">✨</div>
              <h3 className="font-bold text-2xl md:text-3xl mb-2 text-green-900">
                All Caught Up!
              </h3>
              <p className="text-gray-600 mb-6 text-lg">
                No tasks scheduled for today. Great work!
              </p>

              <div className="flex gap-3 justify-center flex-wrap">
                <Button
                  asChild
                  variant="outline"
                  className="border-yellow-600 text-yellow-600 hover:bg-yellow-50 gap-2"
                  style={{ minHeight: '48px' }}
                >
                  <Link to={createPageUrl("DemoSchedule")}>
                    <Calendar className="w-4 h-4" />
                    View Schedule
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completion Reminder */}
        <Card className="mt-6 border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-green-900 mb-2">Quick Tip:</h3>
                <p className="text-sm text-gray-800 leading-relaxed">
                  Tasks under 30 minutes show a <strong>"Quick Complete"</strong> button for faster logging.
                  Longer tasks open the full DIY guide with timer, checklist, and photo uploads.
                  Completed tasks automatically archive to <strong>Track</strong> with all details saved!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DemoCTA />
      </div>
    </div>
  );
}
