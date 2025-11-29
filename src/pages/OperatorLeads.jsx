import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Home,
  MapPin,
  Clock,
  CheckCircle,
  X,
  Calendar,
  Phone,
  Mail,
  DollarSign,
  MoreVertical,
  Search,
  Filter,
  ArrowRight,
  Star,
  MessageSquare,
  FileText,
  User,
  Building2,
  ChevronDown,
  Plus,
  Loader2,
  Target,
  TrendingUp
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import OperatorLayout from '@/components/operator/OperatorLayout';
import { useAuth } from '@/lib/AuthContext';
import { OperatorLead, OperatorLeadActivity, Operator } from '@/api/supabaseClient';
import QuickAddLeadDialog from '@/components/operator/leads/QuickAddLeadDialog';
import LeadDetailDrawer from '@/components/operator/leads/LeadDetailDrawer';
import LeadPipelineCard from '@/components/operator/leads/LeadPipelineCard';
import CreateQuoteDialog from '@/components/operator/quotes/CreateQuoteDialog';
import SendQuoteDialog from '@/components/operator/quotes/SendQuoteDialog';

const PIPELINE_STAGES = [
  { id: 'new', label: 'New Leads', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { id: 'quoted', label: 'Quoted', color: 'bg-purple-500' },
  { id: 'approved', label: 'Approved', color: 'bg-orange-500' },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-teal-500' },
  { id: 'won', label: 'Won', color: 'bg-green-600' },
];

const LOST_STAGE = { id: 'lost', label: 'Lost', color: 'bg-gray-500' };

export default function OperatorLeads() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // UI State
  const [viewMode, setViewMode] = useState('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');

  // Dialog State
  const [showAddLead, setShowAddLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showLeadDetail, setShowLeadDetail] = useState(false);
  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [quoteForSend, setQuoteForSend] = useState(null);

  // Fetch operator
  const { data: operator } = useQuery({
    queryKey: ['myOperator', user?.id],
    queryFn: async () => {
      const operators = await Operator.filter({ user_id: user?.id });
      return operators[0] || null;
    },
    enabled: !!user?.id
  });

  // Fetch leads
  const { data: leads = [], isLoading: leadsLoading } = useQuery({
    queryKey: ['operator-leads', operator?.id],
    queryFn: () => OperatorLead.filter(
      { operator_id: operator.id },
      { orderBy: '-created_at' }
    ),
    enabled: !!operator?.id
  });

  // Stage change mutation
  const stageChangeMutation = useMutation({
    mutationFn: async ({ leadId, newStage }) => {
      const lead = leads.find(l => l.id === leadId);
      await OperatorLead.update(leadId, { stage: newStage });
      await OperatorLeadActivity.create({
        lead_id: leadId,
        operator_id: operator.id,
        activity_type: 'stage_changed',
        description: `Stage changed from ${lead.stage} to ${newStage}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['operator-leads', operator?.id]);
      toast.success('Lead moved');
    }
  });

  // Filter leads
  let filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm ||
      lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.property_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = filterSource === 'all' || lead.source === filterSource;
    const matchesPriority = filterPriority === 'all' || lead.priority === filterPriority;

    return matchesSearch && matchesSource && matchesPriority;
  });

  // Get leads by stage (excluding lost from main pipeline)
  const getLeadsByStage = (stageId) => filteredLeads.filter(lead => lead.stage === stageId);
  const lostLeads = filteredLeads.filter(lead => lead.stage === 'lost');

  // Calculate stats
  const pipelineValue = filteredLeads
    .filter(l => l.stage !== 'lost')
    .reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const wonValue = filteredLeads
    .filter(l => l.stage === 'won')
    .reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const totalActive = filteredLeads.filter(l => !['won', 'lost'].includes(l.stage)).length;
  const conversionRate = filteredLeads.length > 0
    ? Math.round((filteredLeads.filter(l => l.stage === 'won').length / filteredLeads.length) * 100)
    : 0;

  // Handle actions
  const handleCall = (lead) => {
    window.open(`tel:${lead.contact_phone}`, '_self');
  };

  const handleEmail = (lead) => {
    window.open(`mailto:${lead.contact_email}`, '_blank');
  };

  const handleText = (lead) => {
    window.open(`sms:${lead.contact_phone}`, '_self');
  };

  const handleLeadClick = (lead) => {
    setSelectedLead(lead);
    setShowLeadDetail(true);
  };

  const handleCreateQuote = (lead) => {
    setSelectedLead(lead);
    setShowLeadDetail(false);
    setShowCreateQuote(true);
  };

  const handleQuoteCreated = (quote) => {
    setShowCreateQuote(false);
    setQuoteForSend(quote);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'hot': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'marketplace': return <Building2 className="w-3.5 h-3.5" />;
      case 'referral': return <Star className="w-3.5 h-3.5" />;
      case 'website': return <FileText className="w-3.5 h-3.5" />;
      case 'phone': return <Phone className="w-3.5 h-3.5" />;
      default: return <User className="w-3.5 h-3.5" />;
    }
  };

  if (leadsLoading) {
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
              <Target className="w-6 h-6 text-blue-600" />
              Leads Pipeline
            </h1>
            <p className="text-gray-600">{totalActive} active leads in pipeline</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('pipeline')}
                className={`px-4 py-2 text-sm ${viewMode === 'pipeline' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                Pipeline
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
              >
                List
              </button>
            </div>
            <Button onClick={() => setShowAddLead(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              Add Lead
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <Target className="w-4 h-4" />
              Total Leads
            </div>
            <div className="text-2xl font-bold text-gray-900">{filteredLeads.length}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <DollarSign className="w-4 h-4" />
              Pipeline Value
            </div>
            <div className="text-2xl font-bold text-gray-900">${pipelineValue.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              Won Value
            </div>
            <div className="text-2xl font-bold text-green-600">${wonValue.toLocaleString()}</div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
              <TrendingUp className="w-4 h-4" />
              Conversion Rate
            </div>
            <div className="text-2xl font-bold text-blue-600">{conversionRate}%</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSource} onValueChange={setFilterSource}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Lead Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="hot">Hot</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Empty State */}
        {filteredLeads.length === 0 && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-600 mb-6">
              Start adding leads from phone calls, your website, or referrals
            </p>
            <Button onClick={() => setShowAddLead(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Lead
            </Button>
          </Card>
        )}

        {/* Pipeline View */}
        {viewMode === 'pipeline' && filteredLeads.length > 0 && (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {PIPELINE_STAGES.map(stage => {
                const stageLeads = getLeadsByStage(stage.id);
                const stageValue = stageLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

                return (
                  <div key={stage.id} className="w-80 flex-shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                        <span className="font-semibold text-gray-900">{stage.label}</span>
                        <Badge variant="secondary" className="text-xs">{stageLeads.length}</Badge>
                      </div>
                      <span className="text-xs text-gray-500">${stageValue.toLocaleString()}</span>
                    </div>

                    <div className="space-y-3">
                      {stageLeads.map(lead => (
                        <LeadPipelineCard
                          key={lead.id}
                          lead={lead}
                          onClick={handleLeadClick}
                          onStageChange={(id, newStage) => stageChangeMutation.mutate({ leadId: id, newStage })}
                          onCall={handleCall}
                          onEmail={handleEmail}
                          onText={handleText}
                        />
                      ))}

                      {stageLeads.length === 0 && (
                        <div className="p-6 border-2 border-dashed border-gray-200 rounded-lg text-center">
                          <p className="text-sm text-gray-400">No leads in this stage</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Lost Column */}
              {lostLeads.length > 0 && (
                <div className="w-80 flex-shrink-0 opacity-60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${LOST_STAGE.color}`} />
                      <span className="font-semibold text-gray-900">{LOST_STAGE.label}</span>
                      <Badge variant="secondary" className="text-xs">{lostLeads.length}</Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {lostLeads.map(lead => (
                      <LeadPipelineCard
                        key={lead.id}
                        lead={lead}
                        onClick={handleLeadClick}
                        onStageChange={(id, newStage) => stageChangeMutation.mutate({ leadId: id, newStage })}
                        onCall={handleCall}
                        onEmail={handleEmail}
                        onText={handleText}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && filteredLeads.length > 0 && (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Stage</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Source</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map(lead => {
                    const stage = [...PIPELINE_STAGES, LOST_STAGE].find(s => s.id === lead.stage);
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900 flex items-center gap-2">
                              {lead.contact_name}
                              {lead.priority === 'hot' && <span>🔥</span>}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.contact_email || lead.contact_phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {lead.property_address ? (
                            <>
                              <div className="text-sm text-gray-900">{lead.property_address}</div>
                              <div className="text-sm text-gray-500">
                                {[lead.property_city, lead.property_state].filter(Boolean).join(', ')}
                              </div>
                            </>
                          ) : (
                            <span className="text-sm text-gray-400">No address</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="secondary" className="capitalize">
                            {lead.lead_type?.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge className={`${stage?.color} text-white`}>{stage?.label}</Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {lead.estimated_value ? (
                            <span className="font-medium text-green-600">
                              ${lead.estimated_value.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {getSourceIcon(lead.source)}
                            {lead.source}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeadClick(lead)}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      {/* Dialogs */}
      <QuickAddLeadDialog
        open={showAddLead}
        onOpenChange={setShowAddLead}
        operatorId={operator?.id}
      />

      <LeadDetailDrawer
        lead={selectedLead}
        open={showLeadDetail}
        onOpenChange={setShowLeadDetail}
        operatorId={operator?.id}
        onCreateQuote={handleCreateQuote}
      />

      <CreateQuoteDialog
        open={showCreateQuote}
        onOpenChange={setShowCreateQuote}
        lead={selectedLead}
        operatorId={operator?.id}
        onQuoteCreated={handleQuoteCreated}
        onSendQuote={(quote) => {
          setShowCreateQuote(false);
          setQuoteForSend(quote);
        }}
      />

      <SendQuoteDialog
        open={!!quoteForSend}
        onOpenChange={(open) => !open && setQuoteForSend(null)}
        quote={quoteForSend}
        lead={selectedLead}
        operatorId={operator?.id}
      />
    </OperatorLayout>
  );
}
