import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Home,
  Calendar,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Filter,
  Grid,
  List,
  UserPlus,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Loader2,
  Send,
  Users
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import OperatorLayout from '@/components/operator/OperatorLayout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/AuthContext';
import { OperatorClient, Operator } from '@/api/supabaseClient';
import { supabase } from '@/api/supabaseClient';
import InviteClientDialog from '@/components/operator/clients/InviteClientDialog';

export default function OperatorClients() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [statusFilter, setStatusFilter] = useState('all');
  const [migrationFilter, setMigrationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [inviteClient, setInviteClient] = useState(null);

  // Fetch operator
  const { data: myOperator } = useQuery({
    queryKey: ['myOperator', user?.id],
    queryFn: async () => {
      const operators = await Operator.filter({ user_id: user?.id });
      return operators[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch clients
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ['operator-clients', myOperator?.id],
    queryFn: () => OperatorClient.filter(
      { operator_id: myOperator.id },
      { orderBy: '-created_at' }
    ),
    enabled: !!myOperator?.id
  });

  // Get migration stats
  const { data: migrationStats } = useQuery({
    queryKey: ['client-migration-stats', myOperator?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc('get_client_migration_stats', {
        p_operator_id: myOperator.id
      });
      return data?.[0] || { total_clients: 0, pending_invites: 0, registered: 0, active_users: 0, migration_rate: 0 };
    },
    enabled: !!myOperator?.id
  });

  // Get migration status badge
  const getMigrationBadge = (status) => {
    switch (status) {
      case 'active_user': return <Badge className="bg-green-100 text-green-700">In App</Badge>;
      case 'registered': return <Badge className="bg-blue-100 text-blue-700">Registered</Badge>;
      case 'invited': return <Badge className="bg-yellow-100 text-yellow-700">Invited</Badge>;
      case 'viewed': return <Badge className="bg-purple-100 text-purple-700">Viewed</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700">Pending</Badge>;
    }
  };

  // Get service tier display name
  const getServiceTierName = (tier) => {
    switch (tier) {
      case 'basic': return 'Basic Care';
      case 'essential': return 'Essential PropertyCare';
      case 'premium': return 'Premium HomeCare';
      case 'elite': return 'Portfolio Care';
      default: return tier || 'On Demand';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'bg-green-100 text-green-700 border-green-200';
    if (score >= 75) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (score >= 60) return 'bg-orange-100 text-orange-700 border-orange-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const getScoreRingColor = (score) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 75) return 'text-yellow-500';
    if (score >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  // Filter clients
  let filteredClients = clients.filter(c =>
    (c.contact_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.property_address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.property_city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply status filter
  if (statusFilter !== 'all') {
    filteredClients = filteredClients.filter(c => c.status === statusFilter);
  }

  // Apply migration filter
  if (migrationFilter !== 'all') {
    filteredClients = filteredClients.filter(c => c.migration_status === migrationFilter);
  }

  // Sort clients
  filteredClients.sort((a, b) => {
    if (sortBy === 'name') return (a.contact_name || '').localeCompare(b.contact_name || '');
    if (sortBy === 'recent') return new Date(b.created_at) - new Date(a.created_at);
    if (sortBy === 'revenue') return (b.total_revenue || 0) - (a.total_revenue || 0);
    return 0;
  });

  // Stats
  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    inApp: clients.filter(c => ['registered', 'active_user'].includes(c.migration_status)).length,
    pendingInvite: clients.filter(c => c.migration_status === 'pending').length
  };

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              All Clients
            </h1>
            <p className="text-gray-600">{stats.total} properties in your portfolio</p>
          </div>
          <Link to={createPageUrl('OperatorAddClient')}>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4" />
              Add New Client
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Clients</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">In App</div>
            <div className="text-2xl font-bold text-blue-600">{stats.inApp}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Pending Invite</div>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingInvite}</div>
          </Card>
        </div>

        {/* Migration Progress */}
        {migrationStats && stats.total > 0 && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm text-blue-700 font-medium">App Adoption Progress</div>
                <div className="text-2xl font-bold text-blue-600">{migrationStats.migration_rate || 0}%</div>
              </div>
              {stats.pendingInvite > 0 && (
                <Badge className="bg-blue-100 text-blue-700">
                  {stats.pendingInvite} pending invites
                </Badge>
              )}
            </div>
            <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all"
                style={{ width: `${migrationStats.migration_rate || 0}%` }}
              />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-blue-600">
              <span>{migrationStats.active_users || 0} Active Users</span>
              <span>{migrationStats.registered || 0} Registered</span>
              <span>{migrationStats.invited || 0} Invited</span>
            </div>
          </Card>
        )}

        {/* Filters & Search */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by name, address, or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                </SelectContent>
              </Select>
              <Select value={migrationFilter} onValueChange={setMigrationFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="App Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending Invite</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="registered">Registered</SelectItem>
                  <SelectItem value="active_user">Active User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name A-Z</SelectItem>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Client List */}
        {viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredClients.map(client => (
              <Card key={client.id} className="p-5 hover:shadow-lg transition-all hover:border-blue-200 h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <Link to={`${createPageUrl('OperatorClientDetail')}?id=${client.id}`} className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-lg truncate hover:text-blue-600">
                      {client.contact_name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{client.property_address}, {client.property_city}</span>
                    </div>
                  </Link>
                  <div className="ml-3">
                    {getMigrationBadge(client.migration_status)}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-4 text-sm">
                  {client.contact_phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{client.contact_phone}</span>
                    </div>
                  )}
                  {client.contact_email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{client.contact_email}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-semibold text-gray-900">{client.total_jobs_completed || 0}</div>
                    <div className="text-xs text-gray-500">Jobs Done</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <div className="text-lg font-semibold text-green-600">
                      ${(client.total_revenue || 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Revenue</div>
                  </div>
                </div>

                {/* Package & Invite */}
                <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
                  <Badge variant="secondary" className="text-xs">
                    {getServiceTierName(client.service_tier)}
                  </Badge>
                  {client.migration_status === 'pending' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setInviteClient(client);
                      }}
                      className="gap-1 text-xs"
                    >
                      <Send className="w-3 h-3" />
                      Invite
                    </Button>
                  )}
                  {client.migration_status === 'invited' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        setInviteClient(client);
                      }}
                      className="gap-1 text-xs text-gray-500"
                    >
                      <Send className="w-3 h-3" />
                      Resend
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Property</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">App</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Package</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map(client => (
                    <tr key={client.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{client.contact_name}</div>
                          <div className="text-sm text-gray-500">{client.contact_email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{client.property_address}</div>
                        <div className="text-sm text-gray-500">{client.property_city}, {client.property_state} {client.property_zip}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge className={client.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {client.status || 'active'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getMigrationBadge(client.migration_status)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="secondary" className="text-xs">
                          {getServiceTierName(client.service_tier)}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-sm font-medium text-green-600">
                          ${(client.total_revenue || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`${createPageUrl('OperatorClientDetail')}?id=${client.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          {['pending', 'invited'].includes(client.migration_status) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setInviteClient(client)}
                              className="gap-1"
                            >
                              <Send className="w-3 h-3" />
                              {client.migration_status === 'pending' ? 'Invite' : 'Resend'}
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Phone className="w-4 h-4 mr-2" />
                                Call Client
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="w-4 h-4 mr-2" />
                                Schedule Service
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {filteredClients.length === 0 && (
          <Card className="p-12 text-center">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); setMigrationFilter('all'); }}>
              Clear Filters
            </Button>
          </Card>
        )}
      </div>

      {/* Invite Dialog */}
      {inviteClient && (
        <InviteClientDialog
          open={!!inviteClient}
          onOpenChange={(open) => !open && setInviteClient(null)}
          client={inviteClient}
          operator={myOperator}
        />
      )}
    </OperatorLayout>
  );
}
