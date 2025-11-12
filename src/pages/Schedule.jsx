
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Lightbulb, Target, Clock, CheckCircle2, List, Grid3x3, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from "date-fns";
import TaskDialog from "../components/schedule/TaskDialog";
import ManualTaskForm from "../components/tasks/ManualTaskForm";
import SeasonalTaskSuggestions from "../components/schedule/SeasonalTaskSuggestions";

// Helper function to format estimated hours - with null safety
const formatEstimatedTime = (hours) => {
  if (!hours || typeof hours !== 'number' || hours === 0) return null;
  
  try {
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `~${minutes} min`;
    } else if (hours === 1) {
      return '~1 hr';
    } else if (hours < 8) {
      return `~${hours.toFixed(1)} hrs`;
    } else {
      const days = Math.ceil(hours / 8);
      return `~${days} day${days > 1 ? 's' : ''}`;
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    return null;
  }
};

// System type icons
const SYSTEM_ICONS = {
  "HVAC": "❄️",
  "Plumbing": "🚰",
  "Electrical": "⚡",
  "Roof": "🏠",
  "Foundation": "🏗️",
  "Gutters": "🌧️",
  "Exterior": "🎨",
  "Windows/Doors": "🚪",
  "Appliances": "🔌",
  "Landscaping": "🌳",
  "General": "🔧"
};

