import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import {
  TicketCheck,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Mail,
  User,
  Calendar,
  MessageSquare,
  RefreshCw,
  Filter,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

export default function HQSupport() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Fetch support tickets (placeholder - would need a support_tickets table)
  const { data: tickets = [], isLoading, refetch } = useQuery({
    queryKey: ['hq-support-tickets', statusFilter, priorityFilter],
    queryFn: async () => {
      // Placeholder data - in production, this would come from a support_tickets table
      return [
        {
          id: '1',
          subject: 'Unable to add property',
          description: 'I tried to add a new property but it keeps showing an error message.',
          user_email: 'john@example.com',
          user_name: 'John Smith',
          status: 'open',
          priority: 'high',
          category: 'bug',
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString(),
          messages: [
            { id: 1, from: 'user', text: 'I tried to add a new property but it keeps showing an error message.', timestamp: new Date(Date.now() - 3600000).toISOString() },
            { id: 2, from: 'support', text: 'Hi John, can you please share a screenshot of the error?', timestamp: new Date(Date.now() - 1800000).toISOString() },
          ]
        },
        {
          id: '2',
          subject: 'How do I invite my property manager?',
          description: 'I want to give my property manager access to view my property.',
          user_email: 'sarah@example.com',
          user_name: 'Sarah Johnson',
          status: 'pending',
          priority: 'medium',
          category: 'question',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          messages: []
        },
        {
          id: '3',
          subject: 'Subscription billing question',
          description: 'When will my next payment be processed?',
          user_email: 'mike@example.com',
          user_name: 'Mike Peterson',
          status: 'resolved',
          priority: 'low',
          category: 'billing',
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          messages: []
        },
        {
          id: '4',
          subject: 'Feature request: Dark mode',
          description: 'Would love to have a dark mode option for the app.',
          user_email: 'lisa@example.com',
          user_name: 'Lisa Chen',
          status: 'open',
          priority: 'low',
          category: 'feature',
          created_at: new Date(Date.now() - 259200000).toISOString(),
          updated_at: new Date(Date.now() - 259200000).toISOString(),
          messages: []
        }
      ];
    }
  });

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      !searchQuery ||
      ticket.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user_email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-blue-100 text-blue-700',
      pending: 'bg-yellow-100 text-yellow-700',
      resolved: 'bg-green-100 text-green-700',
      closed: 'bg-gray-100 text-gray-700'
    };
    return styles[status] || styles.open;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-orange-100 text-orange-700',
      low: 'bg-gray-100 text-gray-700'
    };
    return styles[priority] || styles.low;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      bug: AlertTriangle,
      question: MessageSquare,
      billing: Mail,
      feature: CheckCircle
    };
    return icons[category] || MessageSquare;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    toast.success('Reply sent successfully');
    setReplyText('');
  };

  const updateTicketStatus = (ticketId, newStatus) => {
    toast.success(`Ticket marked as ${newStatus}`);
  };

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    highPriority: tickets.filter(t => t.priority === 'high' && t.status !== 'resolved').length
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Support Tickets</h1>
            <p className="text-gray-600">Manage customer support requests</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TicketCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.open}</div>
                <div className="text-xs text-gray-600">Open</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.resolved}</div>
                <div className="text-xs text-gray-600">Resolved</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.highPriority}</div>
                <div className="text-xs text-gray-600">High Priority</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by subject or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Tickets List */}
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="p-12 text-center">
            <TicketCheck className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No tickets found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTickets.map((ticket) => {
              const CategoryIcon = getCategoryIcon(ticket.category);
              return (
                <Card
                  key={ticket.id}
                  className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setSelectedTicket(ticket);
                    setShowTicketDetail(true);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        ticket.priority === 'high' ? 'bg-red-100' :
                        ticket.priority === 'medium' ? 'bg-orange-100' : 'bg-gray-100'
                      }`}>
                        <CategoryIcon className={`w-5 h-5 ${
                          ticket.priority === 'high' ? 'text-red-600' :
                          ticket.priority === 'medium' ? 'text-orange-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-gray-900 truncate">{ticket.subject}</h3>
                          <Badge className={getStatusBadge(ticket.status)}>{ticket.status}</Badge>
                          <Badge className={getPriorityBadge(ticket.priority)}>{ticket.priority}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">{ticket.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ticket.user_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {ticket.user_email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(ticket.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ticket.messages?.length > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {ticket.messages.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Ticket Detail Dialog */}
        <Dialog open={showTicketDetail} onOpenChange={setShowTicketDetail}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Support Ticket</DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusBadge(selectedTicket.status)}>{selectedTicket.status}</Badge>
                      <Badge className={getPriorityBadge(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                      <Badge variant="outline">{selectedTicket.category}</Badge>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4 text-gray-400" />
                      {selectedTicket.user_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedTicket.user_email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatTimeAgo(selectedTicket.created_at)}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedTicket.description}</p>
                </div>

                {/* Message Thread */}
                {selectedTicket.messages?.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Conversation</h4>
                    {selectedTicket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-lg ${
                          msg.from === 'support' ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-gray-600">
                            {msg.from === 'support' ? 'Support Team' : selectedTicket.user_name}
                          </span>
                          <span className="text-xs text-gray-500">{formatTimeAgo(msg.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-700">{msg.text}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Section */}
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900">Send Reply</h4>
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Resolved
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateTicketStatus(selectedTicket.id, 'pending')}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Mark Pending
                      </Button>
                    </div>
                    <Button onClick={handleSendReply} className="gap-2">
                      <Send className="w-4 h-4" />
                      Send Reply
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </HQLayout>
  );
}
