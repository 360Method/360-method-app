import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorLead, OperatorLeadActivity } from '@/api/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Phone,
  Mail,
  MapPin,
  Wrench,
  ListChecks,
  Heart,
  HelpCircle,
  Zap,
  Clock,
  Calendar,
  Camera,
  User,
  Star,
  FileText,
  Loader2
} from 'lucide-react';

const LEAD_TYPES = [
  { id: 'job', label: 'One-time Job', icon: Wrench, description: 'Repair or project' },
  { id: 'list', label: 'Honey-Do List', icon: ListChecks, description: 'Multiple small items' },
  { id: 'service', label: 'Ongoing Service', icon: Heart, description: 'HomeCare interest' },
  { id: 'nurture', label: 'Just Exploring', icon: HelpCircle, description: 'Not ready yet' },
];

const URGENCY_OPTIONS = [
  { id: 'emergency', label: 'Emergency', icon: Zap, color: 'bg-red-100 text-red-700' },
  { id: 'soon', label: 'Soon', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  { id: 'flexible', label: 'Flexible', icon: Calendar, color: 'bg-green-100 text-green-700' },
];

const SOURCE_OPTIONS = [
  { id: 'phone', label: 'Phone Call', icon: Phone },
  { id: 'referral', label: 'Referral', icon: Star },
  { id: 'website', label: 'Website', icon: FileText },
  { id: 'manual', label: 'Other', icon: User },
];

const PRIORITY_OPTIONS = [
  { id: 'low', label: 'Low', color: 'bg-gray-100 text-gray-700' },
  { id: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
  { id: 'hot', label: 'Hot', color: 'bg-red-100 text-red-700' },
];

export default function QuickAddLeadDialog({ open, onOpenChange, operatorId, onLeadCreated }) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    property_address: '',
    property_city: '',
    property_state: '',
    property_zip: '',
    lead_type: 'job',
    description: '',
    urgency: 'flexible',
    priority: 'medium',
    source: 'phone',
    source_detail: '',
    notes: '',
    estimated_value: ''
  });

  const resetForm = () => {
    setFormData({
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      property_address: '',
      property_city: '',
      property_state: '',
      property_zip: '',
      lead_type: 'job',
      description: '',
      urgency: 'flexible',
      priority: 'medium',
      source: 'phone',
      source_detail: '',
      notes: '',
      estimated_value: ''
    });
  };

  const createLeadMutation = useMutation({
    mutationFn: async (data) => {
      // Create the lead
      const lead = await OperatorLead.create({
        operator_id: operatorId,
        contact_name: data.contact_name,
        contact_phone: data.contact_phone || null,
        contact_email: data.contact_email || null,
        property_address: data.property_address || null,
        property_city: data.property_city || null,
        property_state: data.property_state || null,
        property_zip: data.property_zip || null,
        lead_type: data.lead_type,
        description: data.description || null,
        urgency: data.urgency,
        priority: data.priority,
        source: data.source,
        source_detail: data.source_detail || null,
        notes: data.notes || null,
        estimated_value: data.estimated_value ? parseFloat(data.estimated_value) : null,
        stage: 'new'
      });

      // Log activity
      await OperatorLeadActivity.create({
        lead_id: lead.id,
        operator_id: operatorId,
        activity_type: 'created',
        description: `Lead created from ${data.source}`,
        metadata: { source_detail: data.source_detail }
      });

      return lead;
    },
    onSuccess: (lead) => {
      queryClient.invalidateQueries(['operator-leads', operatorId]);
      toast.success('Lead added to pipeline!');
      resetForm();
      onOpenChange(false);
      if (onLeadCreated) onLeadCreated(lead);
    },
    onError: (error) => {
      console.error('Error creating lead:', error);
      toast.error('Failed to create lead: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.contact_name.trim()) {
      toast.error('Contact name is required');
      return;
    }

    if (!formData.contact_phone && !formData.contact_email) {
      toast.error('Please provide either a phone number or email');
      return;
    }

    createLeadMutation.mutate(formData);
  };

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, contact_phone: formatted });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            Add New Lead
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Contact Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Contact Information</h3>

            <div>
              <Label htmlFor="contact_name">Name *</Label>
              <Input
                id="contact_name"
                placeholder="John Smith"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="contact_phone">Phone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="contact_phone"
                    placeholder="(555) 123-4567"
                    value={formData.contact_phone}
                    onChange={handlePhoneChange}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="contact_email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="john@email.com"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Property Address (Optional) */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Property (Optional)
            </h3>

            <Input
              placeholder="Street address"
              value={formData.property_address}
              onChange={(e) => setFormData({ ...formData, property_address: e.target.value })}
            />

            <div className="grid grid-cols-3 gap-2">
              <Input
                placeholder="City"
                value={formData.property_city}
                onChange={(e) => setFormData({ ...formData, property_city: e.target.value })}
              />
              <Input
                placeholder="State"
                maxLength={2}
                value={formData.property_state}
                onChange={(e) => setFormData({ ...formData, property_state: e.target.value.toUpperCase() })}
              />
              <Input
                placeholder="ZIP"
                maxLength={5}
                value={formData.property_zip}
                onChange={(e) => setFormData({ ...formData, property_zip: e.target.value })}
              />
            </div>
          </div>

          {/* Lead Type */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">What do they need?</h3>
            <div className="grid grid-cols-2 gap-2">
              {LEAD_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.lead_type === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, lead_type: type.id })}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                        {type.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Job Description</Label>
            <textarea
              id="description"
              placeholder="What needs to be done?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
            />
          </div>

          {/* Urgency */}
          <div className="space-y-2">
            <Label>Urgency</Label>
            <div className="flex gap-2">
              {URGENCY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.urgency === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, urgency: option.id })}
                    className={`flex-1 py-2 px-3 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? `border-transparent ${option.color}`
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority & Estimated Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      <Badge className={option.color}>{option.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="estimated_value">Est. Value ($)</Label>
              <Input
                id="estimated_value"
                type="number"
                placeholder="500"
                value={formData.estimated_value}
                onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label>Lead Source</Label>
            <div className="flex gap-2 flex-wrap">
              {SOURCE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.source === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, source: option.id })}
                    className={`py-2 px-3 rounded-lg border-2 flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                );
              })}
            </div>
            {formData.source === 'referral' && (
              <Input
                placeholder="Who referred them?"
                value={formData.source_detail}
                onChange={(e) => setFormData({ ...formData, source_detail: e.target.value })}
                className="mt-2"
              />
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Internal Notes</Label>
            <textarea
              id="notes"
              placeholder="Any additional context (not visible to customer)..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createLeadMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {createLeadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add to Pipeline'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
