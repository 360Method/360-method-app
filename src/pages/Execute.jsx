
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CheckCircle2,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Plus,
  Eye,
  Building2,
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  Wrench,
  Clock,
  ListChecks,
  PlayCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, addDays, subDays, startOfDay, isSameDay, parseISO } from "date-fns";
import TaskExecutionCard from "../components/execute/TaskExecutionCard";
import StepNavigation from "../components/navigation/StepNavigation";

const Label = ({ children, className = "", ...props }) => (
  <label className={`text-sm font-medium text-gray-700 ${className}`} {...props}>
    {children}
  </label>
);

const SYSTEM_TYPES = [
  "HVAC", "Plumbing", "Electrical", "Roof", "Foundation",
  "Gutters", "Exterior", "Windows/Doors", "Appliances", "Landscaping", "General"
];

const SYSTEM_ICONS = {
  HVAC: "❄️",
  Plumbing: "🚰",
  Electrical: "⚡",
  Roof: "🏠",
  Foundation: "🏗️",
  Gutters: "🌧️",
  Exterior: "🏘️",
  "Windows/Doors": "🚪",
  Appliances: "🔌",
  Landscaping: "🌳",
  General: "🔧"
};

export default function ExecutePage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(location.search);
  const propertyIdFromUrl = urlParams.get('property');

  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || 'all');
  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [showEducation, setShowEducation] = React.useState(false);
  const [expandedSystems, setExpandedSystems] = React.useState({});

  // Fetch properties
  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft);
    }
  });

  // Set initial selected property
  React.useEffect(() => {
    if (propertyIdFromUrl && properties.length > 0) {
      const foundProperty = properties.find(p => p.id === propertyIdFromUrl);
      if (foundProperty) {
        setSelectedProperty(propertyIdFromUrl);
      }
    } else if (selectedProperty === 'all' && properties.length === 1) {
      setSelectedProperty(properties[0].id);
    }
  }, [propertyIdFromUrl, properties, selectedProperty]);

  // Fetch tasks based on selected property
  const { data: allTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty],
    queryFn: async () => {
      if (selectedProperty === 'all') {
        return await base44.entities.MaintenanceTask.list('-scheduled_date');
      } else {
        return await base44.entities.MaintenanceTask.filter({ property_id: selectedProperty }, '-scheduled_date');
      }
    },
    enabled: properties.length > 0 && selectedProperty !== null
  });

  // Mutation for completing tasks
  const completeTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
    }
  });

  // Filter tasks for execution
  // 1. Show tasks scheduled for selected date
  // 2. Show overdue tasks (scheduled before selected date but not completed)
  const selectedDateStart = startOfDay(selectedDate);
  
  const tasksForExecution = allTasks.filter(task => {
    // Must be Scheduled or In Progress status
    if (task.status !== 'Scheduled' && task.status !== 'In Progress') return false;
    
    if (!task.scheduled_date) return false;
    
    try {
      const taskDate = startOfDay(parseISO(task.scheduled_date));
      
      // Show tasks scheduled for selected date
      if (isSameDay(taskDate, selectedDateStart)) return true;
      
      // Show overdue tasks (scheduled before selected date)
      if (taskDate < selectedDateStart) return true;
      
      return false;
    } catch {
      return false;
    }
  });

  // Group tasks by system type
  const tasksBySystem = tasksForExecution.reduce((acc, task) => {
    const system = task.system_type || 'General';
    if (!acc[system]) {
      acc[system] = [];
    }
    acc[system].push(task);
    return acc;
  }, {});

  // Sort systems by number of tasks (descending)
  const sortedSystems = Object.keys(tasksBySystem).sort((a, b) => 
    tasksBySystem[b].length - tasksBySystem[a].length
  );

  // Calculate statistics
  const totalTasks = tasksForExecution.length;
  const tasksInProgress = tasksForExecution.filter(t => t.status === 'In Progress').length;
  const overdueCount = tasksForExecution.filter(t => {
    if (!t.scheduled_date) return false;
    try {
      const taskDate = startOfDay(parseISO(t.scheduled_date));
      return taskDate < selectedDateStart;
    } catch {
      return false;
    }
  }).length;
  const totalEstimatedHours = tasksForExecution.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

  const handleCompleteTask = (task) => {
    completeTaskMutation.mutate({
      taskId: task.id,
      data: {
        status: 'Completed',
        completion_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const toggleSystemExpanded = (system) => {
    setExpandedSystems(prev => ({
      ...prev,
      [system]: !prev[system]
    }));
  };

  // No properties fallback
  if (properties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 pb-20">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-6">
          <Card className="border-2 border-green-300 bg-white">
            <CardContent className="p-6 md:p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
              <h2 className="font-bold text-xl md:text-2xl mb-2" style={{ color: '#1B365D' }}>
                Add Your First Property
              </h2>
              <p className="text-gray-600 mb-6">
                Start by adding a property to begin executing maintenance tasks.
              </p>
              <Button asChild className="bg-green-600 hover:bg-green-700" style={{ minHeight: '48px' }}>
                <Link to={createPageUrl("Properties")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentProperty = selectedProperty !== 'all' 
    ? properties.find(p => p.id === selectedProperty)
    : null;

  const isToday = isSameDay(selectedDate, new Date());

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={6} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-600 to-green-700 flex items-center justify-center shadow-lg">
              <PlayCircle className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-bold" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
                Step 6: Execute - Daily Work Manual
              </h1>
              <p className="text-gray-600" style={{ fontSize: '16px' }}>
                Your how-to guide for completing scheduled maintenance tasks
              </p>
            </div>
          </div>

          {/* ACT Phase Workflow Indicator */}
          <div className="bg-white rounded-lg p-3 border-2 border-green-300 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-600 text-white">ACT Phase - Step 3 of 3</Badge>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <span className="text-gray-400">Prioritize (Red)</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-gray-400">Schedule (Yellow)</span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-bold text-green-600">→ Execute (Green)</span>
                <ArrowRight className="w-3 h-3" />
                <span className="text-gray-400">Track (Archive)</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Today's Workbench:</strong> View scheduled tasks with complete AI-generated how-to guides → 
              Follow scope of work, use tool lists, watch tutorials → Mark complete to archive in Track
            </p>
          </div>
        </div>

        {/* Educational Card - Expandable */}
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 mb-6">
          <CardContent className="p-4">
            <button
              onClick={() => setShowEducation(!showEducation)}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <Wrench className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-1">
                  🛠️ Your Daily Work Manual
                </h3>
                <p className="text-sm text-green-800">
                  Click to learn how Execute provides step-by-step guidance for each task
                </p>
              </div>
              {showEducation ? (
                <ChevronUp className="w-5 h-5 text-green-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
            </button>

            {showEducation && (
              <div className="mt-4 space-y-3 text-sm text-gray-800 border-t border-green-200 pt-4">
                <p className="leading-relaxed">
                  <strong>Execute is your how-to manual:</strong> Tasks scheduled in the previous step appear here 
                  grouped by system area (just like inspections). Each task opens to reveal complete AI-generated 
                  instructions - scope of work, time estimates, required tools, and video tutorials.
                </p>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <ListChecks className="w-4 h-4" />
                    What You'll See Per Task:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>AI Scope of Work:</strong> Clear objectives, what will be done, expected outcome</li>
                    <li>• <strong>Estimated Time:</strong> How long this typically takes</li>
                    <li>• <strong>Tools Required:</strong> Everything you need before starting</li>
                    <li>• <strong>Materials Needed:</strong> Consumables to purchase</li>
                    <li>• <strong>Video Tutorials:</strong> Watch-along guides from YouTube</li>
                    <li>• <strong>Cost Estimates:</strong> Current fix cost & what waiting costs</li>
                  </ul>
                </div>

                <div className="bg-green-100 rounded-lg p-3 border border-green-300">
                  <p className="font-semibold text-green-900 mb-2">📅 Date Navigation:</p>
                  <p className="text-xs">
                    <strong>Default view is TODAY.</strong> Use arrows to move forward/backward. 
                    Overdue tasks (scheduled before selected date) automatically show up so nothing slips through.
                  </p>
                </div>

                <p className="text-xs italic text-green-700 bg-green-100 border border-green-300 rounded p-2">
                  💡 <strong>Pro Tip:</strong> Tasks are grouped by system area (HVAC, Plumbing, etc) to batch 
                  similar work. Open each task to see the full how-to guide before starting. Mark complete when 
                  done to archive to Track.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Selector */}
        {properties.length > 1 && (
          <Card className="mb-6 border-2 border-green-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-green-600" />
                  <Label className="text-base font-bold text-green-900">Filter by Property:</Label>
                </div>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="flex-1 md:w-96 bg-white" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        <span className="font-semibold">All Properties ({properties.length})</span>
                      </div>
                    </SelectItem>
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          <span>{prop.address || prop.street_address || 'Unnamed Property'}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Date Navigation */}
        <Card className="mb-6 border-2 border-green-300 bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <Button
                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                variant="outline"
                size="sm"
                className="gap-2"
                style={{ minHeight: '44px' }}
              >
                <ArrowLeft className="w-4 h-4" />
                Previous Day
              </Button>

              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-xl text-green-900">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                  </h3>
                </div>
                {isToday ? (
                  <Badge className="bg-green-600 text-white">Today's Tasks</Badge>
                ) : selectedDate < new Date() ? (
                  <Badge className="bg-orange-600 text-white">Past Date</Badge>
                ) : (
                  <Badge className="bg-blue-600 text-white">Future Date</Badge>
                )}
              </div>

              <Button
                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                variant="outline"
                size="sm"
                className="gap-2"
                style={{ minHeight: '44px' }}
              >
                Next Day
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {!isToday && (
              <div className="mt-3 text-center">
                <Button
                  onClick={() => setSelectedDate(new Date())}
                  variant="outline"
                  size="sm"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Jump to Today
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <ListChecks className="w-5 h-5 text-green-600" />
                <Badge className="bg-green-600 text-white text-xs">
                  Today
                </Badge>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {totalTasks}
              </p>
              <p className="text-xs text-gray-600">Total Tasks</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <PlayCircle className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {tasksInProgress}
              </p>
              <p className="text-xs text-gray-600">In Progress</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                {overdueCount > 0 && (
                  <Badge className="bg-orange-600 text-white text-xs">
                    Overdue
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-orange-700">
                {overdueCount}
              </p>
              <p className="text-xs text-gray-600">Past Due</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-purple-700">
                {totalEstimatedHours.toFixed(1)}h
              </p>
              <p className="text-xs text-gray-600">Estimated Time</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Grouped by System */}
        {sortedSystems.length > 0 ? (
          <div className="space-y-4">
            {sortedSystems.map(system => {
              const systemTasks = tasksBySystem[system];
              const isExpanded = expandedSystems[system] !== false; // Default to expanded

              return (
                <Card key={system} className="border-2 border-green-200 bg-white">
                  <CardHeader 
                    className="cursor-pointer hover:bg-green-50 transition-colors"
                    onClick={() => toggleSystemExpanded(system)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-2xl">{SYSTEM_ICONS[system] || '🔧'}</span>
                        </div>
                        <div>
                          <CardTitle className="text-lg text-green-900">
                            {system}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {systemTasks.length} task{systemTasks.length !== 1 ? 's' : ''} • 
                            {' '}{systemTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0).toFixed(1)}h estimated
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-600 text-white">
                          {systemTasks.length}
                        </Badge>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-green-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="space-y-3 pt-0">
                      {systemTasks.map(task => (
                        <TaskExecutionCard
                          key={task.id}
                          task={task}
                          property={currentProperty || properties.find(p => p.id === task.property_id)}
                          onComplete={handleCompleteTask}
                          isOverdue={(() => {
                            if (!task.scheduled_date) return false;
                            try {
                              const taskDate = startOfDay(parseISO(task.scheduled_date));
                              return taskDate < selectedDateStart;
                            } catch {
                              return false;
                            }
                          })()}
                        />
                      ))}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border-2 border-green-200 bg-white">
            <CardContent className="p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-300" />
              <h3 className="font-bold text-xl mb-2 text-green-900">
                No Tasks Scheduled for {format(selectedDate, 'MMMM d')}
              </h3>
              <p className="text-gray-600 mb-6">
                {isToday 
                  ? "You're all caught up! Schedule tasks from the Schedule tab to see them here."
                  : "No tasks scheduled for this date. Use the arrows above to navigate to other days."}
              </p>
              <div className="flex gap-3 justify-center">
                {isToday && selectedProperty !== 'all' && (
                  <Button
                    asChild
                    className="bg-yellow-600 hover:bg-yellow-700 gap-2"
                  >
                    <Link to={createPageUrl("Schedule") + `?property=${selectedProperty}`}>
                      <Calendar className="w-4 h-4" />
                      Go to Schedule
                    </Link>
                  </Button>
                )}
                {isToday && (
                  <Button
                    asChild
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 gap-2"
                  >
                    <Link to={createPageUrl("Prioritize")}>
                      <Eye className="w-4 h-4" />
                      View Ticket Queue
                    </Link>
                  </Button>
                )}
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
                <h3 className="font-bold text-green-900 mb-2">After Completing Tasks:</h3>
                <p className="text-sm text-gray-800 mb-3">
                  Mark tasks complete as you finish them. Completed tasks automatically archive to <strong>Track</strong> where 
                  all costs, dates, and outcomes are recorded for your property's historical record.
                </p>
                <div className="bg-white rounded-lg p-3 border border-green-300">
                  <p className="text-xs text-gray-700 leading-relaxed">
                    <strong>💡 Remember:</strong> Execute is where scheduled work gets done. All ACT phase work 
                    (Prioritize → Schedule → Execute) flows into Track for permanent recordkeeping.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
