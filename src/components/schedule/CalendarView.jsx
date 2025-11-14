import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth, addWeeks, subWeeks, startOfDay, getMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function getTaskColor(executionMethod) {
  switch(executionMethod) {
    case 'DIY': return 'bg-green-100 text-green-800 border border-green-300';
    case 'Contractor': return 'bg-gray-100 text-gray-800 border border-gray-300';
    case '360_Operator': return 'bg-blue-100 text-blue-800 border border-blue-300';
    default: return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
  }
}

function getTasksForDate(tasks, date) {
  if (!tasks) return [];
  return tasks.filter(task => {
    if (!task.scheduled_date) return false;
    try {
      const taskDate = startOfDay(new Date(task.scheduled_date));
      const compareDate = startOfDay(date);
      return isSameDay(taskDate, compareDate);
    } catch {
      return false;
    }
  });
}

function getCurrentSeason(date) {
  const month = getMonth(date);
  if (month >= 2 && month <= 4) return { name: 'Spring', emoji: '🌸', months: 'March - May' };
  if (month >= 5 && month <= 7) return { name: 'Summer', emoji: '☀️', months: 'June - August' };
  if (month >= 8 && month <= 10) return { name: 'Fall', emoji: '🍂', months: 'September - November' };
  return { name: 'Winter', emoji: '❄️', months: 'December - February' };
}

