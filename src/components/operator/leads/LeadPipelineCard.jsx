import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  MapPin,
  Clock,
  MoreVertical,
  Phone,
  Mail,
  ArrowRight,
  DollarSign,
  Wrench,
  ListChecks,
  Heart,
  HelpCircle,
  Zap,
  Calendar,
  Star,
  FileText,
  User,
  Building2,
  MessageSquare
} from 'lucide-react';

const LEAD_TYPE_ICONS = {
  job: Wrench,
  list: ListChecks,
  service: Heart,
  nurture: HelpCircle,
};

const URGENCY_BADGES = {
  emergency: { label: 'Emergency', className: 'bg-red-100 text-red-700 border-red-200' },
  soon: { label: 'Soon', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  flexible: { label: 'Flexible', className: 'bg-green-100 text-green-700 border-green-200' },
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-700',
  medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  hot: 'bg-red-100 text-red-700 animate-pulse',
};

const SOURCE_ICONS = {
  website: FileText,
  phone: Phone,
  referral: Star,
  marketplace: Building2,
  manual: User,
};

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

export default function LeadPipelineCard({
  lead,
  onClick,
  onStageChange,
  onCall,
  onEmail,
  onText
}) {
  const LeadTypeIcon = LEAD_TYPE_ICONS[lead.lead_type] || Wrench;
  const SourceIcon = SOURCE_ICONS[lead.source] || User;
  const urgencyBadge = URGENCY_BADGES[lead.urgency];

  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = lead.next_followup_at && new Date(lead.next_followup_at) < new Date();

  return (
    <Card
      className={`p-4 hover:shadow-md transition-all cursor-pointer border-l-4 ${
        lead.priority === 'hot' ? 'border-l-red-500' :
        lead.priority === 'high' ? 'border-l-orange-500' :
        'border-l-transparent'
      } ${isOverdue ? 'ring-2 ring-red-200' : ''}`}
      onClick={() => onClick?.(lead)}
    >
      {/* Header: Name + Actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900 truncate">{lead.contact_name}</h4>
            {lead.priority === 'hot' && (
              <span className="text-xs">🔥</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <LeadTypeIcon className="w-3 h-3" />
            <span className="capitalize">{lead.lead_type.replace('_', ' ')}</span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {lead.contact_phone && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onCall?.(lead); }}>
                <Phone className="w-4 h-4 mr-2" />
                Call
              </DropdownMenuItem>
            )}
            {lead.contact_email && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEmail?.(lead); }}>
                <Mail className="w-4 h-4 mr-2" />
                Email
              </DropdownMenuItem>
            )}
            {lead.contact_phone && (
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onText?.(lead); }}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Text
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {PIPELINE_STAGES.filter(s => s.id !== lead.stage).map(stage => (
              <DropdownMenuItem
                key={stage.id}
                onClick={(e) => { e.stopPropagation(); onStageChange?.(lead.id, stage.id); }}
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                Move to {stage.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Property Address */}
      {lead.property_address && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {lead.property_address}
            {lead.property_city && `, ${lead.property_city}`}
          </span>
        </div>
      )}

      {/* Tags Row */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <Badge className={PRIORITY_COLORS[lead.priority]} variant="secondary">
          {lead.priority}
        </Badge>
        {lead.urgency && lead.urgency !== 'flexible' && (
          <Badge variant="outline" className={urgencyBadge?.className}>
            <Zap className="w-3 h-3 mr-1" />
            {urgencyBadge?.label}
          </Badge>
        )}
        <Badge variant="outline" className="text-xs gap-1">
          <SourceIcon className="w-3 h-3" />
          {lead.source}
        </Badge>
      </div>

      {/* Description Preview */}
      {lead.description && (
        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
          {lead.description}
        </p>
      )}

      {/* Footer: Value + Date */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        {lead.estimated_value ? (
          <span className="flex items-center gap-1 text-sm font-semibold text-green-600">
            <DollarSign className="w-3 h-3" />
            {lead.estimated_value.toLocaleString()}
          </span>
        ) : (
          <span className="text-xs text-gray-400">No estimate</span>
        )}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          {formatDate(lead.created_at)}
        </div>
      </div>

      {/* Overdue Indicator */}
      {isOverdue && (
        <div className="mt-2 pt-2 border-t border-red-200">
          <div className="flex items-center gap-1 text-xs text-red-600">
            <Calendar className="w-3 h-3" />
            <span>Follow-up overdue</span>
          </div>
        </div>
      )}
    </Card>
  );
}
