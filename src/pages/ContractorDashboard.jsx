import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
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
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';

  // Mock data
  const contractorName = 'John';
  const activeJob = null; // Set to job object if there's an active timer

  const todaysJobs = [
    {
      id: '1',
      title: 'Gutter Repair',
      property_address: '123 Oak Street',
      city: 'Portland',
      due_time: '9:00 AM',
      priority: 'high',
      estimated_budget: 350,
      status: 'ready',
      operator_name: 'Handy Pioneers'
    },
    {
      id: '2',
      title: 'Kitchen Faucet Replacement',
      property_address: '456 Elm Avenue',
      city: 'Portland',
      due_time: '2:00 PM',
      priority: 'medium',
      estimated_budget: 180,
      status: 'ready',
      operator_name: 'Handy Pioneers'
    }
  ];

  const upcomingJobs = [
    {
      id: '3',
      title: 'HVAC Filter Service',
      property_address: '789 Pine Road',
      date: 'Tomorrow',
      time: '9:00 AM',
      estimated_budget: 120
    },
    {
      id: '4',
      title: 'Exterior Caulking',
      property_address: '321 Maple Drive',
      date: 'Wed, Dec 4',
      time: '10:00 AM',
      estimated_budget: 200
    }
  ];

  const recentlyCompleted = [
    {
      id: '5',
      title: 'Exterior Paint Touch-up',
      property_address: '555 Cedar Lane',
      completed_date: 'Yesterday',
      earned: 450,
      rating: 5
    },
    {
      id: '6',
      title: 'Toilet Repair',
      property_address: '777 Birch Blvd',
      completed_date: '2 days ago',
      earned: 150,
      rating: 5
    }
  ];

  const stats = {
    todayEarnings: 0,
    weekEarnings: 600,
    monthEarnings: 3200,
    completedThisWeek: 4,
    averageRating: 4.9
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

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
