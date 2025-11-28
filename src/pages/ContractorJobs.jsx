import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { createPageUrl } from '@/utils';
import ContractorLayout from '@/components/contractor/ContractorLayout';
import {
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Timer
} from 'lucide-react';

export default function ContractorJobs() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filters = [
    { id: 'all', label: 'All Jobs', count: 12 },
    { id: 'today', label: 'Today', count: 2 },
    { id: 'upcoming', label: 'Upcoming', count: 4 },
    { id: 'in_progress', label: 'In Progress', count: 1 },
    { id: 'completed', label: 'Completed', count: 5 }
  ];

  const jobs = [
    {
      id: '1',
      title: 'Gutter Repair & Cleaning',
      property_address: '123 Oak Street',
      city: 'Portland',
      state: 'OR',
      scheduled_date: 'Today',
      scheduled_time: '9:00 AM',
      priority: 'high',
      status: 'ready',
      estimated_budget: 350,
      operator_name: 'Handy Pioneers',
      owner_name: 'Sarah Johnson',
      description: 'Clean gutters and repair damaged section near garage'
    },
    {
      id: '2',
      title: 'Kitchen Faucet Replacement',
      property_address: '456 Elm Avenue',
      city: 'Portland',
      state: 'OR',
      scheduled_date: 'Today',
      scheduled_time: '2:00 PM',
      priority: 'medium',
      status: 'ready',
      estimated_budget: 180,
      operator_name: 'Handy Pioneers',
      owner_name: 'Mike Chen',
      description: 'Replace kitchen faucet with new Moen fixture'
    },
    {
      id: '3',
      title: 'HVAC Filter Service',
      property_address: '789 Pine Road',
      city: 'Beaverton',
      state: 'OR',
      scheduled_date: 'Tomorrow',
      scheduled_time: '9:00 AM',
      priority: 'low',
      status: 'scheduled',
      estimated_budget: 120,
      operator_name: 'Handy Pioneers',
      owner_name: 'Lisa Park',
      description: 'Replace HVAC filters and inspect system'
    },
    {
      id: '4',
      title: 'Exterior Caulking',
      property_address: '321 Maple Drive',
      city: 'Lake Oswego',
      state: 'OR',
      scheduled_date: 'Wed, Dec 4',
      scheduled_time: '10:00 AM',
      priority: 'medium',
      status: 'scheduled',
      estimated_budget: 200,
      operator_name: 'Handy Pioneers',
      owner_name: 'Tom Williams',
      description: 'Re-caulk windows and door frames'
    },
    {
      id: 'active',
      title: 'Water Heater Inspection',
      property_address: '999 Cedar Lane',
      city: 'Portland',
      state: 'OR',
      scheduled_date: 'Today',
      scheduled_time: '11:00 AM',
      priority: 'high',
      status: 'in_progress',
      estimated_budget: 150,
      operator_name: 'Handy Pioneers',
      owner_name: 'Amy Davis',
      description: 'Annual water heater inspection and flush',
      elapsed_time: '01:23:45'
    },
    {
      id: '5',
      title: 'Exterior Paint Touch-up',
      property_address: '555 Cedar Lane',
      city: 'Portland',
      state: 'OR',
      scheduled_date: 'Yesterday',
      scheduled_time: '10:00 AM',
      priority: 'low',
      status: 'completed',
      estimated_budget: 450,
      actual_earned: 450,
      operator_name: 'Handy Pioneers',
      owner_name: 'James Wilson',
      description: 'Touch up exterior paint on trim and fascia',
      rating: 5
    },
    {
      id: '6',
      title: 'Toilet Repair',
      property_address: '777 Birch Blvd',
      city: 'Tigard',
      state: 'OR',
      scheduled_date: '2 days ago',
      scheduled_time: '1:00 PM',
      priority: 'high',
      status: 'completed',
      estimated_budget: 150,
      actual_earned: 150,
      operator_name: 'Handy Pioneers',
      owner_name: 'Karen Brown',
      description: 'Fix running toilet and replace flapper',
      rating: 5
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ready':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Ready</Badge>;
      case 'scheduled':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Scheduled</Badge>;
      case 'in_progress':
        return <Badge className="bg-green-100 text-green-700 border-green-200">In Progress</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Completed</Badge>;
      case 'pending_review':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending Review</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="text-red-600 border-red-300">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-blue-600 border-blue-300">Low</Badge>;
      default:
        return null;
    }
  };

  const filteredJobs = jobs.filter(job => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'today') return job.scheduled_date === 'Today';
    if (activeFilter === 'upcoming') return ['Tomorrow', 'Wed, Dec 4', 'Thu, Dec 5'].includes(job.scheduled_date);
    if (activeFilter === 'in_progress') return job.status === 'in_progress';
    if (activeFilter === 'completed') return job.status === 'completed';
    return true;
  }).filter(job => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      job.title.toLowerCase().includes(query) ||
      job.property_address.toLowerCase().includes(query) ||
      job.owner_name.toLowerCase().includes(query)
    );
  });

  return (
    <ContractorLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
          <p className="text-gray-600">Manage and track all your assigned jobs</p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
          {filters.map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.id
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                activeFilter === filter.id ? 'bg-orange-200' : 'bg-gray-200'
              }`}>
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Jobs List */}
        <div className="space-y-3">
          {filteredJobs.map(job => (
            <Link
              key={job.id}
              to={job.status === 'in_progress'
                ? `${createPageUrl('ContractorJobActive')}?id=${job.id}`
                : `${createPageUrl('ContractorJobDetail')}?id=${job.id}`
              }
            >
              <Card className={`p-4 hover:shadow-md transition-shadow ${
                job.status === 'in_progress' ? 'border-green-300 bg-green-50' : ''
              } ${job.priority === 'high' && job.status !== 'completed' ? 'border-l-4 border-l-red-500' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Title & Status */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      {getStatusBadge(job.status)}
                      {job.status !== 'completed' && getPriorityBadge(job.priority)}
                    </div>

                    {/* Active Job Timer */}
                    {job.status === 'in_progress' && (
                      <div className="flex items-center gap-2 mb-2 text-green-700 font-medium">
                        <Timer className="w-4 h-4 animate-pulse" />
                        <span>{job.elapsed_time}</span>
                        <span className="text-green-600 text-sm">Timer Running</span>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{job.property_address}, {job.city}</span>
                    </div>

                    {/* Schedule & Budget */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {job.scheduled_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {job.scheduled_time}
                      </span>
                      {job.status === 'completed' ? (
                        <span className="font-medium text-green-600">
                          +${job.actual_earned}
                        </span>
                      ) : (
                        <span className="font-medium text-green-600">
                          ${job.estimated_budget}
                        </span>
                      )}
                    </div>

                    {/* Rating for completed jobs */}
                    {job.status === 'completed' && job.rating && (
                      <div className="flex items-center gap-1 mt-2">
                        {[...Array(job.rating)].map((_, i) => (
                          <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="text-sm text-gray-500 ml-1">from {job.owner_name}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center gap-2">
                    {job.status === 'ready' && (
                      <Button size="sm" className="bg-orange-500 hover:bg-orange-600 gap-1">
                        <Play className="w-3.5 h-3.5" />
                        Start
                      </Button>
                    )}
                    {job.status === 'in_progress' && (
                      <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-300">
                        <Pause className="w-3.5 h-3.5" />
                        View
                      </Button>
                    )}
                    {job.status === 'scheduled' && (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                    {job.status === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No jobs found matching your criteria</p>
          </Card>
        )}
      </div>
    </ContractorLayout>
  );
}
