
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronUp,
  Building2,
  Clock,
  ListChecks,
  ArrowRight,
  ArrowLeft,
  Inbox,
  PlayCircle,
  BookOpen,
  AlertTriangle,
  Target,
  Send,
  Plus,
  Sparkles,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO, startOfDay, isSameDay, addDays } from "date-fns";
import ScheduleTaskCard from "../components/schedule/ScheduleTaskCard";
import SeasonalTaskSuggestions from "../components/schedule/SeasonalTaskSuggestions";
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

export default function SchedulePage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(location.search);
  const propertyIdFromUrl = urlParams.get('property');

  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || 'all');
  const [showEducation, setShowEducation] = React.useState(false);
  const [viewMode, setViewMode] = React.useState('unscheduled'); // 'unscheduled' or 'calendar'
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
        return await base44.entities.MaintenanceTask.list('-created_date');
      } else {
        return await base44.entities.MaintenanceTask.filter({ property_id: selectedProperty }, '-created_date');
      }
    },
    enabled: properties.length > 0 && selectedProperty !== null
  });

  // Mutations for task management
  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
    }
  });

  // Filter tasks that have been sent to Schedule (status = "Scheduled")
  const scheduledTasks = allTasks.filter(task => task.status === 'Scheduled');

  // Split into tasks with dates and tasks without dates
  const tasksWithDates = scheduledTasks.filter(t => t.scheduled_date);
  const tasksWithoutDates = scheduledTasks.filter(t => !t.scheduled_date);

  // Group unscheduled tasks by system type
  const tasksBySystem = tasksWithoutDates.reduce((acc, task) => {
    const system = task.system_type || 'General';
    if (!acc[system]) {
      acc[system] = [];
    }
    acc[system].push(task);
    return acc;
  }, {});

  const sortedSystems = Object.keys(tasksBySystem).sort((a, b) => 
    tasksBySystem[b].length - tasksBySystem[a].length
  );

  // Calculate statistics
  const totalScheduled = scheduledTasks.length;
  const tasksReadyForExecution = tasksWithDates.length;
  const awaitingDates = tasksWithoutDates.length;
  const totalEstimatedHours = scheduledTasks.reduce((sum, t) => sum + (t.estimated_hours || 0), 0);

  // Count tasks by next 7 days
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

  // Handle task actions
  const handleSetDate = (task, date) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        scheduled_date: format(date, 'yyyy-MM-dd')
      }
    });
  };

  const handleSendBackToPrioritize = (task) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        status: 'Identified',
        scheduled_date: null
      }
    });
  };

  const handleSendToExecute = (task) => {
    if (!task.scheduled_date) {
      alert('Please set a date before sending to Execute.');
      return;
    }
    // Status stays "Scheduled" - Execute will show it when the date comes
    // Just confirm it's ready
    alert(`"${task.title}" is ready for execution on ${format(parseISO(task.scheduled_date), 'MMM d, yyyy')}`);
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
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 pb-20">
        <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pt-6">
          <Card className="border-2 border-yellow-300 bg-white">
            <CardContent className="p-6 md:p-8 text-center">
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
              <h2 className="font-bold text-xl md:text-2xl mb-2" style={{ color: '#1B365D' }}>
                Add Your First Property
              </h2>
              <p className="text-gray-600 mb-6">
                Start by adding a property to begin scheduling maintenance tasks.
              </p>
              <Button asChild className="bg-yellow-600 hover:bg-yellow-700" style={{ minHeight: '48px' }}>
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={5} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-700 flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="font-bold" style={{ color: '#1B365D', fontSize: '28px', lineHeight: '1.2' }}>
                Step 5: Schedule - Timeline Planner
              </h1>
              <p className="text-gray-600" style={{ fontSize: '16px' }}>
                Assign dates to tasks from Prioritize, then send to Execute
              </p>
            </div>
          </div>

          {/* ACT Phase Workflow Indicator */}
          <Card className="border-2 border-yellow-400 bg-gradient-to-r from-red-100 via-yellow-100 to-green-100 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-yellow-700" />
                <h3 className="font-bold text-yellow-900">ACT Phase - Step 2 of 3:</h3>
              </div>
              
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-red-600 text-white">✓ 1. Prioritize</Badge>
                <ArrowRight className="w-4 h-4 text-gray-600" />
                <Badge className="bg-yellow-600 text-white">→ 2. Schedule (YOU ARE HERE)</Badge>
                <ArrowRight className="w-4 h-4 text-gray-600" />
                <Badge variant="outline" className="border-green-600 text-green-600">3. Execute</Badge>
              </div>

              <p className="text-xs text-gray-800 leading-relaxed">
                <strong>Your Job:</strong> Tasks arrive from Prioritize → Pick calendar dates → Organize timeline → 
                Send to Execute (where AI how-to guides await) → Completed work auto-archives to Track
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Educational Card - Expandable */}
        <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 mb-6">
          <CardContent className="p-4">
            <button
              onClick={() => setShowEducation(!showEducation)}
              className="w-full flex items-start gap-3 text-left hover:opacity-80 transition-opacity"
            >
              <Clock className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 mb-1">
                  📅 How Schedule Works
                </h3>
                <p className="text-sm text-yellow-800">
                  Click to understand your role in the ACT workflow
                </p>
              </div>
              {showEducation ? (
                <ChevronUp className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              )}
            </button>

            {showEducation && (
              <div className="mt-4 space-y-3 text-sm text-gray-800 border-t border-yellow-200 pt-4">
                <p className="leading-relaxed">
                  <strong>Schedule is Step 2 of ACT:</strong> After you prioritize tasks in the Ticket Queue, 
                  send them here to assign calendar dates. Once dates are set, tasks flow to Execute where you'll 
                  see complete AI how-to guides. This creates a realistic timeline for your maintenance work.
                </p>
                
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-yellow-200">
                    <p className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <Inbox className="w-4 h-4" />
                      What Arrives Here
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>• Tasks you "Send to Schedule" from Prioritize</li>
                      <li>• Status changed to "Scheduled"</li>
                      <li>• May or may not have dates yet</li>
                      <li>• Can be DIY or Professional</li>
                      <li>• Already enriched with AI analysis</li>
                    </ul>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-yellow-200">
                    <p className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Your Planning Tasks
                    </p>
                    <ul className="space-y-1 text-xs">
                      <li>• Assign calendar dates to tasks</li>
                      <li>• Group similar work (batch by system)</li>
                      <li>• Consider seasonal timing</li>
                      <li>• Plan around availability</li>
                      <li>• Balance DIY vs Professional timing</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3 border-2 border-green-300">
                  <p className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                    <PlayCircle className="w-4 h-4" />
                    Next Stop: Execute (Green)
                  </p>
                  <p className="text-xs text-gray-700 leading-relaxed mb-2">
                    Once tasks have dates, they automatically appear in <strong>Execute</strong> on the scheduled day. 
                    Execute shows:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>• AI-generated scope of work</li>
                    <li>• Tools & materials needed</li>
                    <li>• Video tutorials</li>
                    <li>• Time estimates</li>
                    <li>• Complete how-to guides</li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-3 border-2 border-blue-300">
                  <p className="font-semibold text-blue-900 mb-2">💡 Pro Tips:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• <strong>Batch by system:</strong> Schedule similar tasks together (all HVAC work on one day)</li>
                    <li>• <strong>Season matters:</strong> Don't schedule roof work in winter or exterior painting in rain season</li>
                    <li>• <strong>Send back anytime:</strong> Changed your mind? Send tasks back to Prioritize to reassess</li>
                    <li>• <strong>No rush:</strong> Tasks wait here until YOU assign dates - nothing happens automatically</li>
                  </ul>
                </div>

                <p className="text-xs italic text-yellow-700 bg-yellow-100 border border-yellow-300 rounded p-2">
                  🗓️ <strong>Remember:</strong> Schedule is about <strong>WHEN</strong>, not HOW. The "how" lives in 
                  Execute with AI-generated instructions. Your job here is just timeline planning.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Selector */}
        {properties.length > 1 && (
          <Card className="mb-6 border-2 border-yellow-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-yellow-600" />
                  <Label className="text-base font-bold text-yellow-900">Filter by Property:</Label>
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

        {/* Key Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="border-none shadow-md bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <ListChecks className="w-5 h-5 text-yellow-600" />
                <Badge className="bg-yellow-600 text-white text-xs">
                  Total
                </Badge>
              </div>
              <p className="text-2xl font-bold text-yellow-700">
                {totalScheduled}
              </p>
              <p className="text-xs text-gray-600">In Schedule</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                {awaitingDates > 0 && (
                  <Badge className="bg-orange-600 text-white text-xs">
                    Needs Date
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-orange-700">
                {awaitingDates}
              </p>
              <p className="text-xs text-gray-600">Awaiting Dates</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <PlayCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-700">
                {tasksReadyForExecution}
              </p>
              <p className="text-xs text-gray-600">Ready for Execute</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                {next7Days > 0 && (
                  <Badge className="bg-blue-600 text-white text-xs">
                    This Week
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {next7Days}
              </p>
              <p className="text-xs text-gray-600">Next 7 Days</p>
            </CardContent>
          </Card>
        </div>

        {/* View Mode Selector */}
        <Card className="border-2 border-yellow-200 bg-white mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Label className="font-bold text-yellow-900">View Mode:</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => setViewMode('unscheduled')}
                  variant={viewMode === 'unscheduled' ? 'default' : 'outline'}
                  size="sm"
                  className={viewMode === 'unscheduled' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                  style={{ minHeight: '44px' }}
                >
                  📝 Tasks Needing Dates ({awaitingDates})
                </Button>
                <Button
                  onClick={() => setViewMode('calendar')}
                  variant={viewMode === 'calendar' ? 'default' : 'outline'}
                  size="sm"
                  className={viewMode === 'calendar' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                  style={{ minHeight: '44px' }}
                >
                  📅 All Scheduled Tasks ({tasksReadyForExecution})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        {viewMode === 'unscheduled' ? (
          // Tasks Needing Dates View - Grouped by System
          sortedSystems.length > 0 ? (
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
                        These tasks were sent from Prioritize but need dates assigned. Click each task to set a date, 
                        then they'll move to "Ready for Execute" and appear in the Execute tab on the scheduled day.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {sortedSystems.map(system => {
                const systemTasks = tasksBySystem[system];
                const isExpanded = expandedSystems[system] !== false;

                return (
                  <Card key={system} className="border-2 border-yellow-200 bg-white">
                    <CardHeader 
                      className="cursor-pointer hover:bg-yellow-50 transition-colors"
                      onClick={() => toggleSystemExpanded(system)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-2xl">
                              {system === 'HVAC' ? '❄️' : 
                               system === 'Plumbing' ? '🚰' :
                               system === 'Electrical' ? '⚡' :
                               system === 'Roof' ? '🏠' : '🔧'}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-lg text-yellow-900">
                              {system}
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              {systemTasks.length} task{systemTasks.length !== 1 ? 's' : ''} need{systemTasks.length === 1 ? 's' : ''} dates
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-600 text-white">
                            {systemTasks.length}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {isExpanded && (
                      <CardContent className="space-y-3 pt-0">
                        {systemTasks.map(task => (
                          <ScheduleTaskCard
                            key={task.id}
                            task={task}
                            property={currentProperty || properties.find(p => p.id === task.property_id)}
                            onSetDate={handleSetDate}
                            onSendBack={handleSendBackToPrioritize}
                            onSendToExecute={handleSendToExecute}
                          />
                        ))}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-2 border-yellow-200 bg-white">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h3 className="font-bold text-xl mb-2 text-yellow-900">
                  All Tasks Have Dates!
                </h3>
                <p className="text-gray-600 mb-6">
                  Every task in Schedule has a calendar date assigned. Switch to "All Scheduled Tasks" view to see your timeline.
                </p>
                <Button
                  onClick={() => setViewMode('calendar')}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  View Timeline
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          // All Scheduled Tasks View
          tasksReadyForExecution > 0 ? (
            <div className="space-y-4">
              <Card className="border-2 border-green-300 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <PlayCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-bold text-green-900 mb-1">
                        {tasksReadyForExecution} Task{tasksReadyForExecution !== 1 ? 's' : ''} Ready for Execution
                      </h3>
                      <p className="text-sm text-green-800">
                        These tasks have calendar dates assigned. They'll automatically appear in the <strong>Execute</strong> tab 
                        on their scheduled dates with complete AI how-to guides.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Show tasks sorted by date */}
              {tasksWithDates
                .sort((a, b) => new Date(a.scheduled_date) - new Date(b.scheduled_date))
                .map(task => (
                  <ScheduleTaskCard
                    key={task.id}
                    task={task}
                    property={currentProperty || properties.find(p => p.id === task.property_id)}
                    onSetDate={handleSetDate}
                    onSendBack={handleSendBackToPrioritize}
                    onSendToExecute={handleSendToExecute}
                    showDateFirst={true}
                  />
                ))}
            </div>
          ) : (
            <Card className="border-2 border-yellow-200 bg-white">
              <CardContent className="p-8 text-center">
                <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
                <h3 className="font-bold text-xl mb-2 text-yellow-900">
                  No Tasks Ready for Execution
                </h3>
                <p className="text-gray-600 mb-6">
                  Assign dates to tasks in the "Tasks Needing Dates" view first.
                </p>
                <Button
                  onClick={() => setViewMode('unscheduled')}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  View Tasks Needing Dates
                </Button>
              </CardContent>
            </Card>
          )
        )}

        {/* Seasonal Maintenance Suggestions */}
        {currentProperty && (
          <div className="mt-6">
            <SeasonalTaskSuggestions
              propertyId={currentProperty.id}
              property={currentProperty}
              compact={false}
            />
          </div>
        )}

        {/* Navigation Guide */}
        <Card className="mt-6 border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <ArrowRight className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-yellow-900 mb-3">Navigation - Moving Tasks Between Steps:</h3>
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div className="bg-red-50 rounded-lg p-3 border-2 border-red-400">
                    <p className="font-semibold text-red-900 mb-1 flex items-center gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Send Back to Prioritize
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Changed your mind? Send tasks back to the Ticket Queue to re-evaluate priority, 
                      execution type, or add to cart instead
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 border-2 border-yellow-400">
                    <p className="font-semibold text-yellow-900 mb-1 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Set/Change Date
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Assign calendar dates to tasks. Once dated, they'll appear in Execute on the scheduled day. 
                      You can change dates anytime
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border-2 border-green-400">
                    <p className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Auto-Flows to Execute
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Tasks with dates automatically appear in <strong>Execute</strong> on the scheduled day. 
                      No "send" action needed - just set the date
                    </p>
                  </div>
                </div>

                <div className="mt-3 bg-white rounded-lg p-3 border-l-4 border-green-600">
                  <p className="text-xs text-gray-800 leading-relaxed">
                    <strong>📚 Remember:</strong> Once tasks are completed in Execute, they automatically archive to 
                    <strong> Track</strong> with all dates, costs, and outcomes logged. The ACT workflow ensures nothing falls through the cracks!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State - No Scheduled Tasks */}
        {totalScheduled === 0 && (
          <Card className="mt-6 border-2 border-yellow-200 bg-white">
            <CardContent className="p-8 text-center">
              <Inbox className="w-16 h-16 mx-auto mb-4 text-yellow-300" />
              <h3 className="font-bold text-xl mb-2 text-yellow-900">
                No Tasks in Schedule Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Tasks arrive here from Prioritize. Send tasks to Schedule from the Ticket Queue to start planning your timeline.
              </p>
              <div className="flex gap-3 justify-center">
                <Button
                  asChild
                  className="bg-red-600 hover:bg-red-700 gap-2"
                >
                  <Link to={createPageUrl("Prioritize") + (selectedProperty !== 'all' ? `?property=${selectedProperty}` : '')}>
                    <Eye className="w-4 h-4" />
                    Go to Prioritize
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
