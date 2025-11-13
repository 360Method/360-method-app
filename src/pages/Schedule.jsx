import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  CheckSquare
} from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO, startOfDay } from "date-fns";
import CalendarView from "../components/schedule/CalendarView";
import QuickDatePicker from "../components/schedule/QuickDatePicker";
import ScheduleTaskCard from "../components/schedule/ScheduleTaskCard";
import SeasonalTaskSuggestions from "../components/schedule/SeasonalTaskSuggestions";
import StepNavigation from "../components/navigation/StepNavigation";

export default function SchedulePage() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(location.search);
  const propertyIdFromUrl = urlParams.get('property');

  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || 'all');
  const [viewMode, setViewMode] = React.useState('unscheduled');
  const [showQuickDatePicker, setShowQuickDatePicker] = React.useState(false);
  const [selectedTaskForPicker, setSelectedTaskForPicker] = React.useState(null);
  const [selectedTasks, setSelectedTasks] = React.useState([]);
  const [showBatchScheduler, setShowBatchScheduler] = React.useState(false);

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const allProps = await base44.entities.Property.list('-created_date');
      return allProps.filter(p => !p.is_draft);
    }
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

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }) => base44.entities.MaintenanceTask.update(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenanceTasks'] });
      queryClient.invalidateQueries({ queryKey: ['allMaintenanceTasks'] });
    }
  });

  // Filter tasks that have execution_method set
  const tasksReadyForScheduling = allTasks.filter(task => 
    task.execution_method && 
    (task.status === 'Identified' || task.status === 'Scheduled')
  );

  const tasksWithDates = tasksReadyForScheduling.filter(t => t.scheduled_date);
  const tasksWithoutDates = tasksReadyForScheduling.filter(t => !t.scheduled_date);

  // NEW: Simple flat sort by priority
  const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3, 'Routine': 4 };
  const sortedUnscheduledTasks = tasksWithoutDates.sort((a, b) => {
    return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
  });

  const totalScheduling = tasksReadyForScheduling.length;
  const tasksReadyForExecution = tasksWithDates.length;
  const awaitingDates = tasksWithoutDates.length;
  const totalEstimatedHours = tasksReadyForScheduling.reduce((sum, t) => sum + (t.estimated_hours || t.diy_time_hours || 0), 0);

  const today = startOfDay(new Date());
  const next7Days = tasksReadyForScheduling.filter(t => {
    if (!t.scheduled_date) return false;
    try {
      const taskDate = startOfDay(parseISO(t.scheduled_date));
      const daysDiff = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    } catch {
      return false;
    }
  }).length;

  // NEW: Workload calculation
  const getWorkloadByDay = (tasks) => {
    const workloadMap = {};
    tasks.forEach(task => {
      if (task.scheduled_date && (task.estimated_hours || task.diy_time_hours)) {
        const dateKey = format(parseISO(task.scheduled_date), 'yyyy-MM-dd');
        workloadMap[dateKey] = (workloadMap[dateKey] || 0) + (task.estimated_hours || task.diy_time_hours);
      }
    });
    return workloadMap;
  };

  const workloadByDay = getWorkloadByDay(tasksWithDates);
  const overloadedDays = Object.entries(workloadByDay)
    .filter(([date, hours]) => hours > 6)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]));

  const handleTaskDrop = (task, date) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        scheduled_date: format(date, 'yyyy-MM-dd'),
        status: 'Scheduled'
      }
    });
  };

  const handleSetDate = (task, date) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        scheduled_date: format(date, 'yyyy-MM-dd'),
        status: 'Scheduled'
      }
    });
  };

  const handleSendBackToPrioritize = (task) => {
    updateTaskMutation.mutate({
      taskId: task.id,
      data: { 
        status: 'Identified',
        scheduled_date: null,
        execution_method: null
      }
    });
  };

  const handleTaskClick = (task, event) => {
    // Cmd/Ctrl+Click for batch selection
    if (event.metaKey || event.ctrlKey) {
      if (selectedTasks.includes(task.id)) {
        setSelectedTasks(selectedTasks.filter(id => id !== task.id));
      } else {
        setSelectedTasks([...selectedTasks, task.id]);
      }
    } else {
      // Regular click opens quick date picker
      setSelectedTaskForPicker(task);
      setShowQuickDatePicker(true);
    }
  };

  const handleBatchSchedule = (dateStr) => {
    selectedTasks.forEach(taskId => {
      updateTaskMutation.mutate({
        taskId,
        data: {
          scheduled_date: dateStr,
          status: 'Scheduled'
        }
      });
    });
    setSelectedTasks([]);
    setShowBatchScheduler(false);
  };

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
        
        <div className="mb-4 md:mb-6">
          <StepNavigation currentStep={5} propertyId={selectedProperty !== 'all' ? selectedProperty : null} />
        </div>

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
                Click tasks for quick scheduling or drag to calendar
              </p>
            </div>
          </div>

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
                <strong>Your Job:</strong> Click any task for quick date options (Today/Tomorrow/Weekend) or drag to calendar → 
                Tasks auto-flow to Execute on scheduled day
              </p>
            </CardContent>
          </Card>
        </div>

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

        {/* Key Statistics */}
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

        {/* View Mode Selector */}
        <Card className="border-2 border-yellow-200 bg-white mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <label className="font-bold text-yellow-900">View Mode:</label>
              <div className="flex gap-2 flex-wrap">
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
                  📅 Calendar View ({tasksReadyForExecution})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Area */}
        {viewMode === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Unscheduled Tasks Sidebar */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="border-2 border-orange-300 bg-orange-50 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Inbox className="w-5 h-5" />
                    Ready to Schedule ({awaitingDates})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                  {/* Batch Selection UI */}
                  {sortedUnscheduledTasks.length > 0 && (
                    <div className="mb-3 p-3 bg-white rounded-lg border-2 border-orange-400">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-gray-700">
                          {selectedTasks.length > 0 ? (
                            <span className="font-semibold">{selectedTasks.length} selected</span>
                          ) : (
                            <span className="text-xs">⌘+Click to select multiple</span>
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
                  
                  {sortedUnscheduledTasks.length > 0 ? (
                    sortedUnscheduledTasks.map(task => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                        onClick={(e) => handleTaskClick(task, e)}
                        className={`
                          p-3 rounded-lg border-2 border-dashed border-orange-400 bg-white cursor-pointer
                          hover:bg-orange-50 transition-all
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
                              <span>
                                {task.execution_method === 'DIY' && '🔧 DIY'}
                                {task.execution_method === 'Contractor' && '👷 Contractor'}
                                {task.execution_method === '360_Operator' && '⭐ Operator'}
                              </span>
                              {(task.estimated_hours || task.diy_time_hours) && (
                                <span>• ~{task.estimated_hours || task.diy_time_hours}h</span>
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

            {/* Calendar */}
            <div className="lg:col-span-3 order-1 lg:order-2">
              <CalendarView 
                tasks={tasksWithDates}
                onTaskClick={(task) => {
                  setSelectedTaskForPicker(task);
                  setShowQuickDatePicker(true);
                }}
                onDateClick={(date) => {/* Could add task selector modal here */}}
                onTaskDrop={handleTaskDrop}
              />
              
              {/* Workload Warning */}
              {overloadedDays.length > 0 && (
                <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-orange-900 mb-1">
                        ⚠️ Heavy Workload Days
                      </h4>
                      <div className="text-sm text-orange-800 space-y-1">
                        {overloadedDays.map(([date, hours]) => (
                          <div key={date}>
                            <strong>{format(parseISO(date), 'MMM d, yyyy')}</strong>: {hours.toFixed(1)} hours scheduled
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-orange-700 mt-2">
                        Consider spreading tasks across multiple days for better balance.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // UNSCHEDULED LIST VIEW
          sortedUnscheduledTasks.length > 0 ? (
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
                        Click any task for quick scheduling options or switch to Calendar View to drag and drop.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flat list sorted by priority */}
              {sortedUnscheduledTasks.map(task => (
                <ScheduleTaskCard
                  key={task.id}
                  task={task}
                  property={currentProperty || properties.find(p => p.id === task.property_id)}
                  onSetDate={handleSetDate}
                  onSendBack={handleSendBackToPrioritize}
                  onQuickSchedule={() => {
                    setSelectedTaskForPicker(task);
                    setShowQuickDatePicker(true);
                  }}
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

        {/* Empty State */}
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

        {/* Quick Date Picker Modal */}
        {showQuickDatePicker && selectedTaskForPicker && (
          <QuickDatePicker
            task={selectedTaskForPicker}
            onSchedule={(task, date) => {
              handleSetDate(task, date);
            }}
            onClose={() => {
              setShowQuickDatePicker(false);
              setSelectedTaskForPicker(null);
            }}
          />
        )}

        {/* Batch Scheduler Modal */}
        {showBatchScheduler && selectedTasks.length > 0 && (
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
      </div>
    </div>
  );
}