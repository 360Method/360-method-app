import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      const taskDate = new Date(task.scheduled_date);
      return isSameDay(taskDate, date);
    } catch {
      return false;
    }
  });
}

export default function CalendarView({ tasks = [], onTaskClick, onDateClick, onTaskDrop }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [draggedTask, setDraggedTask] = useState(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const daysInCalendar = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

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
    if (draggedTask && onTaskDrop) {
      onTaskDrop(draggedTask, date);
    }
    setDraggedTask(null);
  };

  return (
    <div className="calendar-container bg-white rounded-lg border-2 border-gray-200 p-3 md:p-4">
      
      {/* HEADER: Month navigation */}
      <div className="flex items-center justify-between mb-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="flex items-center gap-1"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        
        <h2 className="text-lg md:text-2xl font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="flex items-center gap-1"
          style={{ minHeight: '44px', minWidth: '44px' }}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      
      {/* WEEKDAY HEADERS */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs md:text-sm font-semibold text-gray-600 py-2">
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>
      
      {/* CALENDAR GRID */}
      <div className="grid grid-cols-7 gap-1">
        {daysInCalendar.map((day, idx) => {
          const tasksOnDay = getTasksForDate(tasks, day);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = isSameMonth(day, currentMonth);
          
          return (
            <div
              key={idx}
              onClick={() => onDateClick && onDateClick(day)}
              onDrop={(e) => handleDrop(e, day)}
              onDragOver={handleDragOver}
              className={`
                min-h-20 md:min-h-24 border rounded p-1 md:p-2 cursor-pointer transition-all
                ${isToday ? 'bg-blue-50 border-blue-400 border-2' : 'bg-white border-gray-200'}
                ${!isCurrentMonth ? 'opacity-40' : ''}
                hover:bg-gray-50 hover:shadow-md
              `}
            >
              {/* DAY NUMBER */}
              <div className={`
                text-xs md:text-sm font-semibold mb-1
                ${isToday ? 'text-blue-600' : isCurrentMonth ? 'text-gray-700' : 'text-gray-400'}
              `}>
                {format(day, 'd')}
              </div>
              
              {/* TASKS ON THIS DAY */}
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
            </div>
          );
        })}
      </div>
      
      {/* LEGEND */}
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