import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createPageUrl } from '@/utils';
import {
  Users,
  Building2,
  Wrench,
  HardHat,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  ArrowRight,
  RefreshCw,
  Mail,
  MessageSquare,
  Target,
  Send
} from 'lucide-react';

export default function HQDashboard() {
  // Fetch platform-wide statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['hq-stats'],
    queryFn: async () => {
      // Get user counts from 'users' table (synced from Clerk)
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get property counts
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Get operator counts
      const { count: totalOperators } = await supabase
        .from('operators')
        .select('*', { count: 'exact', head: true });

      // Get contractor counts
      const { count: totalContractors } = await supabase
        .from('contractors')
        .select('*', { count: 'exact', head: true });

      // Get new users this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: newUsersThisWeek } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Get new properties this week
      const { count: newPropertiesThisWeek } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Get active subscriptions
      const { count: activeSubscriptions } = await supabase
        .from('user_subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get monthly revenue from transactions
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      const { data: monthTransactions } = await supabase
        .from('transactions')
        .select('amount_total')
        .eq('status', 'succeeded')
        .gte('created_at', monthStart.toISOString());

      const monthlyRevenue = (monthTransactions || []).reduce(
        (sum, t) => sum + (t.amount_total || 0), 0
      ) / 100; // Convert cents to dollars

      return {
        totalUsers: totalUsers || 0,
        totalProperties: totalProperties || 0,
        totalOperators: totalOperators || 0,
        totalContractors: totalContractors || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        newPropertiesThisWeek: newPropertiesThisWeek || 0,
        activeSubscriptions: activeSubscriptions || 0,
        monthlyRevenue: monthlyRevenue || 0,
        pendingSupport: 0,
        systemHealth: 'healthy'
      };
    },
    refetchInterval: 60000 // Refresh every minute
  });

  // Fetch recent activity
  const { data: recentActivity = [] } = useQuery({
    queryKey: ['hq-recent-activity'],
    queryFn: async () => {
      // Get recent users from 'users' table
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, full_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent properties
      const { data: recentProperties } = await supabase
        .from('properties')
        .select('id, street_address, city, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const activities = [];

      recentUsers?.forEach(user => {
        activities.push({
          id: `user-${user.id}`,
          type: 'user_signup',
          message: `New user signed up: ${user.full_name || user.email}`,
          timestamp: user.created_at,
          icon: Users,
          color: 'blue'
        });
      });

      recentProperties?.forEach(prop => {
        activities.push({
          id: `prop-${prop.id}`,
          type: 'property_added',
          message: `Property added: ${prop.street_address}, ${prop.city}`,
          timestamp: prop.created_at,
          icon: Building2,
          color: 'green'
        });
      });

      return activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 10);
    }
  });

  // Fetch marketing metrics
  const { data: marketingStats = {} } = useQuery({
    queryKey: ['hq-marketing-stats'],
    queryFn: async () => {
      // Get Mailchimp contact stats
      const { data: mailchimpContacts } = await supabase
        .from('mailchimp_contacts')
        .select('status');

      const mailchimp = mailchimpContacts || [];
      const subscribedCount = mailchimp.filter(c => c.status === 'subscribed').length;
      const pendingSyncCount = mailchimp.filter(c => c.status === 'pending').length;

      // Get SMS campaign stats
      const { data: smsCampaigns } = await supabase
        .from('sms_campaigns')
        .select('status, total_sent, total_delivered');

      const sms = smsCampaigns || [];
      const activeSMSCampaigns = sms.filter(c => c.status === 'sending').length;
      const totalSMSSent = sms.reduce((sum, c) => sum + (c.total_sent || 0), 0);
      const totalSMSDelivered = sms.reduce((sum, c) => sum + (c.total_delivered || 0), 0);

      // Get lead pipeline stats
      const { data: leads } = await supabase
        .from('operator_leads')
        .select('stage');

      const leadData = leads || [];
      const newLeads = leadData.filter(l => l.stage === 'new').length;
      const quotedLeads = leadData.filter(l => l.stage === 'quoted').length;
      const wonLeads = leadData.filter(l => l.stage === 'won').length;

      return {
        emailSubscribers: subscribedCount,
        pendingSync: pendingSyncCount,
        activeSMSCampaigns,
        totalSMSSent,
        totalSMSDelivered,
        newLeads,
        quotedLeads,
        wonLeads,
        totalLeads: leadData.length
      };
    },
    refetchInterval: 60000
  });

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      purple: 'bg-purple-100 text-purple-600',
      red: 'bg-red-100 text-red-600'
    };
    return colors[color] || colors.blue;
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">HQ Dashboard</h1>
            <p className="text-gray-600">Platform overview and key metrics</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchStats()}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* System Health Banner */}
        {stats?.systemHealth === 'healthy' ? (
          <Card className="p-4 mb-6 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">All Systems Operational</p>
                <p className="text-sm text-green-600">Platform is running smoothly</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">System Alert</p>
                <p className="text-sm text-yellow-600">Some services may be degraded</p>
              </div>
            </div>
          </Card>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('HQUsers')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '-' : stats?.totalUsers?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Total Users</div>
                {stats?.newUsersThisWeek > 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.newUsersThisWeek} this week
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('HQProperties')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '-' : stats?.totalProperties?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Properties</div>
                {stats?.newPropertiesThisWeek > 0 && (
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.newPropertiesThisWeek} this week
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('HQOperators')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '-' : stats?.totalOperators?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Operators</div>
              </div>
            </div>
          </Card>

          <Card
            className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => window.location.href = createPageUrl('HQRevenue')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  ${statsLoading ? '-' : stats?.monthlyRevenue?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Monthly Revenue</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Button
            className="h-auto py-4 gap-2 bg-blue-600 hover:bg-blue-700"
            onClick={() => window.location.href = createPageUrl('HQUsers')}
          >
            <Users className="w-5 h-5" />
            Manage Users
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 gap-2"
            onClick={() => window.location.href = createPageUrl('HQOperators')}
          >
            <Wrench className="w-5 h-5" />
            View Operators
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 gap-2"
            onClick={() => window.location.href = createPageUrl('HQSupport')}
          >
            <AlertTriangle className="w-5 h-5" />
            Support Queue
            {stats?.pendingSupport > 0 && (
              <Badge className="bg-red-500 text-white ml-1">{stats.pendingSupport}</Badge>
            )}
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 gap-2"
            onClick={() => window.location.href = createPageUrl('HQReports')}
          >
            <Activity className="w-5 h-5" />
            Generate Reports
          </Button>
        </div>

        {/* Marketing Metrics */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Marketing & Sales</h2>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-blue-600"
              onClick={() => window.location.href = createPageUrl('HQCampaigns')}
            >
              View All Campaigns
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Email Subscribers */}
            <div
              className="p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => window.location.href = createPageUrl('HQMailchimp')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Email Subscribers</span>
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {marketingStats.emailSubscribers || 0}
              </div>
              {marketingStats.pendingSync > 0 && (
                <div className="text-xs text-blue-600 mt-1">
                  {marketingStats.pendingSync} pending sync
                </div>
              )}
            </div>

            {/* SMS Campaigns */}
            <div
              className="p-4 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => window.location.href = createPageUrl('HQSMSCampaigns')}
            >
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">SMS Sent</span>
              </div>
              <div className="text-2xl font-bold text-green-900">
                {marketingStats.totalSMSSent || 0}
              </div>
              {marketingStats.activeSMSCampaigns > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  {marketingStats.activeSMSCampaigns} active campaigns
                </div>
              )}
            </div>

            {/* Lead Pipeline */}
            <div
              className="p-4 bg-purple-50 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors"
              onClick={() => window.location.href = createPageUrl('HQLeads')}
            >
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Active Leads</span>
              </div>
              <div className="text-2xl font-bold text-purple-900">
                {marketingStats.totalLeads || 0}
              </div>
              <div className="text-xs text-purple-600 mt-1">
                {marketingStats.newLeads || 0} new, {marketingStats.quotedLeads || 0} quoted
              </div>
            </div>

            {/* Conversion */}
            <div
              className="p-4 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
              onClick={() => window.location.href = createPageUrl('HQLeads')}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Won Leads</span>
              </div>
              <div className="text-2xl font-bold text-orange-900">
                {marketingStats.wonLeads || 0}
              </div>
              <div className="text-xs text-orange-600 mt-1">
                {marketingStats.totalLeads > 0
                  ? `${Math.round((marketingStats.wonLeads / marketingStats.totalLeads) * 100)}% conversion`
                  : '0% conversion'}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-blue-600"
                onClick={() => window.location.href = createPageUrl('HQActivity')}
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 6).map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getColorClasses(activity.color)}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 truncate">{activity.message}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </Card>

          {/* Platform Stats */}
          <Card className="p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Platform Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Active Subscriptions</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {stats?.activeSubscriptions || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <HardHat className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Contractors</span>
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {stats?.totalContractors || 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-700">Pending Support</span>
                </div>
                <Badge className={stats?.pendingSupport > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                  {stats?.pendingSupport || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Job Queue</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = createPageUrl('AdminJobQueue')}
                >
                  View
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </HQLayout>
  );
}
