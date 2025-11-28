import React, { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import OperatorLayout from '@/components/operator/OperatorLayout';

const PIPELINE_STAGES = [
  { id: 'new', label: 'New Leads', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { id: 'proposal', label: 'Proposal Sent', color: 'bg-purple-500' },
  { id: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
];

export default function OperatorLeads() {
  const [selectedLead, setSelectedLead] = useState(null);
  const [acceptData, setAcceptData] = useState({ startDate: '', message: '' });
  const [viewMode, setViewMode] = useState('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');

  // Mock leads data with pipeline stages
  const [leads, setLeads] = useState([
    {
      id: '1',
      owner_name: 'Jennifer Davis',
      owner_email: 'jennifer.d@email.com',
      owner_phone: '(503) 555-1234',
      property_address: '321 Maple Dr',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      requested_package: 'Premium HomeCare',
      date_received: new Date().toISOString(),
      notes: 'Looking for quarterly inspections and preventive maintenance',
      property_details: { bedrooms: 3, bathrooms: 2, sqft: 1800, year_built: 2005 },
      stage: 'new',
      source: 'marketplace',
      estimated_value: 2400,
      priority: 'high'
    },
    {
      id: '2',
      owner_name: 'Robert Wilson',
      owner_email: 'rob.wilson@email.com',
      owner_phone: '(503) 555-5678',
      property_address: '654 Cedar Ln',
      city: 'Portland',
      state: 'OR',
      zip: '97202',
      requested_package: 'Essential PropertyCare',
      date_received: new Date(Date.now() - 86400000).toISOString(),
      notes: 'Investment property, need regular maintenance',
      property_details: { bedrooms: 2, bathrooms: 1, sqft: 1200, year_built: 1995 },
      stage: 'contacted',
      source: 'referral',
      estimated_value: 1200,
      priority: 'medium'
    },
    {
      id: '3',
      owner_name: 'Amanda Foster',
      owner_email: 'amanda.f@email.com',
      owner_phone: '(503) 555-9012',
      property_address: '890 Oak Ave',
      city: 'Portland',
      state: 'OR',
      zip: '97203',
      requested_package: 'Premium HomeCare',
      date_received: new Date(Date.now() - 172800000).toISOString(),
      notes: 'Recently purchased home, wants comprehensive care',
      property_details: { bedrooms: 4, bathrooms: 3, sqft: 2500, year_built: 2015 },
      stage: 'proposal',
      source: 'website',
      estimated_value: 3600,
      priority: 'high'
    },
    {
      id: '4',
      owner_name: 'Michael Chang',
      owner_email: 'mchang@email.com',
      owner_phone: '(503) 555-3456',
      property_address: '123 Pine St',
      city: 'Portland',
      state: 'OR',
      zip: '97204',
      requested_package: 'Basic Care',
      date_received: new Date(Date.now() - 259200000).toISOString(),
      notes: 'First-time homeowner, budget conscious',
      property_details: { bedrooms: 2, bathrooms: 1, sqft: 950, year_built: 1980 },
      stage: 'negotiation',
      source: 'marketplace',
      estimated_value: 600,
      priority: 'low'
    },
    {
      id: '5',
      owner_name: 'Patricia Lee',
      owner_email: 'plee@email.com',
      owner_phone: '(503) 555-7890',
      property_address: '456 Elm Blvd',
      city: 'Portland',
      state: 'OR',
      zip: '97205',
      requested_package: 'Premium HomeCare',
      date_received: new Date(Date.now() - 432000000).toISOString(),
      notes: 'Luxury home, expects premium service',
      property_details: { bedrooms: 5, bathrooms: 4, sqft: 4000, year_built: 2020 },
      stage: 'won',
      source: 'referral',
      estimated_value: 4800,
      priority: 'high'
    }
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
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
      default: return <User className="w-3.5 h-3.5" />;
    }
  };

  const moveToStage = (leadId, newStage) => {
    setLeads(prev => prev.map(lead =>
      lead.id === leadId ? { ...lead, stage: newStage } : lead
    ));
    toast.success(`Lead moved to ${PIPELINE_STAGES.find(s => s.id === newStage)?.label}`);
  };

  const handleAcceptLead = () => {
    if (!acceptData.startDate) {
      toast.error('Please select a start date');
      return;
    }
    moveToStage(selectedLead.id, 'won');
    toast.success('Lead accepted! Client has been added to your list.');
    setSelectedLead(null);
    setAcceptData({ startDate: '', message: '' });
  };

  const handleDeclineLead = (leadId) => {
    setLeads(prev => prev.filter(lead => lead.id !== leadId));
    toast.info('Lead declined');
    setSelectedLead(null);
  };

  // Filter leads
  let filteredLeads = leads.filter(lead =>
    lead.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.property_address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filterSource !== 'all') {
    filteredLeads = filteredLeads.filter(lead => lead.source === filterSource);
  }

  // Get leads by stage
  const getLeadsByStage = (stageId) => filteredLeads.filter(lead => lead.stage === stageId);

  // Calculate pipeline value
  const pipelineValue = filteredLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
  const wonValue = filteredLeads.filter(l => l.stage === 'won').reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);

  return (
    <OperatorLayout>
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Pipeline</h1>
            <p className="text-gray-600">{filteredLeads.length} active leads in pipeline</p>
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
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Total Leads</div>
            <div className="text-2xl font-bold text-gray-900">{filteredLeads.length}</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Pipeline Value</div>
            <div className="text-2xl font-bold text-gray-900">${pipelineValue.toLocaleString()}/yr</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Won This Month</div>
            <div className="text-2xl font-bold text-green-600">${wonValue.toLocaleString()}/yr</div>
          </Card>
          <Card className="p-4">
            <div className="text-sm text-gray-600 mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold text-blue-600">
              {filteredLeads.length > 0 ? Math.round((filteredLeads.filter(l => l.stage === 'won').length / filteredLeads.length) * 100) : 0}%
            </div>
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
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="website">Website</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Pipeline View */}
        {viewMode === 'pipeline' ? (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max">
              {PIPELINE_STAGES.map(stage => {
                const stageLeads = getLeadsByStage(stage.id);
                const stageValue = stageLeads.reduce((sum, l) => sum + (l.estimated_value || 0), 0);

                return (
                  <div key={stage.id} className="w-72 flex-shrink-0">
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
                        <Card
                          key={lead.id}
                          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedLead(lead)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 truncate">{lead.owner_name}</h4>
                              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{lead.property_address}</span>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {PIPELINE_STAGES.filter(s => s.id !== stage.id).map(s => (
                                  <DropdownMenuItem
                                    key={s.id}
                                    onClick={(e) => { e.stopPropagation(); moveToStage(lead.id, s.id); }}
                                  >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Move to {s.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPriorityColor(lead.priority)} variant="secondary">
                              {lead.priority}
                            </Badge>
                            <Badge variant="outline" className="text-xs gap-1">
                              {getSourceIcon(lead.source)}
                              {lead.source}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{lead.requested_package}</span>
                            <span className="font-medium text-green-600">${lead.estimated_value?.toLocaleString()}/yr</span>
                          </div>

                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                            <Clock className="w-3 h-3" />
                            {new Date(lead.date_received).toLocaleDateString()}
                          </div>
                        </Card>
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
            </div>
          </div>
        ) : (
          /* List View */
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lead</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Property</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Package</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Stage</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Value</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Source</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLeads.map(lead => {
                    const stage = PIPELINE_STAGES.find(s => s.id === lead.stage);
                    return (
                      <tr key={lead.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{lead.owner_name}</div>
                            <div className="text-sm text-gray-500">{lead.owner_email}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900">{lead.property_address}</div>
                          <div className="text-sm text-gray-500">{lead.city}, {lead.state}</div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant="secondary">{lead.requested_package}</Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <Badge className={`${stage?.color} text-white`}>{stage?.label}</Badge>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="font-medium text-green-600">${lead.estimated_value?.toLocaleString()}</span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            {getSourceIcon(lead.source)}
                            {lead.source}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)}>
                              View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Phone className="w-4 h-4 mr-2" />
                                  Call
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {PIPELINE_STAGES.filter(s => s.id !== lead.stage).map(s => (
                                  <DropdownMenuItem
                                    key={s.id}
                                    onClick={() => moveToStage(lead.id, s.id)}
                                  >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Move to {s.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
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

      {/* Lead Detail Modal */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Lead Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {/* Lead Info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-blue-700">
                    {selectedLead.owner_name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{selectedLead.owner_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Mail className="w-3.5 h-3.5" />
                    {selectedLead.owner_email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Phone className="w-3.5 h-3.5" />
                    {selectedLead.owner_phone}
                  </div>
                </div>
              </div>

              {/* Property */}
              <Card className="p-3 bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  {selectedLead.property_address}, {selectedLead.city}, {selectedLead.state} {selectedLead.zip}
                </div>
                {selectedLead.property_details && (
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{selectedLead.property_details.bedrooms} bed</span>
                    <span>{selectedLead.property_details.bathrooms} bath</span>
                    <span>{selectedLead.property_details.sqft} sqft</span>
                    <span>Built {selectedLead.property_details.year_built}</span>
                  </div>
                )}
              </Card>

              {/* Notes */}
              {selectedLead.notes && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700">"{selectedLead.notes}"</p>
                </div>
              )}

              {/* Package & Value */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-600">Requested Package</div>
                  <div className="font-semibold text-gray-900">{selectedLead.requested_package}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Est. Annual Value</div>
                  <div className="text-xl font-bold text-green-600">${selectedLead.estimated_value?.toLocaleString()}</div>
                </div>
              </div>

              {/* Accept Form */}
              {selectedLead.stage !== 'won' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Proposed Start Date
                    </label>
                    <Input
                      type="date"
                      value={acceptData.startDate}
                      onChange={(e) => setAcceptData({ ...acceptData, startDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Welcome Message (Optional)
                    </label>
                    <textarea
                      value={acceptData.message}
                      onChange={(e) => setAcceptData({ ...acceptData, message: e.target.value })}
                      placeholder="Introduce yourself and let the client know what to expect..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
                      rows="3"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAcceptLead} className="flex-1 gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Accept & Convert
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleDeclineLead(selectedLead.id)}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}

              {selectedLead.stage === 'won' && (
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium text-green-800">This lead has been converted to a client!</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </OperatorLayout>
  );
}
