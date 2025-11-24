import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Wrench,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  User
} from 'lucide-react';

const STATUS_CONFIG = {
  'pending_approval': { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  'assigned': { label: 'Assigned', color: 'bg-blue-100 text-blue-700', icon: User },
  'in_progress': { label: 'In Progress', color: 'bg-purple-100 text-purple-700', icon: Wrench },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'invoiced': { label: 'Invoiced', color: 'bg-gray-100 text-gray-700', icon: DollarSign }
};

export default function OperatorWorkOrders() {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock work orders
  const workOrders = [
    {
      id: '1',
      property_address: '123 Oak St',
      client_name: 'Sarah Johnson',
      description: 'Replace HVAC filter and check thermostat',
      trade: 'HVAC',
      priority: 'Medium',
      status: 'assigned',
      contractor_name: 'ABC HVAC Services',
      estimated_cost: 150,
      days_in_status: 2,
      created_date: new Date().toISOString()
    },
    {
      id: '2',
      property_address: '456 Elm Ave',
      client_name: 'Mike Peterson',
      description: 'Fix leaking kitchen faucet',
      trade: 'Plumbing',
      priority: 'High',
      status: 'in_progress',
      contractor_name: 'QuickFix Plumbing',
      estimated_cost: 250,
      days_in_status: 1,
      created_date: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      property_address: '789 Pine Rd',
      client_name: 'Lisa Chen',
      description: 'Roof inspection and minor repair',
      trade: 'Roofing',
      priority: 'Medium',
      status: 'pending_approval',
      contractor_name: null,
      estimated_cost: 500,
      days_in_status: 3,
      created_date: new Date(Date.now() - 259200000).toISOString()
    }
  ];

  const groupedByStatus = workOrders.reduce((acc, wo) => {
    if (!acc[wo.status]) acc[wo.status] = [];
    acc[wo.status].push(wo);
    return acc;
  }, {});

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-100 text-red-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Orders</h1>
            <p className="text-gray-600">{workOrders.length} active work orders</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Work Order
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search work orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              {Object.keys(STATUS_CONFIG).map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {STATUS_CONFIG[status].label}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <div className="grid md:grid-cols-5 gap-4">
            {Object.keys(STATUS_CONFIG).map(status => {
              const config = STATUS_CONFIG[status];
              const StatusIcon = config.icon;
              const orders = groupedByStatus[status] || [];

              return (
                <div key={status} className="flex flex-col">
                  <div className={`p-3 rounded-t-lg ${config.color} font-semibold flex items-center gap-2`}>
                    <StatusIcon className="w-4 h-4" />
                    {config.label} ({orders.length})
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-b-lg p-2 space-y-2 min-h-[400px]">
                    {orders.map(wo => (
                      <Card key={wo.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-semibold text-sm text-gray-900 line-clamp-2">
                              {wo.description}
                            </div>
                            <Badge className={getPriorityColor(wo.priority)}>
                              {wo.priority}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-600">
                            {wo.property_address}
                          </div>
                          <div className="text-xs text-gray-500">
                            {wo.client_name}
                          </div>
                          {wo.contractor_name && (
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                              <User className="w-3 h-3" />
                              {wo.contractor_name}
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">{wo.days_in_status}d in status</span>
                            <span className="font-semibold text-gray-900">
                              ${wo.estimated_cost}
                            </span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {workOrders.map(wo => {
              const config = STATUS_CONFIG[wo.status];
              const StatusIcon = config.icon;

              return (
                <Card key={wo.id} className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-gray-900 mb-1">
                            {wo.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            {wo.property_address} • {wo.client_name}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(wo.priority)}>
                            {wo.priority}
                          </Badge>
                          <Badge className={config.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="font-medium">{wo.trade}</span>
                        {wo.contractor_name && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {wo.contractor_name}
                          </div>
                        )}
                        <span>${wo.estimated_cost}</span>
                        <span>{wo.days_in_status} days in status</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}