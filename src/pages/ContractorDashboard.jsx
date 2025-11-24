import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import {
  Wrench,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const STATUS_CONFIG = {
  'new': { label: 'New', color: 'bg-orange-500 text-white', icon: AlertCircle },
  'accepted': { label: 'Accepted', color: 'bg-blue-500 text-white', icon: Clock },
  'in_progress': { label: 'In Progress', color: 'bg-purple-500 text-white', icon: Wrench },
  'completed': { label: 'Completed', color: 'bg-green-500 text-white', icon: CheckCircle }
};

const PRIORITY_CONFIG = {
  'High': 'bg-red-100 text-red-700 border-red-300',
  'Medium': 'bg-yellow-100 text-yellow-700 border-yellow-300',
  'Low': 'bg-blue-100 text-blue-700 border-blue-300'
};

export default function ContractorDashboard() {
  const [activeTab, setActiveTab] = useState('all');

  // Mock jobs data
  const jobs = [
    {
      id: '1',
      title: 'Gutter Repair',
      property_address: '123 Oak St',
      operator_name: 'Handy Pioneers',
      priority: 'High',
      status: 'new',
      due_date: '2025-11-30',
      estimated_budget: 350
    },
    {
      id: '2',
      title: 'Kitchen Faucet Replacement',
      property_address: '456 Elm Ave',
      operator_name: 'Property Care Pro',
      priority: 'Medium',
      status: 'accepted',
      due_date: '2025-11-28',
      estimated_budget: 180
    },
    {
      id: '3',
      title: 'HVAC Filter Service',
      property_address: '789 Pine Rd',
      operator_name: 'Handy Pioneers',
      priority: 'Medium',
      status: 'in_progress',
      due_date: '2025-11-25',
      estimated_budget: 120,
      started_at: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Exterior Paint Touch-up',
      property_address: '321 Maple Dr',
      operator_name: 'Elite Property Services',
      priority: 'Low',
      status: 'completed',
      due_date: '2025-11-20',
      estimated_budget: 450,
      completed_at: '2025-11-19'
    }
  ];

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'all') return true;
    if (activeTab === 'new') return job.status === 'new';
    if (activeTab === 'in_progress') return job.status === 'in_progress';
    if (activeTab === 'completed') return job.status === 'completed';
    return true;
  });

  const counts = {
    all: jobs.length,
    new: jobs.filter(j => j.status === 'new').length,
    in_progress: jobs.filter(j => j.status === 'in_progress').length,
    completed: jobs.filter(j => j.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <p className="text-gray-600">
          {counts.new} new • {counts.in_progress} in progress
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All' },
            { id: 'new', label: 'New' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'completed', label: 'Completed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
              style={{ minHeight: '48px' }}
            >
              {tab.label} ({counts[tab.id]})
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="p-4 space-y-3 pb-20">
        {filteredJobs.length === 0 ? (
          <Card className="p-12 text-center">
            <Wrench className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <div className="font-semibold text-gray-900 mb-2">No Jobs</div>
            <div className="text-sm text-gray-600">
              {activeTab === 'new' ? 'No new jobs available' :
               activeTab === 'in_progress' ? 'No jobs in progress' :
               activeTab === 'completed' ? 'No completed jobs' :
               'You have no assigned jobs'}
            </div>
          </Card>
        ) : (
          filteredJobs.map(job => {
            const statusConfig = STATUS_CONFIG[job.status];
            const StatusIcon = statusConfig.icon;

            return (
              <Card 
                key={job.id} 
                className={`p-5 hover:shadow-lg transition-shadow cursor-pointer ${
                  job.status === 'new' ? 'border-2 border-orange-300 bg-orange-50' : ''
                }`}
                onClick={() => window.location.href = createPageUrl('ContractorJobDetail') + '?id=' + job.id}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg mb-1">
                      {job.title}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{job.property_address}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {job.operator_name}
                    </div>
                  </div>
                  <Badge className={`${statusConfig.color} flex items-center gap-1 px-3 py-1`}>
                    <StatusIcon className="w-4 h-4" />
                    {statusConfig.label}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge className={`${PRIORITY_CONFIG[job.priority]} border-2`}>
                      {job.priority}
                    </Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Due {new Date(job.due_date).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="font-bold text-gray-900">
                    ${job.estimated_budget}
                  </div>
                </div>

                {job.status === 'new' && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button className="w-full gap-2" size="lg">
                      View Details & Accept
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}