export default function CalendarView({ tasks = [], viewMode = 'month', onTaskClick, onDateClick, onTaskDrop }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);

  let daysInCalendar = [];
  let headerText = '';
  let seasonInfo = null;

  if (viewMode === 'month') {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    headerText = format(currentMonth, 'MMMM yyyy');
    seasonInfo = getCurrentSeason(currentMonth);
  } else if (viewMode === 'week') {
    const weekStart = startOfWeek(currentWeek);
    const weekEnd = endOfWeek(currentWeek);
    daysInCalendar = eachDayOfInterval({ start: weekStart, end: weekEnd });
    headerText = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    seasonInfo = getCurrentSeason(currentWeek);
  } else if (viewMode === 'season') {
    const seasonStart = startOfMonth(currentMonth);
    const seasonEnd = endOfMonth(addMonths(currentMonth, 2));
    const calendarStart = startOfWeek(seasonStart);
    const calendarEnd = endOfWeek(seasonEnd);
    daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    headerText = `${format(seasonStart, 'MMMM')} - ${format(seasonEnd, 'MMMM yyyy')}`;
    seasonInfo = getCurrentSeason(currentMonth);
  } else if (viewMode === 'day') {
    daysInCalendar = [startOfDay(currentMonth)];
    headerText = format(currentMonth, 'EEEE, MMMM d, yyyy');
    seasonInfo = getCurrentSeason(currentMonth);
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskId', task.id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, date) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    // Find task from sidebar drag or calendar drag
    let taskToMove = draggedTask;
    if (!taskToMove && taskId) {
      taskToMove = tasks.find(t => t.id === taskId);
    }
    
    if (taskToMove && onTaskDrop) {
      onTaskDrop(taskToMove, date);
    }
    setDraggedTask(null);
  };

  const handlePrev = () => {
    if (viewMode === 'month' || viewMode === 'season' || viewMode === 'day') {
      setCurrentMonth(subMonths(currentMonth, viewMode === 'season' ? 3 : 1));
    } else {
      setCurrentWeek(subWeeks(currentWeek, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month' || viewMode === 'season' || viewMode === 'day') {
      setCurrentMonth(addMonths(currentMonth, viewMode === 'season' ? 3 : 1));
    } else {
      setCurrentWeek(addWeeks(currentWeek, 1));
    }
  };

  if (viewMode === 'day') {
    const dayToShow = startOfDay(currentMonth);
    const tasksOnDay = getTasksForDate(tasks, dayToShow);
    
    // Group by time range
    const timeRanges = [
      { label: 'Morning', emoji: '🌅', hours: '6am - 12pm', tasks: tasksOnDay.filter(t => !t.time_range || t.time_range === 'morning') },
      { label: 'Afternoon', emoji: '☀️', hours: '12pm - 6pm', tasks: tasksOnDay.filter(t => t.time_range === 'afternoon') },
      { label: 'Evening', emoji: '🌙', hours: '6pm - 12am', tasks: tasksOnDay.filter(t => t.time_range === 'evening') }
    ];

    return (
      <div className="calendar-container bg-white rounded-lg border-2 border-gray-200 p-3 md:p-4">
        <div className="flex items-center justify-between mb-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            className="flex items-center gap-1"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </Button>
          
          <div className="text-center">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900">{headerText}</h2>
            {seasonInfo && (
              <Badge variant="outline" className="mt-1">
                {seasonInfo.emoji} {seasonInfo.name} ({seasonInfo.months})
              </Badge>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            className="flex items-center gap-1"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {timeRanges.map(range => (
            <div key={range.label} className="border-2 border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                  <span>{range.emoji}</span>
                  {range.label}
                </h3>
                <span className="text-sm text-gray-600">{range.hours}</span>
              </div>

              {range.tasks.length > 0 ? (
                <div className="space-y-2">
                  {range.tasks.map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      onClick={() => onTaskClick && onTaskClick(task)}
                      className={`p-3 rounded-lg cursor-pointer ${getTaskColor(task.execution_method)} hover:opacity-80 transition-all`}
                    >
                      <div className="font-semibold mb-1">{task.title}</div>
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        {task.estimated_hours && (
                          <span>⏱️ {task.estimated_hours}h</span>
                        )}
                        {task.current_fix_cost > 0 && (
                          <span>💰 ${task.current_fix_cost}</span>
                        )}
                        {task.priority && (
                          <Badge className="text-xs">{task.priority}</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No tasks scheduled for {range.label.toLowerCase()}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container bg-white rounded-lg border-2 border-gray-200 p-3 md:p-4">
      
      <div className="flex items-center justify-between mb-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrev}
          className="flex items-center gap-1"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        
        <div className="text-center">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900">{headerText}</h2>
          {seasonInfo && (
            <Badge variant="outline" className="mt-1">
              {seasonInfo.emoji} {seasonInfo.name} ({seasonInfo.months})
            </Badge>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          className="flex items-center gap-1"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs md:text-sm font-semibold text-gray-600 py-2">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {daysInCalendar.map((day, idx) => {
          const tasksOnDay = getTasksForDate(tasks, day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = viewMode === 'week' || isSameMonth(day, currentMonth);
          
          const totalHours = tasksOnDay.reduce((sum, t) => sum + (t.estimated_hours || t.diy_time_hours || 0), 0);
          const availableHours = 8 - totalHours;
          
          return (
            <div
              key={idx}
              onClick={() => onDateClick && onDateClick(day, tasksOnDay)}
              onDrop={(e) => handleDrop(e, day)}
              onDragOver={handleDragOver}
              className={`
                min-h-20 md:min-h-28 border rounded p-1 md:p-2 cursor-pointer transition-all
                ${isToday ? 'bg-blue-50 border-blue-400 border-2' : 'bg-white border-gray-200'}
                ${!isCurrentMonth ? 'opacity-40' : ''}
                hover:bg-gray-50 hover:shadow-md
              `}
            >
              <div className={`
                text-xs md:text-sm font-semibold mb-1
                ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}
              `}>
                {format(day, 'd')}
              </div>
              
              <div className="space-y-1">
                {tasksOnDay.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick && onTaskClick(task);
                    }}
                    className={`
                      text-xs p-1 rounded truncate cursor-move
                      ${getTaskColor(task.execution_method)}
                      hover:opacity-80 transition-opacity
                    `}
                    title={task.title}
                  >
                    {task.title}
                  </div>
                ))}
                
                {tasksOnDay.length > 3 && (
                  <div className="text-xs text-gray-500 font-semibold text-center">
                    +{tasksOnDay.length - 3}
                  </div>
                )}
              </div>
              
              {isCurrentMonth && totalHours > 0 && (
                <div className="text-xs mt-1 font-semibold">
                  {availableHours > 0 ? (
                    <span className="text-green-600">
                      ✓ {availableHours.toFixed(1)}h left
                    </span>
                  ) : (
                    <span className="text-red-600">
                      ⚠️ Overloaded
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gray-200 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
          <span className="text-gray-700">DIY</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-gray-100 border border-gray-300"></div>
          <span className="text-gray-700">Contractor</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-blue-100 border border-blue-300"></div>
          <span className="text-gray-700">360° Operator</span>
        </div>
      </div>
    </div>
  );
}