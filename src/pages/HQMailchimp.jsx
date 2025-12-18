import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Mail,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Send,
  Users,
  TrendingUp,
  Settings,
  Play,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function HQMailchimp() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [listId, setListId] = useState('');

  // Fetch sync stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ['mailchimp-stats'],
    queryFn: async () => {
      const [contacts, queue, events] = await Promise.all([
        supabase.from('mailchimp_contacts').select('status', { count: 'exact', head: false }),
        supabase.from('mailchimp_sync_queue').select('status', { count: 'exact', head: false }),
        supabase.from('mailchimp_events').select('event_type, processed', { count: 'exact', head: false }),
      ]);

      // Count by status
      const contactStats = {
        total: contacts.data?.length || 0,
        subscribed: contacts.data?.filter(c => c.status === 'subscribed').length || 0,
        unsubscribed: contacts.data?.filter(c => c.status === 'unsubscribed').length || 0,
        pending: contacts.data?.filter(c => c.status === 'pending').length || 0,
        failed: contacts.data?.filter(c => c.status === 'failed').length || 0,
      };

      const queueStats = {
        total: queue.data?.length || 0,
        pending: queue.data?.filter(q => q.status === 'pending').length || 0,
        processing: queue.data?.filter(q => q.status === 'processing').length || 0,
        completed: queue.data?.filter(q => q.status === 'completed').length || 0,
        failed: queue.data?.filter(q => q.status === 'failed').length || 0,
      };

      const eventStats = {
        total: events.data?.length || 0,
        unprocessed: events.data?.filter(e => !e.processed).length || 0,
      };

      return { contacts: contactStats, queue: queueStats, events: eventStats };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch contacts
  const { data: contacts = [], isLoading: contactsLoading, refetch: refetchContacts } = useQuery({
    queryKey: ['mailchimp-contacts', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('mailchimp_contacts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch pending queue items
  const { data: queueItems = [], isLoading: queueLoading } = useQuery({
    queryKey: ['mailchimp-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mailchimp_sync_queue')
        .select('*')
        .in('status', ['pending', 'processing', 'failed'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch recent events
  const { data: recentEvents = [] } = useQuery({
    queryKey: ['mailchimp-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mailchimp_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    }
  });

  // Fetch platform settings
  const { data: settings = {} } = useQuery({
    queryKey: ['platform-settings-mailchimp'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('key, value')
        .in('key', ['mailchimp_enabled', 'mailchimp_default_list_id']);

      if (error) throw error;
      const settingsMap = {};
      data?.forEach(s => settingsMap[s.key] = s.value);
      return settingsMap;
    }
  });

  // Trigger batch sync mutation
  const batchSyncMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/batchSyncMailchimp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ batchSize: 50 }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Sync failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Sync complete: ${data.succeeded} succeeded, ${data.failed} failed`);
      queryClient.invalidateQueries({ queryKey: ['mailchimp-stats'] });
      queryClient.invalidateQueries({ queryKey: ['mailchimp-contacts'] });
      queryClient.invalidateQueries({ queryKey: ['mailchimp-queue'] });
    },
    onError: (error) => {
      toast.error(`Sync failed: ${error.message}`);
    }
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (newListId) => {
      const { error } = await supabase
        .from('platform_settings')
        .update({ value: newListId })
        .eq('key', 'mailchimp_default_list_id');

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Settings saved');
      queryClient.invalidateQueries({ queryKey: ['platform-settings-mailchimp'] });
      setShowSettingsDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    }
  });

  // Retry failed item mutation
  const retryMutation = useMutation({
    mutationFn: async (itemId) => {
      const { error } = await supabase
        .from('mailchimp_sync_queue')
        .update({
          status: 'pending',
          attempts: 0,
          error_message: null,
          scheduled_for: new Date().toISOString(),
        })
        .eq('id', itemId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Item queued for retry');
      queryClient.invalidateQueries({ queryKey: ['mailchimp-queue'] });
    }
  });

  // Filter contacts by search
  const filteredContacts = contacts.filter(contact =>
    !searchQuery ||
    contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      subscribed: 'bg-green-100 text-green-800',
      unsubscribed: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      cleaned: 'bg-orange-100 text-orange-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'subscribed':
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'unsubscribed':
      case 'cleaned':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
      default:
        return null;
    }
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mail className="w-7 h-7 text-blue-600" />
              Mailchimp Sync
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor email contact synchronization with Mailchimp
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setListId(settings.mailchimp_default_list_id || '');
                setShowSettingsDialog(true);
              }}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button
              onClick={() => batchSyncMutation.mutate()}
              disabled={batchSyncMutation.isPending || stats.queue?.pending === 0}
            >
              {batchSyncMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Play className="w-4 h-4 mr-2" />
              )}
              Process Queue ({stats.queue?.pending || 0})
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.contacts?.subscribed || 0}</p>
                  <p className="text-sm text-gray-600">Subscribed</p>
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
                  <p className="text-2xl font-bold">{stats.queue?.pending || 0}</p>
                  <p className="text-sm text-gray-600">Pending Sync</p>
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
                  <p className="text-2xl font-bold">{stats.contacts?.unsubscribed || 0}</p>
                  <p className="text-sm text-gray-600">Unsubscribed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.contacts?.failed || 0}</p>
                  <p className="text-sm text-gray-600">Failed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sync Queue Section */}
        {(stats.queue?.pending > 0 || stats.queue?.failed > 0) && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Send className="w-5 h-5" />
                Sync Queue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {queueLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : queueItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Queue is empty</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attempts</TableHead>
                        <TableHead>Error</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {queueItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.action}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(item.status)}
                              <Badge className={getStatusBadge(item.status)}>
                                {item.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>{item.attempts}/{item.max_attempts}</TableCell>
                          <TableCell className="max-w-xs truncate text-red-600 text-sm">
                            {item.error_message || '-'}
                          </TableCell>
                          <TableCell>
                            {item.status === 'failed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => retryMutation.mutate(item.id)}
                                disabled={retryMutation.isPending}
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Retry
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
        )}

        {/* Contacts Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Synced Contacts ({stats.contacts?.total || 0})
              </CardTitle>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="subscribed">Subscribed</SelectItem>
                    <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => refetchContacts()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {contactsLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No contacts found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Last Synced</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{contact.source_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(contact.status)}
                            <Badge className={getStatusBadge(contact.status)}>
                              {contact.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap">
                            {contact.tags?.slice(0, 3).map((tag, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags?.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{contact.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {contact.last_synced_at
                            ? new Date(contact.last_synced_at).toLocaleString()
                            : 'Never'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events Section */}
        {recentEvents.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Webhook Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Processed</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Badge variant="outline">{event.event_type}</Badge>
                        </TableCell>
                        <TableCell>{event.email}</TableCell>
                        <TableCell>
                          {event.processed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <Clock className="w-4 h-4 text-yellow-600" />
                          )}
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm">
                          {new Date(event.created_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Dialog */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mailchimp Settings</DialogTitle>
              <DialogDescription>
                Configure your Mailchimp integration settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mailchimp List/Audience ID
                </label>
                <Input
                  value={listId}
                  onChange={(e) => setListId(e.target.value)}
                  placeholder="e.g., abc123def"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find this in Mailchimp: Audience &gt; Settings &gt; Audience name and defaults
                </p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Environment Variables Required:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-1 space-y-1">
                  <li>MAILCHIMP_API_KEY - Your Mailchimp API key</li>
                  <li>MAILCHIMP_SERVER - Server prefix (e.g., us21)</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => saveSettingsMutation.mutate(listId)}
                disabled={saveSettingsMutation.isPending}
              >
                {saveSettingsMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Save Settings
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </HQLayout>
  );
}
