import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { Contractor } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import ContractorLayout from '@/components/contractor/ContractorLayout';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  DollarSign,
  Sun,
  Moon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function ContractorSchedule() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('week'); // week or month
  const [currentDate, setCurrentDate] = useState(new Date());

  // Fetch contractor profile
  const { data: contractor } = useQuery({
    queryKey: ['contractor-profile', user?.id],
    queryFn: async () => {
      const contractors = await Contractor.filter({ user_id: user?.id });
      return contractors?.[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch scheduled jobs
  const { data: jobsData, isLoading } = useQuery({
    queryKey: ['contractor-schedule', contractor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractor_jobs')
        .select(`
          *,
          work_order:work_orders (
            id,
            title,
            priority,
            scheduled_date,
            scheduled_time,
            estimated_cost,
            estimated_hours,
            property:properties (
              street_address,
              city
            )
          )
        `)
        .eq('contractor_id', contractor?.id)
        .in('status', ['accepted', 'assigned', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!contractor?.id
  });

  // Get week dates
  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Get month dates
  const getMonthDates = () => {
    const dates = [];
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Fill in days from previous month
    const startPadding = firstDay.getDay();
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      dates.push({ date, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      dates.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Fill in days from next month
    const endPadding = 42 - dates.length;
    for (let i = 1; i <= endPadding; i++) {
      dates.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }

    return dates;
  };

  const weekDates = getWeekDates();
  const monthDates = getMonthDates();

  // Transform jobs data for calendar
  const scheduledJobs = useMemo(() => {
    if (!jobsData) return [];
    return jobsData.map(job => {
      const scheduledDate = job.work_order?.scheduled_date
        ? new Date(job.work_order.scheduled_date)
        : new Date();
      return {
        id: job.id,
        title: job.work_order?.title || 'Untitled Job',
        date: scheduledDate.toDateString(),
        time: job.work_order?.scheduled_time || 'TBD',
        duration: job.work_order?.estimated_hours
          ? `${job.work_order.estimated_hours} hr${job.work_order.estimated_hours > 1 ? 's' : ''}`
          : '2 hrs',
        address: job.work_order?.property?.street_address || 'Address TBD',
        priority: job.work_order?.priority || 'medium',
        budget: job.work_order?.estimated_cost || 0
      };
    });
  }, [jobsData]);

  const getJobsForDate = (date) => {
    return scheduledJobs.filter(job => job.date === date.toDateString());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const navigatePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate week stats
  const weekStats = {
    totalJobs: weekDates.reduce((acc, date) => acc + getJobsForDate(date).length, 0),
    totalEarnings: weekDates.reduce((acc, date) => {
      return acc + getJobsForDate(date).reduce((sum, job) => sum + job.budget, 0);
    }, 0),
    totalHours: weekDates.reduce((acc, date) => {
      return acc + getJobsForDate(date).reduce((sum, job) => {
        const hrs = parseFloat(job.duration);
        return sum + (isNaN(hrs) ? 0 : hrs);
      }, 0);
    }, 0)
  };

  if (isLoading) {
    return (
      <ContractorLayout>
        <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading schedule...</p>
          </div>
        </div>
      </ContractorLayout>
    );
  }

  return (
    <ContractorLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Schedule</h1>
            <p className="text-gray-600">View and manage your job schedule</p>
          </div>
        </div>

        {/* Week Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{weekStats.totalJobs}</div>
            <div className="text-xs text-gray-500">Jobs This Week</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-green-600">${weekStats.totalEarnings}</div>
            <div className="text-xs text-gray-500">Expected</div>
          </Card>
          <Card className="p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{weekStats.totalHours.toFixed(1)}</div>
            <div className="text-xs text-gray-500">Hours</div>
          </Card>
        </div>

        {/* View Toggle & Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={navigatePrev}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="font-semibold text-gray-900 min-w-[120px] text-center">
              {formatDate(currentDate)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={navigateNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'week' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'month' ? 'bg-white shadow text-gray-900' : 'text-gray-600'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Week View */}
        {viewMode === 'week' && (
          <div className="space-y-3">
            {weekDates.map((date, idx) => {
              const jobs = getJobsForDate(date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = date.getDate();

              return (
                <Card
                  key={idx}
                  className={`p-3 ${isToday(date) ? 'ring-2 ring-orange-500 bg-orange-50' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Date Column */}
                    <div className={`w-14 text-center flex-shrink-0 ${
                      isToday(date) ? 'text-orange-600' : 'text-gray-500'
                    }`}>
                      <div className="text-xs font-medium uppercase">{dayName}</div>
                      <div className={`text-2xl font-bold ${
                        isToday(date) ? 'text-orange-600' : 'text-gray-900'
                      }`}>{dayNum}</div>
                    </div>

                    {/* Jobs Column */}
                    <div className="flex-1 min-w-0">
                      {jobs.length === 0 ? (
                        <div className="text-sm text-gray-400 py-2">No jobs scheduled</div>
                      ) : (
                        <div className="space-y-2">
                          {jobs.map(job => (
                            <Link
                              key={job.id}
                              to={`${createPageUrl('ContractorJobDetail')}?id=${job.id}`}
                            >
                              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 -mx-2">
                                <div className={`w-1 h-10 rounded-full ${getPriorityColor(job.priority)}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-900 text-sm truncate">
                                    {job.title}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {job.time}
                                    </span>
                                    <span>•</span>
                                    <span>{job.duration}</span>
                                    <span>•</span>
                                    <span className="text-green-600 font-medium">${job.budget}</span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Month View */}
        {viewMode === 'month' && (
          <Card className="p-3">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {monthDates.map(({ date, isCurrentMonth }, idx) => {
                const jobs = getJobsForDate(date);
                const hasJobs = jobs.length > 0;

                return (
                  <div
                    key={idx}
                    className={`min-h-[60px] md:min-h-[80px] p-1 rounded-lg border ${
                      isToday(date)
                        ? 'bg-orange-50 border-orange-300'
                        : isCurrentMonth
                        ? 'bg-white border-gray-100'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className={`text-xs font-medium mb-1 ${
                      isToday(date)
                        ? 'text-orange-600'
                        : isCurrentMonth
                        ? 'text-gray-900'
                        : 'text-gray-400'
                    }`}>
                      {date.getDate()}
                    </div>

                    {hasJobs && (
                      <div className="space-y-0.5">
                        {jobs.slice(0, 2).map(job => (
                          <Link
                            key={job.id}
                            to={`${createPageUrl('ContractorJobDetail')}?id=${job.id}`}
                            className={`block text-[10px] px-1 py-0.5 rounded truncate ${
                              job.priority === 'high'
                                ? 'bg-red-100 text-red-700'
                                : job.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {job.time} {job.title}
                          </Link>
                        ))}
                        {jobs.length > 2 && (
                          <div className="text-[10px] text-gray-500 px-1">
                            +{jobs.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Low</span>
          </div>
        </div>

        {/* Availability Toggle (Future Feature Placeholder) */}
        <Card className="p-4 bg-gray-50 border-dashed">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">Set Availability</h3>
              <p className="text-sm text-gray-500">Let operators know when you're available for jobs</p>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>
        </Card>
      </div>
    </ContractorLayout>
  );
}