export default function Schedule() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [taskFormDate, setTaskFormDate] = React.useState(null);
  const [viewMode, setViewMode] = React.useState('month'); // 'month' or 'week'
  const [expandedGroups, setExpandedGroups] = React.useState({}); // Track which groups are expanded
  const [schedulePopoverStates, setSchedulePopoverStates] = React.useState({}); // Track popover states per task

  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: () => base44.entities.Property.list('-created_date'),
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty],
    queryFn: () => selectedProperty 
      ? base44.entities.MaintenanceTask.filter({ property_id: selectedProperty })
      : Promise.resolve([]),
    enabled: !!selectedProperty,
  });

  React.useEffect(() => {
    if (!selectedProperty && properties.length > 0) {
      setSelectedProperty(properties[0].id);
    }
  }, [properties, selectedProperty]);

  // Calculate date ranges based on view mode
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const weekStart = startOfWeek(currentMonth);
  const weekEnd = endOfWeek(currentMonth);
  
  const daysToShow = viewMode === 'month' 
    ? eachDayOfInterval({ start: monthStart, end: monthEnd })
    : eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Get scheduled tasks (not completed)
  const scheduledTasks = tasks.filter(t => t.scheduled_date && t.status !== 'Completed');
  const unscheduledTasks = tasks.filter(t => !t.scheduled_date && t.status !== 'Completed');
  const completedThisMonth = tasks.filter(t => {
    if (t.status !== 'Completed' || !t.completion_date) return false;
    const completionDate = new Date(t.completion_date);
    return isSameMonth(completionDate, currentMonth);
  }).length;

  // NEW: Group unscheduled tasks by system_type
  const groupedUnscheduledTasks = React.useMemo(() => {
    const groups = {};
    
    unscheduledTasks.forEach(task => {
      const systemType = task.system_type || 'General';
      if (!groups[systemType]) {
        groups[systemType] = [];
      }
      groups[systemType].push(task);
    });

    // Sort groups: prioritize groups with High priority tasks, then by task count
    const sortedGroups = Object.entries(groups).sort((a, b) => {
      const [systemA, tasksA] = a;
      const [systemB, tasksB] = b;
      
      // Count high priority tasks in each group
      const highPriorityA = tasksA.filter(t => t.priority === 'High').length;
      const highPriorityB = tasksB.filter(t => t.priority === 'High').length;
      
      if (highPriorityB !== highPriorityA) {
        return highPriorityB - highPriorityA;
      }
      
      // Then by total task count
      return tasksB.length - tasksA.length;
    });

    return sortedGroups;
  }, [unscheduledTasks]);

  // Initialize all groups as expanded
  React.useEffect(() => {
    const initialExpanded = {};
    groupedUnscheduledTasks.forEach(([systemType]) => {
      if (expandedGroups[systemType] === undefined) {
        initialExpanded[systemType] = true;
      }
    });
    if (Object.keys(initialExpanded).length > 0) {
      setExpandedGroups(prev => ({ ...prev, ...initialExpanded }));
    }
  }, [groupedUnscheduledTasks]);

  const toggleGroup = (systemType) => {
    setExpandedGroups(prev => ({
      ...prev,
      [systemType]: !prev[systemType]
    }));
  };

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }) => 
      base44.entities.MaintenanceTask.update(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
    },
  });

  const getTasksForDate = (date) => {
    return scheduledTasks.filter(t => {
      const taskDate = new Date(t.scheduled_date);
      return isSameDay(taskDate, date);
    });
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowDialog(true);
  };

  const handleAddTask = (date = null) => {
    setTaskFormDate(date);
    setShowTaskForm(true);
  };

  const handleTaskComplete = () => {
    setShowTaskForm(false);
    setTaskFormDate(null);
    queryClient.invalidateQueries({ queryKey: ['maintenanceTasks', selectedProperty] });
  };

  const handleTaskCancel = () => {
    setShowTaskForm(false);
    setTaskFormDate(null);
  };

  const handleQuickSchedule = (taskId, date) => {
    updateTaskMutation.mutate({
      taskId,
      updates: {
        scheduled_date: format(date, 'yyyy-MM-dd'),
        status: 'Scheduled'
      }
    });
    // Close the popover for this task
    setSchedulePopoverStates(prev => ({ ...prev, [taskId]: false }));
  };

  const tasksThisWeek = scheduledTasks.filter(t => {
    const taskDate = new Date(t.scheduled_date);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return taskDate >= today && taskDate <= weekFromNow;
  }).length;

  const tasksThisMonth = scheduledTasks.filter(t => {
    const taskDate = new Date(t.scheduled_date);
    return isSameMonth(taskDate, currentMonth);
  }).length;

  const currentProperty = properties.find(p => p.id === selectedProperty);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        
        {/* Mobile-Optimized Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold" style={{ color: '#1B365D' }}>
                ACT → Schedule
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Calendar & timeline view
              </p>
            </div>
            <Button
              onClick={() => handleAddTask()}
              className="gap-2 shadow-lg"
              style={{ backgroundColor: '#28A745', minHeight: '48px' }}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Task</span>
            </Button>
          </div>
        </div>

        {/* Why Scheduling Matters - PROMINENT */}
        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl" style={{ color: '#1B365D' }}>
              <Lightbulb className="w-6 h-6 text-blue-600" />
              Why Your Maintenance Calendar Matters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm md:text-base text-gray-800 leading-relaxed">
              <strong>Scheduling isn't just planning—it's prevention.</strong> A strategic calendar prevents emergencies, 
              maximizes savings, and ensures nothing critical falls through the cracks.
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-green-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-green-900">Beat Peak Season</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Schedule HVAC service in spring, not during July heatwave when it costs 3X more and wait is 2+ weeks.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-orange-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="font-bold text-orange-900">Prevent Gaps</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  Missed annual filter change? Efficiency drops 30%. System works harder. Fails 5 years early = $8K loss.
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-purple-900">Budget Control</h3>
                </div>
                <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
                  See what's coming 2-3 months ahead. Plan expenses. Get quotes early. Control costs vs. emergency panic.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
              <p className="text-sm font-semibold text-blue-900 mb-2">
                💡 Strategic Scheduling = Proactive Control:
              </p>
              <ul className="text-xs md:text-sm text-gray-800 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">1.</span>
                  <span><strong>Seasonal tasks</strong> = right time for regional climate (prevent winter pipe bursts)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">2.</span>
                  <span><strong>Calendar view</strong> = see workload distribution (don't overload one weekend)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">3.</span>
                  <span><strong>Timeline clarity</strong> = finish high-risk tasks before they cascade</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Property Selector & Stats - Mobile First */}
        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full" style={{ minHeight: '48px' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {properties.map((property) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border-2 border-blue-300">
                    <p className="text-xs text-gray-600 mb-1">This Week</p>
                    <p className="text-2xl font-bold text-blue-700">{tasksThisWeek}</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 text-center border-2 border-purple-300">
                    <p className="text-xs text-gray-600 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-purple-700">{tasksThisMonth}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center border-2 border-green-300">
                    <p className="text-xs text-gray-600 mb-1">Completed</p>
                    <p className="text-2xl font-bold text-green-700">{completedThisMonth}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Seasonal Task Suggestions */}
        {currentProperty && !showTaskForm && (
          <SeasonalTaskSuggestions 
            propertyId={selectedProperty}
            property={currentProperty}
            compact={false}
          />
        )}

        {/* NEW: Enhanced Unscheduled Tasks - Grouped by System */}
        {unscheduledTasks.length > 0 && (
          <Card className="border-2 border-orange-300 bg-orange-50 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg" style={{ color: '#1B365D' }}>
                <AlertCircle className="w-5 h-5 text-orange-600" />
                ⏰ Unscheduled Tasks ({unscheduledTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="bg-white rounded-lg p-3 mb-4 border-2 border-orange-200">
                <p className="text-sm text-gray-700">
                  <strong>These tasks need dates.</strong> Grouped by system for easier planning. Click to expand each group.
                </p>
              </div>

              <div className="space-y-3">
                {groupedUnscheduledTasks.map(([systemType, tasksInGroup]) => {
                  const isExpanded = expandedGroups[systemType];
                  const icon = SYSTEM_ICONS[systemType] || SYSTEM_ICONS['General'];
                  const highPriorityCount = tasksInGroup.filter(t => t.priority === 'High').length;
                  const totalEstimatedTime = tasksInGroup.reduce((sum, t) => sum + (Number(t.estimated_hours) || 0), 0);

                  return (
                    <Card 
                      key={systemType}
                      className={`border-2 transition-all ${
                        highPriorityCount > 0 
                          ? 'border-red-300 bg-red-50' 
                          : 'border-orange-200 bg-white'
                      }`}
                    >
                      {/* Group Header - Clickable */}
                      <button
                        onClick={() => toggleGroup(systemType)}
                        className="w-full p-4 flex items-center justify-between hover:bg-orange-50 transition-colors rounded-t-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <span className="text-2xl">{icon}</span>
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2 flex-wrap">
                              {systemType}
                              <Badge variant="outline" className="text-xs">
                                {tasksInGroup.length} task{tasksInGroup.length > 1 ? 's' : ''}
                              </Badge>
                              {highPriorityCount > 0 && (
                                <Badge className="bg-red-600 text-white text-xs">
                                  🔴 {highPriorityCount} High Priority
                                </Badge>
                              )}
                            </h3>
                            {totalEstimatedTime > 0 && (
                              <p className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                                <Clock className="w-3 h-3" />
                                Total time: {formatEstimatedTime(totalEstimatedTime) || `${totalEstimatedTime.toFixed(1)} hrs`}
                              </p>
                            )}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600 flex-shrink-0" />
                        )}
                      </button>

                      {/* Group Content - Collapsible */}
                      {isExpanded && (
                        <div className="px-4 pb-4 space-y-2 border-t border-orange-200">
                          {tasksInGroup.map(task => {
                            const estimatedTime = formatEstimatedTime(task.estimated_hours);
                            
                            return (
                              <div
                                key={task.id}
                                className="bg-white rounded-lg p-3 border-2 border-orange-200 hover:border-orange-400 transition-all"
                              >
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-sm text-gray-900 break-words">
                                      {task.title}
                                    </h4>
                                    {task.description && (
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        {task.description}
                                      </p>
                                    )}
                                  </div>
                                  <Badge className={
                                    task.priority === 'High' ? 'bg-red-600 text-white text-xs flex-shrink-0' :
                                    task.priority === 'Medium' ? 'bg-yellow-600 text-white text-xs flex-shrink-0' :
                                    'bg-blue-600 text-white text-xs flex-shrink-0'
                                  }>
                                    {task.priority}
                                  </Badge>
                                </div>

                                {/* Time Estimate Display */}
                                {estimatedTime && (
                                  <div className="flex items-center gap-1 mb-2">
                                    <Clock className="w-3 h-3 text-blue-600" />
                                    <span className="text-xs font-semibold text-blue-700">
                                      {estimatedTime}
                                    </span>
                                  </div>
                                )}

                                <Popover 
                                  open={schedulePopoverStates[task.id] || false}
                                  onOpenChange={(open) => setSchedulePopoverStates(prev => ({ ...prev, [task.id]: open }))}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="w-full gap-2 border-orange-400 text-orange-700 hover:bg-orange-100"
                                      style={{ minHeight: '40px' }}
                                    >
                                      <CalendarIcon className="w-4 h-4" />
                                      Schedule This Task
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <CalendarUI
                                      mode="single"
                                      selected={new Date()}
                                      onSelect={(date) => handleQuickSchedule(task.id, date)}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* Summary Stats at Bottom */}
              <div className="mt-4 bg-white rounded-lg p-3 border-2 border-orange-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">
                    <strong>{groupedUnscheduledTasks.length}</strong> system{groupedUnscheduledTasks.length > 1 ? 's' : ''} need attention
                  </span>
                  <span className="text-gray-700">
                    <strong>{unscheduledTasks.filter(t => t.priority === 'High').length}</strong> high priority
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Form Overlay */}
        {showTaskForm && (
          <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
            <div className="min-h-screen flex items-start justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8 relative">
                <button
                  onClick={handleTaskCancel}
                  className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  style={{ minHeight: '40px', minWidth: '40px' }}
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
                <ManualTaskForm
                  propertyId={selectedProperty}
                  prefilledDate={taskFormDate}
                  onComplete={handleTaskComplete}
                  onCancel={handleTaskCancel}
                />
              </div>
            </div>
          </div>
        )}

        {/* Calendar */}
        <Card className="border-2 border-gray-300 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-blue-600" />
                <span style={{ color: '#1B365D' }}>
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
              </CardTitle>

              <div className="flex items-center gap-2 flex-wrap">
                {/* View Mode Toggle */}
                <div className="flex bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                    className={`rounded-none ${viewMode === 'month' ? 'bg-blue-600 text-white' : ''}`}
                    style={{ minHeight: '40px' }}
                  >
                    <Grid3x3 className="w-4 h-4 mr-1" />
                    Month
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                    className={`rounded-none ${viewMode === 'week' ? 'bg-blue-600 text-white' : ''}`}
                    style={{ minHeight: '40px' }}
                  >
                    <List className="w-4 h-4 mr-1" />
                    Week
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(viewMode === 'month' ? subMonths(currentMonth, 1) : new Date(currentMonth.getTime() - 7 * 24 * 60 * 60 * 1000))}
                    style={{ minHeight: '40px', minWidth: '40px' }}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentMonth(new Date())}
                    style={{ minHeight: '40px' }}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentMonth(viewMode === 'month' ? addMonths(currentMonth, 1) : new Date(currentMonth.getTime() + 7 * 24 * 60 * 60 * 1000))}
                    style={{ minHeight: '40px', minWidth: '40px' }}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-2 md:p-4">
            <div className={`grid ${viewMode === 'month' ? 'grid-cols-7' : 'grid-cols-1'} gap-2`}>
              {/* Day headers for month view */}
              {viewMode === 'month' && ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-xs md:text-sm text-gray-600 py-2">
                  <span className="hidden md:inline">{day}</span>
                  <span className="md:hidden">{day.charAt(0)}</span>
                </div>
              ))}

              {/* Empty cells for days before month starts (month view only) */}
              {viewMode === 'month' && Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-20 md:h-28 border rounded-lg bg-gray-50" />
              ))}

              {/* Calendar days */}
              {daysToShow.map(date => {
                const tasksForDay = getTasksForDate(date);
                const isDateToday = isToday(date);
                const isPastDate = date < new Date() && !isDateToday;

                if (viewMode === 'week') {
                  return (
                    <div
                      key={date.toISOString()}
                      className={`border-2 rounded-lg p-3 md:p-4 cursor-pointer transition-all ${
                        isDateToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }`}
                      onClick={() => handleDateClick(date)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className={`text-lg font-bold ${isDateToday ? 'text-blue-600' : 'text-gray-900'}`}>
                            {format(date, 'EEEE')}
                          </p>
                          <p className={`text-sm ${isDateToday ? 'text-blue-600' : 'text-gray-600'}`}>
                            {format(date, 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <Badge className={isDateToday ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}>
                          {tasksForDay.length} task{tasksForDay.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {tasksForDay.map((task, idx) => (
                          <div
                            key={idx}
                            className={`text-sm p-2 rounded ${
                              task.priority === 'High'
                                ? 'bg-red-100 text-red-900 border-2 border-red-300'
                                : task.priority === 'Medium'
                                ? 'bg-yellow-100 text-yellow-900 border-2 border-yellow-300'
                                : 'bg-blue-100 text-blue-900 border-2 border-blue-300'
                            }`}
                          >
                            <p className="font-semibold">{task.title}</p>
                            {task.system_type && (
                              <p className="text-xs opacity-75">{task.system_type}</p>
                            )}
                          </div>
                        ))}
                        {tasksForDay.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-4">
                            No tasks scheduled
                          </p>
                        )}
                      </div>
                    </div>
                  );
                }

                // Month view
                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`h-20 md:h-28 border-2 rounded-lg p-1 md:p-2 cursor-pointer transition-all ${
                      isDateToday 
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' 
                        : isPastDate
                        ? 'bg-gray-50 hover:bg-gray-100'
                        : 'hover:bg-blue-50 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className={`text-xs md:text-sm font-semibold mb-1 ${
                      isDateToday ? 'text-blue-600' : isPastDate ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      {format(date, 'd')}
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      {tasksForDay.slice(0, 2).map((task, idx) => (
                        <div
                          key={idx}
                          className={`text-[10px] md:text-xs p-1 rounded truncate font-medium ${
                            task.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : task.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      ))}
                      {tasksForDay.length > 2 && (
                        <div className="text-[10px] text-gray-600 font-semibold">
                          +{tasksForDay.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <TaskDialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        selectedDate={selectedDate}
        propertyId={selectedProperty}
        existingTasks={selectedDate ? getTasksForDate(selectedDate) : []}
        onAddTask={() => {
          setShowDialog(false);
          handleAddTask(selectedDate);
        }}
      />
    </div>
  );
}
