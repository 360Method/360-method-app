import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, ChevronRight as GoIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function MiniCalendar({ tasks = [], properties = [] }) {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and total days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  // Filter tasks for current month with scheduled dates
  const monthTasks = tasks.filter(task => {
    if (!task.scheduled_date) return false;
    const taskDate = new Date(task.scheduled_date);
    return taskDate.getMonth() === month && taskDate.getFullYear() === year;
  });

  // Group tasks by date
  const tasksByDate = monthTasks.reduce((acc, task) => {
    const day = new Date(task.scheduled_date).getDate();
    if (!acc[day]) acc[day] = [];
    acc[day].push(task);
    return acc;
  }, {});

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Calculate days array
  const days = [];
  
  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push({ day: null, tasks: [] });
  }
  
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push({ 
      day, 
      tasks: tasksByDate[day] || [],
      isToday: isCurrentMonth && day === today.getDate()
    });
  }

  // Get priority color
  const getPriorityColor = (task) => {
    if (task.cascade_risk_score >= 7 || task.priority === 'High') return 'bg-red-500';
    if (task.priority === 'Medium') return 'bg-orange-500';
    return 'bg-blue-500';
  };

  return (
    <Card className="border-none shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2" style={{ color: '#1B365D', fontSize: '16px' }}>
            <Calendar className="w-4 h-4" />
            Schedule
          </CardTitle>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <Link to={createPageUrl("Schedule")}>
              View All
              <GoIcon className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-center">
            <h3 className="font-bold text-sm" style={{ color: '#1B365D' }}>
              {monthNames[month]} {year}
            </h3>
            {!isCurrentMonth && (
              <button
                onClick={goToToday}
                className="text-xs text-blue-600 hover:underline"
              >
                Go to today
              </button>
            )}
          </div>
          <button
            onClick={goToNextMonth}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(name => (
            <div key={name} className="text-center text-xs font-semibold text-gray-600 py-1">
              {name[0]}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((dayData, idx) => {
            if (dayData.day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" />;
            }

            const hasHighPriority = dayData.tasks.some(t => 
              t.cascade_risk_score >= 7 || t.priority === 'High'
            );

            return (
              <div
                key={dayData.day}
                className={`aspect-square p-1 text-center rounded-lg transition-all cursor-pointer relative group ${
                  dayData.isToday 
                    ? 'bg-blue-600 text-white font-bold' 
                    : dayData.tasks.length > 0
                    ? 'bg-gray-100 hover:bg-gray-200'
                    : 'hover:bg-gray-50'
                }`}
                title={dayData.tasks.length > 0 ? `${dayData.tasks.length} task${dayData.tasks.length > 1 ? 's' : ''}` : ''}
              >
                <span className={`text-xs ${dayData.isToday ? 'text-white' : 'text-gray-900'}`}>
                  {dayData.day}
                </span>
                
                {/* Task Indicators */}
                {dayData.tasks.length > 0 && (
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                    {dayData.tasks.slice(0, 3).map((task, i) => (
                      <div
                        key={i}
                        className={`w-1 h-1 rounded-full ${
                          dayData.isToday ? 'bg-white' : getPriorityColor(task)
                        }`}
                      />
                    ))}
                    {dayData.tasks.length > 3 && (
                      <div className={`w-1 h-1 rounded-full ${
                        dayData.isToday ? 'bg-white' : 'bg-gray-400'
                      }`} />
                    )}
                  </div>
                )}

                {/* Hover Tooltip */}
                {dayData.tasks.length > 0 && (
                  <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
                    <div className="space-y-1">
                      {dayData.tasks.slice(0, 3).map((task, i) => (
                        <div key={i} className="truncate">
                          • {task.title}
                        </div>
                      ))}
                      {dayData.tasks.length > 3 && (
                        <div className="text-gray-400">
                          +{dayData.tasks.length - 3} more
                        </div>
                      )}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900" />
                    </div>
                  </div>
                )}

                {/* High Priority Badge */}
                {hasHighPriority && !dayData.isToday && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-600 rounded-full border border-white" />
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-600">High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-gray-600">Med</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-gray-600">Low</span>
          </div>
        </div>

        {/* Summary */}
        {monthTasks.length > 0 && (
          <div className="mt-3 p-2 bg-blue-50 rounded-lg text-center">
            <p className="text-xs font-semibold text-blue-900">
              {monthTasks.length} task{monthTasks.length > 1 ? 's' : ''} scheduled this month
            </p>
          </div>
        )}

        {monthTasks.length === 0 && (
          <div className="mt-3 p-2 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-600">
              No tasks scheduled for {monthNames[month]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}