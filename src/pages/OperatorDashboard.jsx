import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase, Operator, OperatorLead, OperatorClient, OperatorQuote, WorkOrder } from '@/api/supabaseClient';
import { useAuth } from '@/lib/AuthContext';
import OperatorLayout from '@/components/operator/OperatorLayout';
import StripeConnectCard from '@/components/operator/StripeConnectCard';
import OperatorOnboardingWizard from '@/components/operator/OperatorOnboardingWizard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { createPageUrl } from '@/utils';
import {
  Users,
  Target,
  Calendar,
  Wrench,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Plus,
  MessageSquare,
  ClipboardList,
  Home,
  Star,
  Activity,
  ChevronRight,
  Loader2,
  Settings,
  Sparkles
} from 'lucide-react';

// Helper function to format time ago
function formatTimeAgo(dateString) {
  if (!dateString) return 'recently';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

export default function OperatorDashboard() {
  const { user } = useAuth();

  // Fetch operator data
  const { data: operator, isLoading: operatorLoading } = useQuery({
    queryKey: ['myOperator', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Fetch real metrics
  const { data: clients = [] } = useQuery({
    queryKey: ['operator-clients', operator?.id],
    queryFn: () => OperatorClient.filter({ operator_id: operator.id }),
    enabled: !!operator?.id
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['operator-leads', operator?.id],
    queryFn: () => OperatorLead.filter({ operator_id: operator.id }),
    enabled: !!operator?.id
  });

  const { data: quotes = [] } = useQuery({
    queryKey: ['operator-quotes', operator?.id],
    queryFn: () => OperatorQuote.filter({ operator_id: operator.id }),
    enabled: !!operator?.id
  });

  const { data: workOrders = [] } = useQuery({
    queryKey: ['operator-work-orders', operator?.id],
    queryFn: async () => {
      try {
        return await WorkOrder.filter({ operator_id: operator.id });
      } catch {
        return [];
      }
    },
    enabled: !!operator?.id
  });

  // Calculate real metrics
  const activeLeads = leads.filter(l => !['won', 'lost'].includes(l.stage));
  const newLeadsThisWeek = leads.filter(l => {
    const created = new Date(l.created_at);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created >= weekAgo;
  });

  const activeClients = clients.filter(c => c.status === 'active_user' || c.status === 'registered');
  const newClientsThisMonth = clients.filter(c => {
    const created = new Date(c.created_at);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return created >= monthAgo;
  });

  const openWorkOrderCount = workOrders.filter(wo =>
    ['pending', 'assigned', 'in_progress'].includes(wo.status)
  ).length;

  const pendingQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'draft');
  const pendingQuotesTotal = pendingQuotes.reduce((sum, q) => sum + (q.total_amount || 0), 0);

  const wonQuotes = quotes.filter(q => q.status === 'approved');
  const monthlyRevenue = wonQuotes
    .filter(q => {
      const approved = new Date(q.approved_at || q.updated_at);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return approved >= monthAgo;
    })
    .reduce((sum, q) => sum + (q.total_amount || 0), 0);

  const metrics = {
    totalClients: clients.length,
    clientsChange: newClientsThisMonth.length,
    activeLeads: activeLeads.length,
    leadsChange: newLeadsThisWeek.length,
    scheduledThisWeek: 0, // TODO: Connect to calendar
    openWorkOrders: openWorkOrderCount,
    pendingInvoices: pendingQuotes.length,
    pendingAmount: pendingQuotesTotal,
    monthlyRevenue: monthlyRevenue,
    revenueChange: 0 // TODO: Calculate month-over-month
  };

  // Build recent activity from real data
  const recentActivity = [
    ...leads.slice(0, 2).map(lead => ({
      id: `lead-${lead.id}`,
      type: 'lead',
      message: `New lead: ${lead.contact_name}`,
      time: formatTimeAgo(lead.created_at),
      icon: Target,
      color: 'orange'
    })),
    ...quotes.filter(q => q.status === 'approved').slice(0, 2).map(quote => ({
      id: `quote-${quote.id}`,
      type: 'payment',
      message: `Quote approved: $${quote.total_amount?.toLocaleString()}`,
      time: formatTimeAgo(quote.approved_at || quote.updated_at),
      icon: DollarSign,
      color: 'green'
    })),
    ...clients.slice(0, 1).map(client => ({
      id: `client-${client.id}`,
      type: 'client',
      message: `Client added: ${client.contact_name}`,
      time: formatTimeAgo(client.created_at),
      icon: Users,
      color: 'blue'
    }))
  ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

  // Calculate client health from migration status
  const clientHealthOverview = [
    { status: 'Active', count: clients.filter(c => c.status === 'active_user').length, color: 'bg-green-500' },
    { status: 'Registered', count: clients.filter(c => c.status === 'registered').length, color: 'bg-blue-500' },
    { status: 'Invited', count: clients.filter(c => c.status === 'invited' || c.status === 'viewed').length, color: 'bg-yellow-500' },
    { status: 'Pending', count: clients.filter(c => c.status === 'pending').length, color: 'bg-gray-400' },
  ].filter(h => h.count > 0);

  const totalForPercent = clients.length || 1;
  clientHealthOverview.forEach(h => {
    h.percent = Math.round((h.count / totalForPercent) * 100);
  });

  // Build urgent items
  const urgentItems = [
    ...leads.filter(l => l.priority === 'hot' && l.stage === 'new').slice(0, 2).map(l => ({
      id: `hot-${l.id}`,
      type: 'lead',
      title: 'Hot lead needs follow-up',
      client: l.contact_name,
      days: 0
    })),
    ...pendingQuotes.filter(q => {
      const sent = new Date(q.sent_at || q.created_at);
      const daysSince = Math.floor((Date.now() - sent.getTime()) / (1000 * 60 * 60 * 24));
      return daysSince > 7;
    }).slice(0, 1).map(q => ({
      id: `quote-${q.id}`,
      type: 'invoice',
      title: 'Quote awaiting response',
      client: 'Client',
      days: 7
    }))
  ];

  // Today's schedule - placeholder for now
  const todaySchedule = [];

  const getTypeIcon = (type) => {
    const icons = {
      inspection: ClipboardList,
      'follow-up': MessageSquare,
      assessment: Home,
    };
    return icons[type] || ClipboardList;
  };

  const getColorClasses = (color) => {
    const colors = {
      orange: 'bg-orange-100 text-orange-600',
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      gray: 'bg-gray-100 text-gray-600',
    };
    return colors[color] || colors.gray;
  };

  // Loading state
  if (operatorLoading) {
    return (
      <OperatorLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </OperatorLayout>
    );
  }

  // No operator record yet - show onboarding wizard
  if (!operator) {
    return (
      <OperatorLayout>
        <div className="p-4 md:p-6 lg:p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Your Operator Portal!
            </h1>
            <p className="text-gray-600">
              Let's get your business set up in a few quick steps.
            </p>
          </div>

          <OperatorOnboardingWizard
            onComplete={() => window.location.reload()}
          />
        </div>
      </OperatorLayout>
    );
  }

  return (
    <OperatorLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.full_name?.split(' ')[0] || 'Operator'}
            </h1>
            <p className="text-gray-600">Here's what's happening with your territory today.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.location.href = createPageUrl('OperatorSettings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" onClick={() => window.location.href = createPageUrl('OperatorAddClient')}>
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
            <Button onClick={() => window.location.href = createPageUrl('OperatorInspection')}>
              <ClipboardList className="w-4 h-4 mr-2" />
              Start Inspection
            </Button>
          </div>
        </div>

        {/* Stripe Connect Card - Show if not fully set up */}
        {operator && (
          <div className="mb-6">
            <StripeConnectCard operatorId={operator.id} />
          </div>
        )}

        {/* Urgent Items Alert */}
        {urgentItems.length > 0 && (
          <Card className="p-4 mb-6 bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-800">Attention Required</h3>
                <div className="mt-2 space-y-2">
                  {urgentItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <span className="text-red-700">{item.title} - {item.client}</span>
                      <Badge variant="outline" className="text-red-600 border-red-300">
                        {item.days} day{item.days > 1 ? 's' : ''} {item.type === 'lead' ? 'left' : 'overdue'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('OperatorClients')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              {metrics.clientsChange > 0 && (
                <Badge className="bg-green-100 text-green-700 text-xs">
                  +{metrics.clientsChange}
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.totalClients}</div>
            <div className="text-sm text-gray-600">Total Clients</div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('OperatorLeads')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              {metrics.leadsChange > 0 && (
                <Badge className="bg-orange-100 text-orange-700 text-xs">
                  +{metrics.leadsChange} new
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.activeLeads}</div>
            <div className="text-sm text-gray-600">Active Leads</div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('OperatorCalendar')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.scheduledThisWeek}</div>
            <div className="text-sm text-gray-600">This Week</div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('OperatorWorkOrders')}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metrics.openWorkOrders}</div>
            <div className="text-sm text-gray-600">Open Work Orders</div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow col-span-2 md:col-span-1"
            onClick={() => window.location.href = createPageUrl('OperatorEarnings')}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex items-center gap-1 text-green-600 text-sm">
                <TrendingUp className="w-3 h-3" />
                {metrics.revenueChange}%
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">${metrics.monthlyRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">This Month</div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Schedule */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Today's Schedule</h2>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-blue-600"
                onClick={() => window.location.href = createPageUrl('OperatorCalendar')}
              >
                View Calendar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No appointments today</p>
                <Button variant="outline" className="mt-3">
                  Schedule Inspection
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((item, index) => {
                  const TypeIcon = getTypeIcon(item.type);
                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                        index === 0 ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'
                      }`}
                    >
                      <div className="text-center min-w-[60px]">
                        <div className={`text-sm font-bold ${index === 0 ? 'text-blue-700' : 'text-gray-900'}`}>
                          {item.time}
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        index === 0 ? 'bg-blue-100' : 'bg-gray-200'
                      }`}>
                        <TypeIcon className={`w-5 h-5 ${index === 0 ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{item.client}</span>
                          <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate">{item.property}</p>
                      </div>
                      <Button size="sm" className={index === 0 ? '' : 'bg-gray-600 hover:bg-gray-700'}>
                        {index === 0 ? 'Start Now' : 'View'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Client Health Overview */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Portfolio Health</h2>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-blue-600"
                onClick={() => window.location.href = createPageUrl('OperatorClients')}
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {clientHealthOverview.map((item) => (
                <div key={item.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{item.status}</span>
                    <span className="text-sm font-medium text-gray-900">{item.count} clients</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all`}
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Health Score</p>
                  <p className="text-2xl font-bold text-gray-900">78</p>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="#E5E7EB" strokeWidth="6" fill="none" />
                    <circle
                      cx="32" cy="32" r="28"
                      stroke="#3B82F6"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${78 * 1.76} 176`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-900">
                    78
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Badge variant="outline" className="gap-1">
                <Activity className="w-3 h-3" />
                Live
              </Badge>
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorClasses(activity.color)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Quick Actions & Pending Items */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => window.location.href = createPageUrl('OperatorAddClient')}
              >
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-sm">Add Client</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => window.location.href = createPageUrl('OperatorInspection')}
              >
                <ClipboardList className="w-5 h-5 text-green-600" />
                <span className="text-sm">Inspection</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => window.location.href = createPageUrl('OperatorInvoiceCreate')}
              >
                <DollarSign className="w-5 h-5 text-yellow-600" />
                <span className="text-sm">Invoice</span>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 flex-col gap-2"
                onClick={() => window.location.href = createPageUrl('OperatorMessages')}
              >
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <span className="text-sm">Message</span>
              </Button>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Pending Invoices</h3>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{metrics.pendingInvoices} invoices</p>
                  <p className="text-sm text-gray-600">${metrics.pendingAmount.toLocaleString()} total</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => window.location.href = createPageUrl('OperatorInvoices')}
                >
                  View All
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </OperatorLayout>
  );
}
