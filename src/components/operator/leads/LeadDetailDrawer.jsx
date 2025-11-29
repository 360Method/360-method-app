import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { OperatorLead, OperatorLeadActivity, OperatorQuote } from '@/api/supabaseClient';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Calendar,
  User,
  FileText,
  MessageSquare,
  DollarSign,
  Wrench,
  ListChecks,
  Heart,
  HelpCircle,
  Zap,
  ChevronRight,
  Edit,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  Star,
  Building2,
  Send,
  Plus,
  ArrowRight,
  Loader2
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'new', label: 'New', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { id: 'quoted', label: 'Quoted', color: 'bg-purple-500' },
  { id: 'approved', label: 'Approved', color: 'bg-orange-500' },
  { id: 'scheduled', label: 'Scheduled', color: 'bg-teal-500' },
  { id: 'completed', label: 'Completed', color: 'bg-green-500' },
  { id: 'won', label: 'Won', color: 'bg-green-600' },
  { id: 'lost', label: 'Lost', color: 'bg-gray-500' },
];

const LEAD_TYPE_ICONS = {
  job: Wrench,
  list: ListChecks,
  service: Heart,
  nurture: HelpCircle,
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  hot: 'bg-red-100 text-red-700',
};

const SOURCE_ICONS = {
  website: FileText,
  phone: Phone,
  referral: Star,
  marketplace: Building2,
  manual: User,
};

