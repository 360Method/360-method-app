import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MessageSquare,
  Plus,
  Send,
  Play,
  Pause,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Ban,
  FileText,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';

export default function HQSMSCampaigns() {
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    description: '',
    message_template: '',
    audience_filter: { has_phone: true },
  });

  // Fetch campaigns
  const { data: campaigns = [], isLoading: campaignsLoading, refetch: refetchCampaigns } = useQuery({
    queryKey: ['sms-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch stats
  const { data: stats = {} } = useQuery({
    queryKey: ['sms-stats'],
    queryFn: async () => {
      const [messages, optOuts, queue] = await Promise.all([
        supabase.from('sms_messages').select('status', { count: 'exact', head: false }),
        supabase.from('sms_opt_outs').select('id', { count: 'exact', head: true }),
        supabase.from('sms_send_queue').select('status', { count: 'exact', head: false }),
      ]);

      return {
        totalSent: messages.data?.filter(m => m.status === 'sent' || m.status === 'delivered').length || 0,
        totalDelivered: messages.data?.filter(m => m.status === 'delivered').length || 0,
        totalFailed: messages.data?.filter(m => m.status === 'failed' || m.status === 'undelivered').length || 0,
        optOuts: optOuts.count || 0,
        queuePending: queue.data?.filter(q => q.status === 'pending').length || 0,
      };
    },
    refetchInterval: 30000,
  });

  // Fetch templates
  const { data: templates = [] } = useQuery({
    queryKey: ['sms-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch opt-outs
  const { data: optOuts = [] } = useQuery({
    queryKey: ['sms-opt-outs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_opt_outs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData) => {
      const { data, error } = await supabase
        .from('sms_campaigns')
        .insert(campaignData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Campaign created');
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      setShowCreateDialog(false);
      setNewCampaign({ name: '', description: '', message_template: '', audience_filter: { has_phone: true } });
    },
    onError: (error) => {
      toast.error(`Failed to create: ${error.message}`);
    }
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId) => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sendSMSCampaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ campaignId, action: 'send' }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Send failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Campaign queued: ${data.queued} messages`);
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['sms-stats'] });
    },
    onError: (error) => {
      toast.error(`Failed to send: ${error.message}`);
    }
  });

  // Process queue mutation
  const processQueueMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sendSMSCampaign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ action: 'process_queue', batchSize: 25 }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Process failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Processed: ${data.succeeded} sent, ${data.failed} failed`);
      queryClient.invalidateQueries({ queryKey: ['sms-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['sms-stats'] });
    },
    onError: (error) => {
      toast.error(`Failed to process: ${error.message}`);
    }
  });

  const getStatusBadge = (status) => {
    const styles = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      sending: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800',
      paused: 'bg-orange-100 text-orange-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const useTemplate = (template) => {
    setNewCampaign(prev => ({
      ...prev,
      message_template: template.message_template,
      name: prev.name || `Campaign: ${template.name}`,
    }));
    setShowTemplatesDialog(false);
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-purple-600" />
              SMS Campaigns
            </h1>
            <p className="text-gray-600 mt-1">
              Send and manage SMS marketing campaigns via Twilio
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => processQueueMutation.mutate()}
              disabled={processQueueMutation.isPending || stats.queuePending === 0}
            >
              {processQueueMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Process Queue ({stats.queuePending || 0})
            </Button>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Send className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalSent || 0}</p>
                  <p className="text-sm text-gray-600">Sent</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalDelivered || 0}</p>
                  <p className="text-sm text-gray-600">Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalFailed || 0}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.queuePending || 0}</p>
                  <p className="text-sm text-gray-600">In Queue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Ban className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.optOuts || 0}</p>
                  <p className="text-sm text-gray-600">Opt-outs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Campaigns
              </CardTitle>
              <Button variant="outline" size="sm" onClick={() => refetchCampaigns()}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {campaignsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : campaigns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No campaigns yet</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCreateDialog(true)}
                >
                  Create Your First Campaign
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Delivered</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {campaign.description || campaign.message_template?.slice(0, 50)}...
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(campaign.status)}>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.total_recipients || 0}</TableCell>
                        <TableCell>{campaign.total_sent || 0}</TableCell>
                        <TableCell className="text-green-600">{campaign.total_delivered || 0}</TableCell>
                        <TableCell className="text-red-600">{campaign.total_failed || 0}</TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(campaign.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {campaign.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => sendCampaignMutation.mutate(campaign.id)}
                              disabled={sendCampaignMutation.isPending}
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Send
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Opt-outs Section */}
        {optOuts.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Ban className="w-5 h-5" />
                Recent Opt-outs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Keyword</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optOuts.slice(0, 10).map((optOut) => (
                      <TableRow key={optOut.id}>
                        <TableCell className="font-mono">{optOut.phone_number}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{optOut.opt_out_method}</Badge>
                        </TableCell>
                        <TableCell>{optOut.opt_out_keyword || '-'}</TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(optOut.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Campaign Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create SMS Campaign</DialogTitle>
              <DialogDescription>
                Create a new SMS campaign to send to your audience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <Input
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., March Newsletter"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Input
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Internal notes about this campaign"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Message *
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowTemplatesDialog(true)}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Use Template
                  </Button>
                </div>
                <Textarea
                  value={newCampaign.message_template}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, message_template: e.target.value }))}
                  placeholder="Your message here. Use {{first_name}} for personalization."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {newCampaign.message_template.length}/160 characters (1 SMS segment)
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>TCPA Compliance:</strong> Always include opt-out instructions.
                  Add "Reply STOP to opt out" to your message.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createCampaignMutation.mutate(newCampaign)}
                disabled={createCampaignMutation.isPending || !newCampaign.name || !newCampaign.message_template}
              >
                {createCampaignMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Create Campaign
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Templates Dialog */}
        <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Message Templates</DialogTitle>
              <DialogDescription>
                Select a template to use for your campaign
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-4 max-h-96 overflow-y-auto">
              {templates.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No templates available</p>
              ) : (
                templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => useTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{template.name}</p>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{template.message_template}</p>
                    {template.variables?.length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {template.variables.map((v, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </HQLayout>
  );
}
