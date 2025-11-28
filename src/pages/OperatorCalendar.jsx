import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  User,
  Wrench,
  ClipboardList,
  Home,
  Phone,
  MoreVertical,
  Calendar as CalendarIcon,
  List,
  Grid
} from 'lucide-react';
import OperatorLayout from '@/components/operator/OperatorLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function OperatorCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week');
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Mock events
  const events = [
    {
      id: '1',
      title: 'Quarterly Inspection',
      client_name: 'Sarah Johnson',
      property_address: '123 Oak Street',
      date: '2025-11-28',
      start_time: '09:00',
      end_time: '10:30',
      type: 'inspection',
      status: 'confirmed',
      color: 'blue'
    },
    {
      id: '2',
      title: 'Plumbing Repair',
      client_name: 'Mike Peterson',
      property_address: '456 Elm Avenue',
      date: '2025-11-28',
      start_time: '11:00',
      end_time: '13:00',
      type: 'work_order',
      status: 'confirmed',
      color: 'orange'
    },
    {
      id: '3',
      title: 'HVAC Maintenance',
      client_name: 'Lisa Chen',
      property_address: '789 Pine Road',
      date: '2025-11-28',
      start_time: '14:00',
      end_time: '15:30',
      type: 'maintenance',
      status: 'pending',
      color: 'green'
    },
    {
      id: '4',
      title: 'New Client Consultation',
      client_name: 'James Wilson',
      property_address: '555 Birch Lane',
      date: '2025-11-29',
      start_time: '10:00',
      end_time: '11:00',
      type: 'consultation',
      status: 'confirmed',
      color: 'purple'
    },
    {
      id: '5',
      title: 'Roof Inspection',
      client_name: 'David Williams',
      property_address: '321 Cedar Lane',
      date: '2025-11-29',
      start_time: '14:00',
      end_time: '16:00',
      type: 'inspection',
      status: 'confirmed',
      color: 'blue'
    },
    {
      id: '6',
      title: 'Electrical Check',
      client_name: 'Emily Rodriguez',
      property_address: '654 Maple Drive',
      date: '2025-11-30',
      start_time: '09:30',
      end_time: '11:00',
      type: 'maintenance',
      status: 'confirmed',
      color: 'green'
    }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'inspection': return <ClipboardList className="w-4 h-4" />;
      case 'work_order': return <Wrench className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'consultation': return <User className="w-4 h-4" />;
      default: return <CalendarIcon className="w-4 h-4" />;
    }
  };

  const getEventColor = (color) => {
    const colors = {
      blue: 'bg-blue-100 border-blue-300 text-blue-800',
      orange: 'bg-orange-100 border-orange-300 text-orange-800',
      green: 'bg-green-100 border-green-300 text-green-800',
      purple: 'bg-purple-100 border-purple-300 text-purple-800',
    };
    return colors[color] || colors.blue;
  };

  const getEventBgColor = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
    };
    return colors[color] || colors.blue;
  };

  // Calendar navigation
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get week dates
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(e => e.date === dateStr).sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // Format date for header
  const formatHeaderDate = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    const weekDates = getWeekDates();
    const start = weekDates[0];
    const end = weekDates[6];
    if (start.getMonth() === end.getMonth()) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const weekDates = getWeekDates();

  // Get today's events for agenda
  const todaysEvents = getEventsForDate(selectedDate);

  return (
    <OperatorLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600">Manage your schedule and appointments</p>
          </div>
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            New Appointment
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              {/* Calendar Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={goToPrevious}>
                      <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={goToNext}>
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">{formatHeaderDate()}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('week')}
                      className={`px-3 py-1.5 text-sm ${viewMode === 'week' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setViewMode('month')}
                      className={`px-3 py-1.5 text-sm ${viewMode === 'month' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                      Month
                    </button>
                  </div>
                </div>
              </div>

              {/* Week View */}
              {viewMode === 'week' && (
                <div className="p-4">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {weekDates.map((date, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedDate(date)}
                        className={`p-2 rounded-lg text-center transition-colors ${
                          isSelected(date)
                            ? 'bg-blue-600 text-white'
                            : isToday(date)
                            ? 'bg-blue-100 text-blue-700'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className={`text-lg font-bold ${isSelected(date) ? '' : isToday(date) ? 'text-blue-700' : 'text-gray-900'}`}>
                          {date.getDate()}
                        </div>
                        {getEventsForDate(date).length > 0 && !isSelected(date) && (
                          <div className="flex justify-center gap-0.5 mt-1">
                            {getEventsForDate(date).slice(0, 3).map((event, j) => (
                              <div key={j} className={`w-1.5 h-1.5 rounded-full ${getEventBgColor(event.color)}`} />
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Events for each day */}
                  <div className="grid grid-cols-7 gap-2">
                    {weekDates.map((date, i) => {
                      const dayEvents = getEventsForDate(date);
                      return (
                        <div key={i} className="min-h-[200px]">
                          {dayEvents.map(event => (
                            <div
                              key={event.id}
                              className={`p-2 mb-2 rounded-lg border-l-4 text-xs ${getEventColor(event.color)}`}
                            >
                              <div className="font-medium truncate">{event.title}</div>
                              <div className="text-xs opacity-75">{event.start_time}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Month View */}
              {viewMode === 'month' && (
                <div className="p-4">
                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {(() => {
                      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
                      const days = [];

                      // Add empty cells for days before first of month
                      for (let i = 0; i < firstDay.getDay(); i++) {
                        days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50 rounded" />);
                      }

                      // Add days of month
                      for (let d = 1; d <= lastDay.getDate(); d++) {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
                        const dayEvents = getEventsForDate(date);

                        days.push(
                          <button
                            key={d}
                            onClick={() => setSelectedDate(date)}
                            className={`h-24 p-1 rounded text-left transition-colors overflow-hidden ${
                              isSelected(date)
                                ? 'bg-blue-50 ring-2 ring-blue-500'
                                : isToday(date)
                                ? 'bg-blue-50'
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className={`text-sm font-medium mb-1 ${
                              isToday(date) ? 'text-blue-600' : 'text-gray-900'
                            }`}>
                              {d}
                            </div>
                            {dayEvents.slice(0, 2).map(event => (
                              <div
                                key={event.id}
                                className={`text-xs p-1 mb-0.5 rounded truncate ${getEventColor(event.color)}`}
                              >
                                {event.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <div className="text-xs text-gray-500 px-1">
                                +{dayEvents.length - 2} more
                              </div>
                            )}
                          </button>
                        );
                      }

                      return days;
                    })()}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Agenda / Selected Day */}
          <div className="space-y-6">
            {/* Selected Day Summary */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {todaysEvents.length} appointment{todaysEvents.length !== 1 ? 's' : ''} scheduled
              </p>

              {todaysEvents.length > 0 ? (
                <div className="space-y-3">
                  {todaysEvents.map(event => (
                    <div key={event.id} className={`p-3 rounded-lg border-l-4 bg-white shadow-sm ${
                      event.color === 'blue' ? 'border-blue-500' :
                      event.color === 'orange' ? 'border-orange-500' :
                      event.color === 'green' ? 'border-green-500' : 'border-purple-500'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getTypeIcon(event.type)}
                            <span className="font-medium text-gray-900">{event.title}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            {event.start_time} - {event.end_time}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                            <User className="w-3.5 h-3.5" />
                            {event.client_name}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="w-3.5 h-3.5" />
                            {event.property_address}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant={event.status === 'confirmed' ? 'default' : 'secondary'}>
                          {event.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-3">No appointments scheduled</p>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Appointment
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">This Week</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-sm text-gray-600">Inspections</span>
                  </div>
                  <span className="font-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm text-gray-600">Work Orders</span>
                  </div>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-gray-600">Maintenance</span>
                  </div>
                  <span className="font-medium">2</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span className="text-sm text-gray-600">Consultations</span>
                  </div>
                  <span className="font-medium">1</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </OperatorLayout>
  );
}
