import React from "react";
import { Property, MaintenanceTask } from "@/api/supabaseClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar as CalendarIcon,
  Building2,
  Clock,
  ListChecks,
  ArrowRight,
  Inbox,
  PlayCircle,
  BookOpen,
  AlertTriangle,
  Plus,
  Eye,
  CheckSquare,
  Sparkles,
  Filter,
  X,
  Info
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, startOfDay, parseISO } from "date-fns";
import CalendarView from "../components/schedule/CalendarView";
import QuickDatePicker from "../components/schedule/QuickDatePicker";
import ScheduleTaskCard from "../components/schedule/ScheduleTaskCard";
import SeasonalReminderCard from "../components/schedule/SeasonalReminderCard";
import DayDetailsDialog from "../components/schedule/DayDetailsDialog";
import StepNavigation from "../components/navigation/StepNavigation";
import TaskDetailModal from "../components/tasks/TaskDetailModal";
import { shouldShowSeasonalReminder, getSeasonalEmoji } from "../components/schedule/seasonalHelpers";
import { useDemo } from "../components/shared/DemoContext";
import StepEducationCard from "../components/shared/StepEducationCard";
import { STEP_EDUCATION } from "../components/shared/stepEducationContent";
import DemoInfoTooltip from '../components/demo/DemoInfoTooltip';
import RegionalAdaptationBox from '../components/shared/RegionalAdaptationBox';
import DontWantDIYBanner from '../components/demo/DontWantDIYBanner';
import DemoCTA from '../components/demo/DemoCTA';

