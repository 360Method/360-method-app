import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, Operator } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import OperatorLayout from '@/components/operator/OperatorLayout';
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
  User,
  Loader2
} from 'lucide-react';

const STATUS_CONFIG = {
  'pending': { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  'pending_approval': { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  'assigned': { label: 'Assigned', color: 'bg-blue-100 text-blue-700', icon: User },
  'in_progress': { label: 'In Progress', color: 'bg-purple-100 text-purple-700', icon: Wrench },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  'invoiced': { label: 'Invoiced', color: 'bg-gray-100 text-gray-700', icon: DollarSign }
};

export default function OperatorWorkOrders() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('kanban');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch operator profile
  const { data: myOperator } = useQuery({
    queryKey: ['myOperator', user?.id],
    queryFn: async () => {
      const operators = await Operator.filter({ user_id: user?.id });
      return operators[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch work orders from database
  const { data: workOrders = [], isLoading } = useQuery({
    queryKey: ['operator-work-orders', myOperator?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          operator_clients!work_orders_client_id_fkey(contact_name, property_address),
          contractors(business_name)
        `)
        .eq('operator_id', myOperator.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match expected format
      return (data || []).map(wo => ({
        id: wo.id,
        property_address: wo.operator_clients?.property_address || wo.property_address || 'N/A',
        client_name: wo.operator_clients?.contact_name || wo.client_name || 'Unknown',
        description: wo.description || wo.title || 'Work order',
        trade: wo.trade || wo.category || 'General',
        priority: wo.priority || 'Medium',
        status: wo.status || 'pending',
        contractor_name: wo.contractors?.business_name || wo.contractor_name || null,
        estimated_cost: wo.estimated_cost || wo.amount || 0,
        days_in_status: wo.status_updated_at
          ? Math.floor((Date.now() - new Date(wo.status_updated_at)) / (1000 * 60 * 60 * 24))
          : Math.floor((Date.now() - new Date(wo.created_at)) / (1000 * 60 * 60 * 24)),
        created_date: wo.created_at
      }));
    },
    enabled: !!myOperator?.id
  });

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

  // Loading state
  if (isLoading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </OperatorLayout>
    );
  }

  return (
    <OperatorLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Work Orders</h1>
            <p className="text-gray-600">{workOrders.length} work orders</p>
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

        {/* Empty state */}
        {workOrders.length === 0 && (
          <Card className="p-12 text-center">
            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders yet</h3>
            <p className="text-gray-500 mb-4">Create your first work order to get started</p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Work Order
            </Button>
          </Card>
        )}
      </div>
    </OperatorLayout>
  );
}