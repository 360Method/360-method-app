import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import { useAuth } from '@/lib/AuthContext';
import { Contractor, ContractorJob, WorkOrder, Property } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import ContractorLayout from '@/components/contractor/ContractorLayout';
import {
  Wrench,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Play,
  Calendar,
  DollarSign,
  TrendingUp,
  Navigation,
  Phone,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';

export default function ContractorDashboard() {
  const { user } = useAuth();
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // Fetch contractor profile
  const { data: contractor, isLoading: contractorLoading } = useQuery({
    queryKey: ['contractor-profile', user?.id],
    queryFn: async () => {
      const contractors = await Contractor.filter({ user_id: user?.id });
      return contractors?.[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch all contractor jobs with work order details
  const { data: jobsData, isLoading: jobsLoading } = useQuery({
    queryKey: ['contractor-jobs', contractor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contractor_jobs')
        .select(`
          *,
          work_order:work_orders (
            id,
            title,
            description,
            priority,
            scheduled_date,
            scheduled_time,
            estimated_cost,
            property:properties (
              street_address,
              city,
              state,
              zip_code
            ),
            operator:operators (
              company_name
            )
          )
        `)
        .eq('contractor_id', contractor?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!contractor?.id
  });

  // Process jobs data
  const today = new Date().toISOString().split('T')[0];
  const todaysJobs = jobsData?.filter(job => {
    const jobDate = job.work_order?.scheduled_date;
    return jobDate === today && !['completed', 'cancelled'].includes(job.status);
  }).map(job => ({
    id: job.id,
    title: job.work_order?.title || 'Untitled Job',
    property_address: job.work_order?.property?.street_address || 'Address not set',
    city: job.work_order?.property?.city || '',
    due_time: job.work_order?.scheduled_time || 'TBD',
    priority: job.work_order?.priority || 'medium',
    estimated_budget: job.work_order?.estimated_cost || 0,
    status: job.status === 'accepted' ? 'ready' : job.status,
    operator_name: job.work_order?.operator?.company_name || 'Unknown Operator'
  })) || [];

  // Get active job (in_progress status)
  const activeJob = jobsData?.find(job => job.status === 'in_progress') || null;

  // Upcoming jobs (not today, not completed)
  const upcomingJobs = jobsData?.filter(job => {
    const jobDate = job.work_order?.scheduled_date;
    return jobDate && jobDate > today && !['completed', 'cancelled'].includes(job.status);
  }).slice(0, 4).map(job => {
    const jobDate = new Date(job.work_order?.scheduled_date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomarrow = jobDate.toDateString() === tomorrow.toDateString();

    return {
      id: job.id,
      title: job.work_order?.title || 'Untitled Job',
      property_address: job.work_order?.property?.street_address || 'Address not set',
      date: isTomarrow ? 'Tomorrow' : jobDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: job.work_order?.scheduled_time || 'TBD',
      estimated_budget: job.work_order?.estimated_cost || 0
    };
  }) || [];

  // Recently completed jobs
  const recentlyCompleted = jobsData?.filter(job => job.status === 'completed')
    .slice(0, 3).map(job => {
      const completedDate = job.completed_at ? new Date(job.completed_at) : null;
      const daysAgo = completedDate ? Math.floor((Date.now() - completedDate) / (1000 * 60 * 60 * 24)) : 0;

      return {
        id: job.id,
        title: job.work_order?.title || 'Untitled Job',
        property_address: job.work_order?.property?.street_address || 'Address not set',
        completed_date: daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`,
        earned: (job.time_spent_minutes || 0) / 60 * (contractor?.hourly_rate || 0),
        rating: 5 // TODO: Fetch from contractor_reviews
      };
    }) || [];

  // Calculate stats from contractor record and jobs
  const completedJobs = jobsData?.filter(j => j.status === 'completed') || [];
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const completedThisWeek = completedJobs.filter(j =>
    j.completed_at && new Date(j.completed_at) >= weekStart
  ).length;

  const stats = {
    todayEarnings: 0,
    weekEarnings: contractor?.total_earnings ? Math.round(contractor.total_earnings / 4) : 0, // Approximate weekly
    monthEarnings: contractor?.total_earnings || 0,
    completedThisWeek,
    averageRating: contractor?.rating || 0
  };

  const contractorName = contractor?.first_name || user?.first_name || 'Contractor';
  const isLoading = contractorLoading || jobsLoading;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <ContractorLayout>
        <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </ContractorLayout>
    );
  }

  return (
    <ContractorLayout activeJob={activeJob}>
      <div className="p-4 md:p-6 space-y-6">
        {/* Greeting & Stats */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {greeting}, {contractorName}!
          </h1>
          <p className="text-gray-600">
            You have {todaysJobs.length} job{todaysJobs.length !== 1 ? 's' : ''} scheduled today
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-xs">This Week</span>
            </div>
            <div className="text-xl font-bold text-gray-900">${stats.weekEarnings}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs">Completed</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.completedThisWeek} jobs</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <Star className="w-4 h-4" />
              <span className="text-xs">Rating</span>
            </div>
            <div className="text-xl font-bold text-gray-900">{stats.averageRating}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">This Month</span>
            </div>
            <div className="text-xl font-bold text-green-600">${stats.monthEarnings}</div>
          </Card>
        </div>

        {/* Priority Job (if any high priority) */}
        {todaysJobs.filter(j => j.priority === 'high').length > 0 && (
          <Card className="p-4 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
            <div className="flex items-center gap-2 text-red-700 mb-3">
              <Zap className="w-5 h-5" />
              <span className="font-semibold">Priority Job</span>
            </div>
            {todaysJobs.filter(j => j.priority === 'high').map(job => (
              <div key={job.id} className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.property_address}
                  </div>
                  <div className="flex items-center gap-1 text-gray-600 text-sm mt-1">
                    <Clock className="w-3.5 h-3.5" />
                    Due by {job.due_time}
                  </div>
                </div>
                <Link to={`${createPageUrl('ContractorJobDetail')}?id=${job.id}`}>
                  <Button className="gap-2 bg-red-600 hover:bg-red-700">
                    <Play className="w-4 h-4" />
                    Start Job
                  </Button>
                </Link>
              </div>
            ))}
          </Card>
        )}

        {/* Today's Jobs */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Today's Jobs</h2>
            <Link to={createPageUrl('ContractorJobs')} className="text-sm text-orange-600 font-medium">
              View All
            </Link>
          </div>

          {todaysJobs.length === 0 ? (
            <Card className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No jobs scheduled for today</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {todaysJobs.map(job => (
                <Link key={job.id} to={`${createPageUrl('ContractorJobDetail')}?id=${job.id}`}>
                  <Card className={`p-4 hover:shadow-md transition-shadow ${
                    job.priority === 'high' ? 'border-l-4 border-l-red-500' : ''
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <Badge className={getPriorityColor(job.priority)}>
                            {job.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.property_address}, {job.city}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {job.due_time}
                          </span>
                          <span className="font-medium text-green-600">
                            ${job.estimated_budget}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Navigation className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Phone className="w-4 h-4 text-green-600" />
                        </Button>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Jobs */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Upcoming</h2>
          <div className="space-y-2">
            {upcomingJobs.map(job => (
              <Link key={job.id} to={`${createPageUrl('ContractorJobDetail')}?id=${job.id}`}>
                <Card className="p-3 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{job.date}</span>
                        <span>•</span>
                        <span>{job.time}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">${job.estimated_budget}</div>
                      <div className="text-xs text-gray-500">{job.property_address}</div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recently Completed */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Recently Completed</h2>
          <div className="space-y-2">
            {recentlyCompleted.map(job => (
              <Card key={job.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                    </div>
                    <div className="text-sm text-gray-500 ml-6">{job.completed_date}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">+${job.earned}</div>
                    <div className="flex items-center gap-0.5 justify-end">
                      {[...Array(job.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </ContractorLayout>
  );
}
