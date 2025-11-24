import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon,
  List,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function CalendarView({ events, onSelectDate, onSelectEvent }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const getEventColor = (event) => {
    if (event.status === 'completed') return 'bg-green-100 text-green-700 border-green-200';
    if (event.priority === 'urgent') return 'bg-red-100 text-red-700 border-red-200';
    if (event.type === 'inspection') return 'bg-blue-100 text-blue-700 border-blue-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeMonth(-1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="font-bold text-lg text-gray-900">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => changeMonth(1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="gap-2"
          >
            <CalendarIcon className="w-4 h-4" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <Card className="p-4">
          {/* Week day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={index}
                  onClick={() => date && onSelectDate(date)}
                  disabled={!date}
                  className={`
                    aspect-square p-2 rounded-lg border-2 transition-all
                    ${!date ? 'invisible' : ''}
                    ${isToday(date) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                    ${hasEvents ? 'bg-purple-50' : 'bg-white'}
                    ${date ? 'hover:border-gray-400 cursor-pointer' : ''}
                  `}
                >
                  {date && (
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className={`text-sm font-medium ${
                        isToday(date) ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                      {hasEvents && (
                        <div className="flex gap-1 mt-1">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                event.status === 'completed' ? 'bg-green-500' :
                                event.priority === 'urgent' ? 'bg-red-500' :
                                'bg-blue-500'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedEvents.map(event => (
            <Card
              key={event.id}
              className={`p-4 cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getEventColor(event)}`}
              onClick={() => onSelectEvent(event)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {event.status === 'completed' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : event.priority === 'urgent' ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-blue-600" />
                    )}
                    <div className="font-semibold text-gray-900">{event.title}</div>
                  </div>
                  <div className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                <Badge variant="outline">
                  {event.type}
                </Badge>
              </div>
            </Card>
          ))}

          {sortedEvents.length === 0 && (
            <Card className="p-8 text-center">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <div className="font-semibold text-gray-900 mb-1">
                No Events Scheduled
              </div>
              <div className="text-sm text-gray-600">
                Schedule your first inspection or maintenance task
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}