export default function SchedulePage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(location.search);
  const propertyIdFromUrl = urlParams.get('property');
  const { demoMode, demoData, isInvestor, markStepVisited } = useDemo();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (demoMode) markStepVisited(5);
  }, [demoMode, markStepVisited]);

  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || 'all');
  const [viewMode, setViewMode] = React.useState('unscheduled');
  const [calendarViewMode, setCalendarViewMode] = React.useState('month');
  const [showQuickDatePicker, setShowQuickDatePicker] = React.useState(false);
  const [selectedTaskForPicker, setSelectedTaskForPicker] = React.useState(null);
  const [selectedTasks, setSelectedTasks] = React.useState([]);
  const [showBatchScheduler, setShowBatchScheduler] = React.useState(false);
  const [showDayDetails, setShowDayDetails] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [tasksForSelectedDate, setTasksForSelectedDate] = React.useState([]);
  const [showTaskDetail, setShowTaskDetail] = React.useState(false);
  const [taskForDetail, setTaskForDetail] = React.useState(null);
  const [showFilters, setShowFilters] = React.useState(false);
  
  const [filters, setFilters] = React.useState({
    priority: 'all',
    executionMethod: 'all',
    system: 'all',
    unit: 'all',
    timeRange: 'all',
    riskLevel: 'all',
    sortBy: 'priority'
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', demoMode],
    queryFn: async () => {
      if (demoMode) {
        return isInvestor ? (demoData?.properties || []) : (demoData?.property ? [demoData.property] : []);
      }
      const allProps = await Property.list('-created_date');
      return allProps.filter(p => !p.is_draft);
    },
    enabled: demoMode || true // Always enabled, but queryFn handles demo mode check
  });

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

  const { data: realTasks = [] } = useQuery({
    queryKey: ['maintenanceTasks', selectedProperty],
    queryFn: async () => {
      if (demoMode) {
        if (isInvestor) {
          // Filter investor demo tasks by property or show all
          if (selectedProperty === 'all') {
            return demoData?.tasks || [];
          }
          return demoData?.tasks?.filter(t => t.property_id === selectedProperty) || [];
        }
        return demoData?.tasks || [];
      }
      
      if (selectedProperty === 'all') {
        return await MaintenanceTask.list('-created_date');
      } else {
        return await MaintenanceTask.filter({ property_id: selectedProperty }, '-created_date');
      }
    },
    enabled: demoMode || (properties.length > 0 && selectedProperty !== null)
  });

  const allTasks = realTasks;

  console.log('=== SCHEDULE DEBUG ===');
  console.log('Demo mode:', demoMode);
  console.log('Demo data exists:', !!demoData);
  console.log('Demo data property:', demoData?.property);
  console.log('Demo data tasks count:', demoData?.tasks?.length);
  console.log('isInvestor:', isInvestor);
  console.log('Properties:', properties);
  console.log('All tasks from query:', allTasks);

  const canEdit = !demoMode;

  const { data: seasonalReminders = [] } = useQuery({
    queryKey: ['seasonal-reminders', selectedProperty],
    queryFn: async () => {
      return allTasks.filter(shouldShowSeasonalReminder);
    },
    enabled: allTasks.length > 0
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['seasonal-reminders'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  const scheduledTasks = allTasks.filter(task => task.status === 'Scheduled');

  const filteredTasks = scheduledTasks.filter(task => {
    if (filters.priority !== 'all' && task.priority !== filters.priority) return false;
    if (filters.executionMethod !== 'all' && task.execution_method !== filters.executionMethod) return false;
    if (filters.system !== 'all' && task.system_type !== filters.system) return false;
    if (filters.unit !== 'all' && task.unit_tag !== filters.unit) return false;
    if (filters.timeRange !== 'all' && task.time_range !== filters.timeRange) return false;
    if (filters.riskLevel === 'high' && (!task.cascade_risk_score || task.cascade_risk_score < 7)) return false;
    return true;
  });

  const sortedFilteredTasks = [...filteredTasks].sort((a, b) => {
    switch (filters.sortBy) {
      case 'priority':
        const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3, 'Routine': 4 };
        return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
      case 'time':
        return (a.estimated_hours || a.diy_time_hours || 0) - (b.estimated_hours || b.diy_time_hours || 0);
      case 'cost':
        return (a.current_fix_cost || 0) - (b.current_fix_cost || 0);
      case 'risk':
        return (b.cascade_risk_score || 0) - (a.cascade_risk_score || 0);
      case 'unit':
        return (a.unit_tag || '').localeCompare(b.unit_tag || '');
      default:
        return 0;
    }
  });

  const tasksWithDates = sortedFilteredTasks.filter(t => t.scheduled_date);
  const tasksWithoutDates = sortedFilteredTasks.filter(t => !t.scheduled_date);

  const totalScheduling = scheduledTasks.length;
  const tasksReadyForExecution = tasksWithDates.length;
  const awaitingDates = tasksWithoutDates.length;

  const today = startOfDay(new Date());
  const next7Days = scheduledTasks.filter(t => {
    if (!t.scheduled_date) return false;
    try {
      // Use parseISO for timezone-safe parsing
      const taskDate = startOfDay(parseISO(t.scheduled_date));
      const daysDiff = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    } catch {
      return false;
    }
  }).length;

  const uniqueSystems = [...new Set(scheduledTasks.map(t => t.system_type).filter(Boolean))];
  const uniqueUnits = [...new Set(scheduledTasks.map(t => t.unit_tag).filter(Boolean))];
  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all' && v !== 'priority').length;

  const handleTaskDrop = (task, date) => {
    if (demoMode) return;
    const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        scheduled_date: formattedDate,
        status: 'Scheduled',
        last_reminded_date: new Date().toISOString()
      }
    });
  };

  const handleTimeRangeChange = (task, timeRange) => {
    if (demoMode) return;
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        time_range: timeRange,
        last_reminded_date: new Date().toISOString()
      }
    });
  };

  const handleSetDate = (task, date, timeRange = 'morning') => {
    if (demoMode) return;
    const formattedDate = format(startOfDay(date), 'yyyy-MM-dd');
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        scheduled_date: formattedDate,
        status: 'Scheduled',
        time_range: timeRange,
        last_reminded_date: new Date().toISOString()
      }
    });
  };

  const handleSendBackToPrioritize = (task) => {
    if (demoMode) return;
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        status: 'Identified',
        scheduled_date: null,
        execution_method: null,
        time_range: null,
        last_reminded_date: new Date().toISOString()
      }
    });
  };

  const handleTaskClick = (task, event) => {
    if (event?.metaKey || event?.ctrlKey) {
      if (selectedTasks.includes(task.id)) {
        setSelectedTasks(selectedTasks.filter(id => id !== task.id));
      } else {
        setSelectedTasks([...selectedTasks, task.id]);
      }
    } else {
      setTaskForDetail(task);
      setShowTaskDetail(true);
    }
  };

  const handleDateClick = (date, tasks) => {
    setSelectedDate(date);
    setTasksForSelectedDate(tasks);
    setShowDayDetails(true);
  };

  const handleBatchSchedule = (dateStr) => {
    if (demoMode) return;
    selectedTasks.forEach(taskId => {
      updateTaskMutation.mutate({
        taskId,
        data: {
          scheduled_date: dateStr,
          status: 'Scheduled',
          last_reminded_date: new Date().toISOString()
        }
      });
    });
    setSelectedTasks([]);
    setShowBatchScheduler(false);
  };

  const clearFilters = () => {
    setFilters({
      priority: 'all',
      executionMethod: 'all',
      system: 'all',
      unit: 'all',
      timeRange: 'all',
      riskLevel: 'all',
      sortBy: 'priority'
    });
  };

  if (properties.length === 0 && !demoMode) {
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        
        {/* Step Navigation */}
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={5} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

        {/* Demo Mode Alert */}
        {demoMode && (
          <Alert className="mb-6 border-yellow-400 bg-yellow-50">
            <Info className="w-4 h-4 text-yellow-600" />
            <AlertDescription className="text-yellow-900">
              <strong>Demo Mode:</strong> Tasks scheduled across fall and winter. Read-only example.
            </AlertDescription>
          </Alert>
        )}

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
            
            <CardContent>
              <div className="space-y-3 mb-4">
                {seasonalReminders.map(task => (
                  <SeasonalReminderCard
                    key={task.id}
                    task={task}
                    properties={properties}
                    onSchedule={(task) => {
                      if (canEdit) {
                        setSelectedTaskForPicker(task);
                        setShowQuickDatePicker(true);
                      }
                    }}
                    onSnooze={handleSendBackToPrioritize}
                    canEdit={canEdit}
                  />
                ))}
              </div>
              
              <div className="p-3 bg-white rounded-lg border-2 border-orange-300">
                <p className="text-xs text-gray-700 leading-relaxed">
                  💡 <strong>Tip:</strong> These are existing tasks from your maintenance plan. 
                  Schedule them now or snooze to be reminded later.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {properties.length > 1 && (
          <Card className="mb-6 border-2 border-yellow-200 bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-yellow-600" />
                  <label className="text-base font-bold text-yellow-900">Filter by Property:</label>
                </div>
                <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                  <SelectTrigger className="flex-1 md:w-96 bg-white" style={{ minHeight: '48px' }}>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Properties ({properties.length})</SelectItem>
                    {properties.map(prop => (
                      <SelectItem key={prop.id} value={prop.id}>
                        {prop.address || prop.street_address || 'Unnamed Property'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

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

        <Card className="border-2 border-yellow-200 bg-white mb-6">
          <CardContent className="p-4">
            <div className="space-y-4">
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
                      📝 Needs Dates ({awaitingDates})
                    </Button>
                    <Button
                      onClick={() => setViewMode('calendar')}
                      variant={viewMode === 'calendar' ? 'default' : 'outline'}
                      size="sm"
                      className={viewMode === 'calendar' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                      style={{ minHeight: '44px' }}
                    >
                      📅 Calendar ({tasksReadyForExecution})
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {viewMode === 'calendar' && (
                    <>
                      <label className="text-sm font-semibold text-gray-700">Calendar:</label>
                      <Select value={calendarViewMode} onValueChange={setCalendarViewMode}>
                        <SelectTrigger className="w-32" style={{ minHeight: '44px' }}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="season">🍂 Season</SelectItem>
                          <SelectItem value="month">📅 Month</SelectItem>
                          <SelectItem value="week">📆 Week</SelectItem>
                          <SelectItem value="day">🌞 Day</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                    style={{ minHeight: '44px' }}
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="bg-blue-600 ml-1">{activeFiltersCount}</Badge>
                    )}
                  </Button>
                </div>
              </div>

              {showFilters && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Filter & Sort Tasks</h4>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="gap-1 text-blue-600"
                      >
                        <X className="w-3 h-3" />
                        Clear All
                      </Button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Select value={filters.priority} onValueChange={(val) => setFilters({...filters, priority: val})}>
                      <SelectTrigger style={{ minHeight: '44px' }}>
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="High">🔥 High</SelectItem>
                        <SelectItem value="Medium">⚡ Medium</SelectItem>
                        <SelectItem value="Low">💡 Low</SelectItem>
                        <SelectItem value="Routine">🔄 Routine</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.executionMethod} onValueChange={(val) => setFilters({...filters, executionMethod: val})}>
                      <SelectTrigger style={{ minHeight: '44px' }}>
                        <SelectValue placeholder="Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value="DIY">🔧 DIY</SelectItem>
                        <SelectItem value="Contractor">👷 Contractor</SelectItem>
                        <SelectItem value="360_Operator">⭐ 360° Operator</SelectItem>
                      </SelectContent>
                    </Select>

                    {uniqueSystems.length > 0 && (
                      <Select value={filters.system} onValueChange={(val) => setFilters({...filters, system: val})}>
                        <SelectTrigger style={{ minHeight: '44px' }}>
                          <SelectValue placeholder="System" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Systems</SelectItem>
                          {uniqueSystems.map(sys => (
                            <SelectItem key={sys} value={sys}>{sys}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {uniqueUnits.length > 0 && (
                      <Select value={filters.unit} onValueChange={(val) => setFilters({...filters, unit: val})}>
                        <SelectTrigger style={{ minHeight: '44px' }}>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Units</SelectItem>
                          {uniqueUnits.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    <Select value={filters.timeRange} onValueChange={(val) => setFilters({...filters, timeRange: val})}>
                      <SelectTrigger style={{ minHeight: '44px' }}>
                        <SelectValue placeholder="Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Times</SelectItem>
                        <SelectItem value="morning">🌅 Morning</SelectItem>
                        <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                        <SelectItem value="evening">🌙 Evening</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.riskLevel} onValueChange={(val) => setFilters({...filters, riskLevel: val})}>
                      <SelectTrigger style={{ minHeight: '44px' }}>
                        <SelectValue placeholder="Risk" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Risk Levels</SelectItem>
                        <SelectItem value="high">⚠️ High Risk Only</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filters.sortBy} onValueChange={(val) => setFilters({...filters, sortBy: val})}>
                      <SelectTrigger style={{ minHeight: '44px' }}>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="priority">Priority</SelectItem>
                        <SelectItem value="time">Time Required</SelectItem>
                        <SelectItem value="cost">Cost</SelectItem>
                        <SelectItem value="risk">Risk Level</SelectItem>
                        <SelectItem value="unit">Unit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
                  {tasksWithoutDates.length > 0 && canEdit && (
                    <div className="mb-3 p-3 bg-white rounded-lg border-2 border-orange-400">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-700">
                          {selectedTasks.length > 0 ? (
                            <span className="font-semibold">{selectedTasks.length} selected</span>
                          ) : (
                            <span className="text-xs">Drag to any calendar view</span>
                          )}
                        </div>
                        
                        {selectedTasks.length > 0 && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setShowBatchScheduler(true)}
                              size="sm"
                              className="bg-yellow-600 hover:bg-yellow-700 gap-1"
                              style={{ minHeight: '36px' }}
                            >
                              <CheckSquare className="w-3 h-3" />
                              Schedule All
                            </Button>
                            <Button
                              onClick={() => setSelectedTasks([])}
                              size="sm"
                              variant="outline"
                              style={{ minHeight: '36px' }}
                            >
                              Clear
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {tasksWithoutDates.length > 0 ? (
                    tasksWithoutDates.map(task => (
                      <div
                        key={task.id}
                        draggable={canEdit}
                        onDragStart={(e) => {
                          if (canEdit) {
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/plain', task.id);
                          }
                        }}
                        onClick={(e) => handleTaskClick(task, e)}
                        className={`
                          p-3 rounded-lg border-2 border-dashed border-orange-400 bg-white ${canEdit ? 'cursor-move hover:bg-orange-50' : 'cursor-default'}
                          transition-all
                          ${selectedTasks.includes(task.id) ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''}
                        `}
                        style={{ minHeight: '44px' }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 mb-1 break-words">
                              {task.title}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap text-xs text-gray-600">
                              <Badge className={
                                task.priority === 'High' ? 'bg-red-600' :
                                task.priority === 'Medium' ? 'bg-yellow-600' :
                                task.priority === 'Low' ? 'bg-blue-600' : 'bg-gray-600'
                              } style={{ fontSize: '10px', padding: '2px 6px' }}>
                                {task.priority}
                              </Badge>
                              {task.unit_tag && (
                                <Badge className="bg-purple-600" style={{ fontSize: '10px', padding: '2px 6px' }}>
                                  {task.unit_tag}
                                </Badge>
                              )}
                              <span>
                                {task.execution_method === 'DIY' && '🔧'}
                                {task.execution_method === 'Contractor' && '👷'}
                                {task.execution_method === '360_Operator' && '⭐'}
                              </span>
                              {(task.estimated_hours || task.diy_time_hours) && (
                                <span>~{task.estimated_hours || task.diy_time_hours}h</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-600 text-center py-4">
                      All tasks have dates! 🎉
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2">
              <CalendarView 
                tasks={tasksWithDates}
                allTasks={scheduledTasks} /* Added this prop based on outline */
                viewMode={calendarViewMode}
                onTaskClick={(task) => {
                  setTaskForDetail(task);
                  setShowTaskDetail(true);
                }}
                onDateClick={handleDateClick}
                onTaskDrop={canEdit ? handleTaskDrop : undefined}
                onTimeRangeChange={canEdit ? handleTimeRangeChange : undefined}
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
                        {canEdit ? 'Click any task for quick scheduling or switch to Calendar View to drag and drop.' : 'View tasks below.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {tasksWithoutDates.map(task => (
                <ScheduleTaskCard
                  key={task.id}
                  task={task}
                  property={currentProperty || properties.find(p => p.id === task.property_id)}
                  onSetDate={canEdit ? handleSetDate : undefined}
                  onSendBack={canEdit ? handleSendBackToPrioritize : undefined}
                  onQuickSchedule={canEdit ? () => {
                    setSelectedTaskForPicker(task);
                    setShowQuickDatePicker(true);
                  } : undefined}
                  canEdit={canEdit}
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
                <Link to={createPageUrl("Prioritize") + (selectedProperty !== 'all' ? `?property=${selectedProperty}` : '')}>
                  <Eye className="w-4 h-4" />
                  Go to Prioritize
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {canEdit && showQuickDatePicker && selectedTaskForPicker && (
          <QuickDatePicker
            task={selectedTaskForPicker}
            property={currentProperty || properties.find(p => p.id === selectedTaskForPicker.property_id)}
            onSchedule={(task, date, timeRange) => {
              handleSetDate(task, date, timeRange);
            }}
            onClose={() => {
              setShowQuickDatePicker(false);
              setSelectedTaskForPicker(null);
            }}
            onSnooze={handleSendBackToPrioritize}
          />
        )}

        {showDayDetails && selectedDate && (
          <DayDetailsDialog
            date={selectedDate}
            tasks={tasksForSelectedDate}
            open={showDayDetails}
            onClose={() => setShowDayDetails(false)}
            onTaskClick={(task) => {
              setTaskForDetail(task);
              setShowTaskDetail(true);
            }}
          />
        )}

        {showTaskDetail && taskForDetail && (
          <TaskDetailModal
            task={taskForDetail}
            property={currentProperty || properties.find(p => p.id === taskForDetail.property_id)}
            open={showTaskDetail}
            onClose={() => {
              setShowTaskDetail(false);
              setTaskForDetail(null);
            }}
            onBackToPrioritize={handleSendBackToPrioritize}
            context="schedule"
          />
        )}

        {canEdit && showBatchScheduler && selectedTasks.length > 0 && (
          <Dialog open={true} onOpenChange={() => setShowBatchScheduler(false)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Schedule {selectedTasks.length} Tasks</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Schedule all for:
                  </label>
                  <input
                    type="date"
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBatchSchedule(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none bg-white"
                    style={{ minHeight: '48px' }}
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    All {selectedTasks.length} selected tasks will be scheduled for this date
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <DemoCTA />
      </div>
    </div>
  );
}