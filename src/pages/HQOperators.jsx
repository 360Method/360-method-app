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
  Wrench,
  Search,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  Building2,
  RefreshCw,
  Download,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

export default function HQOperators() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [showOperatorDetail, setShowOperatorDetail] = useState(false);

  // Fetch operators
  const { data: operators = [], isLoading, refetch } = useQuery({
    queryKey: ['hq-operators', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('operators')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter === 'verified') {
        query = query.eq('is_verified', true);
      } else if (statusFilter === 'pending') {
        query = query.eq('is_verified', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Filter operators by search
  const filteredOperators = operators.filter(op => {
    const matchesSearch =
      !searchQuery ||
      op.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.service_areas?.some(area => area.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  // Update operator status
  const updateOperatorMutation = useMutation({
    mutationFn: async ({ operatorId, updates }) => {
      const { error } = await supabase
        .from('operators')
        .update(updates)
        .eq('id', operatorId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Operator updated');
      queryClient.invalidateQueries({ queryKey: ['hq-operators'] });
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    }
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const exportOperators = () => {
    const csv = [
      ['Business Name', 'Contact', 'Email', 'Phone', 'Service Areas', 'Verified', 'Joined'],
      ...filteredOperators.map(op => [
        op.business_name || '',
        op.contact_name || '',
        op.contact_email || '',
        op.contact_phone || '',
        (op.service_areas || []).join('; '),
        op.is_verified ? 'Yes' : 'No',
        formatDate(op.created_at)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `operators-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Operators exported successfully');
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Operator Management</h1>
            <p className="text-gray-600">Manage service providers on the platform</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportOperators} className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{operators.length}</div>
                <div className="text-xs text-gray-600">Total Operators</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {operators.filter(op => op.is_verified).length}
                </div>
                <div className="text-xs text-gray-600">Verified</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {operators.filter(op => !op.is_verified).length}
                </div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {operators.filter(op => op.stripe_account_id).length}
                </div>
                <div className="text-xs text-gray-600">Stripe Connected</div>
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
                placeholder="Search by business name, email, or service area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operators</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending Verification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Operators Grid */}
        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">Loading operators...</p>
          </div>
        ) : filteredOperators.length === 0 ? (
          <Card className="p-12 text-center">
            <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No operators found</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOperators.map((operator) => (
              <Card key={operator.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Wrench className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{operator.business_name || 'Unnamed'}</h3>
                      <p className="text-sm text-gray-600">{operator.contact_name}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedOperator(operator);
                        setShowOperatorDetail(true);
                      }}>
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(`mailto:${operator.contact_email}`)}>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {operator.is_verified ? (
                        <DropdownMenuItem
                          onClick={() => updateOperatorMutation.mutate({
                            operatorId: operator.id,
                            updates: { is_verified: false }
                          })}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Revoke Verification
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => updateOperatorMutation.mutate({
                            operatorId: operator.id,
                            updates: { is_verified: true }
                          })}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Verify Operator
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-3">
                  {operator.contact_email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{operator.contact_email}</span>
                    </div>
                  )}
                  {operator.contact_phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{operator.contact_phone}</span>
                    </div>
                  )}
                  {operator.service_areas?.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{operator.service_areas.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    {operator.is_verified ? (
                      <Badge className="bg-green-100 text-green-700">Verified</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                    )}
                    {operator.stripe_account_id && (
                      <Badge className="bg-blue-100 text-blue-700">Stripe</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {formatDate(operator.created_at)}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Operator Detail Dialog */}
        <Dialog open={showOperatorDetail} onOpenChange={setShowOperatorDetail}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Operator Details</DialogTitle>
            </DialogHeader>
            {selectedOperator && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Wrench className="w-8 h-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedOperator.business_name}</h3>
                    <p className="text-gray-600">{selectedOperator.contact_name}</p>
                    <div className="flex gap-2 mt-1">
                      {selectedOperator.is_verified ? (
                        <Badge className="bg-green-100 text-green-700">Verified</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOperator.contact_email || 'N/A'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-sm font-medium text-gray-900">{selectedOperator.contact_phone || 'N/A'}</p>
                  </div>
                </div>

                {selectedOperator.service_areas?.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Service Areas</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedOperator.service_areas.map((area, i) => (
                        <Badge key={i} variant="outline">{area}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOperator.specialties?.length > 0 && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedOperator.specialties.map((spec, i) => (
                        <Badge key={i} variant="outline">{spec}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Operator ID</p>
                  <p className="text-sm font-mono text-gray-700 break-all">{selectedOperator.id}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={() => window.open(`mailto:${selectedOperator.contact_email}`)}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </Button>
                  {!selectedOperator.is_verified ? (
                    <Button
                      className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                      onClick={() => {
                        updateOperatorMutation.mutate({
                          operatorId: selectedOperator.id,
                          updates: { is_verified: true }
                        });
                        setShowOperatorDetail(false);
                      }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Verify
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="flex-1 gap-2 text-red-600 hover:bg-red-50"
                      onClick={() => {
                        updateOperatorMutation.mutate({
                          operatorId: selectedOperator.id,
                          updates: { is_verified: false }
                        });
                        setShowOperatorDetail(false);
                      }}
                    >
                      <XCircle className="w-4 h-4" />
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </HQLayout>
  );
}
