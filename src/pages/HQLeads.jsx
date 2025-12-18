import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from '@/components/ui/dialog';
import {
  Target,
  Search,
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Filter,
  Loader2
} from 'lucide-react';

const LEAD_STAGES = [
  { id: 'new', label: 'New', color: 'bg-blue-100 text-blue-800', icon: Target },
  { id: 'contacted', label: 'Contacted', color: 'bg-purple-100 text-purple-800', icon: Phone },
  { id: 'quoted', label: 'Quoted', color: 'bg-yellow-100 text-yellow-800', icon: DollarSign },
  { id: 'approved', label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-orange-100 text-orange-800', icon: Calendar },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  { id: 'won', label: 'Won', color: 'bg-green-200 text-green-900', icon: TrendingUp },
  { id: 'lost', label: 'Lost', color: 'bg-red-100 text-red-800', icon: XCircle },
];

export default function HQLeads() {
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
  const [selectedLead, setSelectedLead] = useState(null);

  // Fetch leads from operator_leads table
  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: ['hq-leads', stageFilter, sourceFilter],
    queryFn: async () => {
      let query = supabase
        .from('operator_leads')
        .select(`
          *,
          properties:property_id(address, city, state, zip_code),
          operators:operator_id(company_name)
        `)
        .order('created_at', { ascending: false });

      if (stageFilter !== 'all') {
        query = query.eq('stage', stageFilter);
      }
      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate stats
  const stats = {
    total: leads.length,
    new: leads.filter(l => l.stage === 'new').length,
    quoted: leads.filter(l => l.stage === 'quoted').length,
    won: leads.filter(l => l.stage === 'won').length,
    conversionRate: leads.length > 0
      ? Math.round((leads.filter(l => l.stage === 'won').length / leads.length) * 100)
      : 0,
  };

  // Get unique sources
  const sources = [...new Set(leads.map(l => l.source).filter(Boolean))];

  // Filter leads by search
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchQuery ||
      lead.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone?.includes(searchQuery);
    return matchesSearch;
  });

  // Group leads by stage for kanban view
  const leadsByStage = LEAD_STAGES.reduce((acc, stage) => {
    acc[stage.id] = filteredLeads.filter(l => l.stage === stage.id);
    return acc;
  }, {});

  const getStageConfig = (stageId) => {
    return LEAD_STAGES.find(s => s.id === stageId) || LEAD_STAGES[0];
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString();
  };

  return (
    <HQLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-7 h-7 text-orange-600" />
              Lead Pipeline
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage leads across all operators
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Leads</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.new}</p>
                  <p className="text-sm text-gray-600">New</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.quoted}</p>
                  <p className="text-sm text-gray-600">Quoted</p>
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
                  <p className="text-2xl font-bold">{stats.won}</p>
                  <p className="text-sm text-gray-600">Won</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                  <p className="text-sm text-gray-600">Conversion</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {LEAD_STAGES.map(stage => (
                <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              {sources.map(source => (
                <SelectItem key={source} value={source}>{source}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : viewMode === 'kanban' ? (
          /* Kanban View */
          <div className="flex gap-4 overflow-x-auto pb-4">
            {LEAD_STAGES.slice(0, 6).map(stage => (
              <div key={stage.id} className="flex-shrink-0 w-72">
                <div className={`rounded-t-lg p-3 ${stage.color}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{stage.label}</span>
                    <Badge variant="secondary">{leadsByStage[stage.id]?.length || 0}</Badge>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-b-lg p-2 min-h-[300px] space-y-2">
                  {leadsByStage[stage.id]?.map(lead => (
                    <Card
                      key={lead.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <CardContent className="p-3">
                        <p className="font-medium text-sm truncate">{lead.contact_name || 'Unknown'}</p>
                        {lead.email && (
                          <p className="text-xs text-gray-500 truncate">{lead.email}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(lead.created_at)}
                        </div>
                        {lead.source && (
                          <Badge variant="outline" className="mt-2 text-xs">{lead.source}</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {(leadsByStage[stage.id]?.length || 0) === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">No leads</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-medium text-gray-600">Contact</th>
                      <th className="text-left p-3 font-medium text-gray-600">Stage</th>
                      <th className="text-left p-3 font-medium text-gray-600">Source</th>
                      <th className="text-left p-3 font-medium text-gray-600">Property</th>
                      <th className="text-left p-3 font-medium text-gray-600">Operator</th>
                      <th className="text-left p-3 font-medium text-gray-600">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map(lead => {
                      const stageConfig = getStageConfig(lead.stage);
                      return (
                        <tr
                          key={lead.id}
                          className="border-t hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{lead.contact_name || 'Unknown'}</p>
                              <p className="text-sm text-gray-500">{lead.email}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge className={stageConfig.color}>{stageConfig.label}</Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{lead.source || '-'}</Badge>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {lead.properties?.city || '-'}
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {lead.operators?.company_name || '-'}
                          </td>
                          <td className="p-3 text-sm text-gray-500">
                            {formatDate(lead.created_at)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredLeads.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No leads found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lead Detail Dialog */}
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {selectedLead?.contact_name || 'Lead Details'}
              </DialogTitle>
            </DialogHeader>
            {selectedLead && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Badge className={getStageConfig(selectedLead.stage).color}>
                    {getStageConfig(selectedLead.stage).label}
                  </Badge>
                  {selectedLead.source && (
                    <Badge variant="outline">{selectedLead.source}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selectedLead.email || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selectedLead.phone || '-'}
                    </p>
                  </div>
                </div>

                {selectedLead.properties && (
                  <div>
                    <p className="text-sm text-gray-500">Property</p>
                    <p className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedLead.properties.address}, {selectedLead.properties.city}, {selectedLead.properties.state}
                    </p>
                  </div>
                )}

                {selectedLead.operators && (
                  <div>
                    <p className="text-sm text-gray-500">Assigned Operator</p>
                    <p className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      {selectedLead.operators.company_name}
                    </p>
                  </div>
                )}

                {selectedLead.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{selectedLead.notes}</p>
                  </div>
                )}

                <div className="flex justify-between text-sm text-gray-500 pt-4 border-t">
                  <span>Created: {formatDate(selectedLead.created_at)}</span>
                  <span>Updated: {formatDate(selectedLead.updated_at)}</span>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </HQLayout>
  );
}
