import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/supabaseClient';
import HQLayout from '@/components/hq/HQLayout';
import { Card } from '@/components/ui/card';
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
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Shield,
  Building2,
  Calendar,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  UserPlus,
  Download,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function HQUsers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);

  // Fetch users from 'users' table (synced from Clerk)
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['hq-users', roleFilter, statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleFilter !== 'all') {
        query = query.eq('active_role', roleFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Fetch user properties count
  const { data: userPropertyCounts = {} } = useQuery({
    queryKey: ['hq-user-property-counts'],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('user_id');

      const counts = {};
      data?.forEach(prop => {
        counts[prop.user_id] = (counts[prop.user_id] || 0) + 1;
      });
      return counts;
    }
  });

  // Filter users by search
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      !searchQuery ||
      user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Update user tier mutation
  const updateTierMutation = useMutation({
    mutationFn: async ({ userId, tier }) => {
      const { error } = await supabase
        .from('users')
        .update({ tier })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('User tier updated');
      queryClient.invalidateQueries({ queryKey: ['hq-users'] });
    },
    onError: (error) => {
      toast.error('Failed to update tier: ' + error.message);
    }
  });

  // Update user admin status mutation
  const updateAdminMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }) => {
      const { error } = await supabase
        .from('users')
        .update({ is_admin: isAdmin })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Admin status updated');
      queryClient.invalidateQueries({ queryKey: ['hq-users'] });
    },
    onError: (error) => {
      toast.error('Failed to update admin status: ' + error.message);
    }
  });

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-red-100 text-red-700',
      operator: 'bg-purple-100 text-purple-700',
      contractor: 'bg-orange-100 text-orange-700',
      investor: 'bg-blue-100 text-blue-700',
      homeowner: 'bg-green-100 text-green-700',
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Tier', 'Admin', 'Properties', 'Joined'],
      ...filteredUsers.map(u => [
        u.full_name || '',
        u.email || '',
        u.active_role || 'owner',
        u.tier || 'free',
        u.is_admin ? 'Yes' : 'No',
        userPropertyCounts[u.id] || 0,
        formatDate(u.created_at)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Users exported successfully');
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all platform users</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportUsers} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{users.length}</div>
                <div className="text-xs text-gray-600">Total Users</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.active_role === 'owner' || !u.active_role).length}
                </div>
                <div className="text-xs text-gray-600">Homeowners</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.active_role === 'operator').length}
                </div>
                <div className="text-xs text-gray-600">Operators</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.is_admin === true).length}
                </div>
                <div className="text-xs text-gray-600">Admins</div>
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
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="homeowner">Homeowner</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Properties</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Joined</th>
                    <th className="text-right p-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {user.full_name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge className={getRoleBadge(user.role || 'homeowner')}>
                          {user.role || 'homeowner'}
                        </Badge>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{userPropertyCounts[user.id] || 0}</span>
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-700">{formatDate(user.created_at)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedUser(user);
                              setShowUserDetail(true);
                            }}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(`mailto:${user.email}`)}>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'admin' })}>
                              <Shield className="w-4 h-4 mr-2" />
                              Make Admin
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'operator' })}>
                              <Shield className="w-4 h-4 mr-2" />
                              Make Operator
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: user.id, role: 'homeowner' })}>
                              <Building2 className="w-4 h-4 mr-2" />
                              Make Homeowner
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* User Detail Dialog */}
        <Dialog open={showUserDetail} onOpenChange={setShowUserDetail}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>User Details</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-medium text-gray-600">
                      {selectedUser.full_name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedUser.full_name || 'No name'}</h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <Badge className={getRoleBadge(selectedUser.role || 'homeowner')}>
                      {selectedUser.role || 'homeowner'}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Properties</p>
                    <p className="text-lg font-bold text-gray-900">
                      {userPropertyCounts[selectedUser.id] || 0}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Joined</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDate(selectedUser.created_at)}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">User ID</p>
                  <p className="text-sm font-mono text-gray-700 break-all">{selectedUser.id}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => window.open(`mailto:${selectedUser.email}`)}
                  >
                    <Mail className="w-4 h-4" />
                    Email User
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </HQLayout>
  );
}
