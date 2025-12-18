import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  MessageSquare,
  Send,
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  BarChart3,
  ArrowUpRight,
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function HQCampaigns() {
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch SMS campaigns
  const { data: smsCampaigns = [], isLoading: smsLoading, refetch: refetchSMS } = useQuery({
    queryKey: ['sms-campaigns-summary'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch SMS stats
  const { data: smsStats = {} } = useQuery({
    queryKey: ['sms-stats'],
    queryFn: async () => {
      const [campaignsResult, messagesResult, optOutsResult] = await Promise.all([
        supabase.from('sms_campaigns').select('id, status', { count: 'exact' }),
        supabase.from('sms_messages').select('status', { count: 'exact' }),
        supabase.from('sms_opt_outs').select('id', { count: 'exact' })
      ]);

      const campaigns = campaignsResult.data || [];
      const messages = messagesResult.data || [];

      return {
        totalCampaigns: campaigns.length,
        activeCampaigns: campaigns.filter(c => c.status === 'sending').length,
        completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
        totalMessages: messages.length,
        deliveredMessages: messages.filter(m => m.status === 'delivered').length,
        failedMessages: messages.filter(m => m.status === 'failed').length,
        optOuts: optOutsResult.count || 0
      };
    }
  });

  // Fetch Mailchimp sync stats
  const { data: mailchimpStats = {} } = useQuery({
    queryKey: ['mailchimp-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mailchimp_contacts')
        .select('status', { count: 'exact' });

      if (error) throw error;

      const contacts = data || [];
      return {
        total: contacts.length,
        subscribed: contacts.filter(c => c.status === 'subscribed').length,
        unsubscribed: contacts.filter(c => c.status === 'unsubscribed').length,
        pending: contacts.filter(c => c.status === 'pending').length
      };
    }
  });

  // Fetch recent Mailchimp events
  const { data: mailchimpEvents = [] } = useQuery({
    queryKey: ['mailchimp-events-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mailchimp_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary', icon: Clock },
      scheduled: { label: 'Scheduled', variant: 'outline', icon: Calendar },
      sending: { label: 'Sending', variant: 'default', icon: Send },
      completed: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
      failed: { label: 'Failed', variant: 'destructive', icon: XCircle },
      cancelled: { label: 'Cancelled', variant: 'secondary', icon: XCircle }
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isLoading = smsLoading;

  return (
    <HQLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Marketing Campaigns</h1>
            <p className="text-gray-600 mt-1">Overview of all email and SMS marketing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetchSMS()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Link to={createPageUrl('HQSMSCampaigns')}>
              <Button>
                <MessageSquare className="w-4 h-4 mr-2" />
                Create SMS Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Email Subscribers</p>
                  <p className="text-2xl font-bold text-gray-900">{mailchimpStats.subscribed || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {mailchimpStats.pending || 0} pending sync
                  </p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">SMS Campaigns</p>
                  <p className="text-2xl font-bold text-gray-900">{smsStats.totalCampaigns || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {smsStats.activeCampaigns || 0} active
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">SMS Delivered</p>
                  <p className="text-2xl font-bold text-gray-900">{smsStats.deliveredMessages || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {smsStats.totalMessages || 0} total sent
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">SMS Opt-Outs</p>
                  <p className="text-2xl font-bold text-gray-900">{smsStats.optOuts || 0}</p>
                  <p className="text-xs text-red-500 mt-1">
                    {smsStats.failedMessages || 0} failed messages
                  </p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sms">SMS Campaigns</TabsTrigger>
            <TabsTrigger value="email">Email (Mailchimp)</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent SMS Campaigns */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Recent SMS Campaigns</CardTitle>
                  <Link to={createPageUrl('HQSMSCampaigns')}>
                    <Button variant="ghost" size="sm">
                      View All <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : smsCampaigns.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No SMS campaigns yet</p>
                      <Link to={createPageUrl('HQSMSCampaigns')}>
                        <Button variant="link" className="mt-2">Create your first campaign</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {smsCampaigns.slice(0, 5).map((campaign) => (
                        <div
                          key={campaign.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{campaign.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatDate(campaign.created_at)} • {campaign.total_sent || 0} sent
                            </p>
                          </div>
                          {getStatusBadge(campaign.status)}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Email Sync Status */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-semibold">Email Sync Status</CardTitle>
                  <Link to={createPageUrl('HQMailchimp')}>
                    <Button variant="ghost" size="sm">
                      Manage <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-700">{mailchimpStats.subscribed || 0}</p>
                      <p className="text-sm text-green-600">Subscribed</p>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-700">{mailchimpStats.pending || 0}</p>
                      <p className="text-sm text-yellow-600">Pending Sync</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-700">{mailchimpStats.unsubscribed || 0}</p>
                      <p className="text-sm text-red-600">Unsubscribed</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-700">{mailchimpStats.total || 0}</p>
                      <p className="text-sm text-blue-600">Total Contacts</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-500 mb-2">Recent Events</p>
                    {mailchimpEvents.length === 0 ? (
                      <p className="text-sm text-gray-400">No recent events</p>
                    ) : (
                      <div className="space-y-2">
                        {mailchimpEvents.slice(0, 3).map((event) => (
                          <div key={event.id} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs">
                              {event.event_type}
                            </Badge>
                            <span className="text-gray-600 truncate">{event.email}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link to={createPageUrl('HQSMSCampaigns')}>
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                      <MessageSquare className="w-6 h-6 text-green-600" />
                      <span>New SMS Campaign</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl('HQMailchimp')}>
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                      <Mail className="w-6 h-6 text-blue-600" />
                      <span>Sync Contacts</span>
                    </Button>
                  </Link>
                  <Link to={createPageUrl('HQLeads')}>
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                      <Users className="w-6 h-6 text-purple-600" />
                      <span>View Leads</span>
                    </Button>
                  </Link>
                  <a
                    href="https://mailchimp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="outline" className="w-full h-auto py-4 flex-col gap-2">
                      <ExternalLink className="w-6 h-6 text-orange-600" />
                      <span>Open Mailchimp</span>
                    </Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sms" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>All SMS Campaigns</CardTitle>
                <Link to={createPageUrl('HQSMSCampaigns')}>
                  <Button>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Go to SMS Manager
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {smsCampaigns.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No SMS campaigns yet</p>
                    <p className="text-sm">Create your first SMS campaign to engage your audience</p>
                    <Link to={createPageUrl('HQSMSCampaigns')}>
                      <Button className="mt-4">Create Campaign</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Campaign</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sent</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Delivered</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Failed</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {smsCampaigns.map((campaign) => (
                          <tr key={campaign.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{campaign.name}</p>
                                {campaign.description && (
                                  <p className="text-sm text-gray-500 truncate max-w-xs">
                                    {campaign.description}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(campaign.status)}</td>
                            <td className="py-3 px-4 text-gray-600">{campaign.total_sent || 0}</td>
                            <td className="py-3 px-4 text-green-600">{campaign.total_delivered || 0}</td>
                            <td className="py-3 px-4 text-red-600">{campaign.total_failed || 0}</td>
                            <td className="py-3 px-4 text-gray-500">{formatDate(campaign.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Email Marketing (Mailchimp)</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Contacts are synced to Mailchimp. Manage campaigns directly in Mailchimp.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link to={createPageUrl('HQMailchimp')}>
                    <Button variant="outline">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync Manager
                    </Button>
                  </Link>
                  <a
                    href="https://mailchimp.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Mailchimp
                    </Button>
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Contact Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Total Contacts</span>
                        <span className="font-semibold">{mailchimpStats.total || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700">Subscribed</span>
                        <span className="font-semibold text-green-700">{mailchimpStats.subscribed || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-yellow-700">Pending Sync</span>
                        <span className="font-semibold text-yellow-700">{mailchimpStats.pending || 0}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-red-700">Unsubscribed</span>
                        <span className="font-semibold text-red-700">{mailchimpStats.unsubscribed || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <h3 className="font-medium text-gray-900">Recent Mailchimp Events</h3>
                    {mailchimpEvents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                        <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No events recorded yet</p>
                        <p className="text-sm">Events will appear here as subscribers interact with your emails</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {mailchimpEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <Badge variant="outline">{event.event_type}</Badge>
                            <span className="text-gray-600 truncate flex-1">{event.email}</span>
                            <span className="text-sm text-gray-400">
                              {formatDate(event.created_at)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Managing Email Campaigns</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Email campaigns are created and managed directly in Mailchimp.
                        We sync your contacts automatically when users sign up.
                        Click "Open Mailchimp" to create and send campaigns.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HQLayout>
  );
}
