import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OperatorQuote, OperatorLead, OperatorLeadActivity } from '@/api/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  DollarSign,
  GripVertical,
  User,
  MapPin,
  FileText,
  Calendar,
  Loader2,
  Eye,
  Send,
  ArrowRight
} from 'lucide-react';

export default function CreateQuoteDialog({
  open,
  onOpenChange,
  lead,
  operatorId,
  onQuoteCreated,
  onSendQuote
}) {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    line_items: [{ id: 1, description: '', amount: '', amount_max: '' }],
    notes_to_customer: '',
    internal_notes: '',
    valid_until: '',
    include_tax: false,
    tax_rate: 8.25,
  });

  // Initialize form when lead changes
  useEffect(() => {
    if (lead) {
      setFormData(prev => ({
        ...prev,
        title: lead.description ? `Quote: ${lead.description.substring(0, 50)}...` : 'Service Quote',
        description: lead.description || '',
        line_items: [{ id: 1, description: lead.description || '', amount: lead.estimated_value || '', amount_max: '' }],
        valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
        notes_to_customer: `Hi ${lead.contact_name?.split(' ')[0] || 'there'},\n\nThank you for reaching out! Here's our quote for the work we discussed.\n\nPlease let me know if you have any questions.`,
      }));
    }
  }, [lead]);

  const [nextLineItemId, setNextLineItemId] = useState(2);

  // Calculate totals
  const subtotal_min = formData.line_items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
  const subtotal_max = formData.line_items.some(item => item.amount_max)
    ? formData.line_items.reduce((sum, item) => sum + (parseFloat(item.amount_max) || parseFloat(item.amount) || 0), 0)
    : null;

  const tax_amount = formData.include_tax ? (subtotal_min * formData.tax_rate / 100) : 0;
  const tax_amount_max = formData.include_tax && subtotal_max ? (subtotal_max * formData.tax_rate / 100) : null;

  const total_min = subtotal_min + tax_amount;
  const total_max = subtotal_max ? subtotal_max + (tax_amount_max || 0) : null;

  // Add line item
  const addLineItem = () => {
    setFormData(prev => ({
      ...prev,
      line_items: [...prev.line_items, { id: nextLineItemId, description: '', amount: '', amount_max: '' }]
    }));
    setNextLineItemId(prev => prev + 1);
  };

  // Update line item
  const updateLineItem = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Remove line item
  const removeLineItem = (id) => {
    if (formData.line_items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      line_items: prev.line_items.filter(item => item.id !== id)
    }));
  };

  // Create quote mutation
  const createQuoteMutation = useMutation({
    mutationFn: async (data) => {
      const quote = await OperatorQuote.create({
        operator_id: operatorId,
        lead_id: lead.id,
        title: data.title,
        description: data.description,
        line_items: data.line_items.map(item => ({
          description: item.description,
          amount: parseFloat(item.amount) || 0,
          amount_max: item.amount_max ? parseFloat(item.amount_max) : null
        })),
        subtotal_min: data.subtotal_min,
        subtotal_max: data.subtotal_max,
        tax_rate: data.include_tax ? data.tax_rate / 100 : 0,
        tax_amount: data.tax_amount,
        total_min: data.total_min,
        total_max: data.total_max,
        notes_to_customer: data.notes_to_customer,
        internal_notes: data.internal_notes,
        valid_until: data.valid_until,
        status: 'draft'
      });

      // Log activity
      await OperatorLeadActivity.create({
        lead_id: lead.id,
        operator_id: operatorId,
        activity_type: 'quoted',
        description: `Quote created: ${data.title}`,
        metadata: { quote_id: quote.id, amount: data.total_min }
      });

      return quote;
    },
    onSuccess: (quote) => {
      queryClient.invalidateQueries(['operator-leads', operatorId]);
      queryClient.invalidateQueries(['lead-quotes', lead.id]);
      toast.success('Quote created!');
      if (onQuoteCreated) onQuoteCreated(quote);
    },
    onError: (error) => {
      toast.error('Failed to create quote: ' + error.message);
    }
  });

  const handleSave = (andSend = false) => {
    // Validation
    if (!formData.title.trim()) {
      toast.error('Quote title is required');
      return;
    }

    if (formData.line_items.every(item => !item.description.trim())) {
      toast.error('At least one line item is required');
      return;
    }

    const quoteData = {
      ...formData,
      subtotal_min,
      subtotal_max,
      tax_amount,
      total_min,
      total_max
    };

    createQuoteMutation.mutate(quoteData, {
      onSuccess: (quote) => {
        if (andSend) {
          onSendQuote?.(quote);
        }
        onOpenChange(false);
      }
    });
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600" />
            </div>
            Create Quote
          </DialogTitle>
        </DialogHeader>

        {/* Customer Info Header */}
        <Card className="p-4 bg-gray-50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="font-bold text-blue-700">
                {lead.contact_name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900">{lead.contact_name}</p>
              {lead.property_address && (
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {lead.property_address}, {lead.property_city}
                </p>
              )}
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          {/* Quote Title */}
          <div>
            <Label htmlFor="title">Quote Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Kitchen Faucet Replacement"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="mt-1"
            />
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addLineItem}
                className="text-blue-600 hover:text-blue-700 gap-1"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {formData.line_items.map((item, index) => (
                <Card key={item.id} className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-2 text-gray-300">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Description (e.g., Labor - faucet installation)"
                        value={item.description}
                        onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              type="number"
                              placeholder="Amount"
                              value={item.amount}
                              onChange={(e) => updateLineItem(item.id, 'amount', e.target.value)}
                              className="pl-8"
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">to $</span>
                            <Input
                              type="number"
                              placeholder="Max (optional)"
                              value={item.amount_max}
                              onChange={(e) => updateLineItem(item.id, 'amount_max', e.target.value)}
                              className="pl-12"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeLineItem(item.id)}
                      disabled={formData.line_items.length <= 1}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Tax Toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.include_tax}
                onCheckedChange={(checked) => setFormData({ ...formData, include_tax: checked })}
              />
              <Label>Include Tax</Label>
            </div>
            {formData.include_tax && (
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                  className="w-20 text-right"
                />
                <span className="text-sm text-gray-500">%</span>
              </div>
            )}
          </div>

          {/* Summary */}
          <Card className="p-4 bg-gray-50">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>
                  ${subtotal_min.toLocaleString()}
                  {subtotal_max && ` - $${subtotal_max.toLocaleString()}`}
                </span>
              </div>
              {formData.include_tax && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tax ({formData.tax_rate}%)</span>
                  <span>
                    ${tax_amount.toFixed(2)}
                    {tax_amount_max && ` - $${tax_amount_max.toFixed(2)}`}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-green-600">
                  ${total_min.toLocaleString()}
                  {total_max && ` - $${total_max.toLocaleString()}`}
                </span>
              </div>
            </div>
          </Card>

          {/* Valid Until */}
          <div>
            <Label htmlFor="valid_until">Valid Until</Label>
            <div className="relative mt-1">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="valid_until"
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Notes to Customer */}
          <div>
            <Label htmlFor="notes_to_customer">Message to Customer</Label>
            <textarea
              id="notes_to_customer"
              placeholder="Include a friendly message..."
              value={formData.notes_to_customer}
              onChange={(e) => setFormData({ ...formData, notes_to_customer: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>

          {/* Internal Notes */}
          <div>
            <Label htmlFor="internal_notes">Internal Notes (not visible to customer)</Label>
            <textarea
              id="internal_notes"
              placeholder="Notes for your reference..."
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={createQuoteMutation.isPending}
              className="flex-1 gap-2"
            >
              {createQuoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
              Save Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSave(true)}
              disabled={createQuoteMutation.isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700 gap-2"
            >
              {createQuoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Save & Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
