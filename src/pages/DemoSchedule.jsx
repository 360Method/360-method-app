import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar as CalendarIcon,
  Clock,
  ListChecks,
  Inbox,
  PlayCircle,
  AlertTriangle,
  Sparkles,
  Filter,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfDay, parseISO } from "date-fns";
import CalendarView from "../components/schedule/CalendarView";
import ScheduleTaskCard from "../components/schedule/ScheduleTaskCard";
import StepNavigation from "../components/navigation/StepNavigation";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import { shouldShowSeasonalReminder, getSeasonalEmoji } from "../components/schedule/seasonalHelpers";
import { useDemo } from "../components/shared/DemoContext";
import DemoInfoTooltip from '../components/demo/DemoInfoTooltip';
import DontWantDIYBanner from '../components/demo/DontWantDIYBanner';
import DemoCTA from '../components/demo/DemoCTA';

export default function DemoSchedule() {
  const { demoMode, demoData, enterDemoMode, markStepVisited } = useDemo();

  // Ensure demo mode is active
  useEffect(() => {
    if (!demoMode) {
      enterDemoMode('struggling');
    }
    markStepVisited(5);
  }, []);

  const [viewMode, setViewMode] = React.useState('calendar');
  const [calendarViewMode, setCalendarViewMode] = React.useState('month');
  const [showTaskDetail, setShowTaskDetail] = React.useState(false);
  const [taskForDetail, setTaskForDetail] = React.useState(null);

  // Get demo data directly - no server calls
  const property = demoData?.property || null;
  const allTasks = demoData?.tasks || [];

  // Filter to only scheduled tasks
  const scheduledTasks = allTasks.filter(task => task.status === 'Scheduled');
  const tasksWithDates = scheduledTasks.filter(t => t.scheduled_date);
  const tasksWithoutDates = scheduledTasks.filter(t => !t.scheduled_date);

  const totalScheduling = scheduledTasks.length;
  const tasksReadyForExecution = tasksWithDates.length;
  const awaitingDates = tasksWithoutDates.length;

  const today = startOfDay(new Date());
  const next7Days = scheduledTasks.filter(t => {
    if (!t.scheduled_date) return false;
    try {
      const taskDate = startOfDay(parseISO(t.scheduled_date));
      const daysDiff = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    } catch {
      return false;
    }
  }).length;

  const seasonalReminders = allTasks.filter(shouldShowSeasonalReminder);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">

        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={5} propertyId={property?.id} />
        </div>

        {/* Demo Mode Alert */}
        <Alert className="mb-6 border-yellow-400 bg-yellow-50">
          <Info className="w-4 h-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            <strong>Demo Mode:</strong> Tasks scheduled across fall and winter. Read-only example.
          </AlertDescription>
        </Alert>

        {/* Phase & Step Header */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge className="bg-orange-600 text-white text-sm px-3 py-1">
              Phase II - ACT
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1">
              Step 5 of 9
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1B365D' }}>
              Schedule
            </h1>
            <DemoInfoTooltip
              title="Step 5: Schedule"
              content="Plan maintenance strategically to avoid rush fees and emergency prices. Group similar tasks together to save on contractor trips."
            />
          </div>
          <p className="text-gray-600 text-lg">
            Strategic planning to save time and money
          </p>
        </div>

        {/* Don't Want DIY Banner */}
        <DontWantDIYBanner />

        {seasonalReminders.length > 0 && (
          <Card className="mb-6 border-2 border-orange-400 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                  <div>
                    <h3 className="font-bold text-lg text-orange-900">
                      {getSeasonalEmoji()} Seasonal Reminders
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      These tasks are recommended for {format(new Date(), 'MMMM yyyy')}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="border-orange-500 text-orange-700 font-semibold">
                  {seasonalReminders.length} task{seasonalReminders.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <ListChecks className="w-5 h-5 text-yellow-600" />
                <Badge className="bg-yellow-600 text-white text-xs">Total</Badge>
              </div>
              <p className="text-2xl font-bold text-yellow-700">{totalScheduling}</p>
              <p className="text-xs text-gray-600">Ready to Schedule</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                {awaitingDates > 0 && (
                  <Badge className="bg-orange-600 text-white text-xs">Needs Date</Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-orange-700">{awaitingDates}</p>
              <p className="text-xs text-gray-600">Awaiting Dates</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <PlayCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">{tasksReadyForExecution}</p>
              <p className="text-xs text-gray-600">On Calendar</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {next7Days > 0 && (
                  <Badge className="bg-blue-600 text-white text-xs">This Week</Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-blue-700">{next7Days}</p>
              <p className="text-xs text-gray-600">Next 7 Days</p>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <Card className="border-2 border-yellow-200 bg-white mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
              <div className="flex items-center gap-3 flex-wrap">
                <label className="font-bold text-yellow-900">View:</label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() => setViewMode('unscheduled')}
                    variant={viewMode === 'unscheduled' ? 'default' : 'outline'}
                    size="sm"
                    className={viewMode === 'unscheduled' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                    style={{ minHeight: '44px' }}
                  >
                    Needs Dates ({awaitingDates})
                  </Button>
                  <Button
                    onClick={() => setViewMode('calendar')}
                    variant={viewMode === 'calendar' ? 'default' : 'outline'}
                    size="sm"
                    className={viewMode === 'calendar' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                    style={{ minHeight: '44px' }}
                  >
                    Calendar ({tasksReadyForExecution})
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {viewMode === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="border-2 border-orange-300 bg-orange-50 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Inbox className="w-5 h-5" />
                    Ready to Schedule ({awaitingDates})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {tasksWithoutDates.length > 0 ? (
                    tasksWithoutDates.map(task => (
                      <div
                        key={task.id}
                        onClick={() => {
                          setTaskForDetail(task);
                          setShowTaskDetail(true);
                        }}
                        className="p-3 rounded-lg border-2 border-dashed border-orange-400 bg-white cursor-pointer hover:bg-orange-50 transition-all"
                        style={{ minHeight: '44px' }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 mb-1 break-words">
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                              <Badge className={
                                task.priority === 'Critical' ? 'bg-red-700' :
                                task.priority === 'Urgent' ? 'bg-red-600' :
                                task.priority === 'High' ? 'bg-red-500' :
                                task.priority === 'Medium' ? 'bg-yellow-600' :
                                task.priority === 'Low' ? 'bg-blue-600' : 'bg-gray-600'
                              } style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {task.priority}
                              </Badge>
                              <span>
                                {task.execution_method === 'DIY' && '🔧 DIY'}
                                {task.execution_method === 'Contractor' && '👷 Contractor'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 text-center py-4">
                      All tasks have dates!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2">
              <CalendarView
                tasks={tasksWithDates}
                allTasks={scheduledTasks}
                viewMode={calendarViewMode}
                onTaskClick={(task) => {
                  setTaskForDetail(task);
                  setShowTaskDetail(true);
                }}
              />
            </div>
          </div>
        ) : (
          tasksWithoutDates.length > 0 ? (
            <div className="space-y-4">
              <Card className="border-2 border-orange-300 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-orange-900 mb-1">
                        {awaitingDates} Task{awaitingDates !== 1 ? 's' : ''} Waiting for Calendar Dates
                      </h3>
                      <p className="text-sm text-orange-800">
                        In demo mode - click any task to view details.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {tasksWithoutDates.map(task => (
                <ScheduleTaskCard
                  key={task.id}
                  task={task}
                  property={property}
                  canEdit={false}
                />
              ))}
            </div>
          ) : (
            <Card className="border-2 border-yellow-200 bg-white">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h3 className="font-bold text-xl mb-2 text-yellow-900">
                  All Tasks Have Dates!
                </h3>
                <p className="text-gray-600 mb-6">
                  Switch to Calendar View to see your schedule.
                </p>
                <Button
                  onClick={() => setViewMode('calendar')}
                  className="bg-yellow-600 hover:bg-yellow-700"
                  style={{ minHeight: '48px' }}
                >
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          )
        )}

        {totalScheduling === 0 && (
          <Card className="mt-6 border-2 border-yellow-200 bg-white">
            <CardContent className="p-8 text-center">
              <Inbox className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
              <h3 className="font-bold text-xl mb-2 text-yellow-900">
                No Tasks Ready to Schedule
              </h3>
              <p className="text-gray-600 mb-6">
                Tasks arrive here from Prioritize after you choose an execution method.
              </p>
              <Button
                asChild
                className="bg-red-600 hover:bg-red-700 gap-2"
                style={{ minHeight: '48px' }}
              >
                <Link to={createPageUrl("DemoPrioritize")}>
                  Go to Prioritize
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {showTaskDetail && taskForDetail && (
          <TaskDetailModal
            task={taskForDetail}
            property={property}
            open={showTaskDetail}
            onClose={() => {
              setShowTaskDetail(false);
              setTaskForDetail(null);
            }}
            context="schedule"
          />
        )}

        <DemoCTA />
      </div>
    </div>
  );
}