export default function LeadDetailDrawer({
  lead,
  open,
  onOpenChange,
  operatorId,
  onCreateQuote
}) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showLostReason, setShowLostReason] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [noteText, setNoteText] = useState('');

  // Fetch activities for this lead
  const { data: activities = [] } = useQuery({
    queryKey: ['lead-activities', lead?.id],
    queryFn: () => OperatorLeadActivity.filter(
      { lead_id: lead.id },
      { orderBy: '-created_at' }
    ),
    enabled: !!lead?.id
  });

  // Fetch quotes for this lead
  const { data: quotes = [] } = useQuery({
    queryKey: ['lead-quotes', lead?.id],
    queryFn: () => OperatorQuote.filter(
      { lead_id: lead.id },
      { orderBy: '-created_at' }
    ),
    enabled: !!lead?.id
  });

  // Update lead mutation
  const updateLeadMutation = useMutation({
    mutationFn: async (updates) => {
      const result = await OperatorLead.update(lead.id, updates);

      // Log stage change if applicable
      if (updates.stage && updates.stage !== lead.stage) {
        await OperatorLeadActivity.create({
          lead_id: lead.id,
          operator_id: operatorId,
          activity_type: 'stage_changed',
          description: `Stage changed from ${lead.stage} to ${updates.stage}`,
          metadata: { from: lead.stage, to: updates.stage }
        });
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['operator-leads', operatorId]);
      queryClient.invalidateQueries(['lead-activities', lead.id]);
      toast.success('Lead updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    }
  });

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async (note) => {
      await OperatorLeadActivity.create({
        lead_id: lead.id,
        operator_id: operatorId,
        activity_type: 'note_added',
        description: note
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['lead-activities', lead.id]);
      setNoteText('');
      toast.success('Note added');
    }
  });

  // Log contact mutation
  const logContactMutation = useMutation({
    mutationFn: async (type) => {
      await OperatorLeadActivity.create({
        lead_id: lead.id,
        operator_id: operatorId,
        activity_type: type,
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} contact made`
      });

      // Update last contacted
      await OperatorLead.update(lead.id, {
        last_contacted_at: new Date().toISOString(),
        stage: lead.stage === 'new' ? 'contacted' : lead.stage
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['operator-leads', operatorId]);
      queryClient.invalidateQueries(['lead-activities', lead.id]);
      toast.success('Contact logged');
    }
  });

  // Mark as lost mutation
  const markAsLostMutation = useMutation({
    mutationFn: async (reason) => {
      await OperatorLead.update(lead.id, {
        stage: 'lost',
        lost_reason: reason
      });

      await OperatorLeadActivity.create({
        lead_id: lead.id,
        operator_id: operatorId,
        activity_type: 'lost',
        description: `Lead marked as lost: ${reason}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['operator-leads', operatorId]);
      queryClient.invalidateQueries(['lead-activities', lead.id]);
      setShowLostReason(false);
      toast.success('Lead marked as lost');
    }
  });

  if (!lead) return null;

  const LeadTypeIcon = LEAD_TYPE_ICONS[lead.lead_type] || Wrench;
  const SourceIcon = SOURCE_ICONS[lead.source] || User;
  const currentStage = PIPELINE_STAGES.find(s => s.id === lead.stage);

  const formatDate = (date) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'called': return Phone;
      case 'emailed': return Mail;
      case 'texted': return MessageSquare;
      case 'quoted': return FileText;
      case 'approved': return CheckCircle;
      case 'declined': return XCircle;
      case 'note_added': return Edit;
      case 'stage_changed': return ArrowRight;
      default: return Clock;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-700">
                  {lead.contact_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
              <div>
                <SheetTitle className="text-lg">{lead.contact_name}</SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={currentStage?.color + ' text-white text-xs'}>
                    {currentStage?.label}
                  </Badge>
                  <Badge className={PRIORITY_COLORS[lead.priority]} variant="secondary">
                    {lead.priority}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="quotes">Quotes ({quotes.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Contact Actions */}
            <div className="flex gap-2">
              {lead.contact_phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    window.open(`tel:${lead.contact_phone}`, '_self');
                    logContactMutation.mutate('called');
                  }}
                >
                  <Phone className="w-4 h-4" />
                  Call
                </Button>
              )}
              {lead.contact_email && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    window.open(`mailto:${lead.contact_email}`, '_blank');
                    logContactMutation.mutate('emailed');
                  }}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </Button>
              )}
              {lead.contact_phone && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 gap-2"
                  onClick={() => {
                    window.open(`sms:${lead.contact_phone}`, '_self');
                    logContactMutation.mutate('texted');
                  }}
                >
                  <MessageSquare className="w-4 h-4" />
                  Text
                </Button>
              )}
            </div>

            {/* Contact Info */}
            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Contact Information</h4>
              {lead.contact_phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${lead.contact_phone}`} className="text-blue-600 hover:underline">
                    {lead.contact_phone}
                  </a>
                </div>
              )}
              {lead.contact_email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <a href={`mailto:${lead.contact_email}`} className="text-blue-600 hover:underline">
                    {lead.contact_email}
                  </a>
                </div>
              )}
            </Card>

            {/* Property Info */}
            {lead.property_address && (
              <Card className="p-4 space-y-2">
                <h4 className="font-semibold text-sm text-gray-700">Property</h4>
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p>{lead.property_address}</p>
                    <p className="text-gray-500">
                      {[lead.property_city, lead.property_state, lead.property_zip].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
                {(lead.bedrooms || lead.bathrooms || lead.sqft) && (
                  <div className="flex gap-4 text-sm text-gray-600 pt-2">
                    {lead.bedrooms && <span>{lead.bedrooms} bed</span>}
                    {lead.bathrooms && <span>{lead.bathrooms} bath</span>}
                    {lead.sqft && <span>{lead.sqft.toLocaleString()} sqft</span>}
                    {lead.year_built && <span>Built {lead.year_built}</span>}
                  </div>
                )}
              </Card>
            )}

            {/* Job Details */}
            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Job Details</h4>
              <div className="flex items-center gap-2">
                <LeadTypeIcon className="w-4 h-4 text-gray-400" />
                <span className="text-sm capitalize">{lead.lead_type.replace('_', ' ')}</span>
                <Badge variant="outline" className="text-xs gap-1 ml-auto">
                  <SourceIcon className="w-3 h-3" />
                  {lead.source}
                </Badge>
              </div>
              {lead.description && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {lead.description}
                </p>
              )}
              {lead.urgency && (
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-gray-400" />
                  <span className="capitalize">{lead.urgency}</span>
                </div>
              )}
              {lead.estimated_value && (
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-green-600">
                    ${lead.estimated_value.toLocaleString()}
                  </span>
                </div>
              )}
            </Card>

            {/* Pipeline Stage */}
            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Pipeline Stage</h4>
              <Select
                value={lead.stage}
                onValueChange={(value) => updateLeadMutation.mutate({ stage: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIPELINE_STAGES.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                        {stage.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Follow-up */}
            <Card className="p-4 space-y-3">
              <h4 className="font-semibold text-sm text-gray-700">Follow-up</h4>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Created: {formatDate(lead.created_at)}</span>
              </div>
              {lead.last_contacted_at && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>Last contact: {formatDate(lead.last_contacted_at)}</span>
                </div>
              )}
              <div>
                <label className="text-xs text-gray-500">Next follow-up:</label>
                <Input
                  type="datetime-local"
                  value={lead.next_followup_at ? new Date(lead.next_followup_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => updateLeadMutation.mutate({
                    next_followup_at: e.target.value ? new Date(e.target.value).toISOString() : null
                  })}
                  className="mt-1"
                />
              </div>
            </Card>

            {/* Notes */}
            {lead.notes && (
              <Card className="p-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Internal Notes</h4>
                <p className="text-sm text-gray-600">{lead.notes}</p>
              </Card>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4 border-t">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                onClick={() => onCreateQuote?.(lead)}
              >
                <FileText className="w-4 h-4" />
                Create Quote
              </Button>

              {lead.stage !== 'lost' && lead.stage !== 'won' && (
                <div>
                  {!showLostReason ? (
                    <Button
                      variant="ghost"
                      className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                      onClick={() => setShowLostReason(true)}
                    >
                      <XCircle className="w-4 h-4" />
                      Mark as Lost
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Input
                        placeholder="Reason for losing this lead..."
                        value={lostReason}
                        onChange={(e) => setLostReason(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowLostReason(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => markAsLostMutation.mutate(lostReason)}
                          disabled={!lostReason.trim()}
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4 mt-4">
            {/* Add Note */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
              />
              <Button
                size="sm"
                disabled={!noteText.trim() || addNoteMutation.isPending}
                onClick={() => addNoteMutation.mutate(noteText)}
              >
                {addNoteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Activity Timeline */}
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No activity yet
                </p>
              ) : (
                activities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.activity_type);
                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <ActivityIcon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{formatDate(activity.created_at)}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>

          {/* Quotes Tab */}
          <TabsContent value="quotes" className="space-y-4 mt-4">
            {quotes.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">No quotes yet</p>
                <Button
                  onClick={() => onCreateQuote?.(lead)}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create First Quote
                </Button>
              </div>
            ) : (
              quotes.map((quote) => (
                <Card key={quote.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{quote.title}</h4>
                      <p className="text-xs text-gray-500">
                        Created {formatDate(quote.created_at)}
                      </p>
                    </div>
                    <Badge variant={quote.status === 'approved' ? 'default' : 'secondary'}>
                      {quote.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-green-600">
                      ${quote.total_min?.toLocaleString()}
                      {quote.total_max && ` - $${quote.total_max.toLocaleString()}`}
                    </span>
                    <Button variant="ghost" size="sm" className="gap-1">
                      View <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
