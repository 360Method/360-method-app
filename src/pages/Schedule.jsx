import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import TaskDialog from "../components/schedule/TaskDialog";
import ManualTaskForm from "../components/tasks/ManualTaskForm";

export default function Schedule() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyIdFromUrl = urlParams.get('property');
  
  const [selectedProperty, setSelectedProperty] = React.useState(propertyIdFromUrl || '');
  const [currentMonth, setCurrentMonth] = React.useState(new Date());
  const [selectedDate, setSelectedDate] = React.useState(null);
  const [showDialog, setShowDialog] = React.useState(false);
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [taskFormDate, setTaskFormDate] = React.useState(null);

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

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get tasks for current month
  const scheduledTasks = tasks.filter(t => t.scheduled_date && t.status !== 'Completed');

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

  if (showTaskForm) {
    return (
      <ManualTaskForm
        propertyId={selectedProperty}
        prefilledDate={taskFormDate}
        onComplete={() => {
          setShowTaskForm(false);
          setTaskFormDate(null);
        }}
        onCancel={() => {
          setShowTaskForm(false);
          setTaskFormDate(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ACT → Schedule</h1>
            <p className="text-gray-600 mt-1">Calendar view of all scheduled maintenance</p>
          </div>
          <Button
            onClick={() => handleAddTask()}
            className="gap-2"
            style={{ backgroundColor: '#28A745', minHeight: '48px' }}
          >
            <Plus className="w-5 h-5" />
            Schedule Task
          </Button>
        </div>

        {properties.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Select Property</label>
                  <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                    <SelectTrigger className="w-full md:w-96">
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
                <div className="flex gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">This Week</p>
                    <p className="text-2xl font-bold text-gray-900">{tasksThisWeek}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{tasksThisMonth}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Calendar */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                <div key={`empty-${i}`} className="h-24 border rounded-lg bg-gray-50" />
              ))}

              {/* Calendar days */}
              {daysInMonth.map(date => {
                const tasksForDay = getTasksForDate(date);
                const isToday = isSameDay(date, new Date());

                return (
                  <div
                    key={date.toISOString()}
                    onClick={() => handleDateClick(date)}
                    className={`h-24 border rounded-lg p-2 cursor-pointer transition-all hover:shadow-md ${
                      isToday ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {format(date, 'd')}
                    </div>
                    <div className="space-y-1">
                      {tasksForDay.slice(0, 2).map((task, idx) => (
                        <div
                          key={idx}
                          className={`text-xs p-1 rounded truncate ${
                            task.priority === 'High'
                              ? 'bg-red-100 text-red-800'
                              : task.priority === 'Medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {tasksForDay.length > 2 && (
                        <div className="text-xs text-gray-600">
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
    </div>
  );
}