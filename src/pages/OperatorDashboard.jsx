import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import {
  Users,
  AlertCircle,
  Calendar,
  Wrench,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Plus
} from 'lucide-react';

export default function OperatorDashboard() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Mock data - replace with actual queries
  const metrics = {
    activeClients: 12,
    pendingLeads: 3,
    weekInspections: 5,
    openWorkOrders: 8,
    unpaidInvoicesTotal: 4250
  };

  const todaysSchedule = [
    { id: 1, time: '9:00 AM', client: 'Sarah Johnson', address: '123 Oak St', type: 'Quarterly Inspection' },
    { id: 2, time: '11:30 AM', client: 'Mike Peterson', address: '456 Elm Ave', type: 'Follow-up Inspection' },
    { id: 3, time: '2:00 PM', client: 'Lisa Chen', address: '789 Pine Rd', type: 'Initial Assessment' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Operator Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.full_name || 'Operator'}
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('OperatorClients')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.activeClients}</div>
                <div className="text-xs text-gray-600">Active Clients</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow relative"
            onClick={() => window.location.href = createPageUrl('OperatorLeads')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.pendingLeads}</div>
                <div className="text-xs text-gray-600">New Leads</div>
              </div>
            </div>
            {metrics.pendingLeads > 0 && (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                {metrics.pendingLeads}
              </Badge>
            )}
          </Card>

          <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('Schedule')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.weekInspections}</div>
                <div className="text-xs text-gray-600">This Week</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('OperatorWorkOrders')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{metrics.openWorkOrders}</div>
                <div className="text-xs text-gray-600">Open Work Orders</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('OperatorInvoices')}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ${metrics.unpaidInvoicesTotal.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Unpaid</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Button 
            className="h-auto py-6 gap-2"
            onClick={() => window.location.href = createPageUrl('OperatorInspection')}>
            <Calendar className="w-5 h-5" />
            Start Inspection
          </Button>
          <Button 
            variant="outline"
            className="h-auto py-6 gap-2"
            onClick={() => window.location.href = createPageUrl('OperatorInvoiceCreate')}>
            <DollarSign className="w-5 h-5" />
            Create Invoice
          </Button>
          <Button 
            variant="outline"
            className="h-auto py-6 gap-2"
            onClick={() => window.location.href = createPageUrl('OperatorWorkOrders')}>
            <Wrench className="w-5 h-5" />
            View Work Orders
          </Button>
        </div>

        {/* Today's Schedule */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => window.location.href = createPageUrl('Schedule')}>
              View Calendar
            </Button>
          </div>
          <div className="space-y-3">
            {todaysSchedule.map(item => (
              <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{item.client}</div>
                  <div className="text-sm text-gray-600">{item.address}</div>
                  <div className="text-xs text-gray-500">{item.type}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">{item.time}</div>
                  <Button size="sm" className="mt-2">
                    Start
                  </Button>
                </div>
              </div>
            ))}
            {todaysSchedule.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No scheduled activities today
              </div>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-900">Inspection completed for <strong>Sarah Johnson</strong></div>
                <div className="text-xs text-gray-500">2 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
              <DollarSign className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-900">Invoice #1234 paid by <strong>Mike Peterson</strong></div>
                <div className="text-xs text-gray-500">5 hours ago</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-900">New service request from <strong>Jennifer Davis</strong></div>
                <div className="text-xs text-gray-500">1 day ago</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}